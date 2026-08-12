const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { VitalityManager } = require('../../utils/vitalityManager');
const roleConfig = require('../../config/roles');

function checkIsAdmin(member) {
    return member.permissions.has(PermissionFlagsBits.Administrator) ||
        (roleConfig.adminRoleId && member.roles.cache.has(roleConfig.adminRoleId));
}

function getVitalityBonus(vitality) {
    if (vitality <= 20) return 10;
    if (vitality <= 40) return 6;
    if (vitality <= 60) return 4;
    if (vitality <= 80) return 2;
    return 0;
}

module.exports = {
    name: 'vitalidade',
    async execute(message, args) {
        const subCommand = args[0]?.toLowerCase();

        // 1. Consulta de Vitalidade: -vitalidade [@Lutador]
        if (!subCommand || subCommand.startsWith('<@')) {
            const targetUser = message.mentions.users.first() || message.author;
            const vit = VitalityManager.getVitality(targetUser.id);

            const embed = new EmbedBuilder()
                .setTitle(`❤️ VITALIDADE DA CARREIRA`)
                .setColor(vit > 60 ? 0x2ecc71 : vit > 30 ? 0xf1c40f : 0xe74c3c)
                .setDescription(`Atleta: <@${targetUser.id}>\n\n📊 **Vitalidade Atual:** \`${vit} / 100\``)
                .setFooter({ text: 'MMA RP • Sistema de Vitalidade' })
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        // 2. Definir Vitalidade (Exclusivo Staff): -vitalidade set @Lutador <valor>
        if (subCommand === 'set') {
            if (!checkIsAdmin(message.member)) {
                return message.reply('❌ Apenas membros da Staff podem alterar a vitalidade.');
            }

            const targetUser = message.mentions.users.first();
            const newValue = parseInt(args[2]);

            if (!targetUser || isNaN(newValue)) {
                return message.reply('❌ **Uso correto:** `-vitalidade set @Lutador <valor>`');
            }

            const setVit = VitalityManager.setVitality(targetUser.id, newValue);
            return message.reply(`✅ **Vitalidade de <@${targetUser.id}> ajustada para \`${setVit}/100\`!**`);
        }

        // 3. Aplicação Pós-Luta (Exclusivo Staff): -vitalidade posluta <tipo> @Lutador
        // Tipos: dominante (0), equilibrada (-1), guerra3 (-2), guerra5 (-3), tko (-4), ko (-5)
        if (subCommand === 'posluta') {
            if (!checkIsAdmin(message.member)) {
                return message.reply('❌ Apenas membros da Staff podem registrar pós-luta.');
            }

            const type = args[1]?.toLowerCase();
            const targetUser = message.mentions.users.first();

            const penalties = {
                dominante: 0,
                equilibrada: 1,
                guerra3: 2,
                guerra5: 3,
                tko: 4,
                ko: 5
            };

            if (!type || penalties[type] === undefined || !targetUser) {
                return message.reply('❌ **Uso correto:** `-vitalidade posluta <dominante|equilibrada|guerra3|guerra5|tko|ko> @Lutador`');
            }

            const penalty = penalties[type];
            const oldVit = VitalityManager.getVitality(targetUser.id);
            const newVit = VitalityManager.deductVitality(targetUser.id, penalty);

            const embed = new EmbedBuilder()
                .setTitle(`📉 ATUALIZAÇÃO PÓS-LUTA DE VITALIDADE`)
                .setColor(0xe67e22)
                .setDescription(`>>> Atleta: <@${targetUser.id}>\n**Resultado/Tipo:** \`${type.toUpperCase()}\`\n**Redução Aplicada:** \`-${penalty} pts\``)
                .addFields(
                    { name: '❤️ Vitalidade Anterior', value: `\`${oldVit}/100\``, inline: true },
                    { name: '💔 Vitalidade Atual', value: `\`${newVit}/100\``, inline: true }
                )
                .setFooter({ text: 'Sistema de Pós-Luta • MMA RP' })
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        // 4. Roll de Lesão (Exclusivo Staff): -vitalidade lesao <d50|d75|d100> @Lutador
        if (subCommand === 'lesao') {
            if (!checkIsAdmin(message.member)) {
                return message.reply('❌ Apenas membros da Staff podem rodar o Roll de Lesão.');
            }

            const diceType = args[1]?.toLowerCase();
            const targetUser = message.mentions.users.first();

            const baseLimits = {
                d100: { maxRoll: 100, baseLimit: 3, label: '🟢 Poucos golpes recebidos' },
                d75: { maxRoll: 75, baseLimit: 5, label: '🏋️ Camp de Treinamento / Sparring' },
                d50: { maxRoll: 50, baseLimit: 8, label: '🟠 Muitos golpes / Guerra de rounds' }
            };

            if (!diceType || !baseLimits[diceType] || !targetUser) {
                return message.reply('❌ **Uso correto:** `-vitalidade lesao <d50|d75|d100> @Lutador`');
            }

            const config = baseLimits[diceType];
            const currentVit = VitalityManager.getVitality(targetUser.id);
            const vitBonus = getVitalityBonus(currentVit);
            const finalThreshold = config.baseLimit + vitBonus;

            // Rola o dado correspondente
            const rollResult = Math.floor(Math.random() * config.maxRoll) + 1;
            const hasInjured = rollResult <= finalThreshold;

            let severityEmbed = null;

            if (hasInjured) {
                // Rola d20 para definir a gravidade
                const d20 = Math.floor(Math.random() * 20) + 1;
                let severityText = "";
                let severityColor = 0xe74c3c;

                if (d20 <= 10) {
                    severityText = "🟡 **Lesão Leve (Roll d20: " + d20 + ")**\n• Sem treinar por 1 camp.";
                    severityColor = 0xf1c40f;
                } else if (d20 <= 17) {
                    severityText = "🟠 **Lesão Moderada (Roll d20: " + d20 + ")**\n• Perde o restante do camp e sua luta é adiada.";
                    severityColor = 0xe67e22;
                } else {
                    severityText = "🔴 **Lesão Grave (Roll d20: " + d20 + ")**\n• Luta cancelada e afastamento por 2 eventos.";
                    severityColor = 0x922b21;
                }

                severityEmbed = new EmbedBuilder()
                    .setTitle(`🩹 LESÃO CONFIRMADA!`)
                    .setColor(severityColor)
                    .setDescription(`>>> **Atleta:** <@${targetUser.id}>\n\n${severityText}`)
                    .setFooter({ text: 'Resultado Oficial da Avaliação Médica' })
                    .setTimestamp();
            }

            const rollEmbed = new EmbedBuilder()
                .setTitle(`🎲 ROLL DE LESÃO • ${diceType.toUpperCase()}`)
                .setColor(hasInjured ? 0xc0392b : 0x2ecc71)
                .setDescription(`>>> **Atleta:** <@${targetUser.id}>\n**Cenário:** ${config.label}`)
                .addFields(
                    { name: '❤️ Vitalidade Atual', value: `\`${currentVit}/100\` *(Bônus Faixa: +${vitBonus})*`, inline: false },
                    { name: '🎯 Faixa de Lesão', value: `\`1 a ${finalThreshold}\``, inline: true },
                    { name: '🎲 Resultado do Dado', value: `\`${rollResult} / ${config.maxRoll}\``, inline: true },
                    { name: '📌 Status', value: hasInjured ? '⚠️ **LESIONADO!**' : '✅ **ÍNDEVE / ÍNTEGRO**', inline: false }
                )
                .setTimestamp();

            await message.reply({ embeds: [rollEmbed] });

            if (hasInjured && severityEmbed) {
                await message.channel.send({ embeds: [severityEmbed] });
            }

            return;
        }

        return message.reply('❌ Subcomandos válidos: `-vitalidade [@Lutador]`, `-vitalidade posluta <tipo> @Lutador`, `-vitalidade lesao <d50|d75|d100> @Lutador`, `-vitalidade set @Lutador <valor>`.');
    }
};