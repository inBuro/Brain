# Wiki Operations Log

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
