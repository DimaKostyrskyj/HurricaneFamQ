const { EmbedBuilder } = require('discord.js');
const config = require('../config.railway.js');
const { logContract } = require('../utils/logger');
const fs = require('fs');
const path = require('path');

module.exports = {
    customId: 'contract_join',
    
    async execute(interaction, client) {
        const messageId = interaction.message.id;
        
        // Загружаем контракты
        const contractsPath = path.join(__dirname, '..', 'data', 'contracts.json');
        let contracts = {};
        
        if (fs.existsSync(contractsPath)) {
            contracts = JSON.parse(fs.readFileSync(contractsPath, 'utf8'));
        }
        
        if (!contracts[messageId]) {
            return interaction.reply({ 
                content: '❌ Контракт не найден!', 
                ephemeral: true 
            });
        }
        
        const userId = interaction.user.id;
        
        // Проверяем, не записан ли уже пользователь
        if (contracts[messageId].participants.includes(userId)) {
            return interaction.reply({ 
                content: '❌ Вы уже записаны на этот контракт!', 
                ephemeral: true 
            });
        }
        
        // Добавляем пользователя
        contracts[messageId].participants.push(userId);
        fs.writeFileSync(contractsPath, JSON.stringify(contracts, null, 4));
        
        // Обновляем embed
        const embed = interaction.message.embeds[0];
        
        // Формируем список участников
        const participants = await Promise.all(
            contracts[messageId].participants.map(async (id) => {
                try {
                    const member = await interaction.guild.members.fetch(id);
                    return `✅ ${member}`;
                } catch {
                    return null;
                }
            })
        );
        
        const participantsList = participants.filter(p => p !== null);
        const participantsText = participantsList.length > 0 
            ? participantsList.join('\n') 
            : '❌ Пока нет участников';
        
        // Обновляем поле участников
        const participantsFieldIndex = embed.fields.findIndex(field => 
            field.name.includes('Участники')
        );
        
        if (participantsFieldIndex !== -1) {
            embed.fields[participantsFieldIndex].value = participantsText;
        }
        
        await interaction.message.edit({ embeds: [embed] });
        
        // Логируем
        await logContract(client, interaction.user, 'joined', contracts[messageId].name);
        
        await interaction.reply({ 
            content: '✅ Вы записались на контракт!', 
            ephemeral: true 
        });
    },
};
