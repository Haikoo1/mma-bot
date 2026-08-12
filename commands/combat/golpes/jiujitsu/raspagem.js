const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'raspagem',
    attribute: 'jiujitsu',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'RASPAGEM ESPETACULAR (SWEEP PERFEITO)',
            color: 0x9b59b6,
            texts: [
                "{attacker} usa uma alavanca de guarda espetacular, capota o oponente e cai montado por cima com autoridade!",
                "{attacker} executa uma raspagem limpa e veloz, invertendo o combate e assumindo a posição superior!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'RASPAGEM BEM SUCEDIDA',
            color: 0xf1c40f,
            texts: [
                "{attacker} ganha as ganchos da guarda de laço/de la riva e tomba o oponente para o lado.",
                "{attacker} desequilibra a base do adversário e fica por cima no solo."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'DESEQUILÍBRIO NA GUARDA',
            color: 0x2ecc71,
            texts: [
                "{attacker} balança o oponente na guarda, que precisa apoiar a mão no chão para não ser raspado.",
                "{attacker} força o desequilíbrio e melhora o ângulo da guarda."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'RASPAGEM DEFENDIDA',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta a raspagem, mas o oponente pesa a base e bloqueia a inversão.",
                "{attacker} perde o gancho de perna durante a tentativa de sweep."
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
            moveName: 'Raspagem (Inversão da Guarda)',
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