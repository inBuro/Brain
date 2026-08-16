# GrooveMix — research

Связанный документ: `ARCHITECTURE.md` (спека продукта и техническая архитектура).

## Конкурентный ландшафт (ресёрч 2026-08-02)

Прямых конкурентов не найдено — паттерн "живой кроссфейд + EQ между двумя уже открытыми
пользователем YouTube-вкладками" никто не делает. Ближайшие продукты решают ту же боль
другой архитектурой:

- **DJ7X** (dj.7x.network) — веб-апп, две YouTube-деки, кроссфейдер. Разработчик сам пишет
  в FAQ, что EQ невозможен: YouTube-iframe сэндбоксит аудио, веб-страница не может применить
  EQ/фильтры к этому потоку. Подтверждает: подход GrooveMix (`<video>` → MediaElementSource
  в контент-скрипте на реальной вкладке, а не iframe-embed) — единственный, дающий EQ технически.
- **MixYouTube** (mixyoutube.com) — веб-апп, paste-URL в свой интерфейс вместо работы с уже
  открытыми табами пользователя.
- **YouDJ** (you.dj, 100M+ использований) — доминирующий бренд, полноценная DJ-платформа
  (EQ/BPM/MIDI), но отдельный веб-апп, не расширение поверх существующих вкладок.
- **DualWield Audio** (Chrome, 258 польз.) — единственное найденное расширение, реально
  работающее с двумя независимыми вкладками одновременно, но это стерео-разводка по ушам
  (левое/правое ухо), не блендинг: без кроссфейдера, без EQ.
- **PostDJ** (GitHub, непубличный, 4★) — архитектурно ближе всего технически (Web Audio API
  инжект в контент-скрипт на реальных табах, popup UI), но без кроссфейдера, EQ, клавиатуры.
- Прочее найденное и отсеянное как нерелевантное: Music mixer DJMusic (embed своих плееров,
  не работает с чужими табами), YouTube DJ effects/EQ (одна вкладка, без второй деки),
  TabCrossfade (авто-фейд при переключении таба, не одновременный микс), YouTube Playlist
  Crossfade (кроссфейд между треками плейлиста в одном плеере).

Незанятые ниши, подтверждающие дифференциацию v1:
1. EQ на реально открытой YouTube-вкладке (не iframe) — не делает никто.
2. Автоопределение звучащего таба (`chrome.tabs.query({audible:true})`) — не встречается.
3. Клавиатура как основной интерфейс кроссфейдера — не встречается.
4. Состояние живёт в табе, попап можно закрыть — не задокументировано ни у кого.
5. Сценарий "два человека, один комп, кто-то уже слушает, второй подмешивается" — не
   встречается в позиционировании ни одного найденного продукта.

Риск — не прямая конкуренция, а SEO: по запросу "mix two youtube tabs" пользователь скорее
найдёт DJ7X/MixYouTube (веб-аппы без установки), чем расширение. В копирайтинге стоит явно
доносить, почему EQ вообще возможен именно потому, что это расширение на реальном табе,
а не iframe-обёртка.

### Источники

- [DJ7X](https://dj.7x.network/)
- [MixYouTube](https://mixyoutube.com/)
- [YouDJ](https://you.dj/)
- [YouTube DJ effects – Chrome-версия YouDJ](https://chromewebstore.google.com/detail/youtube-dj-effects-eq-vol/defekohaofmambflfpfoojkmfdpcbgko)
- [DualWield Audio – Chrome](https://chromewebstore.google.com/detail/dualwield-audio/mkfabhjncjhimildocpcplafjcaalpop)
- [Music mixer DJMusic – Chrome](https://chromewebstore.google.com/detail/music-mixer-djmusic/glmigelhhlcmgddgkjfndfkdefddgbpd)
- [Music mixer DJMusic – Firefox](https://addons.mozilla.org/en-US/firefox/addon/music-mixer-djmusic/)
- [YouTube Playlist Crossfade – Chrome](https://chromewebstore.google.com/detail/youtube-playlist-crossfad/neejhalakjileeheglgcfmfjgkjieojp)
- [TabCrossfade – Firefox](https://addons.mozilla.org/en-US/firefox/addon/tabcrossfade/)
- [Crossfade – Smart Media Control – Chrome](https://chromewebstore.google.com/detail/crossfade-%E2%80%93-smart-media-c/nmcbnpbikhddhjegdiooblaglmpkjjip)
- [PostDJ – GitHub](https://github.com/lhj-lhj/PostDJ)
- [Mix-Tab – GitHub](https://github.com/BenjaminPhi5/Mix-Tab)
- [crossfad.er – GitHub](https://github.com/iynere/crossfad.er)

## Голос пользователя — YouTube-майнинг комментариев (2026-08-02)

Тот же пайплайн, что для Sends Follower / Dynamic Focus (см. навык `fadercraft-youtube-outreach`,
оригинал в `~/Brain/directives/_archive/directive_youtube_outreach.md`): поиск по ключевым словам → сбор комментариев → механический
пре-фильтр (тема И (интент ИЛИ лайки)) → классификация → запись в Notion "YouTube Comment
Mining" (`39255889-1bb0-818f-ae1c-cd5d93a94041`), тег `Product = Counter DJ`. Классификация
сделана вручную в контексте (не через Gemini) — обходит задокументированные баги
rate-limit/deprecated-модели из директивы. Прогон: 20 ключевых слов (18 реально дали
кандидатов), 382 уникальных пре-фильтрованных комментария, полное покрытие подтверждено
(8 read-вызовов, построчная сверка) → **14 матчей**.

**Бакеты:**
- `competitor_signal` — 8 (6 из них про **you.dj** конкретно)
- `browser_tool_pain` — 5
- `live_blend` — 1
- `shared_control` (паттерн "два человека, один комп") — **0**, несмотря на 5 ключевых слов
  и 81 кандидат в этом кластере ("passing the aux cord", "who controls the aux party",
  "dj battle friends laptop" и т.д.)

**Главный по лайкам (резонанс):** @mbangrene6858, 87 лайков — *"We need an app that can blend
with sportify app"* — под видео про бесплатные DJ-приложения. Не про YouTube конкретно, а про
паттерн "хочу живой блендинг прямо из того стриминга, где уже лежит моя музыка, без загрузки
файлов". Это самый громкий сигнал во всём прогоне.

**Живая находка (`live_blend`):** @paaao буквально описывает ручной прототип GrooveMix —
два табленных окна браузера, вручную сводит громкость мышкой между ними на вечеринке,
чтобы "музыка не останавливалась между треками" и можно было "принимать реквесты, не обрывая
эфир". Прямое подтверждение паттерна, но такое поведение почти никто не описывает в
комментариях — люди делают воркэраунд молча, не приходят на YouTube жаловаться на него.

**Кластер you.dj (`competitor_signal`, 6 комментариев):** конкретные незакрытые потребности
у тёплой аудитории, уже пытающейся микшировать из стриминга — сломанный поиск по YouTube
внутри инструмента, нет импорта YouTube-плейлиста ("I would instantly buy this if..."), нет
headphone cue/pre-listen, просят интеграцию со Spotify, потому что "all my music & playlist
is on spotify".

**Вывод — половинчатое подтверждение:** буквальный паттерн "два табa, кроссфейдер, EQ"
почти не встречается в поисковом/комментарийном виде (1 прямое попадание), но смежная
потребность — живой блендинг прямо из уже открытого стриминга без установки/скачивания —
подтверждена и самым громким найденным сигналом (87 лайков), и целым кластером конкретных
фич-реквестов к прямому конкуренту. Паттерн "два человека, один комп" (ключевая социальная
рамка спеки) в YouTube-комментариях не проявился вообще — это не опровержение, а сигнал, что
метод не подходит для этой части гипотезы: люди не приходят на YouTube с этим фрустрейшеном,
это внутритусовочный, непубличный опыт. Проверять его нужно другим методом (напр. Reddit-треды
про этикет aux на вечеринках), не YouTube-комментариями.

Сырые артефакты (scratchpad, временные): `candidates.jsonl` (382 пре-фильтрованных),
`matches.json` (14 матчей, те же поля что в Notion + `bucket`/`need_phrase`).

## Краудфандинг — Kickstarter и аналоги (ресёрч 2026-08-02)

Проверены Kickstarter, Indiegogo, Product Hunt, BackerKit, CrowdSupply. Ни один найденный
проект не питчил ровно паттерн GrooveMix (браузерное расширение, два реальных YouTube-таба
как деки, живой кроссфейд в чужой уже играющий эфир) — это подтверждённое отсутствие, не
пробел поиска (проверено несколькими заходами по разным углам). Ближайшие находки:

- **Djoclate II** (Pepperdecks, Kickstarter 2013) — физический аналог паттерна: карманный
  аналоговый 2-канальный микшер, вход 3.5mm с двух телефонов, кроссфейд + bass-kill, без
  розетки. Если оба телефона играют YouTube — механически то же самое действие, что делает
  GrooveMix, только в железе. **Цель $30,000, собрано $20,071, 311 бэкеров — не собрал
  (67%)**. Причина провала не задокументирована явно, но 311 бэкеров при непокрытой цели
  говорит: интерес к паттерну живой, готовность платить за физическое устройство — нет.
- **YouParty — The Social YouTube Remote** (Kickstarter 2013) — «пусть каждый на вечеринке
  будет диджеем», групповое управление общей YouTube-очередью с телефонов. Близко по
  словарю ("everyone is DJ", party), но механика другая: очередь/голосование, не живой блендинг
  двух одновременных источников. **Собрал 103% цели ($2,059 / 62 бэкера)** — успешно, но не
  тот механизм.
- **Mixfader** (DJIT, Kickstarter 2015) — Bluetooth-кроссфейдер к их DJ-приложению, обучение
  диджеингу. **Собрал >200% (€95-110K, ~1285 бэкеров)** — сильнейший денежный сигнал во всей
  категории, но другая аудитория (начинающий DJ отрабатывает технику), не браузер, не YouTube,
  не соц-паттерн "подмешаться к чужому эфиру".
- **Mixiamo** (Kickstarter 2018) — портативный hardware-микшер, почти не собрал (€162 из
  €45,000, 6 бэкеров) — почти нулевое пересечение с паттерном, для полноты.

**Вывод:** отсутствие двоякое. (1) Софтверная идея вроде расширения браузера — плохой питч
для краудфандинга: бэкеры ждут физическую вещь, ПО кажется слишком маленьким и легко
пиратящимся — значит, для GrooveMix верная модель монетизации — прямая конверсия free→paid
в Chrome Web Store, не краудфандинг-запуск. (2) Ближайший физический аналог паттерна
(Djoclate) набрал реальный интерес (311 бэкеров) но не окупился по юнит-экономике железа —
то есть потребность в лёгком казуальном блендинге на вечеринке подтверждена, но порог
готовности платить за отдельное устройство высокий. Софтверная версия с околонулевой
стоимостью производства/доставки может преодолеть именно этот барьер, который убил Djoclate.

### Источники (краудфандинг)

- [YouParty – Kickstarter](https://www.kickstarter.com/projects/2100048490/youparty-the-social-youtube-remote)
- [Djoclate II – Kicktraq](https://www.kicktraq.com/projects/pepperdecks/pepperdecks-djoclate-ii-pocket-size-music-mixer-0/)
- [Djoclate II – Pepperdecks product page](https://www.pepperdecks.com/products/5-djoclate)
- [Djoclate II – TechCrunch coverage](https://techcrunch.com/2013/07/12/djoclate-2)
- [Mixfader – Kickstarter](https://www.kickstarter.com/projects/396428272/mixfader-the-worlds-1-connected-object-for-becomin)
- [Mixfader – DJ TechTools coverage](https://djtechtools.com/2015/05/28/mixfader-the-kickstarter-for-bluetooth-enabled-crossfaders/)
- [Mixiamo – Kicktraq](https://www.kicktraq.com/projects/1848976054/mixiamo-all-in-one-portable-dj-mixer/)

## Голос пользователя — отзывы конкурентов на Chrome Web Store (2026-08-06)

### Метод и охват

Поиск через WebSearch по запросам "youtube dj mixer chrome extension crossfader" и "mix two youtube tabs chrome extension DJ". Найдено ~8 потенциально релевантных расширений, отобрано 4 наиболее близких к паттерну GrooveMix. Отзывы получены с extpose.com (агрегатор CWS-отзывов — Chrome Web Store прячет текст со страниц при фетче) + дополнительно страница апгрейда you.dj. Реальных текстовых отзывов с CWS прочитано: ~60 текстов (~50 — YouTube DJ Effects / you.dj extension, ~11 — Music mixer DJMusic, 4 — DualWield Audio). Прочие расширения (AI-Powered DJ, Mixing Board, YouTube Music DJ) нерелевантны или имеют <5 отзывов без текста.

**Важное уточнение о продуктах:**
- «YouTube DJ effects / EQ / Volume Booster / Bass Booster» (defekohaofmambflfpfoojkmfdpcbgko) — это Chrome-расширение you.dj, но оно НЕ является двухдечным микшером: добавляет EQ/эффекты к одной открытой вкладке YouTube. Сам you.dj (веб-апп) — отдельный продукт.
- Единственное CWS-расширение с реальным двухдечным кроссфейдером — Music mixer DJMusic (7K пользователей). DualWield Audio — стерео-разводка по ушам, не кроссфейдинг.

---

### Продукты и сырые отзывы

#### YouTube DJ Effects / you.dj extension (defekohaofmambflfpfoojkmfdpcbgko)
100K+ пользователей, 4.2 ★ (4 400+ голосов), обновлён май 2024.
Назначение: EQ + эффекты на одном YouTube-табе (один плеер, не два).

Отобранные отзывы (из ~50 прочитанных):

| Дата | Пользователь | Текст | Сигнал |
|------|-------------|-------|--------|
| 2025-10-19 | KARIM KAREEM | "the fact it blocks going full screen on YouTube is a NO GO for me" | browser_tool_pain |
| 2025-11-02 | Dominick Monteleone | "Only issue is when changing Audio Outputs it doesn't work after" | browser_tool_pain / cue_preview_gap |
| 2025-12-08 | Daniel | "good idea but doesnt turn on as an extension" | browser_tool_pain |
| 2025-09-17 | Emilio Gallardo | "it did't work" | browser_tool_pain |
| 2026-06-08 | malachi peel | "can you add treble booster" | feature_request |
| 2025-03-16 | PhoneJoe | "This is the only sound booster that actually works and doesn't appear to be spyware" | competitor_signal (недоверие к CWS) |
| 2024-10-18 | eric milburn | Просит сохраняемые пресеты звука | feature_request |
| 2024-12-08 | rs2000manos | "best eq i ever test!...full screen dont work" | browser_tool_pain |
| 2026-01-09 | Travis Mitchell | "im a real dj now this rocks" | no_gear_laptop_mixing |

Паттерн отзывов: большинство используют расширение как soundbooster/EQ для личного прослушивания, не для микширования. Жалобы — технические: конфликт с fullscreen YouTube, сломанное переключение аудио-выходов.

#### Music mixer DJMusic (glmigelhhlcmgddgkjfndfkdefddgbpd)
7K пользователей, 3.76 ★ (55 голосов), обновлён август 2024.
Назначение: двухдечный кроссфейд YouTube + SoundCloud в попапе расширения (не с существующими табами пользователя).

| Дата | Пользователь | Текст | Сигнал |
|------|-------------|-------|--------|
| 2024-02-13 | Tim Oltjenbruns | "Doesn't work" | browser_tool_pain |
| 2023-06-22 | juliomin | "i really wish i could download the mix" | feature_request (запись микса) |
| 2022-08-11 | Volkan Özkan | "DONT WORK... BOŞUNA İNDİRMEYİN" (тур.: «зря скачали») | browser_tool_pain |
| 2021-02-05 | Robert Brown | "it does not work at all" | browser_tool_pain |
| 2020-11-15 | Lej Westbrook | "It seems like it would've been okay but it didn't work" | browser_tool_pain |
| 2020-11-25 | Ken So | "this is the best app EVER! I love to mix the music" | позитив (работает у части) |

Паттерн: ~50% отзывов — «не работает совсем». Продукт нестабилен. Архитектура (собственный плеер внутри попапа, не реальный YouTube-таб пользователя) делает его уязвимым к изменениям YouTube API.

#### DualWield Audio (mkfabhjncjhimildocpcplafjcaalpop)
258 пользователей, 4.4 ★ (5 голосов), обновлён июнь 2026.
Назначение: каждый таб — в своё ухо (L/R), без кроссфейда.

| Дата | Пользователь | Текст | Сигнал |
|------|-------------|-------|--------|
| 2026-05-04 | Shafiq Mohammed | "randomly mutes my tabs and puts me in a really weird spot where i'm trying to troubleshoot in real time while missing critical audio" | browser_tool_pain |
| 2025-11-15 | Uwe Bohn | Хочет роутить каждый таб как отдельный микрофонный вход | advanced_routing |
| 2025-08-12 | Rollo U | "Cool idea, if you wanna listen to multiple things at the same time, this extension is key" | live_blend |
| 2025-08-08 | Ivar Lee | "Simple and clean way to intake two audio streams at once" | live_blend |

Паттерн: пользователи хотят одновременно слышать два аудиопотока из браузера — но это параллельное прослушивание (каждый в своё ухо), не DJ-кроссфейд. Продукт нестабилен (случайные mute в боевых условиях).

---

### Классификация по бакетам

**`cue_preview_gap` — НОВЫЙ ПОДТВЕРЖДЁННЫЙ СИГНАЛ (сильный)**

Самая важная находка исследования: you.dj (доминирующий игрок, 100M+ использований) прячет headphone CUE за Pro-подпиской ($9.99/мес) — и при этом Pro CUE требует либо вторую звуковую карту, либо Bluetooth-наушники, либо MIDI-контроллер, либо внешний микшер. То есть «preview перед выводом в общий звук» в you.dj = платная подписка + купи оборудование. В Chrome-расширениях cue-функциональность отсутствует в принципе ни у одного продукта. Tinytunes DJ (веб-апп, прямой конкурент — новая находка) заявил CUE как планируемую фичу, ещё не выпущенную. GrooveMix с `setSinkId` закрывает этот gap без дополнительного железа и без подписки.

Косвенное подтверждение: Dominick Monteleone — «changing Audio Outputs it doesn't work» — даже простое переключение выходов болезненно в существующих инструментах.

**`no_gear_laptop_mixing` — ПОДТВЕРЖДЕНО АРХИТЕКТУРОЙ КОНКУРЕНТОВ**

you.dj support-страница: типичные вопросы включают настройку звуковых карт, MIDI-контроллеров, перегрев ноутбука. Продукт ориентирован на аудиторию с оборудованием даже в «лёгком» режиме. Travis Mitchell — «im a real dj now» на EQ-расширении — это аудитория без железа, которая хочет DJ-ощущение прямо из браузера; она велика (100K+ пользователей у EQ-экстеншена), но её ещё никто не обслуживает правильным продуктом.

DualWield: Rollo U платит за параллельное прослушивание из двух табов только потому, что это единственный доступный инструмент. Демонстрирует willingnes-to-pay за browser-native multi-source audio.

**`browser_tool_pain` — СИСТЕМАТИЧЕСКАЯ ПРОБЛЕМА ВСЕГО СЕГМЕНТА**

Во всех трёх расширениях повторяется: «doesn't work», случайные mute, конфликт с fullscreen. Архитектурная причина: расширения либо инжектят собственный плеер (уязвим к YouTube API), либо конфликтуют с UI YouTube. GrooveMix, работая с реальным `<video>`-элементом через Web Audio API в content script на живом табе, системно избегает этих конфликтов.

**`competitor_signal`**

YouTube comment mining (предыдущее исследование): 6 комментариев про you.dj-веб-апп — сломанный YouTube-поиск внутри инструмента, нет импорта YouTube-плейлиста, нет headphone cue. Настоящее исследование дополняет: paywall на CUE + требование железа — это осознанное продуктовое решение you.dj. GrooveMix может позиционироваться как «то что you.dj мог бы дать бесплатно и без железа».

**`live_blend`**

juliomin: «i really wish i could download the mix» — желание не только свести, но и сохранить результат. Новый сигнал, не встречавшийся в YouTube comment mining. Не ядро GrooveMix v1, но указывает на возможную фичу (mix recording).

**`shared_control` — снова ноль**

Ни один из ~60 прочитанных CWS-отзывов не описывает паттерн «два человека, один компьютер». Подтверждает вывод YouTube-исследования: этот социальный паттерн существует, но не артикулируется в product reviews никакого типа.

---

### Выводы

**1. Позиционирование "no decks, mix from laptop" подтверждено от противного**
Конкуренты либо требуют оборудование для полноценного опыта (you.dj), либо ненадёжны (DJMusic: 50% «не работает»), либо вообще не микшируют (DualWield — стерео-разводка). Аудитория без железа активна и многочисленна (100K+ у you.dj extension), но её обслуживают неполноценно.

**2. Cue/headphone preview — самая острая незакрытая потребность в сегменте**
GrooveMix уже имеет кроссфейдер и EQ. `setSinkId` для headphone cue — следующая фича, закрывающая нишу, которую you.dj монетизирует через paywall + требует железо. Одновременно конкурентный differentiator и просто правильная вещь для аудитории «только ноутбук».

**3. Архитектурный gap DJMusic — прямое подтверждение подхода GrooveMix**
DJMusic (единственное CWS-расширение с реальным кроссфейдом) сломано у ~50% пользователей — потому что тянет YouTube-контент через собственный плеер в попапе. GrooveMix работает с реальным табом пользователя: та же устойчивость к YouTube API, что обеспечивает EQ (зафиксировано в разделе конкурентного ландшафта выше).

**4. Новый конкурент: tinytunes DJ**
Веб-апп (не расширение), появившийся после первого ресёрча. Два деки, кроссфейдер, sync, YouTube, CUE в roadmap. Более прямой конкурент по концепции, чем you.dj или DJMusic — та же идея «mix from browser without gear». Отличия GrooveMix: работает с существующими открытыми вкладками пользователя (не требует paste URL); архитектура реального таба обеспечивает EQ (iframe-ограничение у tinytunes DJ не проверено, но вероятно).

**5. Ограничение данных**
CWS прячет текст отзывов при прямом фетче — тексты получены через extpose.com. Выборка ~50 из 4400+ отзывов YouTube DJ Effects (1.1%) — статистически нерепрезентативна. DualWield: 5 отзывов, анекдотические данные. Всё выше — qualitative pattern recognition, не количественный анализ.

---

### Источники (CWS voice-of-user 2026-08-06)

- [YouTube DJ Effects (you.dj extension) – CWS](https://chromewebstore.google.com/detail/youtube-dj-effects-eq-vol/defekohaofmambflfpfoojkmfdpcbgko)
- [YouTube DJ Effects – extpose.com (отзывы)](https://extpose.com/ext/defekohaofmambflfpfoojkmfdpcbgko)
- [Music mixer DJMusic – CWS](https://chromewebstore.google.com/detail/music-mixer-djmusic/glmigelhhlcmgddgkjfndfkdefddgbpd)
- [Music mixer DJMusic – extpose.com (отзывы)](https://extpose.com/ext/glmigelhhlcmgddgkjfndfkdefddgbpd)
- [DualWield Audio – CWS](https://chromewebstore.google.com/detail/dualwield-audio/mkfabhjncjhimildocpcplafjcaalpop)
- [DualWield Audio – extpose.com (отзывы)](https://extpose.com/ext/mkfabhjncjhimildocpcplafjcaalpop)
- [you.dj upgrade page (paywall на CUE)](https://you.dj/upgrade)
- [you.dj support page](https://you.dj/support)
- [tinytunes DJ (новый конкурент)](https://dj.t-tunes.com)
- [tinytunes DJ – анонс (Substack)](https://dilemmaworks.substack.com/p/introducing-tinytunes-dj)
