# Brain repo scripts

## `sync-from-main.sh`

Подтягивает `origin/main` в локальный клон Brain. Безопасный: отказывается работать при uncommitted-изменениях или дивергенции локальной `main`. Если ты сейчас на feature-ветке — обновляет только `refs/heads/main`, твою рабочую ветку не трогает.

Запуск вручную:

```bash
~/Brain/scripts/sync-from-main.sh ~/Brain
```

или через env-var:

```bash
REPO_PATH=~/Brain ~/Brain/scripts/sync-from-main.sh
```

### Exit codes

| Code | Значение |
|---|---|
| 0 | pull прошёл (ff или уже актуально) |
| 1 | плохой вызов (нет пути, не репо) |
| 2 | в working tree uncommitted-изменения → отказ |
| 3 | local main расходится с origin/main → нужен ручной мерж/ребейз |
| 4 | git/network ошибка |

---

## `com.inburo.brain-sync.plist` — launchd LaunchAgent (macOS)

Запускает `sync-from-main.sh` каждый день в **09:00 локального времени**.

### Установка (один раз)

1. **Узнай абсолютный путь к клону Brain** на десктопе. Скажем, `/Users/yourname/Brain`.

2. **Подставь путь в plist.** Замени все три вхождения `REPLACE_WITH_REPO_PATH` на свой путь:

   ```bash
   REPO=/Users/yourname/Brain
   sed -i '' "s|REPLACE_WITH_REPO_PATH|$REPO|g" "$REPO/scripts/com.inburo.brain-sync.plist"
   ```

   (Если редактируешь рукой — открой `scripts/com.inburo.brain-sync.plist` и замени три `REPLACE_WITH_REPO_PATH`.)

3. **Скопируй plist в `~/Library/LaunchAgents/`** (стандартное место для user-level launchd):

   ```bash
   cp "$REPO/scripts/com.inburo.brain-sync.plist" ~/Library/LaunchAgents/
   ```

4. **Загрузи в launchd:**

   ```bash
   launchctl load -w ~/Library/LaunchAgents/com.inburo.brain-sync.plist
   ```

   Флаг `-w` помечает агент как enabled (выживёт reboot).

5. **Проверь, что launchd его видит:**

   ```bash
   launchctl list | grep brain-sync
   ```

   Должна быть строчка вроде `-  0  com.inburo.brain-sync` (PID `-` — не запущен сейчас, ждёт 9:00; exit `0` — последний запуск успешен).

### Проверка работы

После установки можно дёрнуть руками, не дожидаясь 9 утра:

```bash
launchctl start com.inburo.brain-sync
```

И посмотреть логи:

```bash
tail -20 ~/Brain/scripts/sync.log
tail -20 ~/Brain/scripts/sync.err.log
```

### Если Mac спал в 9:00

Launchd запустит задачу как только Mac проснётся, в течение нескольких минут. Это родное поведение `StartCalendarInterval` — пропущенные запуски подхватываются на wake.

### Отключить

```bash
launchctl unload -w ~/Library/LaunchAgents/com.inburo.brain-sync.plist
rm ~/Library/LaunchAgents/com.inburo.brain-sync.plist
```

### Сменить время

В plist измени блок `StartCalendarInterval`:

```xml
<key>StartCalendarInterval</key>
<dict>
    <key>Hour</key>
    <integer>9</integer>     <!-- 0–23 -->
    <key>Minute</key>
    <integer>0</integer>     <!-- 0–59 -->
</dict>
```

Затем перезагрузи: `launchctl unload && launchctl load -w ...`.

---

## Заметки

- `sync.log` и `sync.err.log` создаются launchd'ом в папке `scripts/` при первом запуске. Они **в `.gitignore`** — не коммитятся.
- Если хочешь синкать чаще раза в день — замени `StartCalendarInterval` на `StartInterval` (`<integer>СЕКУНДЫ</integer>`). Например, `3600` — раз в час.
- Скрипт не делает `git pull` напрямую: использует `fetch` + `update-ref` если ты на feature-ветке (чтобы не трогать твою рабочую ветку), и `merge --ff-only` если ты на main.
