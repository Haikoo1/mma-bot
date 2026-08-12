const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'guilhotina',
    attribute: 'jiujitsu',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'GUILHOTINA FATAL! TAPOUT!',
            color: 0x9b59b6,
            texts: [
                "{attacker} abraça a cabeça no guilhotina, puxa para a guarda e fecha o quadril com extrema pressão! O oponente bate instantaneamente!",
                "{attacker} pega a guilhotina de pé durante a entrada de queda do oponente e o faz desistir antes mesmo de tocar o solo!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'GUILHOTINA ENCAIXADA',
            color: 0xf1c40f,
            texts: [
                "{attacker} trava o pescoço do adversário na guilhotina e começa a arrochar a pegada no chão.",
                "{attacker} ajusta o braço por baixo da garganta do oponente, criando grande perigo na posição."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'PRESSÃO NO PESCOÇO',
            color: 0x2ecc71,
            texts: [
                "{attacker} encaixa a pegada no pescoço, mas o oponente consegue apoiar a mão para aliviar a respiração.",
                "{attacker} tenta arrochar a guilhotina sem fechar a guarda por completo."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'CABEÇA FORA / PASSAGEM DE GUARDA',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta a guilhotina, mas o oponente tira a cabeça e cai passado no lado oposto!",
                "{attacker} perde a pegada no pescoço e fica por baixo no solo."
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