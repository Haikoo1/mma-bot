const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'single',
    attribute: 'wrestling',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'SINGLE LEG PERFEITO (CATADA DE PERNA DEVASTADORA)',
            color: 0x9b59b6,
            texts: [
                "{attacker} ataca a perna dianteira no tempo exato, ergue o tornozelo do oponente e rasteira a perna de apoio com um slam espetacular!",
                "{attacker} agarra o Single Leg, varre a base do adversário e o enterra de costas no solo!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'SINGLE LEG LIMPO',
            color: 0xf1c40f,
            texts: [
                "{attacker} abraça a perna do oponente, roda o quadril e derruba o adversário rente à grade.",
                "{attacker} prende a perna do oponente no peito e força a queda com autoridade."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'CATADA DE PERNA PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} agarra a perna do adversário, mas ele pula num pé só e encosta na grade para se defender.",
                "{attacker} consegue desequilibrar o oponente com o Single Leg, gerando uma disputa truncada."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'SINGLE LEG DEFENDIDO',
            color: 0xe74c3c,
            texts: [
                "{attacker} mergulha na perna, mas o oponente recolhe o pé a tempo e esgrima a cabeça.",
                "{attacker} tenta a catada de perna de longe e sofre um Sprawl pesado no pescoço."
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
            moveName: 'Single Leg (Catada de Perna)',
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