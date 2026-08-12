const FightManager = require('../../utils/fightManager').FightManager;

module.exports = {
    name: 'round',
    async execute(message) {
        const fight = FightManager.getFight(message.channel.id);

        if (!fight) {
            return message.reply('❌ Nenhuma luta configurada neste canal. Use `-luta iniciar <minutos> <Lutador1> <Lutador2>` primeiro.');
        }

        if (fight.status === 'IN_ROUND') {
            return message.reply(`⚠️ O **Round ${fight.currentRound}** já está em andamento!`);
        }

        const updatedFight = FightManager.startNextRound(message.channel);
        return message.channel.send(`🔔 **ROUND ${updatedFight.currentRound} INICIADO!** Podem começar as ações no octógono! ⏱️ \`${updatedFight.durationSeconds / 60} min\``);
    }
};