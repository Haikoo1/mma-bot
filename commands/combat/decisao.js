const { EmbedBuilder } = require('discord.js');
const { FightManager } = require('../../utils/fightManager');

module.exports = {
    name: 'decisao',
    noLevel: true,
    async execute(message) {
        const fight = FightManager.getFight(message.channel.id);

        if (!fight) {
            return message.reply('❌ Nenhuma luta ativa neste canal para ir à decisão.');
        }

        if (fight.roundScores.length === 0) {
            return message.reply('⚠️ É necessário concluir pelo menos 1 round para ir à decisão dos juízes.');
        }

        // Para os timers e calcula a decisão oficial
        if (fight.timerInterval) clearInterval(fight.timerInterval);
        fight.status = 'FINISHED';

        const { f1, f2, decisionType, winnerMention, cardsSummary, roundByRoundText } = FightManager.calculateDecisionScores(fight);

        const embed = new EmbedBuilder()
            .setTitle(`📋 DECISÃO OFICIAL DOS JUÍZEZ DE LATERAL`)
            .setColor(0xf1c40f)
            .setDescription(`>>> A luta foi até o limite do tempo regulamentar! Os cartões dos três juízes oficiais foram recolhidos.`)
            .addFields(
                { name: '🥊 | Confronto', value: `${f1.mention} **vs** ${f2.mention}`, inline: false },
                { name: '🏆 | Resultado Oficial', value: `**${decisionType}**\n**Vencedor:** ${winnerMention}`, inline: false },
                { name: '👨‍⚖️ | Cartões dos Juízes', value: cardsSummary, inline: false },
                { name: '📊 | Pontuação Round por Round', value: roundByRoundText, inline: false }
            )
            .setFooter({ text: 'Comissão Atlética Oficial • MMA RP' })
            .setTimestamp();

        FightManager.stopFight(message.channel);
        return message.channel.send({ embeds: [embed] });
    }
};