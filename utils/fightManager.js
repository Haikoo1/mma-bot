const { EmbedBuilder } = require('discord.js');
const { WeightManager } = require('./weightManager');
const { getStaminaBar, getDamageBar, createBetweenRoundsButtons } = require('./uiHelpers');

const activeFights = new Map();

function createFighterState(user, penalty) {
    return {
        id: user.id,
        mention: user.id === 'NPC_DUMMY' ? '🤖 **NPC de Teste**' : `<@${user.id}>`,
        username: user.username || 'Lutador',
        damage: 0,
        roundDamage: 0,
        streak: 0,
        cuts: 0,
        stamina: penalty ? 95 : 100,
        hasWeightPenalty: penalty,
        recuperarUsedThisRound: false,
        counterWindow: false,
        defenseLevel: null,
        roundPoints: 0,
        totalPoints: 0
    };
}

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
                createFighterState(fighter1User, f1Penalty),
                createFighterState(fighter2User, f2Penalty)
            ],
            roundScores: [],
            roundReport: []
        };
        activeFights.set(channel.id, fight);
        return fight;
    }

    static createTestFight(channel, fighter1User, fighter2User) {
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
                createFighterState(fighter1User, f1Penalty),
                createFighterState(fighter2User, f2Penalty)
            ],
            roundScores: [],
            roundReport: []
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
            f.roundPoints = 0;
            f.recuperarUsedThisRound = false;
            f.defenseLevel = null;
        });

        fight.roundReport = [];

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

    static registerHit(channel, attackerUser, moveName, atkLevel, defLevel = null, isCutRisk = true, moveType = 'Striking', staminaCost = 3) {
        const fight = activeFights.get(channel.id);
        if (!fight || fight.status !== 'IN_ROUND') return null;

        let attackerObj = fight.fighters[0];
        let defenderObj = fight.fighters[1];

        if (fight.fighters[1].id === attackerUser.id) {
            attackerObj = fight.fighters[1];
            defenderObj = fight.fighters[0];
        }

        // ⚡ Verificação e Consumo de Contragolpe (+1 Nível Efetivo se Ativo)
        let effectiveAtkLevel = atkLevel;
        let wasCounter = false;

        if (attackerObj.counterWindow) {
            effectiveAtkLevel = Math.min(5, atkLevel + 1);
            attackerObj.counterWindow = false;
            wasCounter = true;
        }

        // Cálculo dinâmico de defesa: usa a defesa declarada pelo oponente (se houver) ou gera uma automática
        if (defLevel === null) {
            if (defenderObj.defenseLevel != null) {
                defLevel = defenderObj.defenseLevel;
                defenderObj.defenseLevel = null; // Consome a defesa declarada pelo oponente
            } else {
                const staminaFactor = defenderObj.stamina > 50 ? 1 : 0;
                defLevel = Math.min(5, Math.max(1, Math.floor(Math.random() * 3) + 1 + staminaFactor));
            }
        }

        // Gasto de Stamina proporcional (multiplicador específico de cada golpe)
        const baseStaminaCost = staminaCost * effectiveAtkLevel;
        const extraWeightCost = attackerObj.hasWeightPenalty ? 5 : 0;
        attackerObj.stamina = Math.max(0, attackerObj.stamina - (baseStaminaCost + extraWeightCost));

        // Pausa por golpe ilegal (2% de chance)
        if (Math.random() < 0.02) {
            const fouls = ['Chute na Virilha', 'Dedada no Olho', 'Golpe na Nuca'];
            const foulType = fouls[Math.floor(Math.random() * fouls.length)];
            this.pauseForFoul(channel, fight, attackerObj.mention, defenderObj.mention, foulType);
            return { fight, alertMessage: '🛑 Luta paralisada por golpe ilegal!', isFoul: true };
        }

        // CÁLCULO REBALANCEADO (DANO POR TROCA)
        const netValue = effectiveAtkLevel - defLevel;
        let hitResult = "";
        let damageValue = 0;
        let pointsGained = 0;
        let alertMessage = null;

        if (netValue <= -2) {
            hitResult = "🛡️ **DEFESA PERFEITA:** O oponente esquivou ou bloqueou totalmente o golpe sem sofrer impacto!";
            damageValue = 0;
            pointsGained = 0;
            defenderObj.streak = 0;
            defenderObj.counterWindow = true;
            alertMessage = `⚡ **CONTRAGOLPE ENCAIXADO:** ${defenderObj.mention} abriu brecha e terá bônus no próximo ataque!`;
        } else if (netValue <= 0) {
            hitResult = "⚠️ **DEFESA PARCIAL (STAR):** O golpe foi amortecido pela guarda, causando apenas dano mínimo.";
            damageValue = 1; // 1 Ponto de dano
            pointsGained = 2;
            defenderObj.streak = 0;
        } else if (netValue <= 2) {
            hitResult = "💥 **GOLPE LIMPO (STAR2):** O ataque furou a guarda e conectou com precisão no alvo!";
            damageValue = 4; // 4 Pontos de dano
            pointsGained = 6;
            defenderObj.streak += 1;
        } else {
            hitResult = "🔥 **GOLPE CRÍTICO (GEM):** O ataque superou completamente a defesa e causou estragos graves!";
            damageValue = 7; // 7 Pontos de dano
            pointsGained = 10;
            defenderObj.streak += 2;
        }

        defenderObj.damage += damageValue;
        defenderObj.roundDamage += damageValue;
        attackerObj.roundPoints += pointsGained;
        attackerObj.totalPoints += pointsGained;

        // Teste de Corte / Sangramento
        if (damageValue >= 4 && isCutRisk) {
            const cutChance = netValue >= 3 ? 0.5 : 0.20;
            if (Math.random() < cutChance && defenderObj.cuts < 3) {
                defenderObj.cuts += 1;
            }
        }

        if (defenderObj.cuts === 2) {
            alertMessage = alertMessage 
                ? `${alertMessage}\n🩸 **SANGRAMENTO INTENSO:** ${defenderObj.mention} sofreu um corte profundo no rosto!`
                : `🩸 **SANGRAMENTO INTENSO:** ${defenderObj.mention} sofreu um corte profundo no rosto!`;
        } else if (defenderObj.cuts >= 3) {
            alertMessage = alertMessage 
                ? `${alertMessage}\n🩸 **CORTE GRAVÍSSIMO:** ${defenderObj.mention} sangra muito e a equipe médica está em alerta!`
                : `🩸 **CORTE GRAVÍSSIMO:** ${defenderObj.mention} sangra muito e a equipe médica está em alerta!`;
        }

        if (defenderObj.damage >= 12) {
            alertMessage = alertMessage 
                ? `${alertMessage}\n⚠️ **PERIGO:** ${defenderObj.mention} está grogue e perto do nocaute!`
                : `⚠️ **ALERTA DE CRÍTICO:** ${defenderObj.mention} absorveu pancadas pesadas!`;
        }

        // Registra a troca no relatório do round (exibido uma única vez ao fim do round)
        fight.roundReport.push(
            `${attackerObj.mention} **${moveName}** (Atk \`${effectiveAtkLevel}\` x Def \`${defLevel}\`) → ${damageValue === 0 ? '🛡️ **Bloqueado**' : `💥 **+${damageValue} dmg**`}`
        );

        return {
            fight,
            attackerObj,
            defenderObj,
            moveName,
            atkLevel: effectiveAtkLevel,
            defLevel,
            netValue,
            hitResult,
            damageValue,
            alertMessage,
            wasCounter
        };
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

        // Avaliação de Súmulas Baseada em Dano + Pontos Táticos (sempre 10-9, 10-8 ou 10-7; nunca empata)
        const f1Perf = f1.roundDamage * 2 + f1.roundPoints;
        const f2Perf = f2.roundDamage * 2 + f2.roundPoints;
        const diff = f1Perf - f2Perf;

        if (diff >= 30) { f1Score = 10; f2Score = 7; }
        else if (diff >= 18) { f1Score = 10; f2Score = 8; }
        else if (diff > 0) { f1Score = 10; f2Score = 9; }
        else if (diff <= -30) { f1Score = 7; f2Score = 10; }
        else if (diff <= -18) { f1Score = 8; f2Score = 10; }
        else if (diff < 0) { f1Score = 9; f2Score = 10; }
        else {
            // Round empatado tecnicamente: desempate por pontos táticos, depois total de pontos, depois sorteio
            if (f1.roundPoints > f2.roundPoints) { f1Score = 10; f2Score = 9; }
            else if (f2.roundPoints > f1.roundPoints) { f1Score = 9; f2Score = 10; }
            else if (f1.totalPoints > f2.totalPoints) { f1Score = 10; f2Score = 9; }
            else if (f2.totalPoints > f1.totalPoints) { f1Score = 9; f2Score = 10; }
            else {
                if (Math.random() < 0.5) { f1Score = 10; f2Score = 9; }
                else { f1Score = 9; f2Score = 10; }
            }
        }

        fight.roundScores.push({ round: fight.currentRound, f1: f1Score, f2: f2Score });

        const statusList = fight.fighters.map(f => {
            const cutStatus = f.cuts === 1 ? '🩹 Corte Leve' : f.cuts === 2 ? '🩸 Corte Profundo' : '✅ Íntegro';
            const counterStatus = f.counterWindow ? '⚡ *Contragolpe Pronto*' : '➖ *Neutro*';
            return `**Atleta:** ${f.mention}\n• **Gás:** ${getStaminaBar(f.stamina)}\n• **Dano:** ${getDamageBar(f.damage, 20)}\n• **Estado:** ${cutStatus} | ${counterStatus}\n`;
        }).join('\n');

        const reportText = fight.roundReport.length > 0
            ? fight.roundReport.join('\n')
            : 'Nenhuma troca de golpes registrada neste round.';

        const embed = new EmbedBuilder()
            .setTitle(`🔔 FIM DO ROUND ${fight.currentRound}!`)
            .setColor(0x3498db)
            .setDescription(`Tempo regulamentar encerrado!\nSúmula do Round: **${f1.mention} ${f1Score} x ${f2Score} ${f2.mention}**\nUtilize os botões abaixo para realizar suas ações de intervalo.`)
            .addFields(
                { name: '📊 Relatório do Round (Atk x Def)', value: reportText },
                { name: '📊 Condição Física dos Atletas', value: statusList }
            )
            .setTimestamp();

        // Reseta contadores de round após pontuação
        fight.fighters.forEach(f => {
            f.roundDamage = 0;
            f.roundPoints = 0;
            f.recuperarUsedThisRound = false;
            f.defenseLevel = null;
        });

        fight.roundReport = [];

        const buttonsRow = createBetweenRoundsButtons();

        channel.send({ embeds: [embed], components: [buttonsRow] });
    }

    static calculateDecisionScores(fight) {
        const f1 = fight.fighters[0];
        const f2 = fight.fighters[1];

        const judges = ['Sal D\'Amato', 'Derek Cleary', 'Mike Bell'];
        const judgeCards = judges.map(name => ({
            name,
            f1Scores: [],
            f2Scores: [],
            f1Total: 0,
            f2Total: 0
        }));

        fight.roundScores.forEach(r => {
            const diff = r.f1 - r.f2;

            judgeCards.forEach(judge => {
                let j1 = 10;
                let j2 = 10;

                let divergence = 0;
                if (Math.abs(diff) <= 1 && Math.random() < 0.15) {
                    divergence = diff > 0 ? -1 : 1;
                }

                const effectiveDiff = diff + divergence;

                // Súmula limitada a 10-9, 10-8 ou 10-7; nenhum round empata
                if (effectiveDiff >= 3) { j1 = 10; j2 = 7; }
                else if (effectiveDiff >= 2) { j1 = 10; j2 = 8; }
                else if (effectiveDiff > 0) { j1 = 10; j2 = 9; }
                else if (effectiveDiff <= -3) { j1 = 7; j2 = 10; }
                else if (effectiveDiff <= -2) { j1 = 8; j2 = 10; }
                else if (effectiveDiff < 0) { j1 = 9; j2 = 10; }
                else {
                    // Nunca empata: quem venceu oficialmente o round leva 10-9
                    if (diff > 0) { j1 = 10; j2 = 9; }
                    else { j1 = 9; j2 = 10; }
                }

                judge.f1Scores.push(j1);
                judge.f2Scores.push(j2);
                judge.f1Total += j1;
                judge.f2Total += j2;
            });
        });

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
                // Cartão empatado: desempate por rounds vencidos, depois pontos totais, depois sorteio
                const f1RoundsWon = fight.roundScores.filter(r => r.f1 > r.f2).length;
                const f2RoundsWon = fight.roundScores.filter(r => r.f2 > r.f1).length;

                if (f1RoundsWon > f2RoundsWon) { f1Votes++; verdict = `${f1.mention}`; }
                else if (f2RoundsWon > f1RoundsWon) { f2Votes++; verdict = `${f2.mention}`; }
                else if (f1.totalPoints > f2.totalPoints) { f1Votes++; verdict = `${f1.mention}`; }
                else if (f2.totalPoints > f1.totalPoints) { f2Votes++; verdict = `${f2.mention}`; }
                else {
                    if (Math.random() < 0.5) { f1Votes++; verdict = `${f1.mention}`; }
                    else { f2Votes++; verdict = `${f2.mention}`; }
                }
            }
            return `👨‍⚖️ **${j.name}:** \`${j.f1Total} - ${j.f2Total}\` *(Vencedor: ${verdict})*`;
        }).join('\n');

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

        const f1Total = judgeCards.reduce((sum, j) => sum + j.f1Total, 0);
        const f2Total = judgeCards.reduce((sum, j) => sum + j.f2Total, 0);

        return { f1, f2, decisionType, winnerMention, cardsSummary, roundByRoundText, scoreSummary: cardsSummary, f1Total, f2Total };
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