const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'cotovelada',
    attribute: 'striking',
    staminaCost: 3,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'COTOVELADA CORTANTE DEVASTADORA',
            color: 0x9b59b6,
            texts: [
                "{attacker} entra com uma Cotovelada frontal rasgando o supercílio do oponente! O sangue jorra instantaneamente!",
                "{attacker} acerta uma Cotovelada rodada na ponta do queixo! O adversário desmorona desacordado!",
                "{attacker} rasga o rosto do oponente com uma cotovelada descendente brutal, criando um corte profundo!",
                "{attacker} acerta um cotovelo seco no queixo do rival, provocando uma queda fulminante!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'COTOVELADA LIMPA DE CLINCH',
            color: 0xf1c40f,
            texts: [
                "{attacker} acha o espaço no clinch e finca a cotovelada na têmpora do oponente.",
                "{attacker} roda o cotovelo de cima para baixo abrindo um corte na face do adversário.",
                "{attacker} conecta um cotovelo curto e afiado na bochecha do oponente, atordoando-o!",
                "{attacker} entra na distância curta e golpeia com a ponta do cotovelo no rosto do rival!"
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'COTOVELADA PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} acerta a ponta do cotovelo na guarda do oponente.",
                "{attacker} raspa o cotovelo no rosto do adversário sem pegar cheio.",
                "{attacker} lança a cotovelada na distância curta, tocando de leve a testa do rival."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'COTOVELADA ERROU',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta a cotovelada curta, mas o oponente recua a cabeça e evita a lesão.",
                "{attacker} rasga o ar com o cotovelo e perde a postura temporariamente.",
                "{attacker} tenta a cotovelada rodada, mas passa completamente no vazio e fica exposto."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Cotovelada', level, null, true, 'Striking', this.staminaCost);
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Cotovelada',
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