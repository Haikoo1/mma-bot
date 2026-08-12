const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'kimura',
    attribute: 'jiujitsu',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'KIMURA PERFEITA! TAPOUT!',
            color: 0x9b59b6,
            texts: [
                "{attacker} trava o pulso do oponente no quatro, roda a alavanca de ombro e hiperextende a articulação! Desistência imediata!",
                "{attacker} puxa a Kimura da guarda com pressão avassaladora! O adversário bate três vezes para não quebrar o ombro!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'CHAVE DE OMBRO AJUSTADA',
            color: 0xf1c40f,
            texts: [
                "{attacker} isola o braço do oponente na Kimura e força o ombro para trás.",
                "{attacker} ganha a pegada figura quatro e começa a torcer a articulação no solo."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'PEGADA DE KIMURA PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} encaixa a pegada no braço, mas o oponente esconde a mão no calção para defender.",
                "{attacker} usa a Kimura para controlar a postura do oponente no chão."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'KIMURA DEFENDIDA / RASPAGEM',
            color: 0xe74c3c,
            texts: [
                "{attacker} ataca na Kimura, mas o oponente roda por cima e desfaz a alavanca!",
                "{attacker} perde a pegada do pulso e fica em posição desfavorável."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, tier, level, false, 'BJJ');
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Kimura (Chave de Ombro)',
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