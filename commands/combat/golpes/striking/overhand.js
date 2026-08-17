const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'overhand',
    attribute: 'striking',
    staminaCost: 4,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'OVERHAND DEVASTADOR',
            color: 0x9b59b6,
            texts: [
                "{attacker} lança um Overhand perfeito por cima da guarda! O impacto desconecta o adversário instantaneamente!",
                "Com uma potência surreal, {attacker} acerta o Overhand na têmpora. O oponente apaga no ato!",
                "{attacker} dobra a base e acerta uma bomba em arco de direita! O adversário desaba desacordado!",
                "{attacker} projeta todo o peso do corpo num Overhand letal que explode no queixo do rival!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'OVERHAND POTENTE',
            color: 0xf1c40f,
            texts: [
                "{attacker} conecta um Overhand pesadíssimo na bochecha, fazendo o oponente cambalear atordoado até a grade!",
                "{attacker} finca um cruzado caindo de Overhand. O adversário perde o equilíbrio e recua!",
                "{attacker} contorna a guarda com uma pedrada de mão direita, marcando forte o rosto do oponente!",
                "{attacker} acerta o Overhand na orelha do adversário, fazendo-o perder momentaneamente o teto!"
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'OVERHAND CONECTADO',
            color: 0x2ecc71,
            texts: [
                "{attacker} avança e acerta a ponta do Overhand na guarda, fazendo o oponente absorver a pressão.",
                "{attacker} acha o tempo correto e acerta o golpe no queixo, somando pontos limpos.",
                "{attacker} lança o Overhand caindo por cima do braço do oponente com impacto moderado."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'OVERHAND DEFENDIDO OU ESQUIVADO',
            color: 0xe74c3c,
            texts: [
                "{attacker} telegrafa o Overhand com muita força. O oponente percebe o movimento e esquiva por baixo.",
                "{attacker} projeta o corpo para o golpe, mas o adversário bloqueia completamente a trajetória.",
                "{attacker} soca no vazio com tanta carga que quase perde o equilíbrio no octógono."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Overhand', level, null, true, 'Striking', this.staminaCost);
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