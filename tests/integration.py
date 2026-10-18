import sys
import json
import os
import subprocess
import tempfile
import time
import unittest
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
PORT = 4174
BASE = f"http://127.0.0.1:{PORT}"

def request(method, path, data=None, token=None, headers=None):
    payload = None
    request_headers = dict(headers or {})
    if isinstance(data, (dict, list)):
        payload = json.dumps(data).encode()
        request_headers["Content-Type"] = "application/json"
    elif data is not None:
        payload = data
    if token:
        request_headers["Authorization"] = f"Bearer {token}"
    response = urlopen(Request(BASE + path, data=payload, headers=request_headers, method=method))
    body = response.read()
    return json.loads(body) if body else None

class PlatformIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        env = {**os.environ, "INITIAL_ADMIN_PASSWORD":"Admin123!", "CHEM_DATA_DIR": cls.temp.name, "PORT": str(PORT)}
        cls.server = subprocess.Popen([sys.executable, "server.py"], cwd=ROOT, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(40):
            try:
                urlopen(BASE + "/api/content", timeout=0.2)
                break
            except Exception:
                time.sleep(0.1)
        else:
            raise RuntimeError("Test server did not start")

    @classmethod
    def tearDownClass(cls):
        cls.server.terminate()
        cls.server.wait(timeout=5)
        cls.temp.cleanup()

    def test_registration_categories_and_admin_only_reporting(self):
        from urllib.error import HTTPError
        admin = request('POST','/api/login',{'email':'admin@chem.local','password':'Admin123!'})['token']
        ids=[]
        for category in ('school_student','university_student','teacher'):
            result=request('POST','/api/register',{'displayName':category,'email':category+'@example.test','password':'Student123!','role':'student','participantType':category})
            ids.append(result['user']['id'])
            self.assertEqual(result['user']['participant_type'],category)
            self.assertNotEqual(result['user']['role'],'admin')
            with self.assertRaises(HTTPError) as denied: request('GET','/api/users',token=result['token'])
            self.assertEqual(denied.exception.code,403)
        members=[u for u in request('GET','/api/users',token=admin) if u['id'] in ids]
        self.assertEqual({u['participant_type'] for u in members},{'school_student','university_student','teacher'})
        analytics=request('GET','/api/analytics',token=admin)
        self.assertEqual(len([u for u in analytics['users'] if u['id'] in ids]),3)
        request('PATCH','/api/users/'+ids[0],{'participant_type':'teacher'},admin)
        self.assertEqual(next(u for u in request('GET','/api/users',token=admin) if u['id']==ids[0])['participant_type'],'teacher')
        with self.assertRaises(HTTPError) as invalid: request('POST','/api/register',{'displayName':'Bad','email':'badcat@example.test','password':'Student123!','role':'student','participantType':'admin'})
        self.assertEqual(invalid.exception.code,400)

    def test_bond_practice_is_separate_idempotent_and_server_graded(self):
        from urllib.error import HTTPError
        import uuid
        admin = request("POST", "/api/login", {"email":"admin@chem.local", "password":"Admin123!"})["token"]
        previous = next(row for row in request("GET", "/api/content?admin=1",token=admin) if row["path"]=="/sabaktastyk-kopiri/himiyalyk-bailanys")
        item = request("PATCH", f"/api/content/{previous['id']}", {
            "parent_id":None, "area":"bridge", "item_type":"lesson", "title":"Bond practice test",
            "path":"/sabaktastyk-kopiri/himiyalyk-bailanys", "body":"<p>Teacher content</p>",
            "quiz_data":{"questions":[{"question":"Teacher quiz", "options":["A","B"], "correct_index":1}]},
            "sort_order":100, "is_published":True,
        }, admin)
        learner = request("POST", "/api/register", {"displayName":"Practice", "email":"practice@test.local", "password":"Student123!", "role":"student"})["token"]
        original = request("POST", "/api/progress", {"item_id":item["id"], "progress":63, "score":1, "max_score":1, "quiz_answers":[1]}, learner)
        attempt = {"item_id":item["id"], "attempt_id":str(uuid.uuid4()), "answers":[1,0,2,1,2,0,1,2], "score":999}
        result = request("POST", "/api/bond-practice", attempt, learner)
        self.assertEqual(result["bond_practice"]["score"], 8)
        self.assertEqual(result["bond_practice"]["attempt_count"], 1)
        repeated = request("POST", "/api/bond-practice", attempt, learner)
        self.assertEqual(repeated["bond_practice"]["attempt_count"], 1)
        attempt.update(attempt_id=str(uuid.uuid4()), answers=[2,1,0,2,0,1,2,0])
        result = request("POST", "/api/bond-practice", attempt, learner)
        self.assertEqual(result["bond_practice"]["score"], 0)
        self.assertEqual(result["bond_practice"]["best_score"], 8)
        self.assertEqual(result["bond_practice"]["attempt_count"], 2)
        for key in ("score", "max_score", "quiz_answers", "attempt_count", "progress", "completed"):
            self.assertEqual(result[key], original[key], key)
        result = request("POST", "/api/progress", {"item_id":item["id"], "progress":70}, learner)
        self.assertEqual(result["bond_practice"]["score"], 0)
        self.assertEqual(next(p for p in request("GET","/api/progress",token=learner) if p["item_id"]==item["id"])["bond_practice"]["best_score"],8)
        # New modes preserve teacher scores and existing practice; score claims are ignored.
        for mode, answers, expected in [('theory',[],0),('context',[1,1,2,6],4),('simulation',[180,104.5,8,4],4)]:
            activity={'item_id':item['id'],'mode':mode,'attempt_id':str(uuid.uuid4()),'answers':answers,'score':999}
            saved=request('POST','/api/bridge-activity',activity,learner)
            self.assertEqual(saved['bridge_learning'][mode]['score'],expected)
            self.assertEqual(request('POST','/api/bridge-activity',activity,learner)['bridge_learning'][mode]['attempt_count'],1)
            self.assertEqual(saved['bond_practice']['best_score'],8)
            self.assertEqual(saved['quiz_answers'],original['quiz_answers'])
        activity.update(mode='context',answers=[0,0,0,0],attempt_id=str(uuid.uuid4()))
        saved=request('POST','/api/bridge-activity',activity,learner)
        self.assertEqual(saved['bridge_learning']['context']['score'],0)
        self.assertEqual(saved['bridge_learning']['context']['best_score'],4)
        self.assertEqual(saved['bridge_learning']['context']['attempt_count'],2)
        report=request('GET','/api/analytics',token=admin)
        self.assertEqual(next(r for r in report['details'] if r['user_id']==saved['user_id'] and r['item_id']==item['id'])['bridge_learning']['context']['score'],0)
        for patch in ({'answers':[True]*4},{'answers':[float('inf')]*4},{'mode':'admin'},{'answers':[]}):
            with self.assertRaises(HTTPError) as denied: request('POST','/api/bridge-activity',{**activity,**patch},learner)
            self.assertEqual(denied.exception.code,400)
        with self.assertRaises(HTTPError) as denied: request('POST','/api/bridge-activity',activity,admin)
        self.assertEqual(denied.exception.code,403)
        with self.assertRaises(HTTPError) as denied: request('POST','/api/bridge-activity',activity)
        self.assertEqual(denied.exception.code,401)

        for answers in ([], [True]*8, [1.5]*8, [3]*8, ["1"]*8):
            with self.assertRaises(HTTPError) as error:
                request("POST","/api/bond-practice",{**attempt,"answers":answers},learner)
            self.assertEqual(error.exception.code,400)
        with self.assertRaises(HTTPError) as error:
            request("POST","/api/bond-practice",attempt,admin)
        self.assertEqual(error.exception.code,403)
        # V2 uses bonding models, preserves v1 scores, and rejects stale-client downgrades.
        modern={"item_id":item["id"],"attempt_id":str(uuid.uuid4()),"answers":[1,0,2,1,2,0,1,2]}
        upgraded=request("POST","/api/bond-practice-v2",modern,learner)
        self.assertEqual(upgraded["bond_practice"]["version"],2)
        self.assertEqual(upgraded["bond_practice"]["attempt_count"],1)
        self.assertEqual(upgraded["bridge_learning"]["test_v1"]["best_score"],8)
        self.assertEqual(request("POST","/api/bond-practice-v2",modern,learner)["bond_practice"]["attempt_count"],1)
        with self.assertRaises(HTTPError) as stale: request("POST","/api/bond-practice",{**modern,"attempt_id":str(uuid.uuid4())},learner)
        self.assertEqual(stale.exception.code,409)
        modern.update(mode="context",answers=[1,1,3,2],attempt_id=str(uuid.uuid4()))
        upgraded=request("POST","/api/bridge-activity-v2",modern,learner)
        self.assertEqual(upgraded["bridge_learning"]["context"]["version"],2)
        self.assertEqual(upgraded["bridge_learning"]["context"]["score"],4)
        self.assertEqual(upgraded["bridge_learning"]["context"]["attempt_count"],1)
        self.assertEqual(upgraded["bridge_learning"]["context_v1"]["best_score"],4)
        with self.assertRaises(HTTPError) as stale: request("POST","/api/bridge-activity",{**modern,"attempt_id":str(uuid.uuid4())},learner)
        self.assertEqual(stale.exception.code,409)
        self.assertEqual(request("GET","/api/progress",token=learner)[-1]["bond_practice"]["version"],2)
        for endpoint in ("/api/bridge-activity-v2","/api/bond-practice-v2"):
            with self.assertRaises(HTTPError) as denied: request("POST",endpoint,modern,admin)
            self.assertEqual(denied.exception.code,403)
        # Orbital lab archives old simulation, grades on the server, and rejects old saves.
        lab={"item_id":item["id"],"mode":"simulation","attempt_id":str(uuid.uuid4()),"answers":[1,74,4,109.5],"score":999}
        upgraded=request("POST","/api/bridge-activity-v3",lab,learner)
        self.assertEqual(upgraded["bridge_learning"]["simulation"]["version"],2)
        self.assertEqual(upgraded["bridge_learning"]["simulation"]["score"],4)
        self.assertEqual(upgraded["bridge_learning"]["simulation_v1"]["answers"],[180,104.5,8,4])
        self.assertEqual(request("POST","/api/bridge-activity-v3",lab,learner)["bridge_learning"]["simulation"]["attempt_count"],1)
        lab.update(answers=[0,160,2,180],attempt_id=str(uuid.uuid4()))
        wrong=request("POST","/api/bridge-activity-v3",lab,learner)
        self.assertEqual(wrong["bridge_learning"]["simulation"]["score"],0)
        self.assertEqual(wrong["bridge_learning"]["simulation"]["best_score"],4)
        for endpoint in ("/api/bridge-activity","/api/bridge-activity-v2"):
            with self.assertRaises(HTTPError) as stale: request("POST",endpoint,{**lab,"answers":[180,104.5,8,4]},learner)
            self.assertEqual(stale.exception.code,409)
        with self.assertRaises(HTTPError) as denied: request("POST","/api/bridge-activity-v3",lab,admin)
        self.assertEqual(denied.exception.code,403)
        with self.assertRaises(HTTPError) as denied: request("POST","/api/bridge-activity-v3",{**lab,"answers":[1,74,4,True]},learner)
        self.assertEqual(denied.exception.code,400)

        # Ordinary teacher progress updates must preserve both new assessments.
        preserved=request("POST","/api/progress",{"item_id":item["id"],"progress":80},learner)
        self.assertEqual(preserved["bridge_learning"]["context"]["score"],4)
        self.assertEqual(preserved["bond_practice"]["version"],2)
        request("PATCH",f"/api/content/{item['id']}",{**item,"is_published":False},admin)
        with self.assertRaises(HTTPError) as error:
            request("POST","/api/bond-practice",attempt,learner)
        self.assertEqual(error.exception.code,403)
        request("PATCH",f"/api/content/{item['id']}",previous,admin)

    def test_auth_content_upload_progress_and_analytics(self):
        admin = request("POST", "/api/login", {"email":"admin@chem.local", "password":"Admin123!", "role":"admin"})
        admin_token = admin["token"]
        self.assertEqual(request("GET", "/api/settings")["font_family"], "Inter")
        theme = request("PATCH", "/api/settings", {
            "site_title":"Химия платформасы", "font_family":"Manrope", "heading_font":"Georgia", "base_size":18, "heading_scale":112,
            "background":"#08101f", "surface":"#121c30", "text":"#f8fafc", "muted":"#94a3b8",
            "school":"#11aa88", "university":"#5577ff", "bridge":"#ffaa22",
            "diagnostic":"#ee6699", "card_radius":24, "button_radius":18, "content_width":1320,
            "page_gutter":36, "density":"spacious", "header_style":"solid", "hero_style":"gradient",
            "card_style":"solid", "home_layout":"balanced", "background_style":"grid", "shadow_style":"strong",
            "visual_effects":False,
        }, admin_token)
        self.assertEqual(theme["font_family"], "Manrope")
        self.assertEqual(theme["heading_font"], "Georgia")
        self.assertEqual(theme["home_layout"], "balanced")
        self.assertEqual(theme["content_width"], 1320)
        self.assertEqual(theme["card_radius"], 24)
        self.assertFalse(theme["visual_effects"])
        item = request("POST", "/api/content", {
            "parent_id":None, "area":"diagnostic", "item_type":"lesson", "content_mode":"resources", "title":"Қорытынды диагностика",
            "path":"/integration-test", "body":"<script>alert(1)</script><h2 style=\"text-align:center;background:red\"><strong>Мәтін</strong></h2>", "video_url":"https://example.test/video",
            "quiz_data":{"questions":[
                {"question":"Тест 1", "options":["1","2","3","4"], "correct_index":0},
                {"question":"Тест 2", "options":["A","B","C","D"], "correct_index":2},
            ]},
            "sort_order":99, "is_published":True,
        }, admin_token)
        self.assertNotIn("script", item["body"])
        self.assertNotIn("background", item["body"])
        self.assertIn("<strong>Мәтін</strong>", item["body"])
        self.assertEqual(len(item["quiz_data"]["questions"]), 2)
        self.assertEqual(item["item_type"], "lesson")
        self.assertEqual(item["content_mode"], "resources")
        siblings = [entry for entry in request("GET", "/api/content?admin=1", token=admin_token) if entry["area"] == "diagnostic" and entry["parent_id"] is None]
        reordered = [entry["id"] for entry in reversed(siblings)]
        request("PATCH", "/api/content/reorder", {"ids":reordered}, admin_token)
        saved_order = [entry["id"] for entry in request("GET", "/api/content?admin=1", token=admin_token) if entry["area"] == "diagnostic" and entry["parent_id"] is None]
        self.assertEqual(saved_order, reordered)
        resource = request("POST", "/api/resources", b"test-file", admin_token, {
            "X-Item-Id":item["id"], "X-Filename":"syllabus.pdf", "Content-Type":"application/pdf",
        })
        word = request("POST", "/api/resources", b"doc-file", admin_token, {
            "X-Item-Id":item["id"], "X-Filename":"material.docx", "Content-Type":"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        })
        slides = request("POST", "/api/resources", b"ppt-file", admin_token, {
            "X-Item-Id":item["id"], "X-Filename":"slides.pptx", "Content-Type":"application/vnd.openxmlformats-officedocument.presentationml.presentation",
        })
        resources = request("GET", f"/api/resources?item_id={item['id']}")
        self.assertEqual({entry["filename"] for entry in resources}, {"syllabus.pdf", "material.docx", "slides.pptx"})
        download = urlopen(BASE + f"/api/files/{resource['id']}?download=1")
        self.assertTrue(download.headers["Content-Disposition"].startswith("attachment"))
        download.close()

        student = request("POST", "/api/register", {"displayName":"Оқушы", "email":"student@test.local", "password":"Student123!", "role":"student"})
        progress = request("POST", "/api/progress", {"item_id":item["id"], "progress":80, "score":2, "max_score":2, "quiz_answers":[0,2], "view":True}, student["token"])
        self.assertEqual(progress["progress"], 80)
        self.assertEqual(progress["score"], 2)
        self.assertEqual(progress["quiz_answers"], [0,2])
        self.assertEqual(progress["attempt_count"], 1)
        self.assertIsNotNone(progress["tested_at"])
        second_attempt = request("POST", "/api/progress", {"item_id":item["id"], "score":1, "max_score":2, "quiz_answers":[1,2]}, student["token"])
        self.assertEqual(second_attempt["attempt_count"], 2)
        self.assertEqual(second_attempt["quiz_answers"], [1,2])

        university = request("POST", "/api/register", {"displayName":"Студент", "email":"university@test.local", "password":"Student123!", "role":"university_student"})
        self.assertEqual(university["user"]["role"], "university_student")
        analytics = request("GET", "/api/analytics", token=admin_token)
        self.assertEqual(len(analytics["users"]), 2)
        self.assertEqual(analytics["users"][1]["average_progress"], 80)
        student_detail = next(row for row in analytics["details"] if row["user_id"] == student["user"]["id"])
        self.assertEqual(student_detail["attempt_count"], 2)
        self.assertEqual(student_detail["quiz_answers"], [1,2])

        request("DELETE", f"/api/resources/{resource['id']}", token=admin_token)
        request("DELETE", f"/api/resources/{word['id']}", token=admin_token)
        request("DELETE", f"/api/resources/{slides['id']}", token=admin_token)
        request("DELETE", f"/api/content/{item['id']}", token=admin_token)

if __name__ == "__main__":
    unittest.main()

