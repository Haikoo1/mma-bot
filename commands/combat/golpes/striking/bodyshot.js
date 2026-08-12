const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'bodyshot',
    attribute: 'striking',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'GANCHO NO FÍGADO AVASSALADOR',
            color: 0x9b59b6,
            texts: [
                "{attacker} entra com um Gancho de esquerda mortal no fígado do oponente! O adversário cai de joelhos urrando de dor!",
                "{attacker} afunda o punho no pâncreas/estômago do oponente, travando sua movimentação completamente!"
            ],
            gifs: ["https://media.giphy.com/media/l3mZr3M8g82aB0x6E/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'SOCO NO CORPO FIRME',
            color: 0xf1c40f,
            texts: [
                "{attacker} abaixa o nível e acerta um golpe pesado nas costelas flutuantes do oponente.",
                "{attacker} conecta uma linha de diretos no tronco do adversário, minando seu gás."
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'SOCO NO CORPO BLOQUEADO',
            color: 0x2ecc71,
            texts: [
                "{attacker} tenta o golpe no corpo, mas acerta os cotovelos do adversário.",
                "{attacker} toca a linha de cintura com o jab de forma superficial."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'GOLPE NO CORPO ESQUIVADO',
            color: 0xe74c3c,
            texts: [
                "{attacker} baixa para bater no corpo e toma um contragolpe por cima do oponente.",
                "{attacker} erra o soco no tronco e o adversário se afasta com facilidade."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, tier, level, true, 'Striking');
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

        if (hitResult && hitResult.pendingFinish) {
            FightManager.executeFinish(message.channel, hitResult.fight, hitResult.pendingFinish);
        }
    }
};