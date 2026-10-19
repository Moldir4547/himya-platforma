import sys,unittest,copy
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from guided_lab_validation import SPECS,validate_guided_record
class GuidedValidation(unittest.TestCase):
 def test_all_labs(self):
  for k,l in SPECS.items():
   n=len(l['steps']); r=dict(index=n,attempt=1,elapsedMs=123456,notes=['Мен өзім байқаған құбылысты сипаттадым.']*n,tools=l['tools'],conclusion='Тәжірибеде байқалған өзгерістер бойынша қорытынды.',finished=True)
   self.assertEqual(validate_guided_record(k,r)['notes'],r['notes'])
   for field,value in [('index',n+1),('index',True),('elapsedMs',float('nan')),('elapsedMs',-1),('notes',[]),('notes',['x'*501]*n),('finished','true'),('tools',[]),('attempt',0),('conclusion','')]:
    with self.subTest(lab=k,field=field,value=str(value)[:20]),self.assertRaises(ValueError):validate_guided_record(k,r|{field:value})
 def test_no_client_identity_or_revision(self):
  l=SPECS['hydrogen'];r=dict(index=0,attempt=1,elapsedMs=0,notes=['']*len(l['steps']),tools=[],conclusion='',finished=False,user_id='other',revision=99,score=100)
  clean=validate_guided_record('hydrogen',r)
  self.assertNotIn('user_id',clean);self.assertNotIn('score',clean);self.assertNotIn('revision',clean)
if __name__=='__main__':unittest.main()
