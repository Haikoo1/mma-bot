const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'cotovelada',
    attribute: 'striking',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'COTOVELADA CORTANTE DEVASTADORA',
            color: 0x9b59b6,
            texts: [
                "{attacker} entra com uma Cotovelada frontal rasgando o supercílio do oponente! O sangue jorra instantaneamente!",
                "{attacker} acerta uma Cotovelada rodada na ponta do queixo! O adversário desmorona desacordado!"
            ],
            gifs: ["https://media.giphy.com/media/l3mZr3M8g82aB0x6E/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'COTOVELADA LIMPA DE CLINCH',
            color: 0xf1c40f,
            texts: [
                "{attacker} acha o espaço no clinch e finca a cotovelada na têmpora do oponente.",
                "{attacker} roda o cotovelo de cima para baixo abrindo um corte na face do adversário."
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'COTOVELADA PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} acerta a ponta do cotovelo na guarda do oponente.",
                "{attacker} raspa o cotovelo no rosto do adversário sem pegar cheio."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'COTOVELADA ERROU',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta a cotovelada curta, mas o oponente recua a cabeça e evita a lesão.",
                "{attacker} rasga o ar com o cotovelo e perde a postura temporariamente."
            ],
            gifs: ["https://media.giphy.com/media/26bgQ8O2K8Tsm0JDW/giphy.gif"]
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

        // Risco aumentado de corte (isCutRisk: true)
        const hitResult = FightManager.registerHit(message.channel, attacker, tier, level, true, 'Striking');
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

        if (hitResult && hitResult.pendingFinish) {
            FightManager.executeFinish(message.channel, hitResult.fight, hitResult.pendingFinish);
        }
    }
};