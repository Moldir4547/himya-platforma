import {createBridgeDiagnostic} from './bridge-diagnostic.js';
import {stepEvidence,textbookComparison,evidenceOverview} from './bridge-evidence.js';
import {bookReading,readingId} from './bridge-book.js';
import {curriculumReviewView,createContinuityPractice} from './continuity-assessment.js';
import {SCHOOL_UNITS} from './school-curriculum.js';
import {matchesTopic} from './school-materials.js';
import {teacherEntries} from './teacher-materials.js';
export const JOURNEY_PATH='/sabaktastyk-kopiri/mugalim-zholy';
const esc=(s='')=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const TEACHING_TRACKS=[
 {id:'bond',title:'Химиялық байланыс',grade:8,schoolSlug:'bonding',terms:['байланыс','гибрид','орбиталь'],bridge:'/sabaktastyk-kopiri/himiyalyk-bailanys',question:'Су қайнағанда молекуланың ішінде не болады?',
  school:'Атомдар байланысып, молекула немесе кристалдық тор түзеді. O–H байланысы полярлы коваленттік байланысқа жатады.',
  university:'Байланысты валенттік байланыс және молекулалық орбиталь әдістерімен талдаймыз. Молекула геометриясын, полярлығын және молекулааралық әсерлерді ажыратамыз.',
  teach:'Оқушыдан «Су қайнағанда сутек пен оттек түзіле ме?» деп сұраңыз. Су молекуласының моделін өзгеріссіз қалдырып, молекулалардың арақашықтығын үлкейтіңіз.',
  evidence:'Оқушы молекула ішіндегі байланысты молекулааралық әсерден ажыратып, будың да H₂O екенін түсіндіреді.',
  options:['O–H байланыстары үзіліп, H₂ мен O₂ түзіледі.','Молекулалар алыстайды; O–H байланыстары сақталады.','Оттек атомдары сутек атомдарына айналады.'],answer:1,
  why:'Қайнау — физикалық үдеріс: молекулааралық әсерлер еңсеріледі, бірақ H₂O молекуласының құрамы мен O–H байланыстары сақталады.',
  boundary:'Мектептегі шар-өзек моделі құрылымды түсіндіреді. Ол электрондық бұлттың нақты бейнесі емес.'},
 {id:'atom',title:'Атом құрылысы',grade:7,schoolSlug:'structure-isotopes',terms:['атом құрылы','электрон','квант'],bridge:'/mektep/teoriya/10-synyp/atomic-orbitals',question:'Атом оң ионға айналғанда не өзгереді?',
  school:'Протон саны элементті анықтайды; нейтрон саны өзгерсе изотоп, электрон саны өзгерсе ион түзіледі.',
  university:'Электрон күйі квант сандары және орбитальдар арқылы сипатталады. Орбиталь — электронның нақты айналу жолы емес, ықтималдық сипаттамасы.',
  teach:'Ядро мен электрондарды бөлек белгілермен көрсетіңіз. Na атомынан бір электронды алып, ядроны өзгеріссіз қалдырыңыз. Содан кейін қабат моделі мен орбиталь моделінің қолданылу шегін салыстырыңыз.',
  evidence:'Оқушы ион түзілуін электрон санымен түсіндіреді және оның жаңа элементтің түзілуі емес екенін дәлелдейді.',
  options:['Ядродағы протон саны артады.','Атом бір немесе бірнеше электрон береді.','Барлық нейтрон электронға айналады.'],answer:1,
  why:'Оң ион электрон беру арқылы түзіледі. Протон саны сақталады, сондықтан элемент өзгермейді.',
  boundary:'Электрондық қабаттағы шеңберлерді электронның нақты траекториясы деп түсіндіруге болмайды.'},
 {id:'equivalent',title:'Мольден эквивалентке',grade:8,schoolSlug:'mole-avogadro',terms:['эквивалент','зат мөлшері','стехиометр'],bridge:'/sabaktastyk-kopiri/ekvivalent-ugymy',question:'H₂SO₄ екі протоны бойынша толық бейтараптанса, эквиваленттік молярлық массасы қандай? M = 98 г/моль.',
  school:'Зат мөлшері бөлшектерді санауға, ал реакция теңдеуінің коэффициенттері заттардың мөлшерлік қатынасын табуға көмектеседі.',
  university:'Эквиваленттік фактор нақты реакцияға тәуелді. Қышқылдың толық немесе жартылай бейтараптануына қарай z мәні өзгереді; Mэкв = M/z.',
  teach:'H₂SO₄ + NaOH → NaHSO₄ + H₂O және H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O теңдеулерін салыстырыңыз. Бір қышқыл үшін неліктен z = 1 және z = 2 болатынын студент түсіндірсін.',
  evidence:'Білім алушы эквивалентті заттың өзгермейтін қасиеті ретінде қабылдамай, реакциямен байланыстырады.',
  options:['98 г/моль','49 г/моль','196 г/моль'],answer:1,
  why:'Екі протон бойынша толық бейтараптануда z = 2. Сондықтан Mэкв = 98/2 = 49 г/моль. Бір протон ғана әрекеттессе, бұл мән басқаша болады.',
  boundary:'Эквивалентті түсіндіру алдында нақты реакция мен оның жүру дәрежесін көрсету қажет.'},
 {id:'solutions',title:'Ерітінді және концентрация',grade:8,schoolSlug:'solutions',terms:['ерітінді','концентрация','ерігіштік'],bridge:'/sabaktastyk-kopiri/eritindiler',question:'10 г NaCl мен 90 г судан алынған ерітіндідегі тұздың массалық үлесі қандай?',
  school:'Массалық үлесте еріген зат массасын ерітіндінің толық массасына бөлеміз. Еру мен ерігіштік шегін ажыратамыз.',
  university:'Молярлық концентрация мектепте де бар. ЖОО-да концентрация түрлерін, тығыздықты және ерітінді даярлауды байланыстырамыз. Сұйылтуда еріген зат мөлшерінің сақталу шартын тексереміз.',
  teach:'10 г тұз бен 90 г су моделін көрсетіңіз. «Неге 10-ды 90-ға емес, 100-ге бөлеміз?» деген сұрақ қойыңыз. Кейін көлем берілмесе, молярлық концентрацияны бірден таба алмайтынын талқылаңыз.',
  evidence:'Оқушы еріткіш пен ерітінді массасын шатастырмайды; студент молярлық концентрацияға қандай қосымша дерек қажет екенін атайды.',
  options:['11,1%','10%','90%'],answer:1,
  why:'Ерітінді массасы 10 + 90 = 100 г. w = 10/100 × 100% = 10%. Еріткіш массасын бөлімге қою дұрыс емес.',
  boundary:'Массаларды қосуға болады; сұйықтардың көлемдері әр жағдайда дәл қосыла бермейді.'},
 {id:'redox',title:'Электрон алмасу',grade:9,schoolSlug:'redox',terms:['тотығу','тотықсыздан','электрохим'],bridge:'/sabaktastyk-kopiri/totygu-totyksyzdanu',question:'Fe²⁺ → Fe³⁺ өзгерісінде темір бөлшегі не істейді?',
  school:'Тотығу дәрежесінің артуы электрон беруге, кемуі электрон қосып алуға сәйкес келеді.',
  university:'Электрондық және ион-электрондық теңестіруді, электродтық үдерістерді және ортаның реакцияға әсерін талдаймыз.',
  teach:'Fe²⁺ бөлшегінен бір электронның кетуін модельде көрсетіңіз. «Заряд неге артады, егер бөлшек бір нәрсе жоғалтса?» деген сұрақ арқылы электрон зарядына назар аудартыңыз.',
  evidence:'Білім алушы Fe²⁺ → Fe³⁺ + e⁻ теңдеуін жазып, оны тотығу деп негіздейді.',
  options:['Бір электрон қосып алады.','Бір электрон береді.','Ядросына бір протон қосады.'],answer:1,
  why:'Fe²⁺ → Fe³⁺ + e⁻: теріс зарядты электрон берілгендіктен, ионның оң заряды бір бірлікке артады. Бұл — тотығу.',
  boundary:'Тотығу дәрежесін атомның барлық қосылыстағы нақты электр зарядымен теңестіруге болмайды.'}
];
const SCHOOL_PATH=t=>'/mektep/teoriya/'+t.grade+'-synyp/'+t.schoolSlug;
const STAGES=[['school','Мектеп','Тірек білім'],['university','ЖОО','Терең түсіну'],['teach','Практика','Оқушыға түсіндіру']];
function molecule(){
 return '<svg class="tj-molecule" viewBox="0 0 320 250" role="img" aria-label="Су молекуласының шартты шар-өзек моделі: бір оттек және екі сутек атомы"><defs><radialGradient id="tj-oxygen" cx=".3" cy=".25" r=".8"><stop stop-color="#ffdfc9"/><stop offset=".5" stop-color="#e68668"/><stop offset="1" stop-color="#9d4a41"/></radialGradient><radialGradient id="tj-hydrogen" cx=".3" cy=".25" r=".8"><stop stop-color="white"/><stop offset=".6" stop-color="#d9f1ed"/><stop offset="1" stop-color="#6baca7"/></radialGradient></defs><ellipse cx="160" cy="210" rx="106" ry="15" fill="#204b48" opacity=".08"/><ellipse cx="160" cy="126" rx="127" ry="88" fill="none" stroke="#b6d7d1" stroke-dasharray="3 8"/><path d="M160 98L89 164M160 98L231 164" stroke="#7aaca5" stroke-width="15" stroke-linecap="round"/><path d="M160 94L87 160M160 94L229 160" stroke="#e9f6ee" stroke-width="4" stroke-linecap="round"/><circle cx="160" cy="98" r="46" fill="url(#tj-oxygen)"/><circle cx="89" cy="164" r="31" fill="url(#tj-hydrogen)"/><circle cx="231" cy="164" r="31" fill="url(#tj-hydrogen)"/><g font-family="system-ui,sans-serif" text-anchor="middle" font-weight="700" fill="#244742"><text x="160" y="108" font-size="28" fill="white">O</text><text x="89" y="172" font-size="23">H</text><text x="231" y="172" font-size="23">H</text></g><text x="160" y="242" text-anchor="middle" font-size="13" fill="#496a64">H₂O · шартты оқу моделі</text></svg>';
}

export const CONTINUITY_LADDERS = [
  {
    "id": "bond",
    "title": "Химиялық байланыс",
    "symbol": "H₂O",
    "lecture": "7–8",
    "change": "Байланыс түрін атаудан молекуланың құрылымы мен қасиетін әртүрлі модель арқылы түсіндіруге өтеміз.",
    "shared": "Атомдар арасындағы байланыс пен зат қасиеттерінің байланысын түсіндіру.",
    "difference": "Гибридтену 10-сыныпта да қарастырылады. ЖОО-да ВБӘ мен МОӘ-ні салыстырып, модельдің түсіндіру мүмкіндігін талдаймыз.",
    "gap": "Электрондық конфигурацияны білмесе, орбитальдардың толуын және байланыс ретін түсіндіру қиындайды.",
    "steps": [
      [
        8,
        "bonding",
        "Байланысты ажырату",
        "Иондық, коваленттік байланыс пен кристалдық торды ажыратамын.",
        "NaCl мен H₂O байланысын салыстыру."
      ],
      [
        10,
        "bonding-geometry",
        "Пішін мен полярлық",
        "Электрон жұптары, гибридтену және геометрияны байланыстырамын.",
        "CO₂ сызықтық, H₂O бұрыштық: молекула полярлығы неге өзгеше?"
      ],
      [
        "bridge",
        "/sabaktastyk-kopiri/himiyalyk-bailanys",
        "Модельді тексеру",
        "Байланыс полярлығы мен молекула полярлығын шатастырмаймын.",
        "Полярлы байланыстары бар CO₂ неліктен полярсыз?"
      ],
      [
        "uni",
        "7–8",
        "ВБӘ және МОӘ",
        "Локалданған байланыс моделін молекулалық орбитальдармен салыстырамын.",
        "O₂ парамагниттілігін МО диаграммасындағы жұптаспаған электрондармен түсіндіру."
      ]
    ]
  },
  {
    "id": "atom",
    "title": "Атом құрылысы",
    "symbol": "1s²",
    "lecture": "4–5",
    "change": "Ядро мен электрондарды санаудан электрон күйін кванттық модельмен сипаттауға өтеміз.",
    "shared": "Атом құрылысын элементтің қасиеттерімен байланыстыру.",
    "difference": "Орбиталь мен электрондық конфигурация мектепте басталады; ЖОО-да квант сандарының физикалық мәні мен модельдің негізін тереңдетеміз.",
    "gap": "Ион мен изотопты шатастыру электрондық конфигурация мен элемент табиғатын қате түсіндіруге әкеледі.",
    "steps": [
      [
        7,
        "structure-isotopes",
        "Атомның құрамы",
        "Протон, нейтрон, электрон сандарын анықтаймын.",
        "Na және Na⁺ үшін не өзгереді?"
      ],
      [
        10,
        "atomic-orbitals",
        "Электрондық конфигурация",
        "Орбитальдар мен толтыру ережелерін қолданамын.",
        "Na: 1s²2s²2p⁶3s¹; Na⁺ үшін конфигурацияны жазу."
      ],
      [
        "bridge",
        "/mektep/teoriya/10-synyp/atomic-orbitals",
        "Қабаттан орбитальға",
        "Қабат моделінің қолданылу шегін түсіндіремін.",
        "Орбиталь неліктен электронның айналу жолы емес?"
      ],
      [
        "uni",
        "4–5",
        "Модельдің математикалық негізі",
        "Толқындық функцияны ықтималдық тығыздығымен байланыстырамын.",
        "ψ және |ψ|² нені сипаттайды? Неліктен орбиталь дайын траектория емес?"
      ]
    ]
  },
  {
    "id": "equivalent",
    "title": "Моль және эквивалент",
    "symbol": "n = m/M",
    "lecture": "1–2",
    "change": "Зат мөлшерін есептеуден реакцияға тәуелді эквиваленттік факторды таңдауға өтеміз.",
    "shared": "Реакциядағы заттардың сандық қатынасын анықтау.",
    "difference": "Моль — бөлшектер санына байланысты шама. Эквивалент реакциядағы протон не электрон алмасуына тәуелді; ол мольдің орнына жүретін тұрақты қасиет емес.",
    "gap": "Теңдеуді теңестірмей есептеу және реакцияны көрсетпей эквивалент табу.",
    "steps": [
      [
        8,
        "mole-avogadro",
        "Зат мөлшері",
        "Масса мен молярлық масса арқылы зат мөлшерін табамын.",
        "98 г H₂SO₄ үшін n = 1 моль."
      ],
      [
        10,
        "stoichiometry",
        "Стехиометриялық қатынас",
        "Теңестірілген теңдеудегі коэффициенттерді қолданамын.",
        "1 моль H₂SO₄ толық бейтараптануға қанша NaOH қажет?"
      ],
      [
        "bridge",
        "/sabaktastyk-kopiri/ekvivalent-ugymy",
        "Реакцияны салыстыру",
        "Толық және жартылай бейтараптануды ажыратамын.",
        "NaHSO₄ және Na₂SO₄ түзілгенде z неліктен өзгереді?"
      ],
      [
        "uni",
        "1–2",
        "Эквивалент заңы",
        "Нақты реакция үшін z және Mэкв = M/z таңдауын негіздеймін.",
        "H₂SO₄ толық бейтараптанса 49 г/моль; бір протон бойынша — 98 г/моль."
      ]
    ]
  },
  {
    "id": "solutions",
    "title": "Ерітінділер",
    "symbol": "c = n/V",
    "lecture": "11",
    "change": "Мектептегі массалық үлес пен молярлық концентрациядан концентрация түрлерін салыстыруға және ерітінді даярлауға өтеміз.",
    "shared": "Ерітінді құрамын сандық сипаттау және қажетті құрамдағы ерітінді алу.",
    "difference": "ЖОО-да бірнеше концентрация түрін, өлшем бірлігін және көлем мен тығыздық туралы деректердің жеткіліктілігін салыстырамыз.",
    "gap": "Еріткіш массасын ерітінді массасымен, ал миллилитрді литрмен шатастыру.",
    "steps": [
      [
        8,
        "solutions",
        "Массалық үлес",
        "Еріген зат пен ерітіндінің массасын ажыратамын.",
        "10 г тұз + 90 г су: w = 10%."
      ],
      [
        11,
        "titration",
        "Концентрацияны анықтау",
        "Ерітіндінің құрамын титрлеу нәтижесімен байланыстырамын.",
        "Эквиваленттік нүкте мен индикатор түсінің өзгеруін ажырату."
      ],
      [
        "bridge",
        "/sabaktastyk-kopiri/eritindiler",
        "Деректің жеткіліктілігі",
        "Массалық үлестен молярлық концентрацияға өтуге қандай дерек керегін анықтаймын.",
        "10%-дық ерітіндінің молярлық концентрациясына неге тығыздық қажет?"
      ],
      [
        "uni",
        "11",
        "Ерітінді даярлау",
        "Молярлық, мольдік үлес және эквиваленттік концентрацияны ажыратамын.",
        "250 мл 0,10 моль/л NaCl үшін 1,46 г тұз алып, ерітінді көлемін белгіге жеткізу."
      ]
    ]
  },
  {
    "id": "redox",
    "title": "Тотығу-тотықсыздану",
    "symbol": "e⁻",
    "lecture": "15",
    "change": "Электрондық баланстан реакция бағытын энергия мен потенциал арқылы бағалауға өтеміз.",
    "shared": "Электрон беру мен қосып алуды ажырату; теңдеуде масса мен зарядты сақтау.",
    "difference": "Ион-электрондық әдіс 10-сыныпта бар. ЖОО кітабында ΔG = −nFE және Нернст теңдеуі реакция бағытын әрі концентрация әсерін сандық талдауға негіз болады.",
    "gap": "Тотығу дәрежесін барлық қосылыста нақты заряд деп қабылдау немесе заряд балансын тексермеу.",
    "steps": [
      [
        9,
        "redox",
        "Электрондық баланс",
        "Тотығу дәрежесінің өзгерісін анықтаймын.",
        "Fe²⁺ → Fe³⁺ + e⁻: тотығу."
      ],
      [
        10,
        "galvanic-cells",
        "Электродтардағы үдеріс",
        "Тотығу мен тотықсыздануды электродтармен байланыстырамын.",
        "Гальваникалық элементте электрондар сыртқы тізбекпен қалай өтеді?"
      ],
      [
        "bridge",
        "/sabaktastyk-kopiri/totygu-totyksyzdanu",
        "Орта және заряд",
        "Жартылай реакцияда атом санын да, зарядты да тексеремін.",
        "Қышқыл ортада MnO₄⁻ → Mn²⁺ ауысуын теңестіру."
      ],
      [
        "uni",
        "15",
        "Бағыт пен потенциал",
        "Электрод потенциалы мен Гиббс энергиясы арқылы реакция бағытын бағалаймын.",
        "n = 2 және E = 0,30 В болса, ΔG ≈ −57,9 кДж/моль. Бұл жылдамдық туралы не айтпайды?"
      ]
    ]
  },
  {
    "id": "periodic",
    "title": "Периодтық заң",
    "symbol": "Z",
    "lecture": "6",
    "change": "Элементтерді жіктеуден қасиеттерін электрондық құрылым арқылы түсіндіруге, кейін сол білімді жүйелеуге өтеміз.",
    "shared": "Элементтер қасиеттерінің периодтылығын атом құрылысымен байланыстыру.",
    "difference": "Иондану энергиясы, электронға жақындық және электртерістілік 10-сыныпта бар. Қаралған ЖОО параграфында бұл білім жүйеленеді; міндетті жаңа модель дәлелденген жоқ.",
    "gap": "Қасиет өзгерісін тек жаттау; радиус пен ядро зарядының ықпалын байланыстырмау.",
    "steps": [
      [
        7,
        "periodic-table",
        "Элементтің орны",
        "Топ пен периодты анықтаймын.",
        "Na мен K қай топта орналасқан?"
      ],
      [
        10,
        "periodic-properties",
        "Қасиет заңдылығы",
        "Периодтық өзгерісті электрондық құрылыммен байланыстырамын.",
        "Бір периодта атом радиусы жалпы неге кемиді?"
      ],
      [
        "bridge",
        "/mektep/teoriya/10-synyp/periodic-properties",
        "Ережені негіздеу",
        "Ортақ үрдіс пен ерекшеліктерді ажыратамын.",
        "Қасиет тек протон санына тәуелді деп айту жеткілікті ме?"
      ],
      [
        "uni",
        "6",
        "Құрылымнан қасиетке",
        "Иондану энергиясын, электронға жақындықты және электртерістілікті салыстырамын.",
        "Атомнан электрон жұлу энергиясы мен байланыстағы электронды тарту қабілетінің айырмасын түсіндіру."
      ]
    ]
  },
  {
    "id": "equilibrium",
    "title": "Кинетика және тепе-теңдік",
    "symbol": "⇌",
    "lecture": "9–10",
    "change": "Жылдамдық факторларын атаудан реакция жылдамдығы, бағыты және тепе-теңдігін ажыратуға өтеміз.",
    "shared": "Реакция жағдайларының жылдамдық пен өнім құрамына ықпалын түсіндіру.",
    "difference": "Тепе-теңдік константасы мен Гиббс энергиясы 10-сыныпта да бар; ЖОО-да бұл ұғымдарды жүйелі түрде қолданып, тәжірибе нәтижесін талдаймыз.",
    "gap": "Катализатор тепе-теңдікті ығыстырады немесе өздігінен жүретін реакция міндетті түрде жылдам деп ойлау.",
    "steps": [
      [
        9,
        "reaction-rate",
        "Жылдамдық факторлары",
        "Температура, концентрация және катализатор әсерін сипаттаймын.",
        "Бірдей металдың ұнтағы мен кесегі неге әртүрлі жылдамдықпен әрекеттеседі?"
      ],
      [
        10,
        "industrial-equilibrium",
        "Динамикалық тепе-теңдік",
        "Тура және кері реакция жылдамдықтарын, тепе-теңдік құрамын ажыратамын.",
        "Катализатор тепе-теңдікке жетуді тездетеді; берілген температурада K-ны өзгертпейді."
      ],
      [
        "bridge",
        "/mektep/teoriya/10-synyp/industrial-equilibrium",
        "Жылдамдық пен бағыт",
        "Кинетикалық және термодинамикалық тұжырымдарды ажыратамын.",
        "Реакция энергетикалық тиімді болса да, неге баяу жүруі мүмкін?"
      ],
      [
        "uni",
        "9–10",
        "Тәжірибені талдау",
        "Энергетика, кинетика және тепе-теңдікті біріктіріп, бақылауды негіздеймін.",
        "Температура өзгергенде жылдамдық пен тепе-теңдік құрамын бөлек талдау."
      ]
    ]
  },
  {
    "id": "acidbase",
    "title": "Қышқылдар және pH",
    "symbol": "pH",
    "lecture": "12–13",
    "change": "Индикатордан pH есебіне, одан концентрация жуықтауының шегін белсенділік арқылы түсіндіруге өтеміз.",
    "shared": "Ерітінді ортасын анықтау және қышқыл-негіздік қасиетін түсіндіру.",
    "difference": "pH және қышқыл-негіздік теориялар 11-сыныпта бар. ЖОО кітабындағы тереңдеу — иондар әрекеттесуі, белсенділік коэффициенті және иондық күш.",
    "gap": "Барлық тұз ерітіндісін бейтарап деп санау; қышқылдың күші мен концентрациясын теңестіру.",
    "steps": [
      [
        7,
        "acids-indicators",
        "Ортаны байқау",
        "Индикатор арқылы қышқыл және сілтілік ортаны ажыратамын.",
        "Индикатор түсі ерітіндінің ортасы туралы не айтады?"
      ],
      [
        11,
        "acid-base-ph",
        "pH және теория",
        "Қышқыл-негіз ұғымдары мен pH-ты қолданамын.",
        "Күшті және әлсіз қышқылдың айырмасы концентрацияға ғана байланысты ма?"
      ],
      [
        "bridge",
        "/mektep/teoriya/9-synyp/salt-hydrolysis",
        "Тұздан ортаға",
        "Тұз иондарының сумен әрекеттесуін қарастырамын.",
        "CH₃COONa ерітіндісі неліктен сілтілік орта береді?"
      ],
      [
        "uni",
        "12–13",
        "Концентрациядан белсенділікке",
        "Сұйылтылған ерітінді жуықтауының қолданылу шегін түсіндіремін.",
        "pH = −lg a(H⁺); неліктен концентрациямен есептегенде жуық теңдік қолданамыз?"
      ]
    ]
  }
];
function chemistryArt(){
 return '<svg class="cb-chem-art" viewBox="0 0 440 330" role="img" aria-label="Химиядағы білімнің күрделенуі: бөлшек, молекула, тәжірибе және орбитальдық модель"><defs><radialGradient id="cb-orb"><stop stop-color="#fff"/><stop offset=".35" stop-color="#c4b5fd"/><stop offset="1" stop-color="#6945c3"/></radialGradient><linearGradient id="cb-glass" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#b5e8ed" stop-opacity=".3"/></linearGradient></defs><circle cx="225" cy="153" r="145" fill="#eae2ff"/><circle cx="360" cy="80" r="59" fill="#ffddbd"/><path d="M24 286H116V238H213V182H310V125H410" fill="none" stroke="#fff" stroke-width="28" stroke-linejoin="round"/><g fill="#f0ab52"><circle cx="48" cy="245" r="17"/><circle cx="80" cy="222" r="13"/><circle cx="78" cy="255" r="11"/></g><g stroke="#7c69c6" stroke-width="9"><path d="M151 167L125 196M151 167L183 195"/></g><circle cx="151" cy="167" r="25" fill="#ef766e"/><g fill="#fff" stroke="#b6a0df" stroke-width="2"><circle cx="125" cy="196" r="15"/><circle cx="183" cy="195" r="15"/></g><path d="M244 65H272M250 66V116L222 163Q216 179 232 181H287Q304 179 297 163L266 116V66" fill="url(#cb-glass)" stroke="#386d80" stroke-width="3"/><path d="M238 139H282L295 165Q300 176 286 176H233Q222 175 227 164Z" fill="#2db8ba" opacity=".8"/><g fill="#fff"><circle cx="251" cy="153" r="4"/><circle cx="269" cy="165" r="3"/></g><g transform="translate(352 70) rotate(-35)"><ellipse cx="-21" rx="26" ry="17" fill="url(#cb-orb)"/><ellipse cx="21" rx="26" ry="17" fill="url(#cb-orb)"/><circle r="5" fill="#ffad54"/></g><g font-family="system-ui" font-weight="700" fill="#413366" font-size="13"><text x="22" y="318">БӨЛШЕК</text><text x="114" y="270">ҚҰРЫЛЫМ</text><text x="220" y="214">ТӘЖІРИБЕ</text><text x="321" y="155">МОДЕЛЬ</text></g><g fill="#7356bc"><circle cx="64" cy="105" r="4"/><circle cx="395" cy="245" r="5"/></g><text x="39" y="65" fill="#9861b5" font-size="22" font-family="serif">ΔG</text><text x="326" y="292" fill="#3b8190" font-size="25" font-family="serif">⇌</text></svg>';
}
export function bridgeModuleView(){
 return '<div class="tj-page cb-module"><header class="tj-page-head"><span class="tj-eyebrow">МЕКТЕП → ЖОО → МҰҒАЛІМ ПРАКТИКАСЫ</span><h1>Сабақтастық көпірі</h1><p>Бір химиялық ұғым мектепте қалай қалыптасады және университетте қалай тереңдейді? Тақырыпты таңдап, білімнің, түсіндірудің және тапсырманың өзгерісін салыстырыңыз.</p><a class="tj-text-link" href="'+JOURNEY_PATH+'">Салыстыру және жоспар →</a></header>'+continuityView()+'<section class="tj-start"><h2>Келесі қадам — оқушыға түсіндіру</h2><p>ЖОО-дағы ғылыми түсінікті оқушының жасына сай модельге айналдырыңыз. Модель нені түсіндіреді және қай жерде жеткіліксіз екенін белгілеңіз.</p><a href="'+JOURNEY_PATH+'">Мұғалімнің түсіндіру жоспарын құру →</a></section></div>';
}
function depthComparison(t){
 const a=t.steps[0],b=t.steps[1],u=t.steps[3];
 return '<section class="cb-depth" aria-label="Мектеп пен университетті салыстыру"><h4>Нақты не күрделенеді?</h4><div class="cb-depth-grid">'+[
 ['Мектеп · '+a[0]+'-сынып','Тірек түсінік',a[3],a[4]],
 ['Жоғары сынып · '+b[0]+'-сынып','Тереңдету',b[3],b[4]],
 ['Университет · дәріс '+t.lecture,'Ғылыми негіздеу',u[3],u[4]]
 ].map(([level,label,goal,example])=>'<article><span class="cb-level">'+esc(level)+'</span><h5>'+label+'</h5><p>'+esc(goal)+'</p><b>Авторлық оқу тапсырмасы</b><p>'+esc(example)+'</p></article>').join('')+'</div><dl class="cb-depth-summary"><div><dt>Сақталатын ортақ мақсат</dt><dd>'+esc(t.shared)+'</dd></div><div><dt>Жаңа деңгейдің айырмасы</dt><dd>'+esc(t.difference)+'</dd></div><div><dt>Өтуге кедергі болатын олқылық</dt><dd>'+esc(t.gap)+'</dd></div></dl><p class="cb-reading-note">Күрделену тек жаңа терминдермен өлшенбейді: білім алушы модель таңдап, жауабын негіздеп, оның қолданылу шегін түсіндіреді. Нақты оқу мақсаттары мен құжаттық қорытынды төменде берілген.</p></section>';
}
function ladderPanel(id){
 const t=CONTINUITY_LADDERS.find(t=>t.id===id)||CONTINUITY_LADDERS[0];
 return '<header class="cb-ladder-heading"><div><span class="tj-eyebrow">БІР ҰҒЫМНЫҢ ДАМУЫ</span><h3 tabindex="-1">'+esc(t.title)+'</h3></div><span class="cb-formula" aria-hidden="true">'+esc(t.symbol)+'</span></header><p class="cb-change">'+esc(t.change)+'</p><ol class="cb-staircase">'+t.steps.map((s,i)=>{
 const unit=Number.isInteger(s[0])?SCHOOL_UNITS.find(u=>u.grade===s[0]&&u.slug===s[1]):null;
 const label=unit?s[0]+'-сынып':s[0]==='bridge'?'Өтпелі қадам':'ЖОО · 1-курс';
 const href=unit?unit.path:s[0]==='bridge'?s[1]:'/universitet/teoriya';
 return '<li class="cb-step cb-step-'+i+'" id="'+readingId(t.id,i)+'" tabindex="-1"><span class="cb-step-number">0'+(i+1)+'</span><span class="cb-level">'+label+'</span><h4>'+esc(s[2])+'</h4><p>'+esc(s[3])+'</p><details class="cb-micro-reading"><summary>Қысқа түсіндірме · 30 секунд</summary>'+bookReading(t.id,i)+'</details><div class="cb-step-example"><b>Мысал</b><p>'+esc(s[4])+'</p></div><a href="'+href+'">'+(unit?'Мектеп тақырыбы':s[0]==='bridge'?'Өтпелі материал':'Дәрістер бөлімі')+' →</a><small>'+(unit?esc(unit.book):s[0]==='bridge'?'Екі деңгейді байланыстыруға арналған авторлық тапсырма':'Силлабус · дәріс '+esc(t.lecture))+'</small>'+stepEvidence(t.id,i)+'</li>';
 }).join('')+'</ol>'+textbookComparison(t.id)+depthComparison(t)+curriculumReviewView(t);
}
export function continuityView(){
 return '<section class="cb-continuity" id="continuity-ladder" aria-labelledby="cb-continuity-title"><header class="cb-section-head"><div><span class="tj-eyebrow">CHEMBRIDGE · САБАҚТАСТЫҚ КАРТАСЫ</span><h2 id="cb-continuity-title">Мектептен ЖОО-ға: білімнің күрделену картасы</h2><p>Тақырыпты таңдаңыз: мектептегі негізден ЖОО-дағы ғылыми түсіндіруге дейін көтеріліңіз.</p></div><span class="cb-count">8 тақырып<br><b>4 қадам</b></span></header>'+evidenceOverview(CONTINUITY_LADDERS)+'<div class="cb-topic-picker" role="group" aria-label="Салыстыратын тақырып">'+CONTINUITY_LADDERS.map((t,i)=>'<button type="button" data-cb-topic="'+t.id+'" aria-pressed="'+(i===0)+'" aria-controls="cb-ladder-panel">'+esc(t.title)+'</button>').join('')+'</div><div data-cb-diagnostic></div><div id="cb-ladder-panel" data-cb-panel>'+ladderPanel('bond')+'</div><div data-cb-practice></div><p class="cb-selection-status" data-cb-status role="status" aria-live="polite"></p><p class="cb-reading-note">Құжаттар бойынша сабақтастық пен осы әрекеттегі нәтиже бөлек көрсетіледі. Тапсырма ұпайы бағдарламалардың сәйкестік пайызы емес.</p></section>';
}
function bindContinuity(root,state,store){
 const section=root.querySelector('.cb-continuity');if(!section)return;
 const practice=createContinuityPractice({section,state,ladders:CONTINUITY_LADDERS,store});practice.show('bond');
 const diagnostic=createBridgeDiagnostic({section,state,ladders:CONTINUITY_LADDERS});diagnostic.show('bond');
 section.querySelectorAll('[data-cb-topic]').forEach(button=>button.addEventListener('click',()=>{
  const id=button.dataset.cbTopic;
  section.querySelectorAll('[data-cb-topic]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  section.querySelector('[data-cb-panel]').innerHTML=ladderPanel(id);
  practice.show(id);diagnostic.show(id);
  const prefix=location.pathname.startsWith('/himya-platforma/')||location.pathname==='/himya-platforma'?'/himya-platforma':'';
  if(prefix)section.querySelectorAll('[data-cb-panel] a[href^="/"]').forEach(a=>{const href=a.getAttribute('href');if(!href.startsWith(prefix+'/'))a.setAttribute('href',prefix+href);});
  section.querySelector('[data-cb-status]').textContent=CONTINUITY_LADDERS.find(t=>t.id===id).title+': төрт қадам көрсетілді.';
 }));
}

export function teacherHome(state,continueHtml=''){
 return '<div class="tj-home"><section class="learn-home chembridge-home tj-hero"><div class="tj-hero-copy"><span class="tj-eyebrow">МЕКТЕП–ЖОО ЖҮЙЕСІНДЕ ҮЗДІКСІЗ ХИМИЯЛЫҚ БІЛІМ</span><h1>Мектептен — ЖОО-ға.<br><em>Химияны бірге тереңдетейік.</em></h1><p>Атомнан орбитальға, мольден эквивалентке. Бір ұғымның мектепте қалай басталып, университетте қалай күрделенетінін білім баспалдағымен зерттеңіз.</p><div class="tj-actions"><a class="tj-primary" href="/sabaktastyk-kopiri#continuity-ladder">Білім баспалдағын ашу <span aria-hidden="true">↗</span></a><a class="tj-text-link" href="'+JOURNEY_PATH+'">Салыстыру және жоспар →</a><a class="tj-text-link" href="/topics">Оқуды бастау →</a></div><div class="tj-audience"><span>Болашақ мұғалім</span><span>Практикант</span><span>Химияны тереңдетіп оқитын білім алушы</span></div></div><aside class="tj-hero-visual" aria-label="Мектептен сабақ беруге дейін"><div class="tj-visual-label"><span>САБАҚТАСТЫҚ БАСПАЛДАҒЫ</span><b>Білім қалай күрделенеді?</b></div>'+chemistryArt()+'<div class="tj-mini-path"><span><b>01</b> Мектептегі негіз</span><span><b>02</b> ЖОО-дағы тереңдік</span><span><b>03</b> Ғылыми негіздеу</span></div></aside></section>'+continueHtml+
 '<section class="tj-home-story"><div><span class="tj-eyebrow">БІЛІМНЕН — ТҮСІНДІРУГЕ</span><h2>Бір тақырыпты қайталау ма,<br>әлде жаңа деңгейге көтерілу ме?</h2></div><p>Мектеп пен ЖОО тақырыптарының ортақ негізін, жаңадан қосылатын модельді және өтпелі қиындықты салыстырыңыз. Кейін осы байланысты оқушыға түсіндіруге дайындалыңыз.</p><a class="tj-story-link" href="'+JOURNEY_PATH+'?topic=bond">Осы мысалмен жұмыс істеу →</a></section>'+
 '<section class="home-directions tj-directions" aria-labelledby="directions-title"><header><span class="tj-eyebrow">ҮШ БӨЛІМ — БІР ОҚУ ЖОЛЫ</span><h2 id="directions-title">Өзіңізге қажет бөлімді таңдаңыз</h2></header><div class="direction-cards">'+[
 ['school','01','Мектеп','Оқушының бастапқы түсінігін таныңыз. 7–11-сынып теориясын, сызбалар мен тапсырмаларды қараңыз.','Сыныпты таңдау','/mektep'],
 ['university','02','Университет','Таныс ұғымды тереңдетіңіз. Дәрістерді, зертханаларды және ағымдық бақылауды пайдаланыңыз.','ЖОО модулін ашу','/universitet'],
 ['bridge','03','Сабақтастық көпірі','Екі деңгейдің айырмасын түсіндіріңіз. Өтпелі тапсырмалар арқылы білімді байланыстырыңыз.','Көпірден бастау','/sabaktastyk-kopiri']
 ].map(([tone,n,title,copy,action,href])=>'<article class="direction-card '+tone+'"><span class="direction-number" aria-hidden="true">'+n+'</span><h3>'+title+'</h3><p>'+copy+'</p><a href="'+href+'">'+action+' →</a></article>').join('')+'</div></section>'+
 '<section class="tj-start orientation-panel" aria-labelledby="start-guide-title"><span class="tj-eyebrow">АЛҒАШҚЫ ҚАДАМ</span><h2 id="start-guide-title">Бір тақырыпты алып, сабаққа дейін жеткізіңіз</h2><ol class="start-guide"><li><strong>Мектептегі түсінікті еске түсіріңіз</strong><span>Оқушы нені біледі, нені шатастыруы мүмкін?</span></li><li><strong>ЖОО деңгейінде тереңдетіңіз</strong><span>Қай модель, заң немесе дәлел жаңадан қосылады?</span></li><li><strong>Оқытуға дайындаңыз</strong><span>Мысал, көрнекілік және түсінгенін тексеретін сұрақ құрыңыз.</span></li></ol><a class="tj-text-link" href="'+JOURNEY_PATH+'">Тақырыптарды салыстырып, жоспар құру →</a>'+(state.user?'':'<p class="orientation-note">Сабақтарды ашу және жеке нәтижелерді көру үшін <a href="/login">кіріңіз</a> немесе <a href="/register">тіркеліңіз</a>.</p>')+'</section>'+
 '<section class="teacher-home-entry tj-toolbox"><div><span class="tj-eyebrow">САБАҚҚА ҚАЖЕТ ҚҰРАЛДАР</span><h2>Дайын материалды орнымен қолданыңыз</h2><p>Тақырыпқа сәйкес материалды таңдаңыз, кейін оны өз түсіндіруіңізбен толықтырыңыз.</p></div><div class="tj-tool-links"><a href="/mugalim-materialdary"><b>Мұғалім материалдары ↗</b><span>Слайдтар, жұмыс парақтары, PISA</span></a><a href="/materials"><b>Оқу кітапханасы ↗</b><span>Мектеп пен ЖОО оқулықтары</span></a><a href="/kabinet"><b>Жеке нәтижелер ↗</b><span>Орындалған тапсырмалар мен прогресс</span></a></div></section></div>';
}
export function schoolContentAudit(state){
 const entries=teacherEntries(state.items||[],state.allResources||[]),byId=new Map((state.items||[]).map(i=>[i.id,i]));
 function belongs(item,grade){const seen=new Set();while(item&&!seen.has(item.id)){seen.add(item.id);if(item.path==='/mektep/teoriya/'+grade+'-synyp')return true;item=byId.get(item.parent_id);}return false;}
 return SCHOOL_UNITS.map(u=>{
  const files=entries.filter(e=>e.area==='school'&&belongs(e.item,u.grade));
  const count=kind=>files.filter(e=>matchesTopic(e.row.filename||'',u,kind,{...e.row,topicTitle:e.item.title})).length;
  return {slug:u.slug,title:u.title,grade:u.grade,path:u.path,slides:count('presentation'),worksheets:count('worksheet')};
 });
}
function auditView(state){
 const rows=schoolContentAudit(state),ready=rows.filter(r=>r.slides&&r.worksheets).length;
 return '<details class="tj-audit" id="teacher-content-audit"><summary>Толықтыру картасы · '+ready+'/'+rows.length+' тақырыпта слайд пен жұмыс парағы бар</summary><p>Бұл карта жарияланған файлдардың сынып пен тақырыпқа сәйкестігін көрсетеді. Файл саны оның ғылыми немесе әдістемелік сапасын бағаламайды.</p><div class="tj-audit-filters"><label>Сынып<select data-tj-grade><option value="">Барлық сынып</option>'+[7,8,9,10,11].map(g=>'<option value="'+g+'">'+g+'-сынып</option>').join('')+'</select></label><label><input type="checkbox" data-tj-missing> Тек файл жетіспейтін тақырыптар</label><a href="/admin/material/new">Материал қосу →</a></div><div class="tj-table"><table><caption>Қай тақырыпқа не қосу қажет?</caption><thead><tr><th>Тақырып</th><th>Презентация</th><th>Жұмыс парағы</th><th>Әрекет</th></tr></thead><tbody>'+rows.map(r=>'<tr data-tj-audit-row data-grade="'+r.grade+'" data-missing="'+(!r.slides||!r.worksheets)+'"><td><small>'+r.grade+'-сынып</small><a href="'+r.path+'">'+esc(r.title)+'</a></td><td>'+ (r.slides?r.slides+' файл':'Қосу қажет')+'</td><td>'+(r.worksheets?r.worksheets+' файл':'Қосу қажет')+'</td><td><a href="/admin/material/new">Толықтыру ↗</a></td></tr>').join('')+'</tbody></table></div><p data-tj-audit-count role="status">'+rows.length+' тақырып көрсетілді</p></details>';
}
const FIELDS=[
 ['goal','Оқу мақсаты','Сабақ соңында оқушы нені түсіндіре алады?'],
 ['connection','Мектеп–ЖОО байланысы','Мектептегі түсінікке қандай жаңа ғылыми түсіндіру қосылады?'],
 ['explanation','Оқушыға түсіндіру тәсілі','Қандай өмірлік мысал, модель немесе қауіпсіз виртуалды тәжірибе қолданасыз?'],
 ['assessment','Түсінгенін тексеру','Қандай сұрақ қоясыз? Қандай жауап түсінгенін дәлелдейді?']
];
export const PLAN_CRITERIA=['Ғылыми түсіндіру дұрыс','Оқушының жасына сай','Екі деңгейдің байланысы көрінеді','Түсінгенін тексеретін дәлел бар'];
export function planKey(owner,topic){return 'chembridge.teaching-plan.v1:'+encodeURIComponent(owner)+':'+topic;}
export function sanitizePlan(value={}){
 return Object.fromEntries(FIELDS.map(([key])=>[key,typeof value?.[key]==='string'?value[key].slice(0,2400):'']).concat([['reflection',typeof value?.reflection==='string'?value.reflection.slice(0,1200):''],['criteria',PLAN_CRITERIA.map((_,i)=>value?.criteria?.[i]===true)]]));
}
export function createTeacherJourney({state,render,store}){
 let topic='',stage='school',answers={},status='',activeOwner=null;
 const current=()=>TEACHING_TRACKS.find(t=>t.id===topic)||TEACHING_TRACKS[0];
 const owner=()=>state.user?.id;
 function sync(){if(activeOwner!==owner()){activeOwner=owner();topic='';answers={};status='';stage='school';}}
 function readPlan(){try{return sanitizePlan(JSON.parse(localStorage.getItem(planKey(owner(),current().id))||'{}'));}catch{return sanitizePlan();}}
 function view(){
  sync();
  if(!state.user)return '<section class="tj-page"><h1>Мұғалім жолы</h1><p>Жеке жұмысқа өту үшін аккаунтыңызға кіріңіз.</p><a href="/login?next='+encodeURIComponent(JOURNEY_PATH)+'">Жүйеге кіру →</a></section>';
  const requested=new URLSearchParams(location.search).get('topic');if(TEACHING_TRACKS.some(t=>t.id===requested)&&topic!==requested){topic=requested;stage='school';status='';}else if(!topic)topic=TEACHING_TRACKS[0].id;
  const t=current(),plan=readPlan(),selected=answers[t.id],files=teacherEntries(state.items||[],state.allResources||[]).filter(e=>e.area==='university'&&t.terms.some(term=>(e.row.title+' '+e.row.filename).toLocaleLowerCase('kk').includes(term)));
  return '<div class="tj-page" data-teacher-journey><a class="tj-back" href="/">← Басты бет</a><header class="tj-page-head"><span class="tj-eyebrow">МЕКТЕП → ӨТПЕЛІ ҚАДАМ → ЖОО</span><h1>Химиялық білімнің<br><em>сабақтастығын зерттеңіз.</em></h1><p>Алдымен білім баспалдағындағы күрделенуді салыстырыңыз. Төменде бес тақырып бойынша түсіндіруді тексеріп, өз сабағыңыздың жоспарын құра аласыз.</p>'+(state.user.role==='admin'?'<button class="tj-audit-jump" type="button" data-tj-open-audit aria-controls="teacher-content-audit">Материалдарды толықтыру картасы ↓</button>':'')+'</header>'+continuityView()+'<div class="tj-workspace"><aside class="tj-topics"><h2>Тақырыпты таңдаңыз</h2>'+TEACHING_TRACKS.map((tr,i)=>'<button type="button" data-tj-topic="'+tr.id+'" aria-pressed="'+(tr.id===t.id)+'"><span>0'+(i+1)+'</span><b>'+tr.title+'</b><small>'+tr.grade+'-сыныптан басталады</small></button>').join('')+'<a href="/kabinet">Жеке нәтижелерім →</a></aside><div class="tj-content"><section class="tj-compare"><span class="tj-eyebrow">САБАҚТАСТЫҚТЫ ТҮСІН</span><h2 tabindex="-1">'+t.title+'</h2><div class="tj-stage-tabs" role="tablist" aria-label="Түсіндіру деңгейі">'+STAGES.map(([key,title,sub])=>'<button role="tab" type="button" id="tj-tab-'+key+'" data-tj-stage="'+key+'" aria-controls="tj-stage-panel" aria-selected="'+(stage===key)+'" tabindex="'+(stage===key?0:-1)+'"><b>'+title+'</b><span>'+sub+'</span></button>').join('')+'</div><div id="tj-stage-panel" role="tabpanel" aria-labelledby="tj-tab-'+stage+'"><p class="tj-stage-main">'+esc(t[stage])+'</p>'+(stage==='teach'?'<div class="tj-proof"><b>Түсінгенін қалай білемін?</b><p>'+t.evidence+'</p></div>':'')+'<p class="tj-model-limit"><b>Модель шегі:</b> '+t.boundary+'</p><div class="tj-resource-links"><a href="'+SCHOOL_PATH(t)+'#understand">Мектеп теориясы ↗</a><a href="'+t.bridge+'">Тереңдетіп оқу ↗</a><a href="/universitet">ЖОО материалдары ↗</a></div></div>'+(files.length?'<details class="tj-related"><summary>ЖОО-да жүктелген сәйкес материалдар · '+files.length+'</summary>'+files.map(e=>'<p><a href="'+esc(e.item.path)+'">'+esc(e.row.title||e.row.filename)+'</a></p>').join('')+'</details>':'')+'</section>'+
  '<section class="tj-check"><span class="tj-eyebrow">ҚАТЕ ТҮСІНІКТІ АНЫҚТА</span><h2>'+t.question+'</h2><p>Алдымен өз жауабыңызды таңдаңыз. Кейін оны оқушыға қалай түсіндіретініңізді ойлаңыз.</p><div class="tj-options">'+t.options.map((o,i)=>'<button type="button" data-tj-answer="'+i+'" aria-pressed="'+(selected===i)+'">'+esc(o)+'</button>').join('')+'</div><div data-tj-feedback role="status">'+(Number.isInteger(selected)?'<p class="'+(selected===t.answer?'tj-correct':'tj-incorrect')+'"><b>'+(selected===t.answer?'Дұрыс. ':'Қайта қарастырыңыз. ')+'</b>'+t.why+' <a href="'+SCHOOL_PATH(t)+'#understand">Теорияға оралу →</a></p>':'')+'</div><small>Бұл — түсіндіруге дайындық. Ресми тест ұпайын жеке сабақтағы «Тест» бөлімінде жинайсыз.</small></section>'+
  '<section class="tj-planner"><span class="tj-eyebrow">ӨЗ САБАҒЫҢЫЗҒА АЙНАЛДЫРЫҢЫЗ</span><h2>Менің түсіндіру жоспарым</h2><p class="tj-plan-topic">Тақырып: <strong>'+esc(t.title)+'</strong></p><p class="tj-draft-note">Жоба осы браузерде, өз аккаунтыңыз үшін сақталады. Оқытушыға беру үшін басып шығаруға болады.</p><form data-tj-plan>'+FIELDS.map(([key,label,help])=>'<label>'+label+'<span>'+help+'</span><textarea name="'+key+'" maxlength="2400" rows="3">'+esc(plan[key])+'</textarea><span class="tj-print-value" data-tj-print-value="'+key+'"></span></label>').join('')+'<fieldset><legend>Жоспарды тексеріңіз</legend>'+PLAN_CRITERIA.map((c,i)=>'<label class="tj-criterion"><input type="checkbox" name="criterion-'+i+'" '+(plan.criteria[i]?'checked':'')+'>'+c+'</label>').join('')+'</fieldset><label>Рефлексия<span>Қай тұсын түсіндіру қиын болды? Келесі жолы нені өзгертесіз?</span><textarea name="reflection" maxlength="1200" rows="3">'+esc(plan.reflection)+'</textarea><span class="tj-print-value" data-tj-print-value="reflection"></span></label><div class="tj-plan-actions"><button type="button" data-tj-save>Жобаны осы браузерде сақтау</button><button type="button" data-tj-print>Басып шығару</button></div><p data-tj-plan-status role="status">'+esc(status)+'</p></form></section></div></div>'+(state.user.role==='admin'?auditView(state):'')+'</div>';
 }
 function bind(root){
  bindContinuity(root,state,store);
  if(!root.querySelector('[data-teacher-journey]'))return;
  const user=owner();let dirty=false;
  root.querySelector('[data-tj-plan]')?.addEventListener('input',()=>{dirty=true;root.querySelector('[data-tj-plan-status]').textContent='Жоба өзгерді. Сақтау батырмасын басыңыз.';});
  const capture=()=>{
   const form=root.querySelector('[data-tj-plan]'),data=new FormData(form),value=Object.fromEntries(FIELDS.map(([key])=>[key,data.get(key)]));
   value.reflection=data.get('reflection');value.criteria=PLAN_CRITERIA.map((_,i)=>data.has('criterion-'+i));return sanitizePlan(value);
  };
  const save=()=>{
   if(!user||owner()!==user)return false;
   try{localStorage.setItem(planKey(user,current().id),JSON.stringify(capture()));status='Жоба осы браузерде сақталды.';dirty=false;root.querySelector('[data-tj-plan-status]').textContent=status;return true;}
   catch{status='Жоба сақталмады. Жауаптарыңыз бетте тұр. Басып шығарып алуға болады.';root.querySelector('[data-tj-plan-status]').textContent=status;return false;}
  };
  root.querySelector('[data-tj-save]').onclick=save;
  root.querySelector('[data-tj-print]').onclick=()=>{if(owner()!==user)return;const value=capture();root.querySelectorAll('[data-tj-print-value]').forEach(el=>{el.textContent=value[el.dataset.tjPrintValue];});window.print();};
  function redraw(){render();}
  root.querySelectorAll('[data-tj-topic]').forEach(b=>b.onclick=()=>{
   if(owner()!==user)return;
   if(dirty&&!save())return;
   topic=b.dataset.tjTopic;stage='school';status='';
   const url=new URL(location.href);url.searchParams.set('topic',topic);history.replaceState({},'',url.pathname+url.search+url.hash);
   redraw();root.querySelector('.tj-compare h2')?.focus();
  });
  root.querySelectorAll('[data-tj-stage]').forEach(b=>{
   b.onclick=()=>{if(owner()!==user)return;if(dirty&&!save())return;stage=b.dataset.tjStage;redraw();root.querySelector('#tj-tab-'+stage)?.focus();};
   b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const i=STAGES.findIndex(x=>x[0]===stage),next=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;root.querySelector('[data-tj-stage="'+STAGES[next][0]+'"]').click();};
  });
  root.querySelectorAll('[data-tj-answer]').forEach(b=>b.onclick=()=>{
   if(owner()!==user)return;if(dirty&&!save())return;
   answers[current().id]=Number(b.dataset.tjAnswer);redraw();
  });
  const filter=()=>{
   const grade=root.querySelector('[data-tj-grade]').value,missing=root.querySelector('[data-tj-missing]').checked;let count=0;
   root.querySelectorAll('[data-tj-audit-row]').forEach(r=>{r.hidden=!!((grade&&r.dataset.grade!==grade)||(missing&&r.dataset.missing!=='true'));if(!r.hidden)count++;});
   root.querySelector('[data-tj-audit-count]').textContent=count+' тақырып көрсетілді';
  };
  root.querySelector('[data-tj-open-audit]')?.addEventListener('click',()=>{const audit=root.querySelector('#teacher-content-audit');audit.open=true;audit.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});
  root.querySelector('[data-tj-grade]')?.addEventListener('change',filter);
  root.querySelector('[data-tj-missing]')?.addEventListener('change',filter);
 }
 return {view,bind};
}

export function bindTeacherEntry(root){
 const unit=root.querySelector('[data-school-unit]')?.dataset.schoolUnit;
 const track=TEACHING_TRACKS.find(t=>t.schoolSlug===unit);
 const panel=root.querySelector('#school-panel');
 if(!track||!panel||!root.querySelector('#school-tab-understand[aria-selected="true"]')||panel.querySelector('[data-teacher-entry-link]'))return;
 const aside=document.createElement('aside');aside.className='tj-school-entry';aside.dataset.teacherEntryLink='';
 const text=document.createElement('p');text.textContent='Болашақ мұғалімге: осы ұғым ЖОО-да қалай тереңдейді? Оны оқушыға қалай түсіндіресіз?';
 const link=document.createElement('a');link.href=JOURNEY_PATH+'?topic='+track.id;link.textContent='Сабақтастықты салыстырып, түсіндіру жоспарын құру →';aside.append(text,link);panel.append(aside);
}
