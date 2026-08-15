const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'quedadupla',
    attribute: 'wrestling',
    staminaCost: 5,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'BAIANA EXPLOSIVA (DOUBLE LEG SLAM)',
            color: 0x9b59b6,
            texts: [
                "{attacker} explode em uma Baiana violenta, trava as duas pernas do oponente e o arremessa com tudo no chão!",
                "{attacker} atravessa o octógono em uma travada de pernas espetacular, plantando o adversário no solo!",
                "{attacker} abaixa o nível rapidamente, abraça as duas pernas e enterra o rival no tatame com uma queda avassaladora!",
                "{attacker} aciona os motores numa baiana perfeita, erguendo o oponente e aplicando um slam cinematográfico!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'DOUBLE LEG LIMPO',
            color: 0xf1c40f,
            texts: [
                "{attacker} abaixa o nível, agarra as duas pernas e derruba o oponente rente à grade.",
                "{attacker} arranca o apoio do adversário com uma entrada dupla rápida e assume o chão!",
                "{attacker} entra em velocidade na baiana e derruba o oponente de forma limpa no centro do octógono.",
                "{attacker} grampeia as duas pernas do adversário e completa a queda caindo por cima com autoridade!"
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'ENTRADA DUPLA PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} consegue abraçar as duas pernas, mas o oponente encosta na grade para não cair seco.",
                "{attacker} arrasta o oponente para o chão após uma briga forte de esgrima.",
                "{attacker} tenta o double leg e consegue derrubar, mas o adversário amortece a queda e puxa para a guarda."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'DOUBLE LEG BLOQUEADO',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta a baiana de longe, telegrafa a entrada e toma um sprawl pesado na cabeça.",
                "{attacker} ataca as pernas no vazio e fica em posição vulnerável por baixo.",
                "{attacker} se afoba no mergulho e esbarra na defesa de braços firme do adversário."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Queda Dupla', level, null, false, 'Wrestling', this.staminaCost);
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Queda Dupla (Baiana)',
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