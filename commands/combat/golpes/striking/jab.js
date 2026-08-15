const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'jab',
    attribute: 'striking',
    staminaCost: 2,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'JAB PERFEITO / COUNTER',
            color: 0x9b59b6,
            texts: [
                "{attacker} se antecipa ao movimento do oponente e lança um Jab devastador de encontro! O impacto estala forte no octógono!",
                "{attacker} encontra uma brecha milimétrica na guarda e soca direto no queixo! O adversário sente o golpe e dobra os joelhos!",
                "{attacker} solta um Jab duplo rápido como um raio! O primeiro abre a guarda e o segundo conecta em cheio no nariz!",
                "{attacker} projeta todo o peso do corpo num Jab esticado de esquerda! A cabeça do oponente chicoteia para trás!"
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'JAB LIMPO',
            color: 0xf1c40f,
            texts: [
                "{attacker} estica o braço rapidamente e acerta um Jab seco no rosto do oponente, marcando a distância com perfeição.",
                "{attacker} muda de nível e solta um Jab forte no plexo do adversário, fazendo-o soltar o ar!",
                "{attacker} conecta um Jab limpo na boca do estômago antes de dar um passo para fora.",
                "{attacker} lança a mão da frente estalando a luva bem na ponta do nariz do oponente!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'JAB PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} lança o Jab, mas ele apenas roça a testa do oponente sem causar grande impacto.",
                "{attacker} toca o rosto do adversário com um Jab leve apenas para medir o raio de ação.",
                "{attacker} solta o golpe, mas o oponente consegue amortecer parcialmente colocando a luva na frente."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'JAB ESQUIVADO',
            color: 0xe74c3c,
            texts: [
                "{attacker} projeta o Jab, mas o oponente pendula com elegância por baixo sem sofrer nada!",
                "{attacker} erra o tempo do golpe e soca o ar enquanto o adversário dá um passo atrás.",
                "{attacker} solta a mão, mas o oponente fecha a guarda alta e bloqueia o golpe com facilidade."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Jab', level, null, true, 'Striking', this.staminaCost);
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