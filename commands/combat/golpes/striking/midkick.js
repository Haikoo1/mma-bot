const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'midkick',
    attribute: 'striking',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'MIDKICK DEVASTADOR NO FÍGADO',
            color: 0x9b59b6,
            texts: [
                "{attacker} acerta a canela cheia no fígado do oponente! O adversário dobra o corpo de dor na hora!",
                "{attacker} desfere um Midkick nas costelas com som estalando! O oponente perde o ar instantaneamente!",
                "{attacker} explode a canela no flanco do rival, fazendo-o cair de joelhos segurando as costelas!",
                "{attacker} encaixa um Midkick violento de encontro, parando o avanço do adversário no ato!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'MIDKICK FIRME NA LINHA DE CINTURA',
            color: 0xf1c40f,
            texts: [
                "{attacker} acerta um chute médio limpo no flanco do adversário.",
                "{attacker} gira o quadril e acerta a canela nas costelas flutuantes do oponente!",
                "{attacker} conecta um Midkick forte no tronco do rival, marcando a pontuação com precisão.",
                "{attacker} acerta a lateral do corpo do oponente, tirando o ar do adversário momentaneamente."
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'MIDKICK BLOQUEADO NOS BRAÇOS',
            color: 0x2ecc71,
            texts: [
                "{attacker} lança o Midkick, mas o oponente amortece o impacto com os cotovelos.",
                "{attacker} acerta a lateral do corpo do adversário com menos pressão.",
                "{attacker} chuta na linha de cintura, mas esbarra no bloqueio duplo do rival."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'MIDKICK CAPTURADO OU ESQUIVADO',
            color: 0xe74c3c,
            texts: [
                "{attacker} lança o chute médio, mas o oponente segura a perna e ameaça o desequilíbrio!",
                "{attacker} erra a distância do Midkick e passa direto no vazio.",
                "{attacker} tenta o chute na linha de cintura, mas o adversário recua e o golpe não conecta."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Midkick', level, null, true, 'Striking');
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Midkick (Chute Médio)',
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