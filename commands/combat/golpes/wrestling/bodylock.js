const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'bodylock',
    attribute: 'wrestling',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'BODYLOCK TAKEDOWN BRUTAL (SUPLEX/SLAM)',
            color: 0x9b59b6,
            texts: [
                "{attacker} grampeia a cintura do oponente com a trava de corpo (Bodylock), ergue o adversário do chão e aplica um Suplex/Slam sensacional!",
                "{attacker} trava o cinto de segurança no tronco do oponente e o arremessa com força devastadora no chão!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'BODYLOCK TAKEDOWN LIMPO',
            color: 0xf1c40f,
            texts: [
                "{attacker} cola o peito, junta as mãos na cintura do oponente e o derruba de costas no solo.",
                "{attacker} trava o tronco do adversário e arrasta a posição para o chão."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'TRAVA DE CORPO PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} encaixa a trava na cintura, mas o oponente abre a base e se segura para não cair limpo.",
                "{attacker} desequilibra o oponente com o Bodylock e prensa o combate na grade."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'BODYLOCK BLOQUEADO',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta abraçar o tronco, mas o oponente coloca os braços na frente e bloqueia a pegada.",
                "{attacker} tenta a trava de corpo, fica sem base e toma uma esgrima de resposta."
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
            moveName: 'Bodylock (Trava de Corpo)',
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