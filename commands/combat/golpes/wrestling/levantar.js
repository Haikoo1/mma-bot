const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'levantar',
    attribute: 'wrestling',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'LEVANTE EXPLOSIVO (STAND UP PERFEITO)',
            color: 0x9b59b6,
            texts: [
                "{attacker} explode as pernas no chão, tira o peso do oponente, se levanta instantaneamente e sepulta a luta no chão!",
                "{attacker} escala a grade com postura impecável, empurra o oponente e volta a lutar de pé totalmente livre!"
            ],
            gifs: ["https://media.giphy.com/media/26bgQ8O2K8Tsm0JDW/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'LEVANTE LIMPO',
            color: 0xf1c40f,
            texts: [
                "{attacker} ganha a esgrima por baixo, apoia as mãos no solo e consegue se colocar de pé.",
                "{attacker} usa a grade como apoio, empurra o adversário e recupera a postura ereta."
            ],
            gifs: ["https://media.giphy.com/media/26bgQ8O2K8Tsm0JDW/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'LEVANTE COM DIFICULDADE',
            color: 0x2ecc71,
            texts: [
                "{attacker} fica de joelhos e tenta subir, mas o oponente ainda mantém o grampo na cintura.",
                "{attacker} consegue ficar de pé, porém continua prensado de costas na grade."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'FALHA AO LEVANTA-SE',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta se levantar, mas o oponente puxa suas pernas e o derruba de volta no solo.",
                "{attacker} abre brecha ao tentar subir e continua sob domínio por baixo."
            ],
            gifs: ["https://media.giphy.com/media/l3mZr3M8g82aB0x6E/giphy.gif"]
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

        const hitResult = FightManager.registerHit(message.channel, attacker, tier, level, false, 'Wrestling');
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Levantar (Escapada de Pé)',
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