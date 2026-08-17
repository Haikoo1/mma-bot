const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'spinningback',
    attribute: 'striking',
    staminaCost: 5,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'GOLPE RODADO ESPETACULAR (SPINNING KO)',
            color: 0x9b59b6,
            texts: [
                "{attacker} gira o corpo 360° e acerta um Spinning Back Kick/Fist devastador na cabeça do oponente! Nocaute de filme!",
                "{attacker} surpreende com um salto e golpe rodado direto na têmpora do adversário!",
                "{attacker} encaixa um calcanhar rodado brutal na cabeça do rival, fazendo-o tombar desacordado!",
                "{attacker} solta o cotovelo rodado de surpresa, atingindo o queixo do oponente com rotação total!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'GOLPE RODADO POTENTE',
            color: 0xf1c40f,
            texts: [
                "{attacker} roda o corpo rapidamente e acerta o calcanhar/punho no tronco do oponente.",
                "{attacker} pega o oponente desprevenido com uma giratória pesada na linha de cintura.",
                "{attacker} conecta um soco rodado no osso da bochecha do rival, fazendo-o recuar assustado!",
                "{attacker} acerta a sola do pé no abdômen com um Spinning Back Kick firme!"
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'GOLPE RODADO PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} completa o giro e acerta o golpe de leve na guarda do adversário.",
                "{attacker} lança o golpe rodado, mas perde um pouco de força no momento do impacto.",
                "{attacker} toca o tronco do oponente com o golpe rodado sem pegar cheio."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'GOLPE RODADO FALHOU',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta o golpe rodado, erra completamente o alvo e fica de costas para o oponente!",
                "{attacker} gira em falso e perde o equilíbrio no solo.",
                "{attacker} telegrafa a giratória e o adversário se esquiva dando um passo simples para trás."
            ],
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

        const tier = processRoll(effectiveLevel, attacker.id);
        const outcomeData = this.outcomes[tier];

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Spinning Back', level, null, true, 'Striking', this.staminaCost);
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Spinning Back (Golpe Rodado)',
            level,
            effectiveLevel,
            outcomeData,
            alertMessage: hitResult ? hitResult.alertMessage : null
        });

        await message.reply({ embeds: [embed] });


    }
};