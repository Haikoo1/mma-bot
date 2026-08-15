const { EmbedBuilder } = require('discord.js');
const { FightManager } = require('../../utils/fightManager');

function buildProgressBar(value = 0, max = 100, size = 8, colorEmoji = '🟩') {
    const safeVal = Number.isNaN(Number(value)) ? 0 : Number(value);
    const safeMax = Number.isNaN(Number(max)) || max <= 0 ? 100 : Number(max);
    
    const percentage = Math.max(0, Math.min(1, safeVal / safeMax));
    const filledCount = Math.max(0, Math.min(size, Math.round(size * percentage)));
    const emptyCount = Math.max(0, size - filledCount);
    
    return colorEmoji.repeat(filledCount) + '⬛'.repeat(emptyCount);
}

module.exports = {
    name: 'status',
    noLevel: true,
    async execute(message) {
        try {
            const fight = FightManager.getFight(message.channel.id);
            if (!fight || !fight.fighters || fight.fighters.length < 2) {
                return message.reply('❌ Nenhuma luta ativa registrada neste canal.');
            }

            const [f1, f2] = fight.fighters;

            const embed = new EmbedBuilder()
                .setTitle(`🥊 PAINEL TÁTICO DE COMBATE • ROUND ${fight.currentRound || 1}`)
                .setColor(0x3498db)
                .setTimestamp();

            [f1, f2].forEach(f => {
                const displayName = f.username || (f.id === 'NPC_DUMMY' ? 'NPC de Teste' : 'Lutador');
                const stamina = f.stamina ?? 100;
                const damage = f.damage ?? 0;
                const roundPts = f.roundPoints ?? 0;
                const totalPts = f.totalPoints ?? 0;

                const staminaBar = buildProgressBar(stamina, 100, 8, '🟦');
                const damageBar = buildProgressBar(Math.max(0, 16 - damage), 16, 8, '🟥');
                
                const counterStatus = f.counterWindow ? '⚡ **CONTRAGOLPE ATIVO (+1 Nível)**' : '➖ Neutro';

                embed.addFields({
                    name: `👤 ${displayName.toUpperCase()}`,
                    value: [
                        `⚡ **Stamina:** ${staminaBar} \`${stamina}%\``,
                        `🩸 **Integridade:** ${damageBar} \`${damage}/16 Pts de Dano\``,
                        `📊 **Status Tático:** ${counterStatus}`,
                        `🏆 **Pontos no Round:** \`${roundPts} pts\` | **Pontuação Total:** \`${totalPts} pts\``
                    ].join('\n'),
                    inline: false
                });
            });

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro no comando status:', error);
            return message.reply('❌ Ocorreu um erro ao gerar o painel de status da luta.');
        }
    }
};