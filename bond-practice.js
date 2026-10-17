// Built-in practice is kept separate from teacher-authored quiz_data.
export const BOND_PATH = "/sabaktastyk-kopiri/himiyalyk-bailanys";
export const BOND_VERSION = 1;
export const BOND_QUESTIONS = [
  {
    "level": "Мектеп",
    "question": "NaCl кристалындағы бөлшектерді негізінен қандай байланыс ұстап тұрады?",
    "options": [
      "Ортақ электрон жұбы бар коваленттік байланыс",
      "Қарама-қарсы зарядталған иондардың тартылысы",
      "Молекулааралық сутектік байланыс"
    ],
    "answer": 1,
    "section": "bond-ionic",
    "explanation": "NaCl — Na⁺ және Cl⁻ иондарынан тұратын кеңістіктік тор; оны электростатикалық тартылыс тұрақтандырады.",
    "why": [
      "NaCl кристалы жеке коваленттік молекулалардан тұрмайды.",
      "",
      "NaCl құрамында сутек жоқ; сутектік байланыс бұл торды түсіндірмейді."
    ]
  },
  {
    "level": "Мектеп",
    "question": "Cl₂ молекуласындағы Cl—Cl байланысы қандай?",
    "options": [
      "Полюссіз коваленттік",
      "Иондық",
      "Полюсті коваленттік"
    ],
    "answer": 0,
    "section": "bond-polar",
    "explanation": "Бірдей екі Cl атомының электртерістілігі бірдей. Ортақ электрон жұбы екі атомға симметриялы таралады.",
    "why": [
      "",
      "Екі бірдей атом арасында электронның толық ауысуын қолданбаймыз.",
      "Cl—Cl байланысында электртерістілік айырмасы жоқ."
    ]
  },
  {
    "level": "Мектеп",
    "question": "Су қайнағанда қандай әсерлер еңсеріледі?",
    "options": [
      "H₂O ішіндегі барлық O—H байланыстары",
      "Су H₂ мен O₂-ге ыдырайды",
      "Молекулааралық әсерлер, соның ішінде сутектік байланыстар"
    ],
    "answer": 2,
    "section": "bond-polar",
    "explanation": "Қайнау кезінде H₂O молекулалары бір-бірінен алыстайды; молекула ішіндегі O—H коваленттік байланыстары сақталады.",
    "why": [
      "O—H үзілуі қайнауды емес, химиялық өзгерісті білдірер еді.",
      "Қайнау — физикалық үдеріс, судың химиялық ыдырауы емес.",
      ""
    ]
  },
  {
    "level": "Өтпелі",
    "question": "CO₂ молекуласында C=O байланыстары полюсті. Неліктен молекула тұтасымен полюссіз?",
    "options": [
      "Оттегінің электртерістілігі көміртектен төмен",
      "Сызықтық молекулада екі байланыс диполі бірін-бірі өтейді",
      "Барлық полюсті байланысы бар молекулалар полюссіз"
    ],
    "answer": 1,
    "section": "bond-shape",
    "explanation": "O=C=O сызықтық және симметриялы. Тең екі диполь қарама-қарсы бағытталғандықтан, олардың векторлық қосындысы нөл.",
    "why": [
      "Оттегі көміртектен электртерістірек; себеп — молекуланың геометриясы.",
      "",
      "Мысалы, бұрыштық H₂O-да дипольдер толық өтелмейді."
    ]
  },
  {
    "level": "Өтпелі",
    "question": "Этендегі (C₂H₄) σ және π байланыстарының жалпы саны қандай?",
    "options": [
      "4σ және 2π",
      "6σ және 0π",
      "5σ және 1π"
    ],
    "answer": 2,
    "section": "bond-overlap",
    "explanation": "Төрт C—H байланысы — 4σ; C=C құрамында 1σ және 1π бар. Барлығы: 5σ және 1π.",
    "why": [
      "Қос байланыс екі π емес: оның бірі міндетті түрде σ болады.",
      "Қос байланыстың екінші бөлігі — бүйірлік бүркесуден түзілетін π-байланыс.",
      ""
    ]
  },
  {
    "level": "Өтпелі",
    "question": "CO₃²⁻ ионының резонанстық құрылымдары нені білдіреді?",
    "options": [
      "Бір ионның делокализацияланған электрондық құрылымын сипаттайтын жазылулар",
      "Үш түрлі ионның тез кезектесуі",
      "Бір C—O байланысы әрқашан қалған екеуінен қысқа"
    ],
    "answer": 0,
    "section": "bond-delocal",
    "explanation": "Нақты карбонат ионында үш C—O байланысы тең. Резонанстық формулалар — бір электрондық құрылымды сипаттау тәсілі.",
    "why": [
      "",
      "Резонанс — құрылымдардың уақыт бойынша бір-біріне ауысуы емес.",
      "Делокализация салдарынан үш C—O байланысы эквивалентті."
    ]
  },
  {
    "level": "Университет",
    "question": "O₂ үшін валенттік байланыстырушы МО-да 8, байланысқа қарсы МО-да 4 электрон бар. Байланыс реті қандай?",
    "options": [
      "6",
      "2",
      "4"
    ],
    "answer": 1,
    "section": "bond-mo",
    "explanation": "Байланыс реті = (Nбайл. − Nқарсы)/2 = (8 − 4)/2 = 2. Байланыстырушы және қарсы электрондардың үлесі қарама-қарсы.",
    "why": [
      "Электрондарды қосу емес, олардың сандарының айырмасын екіге бөлу керек.",
      "",
      "8 − 4 = 4 айырмасын екіге бөлу қажет."
    ]
  },
  {
    "level": "Университет",
    "question": "[Fe(CN)₆]⁴⁻ ионындағы Fe тотығу дәрежесі мен координациялық саны қандай?",
    "options": [
      "+6 және 4",
      "+4 және 6",
      "+2 және 6"
    ],
    "answer": 2,
    "section": "bond-complex",
    "explanation": "x + 6(−1) = −4, сондықтан x = +2. Алты монодентатты CN⁻ лиганды Fe-мен байланысқан: координациялық саны 6.",
    "why": [
      "Лиганд саны тотығу дәрежесіне тең емес; кешеннің толық заряды −4.",
      "Кешеннің −4 заряды орталық Fe заряды емес.",
      ""
    ]
  }
];
const esc = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function gradeBond(answers) {
  if (!Array.isArray(answers) || answers.length !== BOND_QUESTIONS.length ||
      answers.some((a,i) => !Number.isInteger(a) || a < 0 || a >= BOND_QUESTIONS[i].options.length))
    throw new Error("Барлық 8 тапсырмаға жауап беріңіз");
  const score = answers.reduce((sum,a,i) => sum + Number(a === BOND_QUESTIONS[i].answer),0);
  return {score, max_score:8, percent:Math.round(score*100/8)};
}
export function bondPracticeView() {
  return `<section class="bond-practice" data-bond-practice aria-labelledby="bond-practice-title">
    <header><span class="bond-practice-kicker">Мектеп → Өтпелі → Университет</span>
    <h2 id="bond-practice-title">Білімді қолдан: 8 интерактивті тапсырма</h2>
    <p>Әр дұрыс жауап — 1 ұпай. Бір тапсырмада алғашқы таңдауыңыз есептеледі.
    Түсіндірмені оқып, қажет болса теорияға оралыңыз. Уақыт шектеуі жоқ.</p></header>
    <p data-bp-summary role="status" aria-live="polite">Орындалды: 0 / 8 · Ұпай: 0 / 8</p>
    <p data-bp-saved></p>
    <div class="bond-practice-grid">${BOND_QUESTIONS.map((q,i) => `<fieldset data-bp-question="${i}">
      <legend><span>${i+1} / 8 · ${esc(q.level)}</span><strong>${esc(q.question)}</strong></legend>
      <div class="bond-practice-options">${q.options.map((option,j) => `<button type="button" data-bp-answer="${j}" aria-pressed="false">${esc(option)}</button>`).join("")}</div>
      <div data-bp-feedback role="status" aria-live="polite" tabindex="-1" hidden></div>
    </fieldset>`).join("")}</div>
    <div class="bond-practice-actions"><button type="button" class="primary-button compact" data-bp-save disabled>Нәтижені сақтау</button>
    <button type="button" class="secondary-button" data-bp-reset>Қайта орындау</button></div>
    <p data-bp-status role="status" aria-live="polite"></p>
  </section>`;
}
export function createBondPractice({store,state}) {
  let attempt;
  const owner = () => state.user?.id || null;
  function current(item) {
    if (!attempt || attempt.owner !== owner() || attempt.itemId !== item.id)
      attempt = {owner:owner(),itemId:item.id,id:crypto.randomUUID(),answers:Array(8).fill(null),saving:false,saved:false,message:""};
    return attempt;
  }
  return {
    bind(root,item) {
      const host=root.querySelector("[data-bond-practice]");
      if (!host || item?.path !== BOND_PATH) return;
      const active=current(item),userId=owner();
      const stillOwner=() => owner() === userId && attempt === active;
      const status=host.querySelector("[data-bp-status]");
      const save=host.querySelector("[data-bp-save]"),reset=host.querySelector("[data-bp-reset]");
      function update() {
        const count=active.answers.filter(a=>a!==null).length;
        const score=active.answers.reduce((sum,a,i)=>sum+Number(a!==null&&a===BOND_QUESTIONS[i].answer),0);
        host.querySelector("[data-bp-summary]").textContent=`Орындалды: ${count} / 8 · Ұпай: ${score} / 8`;
        const saved=state.progress.find(row=>row.item_id===item.id)?.bond_practice;
        host.querySelector("[data-bp-saved]").textContent=saved?.version===BOND_VERSION
          ? `Сақталған нәтиже: ${saved.score}/8 · Үздік нәтиже: ${saved.best_score}/8 · Талпыныс: ${saved.attempt_count}` : "";
        save.disabled=count!==8||active.saving||active.saved||!userId||state.user?.role==="admin";
        reset.disabled=active.saving;
        status.textContent=active.message||(!userId?"Нәтижені сақтау үшін жүйеге кіріңіз.":state.user?.role==="admin"?"Әкімшіге арналған алдын ала қарау: нәтиже сақталмайды.":"");
        host.querySelectorAll("[data-bp-question]").forEach((field,i)=>{
          const a=active.answers[i],q=BOND_QUESTIONS[i],answered=a!==null,correct=a===q.answer;
          field.querySelectorAll("[data-bp-answer]").forEach(button=>{
            const n=Number(button.dataset.bpAnswer);button.disabled=answered;
            button.setAttribute("aria-pressed",String(n===a));
            button.classList.toggle("bp-right",answered&&n===q.answer);
            button.classList.toggle("bp-wrong",answered&&n===a&&!correct);
          });
          const feedback=field.querySelector("[data-bp-feedback]");feedback.hidden=!answered;
          if(answered) feedback.innerHTML=`<p><strong>${correct?"✓ Дұрыс!":"✗ Қате."}</strong> ${esc(correct?"":q.why[a])} ${esc(q.explanation)}</p><a href="#${q.section}">Теорияны қайта оқу →</a>`;
        });
      }
      host.querySelectorAll("[data-bp-question]").forEach((field,i)=>{
        field.querySelectorAll("[data-bp-answer]").forEach(button=>button.addEventListener("click",()=>{
          if(!stillOwner()||active.answers[i]!==null)return;
          active.answers[i]=Number(button.dataset.bpAnswer);update();
          field.querySelector("[data-bp-feedback]").focus({preventScroll:true});
        }));
      });
      host.addEventListener("click",event=>{
        const link=event.target.closest('a[href^="#"]');if(!link)return;
        const target=root.querySelector(link.getAttribute("href"));if(!target)return;
        event.preventDefault();target.setAttribute("tabindex","-1");target.focus({preventScroll:true});
        target.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
      });
      save.addEventListener("click",async()=>{
        if(!stillOwner()||save.disabled)return;
        active.saving=true;active.message="Нәтиже сақталуда…";update();
        try {
          const row=await store.submitBondPractice(item.id,active.id,active.answers.slice());
          if(!stillOwner())return;
          const index=state.progress.findIndex(p=>p.item_id===item.id);
          if(index===-1)state.progress.push(row);else state.progress[index]=row;
          active.saved=true;active.message="Нәтиже сабақ прогресінде сақталды.";
        } catch {
          if(!stillOwner())return;
          active.message="Сақтау орындалмады. Байланысты тексеріп, «Нәтижені сақтау» батырмасын қайта басыңыз.";
        } finally {active.saving=false;if(stillOwner())update();}
      });
      reset.addEventListener("click",()=>{
        if(!stillOwner()||active.saving)return;
        attempt=null;
        host.outerHTML=bondPracticeView();
        this.bind(root,item);
        root.querySelector("[data-bp-answer]")?.focus();
      });
      update();
    }
  };
}

