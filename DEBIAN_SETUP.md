# Установка Portainer на Debian 12

## Шаг 1: Установка Docker

### 1.1 Обновите систему
```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Установите необходимые пакеты
```bash
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

### 1.3 Добавьте ключ Docker
```bash
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

### 1.4 Добавьте репозиторий Docker
```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 1.5 Установите Docker
```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### 1.6 Проверьте установку
```bash
docker --version
docker run hello-world
```

### 1.7 Добавьте текущего пользователя в группу docker (опционально)
```bash
sudo usermod -aG docker $USER
newgrp docker  # Активировать группу без перезагрузки
```

---

## Шаг 2: Установка Portainer

### 2.1 Создайте том для данных Portainer
```bash
docker volume create portainer_data
```

### 2.2 Установите Portainer
```bash
docker run -d \
  -p 8000:8000 \
  -p 9000:9000 \
  -p 9443:9443 \
  --name=portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

### 2.3 Проверьте статус Portainer
```bash
docker ps | grep portainer
```

### 2.4 Откройте Portainer
- **Web Interface**: https://your-server-ip:9000 (или http://your-server-ip:9000)
- **Edge Agent**: port 8000
- **HTTPS**: port 9443

При первом входе создайте пароль администратора.

---

## Шаг 3: Подготовка папки проекта

### 3.1 Рекомендуемая структура директорий
```
/opt/
├── alu-satu/              ← Ваш проект
│   ├── docker-compose.yml
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   ├── .env
│   ├── src/
│   ├── server/
│   └── ...
└── docker-volumes/        ← Данные контейнеров
    ├── mongodb/
    └── ...
```

### 3.2 Создайте необходимые директории
```bash
sudo mkdir -p /opt/alu-satu
sudo mkdir -p /opt/docker-volumes/mongodb
sudo chown $USER:$USER /opt/alu-satu
sudo chown $USER:$USER -R /opt/docker-volumes
```

---

## Шаг 4: Загрузка проекта на сервер

### Вариант А: Через Git (рекомендуется)

```bash
cd /opt

# Если ещё нет репозитория
git clone https://github.com/ваш-профиль/alu-satu.git
cd alu-satu

# Если уже есть репозиторий
cd alu-satu
git pull
```

### Вариант Б: Через SCP (с локальной машины)

```bash
# На вашей локальной машине (Windows PowerShell)
scp -r "c:\Users\nurbe\Desktop\projects\alu-satu" user@your-debian-server:/opt/

# Или через WSL/Git Bash
scp -r /c/Users/nurbe/Desktop/projects/alu-satu user@your-debian-server:/opt/
```

### Вариант В: Через SFTP (WinSCP)

1. Откройте WinSCP
2. Подключитесь к серверу (SFTP протокол)
3. Перетащите папку `alu-satu` в `/opt/`

---

## Шаг 5: Настройка проекта на сервере

### 5.1 Перейдите в директорию проекта
```bash
cd /opt/alu-satu
```

### 5.2 Создайте файл .env
```bash
cp .env.example .env
nano .env
```

Отредактируйте переменные:
```env
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb://admin:强password123@mongodb:27017/alu-satu?authSource=admin
JWT_SECRET=your-super-secret-key-change-this
CORS_ORIGIN=http://your-server-ip,http://your-domain.com
VITE_API_URL=http://your-server-ip:4000/api
```

**Важно:** Измените `your-server-ip` на IP вашего сервера.

### 5.3 Проверьте файлы
```bash
ls -la
# Должны быть:
# docker-compose.yml
# Dockerfile.frontend
# Dockerfile.backend
# .env
# src/
# server/
```

---

## Шаг 6: Развертывание через Portainer

### 6.1 Откройте Portainer Web Interface
```
https://your-server-ip:9000
```

### 6.2 Развертывание Stack
1. Нажмите **Stacks** (левое меню)
2. Нажмите **+ Add stack**
3. Заполните:
   - **Name**: `alu-satu`
   - **Build method**: выберите `Upload` или `Editor`
4. Вставьте содержимое `docker-compose.yml` или загрузите файл
5. Нажмите **Deploy the stack**

### 6.3 Проверьте статус контейнеров
После развертывания должны запуститься:
- ✅ `alu-satu-frontend` (порт 3000)
- ✅ `alu-satu-backend` (порт 4000)
- ✅ `alu-satu-mongodb` (порт 27017)

---

## Шаг 7: Доступ к приложению

### Локально на сервере
```bash
# Фронтенд
curl http://localhost:3000

# Бэкенд
curl http://localhost:4000

# MongoDB
docker exec alu-satu-mongodb mongosh -u admin -p password123
```

### Удалённо
- **Фронтенд**: `http://your-server-ip:3000`
- **Бэкенд**: `http://your-server-ip:4000`

---

## Шаг 8: Настройка Reverse Proxy (Nginx)

### 8.1 Установите Nginx
```bash
sudo apt install -y nginx
```

### 8.2 Создайте конфигурацию
```bash
sudo nano /etc/nginx/sites-available/alu-satu
```

Вставьте:
```nginx
upstream backend {
    server localhost:4000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 8.3 Активируйте конфигурацию
```bash
sudo ln -s /etc/nginx/sites-available/alu-satu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Шаг 9: SSL сертификат (Let's Encrypt)

### 9.1 Установите Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 9.2 Получите сертификат
```bash
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com
```

### 9.3 Обновите Nginx конфигурацию
```bash
sudo nano /etc/nginx/sites-available/alu-satu
```

Добавьте HTTPS:
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # ... остальная конфигурация
}

# Редирект HTTP на HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 9.4 Перезапустите Nginx
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## Полезные команды

### Просмотр логов
```bash
# Все контейнеры проекта
docker-compose -f /opt/alu-satu/docker-compose.yml logs -f

# Конкретный сервис
docker-compose -f /opt/alu-satu/docker-compose.yml logs -f backend
docker-compose -f /opt/alu-satu/docker-compose.yml logs -f frontend
docker-compose -f /opt/alu-satu/docker-compose.yml logs -f mongodb
```

### Перезагрузка проекта
```bash
cd /opt/alu-satu
docker-compose down
docker-compose up -d
```

### Обновление проекта
```bash
cd /opt/alu-satu
git pull
docker-compose up -d --build
```

### Остановка/запуск
```bash
docker-compose stop
docker-compose start
```

### Удаление проекта
```bash
docker-compose down -v  # -v удаляет тома
```

---

## Решение проблем

### Портейнер не запускается
```bash
# Проверьте статус Docker
sudo systemctl status docker

# Перезагрузите Docker
sudo systemctl restart docker

# Проверьте контейнер Portainer
docker ps -a | grep portainer
docker logs portainer
```

### MongoDB не подключается
```bash
# Проверьте, запущена ли
docker ps | grep mongodb

# Проверьте логи
docker logs alu-satu-mongodb

# Проверьте credentials
docker exec alu-satu-mongodb mongosh -u admin -p password123
```

### Фронтенд не подключается к бэкенду
```bash
# Проверьте CORS
# Откройте браузер консоль (F12) и посмотрите ошибки

# Проверьте переменные окружения в frontend
docker exec alu-satu-frontend env | grep VITE

# Проверьте, запущен ли backend
curl http://localhost:4000/api
```

### Недостаточно прав
```bash
# Добавьте пользователя в docker группу
sudo usermod -aG docker $USER
```

### Мало места на диске
```bash
# Очистите неиспользуемые образы
docker image prune -a

# Очистите неиспользуемые тома
docker volume prune
```

---

## Мониторинг через Portainer

1. **Откройте Portainer**: https://your-server-ip:9000
2. **Выберите Stacks** → `alu-satu`
3. **Смотрите статус контейнеров** - должны быть зелеными ✅
4. **Logs** - просмотр логов каждого контейнера
5. **Stats** - просмотр использования памяти/CPU

---

## Резервная копия данных

### Экспорт MongoDB
```bash
docker exec alu-satu-mongodb mongodump -u admin -p password123 -o /dump
docker cp alu-satu-mongodb:/dump ./mongodb-backup
```

### Резервная копия всех томов
```bash
docker run --rm \
  -v portainer_data:/data \
  -v mongodb_data:/mongodb \
  -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz -C / data mongodb
```

---

## Автоматическое обновление

### Создайте скрипт обновления
```bash
sudo nano /opt/alu-satu/update.sh
```

```bash
#!/bin/bash
cd /opt/alu-satu
git pull
docker-compose up -d --build
docker image prune -f
echo "✅ Обновление завершено"
```

### Сделайте его исполняемым
```bash
chmod +x /opt/alu-satu/update.sh
```

### Добавьте в cron (например, каждый день в 3AM)
```bash
crontab -e
```

Добавьте строку:
```
0 3 * * * /opt/alu-satu/update.sh >> /var/log/alu-satu-update.log 2>&1
```

---

## Контакты и поддержка

- Docker: https://docs.docker.com/
- Portainer: https://docs.portainer.io/
- Debian: https://www.debian.org/doc/
- Nginx: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/
