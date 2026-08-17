const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'cruzado',
    attribute: 'striking',
    staminaCost: 3,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'CRUZADO BRUTAL',
            color: 0x9b59b6,
            texts: [
                "{attacker} solta um Cruzado violento na mandíbula do oponente, que perde o equilíbrio na hora!",
                "{attacker} entra com um Cruzado de esquerda espetacular na têmpora do adversário!",
                "{attacker} exploda um Cruzado em arco perfeito, atingindo o queixo em cheio e desmontando o oponente!",
                "{attacker} conecta um Cruzado devastador de encontro que faz o adversário cair virando os olhos!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'CRUZADO LIMPO',
            color: 0xf1c40f,
            texts: [
                "{attacker} roda a cintura e acerta um Cruzado pesado na bochecha do oponente!",
                "{attacker} surpreende com um Cruzado curvo que contorna a guarda do adversário.",
                "{attacker} acerta um Cruzado limpo na orelha do rival, fazendo-o balançar levemente.",
                "{attacker} solta a mão lateral firme e atinge em cheio a lateral da cabeça do oponente!"
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'CRUZADO PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} acerta a ponta da luva no rosto do adversário durante a trocação.",
                "{attacker} lança o Cruzado, rasgando o ar e tocando levemente a orelha do oponente.",
                "{attacker} dispara o golpe curvo, mas o adversário amortece grande parte do impacto na guarda."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'CRUZADO NO VAZIO',
            color: 0xe74c3c,
            texts: [
                "{attacker} lança um Cruzado muito aberto e o oponente dá um passo para trás sem perigo.",
                "{attacker} tenta o golpe, mas fica no vácuo e exposto ao contragolpe.",
                "{attacker} gira o golpe lateral, mas o oponente pendula por baixo com maestria."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Cruzado', level, null, true, 'Striking', this.staminaCost);
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


    }
};