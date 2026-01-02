# 🚀 Пошаговая инструкция для Railway (main.js версия)

## ✅ ШАГ 1: Подготовка файлов

### Добавьте эти файлы в корень вашего проекта:

#### 1. **Dockerfile** (ОБЯЗАТЕЛЬНО)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "main.js"]
```

#### 2. **.dockerignore**
```
node_modules
.git
.env
*.log
data/
.DS_Store
```

#### 3. **railway.json**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node main.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 4. **Procfile**
```
worker: node main.js
```

#### 5. **nixpacks.toml**
```toml
[phases.setup]
nixPkgs = ["nodejs_18"]

[phases.install]
cmds = ["npm ci --only=production"]

[start]
cmd = "node main.js"
```

---

## ✅ ШАГ 2: Обновите main.js

В начале файла `main.js` замените:

**БЫЛО:**
```javascript
const config = require('./config.json');
```

**СТАЛО:**
```javascript
// Загружаем конфигурацию (поддержка Railway и локальной разработки)
let config;
try {
    config = require('./config.railway.js');
} catch (error) {
    console.error('❌ Ошибка загрузки конфигурации:', error.message);
    process.exit(1);
}
```

---

## ✅ ШАГ 3: Добавьте config.railway.js

Создайте файл **config.railway.js** в корне проекта:

```javascript
// config.railway.js
const fs = require('fs');
const path = require('path');

function loadConfig() {
    let fileConfig = {};
    const configPath = path.join(__dirname, 'config.json');
    
    if (fs.existsSync(configPath)) {
        try {
            fileConfig = require('./config.json');
        } catch (error) {
            console.warn('⚠️  Не удалось загрузить config.json, используем переменные окружения');
        }
    }
    
    const config = {
        token: process.env.DISCORD_TOKEN || fileConfig.token,
        clientId: process.env.CLIENT_ID || fileConfig.clientId,
        guildId: process.env.GUILD_ID || fileConfig.guildId,
        
        channels: {
            welcome: process.env.CHANNEL_WELCOME || fileConfig.channels?.welcome,
            apply: process.env.CHANNEL_APPLY || fileConfig.channels?.apply,
            applications: process.env.CHANNEL_APPLICATIONS || fileConfig.channels?.applications,
            contracts: process.env.CHANNEL_CONTRACTS || fileConfig.channels?.contracts,
            logs: process.env.CHANNEL_LOGS || fileConfig.channels?.logs,
        },
        
        roles: {
            dev: process.env.ROLE_DEV || fileConfig.roles?.dev,
            owner: process.env.ROLE_OWNER || fileConfig.roles?.owner,
            dep_owner: process.env.ROLE_DEP_OWNER || fileConfig.roles?.dep_owner,
            ass: process.env.ROLE_ASS || fileConfig.roles?.ass,
            rec: process.env.ROLE_REC || fileConfig.roles?.rec,
            contract: process.env.ROLE_CONTRACT || fileConfig.roles?.contract,
            fam: process.env.ROLE_FAM || fileConfig.roles?.fam,
            academy: process.env.ROLE_ACADEMY || fileConfig.roles?.academy,
        },
        
        colors: fileConfig.colors || {
            primary: '#00d4ff',
            success: '#00ff88',
            error: '#ff0000',
            warning: '#ffa500',
            info: '#0099ff'
        }
    };
    
    if (!config.token) {
        throw new Error('❌ DISCORD_TOKEN не найден! Установите переменную окружения или добавьте в config.json');
    }
    
    if (!config.clientId) {
        throw new Error('❌ CLIENT_ID не найден!');
    }
    
    if (!config.guildId) {
        throw new Error('❌ GUILD_ID не найден!');
    }
    
    console.log('✅ Конфигурация загружена успешно');
    console.log(`📊 Источник: ${process.env.DISCORD_TOKEN ? 'Переменные окружения (Railway)' : 'config.json (Локально)'}`);
    
    return config;
}

module.exports = loadConfig();
```

---

## ✅ ШАГ 4: Обновите все импорты config

Во ВСЕХ файлах (commands, buttons, events, modals, utils) замените:
```javascript
const config = require('../config.json');
```

На:
```javascript
const config = require('../config.railway.js');
```

Или:
```javascript
const config = require('./config.railway.js');
```

---

## ✅ ШАГ 5: Загрузите на GitHub

```bash
git add .
git commit -m "Add Railway support with Dockerfile"
git push
```

---

## ✅ ШАГ 6: Настройте Railway

### 6.1 Создайте проект
1. Откройте https://railway.app
2. **Login with GitHub**
3. **New Project** → **Deploy from GitHub repo**
4. Выберите ваш репозиторий

### 6.2 Настройте переменные окружения

В Railway → **Variables** → **Raw Editor** вставьте:

```env
DISCORD_TOKEN=ваш_токен_бота
CLIENT_ID=ваш_client_id
GUILD_ID=ваш_guild_id

CHANNEL_WELCOME=1454957601899942043
CHANNEL_APPLY=1454957601899942044
CHANNEL_APPLICATIONS=1455016020929413160
CHANNEL_CONTRACTS=1455542583853056192
CHANNEL_LOGS=1456400749134090585

ROLE_DEV=1454957599228432552
ROLE_OWNER=1454957599228432551
ROLE_DEP_OWNER=1454957599228432550
ROLE_ASS=1454957599228432549
ROLE_REC=1455014214350668041
ROLE_CONTRACT=1455508258696593632
ROLE_FAM=1454957599207194625
ROLE_ACADEMY=1454963713999245506
```

**ВАЖНО:** Замените значения на ваши реальные!

---

## ✅ ШАГ 7: Проверьте деплой

### После автоматического деплоя проверьте логи:

Railway → **Deployments** → **View Logs**

**Должно быть:**
```
✅ Конфигурация загружена успешно
📊 Источник: Переменные окружения (Railway)
╔══════════════════════════════════════╗
║   🌊 Hurricane FamQ Bot Запущен!   ║
╚══════════════════════════════════════╝
```

---

## ✅ ШАГ 8: Зарегистрируйте команды

### Способ 1: Через Railway CLI
```bash
railway login
railway run node deploy-commands.js
```

### Способ 2: Временно измените Start Command
1. Settings → Deploy → **Custom Start Command**
2. Введите: `node deploy-commands.js && node main.js`
3. Дождитесь деплоя
4. Верните обратно: `node main.js`

---

## ✅ ШАГ 9: Настройте Discord

В Discord выполните команды:
1. `/setup_apply` - в канале для заявок
2. `/setup_contract` - в канале контрактов
3. `/help` - проверить все команды

---

## 🎯 Структура проекта должна быть:

```
hurricane-famq-bot/
├── buttons/
├── commands/
├── events/
├── modals/
├── utils/
├── main.js              ← Главный файл
├── config.railway.js    ← Новый файл
├── deploy-commands.js
├── package.json
├── Dockerfile          ← Новый файл
├── .dockerignore       ← Новый файл
├── railway.json        ← Новый файл
├── nixpacks.toml       ← Новый файл
└── Procfile            ← Новый файл
```

---

## 🔍 Решение проблем

### ❌ "Script start.sh not found"
→ Убедитесь что есть `Dockerfile` в корне проекта

### ❌ "DISCORD_TOKEN не найден"
→ Проверьте переменные окружения в Railway

### ❌ "Cannot find module './config.railway.js'"
→ Убедитесь что файл `config.railway.js` загружен на GitHub

### ❌ Бот не отвечает на команды
→ Выполните `railway run node deploy-commands.js`

---

## ✅ Чек-лист

- [ ] Добавлен `Dockerfile`
- [ ] Добавлен `.dockerignore`
- [ ] Добавлен `railway.json`
- [ ] Добавлен `nixpacks.toml`
- [ ] Добавлен `Procfile`
- [ ] Создан `config.railway.js`
- [ ] Обновлен `main.js` (использует config.railway.js)
- [ ] Обновлены импорты во всех файлах
- [ ] Закоммичено и запушено на GitHub
- [ ] Настроены переменные в Railway
- [ ] Проверены логи - бот запустился
- [ ] Зарегистрированы команды
- [ ] Выполнены setup команды в Discord

---

🌊 **После выполнения всех шагов бот будет работать 24/7 на Railway!**
