# Развёртывание Directus на VPS пользователя

Когда у пользователя ещё нет Directus. Нужен его VPS (обычно уже есть — тот же, где задеплоен продукт) и доступ по SSH (IP, root, пароль — спроси, используй транзиентно, в файлы проекта не сохраняй).

## Шаги

1. **Проверь на сервере Docker.** `docker --version` и `docker compose version`. Нет — поставь по официальной инструкции Docker для ОС сервера.
2. **Выбери свободный порт.** По умолчанию Directus живёт на 8055. Проверь, что порт свободен и не конфликтует с продуктом/VPN на этом сервере.
3. **Создай папку и compose-файл.** `/opt/directus/docker-compose.yml`:

```yaml
services:
  directus:
    image: directus/directus:11
    restart: unless-stopped
    ports:
      - "8055:8055"
    volumes:
      - ./database:/directus/database
      - ./uploads:/directus/uploads
      - ./extensions:/directus/extensions
    environment:
      SECRET: "<сгенерируй длинную случайную строку>"
      ADMIN_EMAIL: "<email пользователя>"
      ADMIN_PASSWORD: "<сгенерируй и отдай пользователю>"
      DB_CLIENT: "sqlite3"
      DB_FILENAME: "/directus/database/data.db"
      PUBLIC_URL: "http://<IP-сервера>:8055"
      WEBSOCKETS_ENABLED: "true"
```

Замечания:
- Версию образа пиновать (`directus/directus:11`), не `latest` — чтобы рестарт не принёс неожиданный мажор. Для MCP нужен Directus 11.12+.
- Для прототипа и небольшого продукта SQLite достаточно и это меньше движущихся частей. Если у пользователя ожидается серьёзная нагрузка или уже стоит Postgres — используй `DB_CLIENT: "pg"` + DB_HOST/DB_PORT/DB_DATABASE/DB_USER/DB_PASSWORD и отдельный контейнер базы.
- Если у пользователя есть домен — поставь его в PUBLIC_URL и проксируй через nginx/caddy с HTTPS. Без домена работаем по IP:порт, это нормально для старта.

4. **Запусти:** `docker compose up -d` в `/opt/directus`. Первый старт создаёт базу и админа из env.
5. **Проверь:** открой `PUBLIC_URL` в браузере — должна открыться админка, вход по ADMIN_EMAIL/ADMIN_PASSWORD.
6. **Создай static token** для MCP: Settings → Users → администратор → Token → сгенерировать → сохранить. Отдай пользователю пароль админки и предупреди: токен даёт полный доступ, хранить только в конфиге MCP.
7. Вернись в SKILL.md → подключение MCP.

## Если что-то не поднялось

- Смотри логи: `docker compose logs directus --tail 100`.
- Частое: занятый порт (поменяй левую часть `ports`), кривой SECRET (не оставляй пустым), права на папки volumes (`chown -R 1000:1000 database uploads extensions`).
- Админка открывается, но MCP не подключается — проверь версию Directus (нужна 11.12+) и что токен создан у пользователя-администратора.
