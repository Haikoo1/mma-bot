const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'gandp',
    attribute: 'striking',
    staminaCost: 4,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'GROUND AND POUND BRUTAL (TKO)',
            color: 0x9b59b6,
            texts: [
                "{attacker} estabelece a postura por cima e solta uma marretada ininterrupta de socos e cotoveladas! O árbitro precisa intervir!",
                "{attacker} massacra o oponente no chão com socos potentes na guarda aberta! Nocaute técnico devastador!",
                "{attacker} monta, ganha o ângulo e despeja uma chuva de golpes pesados até o adversário apagar!",
                "{attacker} grampeia o oponente no solo e descarrega marretadas no queixo sem dar espaço para reação!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'GROUND AND POUND PESADO',
            color: 0xf1c40f,
            texts: [
                "{attacker} fura a defesa por baixo e conecta socos pesados no rosto do oponente.",
                "{attacker} usa os cotovelos de cima para baixo no chão, castigando o oponente.",
                "{attacker} ganha a meia-guarda e martela a cabeça do adversário com sequências de socos limpos.",
                "{attacker} faz postura na guarda e dispara cruzados fortes caindo diretamente na face do rival!"
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'GROUND AND POUND TRAVADO',
            color: 0x2ecc71,
            texts: [
                "{attacker} lança socos curtos por cima, mas o oponente grampeia seus braços na guarda.",
                "{attacker} mantém a pressão no solo pontuando com golpes curtos de quadril.",
                "{attacker} tenta posturar para bater, mas o adversário amarra o combate travando sua nuca."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'GROUND AND POUND DEFENDIDO',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta golpear por cima, mas o oponente se defende bem e tenta a raspagem.",
                "{attacker} fica sem ângulo no chão e ataca no vazio.",
                "{attacker} tenta o soco pesado por cima, mas o adversário desvia a cabeça e ganha o esgrima."
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

        const tier = processRoll(effectiveLevel, attacker.id);
        const outcomeData = this.outcomes[tier];

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Ground and Pound', level, null, true, 'Striking', this.staminaCost);
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Ground and Pound (GnP)',
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