"""Server-side timed university assessments with saved immutable snapshots."""
import json, uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
BANK=json.loads((Path(__file__).parent/"university-control-bank.json").read_text(encoding="utf-8"))
def stamp(): return datetime.now(timezone.utc).isoformat()
def seed_control(c):
    c.execute("""create table if not exists university_control_attempts(
    id text primary key,user_id text not null references users(id) on delete cascade,
    item_id text not null references content_items(id) on delete cascade,started_at text not null,
    deadline text not null,questions text not null,answers text not null,finished_at text,
    score integer,max_score integer not null default 30,revision integer not null default 0)""")
    c.execute("create unique index if not exists university_control_active on university_control_attempts(user_id,item_id) where finished_at is null")
    root=c.execute("select id from content_items where path='/universitet'").fetchone()
    if not root: return
    parent=root["id"]
    for ident,path,title,kind,order in [
    ("university-control","/universitet/agymdyk-bakylau","Ағымдық бақылау","course",35),
    ("university-control-1","/universitet/agymdyk-bakylau/1","1-ағымдық бақылау","lesson",1),
    ("university-control-2","/universitet/agymdyk-bakylau/2","2-ағымдық бақылау","lesson",2)]:
        c.execute("""insert or ignore into content_items(id,parent_id,area,title,path,item_type,sort_order,is_published,created_at,updated_at)
        values(?,?,'university',?,?,?,?,1,?,?)""",(ident,parent,title,path,kind,order,stamp(),stamp()))
        if kind=="course": parent=ident
def record(row):
    result=dict(row)
    for field in ("questions","answers"): result[field]=json.loads(result[field])
    result["server_now"]=stamp()
    return result
def handle_control(h,method,path):
    user=h.user(True)
    if path.endswith("/attempts") and method=="GET":
        with h.control_db() as c:
            rows=c.execute("select * from university_control_attempts "+("" if user["role"]=="admin" else "where user_id=? ")+"order by started_at desc",() if user["role"]=="admin" else (user["id"],)).fetchall()
        return h.json_response([record(r) for r in rows])
    if user["role"]=="admin": raise h.control_error(403,"Әкімші прогресі сақталмайды")
    data=h.read_json()
    with h.control_db() as c:
        c.execute("begin immediate")
        item=c.execute("select id from content_items where path='/universitet/agymdyk-bakylau/1'").fetchone()
        if not item: raise h.control_error(404,"Бақылау табылмады")
        h.require_content(item["id"])
        if path.endswith("/start") and method=="POST":
            a=c.execute("select * from university_control_attempts where user_id=? and item_id=? and finished_at is null",(user["id"],item["id"])).fetchone()
            if not a and not data.get("restart"):
                a=c.execute("select * from university_control_attempts where user_id=? and item_id=? order by started_at desc limit 1",(user["id"],item["id"])).fetchone()
            if not a:
                ident=str(uuid.uuid4());started=datetime.now(timezone.utc)
                c.execute("insert into university_control_attempts(id,user_id,item_id,started_at,deadline,questions,answers) values(?,?,?,?,?,?,?)",(ident,user["id"],item["id"],started.isoformat(),(started+timedelta(minutes=30)).isoformat(),json.dumps(BANK,ensure_ascii=False),json.dumps([-1]*30)))
                a=c.execute("select * from university_control_attempts where id=?",(ident,)).fetchone()
            result=record(a)
        elif path.endswith("/save") and method=="POST":
            a=c.execute("select * from university_control_attempts where id=? and user_id=?",(data.get("attempt"),user["id"])).fetchone()
            if not a: raise h.control_error(403,"forbidden")
            a=record(a);time_now=stamp()
            if not a["finished_at"]:
                expired=datetime.now(timezone.utc)>=datetime.fromisoformat(a["deadline"])
                if not expired:
                    if type(data.get("revision")) is not int or data["revision"]!=a["revision"]: raise h.control_error(409,"stale_attempt")
                    answers=data.get("answers")
                    if not isinstance(answers,list) or len(answers)!=30 or any(type(v) is not int or not -1<=v<len(a["questions"][i]["options"]) for i,v in enumerate(answers)): raise h.control_error(400,"invalid_answers")
                    a["answers"]=answers
                if data.get("finish") or expired:
                    a["finished_at"]=time_now
                    a["score"]=sum(v==a["questions"][i]["correct_index"] for i,v in enumerate(a["answers"]))
                c.execute("update university_control_attempts set answers=?,finished_at=?,score=?,revision=revision+1 where id=?",(json.dumps(a["answers"]),a["finished_at"],a["score"],a["id"]))
                if a["finished_at"]:
                    c.execute("""insert into progress(user_id,item_id,progress,completed,score,max_score,quiz_answers,attempt_count,tested_at,updated_at)
                    values(?,?,100,1,?,30,?,1,?,?) on conflict(user_id,item_id) do update set progress=100,completed=1,score=excluded.score,max_score=30,quiz_answers=excluded.quiz_answers,attempt_count=progress.attempt_count+1,tested_at=excluded.tested_at,updated_at=excluded.updated_at""",(user["id"],a["item_id"],a["score"],json.dumps(a["answers"]),time_now,time_now))
            current=c.execute("select * from university_control_attempts where id=?",(a["id"],)).fetchone()
            progress=c.execute("select * from progress where user_id=? and item_id=?",(user["id"],a["item_id"])).fetchone()
            result={"attempt":record(current),"progress":h.progress_row(progress) if progress else None}
        else: raise h.control_error(404,"not_found")
    return h.json_response(result)
