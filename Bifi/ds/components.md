# Components (scan)

**Источник:** https://www.figma.com/design/vBAfvod9AWpHeyJi2yu2Eh/v2.4-Beefy-Design-System
**Дата сканирования:** 2026-06-19 (скан выполнен по копии `maagSNZFPmmWBdtdR17pBS`, копия удалена; структура идентична оригиналу)
**Кол-во страниц с компонентами:** 24 (Animation — пустая, Cover — обложка)

---

## Кнопки и элементы управления

### Button
- **Назначение:** основная кнопка действий с 6 визуальными скинами и иконками слева/справа
- **Варианты:** Skin: Primary | Secondary | Tertiary | Fourth | Fifth | Link; Size: XXL | XL | L | M | S | XS; State: Default | Hover | Disabled; Show-ic-left / Show-ic-right / Show-text (bool)
- **Node ID:** `422:3792`

### Toggle S
- **Назначение:** переключатель on/off, малый размер
- **Варианты:** State: off | on
- **Node ID:** `5274:166`

### Checkbox
- **Назначение:** чекбокс, 4 визуальных состояния
- **Варианты:** Property 1: default | Hover | current-hover | current
- **Node ID:** `4021:3746`

### Radiobtn
- **Назначение:** радиокнопка, 4 визуальных состояния
- **Варианты:** Property 1: default | Hover | current-hover | current
- **Node ID:** `4500:98`

### arrange-arrow
- **Назначение:** стрелка сортировки колонок в таблицах
- **Варианты:** Property 1: none | top | bottom
- **Node ID:** `4112:2202`

### Notification-marker
- **Назначение:** маркер-бейдж для нотификации поверх иконки
- **Варианты:** State: 1 | 2
- **Node ID:** `4308:53`

### Sellector
- **Назначение:** переключатель режима / вкладки, два состояния
- **Варианты:** Property 1: Default | Active
- **Node ID:** `6649:124`

---

## Поля ввода и выпадающие

### M - Mobile (Input)
- **Назначение:** текстовое поле ввода средний размер, мобильная версия
- **Варианты:** Skin: dark | light; State: Default | focussed | Inputed | placeholder | disabled; Show-icon-right / Show-icon-left / Show-fixed-parameter / Show-right-cta (bool)
- **Node ID:** `4088:3004`

### M - Desktop (Input)
- **Назначение:** текстовое поле ввода средний размер, десктоп
- **Варианты:** Skin: dark | light; State: focussed | error | disabled | hover | placeholder
- **Node ID:** `4563:651`

### S - Desktop – filled (Input)
- **Назначение:** малый инпут с заполненным фоном, десктоп
- **Варианты:** Skin: dark; State: header | placeholder | hover | focussed | typed | disabled | error
- **Node ID:** `6488:441`

### S - Desktop – underline (Input)
- **Назначение:** малый инпут только с нижней границей, десктоп
- **Варианты:** Skin: dark; State: placeholder | hover | focussed | typed | disabled | error
- **Node ID:** `6533:337`

### L - Desktop (Input)
- **Назначение:** крупный инпут для ввода суммы токена с ticker и MAX-кнопкой
- **Варианты:** State: placeholder | focussed | error | disabled | inputed; Show-crypto-amount / Show-fiat-amount / Show-ticker / Show-Max (bool)
- **Node ID:** `4237:694`

### L + progress (Input)
- **Назначение:** крупный инпут с прогресс-баром (для ввода % позиции)
- **Варианты:** Property 1: inputed | placeholder | foceussed | disabled | error
- **Node ID:** `5005:2770`

### inputfield+header (Input)
- **Назначение:** поле ввода с заголовком-лейблом сверху
- **Варианты:** Property 1: Default | Disabled
- **Node ID:** `5006:3836`

### fiat-amount
- **Назначение:** строка отображения суммы в фиате под основным инпутом
- **Варианты:** Property 1: Default | Disabled | Placeholder | Single digit
- **Node ID:** `5006:3960`

### ticker
- **Назначение:** тикер токена с иконкой, стрелкой выбора; встраивается в L-инпут
- **Варианты:** View: Ticker | Ticker +Chain | No Ticker; Show-arrow / Show-Token / Show-Mask (bool)
- **Node ID:** `6472:385`

### progress-bar (Input)
- **Назначение:** слайдер-прогресс-бар для процентного выбора внутри L-инпута
- **Варианты:** Property 1: Default | Disabled | Inputed | Focussed | Error | 100%
- **Node ID:** `5006:3656`

### dropdown-field__m__desktop
- **Назначение:** поле-триггер выпадающего списка, десктоп
- **Варианты:** Property 1: Hover | Current | Placeholder; Skin: Light | Dark
- **Node ID:** `3851:208`

### dropdown-field__m__mobile
- **Назначение:** поле-триггер выпадающего списка, мобильный
- **Варианты:** Property 1: Hover | Current | Placeholder; Skin: Light | Dark; Show Current Data (bool)
- **Node ID:** `4382:193`

### dropdown-item__m__desktop
- **Назначение:** строка-элемент выпадающего списка, десктоп; поддерживает иконки, чекбокс, радиокнопку
- **Варианты:** Property 1: header | default | hover | current | hover-current; Show-icon-right / Show-icon-left / Show-arrow-left / Show-radiobtn / Show-checbox / Show-external-link-arrow (bool)
- **Node ID:** `732:6492`

### dropdown-item-checkbox__m__mobile
- **Назначение:** строка-элемент выпадающего списка с чекбоксом/радио, мобильный
- **Варианты:** Property 1: current | default; Show-icon / Show-checkbox / Show-radio / Show-tag / Show-chain (bool)
- **Node ID:** `4382:172`

---

## Сортировка

### sortin-element
- **Назначение:** элемент-заголовок колонки с кликабельной сортировкой
- **Варианты:** State: Default | Hover | applied bottom | applied top
- **Node ID:** `4112:2193`

### sorting-toggle
- **Назначение:** кнопка-переключатель направления сортировки
- **Варианты:** Property 1: Default | Hover
- **Node ID:** `4112:2212`

---

## Теги и бейджи

### Inline (Tag)
- **Назначение:** встроенный тег типа vault на карточке (тип, статус, фича)
- **Варианты:** Property 1: points | boost | default | CLM pool | CLM vault | pool | ultimate | retired | ending soon | free zap; Show-txt (bool)
- **Node ID:** `4082:676`

### status (Tag)
- **Назначение:** статусный бейдж с иконкой слева/справа, два стиля оформления
- **Варианты:** Property 1: Primary | Secondary; Show-icon-left / Show-txt / Show-icon-right (bool)
- **Node ID:** `4260:1716`

### Tag
- **Назначение:** плавающий или встроенный тег, два цветовых стиля
- **Варианты:** Property 1: Green inline | Yellow floating
- **Node ID:** `4552:2301`

### Ribbon
- **Назначение:** ribbon-ленточка (угловой бейдж) на карточке
- **Варианты:** Property 1: Mobile | Desktop
- **Node ID:** `5288:197`

### share btn
- **Назначение:** кнопка поделиться / скопировать ссылку на vault, с типами по vault-скину
- **Варианты:** Position: right | left; State: default | hover | clicked; Screen: mobile | desktop; Type: Default | CLM | pool | ultimate | retired
- **Node ID:** `6183:431`

---

## Уведомления и информер

### Short-notifications
- **Назначение:** компактное уведомление (тост-маленький): attention / error / info / confirmation
- **Варианты:** Property 1: Attention | Error | Information | confirmation
- **Node ID:** `4953:267`

### Short-loud-notifications
- **Назначение:** компактное «громкое» уведомление с нижней фигурой (как popover)
- **Варианты:** Property 1: Attention | Error | Information | confirmation | Notification; Property 2: shape-bottom | --
- **Node ID:** `4953:276`

### Wide-notifications
- **Назначение:** широкое уведомление-баннер с иконкой и кнопкой закрытия
- **Варианты:** Property 1: Attention | Information | confirmation | Error; Show-cross / Show-icon (bool)
- **Node ID:** `4953:285`

### Notifications
- **Назначение:** полное уведомление с текстом (до 3 строк), CTA-стопкой, кнопкой share
- **Варианты:** State: not started | confirmation | attention | error; Show-1st-text-line / Show-2nd-text-line / Show-close-button / Show-external-link / Show-3rd-text-line / Show-share-button / Show-CTA-stack / Show-Icon (bool)
- **Node ID:** `6591:889`

### Toast-notification
- **Назначение:** тост-уведомление (одиночный компонент без вариантов)
- **Node ID:** `6378:1033`

### Tip
- **Назначение:** информационная подсказка-tip (одиночный компонент)
- **Node ID:** `4383:829`

---

## Навигация и меню

### Navigation
- **Назначение:** главная навигационная панель (хедер), адаптивная
- **Варианты:** Breakpoint: Desktop | Tablet | Mobile; Show Burger (bool)
- **Node ID:** `5400:1417`

### Footer
- **Назначение:** футер сайта
- **Варианты:** Variant: desktop | mobile
- **Node ID:** `665:5559`

### menu-item
- **Назначение:** элемент выпадающего меню в хедере
- **Варианты:** Screen: desktop | mobile; Property 1: Default | Hover; Show-marker / Show-arrow-right / icon-left (bool)
- **Node ID:** `5544:10135`

### connection module
- **Назначение:** блок подключения кошелька / статус соединения в хедере
- **Варианты:** Property 1: allert | confirmaiton | attention | disconnected | placeholer-disconnected | placeholer-connected; State: Default | hover-wallet | hover-connection
- **Node ID:** `5449:4656`

### parameters-section
- **Назначение:** секция параметров (TVL/APY/users) в хедере или на странице
- **Варианты:** Property 1: Tablet | Desktop | Mobile
- **Node ID:** `5514:421`

---

## Табы и навбар

### tab-item__mobile
- **Назначение:** вкладка таббара, мобильный; поддерживает маркер и тикер
- **Варианты:** Property 1: Default | Active | With marker - Default | With marker – Active; Marker / Show-tickername (bool)
- **Node ID:** `501:2098`

### tab-item__desktop
- **Назначение:** вкладка таббара, десктоп; опциональная вторая строка
- **Варианты:** Property 1: hover-current | default; Show__2nd-line (bool)
- **Node ID:** `5115:80`

### Navbar-item__line :: ondark
- **Назначение:** пункт навбара с подчёркиванием, тёмный фон
- **Варианты:** position: left | center | right; State: Default | Sellected | Hover; Show-ic-right (bool)
- **Node ID:** `4043:255`

### Navbar-item__line :: onlight
- **Назначение:** пункт навбара с подчёркиванием, светлый фон
- **Варианты:** position: left | center | right; State: Default | Sellected | Hover; Show-ic-right (bool)
- **Node ID:** `4555:232`

### Navbar-ic-line__desktop
- **Назначение:** пункт навбара с иконкой и подчёркиванием, десктоп
- **Варианты:** position: left | center | right; State: Default | active | inactive; ticker (bool)
- **Node ID:** `4045:553`

### Navbar-item__ic-only
- **Назначение:** пункт навбара — только иконка (без текста)
- **Варианты:** State: Default | Hover | Opened
- **Node ID:** `4047:202`

### Navbar-item__center
- **Назначение:** центральный пункт навбара с иконками слева/справа
- **Варианты:** Property 1: Hover | Sellected | Default; Show-ic-right / Show-ic-left (bool)
- **Node ID:** `4086:2820`

---

## Accordion

### accordion on dark
- **Назначение:** раскрывающийся блок вопрос-ответ на тёмном фоне карточки
- **Варианты:** Source: mobile | desktop; State: default | expanded
- **Node ID:** `5015:6350`

### accordion on light
- **Назначение:** раскрывающийся блок вопрос-ответ на светлом фоне (исключение — единственный light-компонент)
- **Варианты:** Property 1: Default | expanded
- **Node ID:** `6338:133`

---

## Тултип

### Tooltip
- **Назначение:** всплывающая подсказка, позиционируется по 3 осям
- **Варианты:** Variant: Basic | Basic with Desc; Vertical Positioning: Below | Above | Left; Horizontal Positioning: Center | Left | Right; Show data (bool)
- **Node ID:** `665:7017`

---

## Графики и данные

### line-chart
- **Назначение:** линейный график (performance / price), десктоп и мобильный
- **Варианты:** Property 1: perfomance3 | price | perfomance 4 | perfomance 3; Screen: Desktop | mobile | Mobile
- **Node ID:** `6062:275`

### line-chart-wtih-range__desktop
- **Назначение:** линейный график с переключателем временного диапазона
- **Варианты:** Period: 1D | 1Y | 1w | 1m
- **Node ID:** `5105:1082`

### BarChart
- **Назначение:** столбчатая диаграмма, два типа отображения
- **Варианты:** Property 1: biaxial | stacked
- **Node ID:** `6069:2192`

### Data-container
- **Назначение:** контейнер для легенды/данных рядом с графиком
- **Варианты:** Property 1: 4-lines | 3-ines
- **Node ID:** `6064:447`

---

## Прогресс-бар

### Progressbar Desktop
- **Назначение:** прогресс-бар (capacity / APR fill), десктоп
- **Варианты:** Property 1: Default | Adjusted
- **Node ID:** `4599:217`

### Progressbar Mobile
- **Назначение:** прогресс-бар, мобильный
- **Варианты:** Property 1: Default | Adjusted
- **Node ID:** `4599:247`

### Progress-bar__light
- **Назначение:** прогресс-бар на светлом фоне
- **Варианты:** Property 1: Mobile | Desktop
- **Node ID:** `5117:27`

---

## Скролл

### scroll-bar
- **Назначение:** полоса прокрутки (одиночный компонент)
- **Node ID:** `6356:74`

### Scrollbar-container
- **Назначение:** контейнер-обёртка со скролл-баром
- **Node ID:** `6357:80`

---

## Типографика (компонентные)

### txt+icon
- **Назначение:** строка текст + иконка, три варианта размера иконки
- **Варианты:** Property 1: BodyL + icon24 | Subline + icon | BodyL + icon20
- **Node ID:** `3900:326`

### Link L Regular
- **Назначение:** ссылка, крупная, Regular-насыщенность; 3 цветовых стиля, hover
- **Варианты:** Color-Style: 1 | 2 | 3; State: Default | Hover; Show-Icon-right (bool)
- **Node ID:** `4041:840`

### Link L Medium
- **Назначение:** ссылка, крупная, Medium-насыщенность; 3 цветовых стиля, hover, disabled
- **Варианты:** Color-Style: 1 | 2 | 3; State: Default | Hover | Disabled; Show-Icon-right (bool)
- **Node ID:** `4041:994`

### Link sunline S
- **Назначение:** ссылка с подчёркиванием, малый размер
- **Варианты:** State: Default | Hover; Show-underline (bool)
- **Node ID:** `4263:189`

### Underline
- **Назначение:** декоративное подчёркивание текста (пунктирное или сплошное)
- **Варианты:** Style: Dashed | Solid
- **Node ID:** `5589:616`

### Divider
- **Назначение:** горизонтальный разделитель с зазором или без
- **Варианты:** Gap: Gap | NoGap; Skin: OnDark | OnLight
- **Node ID:** `4767:3237`

---

## Бренд / Логотип

### BIFI/Logo
- **Назначение:** полный логотип Beefy (символ + надпись)
- **Node ID:** `4292:2204`

### BIFI/Symbol
- **Назначение:** символ-иконка Beefy без надписи
- **Node ID:** `4302:2999`

---

## Клавиатуры (мобильные)

### Keyboard notch
- **Назначение:** системная мобильная клавиатура с вырезом (актуальная)
- **Node ID:** `4513:4241`

### iPad Keyboard
- **Назначение:** клавиатура iPad
- **Node ID:** `4596:13227`

---

## Браузер chrome (мобильный)

### Browser-mobile-top
- **Назначение:** верхняя панель браузера мобильного (адресная строка)
- **Node ID:** `6353:3250`

### Browser-mobile-bottom
- **Назначение:** нижняя панель браузера мобильного (навигация)
- **Node ID:** `6353:3251`

---

## Иконки — Токены (криптовалюты)

### Token
- **Назначение:** иконки криптовалютных токенов, 24×24px
- **Варианты:** Token: ADA | Avalanche | BIFI | BNB | BTC | BeS | DAI | DOGE | DOT | ETH | HBAR | LEO | LINK | LTC | MAI | OM | PI | QI | SHIB | SOL | SUI | Sonic | TON | TRX | USDC | USDT | XLM | XRP | begem-Emerald | begem-Ruby | begem-Sapphire | mooBIFI | Placeholder | _Many
- **Node ID:** `5967:3457`

### Token Set
- **Назначение:** составной слот из нескольких токенов (1-4), 48×48px; INSTANCE_SWAP для каждого токена, булев Show chain
- **Варианты:** Property 1: 1 | 2 → | 2 ← | 3 | 4
- **Node ID:** `5617:2034`

---

## Иконки — Блокчейны

### Chain
- **Назначение:** иконки блокчейн-сетей, 24×24px
- **Варианты:** chain: arbitrum | avalanche | barachain | base | bnb | cronos | etherium | fraxtal | gnosis | linea | lisk | mantle | metis | mode | moonbeam | optimism | polygon | rootstock | scroll | sei | sonic | zksync | Saga | Hyper | SVG | Placeholder | _3Others | _5Others; State: Active | Inactive
- **Node ID:** `4351:1144`

---

## Иконки — DeFi-платформы

### Platform
- **Назначение:** иконки DEX/lending-протоколов, 20×20px
- **Варианты:** Platform: aave | aerodrome | alienbase | Ape | aura | balancer | baseswap | beefy | beethovenx | bex | camelot | cantoDex | compound | conic | convex | curve | curve2 | defive | dotdot | dragon | elipsis | equalizer | equilibria | ferro | fx | gains | gamma | gmx | hop | ichi | infrared | kim | kodiak | lendle | LFJ | lynex | magpie | mendi | mim | moe | moonwell | morpho | mummy | netswap | nile | nuri | oku | openocean | pancakeswap | pendle | pharaoh | quickswap | ra | ramses | shadow | silo | sky | sonne | stargate | stellaswap | sushi | swapx | thena | tokemak | uniswap | velodrome | venus | vesync | volcimeter | vvs | wagmi | wigoswap | yei | Placeholder; State: active | inactive | Active
- **Node ID:** `4724:147`

---

## Иконки — Кошельки и кураторы

### Wallet
- **Назначение:** иконки крипто-кошельков, 48×48px
- **Варианты:** Property 1: Brave | CDC Connect | Coinbase Wallet | Fireblocks | MetaMask | NonameWallet | OKX | Rabby | Trust Wallet | WalletConnect
- **Node ID:** `6361:490`

### Curators
- **Назначение:** иконки кураторов vault-стратегий, 20×20px
- **Варианты:** Property 1: Gauntlet | Optima | Telos | hyperithm | k3capital | mev_capial | re7labs | scale-proportion | steakhouse | varlamore
- **Node ID:** `6352:3243`

### Analysis platforms
- **Назначение:** иконки аналитических платформ, 20×20px
- **Варианты:** Property 1: Defillama | Dune
- **Node ID:** `6458:135`

### Crosschain Protocols
- **Назначение:** иконки кросс-чейн протоколов, 20×20px
- **Варианты:** Property 1: circle | Odos
- **Node ID:** `6458:136`

---

## Иконки — UI (интерфейс)

Все 20×20px, одиночные компоненты без вариантов. Сгруппированы по насыщенности линий.

### Bold (Bd)

| Имя | Node ID |
|---|---|
| `cross bold` | `4094:1435` |
| `ZAP` | `6747:151` |
| `arrow Bold- right` | `5605:146` |
| `externalLinkSemiBold` | `3872:1105` |

### Medium (Md)

| Имя | Node ID |
|---|---|
| `cross medium` | `3880:3097` |
| `arrow Medium- left` | `4439:1083` |
| `arrow Medium- right` | `3848:3407` |
| `arrow Medium- top` | `3852:3129` |
| `arrow Medium- bottom` | `3848:3406` |
| `externalLinkMedium` | `5244:2311` |

### Regular (Rg)

| Имя | Node ID |
|---|---|
| `arrow Regular- bottom` | `4025:835` |
| `arrow Regular- top` | `6425:106` |
| `arrow Regular- right` | `4589:25` |
| `arrow Regular- left` | `6474:513` |
| `externalLinkRegular` | `5237:872` |
| `external link Sq – medium` | `4245:1673` |
| `external link Sq – regular` | `6478:116` |
| `swap Regular` | `5971:98` |
| `mark regular` | `3848:3756` |
| `mark S inround` | `5236:771` |
| `mark marked` | `4245:1827` |
| `cross regular` | `6422:168` |
| `clock` | `4245:1842` |
| `Boosted` | `4059:809` |
| `CLM Pool` | `4082:710` |
| `Preferences` | `4080:731` |
| `Scope →` | `3847:3016` |
| `Scope S →` | `6407:103` |
| `Scope ←` | `4088:2961` |
| `share` | `4437:98` |
| `save` | `4437:94` |
| `eye-on` | `3930:221` |
| `eye-off` | `3930:222` |
| `filter` | `4033:228` |
| `checkbox-fill` | `6463:1849` |
| `radiobtn` | `4500:97` |
| `preloader` | `6368:109` |
| `Preloader-box` | `6592:188` |
| `counter` | `4581:72` |
| `edit` | `5438:2050` |
| `Sign` | `6437:493` |
| `Burger` | `3850:116` |
| `3dots` | `5534:2878` |
| `triangle-move-up` | `4466:4102` |
| `triangle-move-down` | `4466:4109` |
| `graph` | `5369:1246` |
| `fold-arrow (открыть)` | `5609:2059` |
| `fold-arrow (закрыть)` | `5609:2077` |
| `trend/up` | `5564:1724` |
| `trend/down` | `5564:1734` |
| `refresh` | `5565:1775` |
| `stopwatch` | `5652:101` |
| `scan` | `6375:109` |
| `Download` | `5298:812` |
| `stop` | `6891:1181` |
| `DOC` | `5276:221` |
| `+ more` | `5467:310` |
| `+` | `3874:77` |
| `-` | `6337:103` |
| `!` | `4119:514` |
| `i` | `4119:519` |
| `i - filled` | `4292:1980` |
| `i-inline` | `5505:473` |
| `/ - filled` | `4556:281` |
| `? - outlined` | `3822:3066` |
| `? - filled` | `3822:3071` |
| `discord` | `5963:2399` |
| `twitter` | `5963:2400` |

### Навигационное меню

| Имя | Node ID |
|---|---|
| `vaults-menu` | `5505:472` |
| `dashboard-menu` | `5505:474` |
| `dao-menu` | `5505:475` |
| `buy-menu` | `5505:476` |
| `docs-menu` | `5505:479` |
| `news-menu` | `5505:480` |
| `mediakit-menu` | `5505:481` |
| `audit-menu` | `5505:482` |
| `partners-menu` | `5505:483` |
| `analytics-menu` | `5505:484` |
| `gems-menu` | `5505:485` |
| `treasury-menu` | `5505:486` |
| `proposals-menu` | `5505:487` |
| `profit distr-menu` | `5505:488` |

### Маркеры

| Имя | Node ID |
|---|---|
| `Marker/confirmination` | `4352:3744` |
| `Marker/attention` | `5447:432` |
| `Marker/allert` | `5447:443` |
| `Marker/confirmination_animated` | `3838:2` |
| `Marker/attention_animated` | `5450:4915` |
| `Marker/allert_animated` | `5450:4909` |
| `Marker/teaser_animated` | `3908:1943` |
| `marker` | `4467:282` |

---

## Иконки — Социальные сети

Все 24×24px, скруглённые (i-round).

| Имя | Node ID |
|---|---|
| `github_iround` | `4081:297` |
| `telegram_iround` | `4081:298` |
| `discord_iround` | `4081:299` |
| `twitter_iround` | `4081:301` |
| `reddit_iround` | `4081:302` |
| `Item_iround` (плейсхолдер) | `4081:513` |

---

## Замечания после сканирования

- [x] Все component-описания в Figma пустые — назначение выведено по именам
- [ ] Насыщенность линий иконок (Bd/Md/Rg = Bold/Medium/Regular) зафиксирована в имени; размер у всех одинаков (20px)
- [ ] `fold-arrow` — два компонента с одинаковым именем (`5609:2059` открыть / `5609:2077` закрыть); при инстанцировании брать по Node ID
- [ ] `Keyboard old` (`4385:4507`) — устаревший компонент, не использовать
- [ ] `Component 1` (`6075:2500`) на странице Graph — имя без смысла; вероятно, переключатель вида Desktop/Mobile для графика; уточнить у автора
- [ ] Animation — страница существует, но компонентов нет (анимации через Figma prototyping, не как компоненты)
- [ ] Внутренние субкомпоненты (не инстанцировать напрямую): `arrow` (`3966:3473`), `MAX` (`5961:1491`), `marker` (`4467:282`), `divider` (`4045:847`), `Menu sizing` (`6088:2821`), `Character` (`4964:2375`), `xs` (`3918:320`), `radiobuttn+P body` (`6649:54`), `data-element` (`6062:1725`), `data-element-320 min` (`6127:6017`), `timeframe-sellector` (`6062:285`), `Display-sellector` (`6062:365`), `Light` (`5370:1259`), `Graph` (`5369:1098`), `line-chart__desktop :: nested` (`3958:402`), `Menu opened` (`5550:2945`), `menu-item/tablet` (`5792:9851`), `Tab Group 2/Default` (`501:2109`)
- [ ] `Divider -12` (`6706:2552`) — вероятно, вариант разделителя с конкретным отступом; хранится на странице Divider
