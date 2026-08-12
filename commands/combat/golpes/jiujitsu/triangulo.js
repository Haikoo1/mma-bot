const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'triangulo',
    attribute: 'jiujitsu',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'TRIÂNGULO ENCAIXADO! APAGOU!',
            color: 0x9b59b6,
            texts: [
                "{attacker} isola um braço, lança a perna por cima do pescoço e tranca o Triângulo com ângulo perfeito! O oponente apaga no chão!",
                "{attacker} puxa a cabeça do adversário e ajusta a trava de pernas! Sem oxigênio, o oponente dá o tapout!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'TRIÂNGULO ARROCHADO',
            color: 0xf1c40f,
            texts: [
                "{attacker} fecha a trava de pernas no pescoço do oponente e começa a puxar o braço atravessado.",
                "{attacker} ajusta o ângulo do quadril e aumenta drasticamente a pressão respiratória do adversário."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'AJUSTE DE TRIÂNGULO',
            color: 0x2ecc71,
            texts: [
                "{attacker} engata as pernas em volta do pescoço, mas o oponente consegue posturar para evitar o arrocho total.",
                "{attacker} ataca no Triângulo e mantém o adversário preso sob controle por baixo."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'TRIÂNGULO POSTURADO / ESCAPADA',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta o bote no Triângulo, mas o oponente joga a postura alta, escorrega o braço e escapa!",
                "{attacker} não consegue fechar a trava de pernas e fica em posição desvantajosa por baixo."
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
            moveName: 'Triângulo',
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