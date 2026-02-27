# Руководство по развертыванию на Portainer

## Предварительные требования

1. **Portainer уже установлен** и доступен (обычно на `localhost:9000` или на вашем сервере)
2. **Docker** установлен на хосте
3. **Git** для клонирования проекта

## Шаг 1: Подготовка проекта

### На локальной машине:
```bash
# Клонируйте репозиторий или подготовьте проект
cd alu-satu

# Убедитесь, что есть .env файл с нужными переменными
cp .env.example .env
```

### Отредактируйте переменные окружения в `.env`:
```
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb://admin:password123@mongodb:27017/alu-satu?authSource=admin
JWT_SECRET=your-super-secret-key-change-this
CORS_ORIGIN=http://your-domain.com,http://www.your-domain.com
VITE_API_URL=http://your-domain.com/api
```

## Шаг 2: Загрузка на сервер

### Вариант A: Через Git
```bash
ssh user@your-server.com
cd /opt
git clone <your-repo-url> alu-satu
cd alu-satu
```

### Вариант B: Через SCP
```bash
scp -r alu-satu user@your-server.com:/opt/
ssh user@your-server.com
cd /opt/alu-satu
```

## Шаг 3: Развертывание в Portainer

### Метод 1: Через Portainer Web Interface

1. **Откройте Portainer** (http://your-server:9000)
2. Выберите среду (Environment)
3. Перейдите в **Стек (Stacks)** → **+ Add Stack**
4. Заполните форму:
   - **Name**: `alu-satu`
   - **Build method**: `Upload` или вставьте содержимое `docker-compose.yml`
5. Нажмите **Deploy the stack**

### Метод 2: Через Portainer API
```bash
curl -X POST http://your-server:9000/api/stacks \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d @stack.json
```

### Метод 3: Через Docker Compose (если Portainer имеет доступ)
```bash
docker-compose -f docker-compose.yml up -d
```

## Шаг 4: Проверка статуса

### В Portainer:
1. Откройте стек `alu-satu`
2. Проверьте статус контейнеров (должны быть зелеными)
3. Откройте **Details** для каждого сервиса

### Через CLI:
```bash
docker ps
docker logs alu-satu-frontend
docker logs alu-satu-backend
docker logs alu-satu-mongodb
```

## Шаг 5: Настройка Reverse Proxy

### Вариант A: Nginx на хосте
```nginx
upstream backend {
    server localhost:4000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Вариант B: Traefik (интеграция с Docker)
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.frontend.rule=Host(`your-domain.com`)"
  - "traefik.http.services.frontend.loadbalancer.server.port=3000"
```

## Шаг 6: SSL/HTTPS (Let's Encrypt)

### С помощью Certbot:
```bash
sudo certbot certonly --standalone -d your-domain.com
```

### В Nginx:
```nginx
listen 443 ssl http2;
ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
```

## Важные моменты

### Переменные окружения
- **MONGO_URI**: Используйте имя сервиса (`mongodb`) вместо `localhost`
- **JWT_SECRET**: Измените на сильный пароль перед продакшеном
- **CORS_ORIGIN**: Добавьте ваш домен для безопасности

### Безопасность Mongo
- Измените `MONGO_INITDB_ROOT_PASSWORD` на сильный пароль
- Хранить credentials в `.env` файле (не в git)
- Использовать `mongo:// ` протокол с аутентификацией

### Масштабирование
Для масштабирования отредактируйте `docker-compose.yml`:
```yaml
backend:
  deploy:
    replicas: 3  # Количество экземпляров
```

## Мониторинг

### Просмотр логов в Portainer
- Выберите контейнер → **Logs**
- Фильтруйте по сервису

### Через CLI
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

## Перезагрузка и обновления

### Перезагрузить стек
```bash
docker-compose down && docker-compose up -d
```

### Обновить код
```bash
git pull
docker-compose up -d --build
```

## Решение проблем

### Frontend не может подключиться к Backend
- Проверьте `VITE_API_URL` в переменных окружения
- Убедитесь, что Backend запущен и на правильном порту

### MongoDB не запускается
- Проверьте объем (`mongodb_data`)
- Проверьте права доступа: `docker exec alu-satu-mongodb mongosh -u admin -p password123`

### Контейнер перезагружается
- Проверьте логи: `docker logs alu-satu-backend`
- Убедитесь в правильности переменных окружения

## Дополнительная документация
- [Docker Documentation](https://docs.docker.com/)
- [Portainer Documentation](https://docs.portainer.io/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
