# AcquaSafe (2CDS)

Plataforma web de **monitoramento da qualidade da água** para propriedades rurais:
painel de parâmetros (pH, flúor, cloro e turbidez), catálogo de patógenos e
soluções, cadastro/assinatura/login, área administrativa e leitura de um sensor
de pH real (E201-9 + Arduino Uno R3).

> Projeto acadêmico/demonstração. **Não há cobrança real**: a tela de pagamento
> é simulada. Veja [Limitações conhecidas](#limitações-conhecidas).

---

## 1. Stack

| Camada | Tecnologia |
| --- | --- |
| Frontend | HTML + CSS + JavaScript puro (sem build, sem `npm install`) |
| Estilo | Tailwind (CDN), CSS próprio (`style.css`, `portal.css`, `login.css`, `admin.css`) |
| Ícones | Lucide (CDN) |
| Gráficos | Chart.js (CDN) |
| Auth / Banco / Realtime | Supabase (`@supabase/supabase-js` via CDN) |
| E-mail | EmailJS (`@emailjs/browser` via CDN) |
| PWA | `sw.js` + `manifest.webmanifest` + `pwa.js` |
| Publicação | GitHub Pages (`main` → `/`) |

Não há servidor de aplicação: cada página conversa direto com a REST API do
Supabase usando a **anon key**. A segurança depende de **RLS** e das policies
em [`supabase/schema.sql`](supabase/schema.sql).

---

## 2. Como rodar

### 2.1 Banco de dados (obrigatório)

1. Crie um projeto em <https://app.supabase.com>.
2. **Forma mais simples:** abra **SQL Editor → New query**, cole **todo** o
   conteúdo de [`supabase/instalar-tudo.sql`](supabase/instalar-tudo.sql) e
   clique em **Run** uma vez. Ele já contém `schema.sql` + `admins.sql` na
   ordem correta e termina com uma tabela de conferência em português.
   O script é idempotente, seguro para bancos que já têm dados (limpa
   assinaturas ativas duplicadas antes de criar o índice único) e cria:
   `profiles`, `planos`, `assinaturas`, `pagamentos`, `leituras`, `doencas`,
   `solucoes`, o gatilho de criação de perfil, as funções `is_admin()`,
   `admin_listar_clientes()` e `obter_codigo_acesso()`, todas as policies de
   RLS, a publicação Realtime e as **4 contas administradoras**.
   - Funciona tanto em banco **novo** quanto no **schema antigo** do projeto
     (`planos.preco_mensal`, `pagamentos.criado_em`, enums, sem `leituras`):
     cria só o que falta e converte as colunas sem apagar dados.
   - Alternativa em 2 passos: `schema.sql` primeiro, depois `admins.sql`.
   - Não execute `select * from admin_listar_clientes()` no SQL Editor: a RPC
     usa `auth.uid()` e lá não há usuário logado. Teste pelo site.
3. (Opcional) Para criar **apenas** a tabela de leituras do sensor, use
   [`supabase/leituras.sql`](supabase/leituras.sql). Ele é um recorte do schema.

> Sem esse passo, o painel mostra as leituras localmente e avisa no console,
> o login não encontra assinaturas e o pagamento retorna
> *"Erro ao localizar o plano. Rode supabase/schema.sql."*

### 2.2 Chaves do projeto

Edite [`supabase-client.js`](supabase-client.js) com a **URL** e a **anon key**
do seu projeto (Project Settings → API). O arquivo já vem com as chaves do
projeto de demonstração.

> ⚠️ A anon key é pública por design — nunca coloque a `service_role` key no
> frontend, no firmware ou num repositório público.

### 2.3 E-mail do código de acesso (opcional, mas recomendado)

Siga o passo a passo no topo de [`email-config.js`](email-config.js):
crie um Service + um Template no EmailJS (variáveis `{{to_name}}`,
`{{to_email}}`, `{{access_code}}`, `{{validade}}`) e preencha
`serviceId`, `templateId` e `publicKey`.

Se o EmailJS não estiver configurado ou falhar, **o fluxo não trava**: o código
é exibido na própria tela de pagamento e a mensagem de status diz claramente
que o e-mail não foi enviado (nunca mais um "sucesso" falso).

### 2.4 Servir os arquivos

`index.html` pode ser aberto direto (`file://`) para ver o site, mas
**login, Supabase, EmailJS e PWA exigem HTTP**. Use qualquer servidor estático:

```bash
cd 2CDS
python3 -m http.server 8000
# http://localhost:8000/index.html
```

Publicação: GitHub Pages já está configurado em `main` → `/`, em
<https://manumartinzz.github.io/2CDS/>.

---

## 3. Fluxo do usuário

```
index.html  →  cadastro.html  →  pagamento.html  →  login.html?primeiro_acesso=1  →  portal.html
                                                          │
                                    login-admin.html ─────┴──→ admin.html ──→ admin-clientes.html
                                                                          ├──→ admin-doencas.html
                                                                          └──→ admin-bloqueios.html
```

1. **Cadastro** (`cadastro.js`): `auth.signUp` → o gatilho `on_auth_user_created`
   cria a linha em `profiles`.
2. **Pagamento simulado** (`pagamento.js`): valida os campos locais, cria a
   assinatura `ativa` + o registro em `pagamentos`, gera o código de acesso e
   envia por e-mail. Já existindo assinatura ativa, **reaproveita o código** em
   vez de criar outra.
3. **Login** (`login.js`): aceita e-mail ou CPF (CPF resolvido pela RPC
   `obter_codigo_acesso`), exige assinatura ativa, verifica
   `profiles.bloqueado` e pede o código apenas no primeiro acesso
   (`user_metadata.primeiro_acesso_concluido`).
4. **Portal** (`portal.js`): exige sessão, checa `bloqueado` de novo, desenha
   **um único** `Chart` em `#qualityChart`.
   - `portal.html` → simulação (grava uma leitura a cada 30 min).
   - `portal.html?real=1` → **sensor real**: não grava nada falso, faz polling
     de 10 s em `leituras` e escuta INSERTs via Realtime. O botão de simular
     alerta fica desabilitado.
5. **Admin**: `guardAdmin()` confere sessão + `is_admin` + `bloqueado` em todas
   as telas. Bloquear uma conta (`profiles.bloqueado = true`) impede o login e
   expulsa a sessão já aberta do portal.

---

## 4. Sensor de pH real (E201-9 + Arduino Uno R3)

| Arquivo | Função |
| --- | --- |
| [`arduino/acquasafe_ph/acquasafe_ph.ino`](arduino/acquasafe_ph/acquasafe_ph.ino) | Firmware: A0, 9600 baud, 1 JSON/s, calibração em 2 pontos na EEPROM |
| [`sensor-local.html`](sensor-local.html) | Página **offline** autossuficiente (Web Serial), identificação de equipamento, validação de sinal e exportação CSV |
| [`sensor.html`](sensor.html) / [`sensor.js`](sensor.js) | Página Web Serial que grava em `public.leituras` |
| [`bridge/ph_serial_bridge.py`](bridge/ph_serial_bridge.py) | Alternativa: ponte Python serial → REST (precisa de `pyserial`) |
| [`SENSOR_PH.md`](SENSOR_PH.md) | Guia completo de ligação, calibração e testes |

Resumo prático: V+ → 5 V, G → GND, Po → A0; grave o `.ino`, **feche o Monitor
Serial do Arduino IDE**, abra `sensor-local.html` no Chrome/Edge e clique em
**Conectar Arduino**. A porta USB é exclusiva: só uma aba/programa por vez.

Para conferir o sinal: curto-circuitar o centro e a malha do BNC deve dar
≈ 2500 mV / `raw` ≈ 512 / pH ≈ 7,00.

---

## 4.1. Regras de negócio adicionadas

- **Contas administradoras** (`config-admins.js`): 4 e-mails entram no painel
  **sem código de primeiro acesso e sem assinatura**, são os únicos que veem
  o botão *Acessar Painel Admin* e recebem o ícone de perfil preto com coroa.
  Rode [`supabase/admins.sql`](supabase/admins.sql) para marcar `is_admin` no
  banco — sem ele a RPC `admin_listar_clientes()` continua negando acesso.
  > O pedido citava "três contas", mas foram informados **4 e-mails**; os 4
  > foram cadastrados.
- **Perfil** (`perfil.html`): dados completos do cadastro + financeiro com
  faturas pagas e próximas a vencer (calculadas a partir de `pagamentos`,
  `assinaturas` e `planos`). O ícone do painel leva a essa página.
- **Tipo de lavoura**: escolhido no cadastro e gravado em
  `user_metadata` + `profiles.tipo_lavoura`. As **11 culturas** do cadastro
  têm catálogo pesquisado de patógenos, soluções químicas e periculosidade em
  `pesquisa-culturas.js`; `lavoura.js` só identifica a cultura da conta.
  Visitantes sem login continuam vendo a soja (demonstração).
- **Alerta sonoro**: `portal.js` gera um bip de dois tons via Web Audio API
  ao simular um alerta e ao receber um parâmetro crítico — sem arquivo de
  áudio e sem CDN.
- **Botão Voltar**: `voltar.js` injeta um botão no canto superior esquerdo
  que retorna à página anterior em **todas as páginas, exceto `index.html`**.
  A posição é medida na própria página (abaixo da barra fixa/sticky, abaixo
  da barra estática dos catálogos ou no canto superior das telas centradas),
  recalculada em resize. `sensor-local.html` tem o botão embutido para
  continuar funcionando como arquivo único offline.
- **Página de anúncio** (`index.html`): textos reduzidos, 3 chips agora são
  botões que levam às explicações específicas em `#detalhes`, seção de
  planos com CTAs de assinatura e área para a imagem do protótipo em
  `images/prototipo.jpg` (placeholder temporário — substituir depois).
  O botão **Whatsapp** voltou à posição original no nav, ao lado de Login e
  Assinar; **não** há botão Voltar nesta página.
  Nenhum arquivo CSS foi modificado.

---

## 4.2. Catálogos técnicos por cultura e fontes

As **11 opções de lavoura** do cadastro (`soja`, `cafe`, `trigo`, `laranja`,
`algodao`, `milho`, `cana`, `arroz`, `feijao`, `hortalicas`, `outra`) têm
catálogo próprio em `pesquisa-culturas.js`. As fontes oficiais (Embrapa,
Fundecitrus, MAPA/AGROFIT, Anvisa, Ministério da Saúde, OMS, CONAMA, EPPO,
CABI e EPPO/APS) estão documentadas em
[`PESQUISA_FONTES.md`](PESQUISA_FONTES.md) e renderizadas **ao final de cada
banco de dados** — páginas Patógenos, Soluções e Periculosidade — e no Perfil
da conta. Um seletor permite consultar as fontes de qualquer uma das 11
culturas sem trocar de conta.

**Filtro de via hídrica:** só entram no sistema doenças que contaminam a
plantação **pela água** (irrigação contaminada, enxurrada, respingos de
chuva/aspersão, zoósporos móveis, escleródios flutuantes). Ferrugens,
oídios, viroses de vetor e HLB foram **removidos** e aparecem em
`DOENCAS_EXCLUIDAS` com justificativa e fonte. O bloco comum reúne os 10
agentes universais de veiculação hídrica (Portaria GM/MS 888/2021 e CONAMA
357/2005).

**Regra 1:1:** cada doença gera **exatamente uma solução**, cujo nome começa
com o nome da doença tratada. `validarCatalogo()` verifica a contagem, o
vínculo e a presença de nomes vetados; os testes automatizados falham se
algo divergir. `patogenos.js` e `solucoes.js` **não consultam mais** as
tabelas `doencas`/`solucoes` do Supabase, que contêm doenças sem via hídrica.

**Outros pontos:** o botão **Curiosidades** do painel mostra fatos da lavoura
da conta logada, cada um com sua fonte; o gráfico foi dividido em **quatro
painéis de barras verticais**, um por parâmetro e com escala própria (as 4
caixas de valor exato permanecem intactas). A conta de teste
`manucordeiro326@gmail.com` lê o pHmetro **direto pelo Web Serial dentro do
próprio portal**, sem página extra, com os outros três parâmetros zerados —
isolamento estrito por e-mail, sem senha no código.

Cuidados técnicos:

* **BSL / classes de risco** só se aplicam a agentes que adoecem humanos e
  animais; fitopatógenos são avaliados por impacto na lavoura.
* A **classificação toxicológica GHS** (Anvisa RDC 294/2019) é definida por
  produto formulado, não por ingrediente ativo — o catálogo não fornece doses
  nem marcas e remete ao AGROFIT.
* Os níveis Alto/Moderado/Baixo são leitura qualitativa da Embrapa, não
  classificação oficial do MAPA.

## 5. Mapa de arquivos

```
index.html, script.js                    landing + contato (WhatsApp)
cadastro.html, cadastro.js               criação de conta
pagamento.html, pagamento.js             checkout simulado + código de acesso
email-config.js                          integração EmailJS
login.html, login.js                     login de cliente e modal admin
login-admin.html, login-admin.js         login administrativo
portal.html, portal.js, portal.css       dashboard (4 gráficos de barras + curiosidades)
admin.html, admin.js                     hub administrativo
admin-guard.js                           guarda de sessão/permissão das telas admin
admin-clientes.js / admin-doencas.js / admin-bloqueios.js
patógenos.html, patogenos.js             catálogo de patógenos por cultura
periculosidade.html, solucoes.html, solucoes.js  riscos e soluções químicas
supabase-client.js                       cliente Supabase (URL + anon key)
config-admins.js                         e-mails das contas administradoras
voltar.js                                botão Voltar (exceto index.html)
lavoura.js                               cultura da conta logada
pesquisa-culturas.js                     doenças via água, soluções 1:1, curiosidades, fontes
PESQUISA_FONTES.md                       relatório auditável das fontes oficiais
perfil.html, perfil.js                   perfil + faturas pagas / a vencer
images/prototipo.jpg                     imagem temporária do protótipo
supabase/instalar-tudo.sql               um único SQL: schema + admins + conferência
supabase/admins.sql                      marca as 4 contas como is_admin
supabase/schema.sql                      schema COMPLETO do banco
supabase/leituras.sql                    recorte: só a tabela de leituras
sw.js, pwa.js, manifest.webmanifest      PWA / cache offline
```

---

## 6. Limitações conhecidas

Esses pontos são **intencionais** para uma demonstração e devem ser tratados
antes de qualquer uso real:

- **Pagamento é simulado.** `pagamento.js` grava `status: "ativa"` e
  `status: "aprovado"` direto do navegador. Com a anon key pública, isso é
  burlável. Em produção, use um gateway (Stripe/Mercado Pago) com webhook
  assinado numa Edge Function e só ela teria permissão para ativar a
  assinatura. As policies de RLS e o índice único
  `assinaturas_uma_ativa_por_usuario` reduzem o estrago, mas não substituem a
  confirmação no servidor.
- **INSERT em `leituras` é aberto a `anon`** porque `sensor.html` e a ponte
  Python gravam sem login. Troque por um token por dispositivo + RPC
  `SECURITY DEFINER` (instruções em `supabase/leituras.sql`).
- **`obter_codigo_acesso()` é executável por `anon` e devolve o código**, pois
  a tela de reenvio é pública. Por isso o modal de reenvio **também exibe o
  código na tela**, como fallback caso o e-mail falhe. Em produção, mova o
  reenvio para uma Edge Function autenticada com rate limit, revogue o
  `grant ... to anon` e remova esse fallback visual.
- **Código "inválido ou expirado" com o código certo**: assinaturas criadas
  antes de `supabase/schema.sql` podem estar sem `codigo_expira_em`. O
  `login.js` usa `codigo_gerado_em + 30 dias` como fallback; para reparar os
  dados no banco, rode [`supabase/corrigir-codigos.sql`](supabase/corrigir-codigos.sql).
- **CDNs externos** (Tailwind, Lucide, Chart.js, Supabase, EmailJS): sem
  internet as páginas perdem estilo/ícones/funções. `sensor-local.html` é a
  única página 100% independente.
- **Confirmação de e-mail** do Supabase Auth pode estar ativada; nesse caso o
  login mostra *"Confirme seu e-mail antes de entrar"*.
- **`sensor-local.html` mantém o CSV apenas em memória** (perde-se ao recarregar)
  e seus equipamentos em `localStorage`; não há vínculo com o banco.

---

## 7. Verificação rápida

```bash
node --check portal.js pagamento.js script.js login.js login-admin.js \
             admin.js admin-guard.js email-config.js sw.js sensor.js
```

No console do navegador, com o schema aplicado, não deve haver 404 de
arquivos locais nem `ReferenceError`. Para confirmar as leituras:

```sql
select id, sensor_id, ph, criado_em
from public.leituras
order by criado_em desc
limit 20;
```
