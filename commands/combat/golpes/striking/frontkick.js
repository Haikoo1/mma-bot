const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'frontkick',
    attribute: 'striking',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'FRONTKICK NO QUEIXO DEVASTADOR',
            color: 0x9b59b6,
            texts: [
                "{attacker} solta um Frontkick espetacular direto na ponta do queixo do oponente! Queda fulminante!",
                "{attacker} encrava o pé no abdômen do adversário com tanta força que o joga de costas no solo!"
            ],
            gifs: ["https://media.giphy.com/media/l3mZr3M8g82aB0x6E/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'FRONTKICK LIMPO / PISÃO',
            color: 0xf1c40f,
            texts: [
                "{attacker} chuta frontalmente e empurra o oponente para trás, quebrando sua base.",
                "{attacker} conecta o pisão no estômago, fazendo o oponente perder o ar por instantes."
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'FRONTKICK DE RASPÃO',
            color: 0x2ecc71,
            texts: [
                "{attacker} toca a cintura do adversário com a sola do pé para manter a distância.",
                "{attacker} lança o chute frontal raspando no peito do oponente."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'FRONTKICK ESQUIVADO',
            color: 0xe74c3c,
            texts: [
                "{attacker} lança o Frontkick, mas o oponente pendula para o lado e evita o contato.",
                "{attacker} erra o tempo do pisão e fica em posição desfavorável."
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
            moveName: 'Frontkick (Chute Frontal)',
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