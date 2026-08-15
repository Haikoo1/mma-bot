const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'clinch',
    attribute: 'wrestling',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'CLINCH DOMINANTE DE GRADE',
            color: 0x9b59b6,
            texts: [
                "{attacker} encurta o raio de ação, esgrima os dois braços e prensa o oponente contra a grade sem dar espaço de respiração!",
                "{attacker} trava o adversário no clinch com domínio total de pegadas, anulando qualquer reação do rival!",
                "{attacker} cola o peito no oponente, ganha a esgrima dupla e o esmaga contra a grade com controle absoluto!",
                "{attacker} anula o espaço do adversário, grampeando o tronco com pegadas firmes e pressão sufocante!"
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'GRAMPO EFETIVO',
            color: 0xf1c40f,
            texts: [
                "{attacker} cola o peito no oponente e consegue prensá-lo na grade do octógono.",
                "{attacker} ganha a esgrima e prende o adversário na luta colada!",
                "{attacker} encurta a distância e estabelece um clinch firme contra a grade.",
                "{attacker} domina um dos braços e prensa o oponente, impondo o jogo de grade!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'CLINCH NEUTRO',
            color: 0x2ecc71,
            texts: [
                "{attacker} encurta a distância e trava os braços, mas o oponente consegue esgrimar de volta.",
                "{attacker} segura o oponente na grade por alguns segundos antes da disputa de pegadas equilibrar.",
                "{attacker} tenta travar a luta colada, mas o adversário responde com boa esgrima."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'FALHA AO ENCURTAR',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta grampear, mas é empurrado de volta pelo adversário antes de alinhar a base.",
                "{attacker} avança desajeitado para o clinch e toma um contra-golpe que quebra a aproximação.",
                "{attacker} tenta a aproximação para a luta colada, mas o oponente esquiva e sai da linha de ataque."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Clinch', level, null, false, 'Wrestling');
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