const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'uppercut',
    attribute: 'striking',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'UPPERCUT MORTAL',
            color: 0x9b59b6,
            texts: [
                "{attacker} entra por baixo da guarda e explode um Uppercut devastador no queixo do adversário, jogando sua cabeça para trás!",
                "{attacker} lê a esquiva do oponente e aplica um Uppercut surreal, fazendo o adversário perder a consciência!",
                "{attacker} rasga a linha central e acerta um Uppercut seco na ponta do queixo! Queda imediata!",
                "{attacker} encaixa um Uppercut violentíssimo de encontro no momento em que o oponente abaixava o nível!"
            ],
            gifs: ["https://media.giphy.com/media/l3mZr3M8g82aB0x6E/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'UPPERCUT LIMPO',
            color: 0xf1c40f,
            texts: [
                "{attacker} sobe a mão em linha vertical e acerta em cheio o queixo do oponente!",
                "{attacker} acha a brecha na guarda e solta o Uppercut com grande explosão física.",
                "{attacker} conecta um Uppercut rápido no queixo do oponente, fazendo a cabeça dele chicotear!",
                "{attacker} entra na distância curta e dispara um Uppercut forte que estala na boca do adversário."
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'UPPERCUT DE RASPÃO',
            color: 0x2ecc71,
            texts: [
                "{attacker} sobe o soco raspando no peito e tocando o queixo do adversário.",
                "{attacker} acerta um Uppercut leve na guarda baixa do oponente.",
                "{attacker} lança o golpe ascendente, mas pega apenas de raspão na bochecha."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'UPPERCUT ERROU',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta subir o Uppercut, mas o oponente recua o tronco e evita o golpe.",
                "{attacker} rasga o ar com o soco ascendente sem atingir o alvo.",
                "{attacker} tenta furar a guarda por baixo, mas o adversário fecha os cotovelos e bloqueia totalmente."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Uppercut', level, null, true, 'Striking');
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

        if (hitResult) {
            await FightManager.sendHitResult(message.channel, hitResult);

            if (hitResult.pendingFinish) {
                await FightManager.executeFinish(message.channel, hitResult.fight, hitResult.pendingFinish);
            }
        }
    }
};