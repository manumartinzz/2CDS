/*
  pesquisa-culturas.js — AcquaSafe
  ------------------------------------------------------------------
  Catálogo técnico pesquisado por tipo de lavoura: patógenos, soluções
  químicas/controle e níveis de periculosidade, com as fontes oficiais
  usadas em cada item.

  Regras de honestidade técnica adotadas nesta versão:
   * BSL / "classes de risco" do Ministério da Saúde, da NR-32 e da OMS
     classificam agentes que causam doença em SERES HUMANOS E ANIMAIS.
     Fitopatógenos (fungos, oomicetos, nematoides de planta, bactérias
     de planta) NÃO recebem BSL. Para eles usamos "impacto na lavoura",
     uma leitura qualitativa da severidade/perdas descritas pela Embrapa.
   * A classificação toxicológica GHS (Anvisa RDC 294/2019) é definida
     POR PRODUTO FORMULADO, não por ingrediente ativo. Por isso a coluna
     correspondente diz "Específica por produto" e remete ao AGROFIT.
   * Não são fornecidas doses nem marcas comerciais: o AGROFIT é um
     cadastro dinâmico e a consulta deve ser feita antes de qualquer uso.

  Nenhum arquivo .css é necessário: o bloco de fontes usa apenas classes
  utilitárias já carregadas (Tailwind) e estilos inline mínimos.
*/

const DATA_PESQUISA = "06/11/2026";

/* Fontes comuns a TODAS as culturas e aos três catálogos. */
const FONTES_GERAIS = [
  {
    orgao: "MAPA · AGROFIT",
    titulo: "Agrotóxicos registrados no AGROFIT (cadastro oficial por cultura, alvo, ingrediente ativo e classificação toxicológica)",
    url: "https://www.gov.br/agricultura/pt-br/acesso-a-informacao/acoes-e-programas/cartas-de-servico/defesa-agropecuaria-agrotoxicos/agrotoxicos-registrados-no-agrofit"
  },
  {
    orgao: "MAPA",
    titulo: "Agrofit agora é o sistema oficial de cadastro de agroquímicos",
    url: "https://www.gov.br/agricultura/pt-br/assuntos/noticias/2022/agrofit-agora-e-o-sistema-oficial-de-cadastro-de-agroquimicos"
  },
  {
    orgao: "Embrapa · AgroAPI",
    titulo: "Documentação da API AGROFIT (campos de culturas, pragas, classificações toxicológica e ambiental)",
    url: "https://www.agroapi.cnptia.embrapa.br/portal/assets/docs/agrofit.pdf"
  },
  {
    orgao: "Anvisa · RDC 294/2019",
    titulo: "Novo marco regulatório: classificação toxicológica pelo GHS (categorias 1 a 5 e Não Classificado)",
    url: "https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2019/anvisa-aprova-novo-marco-regulatorio-para-agrotoxicos"
  },
  {
    orgao: "Anvisa",
    titulo: "Reclassificação toxicológica dos agrotóxicos (1.942 produtos avaliados)",
    url: "https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2019/publicada-reclassificacao-toxicologica-de-agrotoxicos"
  },
  {
    orgao: "Anvisa · Monografias",
    titulo: "Monografia A29 (acetamiprido): a classificação toxicológica é específica para cada produto, conforme art. 38 da RDC 294/2019",
    url: "https://www.gov.br/anvisa/pt-br/setorregulado/regularizacao/agrotoxicos/monografias/monografias-autorizadas/a/4150json-file-1/@@display-file/file"
  },
  {
    orgao: "Ministério da Saúde · Portaria GM/MS 3.398/2021",
    titulo: "Lista de Classificação de Risco dos Agentes Biológicos (classes 1 a 4)",
    url: "https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt3398_29_12_2021.html"
  },
  {
    orgao: "Ministério da Saúde · Portaria GM/MS 2.349/2017",
    titulo: "Aprova a Classificação de Risco dos Agentes Biológicos",
    url: "https://bvsms.saude.gov.br/bvs/saudelegis/gm/2017/prt2349_22_09_2017.html"
  },
  {
    orgao: "Ministério da Saúde",
    titulo: "Classificação de Risco dos Agentes Biológicos — 3ª edição (critérios: infectividade, patogenicidade, virulência, profilaxia e terapia)",
    url: "https://bvsms.saude.gov.br/bvs/publicacoes/classificacao_risco_agentes_biologicos_3ed.pdf"
  },
  {
    orgao: "MTE · NR-32",
    titulo: "Segurança e Saúde no Trabalho em Serviços de Saúde — Anexo I (classes de risco 1 a 4) e Anexo II (tabela de agentes)",
    url: "https://fiocruz.br/biosseguranca/Bis/manuais/legislacao/NR-32.pdf"
  },
  {
    orgao: "OMS / WHO",
    titulo: "Laboratory Biosafety Manual, 4ª edição (2020) — abordagem baseada em avaliação de risco",
    url: "https://www.who.int/publications/i/item/9789240011311"
  },
  {
    orgao: "MAPA · Defesa Vegetal",
    titulo: "Listas de Pragas Quarentenárias Ausentes (PQA) e Presentes (PQP) e Análise de Risco de Pragas",
    url: "https://www.gov.br/agricultura/pt-br/assuntos/noticias/mapa-disponibiliza-listagem-atualizada-de-pragas-quarentenarias"
  },
  {
    orgao: "Ministério da Saúde · Portaria GM/MS 888/2021",
    titulo: "Padrão de potabilidade: pH 6,0–9,5; cloro residual livre ≥ 0,2 mg/L e VMP 5 mg/L; turbidez ≤ 5 uT; ausência de E. coli em 100 mL",
    url: "https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html"
  },
  {
    orgao: "CONAMA · Resolução 357/2005",
    titulo: "Classificação dos corpos d'água: classe 3 destinada à irrigação de culturas arbóreas, cerealíferas e forrageiras (pH 6,0–9,0; coliformes termotolerantes)",
    url: "https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450"
  },
  {
    orgao: "EPPO",
    titulo: "EPPO Global Database — nomes científicos, sinonímia, plantas-hospedeiro e distribuição de mais de 99.700 espécies",
    url: "https://gd.eppo.int/"
  },
  {
    orgao: "CABI",
    titulo: "Crop Protection Compendium — datasheets revisadas por especialistas sobre pragas, doenças e hospedeiros",
    url: "https://www.cabi.org/Uploads/CABI/publishing/promotional-materials/insert/Cp%20Compendium%20A4%20Insert.pdf"
  }
];

/* Patógenos de veiculação hídrica: valem para TODAS as culturas porque
   dizem respeito à água monitorada pelo sensor, não à planta. */
const PATOGENOS_AGUA = [
  { nome: "Escherichia coli (cepas patogênicas)", tipo: "Bactéria", impacto: "Água", doenca: "Infecções intestinais / indicador de contaminação fecal", orgao: "Trato gastrointestinal", saude: "Classe 2 (MS)", controle: "Desinfecção com cloro; Portaria GM/MS 888/2021 exige ausência em 100 mL" },
  { nome: "Coliformes termotolerantes", tipo: "Bactéria", impacto: "Água", doenca: "Indicador de contaminação fecal da água de irrigação", orgao: "Água", saude: "Classe 2 (MS)", controle: "CONAMA 357/2005, classe 3: limite de 2.500/100 mL em 80% das amostras" },
  { nome: "Vibrio cholerae", tipo: "Bactéria", impacto: "Água", doenca: "Cólera", orgao: "Intestino delgado", saude: "Classe 2 (MS)", controle: "Cloração e vigilância sanitária da água" },
  { nome: "Leptospira interrogans", tipo: "Bactéria", impacto: "Água", doenca: "Leptospirose", orgao: "Rins / fígado / pulmões", saude: "Classe 2 (MS)", controle: "Desinfecção e controle de roedores" },
  { nome: "Salmonella spp.", tipo: "Bactéria", impacto: "Água", doenca: "Salmonelose / febre tifoide", orgao: "Intestino", saude: "Classe 2 (MS)", controle: "Desinfecção; Portaria 2.349/2017 ressalva S. Typhi como classe 3" },
  { nome: "Shigella sonnei", tipo: "Bactéria", impacto: "Água", doenca: "Shigelose / disenteria bacilar", orgao: "Cólon", saude: "Classe 2 (MS)", controle: "Desinfecção da água" },
  { nome: "Giardia duodenalis", tipo: "Protozoário", impacto: "Água", doenca: "Giardíase", orgao: "Intestino delgado", saude: "Classe 2 (MS)", controle: "Filtração + desinfecção (cistos resistentes ao cloro)" },
  { nome: "Cryptosporidium parvum", tipo: "Protozoário", impacto: "Água", doenca: "Criptosporidiose", orgao: "Intestino", saude: "Classe 2 (MS)", controle: "Filtração; resistente a níveis usuais de cloro" },
  { nome: "Hepatitis A virus (HAV)", tipo: "Vírus", impacto: "Água", doenca: "Hepatite A", orgao: "Fígado", saude: "Classe 2 (MS)", controle: "Desinfecção e vacinação" },
  { nome: "Schistosoma mansoni", tipo: "Helminto", impacto: "Água", doenca: "Esquistossomose", orgao: "Intestino / fígado", saude: "Classe 2 (MS)", controle: "Saneamento e controle de caramujos" }
];

/* Soluções de tratamento/calibração da água: comuns a todas as culturas. */
const SOLUCOES_AGUA = [
  { nome: "Hipoclorito de Sódio", concentracao: "10–15%", solvente: "Água", uso: "Desinfecção", validade: 180, ghs: "Específica por produto", alvo: "Água" },
  { nome: "Sulfato de Cobre", concentracao: "0,1%", solvente: "Água", uso: "Algicida", validade: 365, ghs: "Específica por produto", alvo: "Água" },
  { nome: "Ácido Peracético", concentracao: "5%", solvente: "Água", uso: "Esterilização", validade: 90, ghs: "Específica por produto", alvo: "Água" },
  { nome: "Cloreto de Cálcio", concentracao: "2%", solvente: "Água", uso: "Tratamento", validade: 240, ghs: "Específica por produto", alvo: "Água" },
  { nome: "Dióxido de Cloro", concentracao: "0,2–1,0 mg/L", solvente: "Água", uso: "Desinfecção de água", validade: 30, ghs: "Específica por produto", alvo: "Água" },
  { nome: "Peróxido de Hidrogênio", concentracao: "3–10%", solvente: "Água", uso: "Oxidação e desinfecção", validade: 180, ghs: "Específica por produto", alvo: "Água" },
  { nome: "Carvão Ativado Granular", concentracao: "Leito filtrante", solvente: "Água", uso: "Remoção de odor e compostos orgânicos", validade: 365, ghs: "Não classificado (sem substância ativa)", alvo: "Água" },
  { nome: "Solução tampão pH 7,00", concentracao: "Pronta para uso", solvente: "Água deionizada", uso: "Calibração de medidores de pH", validade: 180, ghs: "Específica por produto", alvo: "Calibração" },
  { nome: "Solução padrão de turbidez", concentracao: "20 NTU", solvente: "Suspensão padrão", uso: "Calibração de turbidímetro", validade: 180, ghs: "Específica por produto", alvo: "Calibração" }
];

const AGROFIT_NOTA = "Classes de ingredientes ativos, não marcas nem doses. Consulte o AGROFIT por cultura + alvo antes de aplicar; o registro é dinâmico e exige responsável técnico.";

/* ------------------------------------------------------------------ */
/* Dados pesquisados por cultura                                       */
/* ------------------------------------------------------------------ */
const PESQUISA_CULTURAS = {
  soja: {
    nome: "Soja",
    fontes: [
      { orgao: "Embrapa Soja", titulo: "Doenças — publicações sobre ferrugem-asiática, DFC, mancha-alvo e oídio", url: "https://www.embrapa.br/en/soja/publicacoes/doencas" },
      { orgao: "Embrapa Soja", titulo: "Manual de identificação de doenças de soja (2014)", url: "https://www.embrapa.br/en/busca-de-publicacoes/-/publicacao/991687/manual-de-identificacao-de-doencas-de-soja" },
      { orgao: "Embrapa Soja", titulo: "Circular Técnica 198 — avaliação da associação de fungicidas químicos e biológicos (safra 2024/2025)", url: "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1157438/1/Circ-Tec-198-online.pdf" },
      { orgao: "Embrapa Soja", titulo: "Nematoides em soja: identificação e controle (Circular Técnica 76, 2010)", url: "https://www.infoteca.cnptia.embrapa.br/bitstream/doc/854178/1/CT76eletronica.pdf" },
      { orgao: "UNESP / FEIS", titulo: "Doenças da cultura da soja (Glycine max) — bactérias, fungos e controle químico", url: "https://www.feis.unesp.br/Home/departamentos/fitotecniatecnologiadealimentosesocioeconomia716/edsonlazarini/doencas-soja.pdf" }
    ],
    patogenos: [
      { nome: "Phakopsora pachyrhizi", tipo: "Fungo", impacto: "Alto", doenca: "Ferrugem-asiática da soja", orgao: "Folhas / vagens", saude: "Não aplicável", controle: "Triazóis (DMI) + estrobilurinas (QoI); vazio sanitário; consultar AGROFIT" },
      { nome: "Phakopsora meibomiae", tipo: "Fungo", impacto: "Moderado", doenca: "Ferrugem americana da soja", orgao: "Folhas", saude: "Não aplicável", controle: "Fungicidas registrados para ferrugem; consultar AGROFIT" },
      { nome: "Sclerotinia sclerotiorum", tipo: "Fungo", impacto: "Alto", doenca: "Mofo-branco / podridão branca da haste", orgao: "Hastes / vagens", saude: "Não aplicável", controle: "Fungicidas químicos e controle biológico (ensaios cooperativos Embrapa)" },
      { nome: "Corynespora cassiicola", tipo: "Fungo", impacto: "Alto", doenca: "Mancha-alvo", orgao: "Folhas / raízes", saude: "Não aplicável", controle: "Fungicidas registrados; rotação de moléculas; consultar AGROFIT" },
      { nome: "Cercospora kikuchii", tipo: "Fungo", impacto: "Moderado", doenca: "Crestamento foliar / mancha púrpura (DFC)", orgao: "Folhas / sementes", saude: "Não aplicável", controle: "Fungicidas multissítios + tratamento de sementes" },
      { nome: "Septoria glycines", tipo: "Fungo", impacto: "Moderado", doenca: "Mancha parda / septoriose (DFC)", orgao: "Folhas", saude: "Não aplicável", controle: "Fungicidas multissítios; manejo de restos culturais" },
      { nome: "Microsphaera diffusa", tipo: "Fungo", impacto: "Moderado", doenca: "Oídio da soja", orgao: "Folhas / hastes", saude: "Não aplicável", controle: "Cultivares resistentes; fungicidas registrados" },
      { nome: "Macrophomina phaseolina", tipo: "Fungo", impacto: "Alto", doenca: "Podridão de carvão da raiz", orgao: "Raízes / colo", saude: "Não aplicável", controle: "Manejo de solo e rotação de culturas; sem controle químico curativo" },
      { nome: "Phytophthora sojae", tipo: "Oomiceto", impacto: "Alto", doenca: "Podridão radicular de Phytophthora", orgao: "Raízes / hastes", saude: "Não aplicável", controle: "Cultivares resistentes (genes Rps) + tratamento de sementes" },
      { nome: "Xanthomonas axonopodis pv. glycines", tipo: "Bactéria", impacto: "Moderado", doenca: "Pústula bacteriana", orgao: "Folhas", saude: "Não aplicável", controle: "Sementes sadias e cultivares resistentes" },
      { nome: "Heterodera glycines", tipo: "Nematoide", impacto: "Alto", doenca: "Nematoide de cisto da soja (NCS)", orgao: "Raízes", saude: "Não aplicável", controle: "Rotação com não-hospedeiros + cultivares resistentes" },
      { nome: "Meloidogyne javanica", tipo: "Nematoide", impacto: "Alto", doenca: "Nematoide das galhas", orgao: "Raízes", saude: "Não aplicável", controle: "Rotação com gramíneas resistentes; consultar AGROFIT" },
      { nome: "Pratylenchus brachyurus", tipo: "Nematoide", impacto: "Alto", doenca: "Nematoide das lesões radiculares", orgao: "Raízes", saude: "Não aplicável", controle: "Rotação de culturas e manejo de solo arenoso" }
    ],
    solucoes: [
      { nome: "Triazóis (DMI) + estrobilurinas (QoI)", concentracao: "Conforme bula", solvente: "Água", uso: "Controle da ferrugem-asiática e DFC", validade: "—", ghs: "Específica por produto", alvo: "Soja · Phakopsora pachyrhizi / DFC" },
      { nome: "Fungicidas multissítios (protectantes)", concentracao: "Conforme bula", solvente: "Água", uso: "Associação em programas anti-resistência", validade: "—", ghs: "Específica por produto", alvo: "Soja · ferrugem e mancha-alvo" },
      { nome: "Tratamento de sementes (fungicidas registrados)", concentracao: "Conforme bula", solvente: "Água", uso: "Colletotrichum truncatum e Fusarium spp. em sementes", validade: "—", ghs: "Específica por produto", alvo: "Soja · sementes" }
    ],
    nota: AGROFIT_NOTA
  },

  cafe: {
    nome: "Café",
    fontes: [
      { orgao: "Embrapa", titulo: "Resistência de cafeeiros a doenças — ferrugem, cercosporiose, antracnose, rhizoctoniose e koleroga", url: "https://www.infoteca.cnptia.embrapa.br/bitstream/doc/901892/1/ct51doencasdocafeeiro.pdf" },
      { orgao: "Embrapa Rondônia", titulo: "Principais doenças do café em Rondônia (2005)", url: "https://www.embrapa.br/en/busca-de-publicacoes/-/publicacao/859497/principais-doencas-do-cafe-em-rondonia" },
      { orgao: "Embrapa / Consórcio Pesquisa Café", titulo: "Manual do Café — distúrbios fisiológicos, pragas e doenças do cafeeiro (ferrugem, cercosporiose, Phoma, mancha aureolada)", url: "http://www.sapc.embrapa.br/arquivos/consorcio/publicacoes_tecnicas/livro_disturbios_fisiologicos_pragas_doen%C3%A7as.pdf" }
    ],
    patogenos: [
      { nome: "Hemileia vastatrix", tipo: "Fungo", impacto: "Alto", doenca: "Ferrugem do cafeeiro", orgao: "Folhas (face abaxial)", saude: "Não aplicável", controle: "Fungicidas registrados (via foliar e/ou solo); monitorar dez–mar; consultar AGROFIT" },
      { nome: "Cercospora coffeicola", tipo: "Fungo", impacto: "Alto", doenca: "Cercosporiose / mancha-de-olho-pardo", orgao: "Folhas / frutos", saude: "Não aplicável", controle: "Fungicidas registrados + nutrição equilibrada N/K" },
      { nome: "Phoma costarricensis", tipo: "Fungo", impacto: "Moderado", doenca: "Manchas de Phoma / requeima", orgao: "Folhas / ramos / frutos", saude: "Não aplicável", controle: "Fungicidas registrados; evitar excesso de nitrogênio" },
      { nome: "Colletotrichum coffeanum", tipo: "Fungo", impacto: "Moderado", doenca: "Antracnose / mancha manteigosa", orgao: "Folhas / ramos / frutos", saude: "Não aplicável", controle: "Fungicidas registrados e manejo de umidade" },
      { nome: "Koleroga noxia", tipo: "Fungo", impacto: "Moderado", doenca: "Queima-do-fio / koleroga", orgao: "Ramos / folhas", saude: "Não aplicável", controle: "Fungicidas cúpricos registrados; poda e ventilação" },
      { nome: "Rhizoctonia solani", tipo: "Fungo", impacto: "Moderado", doenca: "Rhizoctoniose / tombamento de mudas", orgao: "Colo / raízes", saude: "Não aplicável", controle: "Substrato esterilizado e mudas sadias; consultar AGROFIT" },
      { nome: "Pseudomonas syringae pv. garcae", tipo: "Bactéria", impacto: "Moderado", doenca: "Mancha aureolada", orgao: "Folhas / ramos", saude: "Não aplicável", controle: "Produtos cúpricos registrados e mudas certificadas" },
      { nome: "Meloidogyne spp.", tipo: "Nematoide", impacto: "Alto", doenca: "Nematoide das galhas do cafeeiro", orgao: "Raízes", saude: "Não aplicável", controle: "Mudas sadias, porta-enxertos resistentes; consultar AGROFIT" }
    ],
    solucoes: [
      { nome: "Fungicidas sistêmicos registrados para ferrugem", concentracao: "Conforme bula", solvente: "Água", uso: "Controle de Hemileia vastatrix", validade: "—", ghs: "Específica por produto", alvo: "Café · ferrugem" },
      { nome: "Fungicidas cúpricos", concentracao: "Conforme bula", solvente: "Água", uso: "Cercosporiose, antracnose e mancha aureolada", validade: "—", ghs: "Específica por produto", alvo: "Café · folhas e frutos" },
      { nome: "Desinfestação de substrato / viveiro", concentracao: "Conforme bula", solvente: "Água", uso: "Prevenção de Rhizoctonia em mudas", validade: "—", ghs: "Específica por produto", alvo: "Café · mudas" }
    ],
    nota: AGROFIT_NOTA + " A Embrapa destaca que o controle químico da ferrugem depende de calendário (período chuvoso) e do residual do produto."
  },

  trigo: {
    nome: "Trigo",
    fontes: [
      { orgao: "Embrapa Trigo", titulo: "Atenção com as doenças no trigo — ferrugem da folha (Puccinia triticina) e giberela; danos > 60% em cultivares suscetíveis", url: "https://www.embrapa.br/en/busca-de-noticias/-/noticia/55372349/atencao-com-as-doencas-no-trigo" },
      { orgao: "Embrapa Trigo", titulo: "Comunicado Técnico Online 140 — reação a ferrugem da folha, ferrugem do colmo, oídio, giberela, septória e mancha marrom", url: "https://www.cnpt.embrapa.br/biblio/co/p_co140.htm" },
      { orgao: "Embrapa Trigo", titulo: "Documento Online 16 — reação a doenças de cultivares (oídio, ferrugens, mancha da gluma, giberela)", url: "https://www.cnpt.embrapa.br/biblio/p_do16_7.htm" }
    ],
    patogenos: [
      { nome: "Puccinia triticina", tipo: "Fungo", impacto: "Alto", doenca: "Ferrugem da folha", orgao: "Folhas / bainhas", saude: "Não aplicável", controle: "Estrobilurinas + triazóis no limiar de dano econômico; consultar AGROFIT" },
      { nome: "Gibberella zeae / Fusarium graminearum", tipo: "Fungo", impacto: "Alto", doenca: "Giberela / fusariose da espiga (micotoxinas)", orgao: "Espigas / grãos", saude: "Não aplicável", controle: "Fungicidas no início da floração — eficiência parcial (50–70%); previsão climática" },
      { nome: "Puccinia graminis f. sp. tritici", tipo: "Fungo", impacto: "Alto", doenca: "Ferrugem do colmo", orgao: "Colmos / bainhas", saude: "Não aplicável", controle: "Cultivares resistentes + fungicidas registrados" },
      { nome: "Blumeria graminis f. sp. tritici", tipo: "Fungo", impacto: "Moderado", doenca: "Oídio", orgao: "Folhas", saude: "Não aplicável", controle: "Cultivares resistentes e fungicidas registrados" },
      { nome: "Stagonospora nodorum", tipo: "Fungo", impacto: "Moderado", doenca: "Septória das glumas / mancha da gluma", orgao: "Glumas / folhas", saude: "Não aplicável", controle: "Tratamento de sementes e fungicidas registrados" },
      { nome: "Bipolaris sorokiniana", tipo: "Fungo", impacto: "Moderado", doenca: "Mancha marrom / podridão radicular", orgao: "Folhas / raízes", saude: "Não aplicável", controle: "Rotação de culturas e sementes sadias" },
      { nome: "Drechslera tritici-repentis", tipo: "Fungo", impacto: "Moderado", doenca: "Mancha bronzeada", orgao: "Folhas", saude: "Não aplicável", controle: "Manejo de restos culturais + fungicidas registrados" }
    ],
    solucoes: [
      { nome: "Estrobilurinas (QoI) + triazóis (DMI)", concentracao: "Conforme bula", solvente: "Água", uso: "Controle de ferrugem da folha no LDE", validade: "—", ghs: "Específica por produto", alvo: "Trigo · Puccinia triticina" },
      { nome: "Fungicidas sistêmicos para espiga", concentracao: "Conforme bula", solvente: "Água", uso: "Giberela — aplicação no emborrachamento/floração", validade: "—", ghs: "Específica por produto", alvo: "Trigo · Fusarium graminearum" },
      { nome: "Tratamento de sementes", concentracao: "Conforme bula", solvente: "Água", uso: "Bipolaris e Stagonospora transmitidos por sementes", validade: "—", ghs: "Específica por produto", alvo: "Trigo · sementes" }
    ],
    nota: AGROFIT_NOTA + " A Embrapa Trigo recomenda não ultrapassar o estádio de grão leitoso na última aplicação."
  },

  laranja: {
    nome: "Laranja / Citros",
    fontes: [
      { orgao: "Fundecitrus", titulo: "Greening (Huanglongbing / HLB) — agente causal, vetor Diaphorina citri, sintomas e manejo", url: "https://ww2.fundecitrus.com.br/doencas/greening" },
      { orgao: "Embrapa Mandioca e Fruticultura", titulo: "Monitoramento da invasão de Candidatus Liberibacter, agente causal do HLB, na Bahia (2012)", url: "https://www.embrapa.br/en/busca-de-publicacoes/-/publicacao/944796/monitoramento-da-invasao-de-candidatus-liberibacter-agente-causal-do-huanglongbing-hlb-dos-citros-em-areas-produtoras-da-bahia" },
      { orgao: "CDFA (California Dept. of Food and Agriculture)", titulo: "Huanglongbing Pest Profile — não existem controles químicos que atinjam a bactéria; manejo foca em erradicação e vetor", url: "https://www.cdfa.ca.gov/citrus/pests_diseases/hlb/PestProfile.html" }
    ],
    patogenos: [
      { nome: "'Candidatus Liberibacter asiaticus'", tipo: "Bactéria", impacto: "Altíssimo", doenca: "Huanglongbing / greening / amarelão dos citros", orgao: "Floema / folhas / frutos", saude: "Não aplicável", controle: "Sem cura: erradicação de plantas doentes + inseticidas contra o psilídeo + mudas certificadas" },
      { nome: "'Candidatus Liberibacter americanus'", tipo: "Bactéria", impacto: "Altíssimo", doenca: "HLB (forma sul-americana)", orgao: "Floema", saude: "Não aplicável", controle: "Mesmo manejo do HLB; vetor Diaphorina citri" },
      { nome: "Diaphorina citri", tipo: "Inseto vetor", impacto: "Altíssimo", doenca: "Vetor do HLB (transmissão das bactérias)", orgao: "Brotações / folhas", saude: "Não aplicável", controle: "Inseticidas registrados para citros + monitoramento de brotações" },
      { nome: "Phytophthora spp.", tipo: "Oomiceto", impacto: "Alto", doenca: "Gomose / podridão do colo e raízes", orgao: "Colo / raízes / tronco", saude: "Não aplicável", controle: "Fungicidas registrados + drenagem e porta-enxertos resistentes" },
      { nome: "Xanthomonas citri", tipo: "Bactéria", impacto: "Alto", doenca: "Cancro cítrico", orgao: "Folhas / ramos / frutos", saude: "Não aplicável", controle: "Produtos cúpricos registrados + mudas certificadas e barreiras" },
      { nome: "Colletotrichum gloeosporioides", tipo: "Fungo", impacto: "Moderado", doenca: "Antracnose / queda prematura de frutos", orgao: "Flores / frutos", saude: "Não aplicável", controle: "Fungicidas registrados para citros (AGROFIT)" }
    ],
    solucoes: [
      { nome: "Inseticidas registrados para Diaphorina citri", concentracao: "Conforme bula", solvente: "Água", uso: "Controle do vetor do HLB", validade: "—", ghs: "Específica por produto", alvo: "Citros · psilídeo" },
      { nome: "Produtos cúpricos", concentracao: "Conforme bula", solvente: "Água", uso: "Cancro cítrico e antracnose", validade: "—", ghs: "Específica por produto", alvo: "Citros · bactérias e fungos foliares" },
      { nome: "Fungicidas/ fosfitos registrados", concentracao: "Conforme bula", solvente: "Água", uso: "Gomose de Phytophthora", validade: "—", ghs: "Específica por produto", alvo: "Citros · colo e raízes" }
    ],
    nota: " Não há controle químico curativo para o HLB: o Fundecitrus e o CDFA recomendam eliminar a árvore doente, controlar o psilídeo e usar mudas de viveiros telados. " + AGROFIT_NOTA
  },

  algodao: {
    nome: "Algodão",
    fontes: [
      { orgao: "Embrapa Algodão", titulo: "Guia de identificação e controle das principais doenças — ramulose, murcha de Fusarium, tombamento", url: "https://www.infoteca.cnptia.embrapa.br/bitstream/doc/272982/1/DOC113.PDF" },
      { orgao: "Embrapa Algodão", titulo: "Circular Técnica 76 — guia de identificação e controle de pragas e doenças do algodoeiro", url: "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/273549/1/CIRTEC76.pdf" },
      { orgao: "Embrapa Agropecuária Oeste", titulo: "Detecção e controle químico de Colletotrichum em sementes de soja e algodão (2009)", url: "https://www.infoteca.cnptia.embrapa.br/bitstream/doc/574033/1/DOC2009100.pdf" },
      { orgao: "Embrapa", titulo: "Nematoides fitoparasitos de culturas anuais no Brasil (soja, algodoeiro e milho)", url: "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/982653/1/cap7.pdf" }
    ],
    patogenos: [
      { nome: "Colletotrichum gossypii var. cephalosporioides", tipo: "Fungo", impacto: "Altíssimo", doenca: "Ramulose (superbrotamento / envassouramento)", orgao: "Folhas / ramos / capulhos", saude: "Não aplicável", controle: "Tratamento de sementes + fungicidas registrados; cultivares resistentes" },
      { nome: "Fusarium oxysporum f. sp. vasinfectum", tipo: "Fungo", impacto: "Altíssimo", doenca: "Murcha de Fusarium", orgao: "Xilema / raízes", saude: "Não aplicável", controle: "Cultivares resistentes e rotação; agravada por Meloidogyne/Pratylenchus" },
      { nome: "Rhizoctonia solani", tipo: "Fungo", impacto: "Alto", doenca: "Damping-off / tombamento / mela", orgao: "Plântulas / colo", saude: "Não aplicável", controle: "Tratamento de sementes com fungicidas registrados" },
      { nome: "Colletotrichum gossypii", tipo: "Fungo", impacto: "Alto", doenca: "Antracnose / tombamento de plântulas", orgao: "Sementes / plântulas", saude: "Não aplicável", controle: "Sementes sadias + tratamento químico de sementes" },
      { nome: "Stemphylium solani", tipo: "Fungo", impacto: "Moderado", doenca: "Mancha foliar de Stemphylium", orgao: "Folhas", saude: "Não aplicável", controle: "Fungicidas registrados e manejo de restos culturais" },
      { nome: "Meloidogyne incognita", tipo: "Nematoide", impacto: "Alto", doenca: "Nematoide das galhas / interação com Fusarium", orgao: "Raízes", saude: "Não aplicável", controle: "Rotação com gramíneas resistentes; consultar AGROFIT" },
      { nome: "Pratylenchus brachyurus", tipo: "Nematoide", impacto: "Alto", doenca: "Nematoide das lesões radiculares", orgao: "Raízes", saude: "Não aplicável", controle: "Rotação de culturas; consultar AGROFIT" },
      { nome: "Aspergillus spp. / Penicillium spp.", tipo: "Fungo", impacto: "Moderado", doenca: "Deterioração de sementes armazenadas", orgao: "Sementes", saude: "Não aplicável", controle: "Armazenamento com umidade controlada; tratamento de sementes" }
    ],
    solucoes: [
      { nome: "Fungicidas para tratamento de sementes", concentracao: "Conforme bula", solvente: "Água", uso: "Colletotrichum gossypii e Rhizoctonia", validade: "—", ghs: "Específica por produto", alvo: "Algodão · sementes" },
      { nome: "Fungicidas foliares registrados para ramulose", concentracao: "Conforme bula", solvente: "Água", uso: "Controle químico como último recurso", validade: "—", ghs: "Específica por produto", alvo: "Algodão · ramulose" }
    ],
    nota: AGROFIT_NOTA + " A Embrapa Algodão recomenda cultivares resistentes, tratamento de sementes, erradicação/queima de restos culturais e rotação antes do controle químico."
  },

  milho: {
    nome: "Milho",
    fontes: [
      { orgao: "Embrapa Milho e Sorgo", titulo: "Cultivo do Milho — Doenças (cercosporiose, ferrugem polissora, ferrugem tropical, podridões de colmo e espiga)", url: "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/748764/1/Milho-Doencas.pdf" },
      { orgao: "Embrapa Milho e Sorgo", titulo: "Circular Técnica 83 — doenças foliares, grãos ardidos e micotoxinas", url: "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/490415/1/Circ83.pdf" },
      { orgao: "Embrapa", titulo: "Agência de Informação Embrapa — Doenças do milho e manejo por resistência genética", url: "https://www.agencia.cnptia.embrapa.br/gestor/territorio_sisal/arvore/CONT000fckl80cd02wx5eo0a2ndxy5w90bbu.html" }
    ],
    patogenos: [
      { nome: "Cercospora zeae-maydis", tipo: "Fungo", impacto: "Altíssimo", doenca: "Cercosporiose / mancha cinzenta da folha (perdas > 80%)", orgao: "Folhas", saude: "Não aplicável", controle: "Cultivares resistentes + fungicidas registrados; rotação (milho é o único hospedeiro)" },
      { nome: "Puccinia polysora", tipo: "Fungo", impacto: "Alto", doenca: "Ferrugem polissora (danos de até 44,6%)", orgao: "Folhas", saude: "Não aplicável", controle: "Cultivares resistentes + fungicidas registrados" },
      { nome: "Physopella zeae", tipo: "Fungo", impacto: "Alto", doenca: "Ferrugem tropical / ferrugem branca", orgao: "Folhas", saude: "Não aplicável", controle: "Cultivares resistentes; evitar milho contínuo em áreas irrigadas" },
      { nome: "Exserohilum turcicum", tipo: "Fungo", impacto: "Alto", doenca: "Helmintosporiose / mancha foliar", orgao: "Folhas", saude: "Não aplicável", controle: "Cultivares resistentes + fungicidas registrados" },
      { nome: "Fusarium moniliforme / F. subglutinans", tipo: "Fungo", impacto: "Alto", doenca: "Podridão rosada da espiga / grãos ardidos", orgao: "Espigas / grãos", saude: "Não aplicável", controle: "Manejo cultural, colheita no ponto e sementes sadias (micotoxinas)" },
      { nome: "Fusarium graminearum", tipo: "Fungo", impacto: "Alto", doenca: "Podridão branca da espiga / giberela", orgao: "Espigas / colmo", saude: "Não aplicável", controle: "Rotação e incorporação de restos culturais" },
      { nome: "Aspergillus flavus", tipo: "Fungo", impacto: "Alto", doenca: "Grãos ardidos / aflatoxinas", orgao: "Grãos", saude: "Não aplicável", controle: "Controle de umidade de armazenamento e de pragas de espiga" },
      { nome: "Puccinia sorghi", tipo: "Fungo", impacto: "Moderado", doenca: "Ferrugem comum", orgao: "Folhas", saude: "Não aplicável", controle: "Cultivares resistentes" }
    ],
    solucoes: [
      { nome: "Fungicidas foliares registrados", concentracao: "Conforme bula", solvente: "Água", uso: "Cercosporiose e ferrugens no enchimento de grãos", validade: "—", ghs: "Específica por produto", alvo: "Milho · complexo foliar" },
      { nome: "Tratamento de sementes", concentracao: "Conforme bula", solvente: "Água", uso: "Fusarium spp. transmitidos por sementes", validade: "—", ghs: "Específica por produto", alvo: "Milho · sementes" }
    ],
    nota: AGROFIT_NOTA + " A Embrapa prioriza resistência genética (sem custo adicional e sem impacto ambiental) e rotação de culturas."
  },

  cana: {
    nome: "Cana-de-açúcar",
    fontes: [
      { orgao: "Embrapa · Agência de Informação Tecnológica", titulo: "Cana-de-açúcar — Doenças fúngicas (ferrugem, carvão, mancha parda, podridão abacaxi, fusariose)", url: "https://www.agencia.cnptia.embrapa.br/gestor/cana-de-acucar/arvore/CONTAG01_79_22122006154841.html" },
      { orgao: "Instituto Biológico (SP)", titulo: "Principais doenças da cana: ferrugem marrom, ferrugem alaranjada, escaldadura, raquitismo da soqueira e carvão", url: "https://biologico.agricultura.sp.gov.br/uploads/docs/pag/v5_1/dagostini.html" },
      { orgao: "Embrapa (via MF Magazine)", titulo: "Ferrugem marrom (Puccinia melanocephala) e ferrugem alaranjada (Puccinia kuehnii) — redução de até 60%", url: "https://blog.mfrural.com.br/doencas-da-cana-de-acucar/" }
    ],
    patogenos: [
      { nome: "Puccinia melanocephala", tipo: "Fungo", impacto: "Alto", doenca: "Ferrugem marrom (perdas de até 50–60%)", orgao: "Folhas", saude: "Não aplicável", controle: "Variedades resistentes (resistência de planta adulta); fungicidas apenas se registrados" },
      { nome: "Puccinia kuehnii", tipo: "Fungo", impacto: "Altíssimo", doenca: "Ferrugem alaranjada (perdas de até 100% em variedades suscetíveis)", orgao: "Folhas", saude: "Não aplicável", controle: "Substituição de variedade suscetível; consultar AGROFIT" },
      { nome: "Leifsonia xyli subsp. xyli", tipo: "Bactéria", impacto: "Alto", doenca: "Raquitismo da soqueira (perdas de 5 a 30%)", orgao: "Colmo / sistema vascular", saude: "Não aplicável", controle: "Sem controle curativo: mudas sadias e termoterapia" },
      { nome: "Xanthomonas albilineans", tipo: "Bactéria", impacto: "Alto", doenca: "Escaldadura das folhas", orgao: "Folhas / colmos", saude: "Não aplicável", controle: "Mudas certificadas e desinfestação de implementos" },
      { nome: "Sporisorium scitamineum", tipo: "Fungo", impacto: "Alto", doenca: "Carvão da cana-de-açúcar", orgao: "Colmo / brotações", saude: "Não aplicável", controle: "Variedades resistentes e toletes sadios" },
      { nome: "Fusarium spp.", tipo: "Fungo", impacto: "Moderado", doenca: "Fusariose / podridão de toletes", orgao: "Colmo / toletes", saude: "Não aplicável", controle: "Tratamento de toletes e manejo de plantio" },
      { nome: "Cercospora spp.", tipo: "Fungo", impacto: "Moderado", doenca: "Mancha parda", orgao: "Folhas", saude: "Não aplicável", controle: "Variedades resistentes" }
    ],
    solucoes: [
      { nome: "Termoterapia / desinfestação de toletes", concentracao: "Conforme recomendação técnica", solvente: "Água", uso: "Raquitismo da soqueira e Xanthomonas albilineans", validade: "—", ghs: "Não se aplica (método físico)", alvo: "Cana · mudas" },
      { nome: "Fungicidas registrados para ferrugens", concentracao: "Conforme bula", solvente: "Água", uso: "Ferrugem marrom e alaranjada", validade: "—", ghs: "Específica por produto", alvo: "Cana · Puccinia spp." }
    ],
    nota: AGROFIT_NOTA + " Na cana o manejo é predominantemente varietal e de mudas; não há controle químico curativo para doenças sistêmicas bacterianas."
  },

  arroz: {
    nome: "Arroz",
    fontes: [
      { orgao: "Embrapa · Ageitec", titulo: "Arroz de terras altas — Manejo de doenças: brusone (Magnaporthe oryzae), mancha-de-grãos e controle integrado", url: "https://www.embrapa.br/en/web/agencia-de-informacao-tecnologica/cultivos/arroz/producao/sistema-de-cultivo/arroz-de-terras-altas/manejo-de-pragas/manejo-de-doencas" },
      { orgao: "Embrapa · Ater Mais Digital", titulo: "Indicações de uso registradas: brusone (Pyricularia grisea), mancha-parda (Bipolaris oryzae) e ferrugens em arroz irrigado", url: "https://www.atermaisdigital.cnptia.embrapa.br/web/controle-de-pragas/w/maragato-500-ec" }
    ],
    patogenos: [
      { nome: "Magnaporthe oryzae / Pyricularia oryzae", tipo: "Fungo", impacto: "Altíssimo", doenca: "Brusone (folhas, nós e pescoço; até 100% em epidemias)", orgao: "Folhas / nós / panículas", saude: "Não aplicável", controle: "Fungicidas sistêmicos preventivos no emborrachamento e a 5% de panículas + cultivares resistentes" },
      { nome: "Bipolaris oryzae", tipo: "Fungo", impacto: "Alto", doenca: "Mancha-parda / mancha-de-grãos", orgao: "Folhas / grãos", saude: "Não aplicável", controle: "Sementes sadias, adubação equilibrada e fungicidas registrados" },
      { nome: "Microdochium oryzae", tipo: "Fungo", impacto: "Moderado", doenca: "Mancha-de-grãos", orgao: "Grãos / folhas", saude: "Não aplicável", controle: "Tratamento de sementes e manejo de restos culturais" },
      { nome: "Fusarium spp.", tipo: "Fungo", impacto: "Moderado", doenca: "Mancha-de-grãos / podridão de sementes", orgao: "Grãos / sementes", saude: "Não aplicável", controle: "Sementes de boa qualidade fitossanitária" },
      { nome: "Sarocladium oryzae", tipo: "Fungo", impacto: "Moderado", doenca: "Podridão da bainha", orgao: "Bainhas / panículas", saude: "Não aplicável", controle: "Manejo de água e densidade de semeadura" },
      { nome: "Rhynchosporium oryzae", tipo: "Fungo", impacto: "Moderado", doenca: "Mancha-de-grãos / escaldadura", orgao: "Folhas / grãos", saude: "Não aplicável", controle: "Cultivares resistentes e incorporação de restos" }
    ],
    solucoes: [
      { nome: "Fungicidas sistêmicos para brusone", concentracao: "Conforme bula", solvente: "Água", uso: "2 aplicações preventivas (emborrachamento e 5% de panículas)", validade: "—", ghs: "Específica por produto", alvo: "Arroz · brusone da panícula" },
      { nome: "Tratamento de sementes", concentracao: "Conforme bula", solvente: "Água", uso: "Bipolaris, Microdochium e Fusarium", validade: "—", ghs: "Específica por produto", alvo: "Arroz · sementes" },
      { nome: "Controle biológico (isolados BRM 32111 / BRM 32113)", concentracao: "Conforme recomendação", solvente: "Água", uso: "Brusone das folhas e panículas", validade: "—", ghs: "Não classificado (biológico)", alvo: "Arroz · brusone" }
    ],
    nota: AGROFIT_NOTA + " A Embrapa também documenta controle biológico com bactérias BRM 32111/32113, com aumento de 55% de biomassa em ensaios."
  },

  feijao: {
    nome: "Feijão",
    fontes: [
      { orgao: "Embrapa · Ageitec", titulo: "Doenças fúngicas da parte aérea do feijoeiro — antracnose, ferrugem e mancha angular", url: "https://www.embrapa.br/en/agencia-de-informacao-tecnologica/cultivos/feijao/producao/doencas/doencas-fungicas/doencas-fungicas-da-parte-aerea" },
      { orgao: "Embrapa · Agência de Informação Tecnológica", titulo: "Feijão-caupi — tombamento (Pythium / Rhizoctonia) e podridões radiculares", url: "https://www.agencia.cnptia.embrapa.br/gestor/feijao-caupi/arvore/CONTAG01_59_510200683537.html" },
      { orgao: "Embrapa · Ater Mais Digital", titulo: "Registros de uso: antracnose (Colletotrichum lindemuthianum) e ferrugem (Uromyces appendiculatus) em feijão", url: "https://www.atermaisdigital.cnptia.embrapa.br/web/controle-de-pragas/w/maragato-500-ec" }
    ],
    patogenos: [
      { nome: "Colletotrichum lindemuthianum", tipo: "Fungo", impacto: "Altíssimo", doenca: "Antracnose (potencial de perda total)", orgao: "Folhas / caules / vagens / sementes", saude: "Não aplicável", controle: "Sementes certificadas + tratamento com fungicidas + cultivares resistentes" },
      { nome: "Uromyces appendiculatus", tipo: "Fungo", impacto: "Alto", doenca: "Ferrugem do feijoeiro", orgao: "Folhas / vagens / hastes", saude: "Não aplicável", controle: "Cultivares resistentes + fungicidas registrados" },
      { nome: "Pythium spp.", tipo: "Oomiceto", impacto: "Alto", doenca: "Tombamento / damping-off", orgao: "Plântulas / raízes", saude: "Não aplicável", controle: "Manejo da irrigação (evitar encharcamento) + sementes tratadas" },
      { nome: "Rhizoctonia solani", tipo: "Fungo", impacto: "Alto", doenca: "Tombamento / podridão do colo", orgao: "Colo / raízes", saude: "Não aplicável", controle: "Rotação com gramíneas e tratamento de sementes" },
      { nome: "Sclerotium rolfsii", tipo: "Fungo", impacto: "Moderado", doenca: "Murcha / podridão do colo", orgao: "Colo / raízes", saude: "Não aplicável", controle: "Rotação e manejo de restos culturais" },
      { nome: "Pseudocercospora griseola", tipo: "Fungo", impacto: "Moderado", doenca: "Mancha angular", orgao: "Folhas / vagens", saude: "Não aplicável", controle: "Cultivares resistentes e fungicidas registrados" },
      { nome: "Fusarium oxysporum f. sp. phaseoli", tipo: "Fungo", impacto: "Alto", doenca: "Murcha de Fusarium", orgao: "Xilema / raízes", saude: "Não aplicável", controle: "Cultivares resistentes e rotação de culturas" }
    ],
    solucoes: [
      { nome: "Fungicidas para tratamento de sementes", concentracao: "Conforme bula", solvente: "Água", uso: "Antracnose e tombamento", validade: "—", ghs: "Específica por produto", alvo: "Feijão · sementes" },
      { nome: "Fungicidas foliares registrados", concentracao: "Conforme bula", solvente: "Água", uso: "Ferrugem e mancha angular", validade: "—", ghs: "Específica por produto", alvo: "Feijão · Uromyces / Pseudocercospora" }
    ],
    nota: AGROFIT_NOTA + " A Embrapa alerta que a maioria das cultivares comerciais já tem resistência à ferrugem e que o excesso de umidade favorece antracnose e tombamento."
  },

  hortalicas: {
    nome: "Hortaliças",
    fontes: [
      { orgao: "Embrapa Hortaliças", titulo: "Doenças do tomateiro em ambiente protegido — tombamento (Pythium, Phytophthora, Rhizoctonia) e requeima", url: "https://www.infoteca.cnptia.embrapa.br/bitstream/doc/916721/1/ct100.pdf" },
      { orgao: "Embrapa Hortaliças", titulo: "Doenças da berinjela no Brasil — damping-off, Phytophthora capsici e P. nicotianae", url: "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/916695/1/CT97.pdf" },
      { orgao: "Embrapa Hortaliças", titulo: "Doenças do coentro no Brasil — tombamento, Alternaria dauci e queima de folhas", url: "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1066501/1/CT157.pdf" }
    ],
    patogenos: [
      { nome: "Pythium spp.", tipo: "Oomiceto", impacto: "Altíssimo", doenca: "Podridão-de-colo / tombamento de mudas", orgao: "Colo / raízes / plântulas", saude: "Não aplicável", controle: "Substrato esterilizado, água de irrigação não contaminada e drenagem" },
      { nome: "Rhizoctonia solani", tipo: "Fungo", impacto: "Altíssimo", doenca: "Tombamento / damping-off / mofo branco no colo", orgao: "Colo / raízes", saude: "Não aplicável", controle: "Bandejas esterilizadas e rotação com gramíneas" },
      { nome: "Phytophthora infestans", tipo: "Oomiceto", impacto: "Altíssimo", doenca: "Requeima / mela do tomateiro", orgao: "Folhas / caules / frutos", saude: "Não aplicável", controle: "Fungicidas registrados + reduzir umidade foliar" },
      { nome: "Phytophthora capsici", tipo: "Oomiceto", impacto: "Alto", doenca: "Murcha, requeima e podridão de fruto", orgao: "Raízes / caules / frutos", saude: "Não aplicável", controle: "Drenagem, rotação e fungicidas registrados" },
      { nome: "Phytophthora nicotianae", tipo: "Oomiceto", impacto: "Alto", doenca: "Murcha e podridão de fruto", orgao: "Raízes / frutos", saude: "Não aplicável", controle: "Mudas sadias e manejo de irrigação" },
      { nome: "Sclerotinia sclerotiorum", tipo: "Fungo", impacto: "Alto", doenca: "Mofo-branco / podridão de caule", orgao: "Caule / folhas", saude: "Não aplicável", controle: "Rotação com gramíneas e ventilação" },
      { nome: "Alternaria dauci", tipo: "Fungo", impacto: "Moderado", doenca: "Queima de folhas / tombamento de mudas", orgao: "Folhas / sementes", saude: "Não aplicável", controle: "Sementes sadias; Embrapa nota que não há fungicidas registrados para coentro" },
      { nome: "Sclerotium rolfsii", tipo: "Fungo", impacto: "Moderado", doenca: "Murcha por escleródios no solo", orgao: "Colo / raízes", saude: "Não aplicável", controle: "Rotação e correção da irrigação" }
    ],
    solucoes: [
      { nome: "Desinfestação de substrato e bandejas", concentracao: "Conforme recomendação técnica", solvente: "Água", uso: "Prevenção de Pythium e Rhizoctonia em mudas", validade: "—", ghs: "Específica por produto", alvo: "Hortaliças · viveiro" },
      { nome: "Fungicidas registrados para requeima", concentracao: "Conforme bula", solvente: "Água", uso: "Phytophthora infestans em solanáceas", validade: "—", ghs: "Específica por produto", alvo: "Hortaliças · tomate" },
      { nome: "Cloração da água de irrigação", concentracao: "Cloro residual livre 0,2–5 mg/L", solvente: "Água", uso: "Prevenção de patógenos veiculados pela água", validade: "—", ghs: "Específica por produto", alvo: "Hortaliças · água" }
    ],
    nota: AGROFIT_NOTA + " A Embrapa Hortaliças relaciona essas doenças diretamente à má qualidade da água de irrigação — o ponto que o sensor monitora. Para coentro, a Circular Técnica 157 informa que não existem fungicidas registrados."
  },

  outra: {
    nome: "Outra cultura",
    fontes: [
      { orgao: "Ministério da Saúde · Portaria GM/MS 888/2021", titulo: "Padrão de potabilidade da água para consumo humano", url: "https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html" },
      { orgao: "CONAMA · Resolução 357/2005", titulo: "Águas doces classe 3 — irrigação de culturas arbóreas, cerealíferas e forrageiras", url: "https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450" },
      { orgao: "EPPO", titulo: "EPPO Global Database — consulta de patógenos por planta-hospedeiro", url: "https://gd.eppo.int/" },
      { orgao: "CABI", titulo: "Crop Protection Compendium — busca de pragas por cultura", url: "https://www.cabi.org/Uploads/CABI/publishing/promotional-materials/insert/Cp%20Compendium%20A4%20Insert.pdf" }
    ],
    patogenos: [
      { nome: "Consulta por hospedeiro (EPPO / CABI)", tipo: "Referência", impacto: "Água", doenca: "Para culturas não listadas, identifique os patógenos no EPPO Global Database e no CABI CPC", orgao: "—", saude: "Não aplicável", controle: "Consulte também o AGROFIT filtrando pela cultura e pelo alvo" }
    ],
    solucoes: [],
    nota: "Para culturas fora da lista, o catálogo exibe os patógenos de veiculação hídrica e as soluções de tratamento de água, que são universais. " + AGROFIT_NOTA
  }
};

/* ------------------------------------------------------------------ */
/* Acessores usados pelos catálogos                                    */
/* ------------------------------------------------------------------ */
function normalizarCultura(chave) {
  const c = String(chave || "").trim().toLowerCase();
  return PESQUISA_CULTURAS[c] ? c : "soja";
}

function obterPesquisaCultura(chave) {
  return PESQUISA_CULTURAS[normalizarCultura(chave)];
}

function patogenosDaCultura(chave) {
  const p = obterPesquisaCultura(chave);
  return (p.patogenos || []).concat(PATOGENOS_AGUA);
}

function solucoesDaCultura(chave) {
  const p = obterPesquisaCultura(chave);
  return (p.solucoes || []).concat(SOLUCOES_AGUA);
}

function fontesDaCultura(chave) {
  const p = obterPesquisaCultura(chave);
  return (p.fontes || []).concat(FONTES_GERAIS);
}

/* ------------------------------------------------------------------ */
/* Bloco "Fontes das pesquisas" ao final de cada catálogo              */
/* ------------------------------------------------------------------ */
function _esc(txt) {
  return String(txt == null ? "" : txt)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function _htmlFontes(chave) {
  const p = obterPesquisaCultura(chave);
  const fontes = fontesDaCultura(chave);
  const itens = fontes.map(f => `
      <li class="py-2 border-b border-white/5 last:border-0">
        <span class="text-cyan-300 font-semibold">${_esc(f.orgao)}</span> —
        <span class="text-slate-300">${_esc(f.titulo)}</span><br>
        <a href="${_esc(f.url)}" target="_blank" rel="noopener noreferrer"
           class="text-xs text-slate-400 hover:text-cyan-300 break-all underline decoration-white/20">${_esc(f.url)}</a>
      </li>`).join("");

  const opcoes = Object.keys(PESQUISA_CULTURAS).map(k =>
    `<option value="${_esc(k)}" ${k === normalizarCultura(chave) ? "selected" : ""}>${_esc(PESQUISA_CULTURAS[k].nome)}</option>`
  ).join("");

  return `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <h3 class="text-lg font-bold flex items-center gap-2">
        <i data-lucide="book-open" class="w-5 h-5 text-cyan-400"></i>
        Fontes das pesquisas · ${_esc(p.nome)}
      </h3>
      <label class="text-xs text-slate-400 flex items-center gap-2">
        Ver fontes de outra cultura:
        <select data-fontes-cultura class="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs">
          ${opcoes}
        </select>
      </label>
    </div>
    <p class="text-xs text-slate-500 mb-4">
      Banco de dados desta conta: <strong class="text-slate-300">${_esc(p.nome)}</strong> ·
      ${fontes.length} fontes · acessadas em ${DATA_PESQUISA}.
      Todos os links abrem as publicações oficiais originais.
    </p>
    <ul class="text-sm leading-relaxed">${itens}</ul>
    <div class="mt-5 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-400 leading-relaxed">
      <strong class="text-amber-300">Nota metodológica.</strong>
      Os níveis "Alto / Moderado / Baixo" são uma leitura qualitativa das descrições de severidade e perdas das publicações da Embrapa e do Fundecitrus —
      <strong>não</strong> são classificação oficial do MAPA. BSL e classes de risco do Ministério da Saúde, da NR-32 e da OMS
      aplicam-se apenas a agentes que adoecem humanos e animais; por isso fitopatógenos aparecem como "Não aplicável".
      A classificação toxicológica GHS (Anvisa RDC 294/2019) é definida por produto formulado, não por ingrediente ativo:
      consulte sempre o rótulo/bula e o AGROFIT. Nenhuma dose ou marca é recomendada por este catálogo;
      diagnóstico e aplicação exigem responsável técnico.
      ${p.nota ? "<br><br>" + _esc(p.nota) : ""}
    </div>`;
}

/**
 * Renderiza (ou atualiza) o bloco de fontes.
 * @param {string} chaveCultura cultura a destacar; se omitida, usa a da conta logada.
 * @param {string} seletor      seletor do container (padrão: [data-fontes]).
 */
async function renderFontesCultura(chaveCultura, seletor) {
  const alvo = document.querySelector(seletor || "[data-fontes]");
  if (!alvo) return;
  let chave = chaveCultura;
  if (!chave) {
    try {
      chave = window.ACQUASAFE_CULTURA || (typeof obterLavouraDoUsuario === "function" ? await obterLavouraDoUsuario() : null);
    } catch (_) { chave = null; }
  }
  chave = normalizarCultura(chave || "soja");
  alvo.innerHTML = _htmlFontes(chave);
  if (window.lucide) { try { lucide.createIcons(); } catch (_) {} }
  const sel = alvo.querySelector("[data-fontes-cultura]");
  if (sel) {
    sel.addEventListener("change", () => renderFontesCultura(sel.value, seletor));
  }
}

/* Auto-inicialização: basta incluir <div data-fontes></div> na página. */
if (typeof document !== "undefined") {
  const iniciar = () => {
    document.querySelectorAll("[data-fontes]").forEach(el => {
      const sel = "#" + (el.id || "");
      renderFontesCultura(null, el.id ? sel : "[data-fontes]").catch(() => {});
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
}
