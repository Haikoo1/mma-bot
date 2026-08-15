# 🥊 Guia de Comandos — Bot MMA RP

> Bot de Discord de **MMA Roleplay**. O prefixo padrão é `-` (hífen), mas todos os comandos também podem ser chamados mencionando o bot (`@Bot comando`).
>
> - **Golpes com nível** (`attribute`): exigem cargo de `NÍVEL 1 a 5` da respectiva disciplina e são usados como `-<golpe><nível>`, ex.: `-jab3`, `-kimura4`, `-esquiva2`.
> - **Comandos sem nível** (`noLevel`): podem ser usados diretamente, ex.: `-help`, `-luta`, `-recuperar`.
> - O nível efetivo de um golpe pode cair **-1** se o lutador estiver com **stamina abaixo de 35%** ou com **penalidade de peso**.
> - Cada golpe resolve um "roll" com 4 faixas de resultado: **💎 GEM** (perfeito, pode ativar contragolpe), **🌟 STAR2** (bom), **⭐ STAR** (parcial) e **❌ MISS** (falhou).
> - Total de comandos/golpes registrados: **50 arquivos carregados + 1 rota especial** (`-retomar`), além de **2 botões de interação**.

---

## 📖 Sumário

| Categoria | Comandos | Qtd |
|---|---|---|
| 🎮 Controle de Luta & Arbitragem | `luta`, `round`, `decisao`, `retomar`, `corner`, `pesagem` | 6 |
| ❤️ Vitalidade da Carreira | `vitalidade` (4 subcomandos) | 1 |
| 🛠️ Utilidades & Testes | `help`, `status`, `testluta` | 3 |
| 🥊 Trocação (Striking) | 14 golpes | 14 |
| 🤼 Wrestling / Quedas | 11 golpes | 11 |
| 🥋 Jiu-Jitsu / Finalizações | 12 golpes | 12 |
| 🛡️ Defesa & Tática | `def`, `esquiva`, `finta`, `recuperar` | 4 |
| ⚙️ Botões (interações) | `btn_recuperar`, `btn_next_round` | 2 |

---

## 1. 🎮 Controle de Luta & Arbitragem

### `-luta`
Comando central de gerenciamento das lutas, com subcomandos:
- `-luta iniciar @L1 @L2` — Propõe um confronto; ambos os lutadores precisam reagir com ✅ para confirmar (expira em 3 min). Ao confirmar, cria a luta no canal.
- `-luta teste` — **Staff/Admin**: cria uma luta de teste (pode usar NPC de Teste) sem validação.
- `-luta decisao` — **Staff/Admin**: apura a decisão dos juízes e envia o resultado no DM de quem digitou, encerrando a luta.
- `-luta nocaute @Lutador` — **Staff/Admin**: declara nocaute (KO) manualmente, encerrando a luta.
- `-luta encerrar` — Encerra a luta e todos os timers do canal.

### `-round`
Inicia o próximo round da luta (ou o Round 1 após a confirmação). Só funciona fora de um round em andamento. Exibe a duração (padrão 5 min).

### `-decisao`
Encerra a luta no limite de tempo e chama os 3 juízes oficiais: exibe os cartões, a pontuação round a round e o vencedor (Unanimidade/Divisão etc.). Exige pelo menos 1 round concluído.

### `-retomar` *(rota especial no index.js)*
Retoma uma luta paralisada (ex.: interrompida por golpe ilegal) no canal atual. Se não houver luta paralisada, retorna aviso.

### `-corner`
Envia uma **instrução tática aleatória no DM** do lutador que digitou (dica privada da equipe técnica). Se as DMs estiverem fechadas, exibe no canal.

### `-pesagem` *(sistema de peso)*
Roll `1d100` do teste da balança:
- **1–90** ✅ Peso batido — liberado para o combate.
- **91–97** ⚠️ Corte difícil — bate o peso, mas inicia com -5 de gás, perde efetividade e desgasta stamina mais rápido.
- **98–100** ❌ Peso não batido — penalidades: -5 de gás, luta não vale cinturão, não atualiza ranking, sujeito a multa/catchweight.

Se houver menção a outro usuário (`-pesagem @Lutador`), apenas a Staff/Admin pode executar (pesagem de não comparecimento).

---

## 2. ❤️ Sistema de Vitalidade da Carreira

### `-vitalidade`
Sistema de longevidade da carreira do atleta (0–100), com subcomandos:
- `-vitalidade [@Lutador]` — Consulta a vitalidade atual (sem menção, mostra a sua).
- `-vitalidade set @Lutador <valor>` — **Staff/Admin**: define a vitalidade manualmente.
- `-vitalidade posluta <tipo> @Lutador` — **Staff/Admin**: aplica desgaste pós-luta. Tipos: `dominante` (0), `equilibrada` (-1), `guerra3` (-2), `guerra5` (-3), `tko` (-4), `ko` (-5).
- `-vitalidade lesao <d50|d75|d100> @Lutador` — **Staff/Admin**: roll de lesão (dado conforme o cenário: d100 = poucos golpes, d75 = camp/sparring, d50 = guerra de rounds). A faixa de lesão aumenta conforme o bônus de vitalidade. Se lesionar, rola d20 para gravidade: leve (1 camp), moderada (perde o camp), grave (2 eventos).

---

## 3. 🛠️ Utilidades

### `-help`
Exibe o guia completo de comandos e golpes do bot em um embed.

### `-status`
Exibe o **painel tático** da luta ativa no canal: stamina, integridade (dano /16), status de contragolpe, pontos do round e pontuação total dos dois lutadores.

### `-testluta` *(exclusivo Admin)*
Conjunto de comandos de teste da luta:
- `-testluta fimround` — Encerra o round atual e chama o intervalo.
- `-testluta dano <1|2> <pts>` — Aplica dano direto ao lutador 1 ou 2.
- `-testluta contragolpe <1|2>` — Ativa o bônus de contragolpe em um lutador.
- `-testluta decisao` — Simula a súmula oficial dos juízes (funciona até sem luta ativa).
- `-testluta finalizar <KO|TKO|SUBMISSION>` — Testa a tela de vitória/finalização.

---

## 4. 🥊 Trocação — Striking (níveis 1 a 5)

Golpes de soco, chute e clinch em pé. Todos têm faixas de resultado (GEM/STAR2/STAR/MISS).

| Comando | Golpe | Descrição breve |
|---|---|---|
| `-jab` | Jab | Soco reto de mão da frente; marca distância e abre a guarda. Pode virar COUNTER. |
| `-direto` | Direto | Soco reto de mão traseira (cross), potente e direto ao rosto. |
| `-cruzado` | Cruzado | Soco em arco lateral (hook); ataca bochecha, têmpora e mandíbula. |
| `-uppercut` | Uppercut | Soco ascendente por baixo da guarda, mirando o queixo. |
| `-overhand` | Overhand | Soco em arco descendente por cima da guarda, de alto poder. |
| `-bodyshot` | Golpe no corpo | Gancho/linha de socos no fígado, abdômen e costelas; drena o gás. |
| `-cotovelada` | Cotovelada | Golpe com o cotovelo; alto risco de corte (supercílio/face). |
| `-joelhada` | Joelhada | Joelhada no clinch ou voadora; devastadora na curta distância. |
| `-frontkick` | Chute frontal | Pisão frontal (teep); empurra, quebra base e controla distância. |
| `-highkick` | Chute alto | Chute na cabeça/pescoço; chance de KO imediato (headkick). |
| `-midkick` | Chute médio | Chute na linha de cintura/costelas; trava o avanço. |
| `-lowkick` | Chute baixo | Chute na coxa/panturrilha; castiga a base e a movimentação. |
| `-spinningback` | Golpe rodado | Chute/soco/cotovelo giratório (Spinning Back Kick/Fist); KO espetacular. |
| `-gandp` | Ground and Pound | Socos e cotoveladas por cima no solo; chance de TKO. |

---

## 5. 🤼 Wrestling / Quedas (níveis 1 a 5)

Ações de luta agarrada em pé e controle no chão.

| Comando | Ação | Descrição breve |
|---|---|---|
| `-single` | Single Leg | Catada de perna única: derruba agarrando um tornozelo/coxa. |
| `-quedadupla` | Double Leg (Baiana) | Entrada nas duas pernas com queda/slam explosivo. |
| `-queda` | Takedown | Queda geral (slam/suplex) para levar o oponente ao solo. |
| `-bodylock` | Bodylock | Trava de corpo na cintura com suplex/slam brutal. |
| `-clinch` | Clinch | Aproximação agarrada; grampeia e trava o oponente na luta colada. |
| `-grade` | Pressão na grade | Controla o oponente contra a grade com joelhadas e pressão. |
| `-controle` | Controle de solo | Domínio por cima no chão (peso de quadril, imobilização). |
| `-reversao` | Reversão | Inverte a posição por baixo, assumindo o topo. |
| `-scramble` | Scramble | Disputa de movimentação no solo; quem vencer fica em posição dominante. |
| `-levantar` | Levantar | Escapada de pé (stand up) saindo do domínio por baixo. |
| `-defqueda` | Defesa de queda | **Defensivo**: sprawl e bloqueio de takedown (não registra golpe ofensivo). |

---

## 6. 🥋 Jiu-Jitsu / Grappling (níveis 1 a 5)

Posições e finalizações no chão. Os golpes com título **"TAPOUT"** têm chance de finalizar a luta.

| Comando | Técnica | Descrição breve |
|---|---|---|
| `-armlock` | Chave de braço (Armbar) | Hiperextensão do cotovelo; finalização por tapout. |
| `-guilhotina` | Guilhotina | Estrangulamento frontal com o braço no pescoço; tapout. |
| `-kimura` | Kimura | Chave de ombro com pegada figura-4; tapout. |
| `-mataleao` | Mata-leão | Estrangulamento pelas costas; apagão/tapout. |
| `-omoplata` | Omoplata | Chave de ombro da guarda usando as pernas; tapout. |
| `-leglock` | Leglock / Heel Hook | Chave de perna/tornozelo; tapout. |
| `-triangulo` | Triângulo | Estrangulamento com as pernas da guarda; apagão. |
| `-triangulomao` | Triângulo de mão | Estrangulamento com o braço (ex.: D'Arce/Anaconda); tapout. |
| `-montada` | Montada | Posição dominante por cima do peito do oponente. |
| `-costas` | Pegada de costas | Tomada de costas com ganchos (back take + body triangle). |
| `-guarda` | Guarda | Retenção de guarda para controlar e atacar por baixo. |
| `-raspagem` | Raspagem (Sweep) | Varredura da guarda invertendo para ficar por cima. |

---

## 7. 🛡️ Defesa & Tática

| Comando | Tipo | Descrição breve |
|---|---|---|
| `-def1..5` | Defensivo (nível) | Postura defensiva / bloqueio. 💎 GEM ativa janela de **contragolpe (+1 nível efetivo no próximo ataque)**. |
| `-esquiva1..5` | Defensivo (nível) | Esquiva e movimentação de cabeça (pêndulo/sidestep). 💎 GEM também ativa contragolpe. |
| `-finta` | Tático (sem nível) | Ação de RP: engana o oponente com fintas narrativas aleatórias (sem roll). |
| `-recuperar` | Recuperação (sem nível) | 1x por round: reduz **-2 de dano**, cura **1 corte** e recupera **+20% de stamina**. Também disponível via botão no intervalo. |

---

## 8. ⚙️ Botões de Interação (durante a luta)

| Botão | Função |
|---|---|
| `btn_recuperar` | Mesmo efeito do `-recuperar` (1x por round). |
| `btn_next_round` | Inicia o próximo round quando a luta está em `BETWEEN_ROUNDS`. |

---

## 9. 🧠 Mecânicas complementares

- **Contragolpe (⚡):** ao tirar 💎 GEM em `-def` ou `-esquiva`, o lutador ganha `counterWindow = true`, dando **+1 nível efetivo** no próximo ataque. O status aparece no `-status`.
- **Penalidade de stamina/peso:** com stamina < 35% ou penalidade de pesagem, o nível efetivo de todos os golpes cai 1.
- **Registro de impacto:** golpes ofensivos chamam `FightManager.registerHit()`, que calcula o confronto (dano, corte, pontos do round, possíveis finalizações e faltas/golpes ilegais).
- **Timers de round:** cada round dura 5 minutos; ao terminar, entra em intervalo (`BETWEEN_ROUNDS`) com opção de `-recuperar`/botão.
- **Persistência:** os dados de vitalidade (`data/vitality.json`) e de peso (`data/weight.json`) são salvos em arquivos JSON.

---

## ⚠️ Observações da análise

- `commands/admin/setstat.js` existe mas está **vazio (0 bytes)** — não é registrado pelo loader (sem `name`), portanto **não é um comando ativo**.
- O embed do `-help` ainda menciona golpes que **não existem** no código (`doubleleg`, `quedajudo`, `chute`, `bloqueio`) — o texto está desatualizado em relação aos comandos reais (`quedadupla`, `single`, etc.).
- Golpes "defensivos" (`-def`, `-esquiva`, `-defqueda`) não chamam `registerHit`, ou seja, **não aplicam dano/pontuação** — apenas narrativa e ativação de contragolpe.
