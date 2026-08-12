const { EmbedBuilder } = require('discord.js');
const { WeightManager } = require('./weightManager');
const { getStaminaBar, getDamageBar, createBetweenRoundsButtons } = require('./uiHelpers');

const activeFights = new Map();

class FightManager {
    static getFight(channelId) {
        return activeFights.get(channelId);
    }

    static createFight(channel, fighter1User, fighter2User) {
        const w1 = WeightManager.getStatus(fighter1User.id);
        const w2 = WeightManager.getStatus(fighter2User.id);

        const f1Penalty = w1 && (w1.status === 'CORTE_DIFICIL' || w1.status === 'PESO_NAO_BATIDO');
        const f2Penalty = w2 && (w2.status === 'CORTE_DIFICIL' || w2.status === 'PESO_NAO_BATIDO');

        const fight = {
            channel,
            durationSeconds: 5 * 60,
            currentRound: 0,
            timeRemaining: 5 * 60,
            timerInterval: null,
            status: 'WAITING',
            fighters: [
                { 
                    id: fighter1User.id, 
                    mention: `<@${fighter1User.id}>`, 
                    damage: 0, 
                    roundDamage: 0, 
                    streak: 0, 
                    cuts: 0, 
                    stamina: f1Penalty ? 95 : 100, 
                    hasWeightPenalty: f1Penalty, 
                    recuperarUsedThisRound: false 
                },
                { 
                    id: fighter2User.id, 
                    mention: `<@${fighter2User.id}>`, 
                    damage: 0, 
                    roundDamage: 0, 
                    streak: 0, 
                    cuts: 0, 
                    stamina: f2Penalty ? 95 : 100, 
                    hasWeightPenalty: f2Penalty, 
                    recuperarUsedThisRound: false 
                }
            ],
            roundScores: []
        };
        activeFights.set(channel.id, fight);
        return fight;
    }

    static createTestFight(channel, fighter1User, fighter2User) {
        const f2Mention = fighter2User.id === 'NPC_DUMMY' ? '🤖 **NPC de Teste**' : `<@${fighter2User.id}>`;

        const w1 = WeightManager.getStatus(fighter1User.id);
        const w2 = fighter2User.id !== 'NPC_DUMMY' ? WeightManager.getStatus(fighter2User.id) : null;

        const f1Penalty = w1 && (w1.status === 'CORTE_DIFICIL' || w1.status === 'PESO_NAO_BATIDO');
        const f2Penalty = w2 && (w2.status === 'CORTE_DIFICIL' || w2.status === 'PESO_NAO_BATIDO');

        const fight = {
            channel,
            durationSeconds: 5 * 60,
            currentRound: 1,
            timeRemaining: 5 * 60,
            timerInterval: null,
            status: 'IN_ROUND',
            fighters: [
                { 
                    id: fighter1User.id, 
                    mention: `<@${fighter1User.id}>`, 
                    damage: 0, 
                    roundDamage: 0, 
                    streak: 0, 
                    cuts: 0, 
                    stamina: f1Penalty ? 95 : 100, 
                    hasWeightPenalty: f1Penalty, 
                    recuperarUsedThisRound: false 
                },
                { 
                    id: fighter2User.id, 
                    mention: f2Mention, 
                    damage: 0, 
                    roundDamage: 0, 
                    streak: 0, 
                    cuts: 0, 
                    stamina: f2Penalty ? 95 : 100, 
                    hasWeightPenalty: f2Penalty, 
                    recuperarUsedThisRound: false 
                }
            ],
            roundScores: []
        };

        fight.timerInterval = setInterval(() => {
            if (fight.status !== 'IN_ROUND') return;
            fight.timeRemaining -= 5;

            if (fight.timeRemaining === 10) {
                channel.send(`🔊 **10 SEGUNDOS!** 🪵 *(Batida de placa na mesa dos árbitros! Reta final do Round ${fight.currentRound}!)*`);
            } else if (fight.timeRemaining <= 0) {
                this.endRound(channel, fight);
            }
        }, 5000);

        activeFights.set(channel.id, fight);
        return fight;
    }

    static startNextRound(channel) {
        const fight = activeFights.get(channel.id);
        if (!fight) return null;

        if (fight.timerInterval) clearInterval(fight.timerInterval);

        fight.currentRound += 1;
        fight.timeRemaining = fight.durationSeconds;
        fight.status = 'IN_ROUND';

        fight.fighters.forEach(f => {
            f.roundDamage = 0;
            f.recuperarUsedThisRound = false;
        });

        fight.timerInterval = setInterval(() => {
            if (fight.status !== 'IN_ROUND') return;
            fight.timeRemaining -= 5;

            if (fight.timeRemaining === 10) {
                channel.send(`🔊 **10 SEGUNDOS!** 🪵 *(Batida de placa na mesa dos árbitros! Reta final do Round ${fight.currentRound}!)*`);
            } else if (fight.timeRemaining <= 0) {
                this.endRound(channel, fight);
            }
        }, 5000);

        return fight;
    }

    static registerHit(channel, attackerUser, tier, level, isCutRisk = true, moveType = 'Striking') {
        const fight = activeFights.get(channel.id);
        if (!fight || fight.status !== 'IN_ROUND') return null;

        let attackerObj = fight.fighters[0];
        let defenderObj = fight.fighters[1];

        if (fight.fighters[1].id === attackerUser.id) {
            attackerObj = fight.fighters[1];
            defenderObj = fight.fighters[0];
        }

        const baseStaminaCost = level >= 4 ? 15 : 8;
        const extraWeightCost = attackerObj.hasWeightPenalty ? 5 : 0;
        attackerObj.stamina = Math.max(0, attackerObj.stamina - (baseStaminaCost + extraWeightCost));

        let alertMessage = null;
        let pendingFinish = null;

        if (Math.random() < 0.02) {
            const fouls = ['Chute na Virilha', 'Dedada no Olho', 'Golpe na Nuca'];
            const foulType = fouls[Math.floor(Math.random() * fouls.length)];
            this.pauseForFoul(channel, fight, attackerObj.mention, defenderObj.mention, foulType);
            return { fight, defenderObj, alertMessage: '🛑 Luta paralisada por golpe ilegal!', isFoul: true };
        }

        if (tier === 'MISS') {
            defenderObj.streak = 0;
        } else {
            const damageValue = tier === 'STAR' ? 1 : tier === 'STAR2' ? 2 : 4;
            defenderObj.damage += damageValue;
            defenderObj.roundDamage += damageValue;
            
            if (tier === 'STAR2' || tier === 'GEM') {
                defenderObj.streak += 1;

                if (isCutRisk) {
                    const cutChance = tier === 'GEM' ? 0.7 : 0.3;
                    if (Math.random() < cutChance && defenderObj.cuts < 3) {
                        defenderObj.cuts += 1;
                    }
                }
            }

            if (defenderObj.cuts === 2) {
                alertMessage = `🩸 **SANGRAMENTO INTENSO:** ${defenderObj.mention} sofreu um corte profundo no rosto!`;
            } else if (defenderObj.cuts >= 3) {
                pendingFinish = { type: 'TKO_MEDICAL', loser: defenderObj.mention, winner: attackerObj.mention, reason: 'Interrupção médica por corte severo' };
            }

            if (defenderObj.streak >= 2 || defenderObj.damage >= 6) {
                alertMessage = alertMessage 
                    ? `${alertMessage}\n⚠️ **PERIGO:** ${defenderObj.mention} está grogue e perto do nocaute!`
                    : `⚠️ **ALERTA DE CRÍTICO:** ${defenderObj.mention} absorveu golpes pesados!`;
            }

            if (!pendingFinish && (defenderObj.damage >= 10 || (tier === 'GEM' && defenderObj.damage >= 6))) {
                if (moveType === 'Grappling' || moveType === 'BJJ') {
                    const subStyle = Math.random() < 0.5 ? 'Bateu 3 vezes (Tapout)' : 'Apagou no golpe de ajuste';
                    pendingFinish = { type: 'SUBMISSION', loser: defenderObj.mention, winner: attackerObj.mention, reason: subStyle };
                } else if (tier === 'GEM') {
                    pendingFinish = { type: 'KO', loser: defenderObj.mention, winner: attackerObj.mention, reason: 'Nocaute brutal (Luta em pé / Ground and Pound)' };
                } else {
                    pendingFinish = { type: 'TKO', loser: defenderObj.mention, winner: attackerObj.mention, reason: 'Interrupção do árbitro por falta de defesa' };
                }
            }
        }

        return { fight, attackerObj, defenderObj, alertMessage, pendingFinish };
    }

    static executeFinish(channel, fight, finishData) {
        if (fight.timerInterval) clearInterval(fight.timerInterval);
        fight.status = 'FINISHED';

        let title = "";
        let color = 0x8e44ad;
        let detailText = "";

        if (finishData.type === 'KO') {
            title = "💥 NOCAUTE (KO)!";
            color = 0x9b59b6;
            detailText = `**Modalidade:** Nocaute Direto (Luta em Pé / Ground and Pound)\n**Vencedor:** ${finishData.winner}\n**Derrotado:** ${finishData.loser}`;
        } else if (finishData.type === 'TKO' || finishData.type === 'TKO_MEDICAL') {
            title = "🛑 NOCAUTE TÉCNICO (TKO)!";
            color = 0xe74c3c;
            detailText = `**Modalidade:** Interrupção do Árbitro / Médica\n**Motivo:** ${finishData.reason}\n**Vencedor:** ${finishData.winner}`;
        } else if (finishData.type === 'SUBMISSION') {
            title = "🥋 FINALIZAÇÃO (SUBMISSION)!";
            color = 0x2ecc71;
            detailText = `**Modalidade:** Luta no Chão / BJJ\n**Desfecho:** ${finishData.reason}\n**Vencedor:** ${finishData.winner}`;
        }

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor(color)
            .setDescription(`>>> ${detailText}`)
            .addFields({ name: '⏱️ Round de Encerramento', value: `Round ${fight.currentRound}` })
            .setImage("https://media.giphy.com/media/l3mZr3M8g82aB0x6E/giphy.gif")
            .setTimestamp();

        channel.send({ embeds: [embed] });
        activeFights.delete(channel.id);
    }

    static pauseForFoul(channel, fight, offenderMention, victimMention, foulType) {
        fight.status = 'PAUSED';

        const embed = new EmbedBuilder()
            .setTitle(`🛑 LUTA PARALISADA • GOLPE ILEGAL!`)
            .setColor(0xe67e22)
            .setDescription(`>>> **Atenção!** Ocorreu um(a) **${foulType}** acidental de ${offenderMention} em ${victimMention}!\n\n Use **\`-retomar\`** para continuar.`)
            .setTimestamp();

        channel.send({ embeds: [embed] });
    }

    static resumeFight(channel) {
        const fight = activeFights.get(channel.id);
        if (!fight || fight.status !== 'PAUSED') return false;

        fight.status = 'IN_ROUND';
        channel.send(`▶️ **LUTA RETOMADA!** O árbitro autorizou o reinício!`);
        return true;
    }

    static endRound(channel, fight) {
        clearInterval(fight.timerInterval);
        fight.timerInterval = null;
        fight.status = 'BETWEEN_ROUNDS';

        const f1 = fight.fighters[0];
        const f2 = fight.fighters[1];
        let f1Score = 10;
        let f2Score = 10;

        const diff = f1.roundDamage - f2.roundDamage;

        if (diff >= 4) { f1Score = 10; f2Score = 8; }
        else if (diff > 0) { f1Score = 10; f2Score = 9; }
        else if (diff <= -4) { f1Score = 8; f2Score = 10; }
        else if (diff < 0) { f1Score = 9; f2Score = 10; }

        fight.roundScores.push({ round: fight.currentRound, f1: f1Score, f2: f2Score });

        const statusList = fight.fighters.map(f => {
            const cutStatus = f.cuts === 1 ? '🩹 Corte Leve' : f.cuts === 2 ? '🩸 Corte Profundo' : '✅ Íntegro';
            return `**Atleta:** ${f.mention}\n• **Gás:** ${getStaminaBar(f.stamina)}\n• **Dano:** ${getDamageBar(f.damage)}\n• **Estado:** ${cutStatus}\n`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setTitle(`🔔 FIM DO ROUND ${fight.currentRound}!`)
            .setColor(0x3498db)
            .setDescription(`Tempo regulamentar encerrado!\nUtilize os botões abaixo para realizar suas ações de intervalo.`)
            .addFields({ name: '📊 Condição Física dos Atletas', value: statusList })
            .setTimestamp();

        const buttonsRow = createBetweenRoundsButtons();

        channel.send({ embeds: [embed], components: [buttonsRow] });
    }

static calculateDecisionScores(fight) {
        const f1 = fight.fighters[0];
        const f2 = fight.fighters[1];

        // Nomes dos juízes oficiais de MMA
        const judges = ['Sal D\'Amato', 'Derek Cleary', 'Mike Bell'];
        const judgeCards = judges.map(name => ({
            name,
            f1Scores: [],
            f2Scores: [],
            f1Total: 0,
            f2Total: 0
        }));

        // Calcula a pontuação individual de cada juiz round por round
        fight.roundScores.forEach(r => {
            const diff = r.f1 - r.f2; // Diferença de dano gravada no round

            judgeCards.forEach(judge => {
                let j1 = 10;
                let j2 = 10;

                // Variação leve e realista de leitura dos juízes em rounds parelhos (~15% de divergência)
                let divergence = 0;
                if (Math.abs(diff) <= 1 && Math.random() < 0.15) {
                    divergence = diff > 0 ? -1 : 1;
                }

                const effectiveDiff = diff + divergence;

                if (effectiveDiff >= 4) { j1 = 10; j2 = 8; }
                else if (effectiveDiff > 0) { j1 = 10; j2 = 9; }
                else if (effectiveDiff <= -4) { j1 = 8; j2 = 10; }
                else if (effectiveDiff < 0) { j1 = 9; j2 = 10; }
                else { j1 = 10; j2 = 10; }

                judge.f1Scores.push(j1);
                judge.f2Scores.push(j2);
                judge.f1Total += j1;
                judge.f2Total += j2;
            });
        });

        // Contabiliza o veredito de cada juiz
        let f1Votes = 0;
        let f2Votes = 0;
        let drawVotes = 0;

        const cardsSummary = judgeCards.map(j => {
            let verdict = "";
            if (j.f1Total > j.f2Total) {
                f1Votes++;
                verdict = `${f1.mention}`;
            } else if (j.f2Total > j.f1Total) {
                f2Votes++;
                verdict = `${f2.mention}`;
            } else {
                drawVotes++;
                verdict = "Empate";
            }
            return `👨‍⚖️ **${j.name}:** \`${j.f1Total} - ${j.f2Total}\` *(Vencedor: ${verdict})*`;
        }).join('\n');

        // Determina o tipo de decisão oficial
        let decisionType = "";
        let winnerMention = "";

        if (f1Votes === 3) {
            decisionType = "DECISÃO UNÂNIME (3-0)";
            winnerMention = f1.mention;
        } else if (f2Votes === 3) {
            decisionType = "DECISÃO UNÂNIME (0-3)";
            winnerMention = f2.mention;
        } else if (f1Votes === 2 && f2Votes === 1) {
            decisionType = "DECISÃO DIVIDIDA (2-1)";
            winnerMention = f1.mention;
        } else if (f2Votes === 2 && f1Votes === 1) {
            decisionType = "DECISÃO DIVIDIDA (1-2)";
            winnerMention = f2.mention;
        } else if (f1Votes === 2 && drawVotes === 1) {
            decisionType = "DECISÃO MAJORITÁRIA (2-0)";
            winnerMention = f1.mention;
        } else if (f2Votes === 2 && drawVotes === 1) {
            decisionType = "DECISÃO MAJORITÁRIA (0-2)";
            winnerMention = f2.mention;
        } else {
            decisionType = "EMPATE TÉCNICO / DIVIDIDO";
            winnerMention = "🤝 Empate";
        }

        const roundByRoundText = fight.roundScores.map((r, index) => {
            const scoresText = judgeCards.map(j => `${j.name.split(' ')[0]}: ${j.f1Scores[index]}-${j.f2Scores[index]}`).join(' | ');
            return `• **Round ${r.round}:** (${scoresText})`;
        }).join('\n');

        return { f1, f2, decisionType, winnerMention, cardsSummary, roundByRoundText };
    }

    static stopFight(channel) {
        const fight = activeFights.get(channel.id);
        if (!fight) return false;
        if (fight.timerInterval) clearInterval(fight.timerInterval);
        activeFights.delete(channel.id);
        return true;
    }
}

module.exports = { FightManager };