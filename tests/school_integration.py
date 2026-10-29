import sys,json,os,subprocess,tempfile,time,unittest,uuid
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.error import HTTPError
ROOT=Path(__file__).resolve().parents[1]
BASE='http://127.0.0.1:4188'
def req(method,path,data=None,token=None):
    headers={'Content-Type':'application/json'}
    if token: headers['Authorization']='Bearer '+token
    response=urlopen(Request(BASE+path,data=json.dumps(data).encode() if data is not None else None,headers=headers,method=method))
    return json.loads(response.read())
class SchoolIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp=tempfile.TemporaryDirectory()
        cls.server=subprocess.Popen([sys.executable,'server.py'],cwd=ROOT,env={**os.environ,'CHEM_DATA_DIR':cls.temp.name,'PORT':'4188','INITIAL_ADMIN_PASSWORD':'Admin123!'},stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        for _ in range(50):
            try: req('GET','/api/content');break
            except Exception:time.sleep(.1)
        else:raise RuntimeError('School test server did not start')
        cls.admin=req('POST','/api/login',{'email':'admin@chem.local','password':'Admin123!'})['token']
        cls.users=[req('POST','/api/register',{'displayName':'School QA','email':str(i)+'@school.test','password':'Test12345!','role':'student','participantType':'school_student'}) for i in range(2)]
        cls.token=cls.users[0]['token']
        cls.grade=next(i['id'] for i in req('GET','/api/content',token=cls.token) if i['path']=='/mektep/teoriya/8-synyp')
    @classmethod
    def tearDownClass(cls):
        cls.server.terminate();cls.server.wait(timeout=5);cls.temp.cleanup()
    def submit(self,mode,answers,attempt=None,token=None,**extra):
        return req('POST','/api/school-activity',{'item_id':self.grade,'slug':'bonding','mode':mode,'answers':answers,'attempt_id':attempt or str(uuid.uuid4()),**extra},token=token or self.token)
    def test_volume_visuals_are_served_as_javascript(self):
        response=urlopen(BASE+'/school-visuals.js')
        self.assertEqual(response.status,200)
        self.assertIn('javascript',response.headers.get('Content-Type',''))
        source=response.read().decode('utf-8')
        self.assertIn('export function renderSchoolVisual',source)
        self.assertNotIn('<!doctype html>',source.lower())
    def test_grading_best_score_receipt_replay_and_ownership(self):
        aid=str(uuid.uuid4())
        row=self.submit('lab',[2,109.5],aid,score=999)
        s=row['school_learning']['bonding']['lab'];self.assertEqual(s['score'],2);self.assertEqual(s['attempt_count'],1)
        self.submit('lab',[0,0])
        latest=self.submit('lab',[2,109.5],aid)['school_learning']['bonding']['lab']
        self.assertEqual(latest['attempt_count'],2);self.assertEqual(latest['score'],0);self.assertEqual(latest['best_score'],2)
        with self.assertRaises(HTTPError):self.submit('lab',[0,1],aid)
        others=req('GET','/api/progress',token=self.users[1]['token']);self.assertFalse(any(r.get('school_learning') for r in others))
        with self.assertRaises(HTTPError):self.submit('lab',[2,109.5],token=self.admin)
        with self.assertRaises(HTTPError):self.submit('lab',[2,109.5],item_id='grade-7')
    def test_open_answers_teacher_review_and_stale_attempt(self):
        aid=str(uuid.uuid4());row=self.submit('critical',['Ғылыми дерек пен себеп-салдарға сүйенген негізді жауап.'],aid)
        self.assertTrue(row['school_learning']['bonding']['critical']['review_pending'])
        payload={'user_id':self.users[0]['user']['id'],'item_id':self.grade,'slug':'bonding','mode':'critical','attempt_id':aid,'score':3,'comment':'Дәлел мен ғылыми түсіндіру сәйкес келеді.'}
        with self.assertRaises(HTTPError):req('POST','/api/school-review',payload,token=self.users[1]['token'])
        reviewed=req('POST','/api/school-review',payload,token=self.admin)['school_learning']['bonding']['critical']
        self.assertFalse(reviewed['review_pending']);self.assertEqual(reviewed['review']['score'],3)
        self.submit('critical',['Жаңа талпыныста дәлел мен қосымша бақылау ұсынылған.'])
        with self.assertRaises(HTTPError) as err:req('POST','/api/school-review',payload,token=self.admin)
        self.assertEqual(err.exception.code,409)
    def test_reject_invalid_answers_and_preserve_old_progress(self):
        for answers in ([],[True,109.5],[9,109.5],[2,float('nan')],[2,'109.5']):
            with self.assertRaises(HTTPError):self.submit('lab',answers)
        with self.assertRaises(HTTPError):self.submit('critical',['Қысқа'])
        self.submit('understand',[])
        req('POST','/api/progress',{'item_id':self.grade,'view':True,'school_learning':{'forged':{'score':999}}},token=self.token)
        row=next(r for r in req('GET','/api/progress',token=self.token) if r['item_id']==self.grade)
        self.assertNotIn('forged',row['school_learning']);self.assertIn('understand',row['school_learning']['bonding'])
if __name__=='__main__':unittest.main()
