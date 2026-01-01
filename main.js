const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

// Создаем клиент бота
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
    ]
});

// Коллекции для команд и кнопок
client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();

// Загрузка команд
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Загружена команда: ${command.data.name}`);
    } else {
        console.log(`⚠️ Команда ${file} не имеет data или execute`);
    }
}

// Загрузка обработчиков событий
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(`✅ Загружено событие: ${event.name}`);
}

// Загрузка обработчиков кнопок
const buttonsPath = path.join(__dirname, 'buttons');
const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
    const filePath = path.join(buttonsPath, file);
    const button = require(filePath);
    
    if ('customId' in button && 'execute' in button) {
        client.buttons.set(button.customId, button);
        console.log(`✅ Загружена кнопка: ${button.customId}`);
    }
}

// Загрузка обработчиков модальных окон
const modalsPath = path.join(__dirname, 'modals');
const modalFiles = fs.readdirSync(modalsPath).filter(file => file.endsWith('.js'));

for (const file of modalFiles) {
    const filePath = path.join(modalsPath, file);
    const modal = require(filePath);
    
    if ('customId' in modal && 'execute' in modal) {
        client.modals.set(modal.customId, modal);
        console.log(`✅ Загружено модальное окно: ${modal.customId}`);
    }
}

// Обработка команд
client.on('interactionCreate', async interaction => {
    // Обработка команд
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        
        if (!command) {
            console.error(`❌ Команда ${interaction.commandName} не найдена`);
            return;
        }
        
        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(`❌ Ошибка выполнения команды ${interaction.commandName}:`, error);
            
            const errorMessage = '❌ Произошла ошибка при выполнении команды!';
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
    
    // Обработка кнопок
    if (interaction.isButton()) {
        // Проверяем динамические кнопки (с ID пользователя)
        let buttonId = interaction.customId;
        let button = client.buttons.get(buttonId);
        
        // Если не найдена, проверяем базовый ID (для approve_, reject_, review_)
        if (!button) {
            const baseId = buttonId.split('_')[0];
            button = client.buttons.get(baseId);
        }
        
        if (!button) {
            console.error(`❌ Кнопка ${interaction.customId} не найдена`);
            return;
        }
        
        try {
            await button.execute(interaction, client);
        } catch (error) {
            console.error(`❌ Ошибка обработки кнопки ${interaction.customId}:`, error);
            
            const errorMessage = '❌ Произошла ошибка при обработке действия!';
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
    
    // Обработка модальных окон
    if (interaction.isModalSubmit()) {
        const modal = client.modals.get(interaction.customId);
        
        if (!modal) {
            console.error(`❌ Модальное окно ${interaction.customId} не найдено`);
            return;
        }
        
        try {
            await modal.execute(interaction, client);
        } catch (error) {
            console.error(`❌ Ошибка обработки модального окна ${interaction.customId}:`, error);
            
            const errorMessage = '❌ Произошла ошибка при обработке формы!';
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
});

// Запуск бота
client.login(config.token);
