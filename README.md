# Bot MMA RP

Bot de Discord de MMA Roleplay. Ele gerencia lutas completas dentro do chat: proposta e confirmação de confrontos, rounds cronometrados, golpes de trocação, wrestling e jiu-jitsu, sistema de peso, vitalidade de carreira e arbitragem do resultado. Além disso, conta com uma **rede social fictícia (MMA-X)** para dar mais imersão ao RP — totalmente opcional.

## Instalação

Requer Node.js 18+.

```bash
npm install
```

Crie um arquivo `.env` na raiz do projeto com o token do bot:

```
DISCORD_TOKEN=seu_token_aqui
GEMINI_API_KEY=sua_chave_opcional_aqui
```

`GEMINI_API_KEY` é **opcional**: sem ela, os comentários da rede social (MMA-X) são gerados pelo fallback offline do bot. Rode com `npm start`.

## Como usar

O prefixo padrão é `-`, mas todos os comandos também funcionam mencionando o bot (`@Bot comando`).

- **Golpes com nível** exigem o cargo da disciplina (Nível 1 a 5) e são usados como `-jab3`, `-kimura4`, `-esquiva2`.
- **Comandos sem nível** podem ser usados direto: `-help`, `-luta`, `-recuperar`.
- O nível efetivo de um golpe cai **-1** se o lutador estiver com stamina abaixo de 35% ou com penalidade de peso.
- Cada golpe resolve um roll com 4 faixas: **GEM** (perfeito, pode ativar contragolpe), **STAR2** (bom), **STAR** (parcial) e **MISS** (falhou).

## Configuração de cargos

Todos os golpes com nível (1 a 5) exigem o cargo da disciplina equivalente (ex.: `-jab1` exige **Striking 1**, `-kimura4` exige **Jiu-Jitsu 4**). Os IDs dos cargos ficam em `config/roles.js`:

| Disciplina | Golpes | Config |
|---|---|---|
| 🥊 Trocação | `-jab`, `-direto`, `-uppercut`, chutes, `-gandp`... | `striking: { 1..5 }` ✅ configurado |
| 🧤 Wrestling | `-single`, `-clinch`, `-controle`, `-scramble`, `-defqueda`... | `wrestling: { 1..5 }` ⚠️ preencher IDs |
| 🥋 Jiu-Jitsu | `-armlock`, `-kimura`, `-triangulo`, `-montada`... | `jiujitsu: { 1..5 }` ⚠️ preencher IDs |
| 🛡️ Defesa | `-def`, `-esquiva` | `defesa: { 1..5 }` ⚠️ preencher IDs |

**Pendências de configuração:** o `adminRoleId` (Staff, usado em `-luta`, `-pesagem`, `-vitalidade` e no bypass de golpes) e os IDs de `wrestling`, `jiujitsu` e `defesa` ainda estão com placeholders (`ID_CARGO_...` / `ID_DO_CARGO_ADMIN_AQUI`) e precisam ser substituídos pelos IDs reais dos cargos do servidor. Enquanto não forem preenchidos, apenas Administradores conseguem usar esses golpes.

## Controle de luta

| Comando | Função |
|---|---|
| `-luta iniciar @L1 @L2` | Propõe o confronto; ambos os lutadores confirmam com ✅ (expira em 3 min). |
| `-luta teste` | Staff/Admin: cria luta de teste (aceita NPC) sem validação. |
| `-luta decisao` | Staff/Admin: apura a decisão dos juízes e encerra a luta. |
| `-luta encerrar` | Encerra a luta e todos os timers do canal. |
| `-round` | Inicia o próximo round (padrão 5 min). |
| `-decisao` | Encerra no limite de tempo e chama os 3 juízes: cartões, pontuação round a round e vencedor. |
| `-retomar` | Retoma uma luta paralisada no canal (ex.: interrompida por golpe ilegal). |
| `-corner` | Envia uma instrução tática aleatória no DM do lutador. |
| `-pesagem` | Roll 1d100: **1-90** peso batido; **91-97** corte difícil (-5 de gás, perde efetividade); **98-100** peso não batido (penalidades, luta não vale cinturão nem ranking). |

## Vitalidade da carreira

`-vitalidade` controla a longevidade do atleta (0-100):

- `-vitalidade [@Lutador]` — consulta o valor atual (sem menção, mostra o seu).
- `-vitalidade set @Lutador <valor>` — Staff/Admin define manualmente.
- `-vitalidade posluta <tipo> @Lutador` — Staff/Admin aplica desgaste pós-luta (`dominante`, `equilibrada`, `guerra3`, `guerra5`, `tko`, `ko`).
- `-vitalidade lesao <d50|d75|d100> @Lutador` — Staff/Admin rola lesão conforme o cenário; a gravidade sai em um d20 (leve, moderada, grave).

## Utilidades

| Comando | Função |
|---|---|
| `-help` | Guia completo de comandos e golpes em um embed. |
| `-status` | Painel tático da luta ativa: stamina, dano, contragolpe e pontuação. |
| `-testluta` | Admin: ferramentas de teste (fim de round, dano direto, contragolpe, decisão simulada). |
| `-post` | Publica uma atualização na rede social do RP (MMA-X) — opcional, ver seção abaixo. |

## Golpes (níveis 1 a 5)

### Trocação (Striking)

| Comando | Golpe |
|---|---|
| `-jab` | Jab de mão da frente; marca distância e abre a guarda. |
| `-direto` | Direto de mão traseira, reto e potente. |
| `-cruzado` | Cruzado lateral; bochecha, têmpora e mandíbula. |
| `-uppercut` | Uppercut ascendente por baixo da guarda. |
| `-overhand` | Overhand em arco descendente, de alto poder. |
| `-bodyshot` | Golpes no corpo; drena o gás. |
| `-cotovelada` | Cotovelada; alto risco de corte. |
| `-joelhada` | Joelhada no clinch ou voadora. |
| `-frontkick` | Teep frontal; quebra a base e controla distância. |
| `-highkick` | Chute na cabeça; alto dano. |
| `-midkick` | Chute na linha de cintura/costelas. |
| `-lowkick` | Chute baixo; castiga a base e a movimentação. |
| `-spinningback` | Golpe rodado; alto dano. |
| `-gandp` | Ground and Pound no solo; castiga o adversário caído. |

### Wrestling / Quedas

| Comando | Ação |
|---|---|
| `-single` | Single leg: derruba agarrando uma perna. |
| `-quedadupla` | Double leg com queda/slam explosivo. |
| `-queda` | Takedown geral (slam/suplex). |
| `-bodylock` | Trava de corpo com suplex/slam. |
| `-clinch` | Clinch: grampeia o oponente na curta distância. |
| `-grade` | Pressão contra a grade com joelhadas. |
| `-controle` | Controle por cima no solo. |
| `-reversao` | Reversão de baixo para o topo. |
| `-scramble` | Disputa de posição no solo. |
| `-levantar` | Stand up: escapar do domínio por baixo. |
| `-defqueda` | Defensivo: sprawl e bloqueio de takedown. |

### Jiu-Jitsu / Finalizações

| Comando | Técnica |
|---|---|
| `-armlock` | Chave de braço (armbar). |
| `-guilhotina` | Estrangulamento frontal com o braço. |
| `-kimura` | Chave de ombro com pegada figura-4. |
| `-mataleao` | Estrangulamento pelas costas. |
| `-omoplata` | Chave de ombro da guarda. |
| `-leglock` | Chave de perna/tornozelo (heel hook). |
| `-triangulo` | Triângulo com as pernas. |
| `-triangulomao` | Triângulo de mão (D'Arce/Anaconda). |
| `-montada` | Posição dominante por cima do peito. |
| `-costas` | Tomada de costas com ganchos. |
| `-guarda` | Retenção de guarda para atacar por baixo. |
| `-raspagem` | Sweep: varredura que inverte para ficar por cima. |

### Defesa e tática

| Comando | Função |
|---|---|
| `-def1..5` | Postura defensiva; registra o nível de defesa usado no cálculo Atk x Def e GEM ativa contragolpe (+1 nível efetivo no próximo ataque). |
| `-esquiva1..5` | Esquiva e movimento de cabeça; registra o nível de defesa usado no cálculo Atk x Def e GEM também ativa contragolpe. |
| `-finta` | RP: finta narrativa aleatória (sem roll). |
| `-recuperar` | 1x por round: -2 de dano, cura 1 corte e +20% de stamina. |

## Rede social do RP (MMA-X)

A rede social **MMA-X** é uma feature criada pensando no **roleplay do Discord**: lutadores podem simular perfis, postar treinos, provocações e bastidores da carreira como se fossem atletas de verdade postando em uma rede social. O uso é **totalmente opcional** — ela não interfere nas lutas, no sistema de peso, na vitalidade nem em nenhuma outra mecânica do bot. Servidores podem usá-la para enriquecer o RP ou simplesmente ignorá-la.

- **`-post <texto ou @handle>`** — publica na MMA-X com perfil `@seunome` (ou o arroba que você escolher com `-post @seu_handle texto`). Fotos/vídeos anexados também são suportados.
- **Métricas por popularidade** — o engajamento (curtidas, reposts e comentários) é gerado conforme o cargo do lutador: 🐐 G.O.A.T, 🌟 Superstar, ⭐ Prospecto ou sem cargo.
- **Comentários com IA** — as reações são geradas contextualmente pela IA do Gemini (gírias de internet BR, haters, torcedores e perfis de mídia). Sem `GEMINI_API_KEY`, o bot usa um fallback offline com arrobas aleatórias.
- **Botões de interação** — cada publicação traz ❤️ Curtir, 🔁 Repostar e 💬 Comentar (a resposta ao comentário é feita pelo próprio `-post`).

## Botões de interação

Durante os intervalos da luta, dois botões aparecem nos embeds:

- `btn_recuperar` — mesmo efeito do `-recuperar`.
- `btn_next_round` — inicia o próximo round quando a luta está em `BETWEEN_ROUNDS`.

## Mecânicas

- **Contragolpe:** um GEM em `-def` ou `-esquiva` abre a janela de contragolpe, dando +1 nível efetivo no próximo ataque. O estado aparece no `-status`.
- **Registro de impacto:** golpes ofensivos passam por `registerHit`, que resolve o confronto Atk x Def contra a defesa declarada pelo oponente (ou automática), aplicando dano, cortes, pontos do round e faltas (golpes ilegais). O relatório da troca é exibido **uma única vez por round**, no fim do round.
- **Encerramento:** as lutas terminam somente por **Decisão dos Juízes** (`-decisao`); rounds são pontuados em 10-9, 10-8 ou 10-7, sem empates.
- **Rounds:** cada round dura 5 minutos; ao terminar, entra em intervalo com opção de recuperação.
- **Persistência:** vitalidade e peso são salvos em arquivos JSON (`data/vitality.json`, `data/weight.json`).

## Estrutura

```
commands/          Comandos do bot (admin, combat, utility)
utils/             Mecânicas: fightManager, combatEngine, moveHandler, socialEngine (IA da MMA-X), etc.
config/            IDs de cargos e configurações
data/              Persistência em JSON
index.js           Entry point e carregamento de comandos
```
