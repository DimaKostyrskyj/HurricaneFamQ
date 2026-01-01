const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');
const { logContract } = require('../utils/logger');
const fs = require('fs');
const path = require('path');

module.exports = {
    customId: 'contract_modal',
    
    async execute(interaction, client) {
        const contractName = interaction.fields.getTextInputValue('contract_name');
        const reward = interaction.fields.getTextInputValue('reward');
        const durationExecution = interaction.fields.getTextInputValue('duration_execution');
        const completeFor = interaction.fields.getTextInputValue('complete_for');
        const chance = interaction.fields.getTextInputValue('chance');
        
        // Парсим награду и срок
        const [rewardMoney, rewardAmount] = reward.includes('/') 
            ? reward.split('/').map(r => r.trim()) 
            : [reward, 'не указано'];
        
        const [contractDuration, executionTime] = durationExecution.includes('/') 
            ? durationExecution.split('/').map(d => d.trim()) 
            : [durationExecution, 'не указано'];
        
        // Создаем embed контракта в стиле Price Bot
        const embed = new EmbedBuilder()
            .setTitle(`📋 ${contractName}`)
            .setDescription(
                `━━━━━━━━━━━━━━━━━━━━\n` +
                `**👤 Создал:** ${interaction.user}\n` +
                `━━━━━━━━━━━━━━━━━━━━`
            )
            .setColor(0x2b2d31)
            .addFields(
                { name: '💰 Награда:', value: `${rewardMoney} / ${rewardAmount}`, inline: false },
                { name: '⏰ Срок действия контракта:', value: contractDuration, inline: false },
                { name: '🕒 Контракт длится:', value: executionTime, inline: false },
                { name: '⚡ Выполнить за:', value: completeFor, inline: false },
                { name: '🎲 Шанс:', value: chance, inline: false },
                { name: '📊 Участники:', value: '❌ Пока нет участников', inline: false },
                { name: '🟢 Статус:', value: '✅ Открыта регистрация', inline: false }
            )
            .setFooter({ text: 'Hurricane FamQ' })
            .setTimestamp();
        
        // Создаем кнопки для контракта
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('contract_join')
                    .setLabel('Записаться')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🟢'),
                new ButtonBuilder()
                    .setCustomId('contract_leave')
                    .setLabel('Выписаться')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔴'),
                new ButtonBuilder()
                    .setCustomId('contract_start')
                    .setLabel('Начать контракт')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('▶️')
            );
        
        // Отправляем в канал контрактов
        const contractsChannel = client.channels.cache.get(config.channels.contracts);
        
        if (!contractsChannel) {
            return interaction.reply({ 
                content: '❌ Канал контрактов не найден! Обратитесь к администратору.', 
                ephemeral: true 
            });
        }
        
        // Упоминаем семью и академию
        const famRole = interaction.guild.roles.cache.get(config.roles.fam);
        const academyRole = interaction.guild.roles.cache.get(config.roles.academy);
        
        let roleMentions = [];
        let roleNames = [];
        
        if (famRole) {
            roleMentions.push(famRole.toString());
            roleNames.push(famRole.name);
        }
        if (academyRole) {
            roleMentions.push(academyRole.toString());
            roleNames.push(academyRole.name);
        }
        
        const mention = roleMentions.length > 0 ? roleMentions.join(' ') : '';
        
        const message = await contractsChannel.send({ 
            content: mention, 
            embeds: [embed], 
            components: [row] 
        });
        
        // Создаем тред для контракта
        try {
            await message.startThread({
                name: `🚀 ${contractName.substring(0, 80)}`,
                autoArchiveDuration: 1440 // 24 часа
            });
        } catch (error) {
            console.error('❌ Ошибка создания треда:', error);
        }
        
        // Сохраняем контракт
        const contractsPath = path.join(__dirname, '..', 'data', 'contracts.json');
        let contracts = {};
        
        if (fs.existsSync(contractsPath)) {
            contracts = JSON.parse(fs.readFileSync(contractsPath, 'utf8'));
        }
        
        contracts[message.id] = {
            name: contractName,
            creator: interaction.user.id,
            participants: [],
            status: 'open',
            timestamp: Date.now()
        };
        
        // Создаем директорию data если её нет
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        fs.writeFileSync(contractsPath, JSON.stringify(contracts, null, 4));
        
        // Логируем
        await logContract(client, interaction.user, 'created', contractName);
        
        const roleNamesText = roleNames.length > 0 ? roleNames.join(' и ') : 'не найдены';
        
        await interaction.reply({ 
            content: `✅ Контракт "${contractName}" успешно опубликован! Тегнуты роли: **${roleNamesText}**`, 
            ephemeral: true 
        });
    },
};
