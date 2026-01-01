const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

/**
 * Отправка лога в канал логов
 * @param {Client} client - Discord клиент
 * @param {string} type - Тип лога (info, success, error, warning)
 * @param {string} title - Заголовок лога
 * @param {string} description - Описание действия
 * @param {User} user - Пользователь (опционально)
 * @param {Object} fields - Дополнительные поля (опционально)
 */
async function sendLog(client, type, title, description, user = null, fields = null) {
    const logsChannel = client.channels.cache.get(config.channels.logs);
    
    if (!logsChannel) {
        console.error('❌ Канал логов не найден!');
        return;
    }
    
    const colors = {
        info: config.colors.info,
        success: config.colors.success,
        error: config.colors.error,
        warning: config.colors.warning
    };
    
    const emojis = {
        info: 'ℹ️',
        success: '✅',
        error: '❌',
        warning: '⚠️'
    };
    
    const embed = new EmbedBuilder()
        .setTitle(`${emojis[type] || 'ℹ️'} ${title}`)
        .setDescription(description)
        .setColor(colors[type] || colors.info)
        .setTimestamp();
    
    if (user) {
        embed.setFooter({ 
            text: `${user.tag} (${user.id})`,
            iconURL: user.displayAvatarURL({ dynamic: true })
        });
    }
    
    if (fields) {
        for (const [name, value] of Object.entries(fields)) {
            embed.addFields({ name, value, inline: true });
        }
    }
    
    try {
        await logsChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('❌ Ошибка отправки лога:', error);
    }
}

/**
 * Логирование заявки
 */
async function logApplication(client, applicant, action, moderator = null) {
    const actionText = {
        'submitted': 'подал заявку',
        'approved': 'одобрена',
        'rejected': 'отклонена',
        'reviewing': 'взята на рассмотрение'
    };
    
    const types = {
        'submitted': 'info',
        'approved': 'success',
        'rejected': 'error',
        'reviewing': 'warning'
    };
    
    const description = moderator 
        ? `${moderator} ${actionText[action]} заявку ${applicant}`
        : `${applicant} ${actionText[action]}`;
    
    await sendLog(client, types[action], 'Заявка в семью', description, applicant);
}

/**
 * Логирование контракта
 */
async function logContract(client, creator, action, contractName) {
    const actionText = {
        'created': 'создал контракт',
        'started': 'начал контракт',
        'finished': 'завершил контракт',
        'joined': 'записался на контракт',
        'left': 'выписался с контракта'
    };
    
    const types = {
        'created': 'success',
        'started': 'info',
        'finished': 'warning',
        'joined': 'info',
        'left': 'warning'
    };
    
    const description = `${creator} ${actionText[action]} "${contractName}"`;
    
    await sendLog(client, types[action], 'Контракты', description, creator);
}

/**
 * Логирование команды
 */
async function logCommand(client, user, commandName, channelName) {
    const description = `Использована команда \`${commandName}\` в ${channelName}`;
    
    await sendLog(client, 'info', 'Команда использована', description, user);
}

module.exports = {
    sendLog,
    logApplication,
    logContract,
    logCommand
};
