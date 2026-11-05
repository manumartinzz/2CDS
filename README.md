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
2. Abra **SQL Editor → New query**, cole todo o conteúdo de
   [`supabase/schema.sql`](supabase/schema.sql) e execute.
   O script é idempotente e cria: `profiles`, `planos`, `assinaturas`,
   `pagamentos`, `leituras`, `doencas`, `solucoes`, o gatilho de criação de
   perfil, as funções `is_admin()`, `admin_listar_clientes()` e
   `obter_codigo_acesso()`, todas as policies de RLS e a publicação Realtime.
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

## 5. Mapa de arquivos

```
index.html, script.js                    landing + contato (WhatsApp)
cadastro.html, cadastro.js               criação de conta
pagamento.html, pagamento.js             checkout simulado + código de acesso
email-config.js                          integração EmailJS
login.html, login.js                     login de cliente e modal admin
login-admin.html, login-admin.js         login administrativo
portal.html, portal.js, portal.css       dashboard (um único Chart)
admin.html, admin.js                     hub administrativo
admin-guard.js                           guarda de sessão/permissão das telas admin
admin-clientes.js / admin-doencas.js / admin-bloqueios.js
patógenos.html, patogenos.js             catálogo de patógenos
periculosidade.html, solucoes.html, solucoes.js
supabase-client.js                       cliente Supabase (URL + anon key)
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
