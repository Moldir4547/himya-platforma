// Self-contained teaching illustrations: projected volume, explicit symbols and readable HTML captions.
// No external textures, WebGL or network dependency; SVG stays sharp on phones and in print.
const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const card=(kind,title,text,formula='')=>({kind,title,text,formula});
export function visualCards(u){
 const f=u.family;
 if(u.slug==='atoms-substances')return[
 card('atom','Атом — бір бөлшек','Гелий — жеке атомдардан тұратын жай зат. Шардағы He — элементтің таңбасы.','He'),
 card('water','Молекула — байланысқан атомдар','Судың әр молекуласында бір оттек пен екі сутек атомы бар.','H₂O'),
 card('oxygen','Жай заттың молекуласы','Оттек молекуласының екі атомы бір элементке жатады.','O₂')];
 if(u.slug==='structure-isotopes')return[
 card('carbon12','Көміртек-12','Ядрода 6 протон және 6 нейтрон бар. Бейтарап атомда 6 электрон болады.','¹²C: 6p⁺ + 6n⁰'),
 card('carbon14','Көміртек-14','Протон саны сол күйінде қалады, нейтрон саны 8-ге тең. Бұл — бір элементтің изотоптары.','¹⁴C: 6p⁺ + 8n⁰')];
 if(u.slug==='atomic-orbitals')return[
 card('s-orbital','s-орбиталь','Электронның табылу ықтималдығы ядро маңында сфералық симметрияға ие.','s'),
 card('p-orbital','p-орбиталь','Екі бөлік — бір орбиталь. Түстер толқындық функция фазаларын көрсетеді; олар электр зарядтары емес.','p')];
 if(u.slug==='oxygen-ozone')return[
 card('oxygen','Оттек','Бір молекулада екі оттек атомы бар.','O₂'),
 card('ozone','Озон','Үш атомнан тұратын иілген молекула. Құрамы өзгергендіктен қасиеттері де өзгеше.','O₃')];
 if(u.slug==='bonding-geometry')return[
 card('linear','Сызықтық пішін','CO₂ молекуласында байланыстар бір түзудің бойында. Орталық көміртек үшін sp моделі қолданылады.','sp · 180°'),
 card('trigonal','Жазық үшбұрыш','BF₃ молекуласында үш байланыс бір жазықтықта орналасады.','sp² · 120°'),
 card('tetrahedral','Тетраэдр','CH₄ молекуласында төрт байланыс кеңістікке бағытталады. Арттағы байланыс үзік сызықпен берілген.','sp³ · 109,5°')];
 if(u.slug==='bonding')return[
 card('water','Коваленттік байланыс','H₂O молекуласында атомдар ортақ электрон жұптары арқылы байланысады. O–H байланысы полярлы.','H₂O'),
 card('lattice','Иондық тор','NaCl кристалында Na⁺ пен Cl⁻ иондары кезектеседі. Торда жеке NaCl молекулалары болмайды.','Na⁺ · Cl⁻')];
 if(u.slug==='hydrogen')return[
 card('hydrogen','Сутек молекуласы','Екі сутек атомы бір электрон жұбын ортақтасады.','H₂'),
 card('gas-collect','Газды жинау','Суда аз еритін сутекті суды ығыстыру арқылы жинауға болады. Газды жалынға жақындатпайды.','Zn + 2HCl → ZnCl₂ + H₂↑')];
 if(u.slug==='sulfuric-process')return[
 card('sulfur-dioxide','Бастапқы газ — SO₂','Контакт үдерісінде күкірт диоксиді оттекпен әрекеттеседі.','2SO₂ + O₂ ⇌ 2SO₃'),
 card('catalyst','Катализатор — V₂O₅','Катализатор тепе-теңдікті өзгертпейді; оған жетуді жылдамдатады. SO₃ өнеркәсіпте алдымен H₂SO₄-ке сіңіріледі.','SO₃ → олеум → H₂SO₄')];
 if(u.slug==='analytical-methods')return[
 card('chromatography','Қоспа құрамбөліктерінің бөлінуі','Қағаздағы заттар қозғалмалы және тұрақты фазалармен әртүрлі әрекеттеседі. Сондықтан дақтар әртүрлі қашықтыққа жылжиды.','Бастау сызығы → бөлек дақтар'),
 card('filter','Еріген зат сүзілмейді','Сүзу ерімейтін қатты затты бөледі. Еріген бояуларды бөлу үшін басқа әдіс қажет.','Әдіс зат қасиетіне тәуелді')];
 if(u.slug==='carbon')return[
 card('carbon-dioxide','Көмірқышқыл газы','Көміртек диоксиді — сызықтық молекула, қышқылдық оксид.','CO₂'),
 card('carbonate','Карбонат торы','Кальций карбонаты бор мен әктастың негізгі құрамбөлігі. Қышқыл қосылғанда CO₂ бөлінеді.','CaCO₃ + 2HCl → CaCl₂ + CO₂↑ + H₂O')];
 const scenes={
 separate:[card('filter','Сүзу','Сүзгі қағазы ерімейтін құмды ұстайды. Еріген тұз бен су сүзіндіге өтеді.','Құм қалады → тұзды су өтеді'),card('evaporate','Буландыру','Су буға айналады, еріген тұз ыдыста қалады. Таза суды жинау үшін буды конденсациялау қажет.','Ерітінді → тұз + су буы')],
 states:[card('solid','Қатты күй','Бөлшектер реттелген орындарының маңында тербеледі. Модельдегі әр шар — H₂O молекуласының шартты белгісі.','Мұз'),card('liquid','Сұйық күй','Бөлшектер жақын орналасады, бірақ бір-біріне қатысты орын ауыстырады. Құрамы сақталады.','Су'),card('gas','Газ күйі','Бөлшектер алшақ орналасып, еркін қозғалады. Көрсеткілер қозғалыс бағытын білдіреді.','Су буы')],
 atom:[card('sodium','Бейтарап натрий атомы','Ядро заряды +11; электрондар қабаттар бойынша 2, 8, 1 болып бөлінеді.','Na: 11p⁺, 11e⁻'),card('sodium-ion','Натрий ионы','Бір электрон берілгенде протон саны өзгермейді. Электрон саны 10 болады.','Na → Na⁺ + e⁻')],
 periodic:[card('sodium','Бір сыртқы электрон','Натрийдің үш электрондық қабаты бар, сыртқы қабатында бір электрон орналасқан.','Na · 3-период · 1-топ'),card('chlorine','Жеті сыртқы электрон','Хлордың сыртқы қабатында жеті электрон бар. Толық сыртқы қабатқа бір электрон жетпейді.','Cl · 3-период · 17-топ')],
 formula:[card('water','Индекс атом санын көрсетеді','H₂O формуласындағы 2 саны тек сутекке қатысты. Барлығы үш атом бар.','Mᵣ(H₂O) ≈ 2 × 1 + 16 = 18'),card('carbon-dioxide','Формуладан массаға','CO₂ молекуласында бір көміртек және екі оттек атомы болады.','Mᵣ(CO₂) ≈ 12 + 2 × 16 = 44')],
 combustion:[card('oxygen','Жануды қолдайтын газ','Оттек жануды қолдайды; өзі жанғыш зат емес.','O₂'),card('carbon-dioxide','Толық жанудың бір мысалы','Көміртек оттекпен толық жанғанда көмірқышқыл газы түзіледі. Барлық жану реакциясы тек CO₂ бермейді.','C + O₂ → CO₂')],
 carbon:[card('oxygen','Тыныс алуға қажет оттек','O₂ жасушалық тыныс алу үдерісіне қатысады.','O₂'),card('carbon-dioxide','Түзілген көмірқышқыл газы','CO₂ — жасушалық тыныс алу өнімдерінің бірі; оны өкпе сыртқа шығарады.','O=C=O')],
 mineral:[card('ore','Кен — қоспа','Табиғи кенде пайдалы минералмен бірге бос жыныс болады. Жылтыр бөліктер — пайдалы құрамбөліктің шартты белгісі.','Кен = минералдар + бос жыныс'),card('metal-block','Байыту және металл алу','Байыту пайдалы минерал үлесін арттырады. Металды бөліп алу үшін қосымша химиялық үдеріс қажет.','Кен → концентрат → металл')],
 mass:[card('reactants','Атомдарды санаймыз','Екі H₂ молекуласы мен бір O₂ молекуласында төрт H және екі O атомы бар.','2H₂ + O₂'),card('products','Атомдар қайта топтасады','Екі H₂O молекуласында да төрт H және екі O атомы бар. Жабық жүйеде толық масса сақталады.','→ 2H₂O')],
 metal:[card('metal-block','Металл құрылымы','Металл бөлшектері тор түзеді; делокальданған электрондар электрөткізгіштікке қатысады.','Металдық байланыс'),card('corrosion','Темірдің коррозиясы','Су мен оттек қатысында темірдің бетінде тат түзіледі. Таттың құрамы бір ғана таза оксидпен шектелмейді.','Fe + O₂ + H₂O → тат')],
 mole:[card('oxygen','Қандай бөлшекті санаймыз?','Бір моль O₂ дегеніміз — бір моль молекула. Ондағы оттек атомдарының мөлшері екі мольге тең.','1 моль O₂ → 2 моль O атомы'),card('particle-box','Бір мольдің мағынасы','Көрсетілген бірнеше шар — санақтың шартты үлгісі. Бір мольде дәл 6,02214076 × 10²³ бөлшек бар.','N = nNₐ')],
 gas:[card('gas','Газ көлемі','Бірдей температура мен қысымда бірдей зат мөлшеріндегі идеал газдар бірдей көлем алады.','V = nVₘ'),card('reactants','Көлемдік қатынас','Бірдей T және p кезінде газдардың көлемдік қатынасы теңдеудегі коэффициенттерге сәйкес. Су өнімін бу күйінде қарастырамыз.','2H₂(г) + O₂(г) → 2H₂O(г)')],
 'gas-generation':[card('oxygen','Оттек молекуласы','Оттек суда аз ериді. Оны суды ығыстыру арқылы жинауға болады.','O₂'),card('gas-collect','Газды жинайтын қондырғы','Су ішіндегі төңкерілген ыдысқа газ келгенде су сыртқа ығысады.','2H₂O₂ → 2H₂O + O₂↑')],
 energy:[card('exo','Экзотермиялық үдеріс','Жылу жүйеден қоршаған ортаға беріледі. Өнімдердің энтальпиясы реагенттерден төмен.','ΔH < 0'),card('endo','Эндотермиялық үдеріс','Жүйе қоршаған ортадан жылу жұтады. Өнімдердің энтальпиясы реагенттерден жоғары.','ΔH > 0')],
 thermodynamics:[card('ordered','Реттелген күй','Бөлшектер орналасуының мүмкін нұсқалары салыстырмалы түрде аз. Бұл — энтропияны түсіндіретін сапалық модель.','S — күй функциясы'),card('gas','Көбірек таралу мүмкіндігі','Газда бөлшектердің орналасу нұсқалары көп. Үдерістің бағытын тек энтропиямен анықтамаймыз.','ΔG = ΔH − TΔS')],
 solubility:[card('lattice','Ерігенге дейін','NaCl кристалы — қарама-қарсы зарядталған иондар торы.','NaCl(қ)'),card('ions','Ерігеннен кейін','Суда Na⁺ және Cl⁻ гидратталған иондар түрінде таралады. Шарлардың арасы шартты үлкейтілген.','NaCl(қ) → Na⁺(aq) + Cl⁻(aq)')],
 ions:[card('lattice','Кристалдағы иондар','Қатты NaCl-дағы иондар торда орныққан; еркін орын ауыстыра алмайды.','NaCl(қ)'),card('ions','Ерітіндідегі иондар','Суда тор бұзылып, иондар қозғала алады. Ерітіндіде токты электрондар емес, иондар тасымалдайды.','Na⁺(aq), Cl⁻(aq)')],
 precipitate:[card('ions','Ерітіндіде араласу','Иондар ерітіндіде қозғалады. Барлық ион жұбы міндетті түрде тұнба түзбейді.','Ag⁺(aq) + Cl⁻(aq)'),card('precipitate','Тұнба түзілуі','Күміс пен хлорид иондары нашар еритін ақ AgCl тұнбасын түзеді.','Ag⁺ + Cl⁻ → AgCl↓')],
 acid:[card('acid','Қышқыл орта','Суда H₃O⁺ концентрациясы OH⁻ концентрациясынан жоғары. Лакмустың түсі қызыл.','25 °C: pH < 7'),card('base','Сілтілік орта','OH⁻ концентрациясы H₃O⁺ концентрациясынан жоғары. Лакмустың түсі көк.','25 °C: pH > 7')],
 oxide:[card('carbon-dioxide','Бейметалл оксиді','CO₂ — қышқылдық оксид. Сумен тепе-теңдікте көмір қышқылын түзеді.','CO₂ + H₂O ⇌ H₂CO₃'),card('oxide-lattice','Металл оксиді','MgO — негіздік оксид, иондық тор түзеді. Қышқылмен тұз және су береді.','MgO + 2HCl → MgCl₂ + H₂O')],
 hardness:[card('hard-water','Кермектіктің себебі','Суда еріген кальций және магний иондары кермектік туғызады. Барлық еріген тұз кермектік бермейді.','Ca²⁺, Mg²⁺'),card('scale','Қақ қалай түзіледі?','Уақытша кермек суды қайнатқанда ерімейтін карбонат тұнбасы түсуі мүмкін.','Ca(HCO₃)₂ → CaCO₃↓ + CO₂↑ + H₂O')],
 hydrolysis:[card('acid','Қышқыл орта беретін тұз','NH₄Cl ерітіндісінде NH₄⁺ сумен әрекеттесіп, H₃O⁺ түзеді.','NH₄⁺ + H₂O ⇌ NH₃ + H₃O⁺'),card('base','Сілтілік орта беретін тұз','Na₂CO₃ ерітіндісінде CO₃²⁻ сумен әрекеттесіп, OH⁻ түзеді.','CO₃²⁻ + H₂O ⇌ HCO₃⁻ + OH⁻')],
 spectrum:[card('flame','Натрийді жалынмен анықтау','Натрий қосылыстары жалынды сары түске бояйды. Бақылау басқа иондармен және бақылау үлгісімен салыстырылады.','Na → сары жалын'),card('precipitate','Хлорид ионын анықтау','Сұйылтылған HNO₃-пен қышқылдандырылған үлгіге AgNO₃ қосқанда ақ AgCl түзіледі.','Ag⁺ + Cl⁻ → AgCl↓')],
 stoichiometry:[card('reactants','Теңдеудегі қатынас','Сутек пен оттек 2:1 молекулалық қатынаста әрекеттеседі.','2H₂ + O₂'),card('products','Өнім мөлшерін анықтау','Шектеуші реагент теориялық өнім мөлшерін анықтайды. Нақты шығым 100%-дан төмен болуы мүмкін.','2H₂O · η = m(нақты)/m(теория)')],
 rate:[card('collision','Бөлшектер соқтығысады','Тиімді соқтығысу үшін энергия мен дұрыс бағдар қажет. Әр соқтығыс реакцияға әкелмейді.','T ↑ → тиімді соқтығысу жиілейді'),card('catalyst','Катализатор әсері','Катализатор белсендіру энергиясы төмен басқа жол ұсынады. Реакция соңында өзі қалпына келеді.','Eₐ төмендейді')],
 equilibrium:[card('forward','Тура реакция','Реагенттер өнімге айналады. Жабық жүйеде қайтымды реакция қарастырылады.','N₂ + 3H₂ → 2NH₃'),card('reverse','Кері реакция','Тепе-теңдікте екі реакция да жалғасады, олардың жылдамдықтары тең. Концентрациялар міндетті түрде тең емес.','2NH₃ → N₂ + 3H₂')],
 redox:[card('oxidation','Тотығу — электрон беру','Мырыш атомы екі электрон беріп, Zn²⁺ ионына айналады.','Zn → Zn²⁺ + 2e⁻'),card('reduction','Тотықсыздану — электрон қосу','Мыс ионы екі электрон қосып алып, металл мысқа айналады.','Cu²⁺ + 2e⁻ → Cu')],
 cell:[card('galvanic','Электрондар сыртқы тізбекте','Zn–Cu элементінде электрондар мырыш анодынан мыс катодына сым арқылы өтеді.','Zn → Zn²⁺ + 2e⁻'),card('ions','Иондар ерітіндіде','Тұз көпірі заряд теңгерімін ұстайды. Электрондар ерітінді арқылы анодтан катодқа өтпейді.','Cu²⁺ + 2e⁻ → Cu')],
 electrolysis:[card('electrolysis','Сыртқы ток көзі қажет','Еритін мыс аноды бар CuSO₄ ерітіндісінде Cu²⁺ катодта тотықсызданады. Катод — теріс электрод.','Катод: Cu²⁺ + 2e⁻ → Cu'),card('copper-coat','Мыс қабатын тұндыру','Анодтағы мыс ериді, катодтағы бұйым мыс қабатымен қапталады.','Анод: Cu → Cu²⁺ + 2e⁻')],
 halogen:[card('chlorine-molecule','Хлор молекуласы','Cl₂ молекуласында екі хлор атомы ортақ электрон жұбымен байланысады.','Cl₂'),card('chloride','Хлорид ионы','Cl⁻ — бір электрон қосып алған бөлшек. Оның қасиеті улы хлор газынан өзгеше.','Cl₂ + 2e⁻ → 2Cl⁻')],
 sulfur:[card('sulfur-ring','Күкірттің бір түрі','Қалыпты жағдайдағы ромбалық күкірт S₈ сақина молекулаларынан тұрады.','S₈'),card('sulfur-dioxide','Күкірт диоксиді','SO₂ — иілген молекула. Қышқылдық оксид, тыныс алу мүшелеріне зиянды газ.','S + O₂ → SO₂')],
 ammonia:[card('nitrogen','Азот молекуласы','Екі азот атомының арасындағы үштік байланыс берік.','N≡N'),card('ammonia','Аммиак пішіні','NH₃ молекуласы үшбұрышты пирамида тәрізді; азотта бір бөлінбеген электрон жұбы бар.','N₂ + 3H₂ ⇌ 2NH₃')],
 fertilizer:[card('plant','Өсімдікке қажет элементтер','Азот, фосфор, калий өсімдік дамуына қажет. Тыңайтқыш мөлшері топырақ талдауына сай таңдалады.','N · P · K'),card('runoff','Артық тыңайтқыштың жолы','Артық нитраттар мен фосфаттар суға түскенде балдырлар көбейіп, оттек тапшылығы туындауы мүмкін.','Артық қорек → эвтрофикация')],
 material:[card('silica','Кеңістіктік тор','SiO₂-де кремний мен оттек атомдары тұтас коваленттік тор түзеді. Жеке SiO₂ молекулалары ретінде қарастырмаймыз.','Si–O торының фрагменті'),card('surface','Өлшем кішірейгенде','Бірдей көлем ұсақ бөлшектерге бөлінсе, жалпы бет ауданы ұлғаяды. Бұл наноматериалдар қасиетіне әсер етеді.','Көлем бірдей → бет ауданы артады')],
 ecology:[card('pollution','Ластаушының таралуы','Ауыр металл иондары су арқылы таралуы мүмкін. Оларды түсіне қарап сенімді анықтай алмаймыз.','Үлгі алу → концентрацияны өлшеу'),card('recycle','Қайта өңдеу','Металл қалдығын бөлек жинау бастапқы кенге сұранысты азайтады. Экологиялық әсер энергия шығынына да тәуелді.','Жинау → сұрыптау → қайта пайдалану')],
 buffer:[card('buffer-acid','Қышқыл қосылғанда','Ацетат ионы қосылған H₃O⁺-ты байланыстырады. Буфер сыйымдылығы шектеулі.','CH₃COO⁻ + H₃O⁺ → CH₃COOH + H₂O'),card('buffer-base','Негіз қосылғанда','Сірке қышқылы қосылған OH⁻-ты бейтараптайды. pH аз өзгереді.','CH₃COOH + OH⁻ → CH₃COO⁻ + H₂O')],
 titration:[card('burette','Тамшылатып қосу','Белгілі концентрациялы титрант бюреткадан колбаға қосылады. Әр қосқаннан кейін ерітінді араластырылады.','n(H⁺) = n(OH⁻)'),card('endpoint','Соңғы нүктені байқау','Фенолфталеиннің әлсіз қызғылт түсі — соңғы нүкте белгісі. Ол эквивалент нүктемен дәл бір ұғым емес.','H₃O⁺ + OH⁻ → 2H₂O')],
 complex:[card('complex','Орталық ион және лигандтар','[Cu(H₂O)₆]²⁺ моделінде мыс ионына алты су лиганды оттек атомы арқылы байланысады.','Координациялық сан — 6'),card('complex-change','Лиганд алмасу','Аммиак қосқанда көк түс қоюланады: [Cu(NH₃)₄(H₂O)₂]²⁺ түзіледі. Модельде төрт NH₃ пен екі H₂O көрсетілген.','[Cu(NH₃)₄(H₂O)₂]²⁺')]
 };
 const result=scenes[f];if(!result)throw Error('Missing teaching visual: '+u.slug);
 return result;
}
const palette={H:['#fff','#cbd8e6','#71859b'],O:['#ffc6bb','#e85643','#8d251f'],C:['#aabacc','#435970','#1d2c40'],N:['#badcff','#4d8ade','#244a8a'],Cl:['#d9f7aa','#7aa745','#3c6421'],S:['#fff5ac','#e3bc35','#9f7116'],Na:['#eadcff','#a48bd2','#65508f'],Cu:['#ffd6a3','#d7904d','#93532b'],Si:['#f6d2b6','#c19a78','#795b48'],ion:['#c3eff7','#51afc1','#246a80'],p:['#ffdbcd','#e98066','#a94330'],n:['#cfe8fb','#8cabc7','#4d6b88']};
function drawing(kind,prefix){
 const url=k=>'url(#'+prefix+'-'+k+')';
 const sphere=(x,y,r,key='ion',label='')=>'<g><circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+url(key)+'" stroke="'+palette[key][2]+'" stroke-width=".7"/>'+ (label?'<text x="'+x+'" y="'+(y+5)+'" text-anchor="middle" fill="'+(key==='H'?'#243c51':'#fff')+'" font-size="'+(r<20||String(label).length>2?12:17)+'" font-weight="700" stroke="'+(key==='H'?'#fff':palette[key][2])+'" stroke-width="2" paint-order="stroke">'+esc(label)+'</text>':'')+'</g>';
 const rod=(x,y,a,b,dashed=false)=>'<line x1="'+x+'" y1="'+y+'" x2="'+a+'" y2="'+b+'" stroke="#57778b" stroke-width="10" stroke-linecap="round"'+(dashed?' stroke-dasharray="3 14"':'')+'/>'+'<line x1="'+(x-2)+'" y1="'+(y-2)+'" x2="'+(a-2)+'" y2="'+(b-2)+'" stroke="#d5e7ee" stroke-width="3" stroke-linecap="round"'+(dashed?' stroke-dasharray="3 14"':'')+'/>';
 const text=(x,y,t,size=16)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="'+size+'" font-weight="650" fill="#24485e">'+esc(t)+'</text>';
 const arrow=(x,y,a,b,c='#237e83')=>'<path d="M'+x+' '+y+' L'+a+' '+b+'" fill="none" stroke="'+c+'" stroke-width="3" marker-end="'+url('arrow')+'"/>';
 const water=(x=120,y=100,scale=1)=>'<g transform="translate('+x+' '+y+') scale('+scale+')">'+rod(0,0,-40,34)+rod(0,0,40,34)+sphere(0,0,24,'O','O')+sphere(-40,34,16,'H','H')+sphere(40,34,16,'H','H')+'</g>';
 const diatom=(key,label=key,x=120,y=103,scale=1,triple=false)=>'<g transform="translate('+x+' '+y+') scale('+scale+')">'+rod(-32,0,32,0)+(triple?'<path d="M-32 -10H32 M-32 10H32" stroke="#496780" stroke-width="3"/>':'')+sphere(-32,0,27,key,label)+sphere(32,0,27,key,label)+'</g>';
 const glass=(color='#a9dce9',sediment=false)=>'<ellipse cx="120" cy="184" rx="76" ry="12" fill="#224a62" opacity=".1"/><path d="M55 46V162Q55 182 120 182T185 162V46" fill="'+url('glass')+'" stroke="#6f9bab" stroke-width="2"/><path d="M59 95V160Q59 178 120 178T181 160V95Z" fill="'+color+'" opacity=".5"/><ellipse cx="120" cy="95" rx="61" ry="11" fill="'+color+'" opacity=".75"/>'+(sediment?'<path d="M62 157Q120 169 178 157V166Q120 183 62 166Z" fill="#f5f2e9" stroke="#b8b3a3"/>':'')+'<ellipse cx="120" cy="46" rx="65" ry="12" fill="none" stroke="#6f9bab" stroke-width="2"/><path d="M67 57V149" stroke="white" opacity=".8" stroke-width="5"/><path d="M164 115h14m-14 20h14m-14 20h14" stroke="#638c9b" stroke-width="2"/>';
 const salt=(oxide=false)=>{let b='';for(let z=0;z<2;z++)for(let y=0;y<3;y++)for(let x=0;x<3;x++){let px=60+x*42+z*23,py=64+y*39-z*15,k=(x+y+z)%2===0; b+=sphere(px,py,k?15:19,k?'Na':oxide?'O':'Cl',oxide?(k?'Mg²⁺':'O²⁻'):(k?'Na⁺':'Cl⁻'));}return b;};
 const scatter=(label1='Na⁺',label2='Cl⁻')=>glass()+[[82,120],[145,126],[104,154],[158,157]].map(([x,y],i)=>sphere(x,y,15,i%2?'Cl':'Na',i%2?label2:label1)).join('');
 const ammonia=(x=120,y=104,s=1)=>'<g transform="translate('+x+' '+y+') scale('+s+')">'+rod(0,0,45,37)+rod(0,0,-45,37)+rod(0,0,0,64,true)+sphere(0,0,24,'N','N')+sphere(45,37,15,'H','H')+sphere(-45,37,15,'H','H')+sphere(0,64,18,'H','H')+sphere(-6,-32,3,'N')+sphere(6,-32,3,'N')+'</g>';
 const co2=()=>rod(57,104,183,104)+'<path d="M60 94H180" stroke="#7b92a5" stroke-width="3"/>'+sphere(58,104,27,'O','O')+sphere(120,104,25,'C','C')+sphere(182,104,27,'O','O');
 let body='';
 if(['water','oxygen','hydrogen','nitrogen','chlorine-molecule','carbon-dioxide','linear','ozone','sulfur-dioxide','ammonia','trigonal','tetrahedral'].includes(kind)){
  if(kind==='water')body=water();
  else if(kind==='oxygen')body=diatom('O');
  else if(kind==='hydrogen')body=diatom('H');
  else if(kind==='nitrogen')body=diatom('N','N',120,103,1,true);
  else if(kind==='chlorine-molecule')body=diatom('Cl');
  else if(kind==='carbon-dioxide'||kind==='linear')body=co2();
  else if(kind==='ammonia')body=ammonia();
  else if(kind==='ozone'||kind==='sulfur-dioxide')body=rod(120,80,62,129)+rod(120,80,178,129)+sphere(120,80,26,kind==='ozone'?'O':'S',kind==='ozone'?'O':'S')+sphere(62,129,25,'O','O')+sphere(178,129,25,'O','O');
  else if(kind==='trigonal')body=[[120,44],[60,149],[180,149]].map(([x,y])=>rod(120,112,x,y)).join('')+sphere(120,112,25,'Si','B')+[[120,44],[60,149],[180,149]].map(([x,y])=>sphere(x,y,23,'Cl','F')).join('');
  else body=rod(120,101,120,38)+rod(120,101,59,139)+rod(120,101,178,135,true)+rod(120,101,130,168)+sphere(178,135,14,'H','H')+sphere(120,38,18,'H','H')+sphere(59,139,19,'H','H')+sphere(120,101,27,'C','C')+sphere(130,168,21,'H','H');
 }else if(['solid','liquid','gas','ordered','particle-box'].includes(kind)){
  body='<path d="M42 47L67 30H200V161L175 181H42Z" fill="#d8eff5" opacity=".38" stroke="#79a6b5"/><path d="M42 47H175V181 M175 47L200 30" fill="none" stroke="#89acb9"/>';
  const pts=kind==='gas'?[[72,64],[154,72],[92,129],[161,151]]:kind==='liquid'?[[65,142],[99,151],[130,141],[158,151],[80,116],[116,112],[150,116]]:Array.from({length:9},(_,i)=>[67+i%3*42,80+Math.floor(i/3)*34]);
  body+=pts.map(([x,y],i)=>sphere(x,y,kind==='gas'?10:13,'ion')+(kind==='gas'?arrow(x+11,y,x+24,y-13):'')).join('');
 }else if(['sodium','sodium-ion','chlorine','atom','carbon12','carbon14'].includes(kind)){
  if(kind==='atom')body=sphere(120,105,52,'ion','He');
  else if(kind==='carbon12'||kind==='carbon14'){const n=kind==='carbon12'?12:14;body=Array.from({length:n},(_,i)=>{const angle=i*2.4,r=11*Math.sqrt(i);return sphere(120+Math.cos(angle)*r,105+Math.sin(angle)*r,11,i<6?'p':'n',i<6?'p':'n');}).join('')+text(120,185,kind==='carbon12'?'6p⁺ · 6n⁰':'6p⁺ · 8n⁰');}
  else{const cl=kind==='chlorine',ion=kind==='sodium-ion',shells=ion?[2,8]:cl?[2,8,7]:[2,8,1];body=sphere(120,104,21,'p',cl?'+17':'+11');shells.forEach((n,j)=>{let r=35+j*23;body+='<ellipse cx="120" cy="104" rx="'+r+'" ry="'+r*.8+'" fill="none" stroke="#aec4d4" stroke-width="1.5"/>';for(let i=0;i<n;i++){const a=i/n*Math.PI*2;body+=sphere(120+Math.cos(a)*r,104+Math.sin(a)*r*.8,4.5,'N');}});}
 }else if(kind==='chromatography')body='<path d="M45 35V176H195V35" fill="'+url('glass')+'" stroke="#7199a8" stroke-width="2"/><path d="M75 20H165V170H75Z" fill="#fff9e9" stroke="#ccbc9d"/><path d="M46 157H194V174H46Z" fill="#a6d5e3"/><path d="M78 144H162 M78 53H162" stroke="#708a9a" stroke-width="1.5" stroke-dasharray="4 4"/>'+sphere(120,82,9,'N')+sphere(120,115,9,'O')+text(120,199,'Бастау сызығы — 144',12);
 else if(kind==='carbonate')body=rod(153,104,153,48)+rod(153,104,104,139)+rod(153,104,203,139)+sphere(153,104,19,'C','C')+[[153,48],[104,139],[203,139]].map(([x,y])=>sphere(x,y,19,'O','O')).join('')+sphere(44,104,26,'ion','Ca²⁺')+text(153,182,'CO₃²⁻',18);
 else if(kind==='s-orbital')body='<circle cx="120" cy="105" r="67" fill="'+url('ion')+'" opacity=".5"/>'+sphere(120,105,12,'p','+')+text(120,192,'Сфералық ықтималдық бұлты',13);
 else if(kind==='p-orbital')body='<ellipse cx="120" cy="63" rx="33" ry="47" fill="'+url('N')+'" opacity=".75"/><ellipse cx="120" cy="147" rx="33" ry="47" fill="'+url('O')+'" opacity=".75"/>'+sphere(120,105,7,'p')+text(120,64,'+')+text(120,153,'−');
 else if(kind==='lattice'||kind==='oxide-lattice')body=salt(kind==='oxide-lattice');
 else if(['ions','hard-water','chloride'].includes(kind))body=kind==='chloride'?sphere(120,105,50,'Cl','Cl⁻'):scatter(kind==='hard-water'?'Ca²⁺':'Na⁺',kind==='hard-water'?'Mg²⁺':'Cl⁻');
 else if(['acid','base','precipitate','scale','buffer-acid','buffer-base','endpoint'].includes(kind)){
  const acid=kind==='acid'||kind==='buffer-acid',base=kind==='base'||kind==='buffer-base',pink=kind==='endpoint';
  body=glass(pink?'#efb5d1':acid?'#ecb6c7':base?'#9cbcf4':'#b8e0e7',kind==='precipitate'||kind==='scale');
  if(acid||base)body+='<path d="M112 25H130V130H112Z" fill="'+(acid?'#b33e58':'#3c63ad')+'" stroke="white" stroke-width="2"/>'+text(120,162,acid?'H₃O⁺':'OH⁻');
 }else if(kind==='filter')body='<path d="M76 128V164Q76 181 120 181T164 164V128" fill="'+url('glass')+'" stroke="#6793a4" stroke-width="2"/><ellipse cx="120" cy="150" rx="42" ry="8" fill="#b1dce7"/><path d="M49 46L112 110V130H128V110L191 46Z" fill="#dcecf0" stroke="#7296a4" stroke-width="2"/><path d="M64 49L120 104L176 49" fill="#eee0bd" stroke="#b9a57a" stroke-width="2"/><ellipse cx="120" cy="46" rx="71" ry="12" fill="#f5ebd0" stroke="#ac9870"/>'+[89,110,136,149].map((x,i)=>sphere(x,48+(i%2)*8,6,'Si')).join('')+'<path d="M120 134v7" stroke="#4fa4c1" stroke-width="4"/>';
 else if(kind==='evaporate')body=glass('#a4d4e3',true)+'<path d="M95 32q-15-13 0-27m27 27q15-13 0-27m27 27q-15-13 0-27" stroke="#82a8b8" stroke-width="3" fill="none"/>'+arrow(120,207,120,185,'#d17634');
 else if(kind==='reactants')body=diatom('H','H',77,74,.65)+diatom('H','H',77,149,.65)+diatom('O','O',175,111,.65);
 else if(kind==='products')body=water(79,88,.75)+water(171,123,.75);
 else if(['metal-block','ore','corrosion','copper-coat','recycle'].includes(kind)){
  const copper=kind==='copper-coat',rust=kind==='corrosion',ore=kind==='ore';
  body='<path d="M49 92L107 57L195 84L139 121Z" fill="'+(copper?'#e4ae75':'#b4c7d8')+'" stroke="#7691a5"/><path d="M49 92V151L139 179V121Z" fill="'+(copper?'#bb7339':'#849db3')+'" stroke="#657f95"/><path d="M139 121L195 84V143L139 179Z" fill="'+(copper?'#975329':'#536d84')+'" stroke="#536e85"/>';
  if(ore||rust)body+=[[74,108],[100,128],[160,122],[88,151],[173,106]].map(([x,y])=>sphere(x,y,ore?9:7,ore?'Cu':'Si')).join('');
  if(kind==='recycle')body+='<path d="M52 50Q115 3 186 47 M190 49l-2-18m2 18l-19-1" fill="none" stroke="#2b8a78" stroke-width="5"/>';
 }else if(kind==='gas-collect')body='<path d="M34 136V183H209V136" fill="#b8e0ea" stroke="#7099ac" stroke-width="2"/><path d="M98 161V42Q98 23 128 23T158 42V161" fill="'+url('glass')+'" stroke="#7198a9" stroke-width="2"/><path d="M102 105H154V155H102Z" fill="#9accdf"/><ellipse cx="128" cy="105" rx="26" ry="5" fill="#7db8cd"/><path d="M27 106H70V166H119V144" fill="none" stroke="#6393a7" stroke-width="5"/>'+[70,83,94].map((y,i)=>sphere(119+i*7,y,4,'ion')).join('')+text(128,65,'газ');
 else if(['exo','endo'].includes(kind)){
  body=glass('#b0dce7')+text(120,135,'Жүйе');body+=kind==='exo'?arrow(65,85,18,65)+arrow(176,85,222,65):arrow(18,65,65,85)+arrow(222,65,176,85);
  body+=text(120,24,kind==='exo'?'Жылу сыртқа бөлінеді':'Жылу ішке жұтылады');
 }else if(kind==='collision')body=diatom('H','H',68,102,.6)+diatom('Cl','Cl',174,102,.6)+arrow(75,48,102,65)+arrow(167,48,140,65)+'<path d="M112 91l7 11-9 8 14 8 8-10" fill="none" stroke="#d19a31" stroke-width="3"/>';
 else if(kind==='catalyst')body='<path d="M23 166H216 M35 175V30" stroke="#799cac" stroke-width="2"/><path d="M36 146Q102-61 203 145" stroke="#c87e53" stroke-width="3" fill="none"/><path d="M36 146Q110 34 203 145" stroke="#248b83" stroke-width="4" fill="none"/>'+text(126,31,'Eₐ жоғары',13)+text(128,108,'Eₐ төмен',13);
 else if(kind==='forward'||kind==='reverse')body=diatom('N','N',64,84,.55,true)+diatom('H','H',64,147,.55)+ammonia(181,94,.6)+(kind==='forward'?arrow(91,48,153,48):arrow(153,48,91,48));
 else if(kind==='oxidation'||kind==='reduction')body=sphere(74,105,30,kind==='oxidation'?'ion':'Cu',kind==='oxidation'?'Zn':'Cu²⁺')+sphere(178,105,30,kind==='oxidation'?'ion':'Cu',kind==='oxidation'?'Zn²⁺':'Cu')+arrow(92,48,160,48)+text(126,33,kind==='oxidation'?'−2e⁻':'+2e⁻')+arrow(114,105,137,105);
 else if(kind==='galvanic'||kind==='electrolysis')body='<path d="M28 99V171H99V99 M143 99V171H214V99" fill="#b6deea" stroke="#769cad" stroke-width="2"/><path d="M59 136V48H182V136" fill="none" stroke="#a07d58" stroke-width="10"/><path d="M89 131V91H155V131" fill="none" stroke="#a2c9b6" stroke-width="9"/>'+text(59,192,kind==='galvanic'?'Zn анод':'Cu анод',13)+text(181,192,'Катод',13)+arrow(96,28,155,28)+text(120,18,kind==='galvanic'?'e⁻ →':'Ток көзі · +  −',13);
 else if(kind==='flame')body='<path d="M120 30C101 62 76 91 80 126C82 158 157 166 161 123C166 93 131 74 120 30Z" fill="#f3b93b"/><path d="M122 72C110 99 94 118 106 140C125 163 150 131 135 110Z" fill="#fff1ad"/><path d="M90 173H151V194H90Z M113 148H129V175H113Z" fill="#7d97a8"/>'+text(120,18,'Сары жалын',14);
 else if(kind==='sulfur-ring'){let pts=Array.from({length:8},(_,i)=>[120+Math.cos(i*Math.PI/4)*69,103+Math.sin(i*Math.PI/4)*45+(i%2)*12]);body=pts.map(([x,y],i)=>rod(x,y,...pts[(i+1)%8])).join('')+pts.map(([x,y])=>sphere(x,y,17,'S','S')).join('');}
 else if(['plant','runoff','pollution'].includes(kind))body='<path d="M24 147Q83 131 120 149T218 146V188H24Z" fill="#abcde0"/><path d="M22 144L47 113L86 123L105 144Z" fill="#b5cfa8"/><path d="M65 118V68M65 91Q28 91 43 67Q67 67 65 91M65 102Q100 96 91 77Q65 77 65 102" fill="#70a276" stroke="#467951" stroke-width="3"/>'+arrow(96,123,157,148)+[143,165,187].map((x,i)=>sphere(x,164-i%2*9,8,kind==='pollution'?'Cu':'N')).join('');
 else if(kind==='silica'){
  body=rod(120,101,120,35)+rod(120,101,56,143)+rod(120,101,182,140,true)+rod(120,101,127,174)+[[120,35],[56,143],[182,140],[127,174]].map(([x,y])=>sphere(x,y,20,'O','O')).join('')+sphere(120,101,27,'Si','Si');
 }else if(kind==='surface')body=sphere(61,107,36,'ion')+arrow(106,105,135,105)+[[157,75],[188,75],[157,107],[188,107],[157,139],[188,139],[146,91],[176,91]].map(([x,y])=>sphere(x,y,18,'ion')).join('');
 else if(kind==='burette')body='<path d="M115 15H130V99L124 115L119 99Z" fill="'+url('glass')+'" stroke="#7b9cab" stroke-width="2"/><path d="M118 35H127V90H118Z" fill="#bddae6"/><path d="M112 100H136" stroke="#7893a5" stroke-width="4"/>'+sphere(123,126,4,'ion')+'<path d="M102 137V151L75 182Q120 199 166 182L139 151V137Z" fill="'+url('glass')+'" stroke="#749bab" stroke-width="2"/><path d="M88 173Q123 164 154 173L162 182Q120 193 79 182Z" fill="#c4e4ed"/>';
 else if(kind==='complex'||kind==='complex-change'){
  const pts=[[120,37],[70,76],[173,79],[65,139],[177,143],[123,177]];
  body=pts.map(([x,y],i)=>rod(120,105,x,y,i===2)).join('')+pts.map(([x,y],i)=>{
   const key=kind==='complex-change'&&i<4?'N':'O';
   return sphere(x,y,17,key,key==='N'?'NH₃':'H₂O');
  }).join('')+sphere(120,105,25,'Cu','Cu²⁺');
 }else throw Error('Unknown scene '+kind);
 const defs=Object.entries(palette).map(([k,cs])=>'<radialGradient id="'+prefix+'-'+k+'" cx="30%" cy="24%" r="80%"><stop stop-color="'+cs[0]+'"/><stop offset=".5" stop-color="'+cs[1]+'"/><stop offset="1" stop-color="'+cs[2]+'"/></radialGradient>').join('')+'<linearGradient id="'+prefix+'-glass"><stop stop-color="#d5edf4" stop-opacity=".5"/><stop offset=".45" stop-color="white" stop-opacity=".2"/><stop offset="1" stop-color="#8ebacb" stop-opacity=".45"/></linearGradient><marker id="'+prefix+'-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#237e83"/></marker>';
 return {defs,body};
}
export function renderSchoolVisual(u){
 const cards=visualCards(u),base='sv-'+u.slug.replace(/[^a-z0-9-]/g,'');
 return '<figure class="school-visual" data-school-visual="'+esc(u.slug)+'"><figcaption class="school-visual-heading"><span>КӨРІП ТҮСІН</span><h3>'+esc(u.title)+'</h3><p>Көлемді модельдерді салыстырыңыз. Әр суреттің астындағы түсіндірме оның негізгі ойын ашады.</p></figcaption><div class="school-visual-grid">'+cards.map((c,i)=>{
  const id=base+'-'+i,{defs,body}=drawing(c.kind,id);
  return '<article class="school-visual-card" data-visual-kind="'+c.kind+'"><div class="school-visual-stage"><span class="school-visual-number">0'+(i+1)+'</span><svg viewBox="0 0 240 220" role="img" aria-labelledby="'+id+'-title '+id+'-desc"><title id="'+id+'-title">'+esc(c.title)+'</title><desc id="'+id+'-desc">'+esc(c.text)+'</desc><defs>'+defs+'</defs><ellipse cx="120" cy="193" rx="78" ry="10" fill="#153f59" opacity=".07"/>'+body+'</svg></div><div class="school-visual-copy"><h4>'+esc(c.title)+'</h4><p>'+esc(c.text)+'</p><strong>'+esc(c.formula)+'</strong></div></article>';
 }).join('')+'</div><p class="school-visual-note">Шарлар, түстер және өлшемдер — шартты белгілер. Бұл көлем әсерімен берілген оқу сызбалары; атомдар мен бөлшектердің нақты фотосуреті емес. Молекула моделінде шардағы таңба элементті, сызық химиялық байланысты білдіреді. Электрондық қабат сызбасындағы шеңберлер нақты қозғалыс траекториясын көрсетпейді.</p></figure>';
}
