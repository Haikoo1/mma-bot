const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'omoplata',
    attribute: 'jiujitsu',
    staminaCost: 4,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'OMOPLATA PERFEITA! TAPOUT!',
            color: 0x9b59b6,
            texts: [
                "{attacker} enfia a perna sobre o ombro do oponente, senta para frente e torce a articulação até o tapout inevitável!",
                "{attacker} trava o braço nas pernas em uma Omoplata fulminante! O adversário desiste de dor!",
                "{attacker} projeta o quadril para frente, isola a articulação do ombro com o joelho e força a desistência imediata!",
                "{attacker} encaixa a Omoplata com perfeição cirúrgica, colando o peito do rival no chão e arrancando os três tapinhas!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'OMOPLATA ENCAIXADA',
            color: 0xf1c40f,
            texts: [
                "{attacker} passa a perna sobre o braço, isola o ombro e projeta o quadril para frente.",
                "{attacker} coloca o oponente de barriga no chão sob forte pressão de Omoplata.",
                "{attacker} trava a perna na axila do rival e força a torção do ombro.",
                "{attacker} senta para o lado mantendo o braço do oponente preso no triângulo de pernas."
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'TRANSIÇÃO DE OMOPLATA',
            color: 0x2ecc71,
            texts: [
                "{attacker} tenta a Omoplata e usa o movimento para raspar e ir para cima.",
                "{attacker} engancha o ombro do adversário, gerando perigo na posição.",
                "{attacker} passa a perna no ombro, mas o oponente consegue apoiar a mão livre para atenuar o golpe."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'OMOPLATA CAPOTADA / ESCAPADA',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta o bote na Omoplata, mas o oponente dá um rolamento por cima e se safa!",
                "{attacker} perde o controle do quadril e cede a passagem de guarda.",
                "{attacker} tenta esticar a perna, mas escorrega do braço e dá espaço para o oponente subir."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Omoplata', level, null, false, 'BJJ', this.staminaCost);
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Omoplata',
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