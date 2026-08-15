const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

const PREFIX = '-';
client.commands = new Map();

// Função recursiva para varrer todas as pastas e subpastas de comandos
const commandsPath = path.join(__dirname, 'commands');

function loadCommands(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory()) {
            loadCommands(filePath);
        } else if (file.name.endsWith('.js')) {
            const command = require(filePath);
            if (command.name) {
                client.commands.set(command.name.toLowerCase(), command);
            }
        }
    }
}

loadCommands(commandsPath);

client.once('ready', () => {
    console.log(`🤖 Bot de MMA RP Online! Conectado como ${client.user.tag}`);
    console.log(`📊 Total de ${client.commands.size} comandos carregados com sucesso.`);
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // Regex para detectar o prefixo '-' ou a menção ao bot (@Bot ou @BotApelido)
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${PREFIX})\\s*`);
    if (!prefixRegex.test(message.content)) return;

    const matched = message.content.match(prefixRegex);
    const args = message.content.slice(matched[0].length).trim().split(/ +/);
    const fullCmd = args.shift()?.toLowerCase();

    // Caso o usuário apenas mencione o bot sem enviar nenhum comando
    if (!fullCmd) return;

    // Rota direta para retomar lutas paralisadas
    if (fullCmd === 'retomar') {
        const { FightManager } = require('./utils/fightManager');
        const resumed = FightManager.resumeFight(message.channel);
        if (!resumed) message.reply('❌ Nenhuma luta paralisada para retomar neste canal.');
        return;
    }

    // 1. Processa Comandos Sem Nível (ex: -luta, @Bot decisao, -help, @Bot recuperar)
    const directCommand = client.commands.get(fullCmd);
    if (directCommand && (!directCommand.attribute || directCommand.noLevel)) {
        try {
            await directCommand.execute(message, args);
            return;
        } catch (error) {
            console.error(`Erro ao executar o comando ${fullCmd}:`, error);
            return message.reply('❌ Ocorreu um erro ao executar este comando.');
        }
    }

    // 2. Processa Comandos Com Nível Obrigatório 1 a 5 (ex: @Bot jab3, -armlock4)
    const skillMatch = fullCmd.match(/^([a-z]+)([1-5])$/);
    if (skillMatch) {
        const commandName = skillMatch[1];
        const level = parseInt(skillMatch[2]);
        const skillCommand = client.commands.get(commandName);

        if (skillCommand && skillCommand.attribute && !skillCommand.noLevel) {
            try {
                await skillCommand.execute(message, level);
            } catch (error) {
                console.error(`Erro ao executar o golpe ${commandName}:`, error);
                message.reply('❌ Ocorreu um erro ao executar este golpe.');
            }
            return;
        }
    }
});

// Manipulador de interações para botões nos intervalos
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const { FightManager } = require('./utils/fightManager');
    const fight = FightManager.getFight(interaction.channelId);

    if (!fight) {
        return interaction.reply({ content: '❌ Nenhuma luta ativa neste canal.', ephemeral: true });
    }

    const fighterObj = fight.fighters.find(f => f.id === interaction.user.id);

    // Clique no botão de Recuperação
    if (interaction.customId === 'btn_recuperar') {
        if (!fighterObj) {
            return interaction.reply({ content: '❌ Você não é um dos lutadores desta luta.', ephemeral: true });
        }

        if (fighterObj.recuperarUsedThisRound) {
            return interaction.reply({ content: '⚠️ Você já se recuperou neste round!', ephemeral: true });
        }

        fighterObj.recuperarUsedThisRound = true;
        if (fighterObj.damage > 0) fighterObj.damage = Math.max(0, fighterObj.damage - 2);
        if (fighterObj.cuts > 0) fighterObj.cuts -= 1;
        fighterObj.stamina = Math.min(100, fighterObj.stamina + 20);

        await interaction.reply({
            content: `🧊 <@${interaction.user.id}> tratou os ferimentos e recuperou fôlego! (-2 Dano / +20% Gás)`
        });
    }

    // Clique no botão do Próximo Round
    if (interaction.customId === 'btn_next_round') {
        if (fight.status !== 'BETWEEN_ROUNDS') {
            return interaction.reply({ content: '⚠️ O próximo round só pode ser iniciado no intervalo.', ephemeral: true });
        }

        const updatedFight = FightManager.startNextRound(interaction.channel);
        if (updatedFight) {
            await interaction.reply({
                content: `🔔 **ROUND ${updatedFight.currentRound} INICIADO!** Lutadores no centro do octógono!`
            });
        }
    }
});

process.on('unhandledRejection', error => console.error('Unhandled Rejection:', error));
process.on('uncaughtException', error => console.error('Uncaught Exception:', error));

client.login(process.env.DISCORD_TOKEN);