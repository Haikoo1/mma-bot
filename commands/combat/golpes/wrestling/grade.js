const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'grade',
    attribute: 'wrestling',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'DOMÍNIO SUFOCANTE NA GRADE (CAGE CONTROL)',
            color: 0x9b59b6,
            texts: [
                "{attacker} prensa o oponente com força esmagadora na grade, isola seus braços e desfere joelhadas dolorosas nas coxas!",
                "{attacker} estabelece uma pressão perfeita de grade, minando o espaço e a movimentação do adversário!",
                "{attacker} trava o rival de costas para o octógono, desferindo ombradas e joelhadas sem dar descanso!",
                "{attacker} impõe um controle de grade devastador, esmagando o oponente contra a tela sem qualquer chance de saída!"
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'PRENSADA FIRME NA GRADE',
            color: 0xf1c40f,
            texts: [
                "{attacker} empurra o adversário contra a grade e mantém o controle com a cabeça no queixo.",
                "{attacker} ganha a esgrima e deixa o oponente sem espaço de esquiva na grade.",
                "{attacker} cola o peito e grampeia o rival contra a tela, somando tempo precioso de domínio.",
                "{attacker} fixa o adversário na grade e pontua com curtas joelhadas na coxa."
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'DISPUTA DE GRADE PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} encosta o oponente na grade, mas ele responde esgrimando um dos braços.",
                "{attacker} mantém o contato de grade pontuando com ombradas curtas.",
                "{attacker} empurra o rival contra a cerca, mas a disputa de pegadas permanece equilibrada."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'INVERSÃO DE GRADE',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta prensar na grade, mas o oponente roda o quadril e inverte a posição!",
                "{attacker} perde o apoio na grade e o adversário se esquiva para o centro do octógono.",
                "{attacker} força a aproximação na grade sem esgrima e acaba sendo colocado de costas para a cerca."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Pressionar na Grade', level, null, false, 'Wrestling');
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Pressionar na Grade',
            level,
            effectiveLevel,
            outcomeData,
            alertMessage: hitResult ? hitResult.alertMessage : null
        });

        await message.reply({ embeds: [embed] });

        if (hitResult) {
            await FightManager.sendHitResult(message.channel, hitResult);

            if (hitResult.pendingFinish) {
                await FightManager.executeFinish(message.channel, hitResult.fight, hitResult.pendingFinish);
            }
        }
    }
};