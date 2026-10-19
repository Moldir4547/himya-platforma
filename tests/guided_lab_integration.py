import unittest,json,sys,sqlite3
from pathlib import Path
from urllib.error import HTTPError
from school_integration import SchoolIntegration,req
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from guided_lab_validation import SPECS
class GuidedIntegration(SchoolIntegration):
 def test_journal_draft_finish_history_privacy_and_stale_revision(self):
  item=next(i['id'] for i in req('GET','/api/content',token=self.token) if i['path']=='/mektep/teoriya/7-synyp')
  lab=SPECS['hydrogen']; r=dict(index=0,attempt=1,elapsedMs=12345,notes=['']*len(lab['steps']),tools=[],conclusion='',finished=False)
  def save(r,rev,token=None,**extra):return req('POST','/api/guided-lab',(dict(item_id=item,lab_id='hydrogen',record=r,revision=rev)|extra),token=token or self.token)
  row=save(r,0);self.assertEqual(row['school_learning']['_guided_labs']['hydrogen']['revision'],1)
  with self.assertRaises(HTTPError) as err:save(r,0)
  self.assertEqual(err.exception.code,409)
  with self.assertRaises(HTTPError):save(r|dict(finished=True),1)
  r|=dict(index=len(lab['steps']),tools=lab['tools'],notes=['Мен байқалған құбылысты өз сөзімен жаздым.']*len(lab['steps']),conclusion='Өз бақылауыма сүйеніп қорытынды жасадым.',finished=True)
  row=save(r,1);self.assertTrue(row['school_learning']['_guided_labs']['hydrogen']['finished'])
  other=req('GET','/api/progress',token=self.users[1]['token']);self.assertFalse(any(x.get('school_learning',{}).get('_guided_labs') for x in other))
  report=next(x for x in req('GET','/api/analytics',token=self.admin)['details'] if x['item_id']==item)
  self.assertEqual(report['school_learning']['_guided_labs']['hydrogen']['notes'],r['notes'])
  with self.assertRaises(HTTPError):save(r,2,token=self.admin)
  with self.assertRaises(HTTPError):save(r,2,item_id=self.grade)
  r2=r|dict(index=0,attempt=2,notes=['']*len(lab['steps']),conclusion='',tools=[],finished=False)
  row=save(r2,2);saved=row['school_learning']['_guided_labs']['hydrogen'];self.assertEqual(saved['previous']['notes'],r['notes']);self.assertFalse(saved['finished'])
  from glob import glob
  dbs=glob(self.temp.name+'/*.db')+glob(self.temp.name+'/*.sqlite*')
  self.assertTrue(dbs)
  with sqlite3.connect(dbs[0]) as db:self.assertEqual(db.execute('select count(*) from guided_lab_attempts where item_id=?',(item,)).fetchone()[0],2)
if __name__=='__main__':unittest.main()
