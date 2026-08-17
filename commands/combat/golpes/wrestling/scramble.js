const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'scramble',
    attribute: 'wrestling',
    staminaCost: 4,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'SCRAMBLE ESPETACULAR (VITÓRIA NA MOVIMENTAÇÃO)',
            color: 0x9b59b6,
            texts: [
                "{attacker} acelera a movimentação no solo, gira sobre os quadris com velocidade absurda e domina o oponente por cima!",
                "{attacker} vence uma disputa insana de transições no chão e termina em posição dominante de controle!",
                "{attacker} mostra um agilidade impressionante no emaranhado do chão, dando a volta nas costas do adversário!",
                "{attacker} domina a troca de posições em velocidade total e sepulta o rival sob seu peso no solo!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'DISPUTA DE QUADRIL VENCIDA',
            color: 0xf1c40f,
            texts: [
                "{attacker} usa a explosão muscular no chão para escorregar e ganhar a posição superior.",
                "{attacker} reage rápido na troca de pegadas no solo e assume a vantagem no combate.",
                "{attacker} vence o scramble no giro e garante o topo na transição de chão.",
                "{attacker} sobressai-se no ritmo intenso do chão e ganha a posição de vantagem."
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'SCRAMBLE NEUTRO',
            color: 0x2ecc71,
            texts: [
                "{attacker} e o oponente se embolam no solo em alta velocidade, terminando em uma posição neutra.",
                "{attacker} força a transição, mas o adversário acompanha a movimentação no mesmo ritmo.",
                "{attacker} tenta acelerar a disputa no chão, porém o confronto se nivela e ambos reajustam a base."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'SCRAMBLE PERDIDO',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta a movimentação acelerada no solo, mas se expõe e fica por baixo no grampo.",
                "{attacker} perde o apoio durante o giro e cede o controle de posição para o oponente.",
                "{attacker} afoba-se nas transições do chão e acaba cedendo as costas para o adversário."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Scramble', level, null, false, 'Wrestling', this.staminaCost);
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


    }
};