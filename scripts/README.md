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

> **Важно:** `sed` подставляем в **копии** plist'а внутри `~/Library/LaunchAgents/`, а не в tracked-файле репо. Если sed'нуть tracked-файл, working tree станет dirty → следующий запуск `sync-from-main.sh` упрётся в exit 2 («uncommitted changes»). Tracked-файл всегда остаётся с placeholder'ом.

1. **Узнай абсолютный путь к клону Brain** на десктопе. Скажем, `/Users/yourname/Brain`.

2. **Скопируй plist в `~/Library/LaunchAgents/`** (стандартное место для user-level launchd) — сначала копия, потом sed:

   ```bash
   REPO=/Users/yourname/Brain
   cp "$REPO/scripts/com.inburo.brain-sync.plist" ~/Library/LaunchAgents/
   ```

3. **Подставь путь в копии.** Замени все три вхождения `REPLACE_WITH_REPO_PATH` в установленной копии:

   ```bash
   sed -i '' "s|REPLACE_WITH_REPO_PATH|$REPO|g" ~/Library/LaunchAgents/com.inburo.brain-sync.plist
   ```

   (Если редактируешь рукой — открой `~/Library/LaunchAgents/com.inburo.brain-sync.plist` и замени три `REPLACE_WITH_REPO_PATH`. Файл **в репо** не трогай.)

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

## On-demand push: Cloudflare Tunnel trigger (опционально)

Позволяет удалённой Claude-сессии (или ssh-сессии) сказать «потяни main сейчас» вместо ожидания 9:00. Архитектура:

```
[cloud Claude]  --HTTPS POST--> [Cloudflare edge] --tunnel--> [cloudflared on Mac] --localhost--> [sync-trigger-server.py] --launchctl start--> [sync-from-main.sh]
```

Безопасность: shared secret в header `X-Brain-Sync-Secret`. Python-сервер биндится только на 127.0.0.1, наружу ничего не торчит — Cloudflare Tunnel это единственный путь к нему.

### Файлы

- `sync-trigger-server.py` — Python HTTP-listener на 127.0.0.1:8765. Принимает `POST /sync` с заголовком `X-Brain-Sync-Secret`, дёргает `launchctl start com.inburo.brain-sync`.
- `com.inburo.brain-sync-trigger.plist` — LaunchAgent для listener'а. `RunAtLoad=true`, `KeepAlive=true`.
- `cloudflared-tunnel.example.yml` — template конфига для cloudflared (с placeholder'ами для UUID туннеля, имени пользователя Mac, домена).
- `trigger-sync.sh` — cloud-side скрипт. Читает `BRAIN_SYNC_URL` и `BRAIN_SYNC_SECRET` из env или из `scripts/.trigger.env`, делает curl.
- `.trigger.env.example` — template для cloud-side секрета. Реальный `scripts/.trigger.env` в `.gitignore`.

### Установка на Mac (один раз)

1. **Инструменты:**
   ```bash
   brew install cloudflared
   ```

2. **Регистрация туннеля** (требует Cloudflare аккаунт + домен в Cloudflare DNS):
   ```bash
   cloudflared tunnel login                                    # авторизация
   cloudflared tunnel create brain-sync                        # создаёт туннель, печатает UUID
   cloudflared tunnel route dns brain-sync \
     brain-sync.YOUR-DOMAIN.com                                # public DNS
   ```

3. **Конфиг cloudflared:**
   ```bash
   REPO=/Users/yourname/Brain
   cp "$REPO/scripts/cloudflared-tunnel.example.yml" ~/.cloudflared/config.yml
   ```
   Открой `~/.cloudflared/config.yml` руками, замени три placeholder'а: `REPLACE_WITH_TUNNEL_UUID`, `REPLACE_WITH_MAC_USERNAME`, `REPLACE_WITH_YOUR_DOMAIN`.

4. **Тест в foreground:**
   ```bash
   cloudflared tunnel run brain-sync
   ```
   В другом терминале (на Mac или с любой машины):
   ```bash
   curl https://brain-sync.YOUR-DOMAIN.com/health        # должен ответить "ok"
   ```
   Останови Ctrl+C.

5. **Cloudflared как системный сервис:**
   ```bash
   sudo cloudflared service install
   ```
   Это создаст LaunchDaemon в `/Library/LaunchDaemons/`, cloudflared будет стартовать при загрузке Mac.

6. **Сгенерируй secret:**
   ```bash
   openssl rand -hex 32
   ```
   Запомни — он понадобится и на Mac, и на cloud-стороне.

7. **Установи trigger-listener LaunchAgent** (по тому же паттерну что main sync — sed по копии, не по tracked-файлу):
   ```bash
   cp "$REPO/scripts/com.inburo.brain-sync-trigger.plist" ~/Library/LaunchAgents/
   sed -i '' "s|REPLACE_WITH_REPO_PATH|$REPO|g" \
     ~/Library/LaunchAgents/com.inburo.brain-sync-trigger.plist
   sed -i '' "s|REPLACE_WITH_SECRET|ТВОЙ_СЕКРЕТ|" \
     ~/Library/LaunchAgents/com.inburo.brain-sync-trigger.plist
   launchctl load -w ~/Library/LaunchAgents/com.inburo.brain-sync-trigger.plist
   ```

8. **Проверь listener:**
   ```bash
   launchctl list | grep brain-sync-trigger
   tail -5 ~/Brain/scripts/sync-trigger.log
   # должно быть "brain-sync trigger listening on 127.0.0.1:8765"

   curl https://brain-sync.YOUR-DOMAIN.com/health
   # должно быть "ok"

   curl -X POST -H "X-Brain-Sync-Secret: ТВОЙ_СЕКРЕТ" \
     https://brain-sync.YOUR-DOMAIN.com/sync
   # должно быть "sync triggered"
   ```

### Использование с cloud-стороны

В этой Brain-папке (или где живёт remote-клон):

```bash
# один раз создать конфиг
cp scripts/.trigger.env.example scripts/.trigger.env
# отредактировать scripts/.trigger.env — URL и секрет

# дальше каждый раз когда нужен sync
scripts/trigger-sync.sh
```

`scripts/.trigger.env` в `.gitignore` — не коммитится. Если cloud-контейнер эфемерный (как Claude Code on the web) — при каждом новом контейнере конфиг придётся пересоздавать. Альтернатива: передавать `BRAIN_SYNC_URL` и `BRAIN_SYNC_SECRET` как env-переменные сессии.

### Отключить trigger-listener

```bash
launchctl unload -w ~/Library/LaunchAgents/com.inburo.brain-sync-trigger.plist
rm ~/Library/LaunchAgents/com.inburo.brain-sync-trigger.plist
```

Cloudflared service отключается отдельно:
```bash
sudo cloudflared service uninstall
```

---

## Заметки

- `sync.log`, `sync.err.log`, `sync-trigger.log`, `sync-trigger.err.log`, `.trigger.env` — все в `.gitignore`. Не коммитятся.
- Если хочешь синкать чаще раза в день БЕЗ tunnel-инфры — замени `StartCalendarInterval` на `StartInterval` (`<integer>СЕКУНДЫ</integer>`). Например, `3600` — раз в час.
- Скрипт не делает `git pull` напрямую: использует `fetch` + `update-ref` если ты на feature-ветке (чтобы не трогать твою рабочую ветку), и `merge --ff-only` если ты на main.
- Tunnel-механизм независим от daily-launchd. Daily 09:00 — safety net на случай если ты забыл триггернуть руками, либо если домен/туннель временно недоступен.
