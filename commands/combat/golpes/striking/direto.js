const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'direto',
    attribute: 'striking',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'DIRETO DEVASTADOR',
            color: 0x9b59b6,
            texts: [
                "{attacker} roda o quadril e solta um Direto potente no queixo do oponente! O impacto estremece o octógono!",
                "{attacker} acerta um Direto em cheio na ponta do queixo, fazendo as pernas do adversário dobrarem!",
                "{attacker} dispara uma bomba de direita de encontro, explodindo a guarda e fazendo o oponente balançar!",
                "{attacker} encaixa um Direto cirúrgico bem no centro do rosto, jogando o adversário contra as grades!"
            ],
            gifs: ["https://media.giphy.com/media/l3mZr3M8g82aB0x6E/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'DIRETO POTENTE',
            color: 0xf1c40f,
            texts: [
                "{attacker} lança a mão traseira com muita força e acerta em cheio o rosto do oponente!",
                "{attacker} fura a guarda frontal com um Direto rápido, fazendo o adversário recuar!",
                "{attacker} conecta um Direto limpo no peito do oponente, tirando a base do rival!",
                "{attacker} explode um Direto no osso da bochecha do oponente com excelente velocidade!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'DIRETO CONECTADO',
            color: 0x2ecc71,
            texts: [
                "{attacker} acerta o Direto na guarda alta, empurrando o oponente para trás.",
                "{attacker} toca o rosto do adversário com o Direto, somando pontos limpos.",
                "{attacker} dispara o Direto raspando no queixo do oponente sem o peso total do corpo."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'DIRETO BLOQUEADO',
            color: 0xe74c3c,
            texts: [
                "{attacker} telegrafa o Direto e o oponente se esquiva com facilidade.",
                "{attacker} solta a mão direita, mas esbarra no bloqueio duplo do adversário.",
                "{attacker} projeta o Direto com tanta força que perde levemente o equilíbrio após passar no vazio!"
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Direto', level, null, true, 'Striking');
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
            // Envia o Embed separado de Status / Confronto Atk vs Def
            await FightManager.sendHitResult(message.channel, hitResult);

            if (hitResult.pendingFinish) {
                await FightManager.executeFinish(message.channel, hitResult.fight, hitResult.pendingFinish);
            }
        }
    }
};