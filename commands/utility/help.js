const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Exibe a lista completa de comandos e golpes ativos no bot.',
    noLevel: true,
    async execute(message) {
        const commands = message.client.commands;

        const embed = new EmbedBuilder()
            .setTitle('🥊 GUIA DE COMANDOS • MMA RP')
            .setColor(0xd63031)
            .setDescription('>>> Todos os comandos e golpes atualmente registrados e operacionais no sistema.')
            .addFields(
                {
                    name: '🎮 Controle de Luta & Arbitragem',
                    value: '• `-luta @Lutador` — Inicia uma luta regulamentar\n• `-decisao` — Encerra o tempo e chama os 3 juízes oficiais\n• `-retomar` — Retoma a luta após interrupção por golpe ilegal\n• `-pesagem` — Realiza o teste da balança antes da luta'
                },
                {
                    name: '🥊 Trocação & Quedas (Níveis 1 a 5)',
                    value: '• **Trocação:** `jab`, `direto`, `cruzado`, `uppercut`, `chute` *(ex: `-jab3`)*\n• **Quedas:** `doubleleg`, `singleleg`, `quedajudo` *(ex: `-doubleleg2`)*'
                },
                {
                    name: '🥋 Jiu-Jitsu / Grappling (Níveis 1 a 5)',
                    value: '• **Finalizações & Posições:** `armlock`, `guilhotina`, `mataleao`, `kimura`, `omoplata`, `leglock`, `triangulomao`, `raspagem`, `montada`, `costas`, `guarda` *(ex: `-kimura4`)*'
                },
                {
                    name: '🛡️ Defesa & Tática (Níveis 1 a 5)',
                    value: '• **Defesa:** `esquiva`, `bloqueio` *(ex: `-esquiva3`)*\n• **Tática de Luta:** `-finta` *(tenta abrir a guarda do oponente)*'
                },
                {
                    name: '🧊 Intervalo de Round',
                    value: '• `-recuperar` — Trata ferimentos e recupera gás *(também disponível via Botão)*'
                }
            )
            .setFooter({ text: `Total de comandos e golpes carregados: ${commands.size}` })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }
};