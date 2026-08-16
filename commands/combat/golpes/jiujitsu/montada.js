const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'montada',
    attribute: 'jiujitsu',
    staminaCost: 3,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'MONTADA TOTAL DOMINANTE (MOUNT CONTROL)',
            color: 0x9b59b6,
            texts: [
                "{attacker} estabiliza a Montada Alta sobre o peito do oponente, isola os braços e domina completamente a luta por cima!",
                "{attacker} se consolida na Montada, aplicando pressão avassaladora de tronco sem dar espaço de fuga!",
                "{attacker} avança os joelhos até as axilas do adversário, fixando uma montada esmagadora e sufocante!",
                "{attacker} estabelece o controle total montado, colando o peito e anulando todas as tentativas de defesa do rival!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'MONTADA ESTABILIZADA',
            color: 0xf1c40f,
            texts: [
                "{attacker} passa a guarda, lança o joelho por cima e estabiliza a Montada.",
                "{attacker} ganha a posição montada e força o oponente a se defender.",
                "{attacker} crava a base sobre o quadril do rival e assume o controle superior no chão.",
                "{attacker} distribui bem o peso sobre o abdômen do adversário e consolida a montada."
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'MONTADA PARCIAL / MEIA-MONTADA',
            color: 0x2ecc71,
            texts: [
                "{attacker} tenta a montada, mas o oponente prende o pé na meia-guarda.",
                "{attacker} consegue montar temporariamente antes de sofrer a ponte.",
                "{attacker} projeta o corpo por cima, mas o rival consegue prender a ponta de seu pé."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'FALHA NA MONTADA',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta passar a perna para montar, mas o oponente repõe a guarda fechada!",
                "{attacker} perde o equilíbrio ao subir e cede a posição por baixo.",
                "{attacker} tenta adiantar a perna, mas o adversário antecipa a transição e empurra o joelho."
            ],
        }
    },

    async execute(message, level) {
        const attacker = message.author;
        if (!validateUserRole(message.member, this.attribute, level)) {
            return message.reply(`❌ Você precisa do cargo de **${this.attribute.toUpperCase()} Nível ${level}**.`);
        }

        const fight = FightManager.getFight(message.channel.id);
        let effectiveLevel = level;

        if (fight) {
            const attObj = fight.fighters.find(f => f.id === attacker.id);
            if (attObj && (attObj.stamina < 35 || attObj.hasWeightPenalty)) {
                effectiveLevel = Math.max(1, level - 1);
            }
        }

        const tier = processRoll(effectiveLevel);
        const outcomeData = this.outcomes[tier];

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Montada', level, null, false, 'BJJ', this.staminaCost);
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Montada',
            level,
            effectiveLevel,
            outcomeData,
            alertMessage: hitResult ? hitResult.alertMessage : null
        });

        await message.reply({ embeds: [embed] });

        if (hitResult) {
            await FightManager.sendHitResult(message.channel, hitResult);

            if (hitResult.pendingFinish) {
                await FightManager.executeFinish(message.channel, hitResult.fight, hitResult.pendingFinish);
            }
        }
    }
};