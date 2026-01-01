const { REST, Routes } = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`✅ Загружена команда: ${command.data.name}`);
    } else {
        console.log(`⚠️ Команда ${file} не имеет data или execute`);
    }
}

const rest = new REST().setToken(config.token);

(async () => {
    try {
        console.log('');
        console.log(`🔄 Начинается регистрация ${commands.length} команд...`);
        
        const data = await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands },
        );
        
        console.log('');
        console.log(`✅ Успешно зарегистрировано ${data.length} команд!`);
        console.log('');
        console.log('Зарегистрированные команды:');
        data.forEach(cmd => {
            console.log(`   ├─ /${cmd.name} - ${cmd.description}`);
        });
        console.log('');
        console.log('🎉 Готово! Теперь можно запустить бота командой: npm start');
    } catch (error) {
        console.error('❌ Ошибка регистрации команд:', error);
    }
})();
