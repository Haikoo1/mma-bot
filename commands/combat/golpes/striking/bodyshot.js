const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'bodyshot',
    attribute: 'striking',
    staminaCost: 3,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'GANCHO NO FÍGADO AVASSALADOR',
            color: 0x9b59b6,
            texts: [
                "{attacker} entra com um Gancho de esquerda mortal no fígado do oponente! O adversário cai de joelhos urrando de dor!",
                "{attacker} afunda o punho no pâncreas/estômago do oponente, travando sua movimentação completamente!",
                "{attacker} manda um cruzado pesado na linha de cintura que dobra o oponente ao meio imediatamente!",
                "{attacker} esquiva por baixo e soca o abdômen com tanta pressão que tira todo o ar do adversário!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'SOCO NO CORPO FIRME',
            color: 0xf1c40f,
            texts: [
                "{attacker} abaixa o nível e acerta um golpe pesado nas costelas flutuantes do oponente.",
                "{attacker} conecta uma linha de diretos no tronco do adversário, minando seu gás.",
                "{attacker} acerta um golpe seco na boca do estômago do rival, desacelerando o ritmo do combate.",
                "{attacker} fura a guarda alta e acerta uma pancada forte na lateral das costelas do oponente!"
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'SOCO NO CORPO BLOQUEADO',
            color: 0x2ecc71,
            texts: [
                "{attacker} tenta o golpe no corpo, mas acerta os cotovelos do adversário.",
                "{attacker} toca a linha de cintura com o jab de forma superficial.",
                "{attacker} abaixa para bater no tronco, mas o oponente fecha a guarda e absorve sem impacto."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'GOLPE NO CORPO ESQUIVADO',
            color: 0xe74c3c,
            texts: [
                "{attacker} baixa para bater no corpo e toma um contragolpe por cima do oponente.",
                "{attacker} erra o soco no tronco e o adversário se afasta com facilidade.",
                "{attacker} tenta entrar na linha de cintura, mas acerta o ar e fica vulnerável."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Bodyshot', level, null, true, 'Striking', this.staminaCost);
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Bodyshot (Golpe no Corpo)',
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