// config.railway.js - Конфигурация для Railway с поддержкой переменных окружения

const fs = require('fs');
const path = require('path');

/**
 * Загрузка конфигурации с приоритетом переменных окружения
 * Порядок приоритета:
 * 1. Переменные окружения (для Railway)
 * 2. config.json (для локальной разработки)
 */
function loadConfig() {
    // Попытка загрузить config.json для локальной разработки
    let fileConfig = {};
    const configPath = path.join(__dirname, 'config.json');
    
    if (fs.existsSync(configPath)) {
        try {
            fileConfig = require('./config.json');
        } catch (error) {
            console.warn('⚠️  Не удалось загрузить config.json, используем переменные окружения');
        }
    }
    
    // Объединяем конфигурацию с приоритетом переменных окружения
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
            academy: process.env.ROLE_ACADEMY || fileConfig.roles?.academy || '1454963713999245506',
            guest: process.env.ROLE_GUEST || fileConfig.roles?.guest || '1454957599144284287',
        },
        
        colors: fileConfig.colors || {
            primary: '#00d4ff',
            success: '#00ff88',
            error: '#ff0000',
            warning: '#ffa500',
            info: '#0099ff'
        }
    };
    
    // Проверяем наличие обязательных параметров
    if (!config.token) {
        throw new Error('❌ DISCORD_TOKEN не найден! Установите переменную окружения или добавьте в config.json');
    }
    
    if (!config.clientId) {
        throw new Error('❌ CLIENT_ID не найден! Установите переменную окружения или добавьте в config.json');
    }
    
    if (!config.guildId) {
        throw new Error('❌ GUILD_ID не найден! Установите переменную окружения или добавьте в config.json');
    }
    
    console.log('✅ Конфигурация загружена успешно');
    console.log(`📊 Источник: ${process.env.DISCORD_TOKEN ? 'Переменные окружения (Railway)' : 'config.json (Локально)'}`);
    
    return config;
}

module.exports = loadConfig();