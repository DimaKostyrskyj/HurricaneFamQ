const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('╔══════════════════════════════════════╗');
        console.log('║   🌊 Hurricane FamQ Bot Запущен!   ║');
        console.log('╚══════════════════════════════════════╝');
        console.log(`📊 Бот: ${client.user.tag}`);
        console.log(`🏠 Серверов: ${client.guilds.cache.size}`);
        console.log(`👥 Пользователей: ${client.users.cache.size}`);
        console.log('');
        console.log('✅ Модули загружены:');
        console.log(`   ├─ Команд: ${client.commands.size}`);
        console.log(`   ├─ Кнопок: ${client.buttons.size}`);
        console.log(`   └─ Модальных окон: ${client.modals.size}`);
        console.log('');
        console.log('🎮 Готов к работе!');
        console.log('══════════════════════════════════════');
        
        // Установка статуса бота
        client.user.setActivity('Hurricane FamQ | !help', { 
            type: ActivityType.Watching 
        });
    },
};
