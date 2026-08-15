# Bot MMA RP

Bot de Discord de MMA Roleplay. Ele gerencia lutas completas dentro do chat: proposta e confirmação de confrontos, rounds cronometrados, golpes de trocação, wrestling e jiu-jitsu, sistema de peso, vitalidade de carreira e arbitragem do resultado.

## Instalação

Requer Node.js 18+.

```bash
npm install
```

Crie um arquivo `.env` na raiz do projeto com o token do bot:

```
DISCORD_TOKEN=seu_token_aqui
```

Rode com `npm start`.

## Como usar

O prefixo padrão é `-`, mas todos os comandos também funcionam mencionando o bot (`@Bot comando`).

- **Golpes com nível** exigem o cargo da disciplina (Nível 1 a 5) e são usados como `-jab3`, `-kimura4`, `-esquiva2`.
- **Comandos sem nível** podem ser usados direto: `-help`, `-luta`, `-recuperar`.
- O nível efetivo de um golpe cai **-1** se o lutador estiver com stamina abaixo de 35% ou com penalidade de peso.
- Cada golpe resolve um roll com 4 faixas: **GEM** (perfeito, pode ativar contragolpe), **STAR2** (bom), **STAR** (parcial) e **MISS** (falhou).

## Controle de luta

| Comando | Função |
|---|---|
| `-luta iniciar @L1 @L2` | Propõe o confronto; ambos os lutadores confirmam com ✅ (expira em 3 min). |
| `-luta teste` | Staff/Admin: cria luta de teste (aceita NPC) sem validação. |
| `-luta decisao` | Staff/Admin: apura a decisão dos juízes e encerra a luta. |
| `-luta nocaute @Lutador` | Staff/Admin: declara KO manualmente e encerra a luta. |
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
| `-testluta` | Admin: ferramentas de teste (fim de round, dano direto, contragolpe, decisão simulada, tela de finalização). |

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
| `-highkick` | Chute na cabeça; chance de KO imediato. |
| `-midkick` | Chute na linha de cintura/costelas. |
| `-lowkick` | Chute baixo; castiga a base e a movimentação. |
| `-spinningback` | Golpe rodado; KO espetacular. |
| `-gandp` | Ground and Pound no solo; chance de TKO. |

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
| `-armlock` | Chave de braço (armbar); finaliza por tapout. |
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
| `-def1..5` | Postura defensiva; GEM ativa contragolpe (+1 nível efetivo no próximo ataque). |
| `-esquiva1..5` | Esquiva e movimento de cabeça; GEM também ativa contragolpe. |
| `-finta` | RP: finta narrativa aleatória (sem roll). |
| `-recuperar` | 1x por round: -2 de dano, cura 1 corte e +20% de stamina. |

## Botões de interação

Durante os intervalos da luta, dois botões aparecem nos embeds:

- `btn_recuperar` — mesmo efeito do `-recuperar`.
- `btn_next_round` — inicia o próximo round quando a luta está em `BETWEEN_ROUNDS`.

## Mecânicas

- **Contragolpe:** um GEM em `-def` ou `-esquiva` abre a janela de contragolpe, dando +1 nível efetivo no próximo ataque. O estado aparece no `-status`.
- **Registro de impacto:** golpes ofensivos passam por `registerHit`, que resolve dano, corte, pontos do round, finalizações e faltas (golpes ilegais).
- **Rounds:** cada round dura 5 minutos; ao terminar, entra em intervalo com opção de recuperação.
- **Persistência:** vitalidade e peso são salvos em arquivos JSON (`data/vitality.json`, `data/weight.json`).

## Estrutura

```
commands/          Comandos do bot (admin, combat, utility)
utils/             Mecânicas: fightManager, combatEngine, moveHandler, etc.
config/            IDs de cargos e configurações
data/              Persistência em JSON
index.js           Entry point e carregamento de comandos
```
