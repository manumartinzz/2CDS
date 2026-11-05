-- ============================================================
--  AcquaSafe - tabela de leituras usada pelo portal.html
--  (script inline: "leituras", colunas ph/fluor/cloro/turbidez)
--  Execute no SQL Editor do Supabase, UMA VEZ.
-- ============================================================
--  ATENCAO: este e apenas o recorte da tabela de leituras, mantido para
--  quem quer ligar SOMENTE o sensor. O schema completo do projeto
--  (profiles, planos, assinaturas, pagamentos, catalogos, RPCs e RLS)
--  esta versionado em supabase/schema.sql — execute aquele primeiro.
--  Se a tabela "leituras" ja existir com colunas diferentes, adapte o
--  INSERT em sensor.js / bridge/ph_serial_bridge.py em vez de recriar.
-- ============================================================

create table if not exists public.leituras (
  id          bigint generated always as identity primary key,
  sensor_id   text not null default 'sensor-01',
  ph          numeric(5,2),
  fluor       numeric(6,2),
  cloro       numeric(6,2),
  turbidez    numeric(6,2),
  criado_em   timestamptz not null default now()
);

create index if not exists leituras_sensor_criado_idx
  on public.leituras (sensor_id, criado_em desc);

alter table public.leituras enable row level security;

-- Leitura publica: sensor.html / portal.html?real=1 e a ponte Python
-- consultam com a anon key; o portal logado usa a role "authenticated".
-- Por isso a policy precisa incluir as duas roles.
drop policy if exists "leituras_select" on public.leituras;
create policy "leituras_select"
  on public.leituras for select
  to anon, authenticated
  using (true);

-- Gravacao: a pagina sensor.html, a ponte Python e a simulacao do portal
-- inserem leituras. Para um TCC/demonstracao isso e suficiente, mas e uma
-- politica ABERTA: qualquer pessoa com a anon key consegue inserir linhas.
drop policy if exists "leituras_insert" on public.leituras;
create policy "leituras_insert"
  on public.leituras for insert
  to anon, authenticated
  with check (true);

-- ------------------------------------------------------------
--  ENDURECIMENTO (recomendado se for alem da bancada)
--  1) Troque "to anon, authenticated" por "to authenticated" e
--     faca login antes de gravar; ou
--  2) Crie uma RPC SECURITY DEFINER que valida um token de dispositivo
--     gravado em uma tabela "dispositivos" e revogue o INSERT direto; ou
--  3) Use um ESP32/ESP8266 com um token proprio por sensor.
--  NUNCA coloque a chave service_role no firmware nem no frontend.
-- ------------------------------------------------------------

-- Conferir rapidamente:
-- select sensor_id, ph, criado_em from public.leituras
-- order by criado_em desc limit 10;
