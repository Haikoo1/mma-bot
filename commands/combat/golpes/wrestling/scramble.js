const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'scramble',
    attribute: 'wrestling',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'SCRAMBLE ESPETACULAR (VITÓRIA NA MOVIMENTAÇÃO)',
            color: 0x9b59b6,
            texts: [
                "{attacker} acelera a movimentação no solo, gira sobre os quadris com velocidade absurda e domina o oponente por cima!",
                "{attacker} vence uma disputa insana de transições no chão e termina em posição dominante de controle!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'DISPUTA DE QUADRIL VENCIDA',
            color: 0xf1c40f,
            texts: [
                "{attacker} usa a explosão muscular no chão para escorregar e ganhar a posição superior.",
                "{attacker} reage rápido na troca de pegadas no solo e assume a vantagem no combate."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'SCRAMBLE NEUTRO',
            color: 0x2ecc71,
            texts: [
                "{attacker} e o oponente se embolam no solo em alta velocidade, terminando em uma posição neutra.",
                "{attacker} força a transição, mas o adversário acompanha a movimentação no mesmo ritmo."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'SCRAMBLE PERDIDO',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta a movimentação acelerada no solo, mas se expõe e fica por baixo no grampo.",
                "{attacker} perde o apoio durante o giro e cede o controle de posição para o oponente."
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
            moveName: 'Scramble (Disputa de Solo)',
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