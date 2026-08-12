const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'controle',
    attribute: 'wrestling',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'CONTROLE TOTAL DE SOLO (HEAVY TOP CONTROL)',
            color: 0x9b59b6,
            texts: [
                "{attacker} coloca uma pressão sufocante de quadril por cima, imobiliza o oponente e castiga sem dar espaço de fuga!",
                "{attacker} gasta o tempo com um domínio absoluto no chão, deixando o adversário totalmente preso e sem ação!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'DOMÍNIO FIRME POR CIMA',
            color: 0xf1c40f,
            texts: [
                "{attacker} estabelece a meia-guarda/montada por cima e mantém a cabeça do oponente colarada no solo.",
                "{attacker} usa o peso do corpo para travar as quadrís do adversário e dominar a posição."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'CONTROLE BÁSICO',
            color: 0x2ecc71,
            texts: [
                "{attacker} segura a postura por cima na guarda, garantindo o tempo de domínio.",
                "{attacker} consegue reter o oponente no chão após ele tentar se levantar."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'PERDA DE POSTURA / RASPAGEM',
            color: 0xe74c3c,
            texts: [
                "{attacker} perde a postura por cima e o oponente consegue se levantar rápido!",
                "{attacker} vacila no peso do quadril e permite ao adversário fazer a ponte e escapar da posição."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, tier, level, false, 'Wrestling');
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Controle de Solo',
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