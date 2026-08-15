const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { FightManager } = require('../../utils/fightManager');
const roleConfig = require('../../config/roles');

module.exports = {
    name: 'luta',
    async execute(message, args) {
        const subCommand = args[0]?.toLowerCase();

        // 🧪 MODO DE TESTE (Exclusivo Staff/Admin)
        if (subCommand === 'teste') {
            const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator) ||
                (roleConfig.adminRoleId && message.member.roles.cache.has(roleConfig.adminRoleId));

            if (!isAdmin) {
                return message.reply('❌ Apenas membros da Staff/Admin podem criar lutas de teste.');
            }

            const targetUser = message.mentions.users.first();
            const fighter1 = message.author;
            const fighter2 = targetUser || { id: 'NPC_DUMMY', username: 'NPC de Teste' };

            FightManager.createTestFight(message.channel, fighter1, fighter2);

            const embed = new EmbedBuilder()
                .setTitle('🧪 MODO DE TESTE ATIVADO!')
                .setColor(0x9b59b6)
                .setDescription(`Uma luta de testes foi gerada automaticamente!\n\n🥊 **Confronto:** <@${fighter1.id}> vs ${fighter2.id === 'NPC_DUMMY' ? '🤖 **NPC de Teste**' : `<@${fighter2.id}>`}\n🔔 **Round 1:** \`EM ANDAMENTO\` (5 Minutos)\n\n*Você já pode testar todos os golpes, -recuperar, -corner e etc.*`)
                .setFooter({ text: 'Luta de testes • Exclusivo para Staff' })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        }

        // 🥊 INICIAR LUTA OFICIAL
        if (subCommand === 'iniciar') {
            const mentionedUsers = Array.from(message.mentions.users.values());

            if (mentionedUsers.length < 2) {
                return message.reply('❌ **Mencione os dois lutadores da luta!**\nExemplo: `-luta iniciar @Lutador1 @Lutador2`');
            }

            const fighter1 = mentionedUsers[0];
            const fighter2 = mentionedUsers[1];

            if (fighter1.id === fighter2.id) {
                return message.reply('❌ Os lutadores selecionados devem ser dois usuários diferentes!');
            }

            const confirmEmbed = new EmbedBuilder()
                .setTitle('🥊 NOVO CONFRONTO PROPOSTO!')
                .setColor(0xe74c3c)
                .setDescription(`Um combate foi anunciado no octógono!\nAmbos os lutadores precisam reagir com **✅** abaixo para confirmar a presença.`)
                .addFields(
                    { name: '🥊 Lutador 1', value: `<@${fighter1.id}>\n Status: ⏳ *Aguardando...*`, inline: true },
                    { name: '🥊 Lutador 2', value: `<@${fighter2.id}>\n Status: ⏳ *Aguardando...*`, inline: true },
                    { name: '⏱️ Duração dos Rounds', value: '`5 Minutos`', inline: false }
                )
                .setFooter({ text: 'A confirmação expira em 3 minutos.' })
                .setTimestamp();

            const fightMsg = await message.channel.send({ 
                content: `🔔 <@${fighter1.id}> e <@${fighter2.id}>, confirmem o combate!`, 
                embeds: [confirmEmbed] 
            });

            await fightMsg.react('✅');

            const confirmedUsers = new Set();
            const filter = (reaction, user) => reaction.emoji.name === '✅' && (user.id === fighter1.id || user.id === fighter2.id);
            const collector = fightMsg.createReactionCollector({ filter, time: 180000 });

            collector.on('collect', async (reaction, user) => {
                confirmedUsers.add(user.id);

                const f1Confirmed = confirmedUsers.has(fighter1.id);
                const f2Confirmed = confirmedUsers.has(fighter2.id);

                const updatedEmbed = EmbedBuilder.from(confirmEmbed).setFields(
                    { name: '🥊 Lutador 1', value: `<@${fighter1.id}>\n Status: ${f1Confirmed ? '✅ **CONFIRMADO!**' : '⏳ *Aguardando...*'}`, inline: true },
                    { name: '🥊 Lutador 2', value: `<@${fighter2.id}>\n Status: ${f2Confirmed ? '✅ **CONFIRMADO!**' : '⏳ *Aguardando...*'}`, inline: true },
                    { name: '⏱️ Duração dos Rounds', value: '`5 Minutos`', inline: false }
                );

                if (f1Confirmed && f2Confirmed) {
                    collector.stop('confirmed');

                    updatedEmbed.setColor(0x2ecc71)
                        .setTitle('🔥 CONFRONTO CONFIRMADO! LUTA PRONTA!')
                        .setDescription(`Ambos os lutadores subiram no octógono!\n\nDigite **\`-round\`** para dar início ao Round 1!`);

                    await fightMsg.edit({ embeds: [updatedEmbed] });
                    FightManager.createFight(message.channel, fighter1, fighter2);
                } else {
                    await fightMsg.edit({ embeds: [updatedEmbed] });
                }
            });

            collector.on('end', (collected, reason) => {
                if (reason !== 'confirmed') {
                    const cancelEmbed = EmbedBuilder.from(confirmEmbed)
                        .setColor(0x95a5a6)
                        .setTitle('❌ COMBATE CANCELADO')
                        .setDescription('O tempo de confirmação expirou antes que ambos os lutadores reagissem.');
                    
                    fightMsg.edit({ embeds: [cancelEmbed] });
                }
            });

            return;
        }

        // ⚖️ APURAÇÃO DA DECISÃO (Envia no Privado do Admin)
        if (subCommand === 'decisao') {
            const fight = FightManager.getFight(message.channel.id);
            if (!fight) return message.reply('❌ Nenhuma luta ativa neste canal.');

            const result = FightManager.calculateDecisionScores(fight);

            const privateEmbed = new EmbedBuilder()
                .setTitle('⚖️ DECISÃO DOS ÁRBITROS (VISÃO DO ADMIN)')
                .setColor(0xf1c40f)
                .setDescription(`>>> **Resultado Apurado:**\n**Tipo:** ${result.decisionType}\n**Vencedor:** ${result.winnerMention}\n\n**Pontuação Detalhada:**\n${result.scoreSummary}\n\n**Total:** ${result.f1.mention} \`${result.f1Total}\` pts vs \`${result.f2Total}\` pts ${result.f2.mention}`)
                .setFooter({ text: 'Relatório gerado exclusivamente para a Staff.' })
                .setTimestamp();

            try {
                await message.author.send({ embeds: [privateEmbed] });
                message.reply('📩 **Resultado oficial da Decisão enviado no seu privado (DM)!**');
            } catch (err) {
                message.reply({ content: '⚠️ Suas DMs estão fechadas! Exibindo o resultado aqui no canal:', embeds: [privateEmbed] });
            }

            FightManager.stopFight(message.channel);
            return;
        }

        // 💥 NOCAUTE MANUAL
        if (subCommand === 'nocaute') {
            const fight = FightManager.getFight(message.channel.id);
            if (!fight) return message.reply('❌ Nenhuma luta ativa neste canal.');

            const mentionedUser = message.mentions.users.first();
            if (!mentionedUser) return message.reply('❌ Mencione o lutador que foi nocauteado.');

            const loser = fight.fighters.find(f => f.id === mentionedUser.id);
            const winner = fight.fighters.find(f => f.id !== mentionedUser.id);

            if (!loser) return message.reply('❌ O usuário mencionado não faz parte da luta atual neste canal.');

            const finishData = {
                type: 'KO',
                loser: loser.mention,
                winner: winner ? winner.mention : 'Adversário',
                reason: 'Nocaute declarado manualmente via comando.'
            };

            FightManager.executeFinish(message.channel, fight, finishData);
            return;
        }

        // 🛑 ENCERRAR LUTA
        if (subCommand === 'encerrar') {
            const stopped = FightManager.stopFight(message.channel);
            if (stopped) return message.reply('🛑 **Luta e timers encerrados neste canal.**');
            return message.reply('❌ Nenhuma luta ativa para encerrar.');
        }

        return message.reply('❌ Subcomandos válidos: `iniciar`, `teste`, `decisao`, `nocaute`, `encerrar`.');
    }
};