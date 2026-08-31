# Секция Problem — направления формулировки

> Ревизия секции `Problem` из `site/ia/screens-inventory.md`. Текущая формулировка — «Skill Bloat:
> библиотека кастомных скиллов разрастается, нет способа увидеть, что живое, а что мёртвый груз».
> Источники: `site/research/site_personas.md`, `site/research/site_positioning_swot.md`,
> `site/research/site_content_matrix.md`.

## Решение

**Взято направление B** (владелец, 2026-08-31). Финальный текст секции:

> **You built a library. You just can't see it working.**
>
> Thirty skills, fifty, a hundred — every one written because you needed it. What's missing isn't
> discipline, it's an instrument. Nothing reports which ones Claude actually reaches for, and which
> have been sitting unread since the day you wrote them.

`site/ia/screens-inventory.md` и `site/ia/sitemap.md` приведены в соответствие: термин «Skill Bloat»
убран из строк `Hero` и `Problem`.

Не закрыто: вторую строку можно заменить на конкретный момент из направления A
(«You wrote the trigger. You used the phrase. Claude solved it from scratch anyway.») — вариант
сильнее по узнаванию, но сдвигает секцию с «нет прибора» на «сломался триггер», ближе к `Features`.
Решать при вёрстке, на живом макете.

## Что не так с текущей формулировкой

1. **«Skill Bloat» обвиняет пользователя в том, что он делал правильно.** Каждый скилл в библиотеке
   заведён по делу; формулировка «разрастается» читается как «ты насвинячил». Персона 1
   (`site_personas.md`) — power-user с 30+ скиллами, для неё это не диагноз, а упрёк.
2. **В одну секцию сведены три боли разного порядка** — не видно, что работает (наблюдение);
   не понятно, почему не сработало (диагностика); страшно чистить (правка с откатом). В Problem
   входит ровно одна; вторая и третья уже раскрыты в `HowItWorks` и `Features`.
3. **Категория вместо момента.** «Мёртвый груз» — аналитическая рамка автора, а не то, с чем человек
   столкнулся. Персона 1 приходит на лендинг сразу после конкретного симптома.

## Пять направлений

Расходятся по оси «чья это проблема и в каком регистре про неё говорить», а не по формулировке одной мысли.
Копирайт — на английском (правило `~/Brain/CLAUDE.md`: содержимое страниц на английском).

### A. Момент, а не категория

> **The skill didn't fire.**
>
> You wrote the trigger. You used the phrase. Claude solved it from scratch anyway — and you only
> noticed because the answer looked wrong. Nothing tells you which skill ran, or why the one you
> wrote didn't.

Проблема принадлежит инструменту, не человеку. Проходит тест Персоны 3 на жаргон — понятно без слов
«плотность скиллов» и `SKILL.md` (требование PRD US-5, перенесённое на hero).

### B. Библиотека — актив, который не видно

> **You built a library. You just can't see it working.**
>
> Thirty skills, fifty, a hundred — every one written because you needed it. What's missing isn't
> discipline, it's an instrument. Nothing reports which ones Claude actually reaches for, and which
> have been sitting unread since the day you wrote them.

Диаметрально текущей формулировке: не обвинение, а констатация отсутствующего прибора.

### C. Налог

> **Every skill you never use still costs you.**
>
> Descriptions load into context on every session. A skill that hasn't fired in three months still
> takes up room, still competes for the router's attention. You're paying for the whole library and
> using part of it — without knowing which part.

Экономика вместо психологии. Ложится на Персону 2, которая ищет один конкретный факт, а не список
общих преимуществ.

### D. Утрата доверия

> **You stopped trusting your own skills.**
>
> When you're not sure a skill will fire, you paste the instructions by hand instead. That's the real
> failure — not the skill that's broken, but the ones you've quietly stopped relying on. There's no
> way to check, so you route around them.

Самое сильное по узнаванию и самое рискованное: требует, чтобы человек согласился, что он так делает.

### E. Убрать секцию

Одна строка уезжает в `Hero`, дальше сразу `HowItWorks`:

> **See which of your Claude Code skills actually fire — and fix the ones that don't.**

Обоснование из ресёрча: Персона 1 сканирует в поиске трёх вещей (что показывает, сколько стоит, что
происходит с файлами) — «проблема» не входит ни в одну. Персона 2 закрывает вкладку через ~2 экрана
без ответа на «чем отличается» (`site_personas.md`, инсайт про порядок секций). Секция Problem тратит
экран на пересказ того, что человек уже почувствовал — иначе бы он сюда не пришёл.

## Рекомендация

**B как заголовок + вторая строка из A как конкретика под ним.** B снимает главное возражение
(формулировка не обвиняет пользователя), A даёт узнаваемый момент вместо общих слов, вместе читаются
с одного скана.

Не решено: если выбрано E, `site/ia/sitemap.md` и `site/ia/screens-inventory.md` правятся вслед —
секция `Problem` удаляется из обоих, строка переезжает в `Hero`.
