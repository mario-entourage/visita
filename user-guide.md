# VISITAS — Guia do Usuário / User Guide

> Guia prático para cada tipo de usuário do VISITAS CRM.
> Practical guide for each VISITAS CRM user type.
> Última atualização / Last updated: April 2026.

---

# Portugues

---

## Para Todos os Usuarios

### Acesso

```
+----------------------------------+
|                                  |
|                                  |
|           V I S I T A S          |
|        CRM Farmaceutico          |
|                                  |
|  +----------------------------+  |
|  |    Entrar com Google       |  |
|  +----------------------------+  |
|                                  |
|  Acesso restrito para contas     |
|  @entouragelab.com               |
|                                  |
+----------------------------------+
```

1. Abra o VISITAS no navegador ou no app do celular
2. Toque em **Entrar com Google**
3. Use sua conta `@entouragelab.com`

Contas fora do dominio `@entouragelab.com` nao tem acesso.

### Navegacao

A tela inicial (Hub) mostra os botoes principais do seu perfil. Cada perfil ve botoes diferentes. Toque em qualquer botao para acessar a funcionalidade.

### Medicos

Todos os perfis podem buscar e visualizar medicos. Na lista de medicos voce vera:

```
+--------------------------------------+
| Dr. Carlos Mendes              [4/5] |
| cardiologista                  12 tq |
| Sao Paulo, SP                        |
| [Vai Prescrever]  <-- pipeline       |
| [P.Alto] [F.Op.]  <-- tags          |
| Ultima visita: 2 dias atras         |
+--------------------------------------+
```

- **Badge de propensidade** — pontuacao de 1 a 5 (Muito Baixa a Muito Alta)
- **Estagio do pipeline** — badge colorido mostrando o ultimo resultado (Nao -> Prescrevendo)
- **Tags** — chips coloridos com abreviacoes (ex: "P.Alto", "F.Op.", "Prior.")
- **Toques** — numero total de interacoes registradas

### Sinalizacao (Flag)

Qualquer usuario pode **sinalizar** um medico para acompanhamento com um toque no botao "Sinalizar" na tela do medico.

Para **remover** a sinalizacao, e obrigatorio deixar uma nota explicando o motivo:

```
+----------------------------------+
| [flag] Remover Sinalizacao       |
|                                  |
| Explique por que esta removendo  |
| o flag deste medico. Essa        |
| informacao sera visivel para     |
| o gerente.                       |
|                                  |
| +------------------------------+ |
| | Motivo da remocao do flag... | |
| |                              | |
| |                              | |
| +------------------------------+ |
|                                  |
| [Cancelar]   [Remover Flag]     |
+----------------------------------+
```

Isso cria um registro de auditoria visivel para o gerente.

---

## Representante

### Hub do Representante

```
+----------------------------------+
|                                  |
|           V I S I T A S          |
|                                  |
|  +----------------------------+  |
|  | [pen]  ENVIAR VISITA     > |  |
|  |        Registrar nova       |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [ppl]  MEDICOS           > |  |
|  |        Ver agenda e sinal.  |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [clk]  ATIVIDADE         > |  |
|  |        Historico de visitas |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [rec]  DESPESAS           > |  |
|  |        Enviar comprovantes  |  |
|  +----------------------------+  |
|                                  |
+----------------------------------+
```

| Botao | O que faz |
|-------|-----------|
| **ENVIAR VISITA** | Registrar uma nova interacao com um medico |
| **MEDICOS** | Ver medicos agendados e sinalizados |
| **ATIVIDADE** | Consultar historico de visitas |
| **DESPESAS** | Enviar comprovantes para reembolso |

### Registrar uma Interacao

```
+----------------------------------+
| < Nova Interacao                 |
+----------------------------------+
|                                  |
| Tipo de Interacao                |
| (Visita) (Evento) (Congr) (Dig) |
|                                  |
| Resultado                        |
| [1] [2] [3] [4] [5]             |
| verm lar amar verd teal          |
|                                  |
| + Mais detalhes                  |
| ................................ |
| . Amostras entregues   [toggle]. |
| . Falou pessoalmente   [toggle]. |
| . Follow-up agendado   [toggle]. |
| ................................ |
|                                  |
| Anotacoes                        |
| +------------------------------+ |
| |                              | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| |    Registrar Interacao       | |
| +------------------------------+ |
+----------------------------------+
```

1. Toque em **ENVIAR VISITA** ou abra o medico e toque em **Registrar Interacao**
2. Selecione o tipo: Visita de Campo, Evento Clinico, Congresso ou Digital
3. Escolha o resultado (1 a 5):
   - **1** — Nao (vermelho)
   - **2** — Provavelmente Nao (laranja)
   - **3** — Aberto (amarelo)
   - **4** — Vai Prescrever (verde)
   - **5** — Prescrevendo (teal)
4. Marque os detalhes opcionais: amostras entregues, falou pessoalmente, follow-up agendado
5. Adicione anotacoes se necessario
6. Toque em **Registrar Interacao**

A localizacao GPS e capturada automaticamente (se permitido).

### Lista de Medicos

```
+----------------------------------+
| < Medicos                   [+]  |
+----------------------------------+
| (Agend.) (Sinal.) (IA) (Perto)  |
+----------------------------------+
|                                  |
| --- Agendados ---                |
| +------------------------------+ |
| | Dr. Carlos Mendes      [5/5]| |
| | cardiologista                | |
| | Hoje 10h                   > | |
| +------------------------------+ |
|                                  |
| --- Sinalizados ---              |
| +------------------------------+ |
| | Dra. Ana Souza     [flag]   | |
| | pediatra                     | |
| | Clinica Bem-Estar          > | |
| +------------------------------+ |
|                                  |
+----------------------------------+
```

### Ficha do Medico

```
+----------------------------------+
| < Dr. Carlos Mendes              |
+----------------------------------+
| [CM]  Carlos Mendes              |
|       cardiologista              |
|       Sao Paulo, SP             |
|       [4/5]  12 toques          |
|       [Vai Prescrever]          |
|       [P.Alto] [F.Op.]         |
|       [Sinalizar] [Tags]       |
+----------------------------------+
| Resumo da Ultima Visita          |
| Resultado: [Vai Prescrever]     |
| "Gostou da apresentacao..."     |
| [v] Amostras  [v] Follow-up    |
+----------------------------------+
| Contato                          |
| Celular: (11) 99999-0000        |
| Email: carlos@email.com         |
+----------------------------------+
| +------------------------------+ |
| |    Registrar Interacao       | |
| +------------------------------+ |
| +------------------------------+ |
| |  Medico Nao Localizado       | |
| +------------------------------+ |
+----------------------------------+
| Historico de Interacoes          |
| o  Visita de Campo              |
| |  Resultado: 4 - Vai Prescr.  |
| |  15/03/2026 14:30            |
| o  Digital                      |
|    Resultado: 3 - Aberto       |
|    01/03/2026 16:45            |
+----------------------------------+
```

### Enviar Despesa

```
+----------------------------------+
| < Despesas                  [+]  |
+----------------------------------+
| Total: R$ 342,50                 |
+----------------------------------+
|                                  |
| +------------------------------+ |
| | [img] Combustivel   R$ 85,00| |
| |       12/03/2026             | |
| +------------------------------+ |
| +------------------------------+ |
| | [img] Alimentacao   R$ 32,50| |
| |       12/03/2026             | |
| +------------------------------+ |
|                                  |
+----------------------------------+
```

```
+----------------------------------+
| < Nova Despesa                   |
+----------------------------------+
|                                  |
| +------------------------------+ |
| |                              | |
| |    [foto do comprovante]     | |
| |                              | |
| +------------------------------+ |
| [Camera]          [Galeria]      |
|                                  |
| Valor (R$)                       |
| +------------------------------+ |
| |  0,00                        | |
| +------------------------------+ |
|                                  |
| Categoria                        |
| (Combust.) (Alim.) (Estac.)     |
| (Pedagio)  (Outro)              |
|                                  |
| Observacoes (opcional)           |
| +------------------------------+ |
| |                              | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| |      Enviar Despesa          | |
| +------------------------------+ |
+----------------------------------+
```

1. Toque em **DESPESAS** no Hub
2. Toque em **+** ou no botao flutuante
3. Tire uma foto do comprovante (camera) ou selecione da galeria
4. Informe o valor em R$
5. Escolha a categoria: Combustivel, Alimentacao, Estacionamento, Pedagio ou Outro
6. Adicione observacoes se necessario
7. Toque em **Enviar Despesa**

### Reportar Medico Nao Localizado

```
+----------------------------------+
| [loc] Medico Nao Localizado      |
|                                  |
| Selecione o motivo pelo qual o   |
| medico nao foi encontrado:       |
|                                  |
| ( ) Mudou de endereco           |
| ( ) Nao encontrado              |
| (o) Aposentou                   |
| ( ) Clinica fechou              |
| ( ) Outro                       |
|                                  |
| [Cancelar]  [Enviar Relatorio]  |
+----------------------------------+
```

1. Abra a ficha do medico
2. Toque em **Medico Nao Localizado**
3. Selecione o motivo
4. Toque em **Enviar Relatorio**

O gerente sera notificado para atualizar o cadastro.

### Adicionar Medico

```
+----------------------------------+
| Adicionar Medico                 |
+----------------------------------+
| Nome *                           |
| +------------------------------+ |
| | Carlos                       | |
| +------------------------------+ |
| Sobrenome *                      |
| +------------------------------+ |
| | Mendes                       | |
| +------------------------------+ |
| Estado *                         |
| +------------------------------+ |
| | SP                           | |
| +------------------------------+ |
| Especialidade                    |
| +------------------------------+ |
| | Cardiologia                  | |
| +------------------------------+ |
|                                  |
| [Cancelar]    [Adicionar]       |
+----------------------------------+
```

1. Na tela de Medicos, toque no botao **+**
2. Preencha nome, estado e especialidade
3. Toque em **Adicionar**

### Dicas

- Registre a visita assim que sair do consultorio — quanto mais rapido, mais preciso
- Use a sinalizacao (flag) para marcar medicos que precisam de acompanhamento especial
- Confira os medicos sinalizados antes de planejar seu dia

---

## Gerente

### Hub do Gerente

```
+----------------------------------+
|        [MODO GERENCIA]           |
|           V I S I T A S          |
|                                  |
|  +----------------------------+  |
|  | [ppl]  EQUIPE            > |  |
|  |        Ver desemp. dos reps |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [cal]  AGENDA            > |  |
|  |        Agendas dos reps     |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [med]  MEDICOS           > |  |
|  |        Buscar e filtrar     |  |
|  +----------------------------+  |
|                                  |
+----------------------------------+
```

| Botao | O que faz |
|-------|-----------|
| **EQUIPE** | Ver desempenho dos representantes |
| **AGENDA** | Consultar e gerenciar agendas dos reps |
| **MEDICOS** | Buscar medicos e gerenciar atribuicoes |

### Acompanhar a Equipe

```
+----------------------------------+
| < Equipe                         |
+----------------------------------+
|                                  |
| REPRESENTANTES                   |
| +------------------------------+ |
| | [L] Lamine                 > | |
| |     Minas Gerais             | |
| +------------------------------+ |
| +------------------------------+ |
| | [E] Erling                 > | |
| |     Sao Paulo                | |
| +------------------------------+ |
| +------------------------------+ |
| | [K] Kylian                 > | |
| |     Rio de Janeiro           | |
| +------------------------------+ |
|                                  |
+----------------------------------+
```

```
+----------------------------------+
| < Kylian                         |
+----------------------------------+
|                                  |
| +--------+ +--------+ +--------+|
| |  chat  | |  med   | |  cal   ||
| |   17   | |   8    | |   5    ||
| |Interac.| |Amostras| |Follow  ||
| +--------+ +--------+ +--------+|
|                                  |
| HISTORICO DE INTERACOES          |
|                                  |
| o  Visita de Campo              |
| |  Resultado: 5 - Prescrevendo |
| |  15/03/2026 14:30            |
| o  Digital                      |
|    Resultado: 3 - Aberto       |
|    12/03/2026 10:00            |
+----------------------------------+
```

1. Toque em **EQUIPE**
2. Veja a lista de representantes com nome e regiao
3. Toque em um representante para ver:
   - Total de interacoes, amostras entregues e follow-ups
   - Historico completo de interacoes

### Gerenciar Agendas

```
+----------------------------------+
| < Agendas                        |
+----------------------------------+
| (Lamine) (Erling) [Kylian] ...  |
+----------------------------------+
|                                  |
| +------------------------------+ |
| | Dra. Ana Souza               | |
| | terca 10h - Hosp. Central  >| |
| +------------------------------+ |
| +------------------------------+ |
| | Dr. Kevin Patel              | |
| | terca 13h - Clin. Bem-Estar>| |
| +------------------------------+ |
|                                  |
+----------------------------------+
```

1. Toque em **AGENDA**
2. Selecione o representante pelo chip no topo
3. Veja as visitas agendadas
4. Para agendar uma reuniao: abra o medico -> toque em **Agendar Reuniao**

### Atribuir Representante a um Medico

```
+----------------------------------+
| < Dr. Carlos Mendes              |
+----------------------------------+
| ...                              |
| Atribuir Representante    [v]    |
| +------------------------------+ |
| |  Lamine - Minas Gerais      | |
| |  Erling - Sao Paulo       < | |
| |  Kylian - Rio de Janeiro     | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| |     Agendar Reuniao          | |
| +------------------------------+ |
+----------------------------------+
```

1. Abra a ficha de qualquer medico
2. Use o dropdown **Atribuir Representante**
3. Selecione o rep desejado

### Gerenciar Tags de Medicos

Tags sao rotulos que ajudam a classificar medicos. Apenas Gerentes e Admins podem edita-las.

```
+----------------------------------+
| [tags] Tags do Medico            |
|                                  |
| Selecione as tags:               |
|                                  |
| [x] Potencial Alto              |
| [ ] Nova Clinica                 |
| [ ] Visita Conjunta              |
| [ ] Prioritario                  |
| [x] Formador de Opiniao          |
| [ ] Risco de Inatividade         |
|                                  |
| [Cancelar]   [Salvar Tags]      |
+----------------------------------+
```

**Tags disponiveis:**

| Tag | Abreviacao | Uso |
|-----|-----------|-----|
| Potencial Alto | P.Alto | Medico com alto potencial de prescricao |
| Nova Clinica | N.Cli | Medico em clinica recem-aberta |
| Visita Conjunta | V.Conj | Precisa de visita acompanhada |
| Prioritario | Prior. | Prioridade maxima de atendimento |
| Formador de Opiniao | F.Op. | Influenciador entre colegas |
| Risco de Inatividade | Risco | Em risco de parar de prescrever |

Para editar tags:
1. Abra a ficha do medico
2. Toque no botao **Tags**
3. Marque/desmarque as tags desejadas
4. Toque em **Salvar Tags**

### Monitorar Flags

Quando um representante remove uma sinalizacao, o sistema registra:
- Quem removeu
- Quando removeu
- Por que removeu (nota obrigatoria)

Isso permite verificar se flags estao sendo removidos por boas razoes.

### Pipeline

O pipeline de medicos e baseado no ultimo resultado de interacao:

| Estagio | Resultado | Significado |
|---------|-----------|-------------|
| Nao | 1 | Medico recusou |
| Provavelmente Nao | 2 | Pouca abertura |
| Aberto | 3 | Neutro, sem decisao |
| Vai Prescrever | 4 | Sinal positivo |
| Prescrevendo | 5 | Ja esta prescrevendo |

Cada medico exibe seu estagio como um badge colorido no card e na ficha.

---

## Analista

### Hub do Analista

```
+----------------------------------+
|        [MODO ANALISTA]           |
|           V I S I T A S          |
|                                  |
|  +----------------------------+  |
|  | [bar]  RELATORIOS        > |  |
|  |        Dados e analises     |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [med]  MEDICOS           > |  |
|  |        Buscar e filtrar     |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [clk]  ATIVIDADE         > |  |
|  |        Historico geral      |  |
|  +----------------------------+  |
|                                  |
+----------------------------------+
```

| Botao | O que faz |
|-------|-----------|
| **RELATORIOS** | Painel analitico com metricas e distribuicao |
| **MEDICOS** | Buscar e filtrar medicos |
| **ATIVIDADE** | Historico geral de visitas |

### Painel Analitico

```
+----------------------------------+
| < Painel Analitico               |
+----------------------------------+
|                                  |
| +--------+ +--------+ +--------+|
| | [ppl]  | | [pen]  | | [chk]  ||
| |  245   | |  1842  | |   38   ||
| |Medicos | |Interac.| |Prescr. ||
| +--------+ +--------+ +--------+|
|                                  |
| PIPELINE DE MEDICOS              |
| +------------------------------+ |
| | o Nao            |### | 42  | |
| | o Prov. Nao      |##  | 28  | |
| | o Aberto         |####| 67  | |
| | o Vai Prescrever |### | 45  | |
| | o Prescrevendo   |##  | 38  | |
| | o Sem resultado  |#   | 25  | |
| +------------------------------+ |
|                                  |
| VISITAS POR REPRESENTANTE        |
| +------------------------------+ |
| | Lamine                  127  | |
| | 8 prescrevendo        visits | |
| +------------------------------+ |
| +------------------------------+ |
| | Erling                   98  | |
| | 5 prescrevendo        visits | |
| +------------------------------+ |
| +------------------------------+ |
| | Kylian                   74  | |
| | 3 prescrevendo        visits | |
| +------------------------------+ |
|                                  |
+----------------------------------+
```

O painel mostra tres secoes:

**1. KPIs no topo:**
- Total de medicos ativos
- Total de interacoes registradas
- Medicos prescrevendo (resultado = 5)

**2. Pipeline de Medicos:**
- Distribuicao visual dos medicos por estagio (Nao -> Prescrevendo)
- Barras proporcionais com contagem e percentual
- Inclui categoria "Sem resultado" para medicos sem interacao

**3. Visitas por Representante:**
- Lista de todos os reps ordenada por volume de visitas
- Cada rep mostra: nome, total de visitas, quantos medicos estao prescrevendo

### Como usar os dados

- **Comparar reps:** Identifique quais reps tem mais visitas e melhores taxas de conversao
- **Analisar pipeline:** Veja se ha muitos medicos parados em "Nao" ou "Aberto" — pode indicar necessidade de treinamento
- **Medicos sem resultado:** Medicos com muitos toques mas sem resultado recente podem precisar de uma abordagem diferente

---

## Admin

### Hub do Admin

```
+----------------------------------+
|        [ADMINISTRACAO]           |
|           V I S I T A S          |
|                                  |
|  +----------------------------+  |
|  | [ppl]  EQUIPE            > |  |
|  |        Ver desemp. dos reps |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [cal]  AGENDA            > |  |
|  |        Agendas dos reps     |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [med]  MEDICOS           > |  |
|  |        Todos medicos/filtros|  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [bar]  ATIVIDADE         > |  |
|  |        Historico geral      |  |
|  +----------------------------+  |
|                                  |
|  Visualizar como:                |
|  (Admin) (Gerente) (Analista)    |
|          (Representante)         |
|  [x Parar simulacao]            |
+----------------------------------+
```

| Botao | O que faz |
|-------|-----------|
| **EQUIPE** | Todas as funcoes do Gerente |
| **AGENDA** | Todas as funcoes do Gerente |
| **MEDICOS** | Busca completa + gestao |
| **ATIVIDADE** | Historico geral |

### Simulacao de Perfil

O admin pode simular a experiencia de qualquer perfil:

1. Na tela inicial, veja a secao **Visualizar como:**
2. Toque no chip do perfil desejado (Gerente, Analista, Representante)
3. A tela muda para mostrar exatamente o que aquele perfil ve
4. Para voltar: toque em **Parar simulacao** ou selecione o chip Admin

Isso e util para:
- Verificar se cada perfil ve apenas o que deveria
- Testar novas funcionalidades do ponto de vista de cada usuario
- Dar suporte a usuarios mostrando exatamente o que eles veem

### Gestao de Acessos

- Atribuicao de roles e feita via Firestore (colecao `roles`)
- Super-admins sao definidos por lista fixa de emails
- Admins dinamicos sao definidos pela existencia do documento em `roles_admin`

---

## Resumo de Permissoes

| Funcionalidade | Rep | Gerente | Analista | Admin |
|----------------|:---:|:-------:|:--------:|:-----:|
| Registrar interacao | x | | | x |
| Enviar despesas | x | | | x |
| Ver agenda pessoal | x | | | x |
| Sinalizar medico | x | x | x | x |
| Remover flag (com nota) | x | x | x | x |
| Editar tags de medicos | | x | | x |
| Ver equipe e agenda dos reps | | x | | x |
| Atribuir rep a medico | | x | | x |
| Agendar reuniao | | x | | x |
| Painel analitico | | | x | x |
| Ver todas as despesas | | x | | x |
| Simular outros perfis | | | | x |
| Gerenciar roles | | | | x |

---

## Glossario

| Termo | Significado |
|-------|-------------|
| **Toque** | Uma interacao registrada entre rep e medico |
| **Propensidade** | Pontuacao de 1-5 indicando probabilidade de prescricao |
| **Pipeline** | Estagio atual do medico baseado no ultimo resultado |
| **Flag / Sinalizacao** | Marcacao de medico para acompanhamento especial |
| **Tag** | Rotulo gerencial atribuido pelo Gerente/Admin |
| **Resultado** | Codigo 1-5 registrado apos cada interacao |
| **Despesa** | Comprovante de gasto para reembolso |

---
---

# English

---

## For All Users

### Login

```
+----------------------------------+
|                                  |
|                                  |
|           V I S I T A S          |
|        Pharmaceutical CRM        |
|                                  |
|  +----------------------------+  |
|  |    Sign in with Google     |  |
|  +----------------------------+  |
|                                  |
|  Access restricted to            |
|  @entouragelab.com accounts      |
|                                  |
+----------------------------------+
```

1. Open VISITAS in your browser or on your phone
2. Tap **Sign in with Google**
3. Use your `@entouragelab.com` account

Accounts outside the `@entouragelab.com` domain cannot access the app.

### Navigation

The home screen (Hub) shows the main buttons for your role. Each role sees different buttons. Tap any button to access the feature.

### Doctors

All roles can search and view doctors. In the doctor list you will see:

```
+--------------------------------------+
| Dr. Carlos Mendes              [4/5] |
| cardiologist                   12 tc |
| Sao Paulo, SP                        |
| [Will Prescribe]  <-- pipeline       |
| [H.Pot] [O.Lead]  <-- tags          |
| Last visit: 2 days ago              |
+--------------------------------------+
```

- **Propensity badge** — score from 1 to 5 (Very Low to Very High)
- **Pipeline stage** — colored badge showing the last interaction result (No -> Prescribing)
- **Tags** — colored chips with abbreviations (e.g., "H.Pot", "O.Lead", "Prior.")
- **Touches** — total number of logged interactions

### Flagging

Any user can **flag** a doctor for follow-up with a single tap on the "Flag" button on the doctor screen.

To **remove** the flag, you must provide a written note explaining why:

```
+----------------------------------+
| [flag] Remove Flag               |
|                                  |
| Explain why you are removing     |
| the flag from this doctor.       |
| This information will be         |
| visible to the manager.          |
|                                  |
| +------------------------------+ |
| | Reason for removing flag...  | |
| |                              | |
| |                              | |
| +------------------------------+ |
|                                  |
| [Cancel]      [Remove Flag]     |
+----------------------------------+
```

This creates an audit trail visible to the manager.

---

## Sales Rep (Representante)

### Rep Hub

```
+----------------------------------+
|                                  |
|           V I S I T A S          |
|                                  |
|  +----------------------------+  |
|  | [pen]  LOG VISIT         > |  |
|  |        Record new visit     |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [ppl]  DOCTORS           > |  |
|  |        Schedule & flagged   |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [clk]  ACTIVITY          > |  |
|  |        Visit history        |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [rec]  EXPENSES          > |  |
|  |        Submit receipts      |  |
|  +----------------------------+  |
|                                  |
+----------------------------------+
```

| Button | Purpose |
|--------|---------|
| **LOG VISIT** | Record a new interaction with a doctor |
| **DOCTORS** | View scheduled and flagged doctors |
| **ACTIVITY** | Browse visit history |
| **EXPENSES** | Submit receipts for reimbursement |

### Log an Interaction

```
+----------------------------------+
| < New Interaction                |
+----------------------------------+
|                                  |
| Interaction Type                 |
| (Field) (Event) (Congr.) (Dig.) |
|                                  |
| Result                           |
| [1] [2] [3] [4] [5]             |
| red org  yel grn teal            |
|                                  |
| + More details                   |
| ................................ |
| . Samples delivered    [toggle]. |
| . Spoke face to face   [toggle]. |
| . Follow-up scheduled  [toggle]. |
| ................................ |
|                                  |
| Notes                            |
| +------------------------------+ |
| |                              | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| |     Log Interaction          | |
| +------------------------------+ |
+----------------------------------+
```

1. Tap **LOG VISIT** or open the doctor and tap **Log Interaction**
2. Select the type: Field Visit, Clinical Event, Congress, or Digital
3. Choose the result (1 to 5):
   - **1** — No (red)
   - **2** — Probably Not (orange)
   - **3** — Open (yellow)
   - **4** — Will Prescribe (green)
   - **5** — Prescribing (teal)
4. Toggle optional details: samples delivered, spoke face to face, follow-up scheduled
5. Add notes if needed
6. Tap **Log Interaction**

GPS location is captured automatically (if permission granted).

### Doctor List

```
+----------------------------------+
| < Doctors                   [+]  |
+----------------------------------+
| (Sched.) (Flag.) (AI) (Near)    |
+----------------------------------+
|                                  |
| --- Scheduled ---                |
| +------------------------------+ |
| | Dr. Carlos Mendes      [5/5]| |
| | cardiologist                 | |
| | Today 10am                 > | |
| +------------------------------+ |
|                                  |
| --- Flagged ---                  |
| +------------------------------+ |
| | Dra. Ana Souza     [flag]   | |
| | pediatrician                 | |
| | Clinica Bem-Estar          > | |
| +------------------------------+ |
|                                  |
+----------------------------------+
```

### Doctor Detail

```
+----------------------------------+
| < Dr. Carlos Mendes              |
+----------------------------------+
| [CM]  Carlos Mendes              |
|       cardiologist               |
|       Sao Paulo, SP             |
|       [4/5]  12 touches         |
|       [Will Prescribe]          |
|       [H.Pot] [O.Lead]         |
|       [Flag] [Tags]            |
+----------------------------------+
| Last Visit Summary               |
| Result: [Will Prescribe]        |
| "Liked the presentation..."     |
| [v] Samples  [v] Follow-up     |
+----------------------------------+
| Contact                          |
| Mobile: (11) 99999-0000         |
| Email: carlos@email.com         |
+----------------------------------+
| +------------------------------+ |
| |     Log Interaction          | |
| +------------------------------+ |
| +------------------------------+ |
| |  Doctor Not Found            | |
| +------------------------------+ |
+----------------------------------+
| Interaction History              |
| o  Field Visit                  |
| |  Result: 4 - Will Prescribe  |
| |  Mar 15 2026 14:30           |
| o  Digital                      |
|    Result: 3 - Open            |
|    Mar 01 2026 16:45           |
+----------------------------------+
```

### Expenses

```
+----------------------------------+
| < Expenses                  [+]  |
+----------------------------------+
| Total: R$ 342.50                 |
+----------------------------------+
|                                  |
| +------------------------------+ |
| | [img] Fuel          R$ 85.00| |
| |       Mar 12 2026            | |
| +------------------------------+ |
| +------------------------------+ |
| | [img] Meals         R$ 32.50| |
| |       Mar 12 2026            | |
| +------------------------------+ |
|                                  |
+----------------------------------+
```

```
+----------------------------------+
| < New Expense                    |
+----------------------------------+
|                                  |
| +------------------------------+ |
| |                              | |
| |     [receipt photo]          | |
| |                              | |
| +------------------------------+ |
| [Camera]          [Gallery]      |
|                                  |
| Amount (R$)                      |
| +------------------------------+ |
| |  0.00                        | |
| +------------------------------+ |
|                                  |
| Category                         |
| (Fuel) (Meals) (Parking)        |
| (Tolls)  (Other)                |
|                                  |
| Notes (optional)                 |
| +------------------------------+ |
| |                              | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| |      Submit Expense          | |
| +------------------------------+ |
+----------------------------------+
```

1. Tap **EXPENSES** on the Hub
2. Tap **+** or the floating button
3. Take a photo of the receipt (camera) or select from gallery
4. Enter the amount in R$
5. Choose the category: Fuel, Meals, Parking, Tolls, or Other
6. Add notes if needed
7. Tap **Submit Expense**

### Report Doctor Not Found

```
+----------------------------------+
| [loc] Doctor Not Found           |
|                                  |
| Select the reason why the        |
| doctor was not found:            |
|                                  |
| ( ) Changed address             |
| ( ) Not found                   |
| (o) Retired                     |
| ( ) Clinic closed               |
| ( ) Other                       |
|                                  |
| [Cancel]   [Submit Report]      |
+----------------------------------+
```

1. Open the doctor's profile
2. Tap **Doctor Not Found**
3. Select the reason
4. Tap **Submit Report**

The manager will be notified to update the record.

### Add a Doctor

```
+----------------------------------+
| Add Doctor                       |
+----------------------------------+
| First Name *                     |
| +------------------------------+ |
| | Carlos                       | |
| +------------------------------+ |
| Last Name *                      |
| +------------------------------+ |
| | Mendes                       | |
| +------------------------------+ |
| State *                          |
| +------------------------------+ |
| | SP                           | |
| +------------------------------+ |
| Specialty                        |
| +------------------------------+ |
| | Cardiology                   | |
| +------------------------------+ |
|                                  |
| [Cancel]       [Add]            |
+----------------------------------+
```

1. On the Doctors screen, tap the **+** button
2. Fill in name, state, and specialty
3. Tap **Add**

### Tips

- Log the visit as soon as you leave the office — the sooner, the more accurate
- Use flagging to mark doctors who need special attention
- Check flagged doctors before planning your day

---

## Manager (Gerente)

### Manager Hub

```
+----------------------------------+
|        [MANAGER MODE]            |
|           V I S I T A S          |
|                                  |
|  +----------------------------+  |
|  | [ppl]  TEAM              > |  |
|  |        Rep performance      |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [cal]  SCHEDULES         > |  |
|  |        Rep schedules        |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [med]  DOCTORS           > |  |
|  |        Search and filter    |  |
|  +----------------------------+  |
|                                  |
+----------------------------------+
```

| Button | Purpose |
|--------|---------|
| **TEAM** | View rep performance |
| **SCHEDULES** | View and manage rep schedules |
| **DOCTORS** | Search doctors and manage assignments |

### Monitor the Team

```
+----------------------------------+
| < Team                           |
+----------------------------------+
|                                  |
| REPRESENTATIVES                  |
| +------------------------------+ |
| | [L] Lamine                 > | |
| |     Minas Gerais             | |
| +------------------------------+ |
| +------------------------------+ |
| | [E] Erling                 > | |
| |     Sao Paulo                | |
| +------------------------------+ |
| +------------------------------+ |
| | [K] Kylian                 > | |
| |     Rio de Janeiro           | |
| +------------------------------+ |
|                                  |
+----------------------------------+
```

```
+----------------------------------+
| < Kylian                         |
+----------------------------------+
|                                  |
| +--------+ +--------+ +--------+|
| |  chat  | |  med   | |  cal   ||
| |   17   | |   8    | |   5    ||
| |Interact| |Samples | |Follow  ||
| +--------+ +--------+ +--------+|
|                                  |
| INTERACTION HISTORY              |
|                                  |
| o  Field Visit                  |
| |  Result: 5 - Prescribing     |
| |  Mar 15 2026 14:30           |
| o  Digital                      |
|    Result: 3 - Open            |
|    Mar 12 2026 10:00           |
+----------------------------------+
```

1. Tap **TEAM**
2. View the list of reps with name and region
3. Tap a rep to see:
   - Total interactions, samples delivered, and follow-ups
   - Full interaction history

### Manage Schedules

```
+----------------------------------+
| < Schedules                      |
+----------------------------------+
| (Lamine) (Erling) [Kylian] ...  |
+----------------------------------+
|                                  |
| +------------------------------+ |
| | Dra. Ana Souza               | |
| | Tue 10am - Central Hosp.   >| |
| +------------------------------+ |
| +------------------------------+ |
| | Dr. Kevin Patel              | |
| | Tue 1pm - Clinica Bem-Estar>| |
| +------------------------------+ |
|                                  |
+----------------------------------+
```

1. Tap **SCHEDULES**
2. Select a rep using the chips at the top
3. View their scheduled visits
4. To schedule a meeting: open the doctor -> tap **Schedule Meeting**

### Assign a Rep to a Doctor

```
+----------------------------------+
| < Dr. Carlos Mendes              |
+----------------------------------+
| ...                              |
| Assign Representative     [v]    |
| +------------------------------+ |
| |  Lamine - Minas Gerais      | |
| |  Erling - Sao Paulo       < | |
| |  Kylian - Rio de Janeiro     | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| |     Schedule Meeting         | |
| +------------------------------+ |
+----------------------------------+
```

1. Open any doctor's profile
2. Use the **Assign Representative** dropdown
3. Select the desired rep

### Manage Doctor Tags

Tags are labels that help classify doctors. Only Managers and Admins can edit them.

```
+----------------------------------+
| [tags] Doctor Tags               |
|                                  |
| Select tags:                     |
|                                  |
| [x] High Potential              |
| [ ] New Clinic                   |
| [ ] Joint Visit                  |
| [ ] Priority                     |
| [x] Opinion Leader               |
| [ ] Inactivity Risk              |
|                                  |
| [Cancel]    [Save Tags]         |
+----------------------------------+
```

**Available tags:**

| Tag | Abbreviation | Usage |
|-----|-------------|-------|
| Potencial Alto | H.Pot | High prescription potential |
| Nova Clinica | N.Cli | Doctor at a newly opened clinic |
| Visita Conjunta | J.Vis | Needs a joint visit |
| Prioritario | Prior. | Top priority for visits |
| Formador de Opiniao | O.Lead | Influences peers |
| Risco de Inatividade | Risk | At risk of stopping prescription |

To edit tags:
1. Open the doctor's profile
2. Tap the **Tags** button
3. Check/uncheck the desired tags
4. Tap **Save Tags**

### Monitor Flags

When a rep removes a flag, the system records:
- Who removed it
- When it was removed
- Why it was removed (required note)

This lets you verify that flags are being removed for good reasons.

### Pipeline

The doctor pipeline is based on the last interaction result:

| Stage | Code | Meaning |
|-------|------|---------|
| No | 1 | Doctor refused |
| Probably Not | 2 | Little openness |
| Open | 3 | Neutral, undecided |
| Will Prescribe | 4 | Positive signal |
| Prescribing | 5 | Already prescribing |

Each doctor displays their stage as a colored badge on the card and profile.

---

## Analyst (Analista)

### Analyst Hub

```
+----------------------------------+
|        [ANALYST MODE]            |
|           V I S I T A S          |
|                                  |
|  +----------------------------+  |
|  | [bar]  REPORTS           > |  |
|  |        Data and analytics   |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [med]  DOCTORS           > |  |
|  |        Search and filter    |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [clk]  ACTIVITY          > |  |
|  |        Full visit history   |  |
|  +----------------------------+  |
|                                  |
+----------------------------------+
```

| Button | Purpose |
|--------|---------|
| **REPORTS** | Analytics dashboard with metrics and distribution |
| **DOCTORS** | Search and filter doctors |
| **ACTIVITY** | Full visit history |

### Analytics Dashboard

```
+----------------------------------+
| < Analytics Dashboard            |
+----------------------------------+
|                                  |
| +--------+ +--------+ +--------+|
| | [ppl]  | | [pen]  | | [chk]  ||
| |  245   | |  1842  | |   38   ||
| |Doctors | |Interact| |Prescr. ||
| +--------+ +--------+ +--------+|
|                                  |
| DOCTOR PIPELINE                  |
| +------------------------------+ |
| | o No             |### | 42  | |
| | o Prob. Not      |##  | 28  | |
| | o Open           |####| 67  | |
| | o Will Prescribe |### | 45  | |
| | o Prescribing    |##  | 38  | |
| | o No result      |#   | 25  | |
| +------------------------------+ |
|                                  |
| VISITS PER REP                   |
| +------------------------------+ |
| | Lamine                  127  | |
| | 8 prescribing         visits | |
| +------------------------------+ |
| +------------------------------+ |
| | Erling                   98  | |
| | 5 prescribing         visits | |
| +------------------------------+ |
| +------------------------------+ |
| | Kylian                   74  | |
| | 3 prescribing         visits | |
| +------------------------------+ |
|                                  |
+----------------------------------+
```

The dashboard has three sections:

**1. Top-line KPIs:**
- Total active doctors
- Total logged interactions
- Doctors prescribing (result = 5)

**2. Doctor Pipeline:**
- Visual distribution of doctors by stage (No -> Prescribing)
- Proportional bars with count and percentage
- Includes "No result" for doctors without any interaction

**3. Visits per Rep:**
- All reps sorted by visit volume
- Each rep shows: name, total visits, how many doctors are prescribing

### How to Use the Data

- **Compare reps:** Identify which reps have the most visits and best conversion rates
- **Analyze the pipeline:** If many doctors are stuck at "No" or "Open," it may indicate a need for coaching
- **Doctors without results:** Doctors with many touches but no recent result may need a different approach

---

## Admin

### Admin Hub

```
+----------------------------------+
|        [ADMINISTRATION]          |
|           V I S I T A S          |
|                                  |
|  +----------------------------+  |
|  | [ppl]  TEAM              > |  |
|  |        Rep performance      |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [cal]  SCHEDULES         > |  |
|  |        Rep schedules        |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [med]  DOCTORS           > |  |
|  |        All doctors/filters  |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [bar]  ACTIVITY          > |  |
|  |        Full history         |  |
|  +----------------------------+  |
|                                  |
|  View as:                        |
|  (Admin) (Manager) (Analyst)     |
|          (Rep)                   |
|  [x Stop impersonation]         |
+----------------------------------+
```

| Button | Purpose |
|--------|---------|
| **TEAM** | All Manager functions |
| **SCHEDULES** | All Manager functions |
| **DOCTORS** | Full search + management |
| **ACTIVITY** | Full history |

### Role Impersonation

Admins can simulate the experience of any role:

1. On the home screen, find the **View as:** section
2. Tap the chip for the desired role (Manager, Analyst, Rep)
3. The screen changes to show exactly what that role sees
4. To return: tap **Stop impersonation** or select the Admin chip

This is useful for:
- Verifying that each role only sees what it should
- Testing new features from each user's perspective
- Supporting users by seeing exactly what they see

### Access Management

- Role assignments are made via Firestore (`roles` collection)
- Super-admins are defined by a fixed list of emails
- Dynamic admins are defined by the existence of a document in `roles_admin`

---

## Permissions Summary

| Feature | Rep | Manager | Analyst | Admin |
|---------|:---:|:-------:|:-------:|:-----:|
| Log interaction | x | | | x |
| Submit expenses | x | | | x |
| View personal schedule | x | | | x |
| Flag a doctor | x | x | x | x |
| Remove flag (with note) | x | x | x | x |
| Edit doctor tags | | x | | x |
| View team and rep schedules | | x | | x |
| Assign rep to doctor | | x | | x |
| Schedule meeting | | x | | x |
| Analytics dashboard | | | x | x |
| View all expenses | | x | | x |
| Impersonate other roles | | | | x |
| Manage roles | | | | x |

---

## Glossary

| Term | Meaning |
|------|---------|
| **Touch** | A logged interaction between a rep and a doctor |
| **Propensity** | Score from 1-5 indicating likelihood of prescribing |
| **Pipeline** | Doctor's current stage based on last interaction result |
| **Flag** | Marking a doctor for special follow-up attention |
| **Tag** | Managerial label assigned by Manager/Admin |
| **Result** | Code 1-5 logged after each interaction |
| **Expense** | Receipt submitted for reimbursement |
