# Wiki Operations Log

**Summary**: Append-only журнал операций над wiki — ингесты, создание страниц, лит, ревью.
**Sources**: операционная страница (источника нет)
**Last updated**: 2026-04-29

---

This file is **append-only**. Never modify previous entries — only add new ones at the bottom.

Каждая запись описывает один логический акт работы над wiki: ингест источника, создание страниц, ревью, лит и т.п.

---

## 2026-04-29 — Initial strategy ingest (v3)

**Operation:** First wiki population. Создан каркас и заведена главная стратегическая страница.

**Created:**
- `raw/strategy-v3.md` — канонический документ торговой стратегии v3 как первоисточник
- `wiki/trading-strategy.md` — главная сводная страница со ссылками на планируемые концептуальные страницы
- `wiki/index.md` — обновлён, теперь содержит запись про trading-strategy и список planned-страниц
- `wiki/log.md` — этот файл

**Source:** живые торговые сессии 2026-04-26..29 + согласование стратегии в чате. Полные транскрипты не сохранены — куратор (Кирилл) подтвердил content стратегии устно, документ собран Claude по ходу обсуждения.

**Pending concept pages** (упомянуты в wiki-links на главной странице, не созданы):
- trader-profile, entry-rules-long, entry-rules-short, position-sizing, stop-loss-rules, take-profit-rules, timeframes, indicators, bybit-data, bybit-chart-markers, daily-routine, weekly-review, psychology-rules, commission-management

**Plan:** концептуальные страницы наполняются постепенно. Каждое еженедельное ревью стратегии — повод раскрыть одну-две темы подробно (например, после первой реальной серии шорт-сделок развернуть `entry-rules-short` с примерами).

**Next:** дождаться первой недели торговли по v3, на ревью обсудить статистику и решить какие концепты раскрывать первыми (предположительно `entry-rules-long` + `position-sizing`, как самые часто используемые).

---

## 2026-04-29 — Audit fixes + first concept page

**Operation:** мелкие правки по результатам аудита wiki + создание первого концепта.

**Updated:**
- `wiki/index.md` — добавлено поле `Sources` в шапку для соответствия page format (стоит "операционная страница (источника нет)")
- `wiki/log.md` — добавлена шапка с `Summary / Sources / Last updated`
- `wiki/trading-strategy.md` — добавлены три inline-цитаты `(source: strategy-v3.md)` к ключевым числовым утверждениям (депозит/плечо, минимальное движение 4-5%, целевые показатели win rate)

**Created:**
- `wiki/entry-rules-long.md` — первый концепт: условия входа в long. Структура: главный вопрос (потенциал 4-7%) → 5 базовых условий → бонусы → запрещающие условия → порядок проверки → next steps. Источник — `raw/strategy-v3.md`, раздел "Правила входа в LONG", расширен пояснениями по каждому условию.

**Index:** `entry-rules-long` перенесён из секции "Концепты (planned)" в активные "Концепты".

**Reasoning по выбору первого концепта:** в предыдущей log-записи было предсказано что `entry-rules-long` — самый часто используемый концепт. Решили не ждать первой недели торговли, а сразу развернуть его, чтобы при первом же setup'е не возвращаться к raw-документу. Остальные концепты по-прежнему раскрываем по мере необходимости — следующий кандидат `position-sizing` (нужен сразу после `entry-rules-long` в потоке "решил войти → считаю размер").

**Next:** при следующем касании wiki — либо `entry-rules-short` (зеркальная пара), либо `position-sizing` (следующий шаг в operational flow). Решим по ситуации.
