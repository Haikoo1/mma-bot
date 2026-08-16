const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { FightManager } = require('../../utils/fightManager');

module.exports = {
    name: 'testluta',
    noLevel: true,
    async execute(message, args) {
        // Trava para permitir apenas Administradores usarem
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Apenas administradores podem usar comandos de teste.');
        }

        const fight = FightManager.getFight(message.channel.id);
        const sub = args[0]?.toLowerCase();

        if (!fight && sub !== 'simular-decisao') {
            return message.reply('❌ Nenhuma luta ativa neste canal para testar.');
        }

        switch (sub) {
            // -testluta fimround (Encerra o round atual e chama o intervalo)
            case 'fimround': {
                FightManager.endRound(message.channel, fight);
                return message.reply('🧪 **[TESTE]** Round encerrado forçadamente!');
            }

            // -testluta dano <1|2> <quantidade> (Adiciona dano direto ao lutador 1 ou 2)
            case 'dano': {
                const targetIdx = parseInt(args[1]) - 1;
                const amount = parseInt(args[2]) || 5;
                if (targetIdx !== 0 && targetIdx !== 1) return message.reply('Use: `-testluta dano <1 ou 2> <quantidade>`');

                fight.fighters[targetIdx].damage += amount;
                return message.reply(`🧪 **[TESTE]** Adicionado \`+${amount} Pts de Dano\` para ${fight.fighters[targetIdx].mention}. Total: \`${fight.fighters[targetIdx].damage}/20\`.`);
            }

            // -testluta contragolpe <1|2> (Ativa o bônus de contragolpe)
            case 'contragolpe': {
                const targetIdx = parseInt(args[1]) - 1;
                if (targetIdx !== 0 && targetIdx !== 1) return message.reply('Use: `-testluta contragolpe <1 ou 2>`');

                fight.fighters[targetIdx].counterWindow = true;
                return message.reply(`⚡ **[TESTE]** Contragolpe ativado para ${fight.fighters[targetIdx].mention}!`);
            }

            // -testluta decisao (Simula 3 rounds e testa a súmula oficial dos juízes)
            case 'decisao':
            case 'simular-decisao': {
                // Preenche rounds fictícios se a luta não tiver pontuação
                const testFight = fight || {
                    fighters: [
                        { mention: `<@${message.author.id}>` },
                        { mention: '🤖 **NPC de Teste**' }
                    ],
                    roundScores: [
                        { round: 1, f1: 10, f2: 9 },
                        { round: 2, f1: 9, f2: 10 },
                        { round: 3, f1: 10, f2: 8 }
                    ]
                };

                const result = FightManager.calculateDecisionScores(testFight);

                const embed = new EmbedBuilder()
                    .setTitle(`👨‍⚖️ SÚMULA OFICIAL DOS JUÍZES • DECISÃO`)
                    .setColor(0xf1c40f)
                    .setDescription(`>>> **Resultado:** ${result.decisionType}\n**Vencedor:** ${result.winnerMention}`)
                    .addFields(
                        { name: '📋 Cartões dos Juízes', value: result.cardsSummary, inline: false },
                        { name: '📊 Pontuação Round por Round', value: result.roundByRoundText, inline: false }
                    )
                    .setFooter({ text: 'Comissão Atlética • Teste de Decisão' })
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // -testluta finalizar <KO|TKO|SUBMISSION> (Testa a tela de vitória)
            case 'finalizar': {
                const type = args[1]?.toUpperCase() || 'KO';
                const finishData = {
                    type,
                    winner: fight.fighters[0].mention,
                    loser: fight.fighters[1].mention,
                    reason: 'Teste de finalização via comando de Admin'
                };

                FightManager.executeFinish(message.channel, fight, finishData);
                return;
            }

            default: {
                return message.reply([
                    '🛠️ **COMANDOS DE TESTE DE LUTA (ADMIN):**',
                    '• `-testluta fimround` - Encerra o round atual instantaneamente.',
                    '• `-testluta decisao` - Exibe a simulação da súmula e decisão dos juízes.',
                    '• `-testluta dano <1 ou 2> <pts>` - Aplica dano direto em um lutador.',
                    '• `-testluta contragolpe <1 ou 2>` - Ativa o status de contragolpe.',
                    '• `-testluta finalizar <KO|TKO|SUBMISSION>` - Testa a tela de nocaute/vitória.'
                ].join('\n'));
            }
        }
    }
};