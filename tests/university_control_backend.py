import json, os, sys, tempfile
from pathlib import Path
from datetime import datetime,timezone,timedelta
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
with tempfile.TemporaryDirectory() as tmp:
 os.environ["CHEM_DATA_DIR"]=tmp
 import server
 from university_control_backend import handle_control, BANK
 server.init_database()
 with server.db() as c:
  for uid in ("learner","other"):
   c.execute("insert into users(id,display_name,email,role,password_hash,created_at) values(?,?,?,'university_student','x',?)",(uid,uid,uid+"@example.test",server.now()))
 class H:
  control_db=staticmethod(server.db);control_error=server.ApiError
  progress_row=server.SpaHandler.progress_row
  uid="learner";data={}
  def user(self,required): return {"id":self.uid,"role":"university_student"}
  def read_json(self): return self.data
  def json_response(self,result): return result
  def require_content(self,ident): pass
 h=H()
 def call(action,data=None):
  h.data=data or {};return handle_control(h,"GET" if action=="attempts" else "POST","/api/university-control/"+action)
 a=call("start");assert len(a["answers"])==30
 assert call("start",{"restart":True})["id"]==a["id"]
 answers=[q["correct_index"] for q in BANK]
 r=call("save",{"attempt":a["id"],"answers":answers,"revision":0,"finish":True})
 assert r["attempt"]["score"]==30 and r["progress"]["quiz_answers"]==answers
 assert call("save",{"attempt":a["id"],"answers":[],"revision":0,"finish":True})["progress"]["attempt_count"]==1
 b=call("start",{"restart":True})
 with server.db() as c: c.execute("update university_control_attempts set deadline=? where id=?",((datetime.now(timezone.utc)-timedelta(seconds=1)).isoformat(),b["id"]))
 assert call("save",{"attempt":b["id"],"answers":answers,"revision":0,"finish":True})["attempt"]["score"]==0
 assert len(call("attempts"))==2
 h.uid="other";assert call("attempts")==[]
 try: call("save",{"attempt":a["id"],"answers":answers,"revision":0,"finish":True});raise AssertionError("owner isolation failed")
 except server.ApiError as e: assert e.status==403
 print("Local timed control, progress, expiry, idempotence and owner isolation passed")
