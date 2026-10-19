"""Bound journal input without grading a learner's scientific observation."""
import json
import math
from pathlib import Path
SPECS={l['id']:l for l in json.loads(Path(__file__).with_name('guided-lab-catalog.json').read_text())}

def validate_guided_record(lab_id,record):
    if not isinstance(lab_id,str) or lab_id not in SPECS or not isinstance(record,dict): raise ValueError('invalid_journal')
    spec=SPECS[lab_id]; n=len(spec['steps'])
    if type(record.get('index')) is not int or not 0<=record['index']<=n: raise ValueError('invalid_step')
    if type(record.get('attempt')) is not int or not 1<=record['attempt']<=100000: raise ValueError('invalid_attempt')
    ms=record.get('elapsedMs')
    if type(ms) not in (int,float) or not math.isfinite(ms) or not 0<=ms<=86400000: raise ValueError('invalid_time')
    notes=record.get('notes'); tools=record.get('tools'); conclusion=record.get('conclusion')
    if not isinstance(notes,list) or len(notes)!=n or any(not isinstance(x,str) or len(x)>500 for x in notes): raise ValueError('invalid_notes')
    if not isinstance(tools,list) or len(tools)>len(spec['tools']) or any(not isinstance(x,str) or x not in spec['tools'] for x in tools): raise ValueError('invalid_tools')
    if record['index']>0 and any(x not in tools for x in spec['tools']): raise ValueError('missing_tools')
    if not isinstance(conclusion,str) or len(conclusion)>1500 or type(record.get('finished')) is not bool: raise ValueError('invalid_conclusion')
    if record['finished'] and (record['index']!=n or any(len(x.strip())<15 for x in notes) or len(conclusion.strip())<20): raise ValueError('incomplete_report')
    return {k:record[k] for k in ('index','attempt','elapsedMs','notes','tools','conclusion','finished')}|{'runningSince':None}
