const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'overhand',
    attribute: 'striking',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'OVERHAND DEVASTADOR',
            color: 0x9b59b6,
            texts: [
                "{attacker} lança um Overhand perfeito por cima da guarda! O impacto desconecta o adversário instantaneamente!",
                "Com uma potência surreal, {attacker} acerta o Overhand na têmpora. O oponente apaga no ato!"
            ],
            gifs: ["https://media.giphy.com/media/l3mZr3M8g82aB0x6E/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'OVERHAND POTENTE',
            color: 0xf1c40f,
            texts: [
                "{attacker} conecta um Overhand pesadíssimo na bochecha, fazendo o oponente cambalear atordoado até a grade!",
                "{attacker} finca um cruzado caindo de Overhand. O adversário perde o equilíbrio e recua!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'OVERHAND CONECTADO',
            color: 0x2ecc71,
            texts: [
                "{attacker} avança e acerta a ponta do Overhand na guarda, fazendo o oponente absorver a pressão.",
                "{attacker} acha o tempo correto e acerta o golpe no queixo, somando pontos limpos."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'OVERHAND DEFENDIDO OU ESQUIVADO',
            color: 0xe74c3c,
            texts: [
                "{attacker} telegrafa o Overhand com muita força. O oponente percebe o movimento e esquiva por baixo.",
                "{attacker} projeta o corpo para o golpe, mas o adversário bloqueia completamente a trajetória."
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
            moveName: this.name,
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