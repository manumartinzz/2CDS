/*
  pesquisa-culturas.js — AcquaSafe
  ------------------------------------------------------------------
  Catalogo tecnico por tipo de lavoura: DOENCAS, SOLUCOES (1:1),
  fontes oficiais e curiosidades da cultura da conta.

  REGRA ATUAL (06/11/2026): so entram doencas cuja CONTAMINACAO DA
  LAVOURA PELA AGUA esteja documentada — agua de irrigacao contaminada,
  enxurrada/escoamento, respingos de chuva ou irrigacao, zoosporos moveis
  em agua livre, agua que transporta propagulos, esclerocios ou nematoides.
  Doencas de dispersao exclusivamente aerea (ferrugens, oidios), por
  vetores (HLB/psilideo, viroses) ou por mudas/implementos foram REMOVIDAS
  e estao listadas em DOENCAS_EXCLUIDAS com a justificativa e a fonte.

  Para CADA doenca existe EXATAMENTE UMA solucao, cujo nome comeca com o
  nome da doenca tratada. A funcao validarCatalogo() garante a regra 1:1
  e e executada pelos testes automatizados do projeto.

  Cuidados tecnicos mantidos:
   * BSL / classes de risco do MS, NR-32 e OMS classificam agentes que
     adoecem HUMANOS E ANIMAIS; fitopatogenos nao recebem BSL.
   * A classificacao toxicologica GHS (Anvisa RDC 294/2019) e definida
     POR PRODUTO FORMULADO; nao ha doses nem marcas neste catalogo.
   * Nenhum arquivo .css e necessario: apenas utilitarios Tailwind e
     estilos inline minimos.
*/

const DATA_PESQUISA = "06/11/2026";

/* Conta de teste com pHmetro ligado direto ao grafico (sem pagina extra).
   Apenas o E-MAIL e usado como chave: nenhuma senha e armazenada aqui. */
const CONTA_PH_DIRETO = "manucordeiro326@gmail.com";
function ehContaPhDireto(email) {
  return String(email == null ? "" : email).trim().toLowerCase() === CONTA_PH_DIRETO;
}

const AGROFIT_NOTA = "Classes de ingredientes ativos, nao marcas nem doses. Consulte o AGROFIT por cultura + alvo antes de aplicar; o registro e dinamico e exige responsavel tecnico.";

/* Todas as fontes, indexadas por chave. */
const FONTE = {
  "port888": {
    "orgao": "Ministério da Saúde · Portaria GM/MS 888/2021",
    "titulo": "Padrão de potabilidade: pH 6,0–9,5; cloro residual livre ≥ 0,2 mg/L e VMP 5 mg/L; turbidez ≤ 5 uT; ausência de E. coli em 100 mL",
    "url": "https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html"
  },
  "conama357": {
    "orgao": "CONAMA · Resolução 357/2005",
    "titulo": "Classe 3 destinada à irrigação de culturas arbóreas, cerealíferas e forrageiras (pH 6,0–9,0; coliformes termotolerantes)",
    "url": "https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450"
  },
  "agrofit": {
    "orgao": "MAPA · AGROFIT",
    "titulo": "Agrotóxicos registrados no AGROFIT (cadastro oficial por cultura, alvo, ingrediente ativo e classificação toxicológica)",
    "url": "https://www.gov.br/agricultura/pt-br/acesso-a-informacao/acoes-e-programas/cartas-de-servico/defesa-agropecuaria-agrotoxicos/agrotoxicos-registrados-no-agrofit"
  },
  "agrofitNota": {
    "orgao": "MAPA",
    "titulo": "Agrofit agora é o sistema oficial de cadastro de agroquímicos",
    "url": "https://www.gov.br/agricultura/pt-br/assuntos/noticias/2022/agrofit-agora-e-o-sistema-oficial-de-cadastro-de-agroquimicos"
  },
  "agrofitPdf": {
    "orgao": "Embrapa · AgroAPI",
    "titulo": "Documentação da API AGROFIT (culturas, alvos e classificações toxicológica/ambiental)",
    "url": "https://www.agroapi.cnptia.embrapa.br/portal/assets/docs/agrofit.pdf"
  },
  "anvisaGHS": {
    "orgao": "Anvisa · RDC 294/2019",
    "titulo": "Novo marco regulatório: classificação toxicológica pelo GHS (categorias 1 a 5 e Não Classificado)",
    "url": "https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2019/anvisa-aprova-novo-marco-regulatorio-para-agrotoxicos"
  },
  "anvisaReclass": {
    "orgao": "Anvisa",
    "titulo": "Reclassificação toxicológica dos agrotóxicos (1.942 produtos avaliados)",
    "url": "https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2019/publicada-reclassificacao-toxicologica-de-agrotoxicos"
  },
  "anvisaMono": {
    "orgao": "Anvisa · Monografias",
    "titulo": "Monografia A29: a classificação toxicológica é específica para cada produto, conforme art. 38 da RDC 294/2019",
    "url": "https://www.gov.br/anvisa/pt-br/setorregulado/regularizacao/agrotoxicos/monografias/monografias-autorizadas/a/4150json-file-1/@@display-file/file"
  },
  "ms3398": {
    "orgao": "Ministério da Saúde · Portaria GM/MS 3.398/2021",
    "titulo": "Lista de Classificação de Risco dos Agentes Biológicos (classes 1 a 4)",
    "url": "https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt3398_29_12_2021.html"
  },
  "ms2349": {
    "orgao": "Ministério da Saúde · Portaria GM/MS 2.349/2017",
    "titulo": "Aprova a Classificação de Risco dos Agentes Biológicos",
    "url": "https://bvsms.saude.gov.br/bvs/saudelegis/gm/2017/prt2349_22_09_2017.html"
  },
  "msClass": {
    "orgao": "Ministério da Saúde",
    "titulo": "Classificação de Risco dos Agentes Biológicos — 3ª edição",
    "url": "https://bvsms.saude.gov.br/bvs/publicacoes/classificacao_risco_agentes_biologicos_3ed.pdf"
  },
  "nr32": {
    "orgao": "MTE · NR-32",
    "titulo": "Anexo I (classes de risco 1 a 4) e Anexo II (tabela de agentes)",
    "url": "https://fiocruz.br/biosseguranca/Bis/manuais/legislacao/NR-32.pdf"
  },
  "who": {
    "orgao": "OMS / WHO",
    "titulo": "Laboratory Biosafety Manual, 4ª edição (2020) — abordagem baseada em avaliação de risco",
    "url": "https://www.who.int/publications/i/item/9789240011311"
  },
  "mapaPQA": {
    "orgao": "MAPA · Defesa Vegetal",
    "titulo": "Listas de Pragas Quarentenárias Ausentes (PQA) e Presentes (PQP) e Análise de Risco de Pragas",
    "url": "https://www.gov.br/agricultura/pt-br/assuntos/noticias/mapa-disponibiliza-listagem-atualizada-de-pragas-quarentenarias"
  },
  "eppo": {
    "orgao": "EPPO",
    "titulo": "EPPO Global Database — nomes científicos, sinonímia, plantas-hospedeiro e distribuição",
    "url": "https://gd.eppo.int/"
  },
  "cabi": {
    "orgao": "CABI",
    "titulo": "Crop Protection Compendium — datasheets sobre pragas, doenças e hospedeiros",
    "url": "https://www.cabi.org/Uploads/CABI/publishing/promotional-materials/insert/Cp%20Compendium%20A4%20Insert.pdf"
  },
  "hong2005": {
    "orgao": "Hong & Moorman (2005) · revisão",
    "titulo": "Plant Pathogens in Irrigation Water: Challenges and Opportunities — 17 Phytophthora, 26 Pythium, 27 gêneros de fungos, 8 bactérias, 10 vírus e 13 nematoides detectados em água de irrigação",
    "url": "https://www.researchgate.net/publication/240518240_Plant_Pathogens_in_Irrigation_Water_Challenges_and_Opportunities"
  },
  "unb": {
    "orgao": "UnB · dissertação (2014)",
    "titulo": "Pythium/Phytophthora em água de irrigação: zoósporos móveis nadam em filmes de água; Freitas et al. isolaram Pythium, Phytophthora, Rhizoctonia e Fusarium de reservatório no DF",
    "url": "https://repositorio.unb.br/bitstream/10482/18110/1/2014_EleniceAlvesBarboza.pdf"
  },
  "embrapaFeijaoSolo": {
    "orgao": "Embrapa · Ageitec (Feijão)",
    "titulo": "Doenças fúngicas do solo — \"A água de irrigação também pode transportar propágulos desses patógenos\" (Fusarium, Rhizoctonia, Macrophomina, Sclerotinia)",
    "url": "https://www.embrapa.br/en/web/agencia-de-informacao-tecnologica/cultivos/feijao/producao/doencas/doencas-fungicas/doencas-fungicas-do-solo"
  },
  "embrapaNematoides": {
    "orgao": "Embrapa · Frutas do Brasil (Melão)",
    "titulo": "Doenças causadas por nematoides — \"O movimento de nematóides a longas distâncias só ocorre por meio da água de irrigações\"",
    "url": "https://www.infoteca.cnptia.embrapa.br/bitstream/doc/131681/1/DOENCASCAUSADASPORNEMATOIDESTECNOLOGIANOMANEJODECONTROLE.pdf"
  },
  "embrapaCot27": {
    "orgao": "Embrapa Hortaliças · COT 27",
    "titulo": "Metodologia para seleção de hortaliças com resistência a nematoides: disseminação por água de irrigação contaminada",
    "url": "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/779126/1/cot27.pdf"
  },
  "embrapaHortalicas100": {
    "orgao": "Embrapa Hortaliças · CT 100",
    "titulo": "Qualidade da água de irrigação e disseminação de patógenos em hortaliças",
    "url": "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/916721/1/ct100.pdf"
  },
  "embrapaCt12": {
    "orgao": "Embrapa · CT 12",
    "titulo": "\"A disseminação do patógeno se dá por respingos de chuva ou de água de irrigação\" (antracnose)",
    "url": "https://www.infoteca.cnptia.embrapa.br/bitstream/doc/425112/1/ct12.pdf"
  },
  "eppoXanthomonas": {
    "orgao": "EPPO Global Database",
    "titulo": "Xanthomonas euvesicatoria pv. perforans — \"short-distance dispersal is then facilitated by splashing water, such as irrigation or rain\"",
    "url": "https://gd.eppo.int/taxon/XANTPF/datasheet"
  },
  "bugwoodXanthomonas": {
    "orgao": "Bugwood / APS",
    "titulo": "Xanthomonas spp. — \"bacteria are transferred to new plant tissues by splashing rain and irrigation water splash\"",
    "url": "https://wiki.bugwood.org/Xanthomonas_species_(Bacterial_leaf_spot_on_ornamentals)"
  },
  "capsXoo": {
    "orgao": "USDA/CAPS · pest datasheet",
    "titulo": "Xanthomonas oryzae pv. oryzae: \"The bacterium can be disseminated by irrigation water, by splashing or windblown rain\"",
    "url": "https://caps.ceris.purdue.edu/wp-content/uploads/2025/07/Xanthomonas-oryzae-pv-oryzae-2016.pdf"
  },
  "mapaXoo": {
    "orgao": "MAPA/Embrapa · Pragas Priorizadas (cap. 22)",
    "titulo": "Xoo: \"a água de irrigação é considerada a forma mais comum de disseminação da doença em grandes áreas\"",
    "url": "https://ainfo.cnptia.embrapa.br/digital/bitstream/item/198801/1/Livro-PragasPriorizadas-1ed-2018-Ainfo-ver-final-1-352-373.pdf"
  },
  "embrapaXoo": {
    "orgao": "Embrapa/MAPA · ARP Xoo",
    "titulo": "\"Sementes infectadas, água de irrigação ou de chuvas ... são considerados importantes dispersores da bactéria\"",
    "url": "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1112311/1/DOC36514.pdf"
  },
  "embrapaArrozDoencas": {
    "orgao": "Embrapa · Arroz irrigado (manejo de doenças)",
    "titulo": "\"É disseminado rapidamente pela água de irrigação\"; esclerócios de Rhizoctonia oryzae \"flutuam na água, acumulam-se ao redor da planta\"",
    "url": "https://www.embrapa.br/en/web/agencia-de-informacao-tecnologica/cultivos/arroz/producao/sistema-de-cultivo/arroz-irrigado-na-regiao-tropical/manejo-de-pragas/manejo-de-doencas"
  },
  "embrapaPhytophthora": {
    "orgao": "Embrapa Trigo · CTO 35",
    "titulo": "Avaliação de resistência à podridão-radicular de Phytophthora em soja: zoósporos \"nadam curtas distâncias ou são levados por corrente de água\"",
    "url": "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1096564/1/ID443652018CTO35.pdf"
  },
  "iharaPhytophthora": {
    "orgao": "Ficha técnica · P. sojae (Embrapa Trigo, Doc. 79)",
    "titulo": "\"A doença é favorecida por água livre no solo ... liberação dos zoósporos, que são flagelados\"",
    "url": "https://ihara.com.br/wp-content/uploads/sites/54/2023/03/ficha-tecnica-podridao-radicular-ihara.pdf"
  },
  "mapaFusarium": {
    "orgao": "MAPA · Plano de Contingência Foc R4T",
    "titulo": "\"Dispersão através da água\": F. oxysporum dispersa-se eficientemente pela água de irrigação ou escoamento de chuvas",
    "url": "https://www.gov.br/agricultura/pt-br/assuntos/sanidade-animal-e-vegetal/sanidade-vegetal/planos-de-contingencia-pragas-ausentes/fusarium-oxysporum-livro-pragaspriorizadas_1ed-2018-243-258.pdf"
  },
  "embrapaFusariumCaupi": {
    "orgao": "Embrapa · Ageitec (Feijão-caupi)",
    "titulo": "\"A disseminação da doença é feita pelas práticas culturais, água de irrigação, vento e sementes infectadas\"; murcha-de-fusário disseminada pela água de irrigação",
    "url": "https://www.agencia.cnptia.embrapa.br/gestor/feijao-caupi/arvore/CONTAG01_59_510200683537.html"
  },
  "apsSclerotinia": {
    "orgao": "APS · White mold (Português)",
    "titulo": "Sclerotinia sclerotiorum: \"a germinação nas folhas só ocorre na presença de água livre, como chuva, irrigação por aspersão e orvalho\"",
    "url": "https://www.apsnet.org/edcenter/pdlessons/Pages/WhiteMoldPortuguese.aspx"
  },
  "nebraskaIrrigacao": {
    "orgao": "Univ. Nebraska · Water Resources Bulletin (1975)",
    "titulo": "Pollution of Surface Irrigation Waters by Plant Pathogenic Organisms: Xanthomonas phaseoli, Sclerotinia sclerotiorum e nematoides em água de irrigação",
    "url": "https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1303&context=plantpathpapers"
  },
  "fundecitrusCancro": {
    "orgao": "Fundecitrus",
    "titulo": "Cancro cítrico: \"o fator ambiental mais importante nessa fase é a água, que serve como veículo de transporte da bactéria\"",
    "url": "https://www.fundecitrus.com.br/pragas-e-doencas/cancro-citrico/"
  },
  "incaperCafe": {
    "orgao": "Incaper · Livro Café Conilon (cap. 17)",
    "titulo": "Cercosporiose, antracnose, bacteriose e nematoides do cafeeiro: disseminação por respingos de água da chuva/irrigação por aspersão e enxurradas",
    "url": "https://biblioteca.incaper.es.gov.br/digital/bitstream/item/710/1/livro2007cafeconilon17.pdf"
  },
  "scieloGiberela": {
    "orgao": "SciELO · Fitopatologia Brasileira",
    "titulo": "Giberela do trigo: \"macroconídios ... liberados e dispersos pela ação da chuva\"; dispersão por respingos",
    "url": "http://www.scielo.br/j/fb/a/WHmhpn6NbZJDn49RvBqjQ7D/?lang=pt"
  },
  "apsFusarium": {
    "orgao": "APS · Fusarium head blight (Português)",
    "titulo": "F. graminearum: \"macroconídios ... disseminados para as plantas por meio de respingos de chuva\"",
    "url": "https://www.apsnet.org/edcenter/pdlessons/Pages/FusariumPort.aspx"
  },
  "geaGiberela": {
    "orgao": "GEA / ESALQ-USP",
    "titulo": "Giberela e brusone no trigo: \"A dispersão em curtas distâncias é realizada por conídios com respingos de chuva\"",
    "url": "https://www.gea-esalq.com/informativo-gea-giberela-e-brusone-no-trigo"
  },
  "embrapaMilho": {
    "orgao": "Embrapa · Agência de Informação (Milho)",
    "titulo": "Cercosporiose, mancha de Diplodia e antracnose: \"disseminação ocorre através de esporos e restos de cultura levados pelo vento e respingos de chuva\"",
    "url": "https://www.agencia.cnptia.embrapa.br/gestor/territorio_sisal/arvore/CONT000fckl80cd02wx5eo0a2ndxy5w90bbu.html"
  },
  "embrapaCt16": {
    "orgao": "Embrapa · CT 16",
    "titulo": "Mancha por Cercospora no milho: \"A disseminação desse patógeno ocorre pelo vento e por respingos de chuva\"",
    "url": "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/484065/1/ct16.pdf"
  },
  "algodaoRamulose": {
    "orgao": "Embrapa / Campo & Negócios",
    "titulo": "Ramulose do algodoeiro: \"a disseminação dos esporos do fungo a curtas distâncias ocorre por meio de respingos da água das chuvas ou irrigação\"",
    "url": "https://campoenegocios.com/cenario-brasileiro-sobre-as-doencas-do-algodoeiro/"
  },
  "algodaoUfu": {
    "orgao": "UFU · Doenças fúngicas (Algodão, Feijão, Soja)",
    "titulo": "\"Os conídios do fungo são dispersos principalmente pelos respingos de chuva e água de irrigação\"; Fusarium por partículas de solo arrastadas pela água",
    "url": "https://www.portalselecao.ufu.br/sisarq/ArquivoAdministrativos/download/3f8dcd6ba8c3eafe3d3d0dce39c0460b"
  },
  "algodaoUnoeste": {
    "orgao": "UNOESTE · Manual de bolso (Algodoeiro)",
    "titulo": "Ramulose: \"Disseminação: pela água, pelo vento ...\"; ferrugem do algodoeiro \"pelo vento\" (excluída)",
    "url": "http://sites.unoeste.br/gea/wp-content/uploads/2018/11/Manual-de-bolso-Identifica%C3%A7%C3%A3o-das-doen%C3%A7as-do-algodoeiro.pdf"
  },
  "embrapaFeijaoAntracnose": {
    "orgao": "Embrapa Arroz e Feijão · Boletim de P&D 1",
    "titulo": "\"A disseminação a curta distância ... é realizada por meio dos respingos da água de chuva ou da irrigação por aspersão\"",
    "url": "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/211439/1/bolpesq1.pdf"
  },
  "embrapaSojaBacterioses": {
    "orgao": "Embrapa Soja · SP 17",
    "titulo": "\"A disseminação ocorre pelo contato entre folhas doentes e sadias na presença de água da chuva ou de orvalho ou de irrigação\"",
    "url": "https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1128404/1/p.-227-264-de-SP-17-2-020-online.pdf"
  },
  "embrapaFerrugem": {
    "orgao": "Portal Embrapa",
    "titulo": "Vazio sanitário: \"o fungo se dissemina a longas distâncias pelo vento\" (Phakopsora pachyrhizi)",
    "url": "https://www.embrapa.br/en/busca-de-noticias/-/noticia/13556333/vazio-sanitario-e-medida-importante-contra-ferrugem-asiatica"
  },
  "aeaseFerrugem": {
    "orgao": "AEASE · Agressividade da ferrugem asiática",
    "titulo": "\"A disseminação da ferrugem ocorre unicamente através da dispersão dos uredosporos pelo vento\" (até 96 km/semana)",
    "url": "https://www.aease.org.br/agressividade-da-ferrugem-asiatica/"
  },
  "fundecitrusHLB": {
    "orgao": "Fundecitrus · HLB / Greening",
    "titulo": "\"Não é disseminada por sementes, vento, água ou qualquer instrumento agrícola\" — apenas psilídeo e enxertia; CLas em >99% das plantas doentes",
    "url": "https://ww2.fundecitrus.com.br/doencas/greening"
  },
  "embrapaCanaFerrugem": {
    "orgao": "Instituto Biológico / Embrapa (cana)",
    "titulo": "Ferrugem marrom detectada no Brasil em 1986; ferrugem alaranjada confirmada em 2009 — disseminação pelo vento, excluída do catálogo hídrico",
    "url": "https://biologico.agricultura.sp.gov.br/uploads/docs/pag/v5_1/dagostini.html"
  }
};

/* Fontes comuns a TODAS as culturas e aos tres catalogos. */
const FONTES_GERAIS = ["port888", "conama357", "hong2005", "unb", "embrapaFeijaoSolo", "embrapaNematoides", "eppoXanthomonas", "apsSclerotinia", "mapaFusarium", "agrofit", "agrofitNota", "agrofitPdf", "anvisaGHS", "anvisaReclass", "anvisaMono", "ms3398", "ms2349", "msClass", "nr32", "who", "mapaPQA", "eppo", "cabi", "embrapaFerrugem", "aeaseFerrugem", "fundecitrusHLB"].map(k => FONTE[k]);

/* Doencas removidas pelo criterio de via hidrica (transparencia). */
const DOENCAS_EXCLUIDAS = [
  {
    "nome": "Ferrugem-asiática da soja (Phakopsora pachyrhizi)",
    "motivo": "disseminação unicamente pelo vento (uredósporos)",
    "url": "https://www.aease.org.br/agressividade-da-ferrugem-asiatica/"
  },
  {
    "nome": "Ferrugens (Puccinia spp., Hemileia vastatrix, Phakopsora gossypii)",
    "motivo": "esporos transportados pelo ar; sem via hídrica documentada",
    "url": "http://sites.unoeste.br/gea/wp-content/uploads/2018/11/Manual-de-bolso-Identifica%C3%A7%C3%A3o-das-doen%C3%A7as-do-algodoeiro.pdf"
  },
  {
    "nome": "HLB / Greening dos citros (Candidatus Liberibacter asiaticus)",
    "motivo": "o Fundecitrus afirma explicitamente que não é disseminado por água — só psilídeo e enxertia",
    "url": "https://ww2.fundecitrus.com.br/doencas/greening"
  },
  {
    "nome": "Vírus de soja (AMV, BPMV, SMV, CPMMV, TSV) e mosaico-dourado do feijão",
    "motivo": "sementes e insetos-vetores, não água",
    "url": "https://gd.eppo.int/"
  },
  {
    "nome": "Oídios (Microsphaera diffusa, Oidium spp.) e raquitismo-da-soqueira (Leifsonia xyli)",
    "motivo": "disseminação aérea, mudas e implementos; sem via hídrica documentada",
    "url": "https://www.cabi.org/Uploads/CABI/publishing/promotional-materials/insert/Cp%20Compendium%20A4%20Insert.pdf"
  }
];

/* Patogenos de veiculacao hidrica: valem para TODAS as culturas. */
const PATOGENOS_AGUA = [
  {
    "nome": "Escherichia coli (cepas patogênicas)",
    "tipo": "Bactéria",
    "impacto": "Água",
    "doenca": "Infecções intestinais / indicador de contaminação fecal",
    "orgao": "Trato gastrointestinal",
    "saude": "Classe 2 (MS)",
    "controle": "Desinfecção com cloro; Portaria 888/2021 exige ausência em 100 mL",
    "tratamento": "cloração da água de irrigação",
    "via": "Água de irrigação contaminada (via fecal)",
    "fonte": "Ministério da Saúde · Portaria GM/MS 888/2021",
    "url": "https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html",
    "concentracao": "Cloro residual livre ≥ 0,2 mg/L (VMP 5 mg/L)"
  },
  {
    "nome": "Coliformes termotolerantes",
    "tipo": "Bactéria",
    "impacto": "Água",
    "doenca": "Indicador de contaminação fecal da água de irrigação",
    "orgao": "Água",
    "saude": "Classe 2 (MS)",
    "controle": "CONAMA 357/2005 classe 3: 2.500/100 mL em 80% das amostras",
    "tratamento": "filtração + cloração e monitoramento",
    "via": "Água de irrigação / escoamento superficial",
    "fonte": "CONAMA · Resolução 357/2005",
    "url": "https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450",
    "concentracao": "Classe 3: ≤ 2.500/100 mL"
  },
  {
    "nome": "Vibrio cholerae",
    "tipo": "Bactéria",
    "impacto": "Água",
    "doenca": "Cólera",
    "orgao": "Intestino delgado",
    "saude": "Classe 2 (MS)",
    "controle": "Cloração e vigilância sanitária da água",
    "tratamento": "cloração e controle da captação",
    "via": "Água contaminada",
    "fonte": "Ministério da Saúde · Portaria GM/MS 888/2021",
    "url": "https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html",
    "concentracao": "Cloro residual livre ≥ 0,2 mg/L"
  },
  {
    "nome": "Leptospira interrogans",
    "tipo": "Bactéria",
    "impacto": "Água",
    "doenca": "Leptospirose",
    "orgao": "Rins / fígado / pulmões",
    "saude": "Classe 2 (MS)",
    "controle": "Desinfecção e controle de roedores",
    "tratamento": "desinfecção da água e controle de roedores",
    "via": "Água contaminada / enxurrada",
    "fonte": "Ministério da Saúde · Portaria GM/MS 888/2021",
    "url": "https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html",
    "concentracao": "Cloro residual livre ≥ 0,2 mg/L"
  },
  {
    "nome": "Salmonella spp.",
    "tipo": "Bactéria",
    "impacto": "Água",
    "doenca": "Salmonelose / febre tifoide",
    "orgao": "Intestino",
    "saude": "Classe 2 (MS)",
    "controle": "Desinfecção; Portaria 2.349/2017 ressalva S. Typhi como classe 3",
    "tratamento": "cloração da água de irrigação",
    "via": "Água contaminada / respingos",
    "fonte": "Ministério da Saúde · Portaria GM/MS 888/2021",
    "url": "https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html",
    "concentracao": "Cloro residual livre ≥ 0,2 mg/L"
  },
  {
    "nome": "Shigella sonnei",
    "tipo": "Bactéria",
    "impacto": "Água",
    "doenca": "Shigelose / disenteria bacilar",
    "orgao": "Cólon",
    "saude": "Classe 2 (MS)",
    "controle": "Desinfecção da água",
    "tratamento": "cloração da água",
    "via": "Água contaminada",
    "fonte": "Ministério da Saúde · Portaria GM/MS 888/2021",
    "url": "https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html",
    "concentracao": "Cloro residual livre ≥ 0,2 mg/L"
  },
  {
    "nome": "Giardia duodenalis",
    "tipo": "Protozoário",
    "impacto": "Água",
    "doenca": "Giardíase",
    "orgao": "Intestino delgado",
    "saude": "Classe 2 (MS)",
    "controle": "Filtração + desinfecção (cistos resistentes ao cloro)",
    "tratamento": "filtração mecânica + desinfecção",
    "via": "Água contaminada (cistos)",
    "fonte": "Ministério da Saúde · Portaria GM/MS 888/2021",
    "url": "https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html",
    "concentracao": "Filtração ≤ 1 µm + cloração"
  },
  {
    "nome": "Cryptosporidium parvum",
    "tipo": "Protozoário",
    "impacto": "Água",
    "doenca": "Criptosporidiose",
    "orgao": "Intestino",
    "saude": "Classe 2 (MS)",
    "controle": "Filtração; resistente a níveis usuais de cloro",
    "tratamento": "filtração de barreira",
    "via": "Água contaminada (oocistos)",
    "fonte": "Ministério da Saúde · Portaria GM/MS 888/2021",
    "url": "https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html",
    "concentracao": "Filtração absoluta ≤ 1 µm"
  },
  {
    "nome": "Hepatitis A virus (HAV)",
    "tipo": "Vírus",
    "impacto": "Água",
    "doenca": "Hepatite A",
    "orgao": "Fígado",
    "saude": "Classe 2 (MS)",
    "controle": "Desinfecção e vacinação",
    "tratamento": "desinfecção da água",
    "via": "Água contaminada",
    "fonte": "Ministério da Saúde · Portaria GM/MS 888/2021",
    "url": "https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html",
    "concentracao": "Cloro residual livre ≥ 0,2 mg/L"
  },
  {
    "nome": "Schistosoma mansoni",
    "tipo": "Helminto",
    "impacto": "Água",
    "doenca": "Esquistossomose",
    "orgao": "Intestino / fígado",
    "saude": "Classe 2 (MS)",
    "controle": "Saneamento e controle de caramujos",
    "tratamento": "filtração e saneamento da captação",
    "via": "Água com cercárias",
    "fonte": "Ministério da Saúde · Portaria GM/MS 888/2021",
    "url": "https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html",
    "concentracao": "Filtração + controle de moluscos"
  }
];

/* Curiosidades universais sobre agua e irrigacao. */
const CURIOSIDADES_AGUA = [
  { texto: "A Portaria GM/MS 888/2021 fixa pH 6,0-9,5, cloro residual livre minimo de 0,2 mg/L (VMP 5 mg/L), turbidez ate 5 uT e ausencia de E. coli em 100 mL.", fonte: FONTE.port888.orgao, url: FONTE.port888.url },
  { texto: "A CONAMA 357/2005 destina a classe 3 a irrigacao de culturas arboreas, cerealiferas e forrageiras, com pH 6,0-9,0.", fonte: FONTE.conama357.orgao, url: FONTE.conama357.url }
];

/* Cada doenca gera exatamente UMA solucao com o nome da doenca. */
function _solucaoPara(p, alvo) {
  return {
    nome: p.doenca + " — " + p.tratamento,
    doenca: p.doenca,
    patogeno: p.nome,
    via: p.via,
    tratamento: p.tratamento,
    concentracao: p.concentracao || "Conforme rotulo/receituario",
    solvente: "Agua",
    uso: p.tratamento,
    validade: "—",
    ghs: "Especifica por produto",
    alvo: alvo,
    url: p.url,
    fonte: p.fonte
  };
}

/* Bloco universal: 1 solucao para cada doenca de veiculacao hidrica. */
const SOLUCOES_AGUA = PATOGENOS_AGUA.map(p =>
  _solucaoPara(p, "Agua de irrigacao (todas as culturas)"));

/* Dados pesquisados por cultura. */
const PESQUISA_CULTURAS = {
  "soja": {
    "nome": "Soja",
    "fontes": [
      "embrapaPhytophthora",
      "iharaPhytophthora",
      "embrapaFeijaoSolo",
      "apsSclerotinia",
      "unb",
      "embrapaSojaBacterioses"
    ],
    "patogenos": [
      {
        "nome": "Phytophthora sojae",
        "tipo": "Oomiceto",
        "impacto": "Altíssimo",
        "doenca": "Podridão radicular de fitóftora",
        "orgao": "Raízes / haste",
        "saude": "Não aplicável",
        "controle": "Cultivares com genes Rps e resistência parcial; drenagem; fungicida específico no tratamento de sementes",
        "tratamento": "filtrar e clorar a água de irrigação + cultivar resistente (Rps)",
        "via": "Zoósporos biflagelados nadam na água livre do solo (chuva/irrigação) até as raízes",
        "fonte": "Embrapa Trigo · CTO 35",
        "url": "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1096564/1/ID443652018CTO35.pdf",
        "concentracao": "Conforme rótulo/receituário"
      },
      {
        "nome": "Pythium spp.",
        "tipo": "Oomiceto",
        "impacto": "Alto",
        "doenca": "Tombamento de plântulas / podridão de sementes",
        "orgao": "Sementes / hipocótilo",
        "saude": "Não aplicável",
        "controle": "Sementes sadias, drenagem e desinfestação da água em viveiros",
        "tratamento": "desinfestação do reservatório e da água de irrigação",
        "via": "Zoósporos móveis em água de irrigação contaminada",
        "fonte": "UnB · dissertação (2014)",
        "url": "https://repositorio.unb.br/bitstream/10482/18110/1/2014_EleniceAlvesBarboza.pdf",
        "concentracao": "Conforme rótulo/receituário"
      },
      {
        "nome": "Sclerotinia sclerotiorum",
        "tipo": "Fungo",
        "impacto": "Alto",
        "doenca": "Mofo-branco / podridão branca da haste",
        "orgao": "Hastes / vagens",
        "saude": "Não aplicável",
        "controle": "Rotação com gramíneas, manejo de irrigação e fungicidas/biofungicidas registrados",
        "tratamento": "manejar a irrigação e filtrar escleródios da água",
        "via": "Água de irrigação transporta propágulos/escleródios; infecção exige água livre",
        "fonte": "APS · White mold (Português)",
        "url": "https://www.apsnet.org/edcenter/pdlessons/Pages/WhiteMoldPortuguese.aspx",
        "concentracao": "Conforme rótulo/receituário"
      }
    ],
    "curiosidades": [
      {
        "texto": "Os uredósporos da ferrugem-asiática podem percorrer até 96 km por semana pelo vento — por isso a doença foi retirada deste catálogo, que só lista vias hídricas.",
        "fonte": "AEASE · Agressividade da ferrugem asiática",
        "url": "https://www.aease.org.br/agressividade-da-ferrugem-asiatica/"
      },
      {
        "texto": "O vazio sanitário da soja dura de 60 a 90 dias e existe para reduzir o inóculo do fungo na entressafra.",
        "fonte": "Portal Embrapa",
        "url": "https://www.embrapa.br/en/busca-de-noticias/-/noticia/13556333/vazio-sanitario-e-medida-importante-contra-ferrugem-asiatica"
      },
      {
        "texto": "Zoósporos de Phytophthora sojae são atraídos por isoflavonoides (genisteína e daidzeína) liberados pelas raízes e nadam até elas na água do solo.",
        "fonte": "Ficha técnica · P. sojae (Embrapa Trigo, Doc. 79)",
        "url": "https://ihara.com.br/wp-content/uploads/sites/54/2023/03/ficha-tecnica-podridao-radicular-ihara.pdf"
      }
    ],
    "nota": "Ferrugem-asiática, oídio e viroses foram removidos: não contaminam a lavoura pela água."
  },
  "cafe": {
    "nome": "Café",
    "fontes": [
      "incaperCafe",
      "embrapaNematoides",
      "unb"
    ],
    "patogenos": [
      {
        "nome": "Cercospora coffeicola",
        "tipo": "Fungo",
        "impacto": "Alto",
        "doenca": "Cercosporiose / mancha-de-olho-pardo",
        "orgao": "Folhas / frutos",
        "saude": "Não aplicável",
        "controle": "Manejo de irrigação, nutrição equilibrada e fungicidas registrados",
        "tratamento": "evitar aspersão excessiva e tratar a água de irrigação",
        "via": "Conídios disseminados por respingos de chuva e irrigação por aspersão",
        "fonte": "Incaper · Livro Café Conilon (cap. 17)",
        "url": "https://biblioteca.incaper.es.gov.br/digital/bitstream/item/710/1/livro2007cafeconilon17.pdf",
        "concentracao": "Conforme rótulo/receituário"
      },
      {
        "nome": "Colletotrichum coffeanum",
        "tipo": "Fungo",
        "impacto": "Alto",
        "doenca": "Antracnose do cafeeiro",
        "orgao": "Ramos / folhas / frutos",
        "saude": "Não aplicável",
        "controle": "Mudas sadias, poda sanitária e fungicidas registrados",
        "tratamento": "reduzir molhamento foliar e filtrar a água de aspersão",
        "via": "Respingos de chuva espalham os conídios; germinação exige água livre",
        "fonte": "Incaper · Livro Café Conilon (cap. 17)",
        "url": "https://biblioteca.incaper.es.gov.br/digital/bitstream/item/710/1/livro2007cafeconilon17.pdf",
        "concentracao": "Conforme rótulo/receituário"
      }
    ],
    "curiosidades": [
      {
        "texto": "Em viveiros de café, o excesso de irrigação é apontado como um dos principais favorecedores de doenças foliares bacterianas e fúngicas.",
        "fonte": "Incaper · Livro Café Conilon (cap. 17)",
        "url": "https://biblioteca.incaper.es.gov.br/digital/bitstream/item/710/1/livro2007cafeconilon17.pdf"
      },
      {
        "texto": "Nematoides do cafeeiro são levados de uma área para outra pelas enxurradas, que carregam solo infestado.",
        "fonte": "Incaper · Livro Café Conilon (cap. 17)",
        "url": "https://biblioteca.incaper.es.gov.br/digital/bitstream/item/710/1/livro2007cafeconilon17.pdf"
      },
      {
        "texto": "A irrigação por aspersão em pivô central arrasta inóculo da face superior para a inferior das folhas e entre plantas da mesma linha.",
        "fonte": "Incaper · Livro Café Conilon (cap. 17)",
        "url": "https://biblioteca.incaper.es.gov.br/digital/bitstream/item/710/1/livro2007cafeconilon17.pdf"
      }
    ],
    "nota": "A ferrugem do cafeeiro (Hemileia vastatrix) foi removida: disseminação predominantemente aérea."
  },
  "trigo": {
    "nome": "Trigo",
    "fontes": [
      "scieloGiberela",
      "apsFusarium",
      "geaGiberela",
      "unb",
      "embrapaFeijaoSolo"
    ],
    "patogenos": [
      {
        "nome": "Fusarium graminearum",
        "tipo": "Fungo",
        "impacto": "Altíssimo",
        "doenca": "Giberela / fusariose da espiga",
        "orgao": "Espigas / grãos",
        "saude": "Não aplicável",
        "controle": "Cultivares menos suscetíveis, rotação e fungicidas no início do florescimento",
        "tratamento": "monitorar chuva/irrigação no florescimento e manejar a água",
        "via": "Macroconídios liberados e dispersos por respingos de chuva",
        "fonte": "SciELO · Fitopatologia Brasileira",
        "url": "http://www.scielo.br/j/fb/a/WHmhpn6NbZJDn49RvBqjQ7D/?lang=pt",
        "concentracao": "Conforme rótulo/receituário"
      },
      {
        "nome": "Pyricularia oryzae",
        "tipo": "Fungo",
        "impacto": "Alto",
        "doenca": "Brusone do trigo",
        "orgao": "Espigas / folhas",
        "saude": "Não aplicável",
        "controle": "Cultivares resistentes, manejo de irrigação e fungicidas registrados",
        "tratamento": "evitar molhamento prolongado e controlar a lâmina de irrigação",
        "via": "Conídios dispersos em curta distância por respingos de chuva",
        "fonte": "GEA / ESALQ-USP",
        "url": "https://www.gea-esalq.com/informativo-gea-giberela-e-brusone-no-trigo",
        "concentracao": "Conforme rótulo/receituário"
      }
    ],
    "curiosidades": [
      {
        "texto": "Modelos de previsão da giberela usam temperatura, chuva do dia anterior e horas com umidade acima de 80% — a água é o motor da epidemia.",
        "fonte": "SciELO · Fitopatologia Brasileira",
        "url": "http://www.scielo.br/j/fb/a/WHmhpn6NbZJDn49RvBqjQ7D/?lang=pt"
      },
      {
        "texto": "Para infectar a espiga de trigo, a giberela precisa de 30 a 36 horas de molhamento foliar contínuo.",
        "fonte": "GEA / ESALQ-USP",
        "url": "https://www.gea-esalq.com/informativo-gea-giberela-e-brusone-no-trigo"
      },
      {
        "texto": "Grãos infectados por F. graminearum podem conter micotoxinas (DON e ZEA), por isso a doença afeta também a qualidade do alimento.",
        "fonte": "APS · Fusarium head blight (Português)",
        "url": "https://www.apsnet.org/edcenter/pdlessons/Pages/FusariumPort.aspx"
      }
    ],
    "nota": "Ferrugens do trigo (Puccinia triticina) foram removidas: dispersão pelo vento."
  },
  "laranja": {
    "nome": "Laranja / Citros",
    "fontes": [
      "fundecitrusCancro",
      "unb",
      "hong2005",
      "embrapaCt12",
      "fundecitrusHLB"
    ],
    "patogenos": [
      {
        "nome": "Xanthomonas citri subsp. citri",
        "tipo": "Bactéria",
        "impacto": "Altíssimo",
        "doenca": "Cancro cítrico",
        "orgao": "Folhas / ramos / frutos",
        "saude": "Não aplicável",
        "controle": "Mudas certificadas, quebra-ventos, pulverização com cobre e erradicação",
        "tratamento": "desinfestar a água de irrigação e evitar aspersão sobre lesões",
        "via": "A água é o principal veículo: a bactéria nada no filme de água e se espalha por respingos",
        "fonte": "Fundecitrus",
        "url": "https://www.fundecitrus.com.br/pragas-e-doencas/cancro-citrico/",
        "concentracao": "Conforme rótulo/receituário"
      },
      {
        "nome": "Phytophthora spp.",
        "tipo": "Oomiceto",
        "impacto": "Alto",
        "doenca": "Gomose / podridão radicular dos citros",
        "orgao": "Colo / raízes",
        "saude": "Não aplicável",
        "controle": "Drenagem, porta-enxertos tolerantes e fungicidas registrados",
        "tratamento": "filtrar e desinfestar a água de irrigação",
        "via": "Zoósporos móveis em água de irrigação e solo encharcado",
        "fonte": "Hong & Moorman (2005) · revisão",
        "url": "https://www.researchgate.net/publication/240518240_Plant_Pathogens_in_Irrigation_Water_Challenges_and_Opportunities",
        "concentracao": "Conforme rótulo/receituário"
      }
    ],
    "curiosidades": [
      {
        "texto": "O cancro cítrico foi constatado no Brasil em 1957 e a água da chuva é o fator ambiental mais importante da disseminação.",
        "fonte": "Fundecitrus",
        "url": "https://www.fundecitrus.com.br/pragas-e-doencas/cancro-citrico/"
      },
      {
        "texto": "O HLB não passa pela água: o Fundecitrus afirma que não é disseminado por sementes, vento, água ou instrumentos — apenas pelo psilídeo e por enxertia.",
        "fonte": "Fundecitrus · HLB / Greening",
        "url": "https://ww2.fundecitrus.com.br/doencas/greening"
      },
      {
        "texto": "Chuvas com vento podem transportar a bactéria do cancro cítrico por alguns quilômetros a partir da árvore afetada.",
        "fonte": "Fundecitrus",
        "url": "https://www.fundecitrus.com.br/pragas-e-doencas/cancro-citrico/"
      }
    ],
    "nota": "HLB/greening e o psilídeo vetor foram removidos: via exclusivamente por inseto/enxertia, não pela água."
  },
  "algodao": {
    "nome": "Algodão",
    "fontes": [
      "algodaoRamulose",
      "algodaoUfu",
      "algodaoUnoeste",
      "mapaFusarium",
      "embrapaNematoides"
    ],
    "patogenos": [
      {
        "nome": "Colletotrichum gossypii var. cephalosporioides",
        "tipo": "Fungo",
        "impacto": "Altíssimo",
        "doenca": "Ramulose (superbrotamento)",
        "orgao": "Meristema apical / folhas",
        "saude": "Não aplicável",
        "controle": "Cultivares resistentes, sementes sadias e tratadas, fungicidas registrados",
        "tratamento": "evitar aspersão e respingos; tratar a água de irrigação",
        "via": "Respingos da água das chuvas ou da irrigação liberam os esporos da matriz mucilaginosa",
        "fonte": "Embrapa / Campo & Negócios",
        "url": "https://campoenegocios.com/cenario-brasileiro-sobre-as-doencas-do-algodoeiro/",
        "concentracao": "Conforme rótulo/receituário"
      },
      {
        "nome": "Fusarium oxysporum f. sp. vasinfectum",
        "tipo": "Fungo",
        "impacto": "Altíssimo",
        "doenca": "Murcha-de-fusário do algodoeiro",
        "orgao": "Raízes / xilema",
        "saude": "Não aplicável",
        "controle": "Cultivares resistentes, rotação e controle de nematoides",
        "tratamento": "filtrar a água e evitar escoamento de área infestada",
        "via": "Partículas de solo infestado arrastadas pela água e água de irrigação",
        "fonte": "MAPA · Plano de Contingência Foc R4T",
        "url": "https://www.gov.br/agricultura/pt-br/assuntos/sanidade-animal-e-vegetal/sanidade-vegetal/planos-de-contingencia-pragas-ausentes/fusarium-oxysporum-livro-pragaspriorizadas_1ed-2018-243-258.pdf",
        "concentracao": "Conforme rótulo/receituário"
      }
    ],
    "curiosidades": [
      {
        "texto": "A ramulose pode reduzir drasticamente o porte da planta: o fungo mata o meristema apical e provoca superbrotamento.",
        "fonte": "Embrapa / Campo & Negócios",
        "url": "https://campoenegocios.com/cenario-brasileiro-sobre-as-doencas-do-algodoeiro/"
      },
      {
        "texto": "No algodoeiro, a disseminação a curta distância da ramulose ocorre por respingos de água; a longa distância, por sementes contaminadas.",
        "fonte": "Embrapa / Campo & Negócios",
        "url": "https://campoenegocios.com/cenario-brasileiro-sobre-as-doencas-do-algodoeiro/"
      },
      {
        "texto": "O manual de bolso da UNOESTE distingue explicitamente: ramulose 'pela água', ferrugem do algodoeiro 'pelo vento' — só a primeira entra neste catálogo.",
        "fonte": "UNOESTE · Manual de bolso (Algodoeiro)",
        "url": "http://sites.unoeste.br/gea/wp-content/uploads/2018/11/Manual-de-bolso-Identifica%C3%A7%C3%A3o-das-doen%C3%A7as-do-algodoeiro.pdf"
      }
    ],
    "nota": "Ferrugem do algodoeiro e viroses transmitidas por pulgão foram removidas."
  },
  "milho": {
    "nome": "Milho",
    "fontes": [
      "embrapaMilho",
      "embrapaCt16",
      "scieloGiberela",
      "unb",
      "embrapaFeijaoSolo"
    ],
    "patogenos": [
      {
        "nome": "Cercospora zeae-maydis",
        "tipo": "Fungo",
        "impacto": "Alto",
        "doenca": "Cercosporiose / mancha cinzenta do milho",
        "orgao": "Folhas",
        "saude": "Não aplicável",
        "controle": "Rotação de culturas, manejo de restos culturais e fungicidas registrados",
        "tratamento": "reduzir respingos de aspersão sobre restos culturais",
        "via": "Esporos e restos de cultura levados por respingos de chuva",
        "fonte": "Embrapa · Agência de Informação (Milho)",
        "url": "https://www.agencia.cnptia.embrapa.br/gestor/territorio_sisal/arvore/CONT000fckl80cd02wx5eo0a2ndxy5w90bbu.html",
        "concentracao": "Conforme rótulo/receituário"
      },
      {
        "nome": "Colletotrichum graminicola",
        "tipo": "Fungo",
        "impacto": "Alto",
        "doenca": "Antracnose do milho / podridão do colmo",
        "orgao": "Colmo / folhas / raízes",
        "saude": "Não aplicável",
        "controle": "Rotação de culturas, cultivares resistentes e tratamento de sementes",
        "tratamento": "controlar a água de irrigação e o molhamento do colmo",
        "via": "Conídios disseminados por respingos de chuva",
        "fonte": "Embrapa · Agência de Informação (Milho)",
        "url": "https://www.agencia.cnptia.embrapa.br/gestor/territorio_sisal/arvore/CONT000fckl80cd02wx5eo0a2ndxy5w90bbu.html",
        "concentracao": "Conforme rótulo/receituário"
      }
    ],
    "curiosidades": [
      {
        "texto": "A mancha por Cercospora no milho pode causar perdas superiores a 80% na produção de grãos.",
        "fonte": "Embrapa · CT 16",
        "url": "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/484065/1/ct16.pdf"
      },
      {
        "texto": "Restos de cultura infectados na superfície do solo são a fonte de inóculo que os respingos de chuva levantam até as folhas.",
        "fonte": "Embrapa · CT 16",
        "url": "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/484065/1/ct16.pdf"
      },
      {
        "texto": "A giberela (F. graminearum) sobrevive em colmos de milho e palha de trigo, e seus macroconídios são dispersos por respingos de chuva.",
        "fonte": "APS · Fusarium head blight (Português)",
        "url": "https://www.apsnet.org/edcenter/pdlessons/Pages/FusariumPort.aspx"
      }
    ],
    "nota": "Ferrugens do milho (Puccinia polysora, P. sorghi) e mancha de Diplodia por via aérea foram removidas."
  },
  "cana": {
    "nome": "Cana-de-açúcar",
    "fontes": [
      "unb",
      "mapaFusarium",
      "embrapaNematoides",
      "embrapaFeijaoSolo",
      "embrapaCanaFerrugem"
    ],
    "patogenos": [
      {
        "nome": "Pythium spp.",
        "tipo": "Oomiceto",
        "impacto": "Alto",
        "doenca": "Tombamento de plântulas / podridão radicular",
        "orgao": "Raízes / colmo",
        "saude": "Não aplicável",
        "controle": "Drenagem, mudas sadias e desinfestação da água",
        "tratamento": "desinfestação do reservatório de irrigação",
        "via": "Zoósporos móveis em água de irrigação contaminada",
        "fonte": "UnB · dissertação (2014)",
        "url": "https://repositorio.unb.br/bitstream/10482/18110/1/2014_EleniceAlvesBarboza.pdf",
        "concentracao": "Conforme rótulo/receituário"
      },
      {
        "nome": "Meloidogyne javanica",
        "tipo": "Nematoide",
        "impacto": "Alto",
        "doenca": "Nematoide-das-galhas da cana",
        "orgao": "Raízes",
        "saude": "Não aplicável",
        "controle": "Rotação com gramíneas, mudas sadias e nematicidas registrados",
        "tratamento": "filtrar a água de irrigação e evitar escoamento de solo infestado",
        "via": "Juvenis J2 e solo infestado transportados pela água de irrigação",
        "fonte": "Embrapa · Frutas do Brasil (Melão)",
        "url": "https://www.infoteca.cnptia.embrapa.br/bitstream/doc/131681/1/DOENCASCAUSADASPORNEMATOIDESTECNOLOGIANOMANEJODECONTROLE.pdf",
        "concentracao": "Conforme rótulo/receituário"
      }
    ],
    "curiosidades": [
      {
        "texto": "A ferrugem marrom da cana foi detectada no Brasil em 1986; a ferrugem alaranjada só foi confirmada em 2009 — ambas foram excluídas do catálogo por dispersão aérea.",
        "fonte": "Instituto Biológico / Embrapa (cana)",
        "url": "https://biologico.agricultura.sp.gov.br/uploads/docs/pag/v5_1/dagostini.html"
      },
      {
        "texto": "Fitonematoides se movem sozinhos menos de 50 cm por ano no solo; a água de irrigação é que os leva a longas distâncias.",
        "fonte": "Embrapa · Frutas do Brasil (Melão)",
        "url": "https://www.infoteca.cnptia.embrapa.br/bitstream/doc/131681/1/DOENCASCAUSADASPORNEMATOIDESTECNOLOGIANOMANEJODECONTROLE.pdf"
      },
      {
        "texto": "Reservatórios de irrigação podem abrigar Pythium, Phytophthora, Rhizoctonia e Fusarium simultaneamente.",
        "fonte": "UnB · dissertação (2014)",
        "url": "https://repositorio.unb.br/bitstream/10482/18110/1/2014_EleniceAlvesBarboza.pdf"
      }
    ],
    "nota": "Ferrugens e o raquitismo-da-soqueira (mudas/implementos) foram removidos."
  },
  "arroz": {
    "nome": "Arroz",
    "fontes": [
      "mapaXoo",
      "embrapaXoo",
      "capsXoo",
      "embrapaArrozDoencas",
      "unb"
    ],
    "patogenos": [
      {
        "nome": "Xanthomonas oryzae pv. oryzae",
        "tipo": "Bactéria",
        "impacto": "Altíssimo",
        "doenca": "Crestamento bacteriano / queima bacteriana do arroz",
        "orgao": "Folhas / xilema",
        "saude": "Não aplicável",
        "controle": "Cultivares resistentes, sementes sadias, manejo da lâmina de água e quarentena",
        "tratamento": "manejar e desinfestar a água de irrigação entre talhões",
        "via": "A água de irrigação é a forma mais comum de disseminação em grandes áreas; a bactéria sobrevive nela",
        "fonte": "MAPA/Embrapa · Pragas Priorizadas (cap. 22)",
        "url": "https://ainfo.cnptia.embrapa.br/digital/bitstream/item/198801/1/Livro-PragasPriorizadas-1ed-2018-Ainfo-ver-final-1-352-373.pdf",
        "concentracao": "Conforme rótulo/receituário"
      },
      {
        "nome": "Rhizoctonia oryzae / R. solani",
        "tipo": "Fungo",
        "impacto": "Alto",
        "doenca": "Mancha-da-bainha / queima-da-bainha",
        "orgao": "Bainha / colmo",
        "saude": "Não aplicável",
        "controle": "Rotação, manejo de restos culturais e fungicidas registrados",
        "tratamento": "filtrar escleródios flutuantes da água de irrigação",
        "via": "Esclerócios flutuam na água, acumulam-se junto à planta e causam a infecção inicial",
        "fonte": "Embrapa · Arroz irrigado (manejo de doenças)",
        "url": "https://www.embrapa.br/en/web/agencia-de-informacao-tecnologica/cultivos/arroz/producao/sistema-de-cultivo/arroz-irrigado-na-regiao-tropical/manejo-de-pragas/manejo-de-doencas",
        "concentracao": "Conforme rótulo/receituário"
      }
    ],
    "curiosidades": [
      {
        "texto": "Em arroz irrigado, a água é um dos modos mais importantes de dispersão do crestamento bacteriano — por isso o manejo da lâmina é parte do controle.",
        "fonte": "MAPA/Embrapa · Pragas Priorizadas (cap. 22)",
        "url": "https://ainfo.cnptia.embrapa.br/digital/bitstream/item/198801/1/Livro-PragasPriorizadas-1ed-2018-Ainfo-ver-final-1-352-373.pdf"
      },
      {
        "texto": "Os escleródios da mancha-da-bainha flutuam na água de irrigação e conseguem sobreviver até 2 anos no solo.",
        "fonte": "Embrapa · Arroz irrigado (manejo de doenças)",
        "url": "https://www.embrapa.br/en/web/agencia-de-informacao-tecnologica/cultivos/arroz/producao/sistema-de-cultivo/arroz-irrigado-na-regiao-tropical/manejo-de-pragas/manejo-de-doencas"
      },
      {
        "texto": "A brusone pode comprometer até 100% da produção em anos epidêmicos, mas seus conídios não sobrevivem mais de 24 h na água de irrigação — por isso não está no catálogo hídrico.",
        "fonte": "Embrapa · Arroz irrigado (manejo de doenças)",
        "url": "https://www.embrapa.br/en/web/agencia-de-informacao-tecnologica/cultivos/arroz/producao/sistema-de-cultivo/arroz-irrigado-na-regiao-tropical/manejo-de-pragas/manejo-de-doencas"
      }
    ],
    "nota": "Brusone (conídios < 24 h na água, dispersão aérea) e carvão-da-folha (vento) foram removidos."
  },
  "feijao": {
    "nome": "Feijão",
    "fontes": [
      "embrapaFeijaoAntracnose",
      "embrapaFeijaoSolo",
      "embrapaFusariumCaupi",
      "nebraskaIrrigacao",
      "embrapaNematoides"
    ],
    "patogenos": [
      {
        "nome": "Colletotrichum lindemuthianum",
        "tipo": "Fungo",
        "impacto": "Altíssimo",
        "doenca": "Antracnose do feijoeiro",
        "orgao": "Folhas / vagens / sementes",
        "saude": "Não aplicável",
        "controle": "Sementes livres do patógeno, tratamento químico e fungicidas registrados",
        "tratamento": "evitar aspersão sobre lesões e tratar a água de irrigação",
        "via": "Respingos de água da chuva ou da irrigação por aspersão dissolvem a matriz gelatinosa e liberam os esporos",
        "fonte": "Embrapa Arroz e Feijão · Boletim de P&D 1",
        "url": "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/211439/1/bolpesq1.pdf",
        "concentracao": "Conforme rótulo/receituário"
      },
      {
        "nome": "Sclerotinia sclerotiorum",
        "tipo": "Fungo",
        "impacto": "Altíssimo",
        "doenca": "Mofo-branco do feijoeiro",
        "orgao": "Hastes / vagens",
        "saude": "Não aplicável",
        "controle": "Rotação com gramíneas, porte ereto, irrigação controlada e biofungicidas",
        "tratamento": "manejar a irrigação e filtrar propágulos da água",
        "via": "A água de irrigação transporta propágulos e escleródios; biofungicidas são aplicados via água de irrigação",
        "fonte": "Embrapa · Ageitec (Feijão)",
        "url": "https://www.embrapa.br/en/web/agencia-de-informacao-tecnologica/cultivos/feijao/producao/doencas/doencas-fungicas/doencas-fungicas-do-solo",
        "concentracao": "Conforme rótulo/receituário"
      }
    ],
    "curiosidades": [
      {
        "texto": "Em experimento com irrigação por aspersão, a antracnose do feijão atingiu 12,25% de severidade a 0,5 m do foco contra 0,75% na área não irrigada.",
        "fonte": "Embrapa Arroz e Feijão · Boletim de P&D 1",
        "url": "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/211439/1/bolpesq1.pdf"
      },
      {
        "texto": "Sclerotinia sclerotiorum tem mais de 400 plantas hospedeiras; apenas gramíneas são consideradas não hospedeiras.",
        "fonte": "Embrapa · Ageitec (Feijão)",
        "url": "https://www.embrapa.br/en/web/agencia-de-informacao-tecnologica/cultivos/feijao/producao/doencas/doencas-fungicas/doencas-fungicas-do-solo"
      },
      {
        "texto": "A bactéria do crestamento comum do feijão (Xanthomonas phaseoli) foi detectada em água de irrigação superficial em Nebraska já em 1975.",
        "fonte": "Univ. Nebraska · Water Resources Bulletin (1975)",
        "url": "https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1303&context=plantpathpapers"
      }
    ],
    "nota": "Ferrugem do feijoeiro (Uromyces) e mosaico-dourado (mosca-branca) foram removidos."
  },
  "hortalicas": {
    "nome": "Hortaliças",
    "fontes": [
      "embrapaHortalicas100",
      "unb",
      "eppoXanthomonas",
      "embrapaCt12",
      "embrapaCot27",
      "hong2005"
    ],
    "patogenos": [
      {
        "nome": "Pythium spp. / Phytophthora capsici",
        "tipo": "Oomiceto",
        "impacto": "Altíssimo",
        "doenca": "Tombamento de mudas (damping-off) / requeima",
        "orgao": "Mudas / raízes / frutos",
        "saude": "Não aplicável",
        "controle": "Substrato esterilizado, drenagem, filtragem da água e fungicidas registrados",
        "tratamento": "filtrar e desinfestar a água de irrigação do viveiro",
        "via": "Zoósporos móveis nadam na água de irrigação e em filmes de água entre partículas de solo",
        "fonte": "UnB · dissertação (2014)",
        "url": "https://repositorio.unb.br/bitstream/10482/18110/1/2014_EleniceAlvesBarboza.pdf",
        "concentracao": "Conforme rótulo/receituário"
      },
      {
        "nome": "Xanthomonas euvesicatoria pv. perforans",
        "tipo": "Bactéria",
        "impacto": "Alto",
        "doenca": "Mancha bacteriana do tomateiro e pimentão",
        "orgao": "Folhas / frutos",
        "saude": "Não aplicável",
        "controle": "Sementes e mudas sadias, evitar irrigação por aspersão, cobre registrado",
        "tratamento": "evitar aspersão sobre a folhagem e desinfestar a água",
        "via": "Respingos de água de irrigação ou de chuva são a principal via de curta distância",
        "fonte": "EPPO Global Database",
        "url": "https://gd.eppo.int/taxon/XANTPF/datasheet",
        "concentracao": "Conforme rótulo/receituário"
      }
    ],
    "curiosidades": [
      {
        "texto": "A Embrapa Hortaliças recomenda expressamente usar água de boa qualidade, não contaminada, na irrigação: a água, implementos e insetos dispersam patógenos.",
        "fonte": "Embrapa Hortaliças · CT 100",
        "url": "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/916721/1/ct100.pdf"
      },
      {
        "texto": "Em alface, a disseminação de Meloidogyne spp. ocorre principalmente por substrato infestado, água de irrigação contaminada e solo em máquinas.",
        "fonte": "Embrapa Hortaliças · COT 27",
        "url": "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/779126/1/cot27.pdf"
      },
      {
        "texto": "Pythium e Phytophthora liberam zoósporos que nadam ativamente na água; por isso sistemas de irrigação recirculante podem espalhar a doença por toda a estufa.",
        "fonte": "Hong & Moorman (2005) · revisão",
        "url": "https://www.researchgate.net/publication/240518240_Plant_Pathogens_in_Irrigation_Water_Challenges_and_Opportunities"
      }
    ],
    "nota": "Oídios e viroses de hortaliças transmitidas por afídeos foram removidos."
  },
  "outra": {
    "nome": "Outra cultura",
    "fontes": [
      "port888",
      "hong2005",
      "unb",
      "conama357"
    ],
    "patogenos": [],
    "curiosidades": [
      {
        "texto": "Para culturas fora da lista, o sistema mostra apenas os agentes de veiculação hídrica — aqueles que chegam à lavoura pela água monitorada pelo sensor.",
        "fonte": "Hong & Moorman (2005) · revisão",
        "url": "https://www.researchgate.net/publication/240518240_Plant_Pathogens_in_Irrigation_Water_Challenges_and_Opportunities"
      },
      {
        "texto": "A água de irrigação pode carregar 17 espécies de Phytophthora, 26 de Pythium, 27 gêneros de fungos, 8 bactérias, 10 vírus e 13 espécies de nematoides fitoparasitas.",
        "fonte": "Hong & Moorman (2005) · revisão",
        "url": "https://www.researchgate.net/publication/240518240_Plant_Pathogens_in_Irrigation_Water_Challenges_and_Opportunities"
      },
      {
        "texto": "A Portaria GM/MS 888/2021 exige ausência de E. coli em 100 mL e cloro residual livre mínimo de 0,2 mg/L.",
        "fonte": "Ministério da Saúde · Portaria GM/MS 888/2021",
        "url": "https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html"
      }
    ],
    "nota": "Sem cultura específica cadastrada, nenhuma doença foliar é assumida: apenas o bloco universal de veiculação hídrica."
  }
};

/* Resolve as chaves de fontes e constroi as solucoes 1:1. */
Object.keys(PESQUISA_CULTURAS).forEach(function (k) {
  const c = PESQUISA_CULTURAS[k];
  c.fontes = (c.fontes || []).map(function (x) { return FONTE[x] || x; });
  c.patogenos = c.patogenos || [];
  c.solucoes = c.patogenos.map(function (p) { return _solucaoPara(p, c.nome); });
  c.curiosidades = c.curiosidades || [];
});

/* Nomes que NAO podem aparecer em nenhum catalogo (via nao hidrica). */
const VETO_HIDRICO = [
  "phakopsora", "puccinia", "hemileia", "uromyces", "microsphaera",
  "liberibacter", "diaphorina", "leifsonia", "oidium", "mosaic virus",
  "golden mosaic", "tobacco streak", "bean pod mottle"
];

/** Retorna um array de erros; vazio = catalogo integro. */
function validarCatalogo() {
  const erros = [];
  const conferir = function (p, sol, rotulo) {
    if (!p.via) erros.push(rotulo + ": doenca sem via hidrica -> " + p.doenca);
    if (!p.url) erros.push(rotulo + ": doenca sem fonte -> " + p.doenca);
    const alvo = String(p.nome + " " + p.doenca).toLowerCase();
    VETO_HIDRICO.forEach(function (v) {
      if (alvo.indexOf(v) >= 0) erros.push(rotulo + ": doenca sem via hidrica permitida -> " + p.nome);
    });
    if (!sol) { erros.push(rotulo + ": falta solucao para -> " + p.doenca); return; }
    if (sol.doenca !== p.doenca) erros.push(rotulo + ": solucao vinculada a outra doenca -> " + p.doenca);
    if (sol.nome.indexOf(p.doenca) !== 0) erros.push(rotulo + ": nome da solucao nao comeca com a doenca -> " + p.doenca);
  };
  Object.keys(PESQUISA_CULTURAS).forEach(function (k) {
    const c = PESQUISA_CULTURAS[k];
    if (c.patogenos.length !== c.solucoes.length) {
      erros.push(k + ": " + c.patogenos.length + " doencas x " + c.solucoes.length + " solucoes");
    }
    c.patogenos.forEach(function (p, i) { conferir(p, c.solucoes[i], k); });
    if (!c.curiosidades.length) erros.push(k + ": sem curiosidades");
  });
  if (PATOGENOS_AGUA.length !== SOLUCOES_AGUA.length) erros.push("agua: contagem 1:1 divergente");
  PATOGENOS_AGUA.forEach(function (p, i) { conferir(p, SOLUCOES_AGUA[i], "agua"); });
  return erros;
}

/* ------------------------------------------------------------------ */
/* Acessores usados pelos catalogos                                    */
/* ------------------------------------------------------------------ */
function normalizarCultura(chave) {
  const c = String(chave || "").trim().toLowerCase();
  return PESQUISA_CULTURAS[c] ? c : "soja";
}

function obterPesquisaCultura(chave) {
  return PESQUISA_CULTURAS[normalizarCultura(chave)];
}

function patogenosDaCultura(chave) {
  return obterPesquisaCultura(chave).patogenos.concat(PATOGENOS_AGUA);
}

function solucoesDaCultura(chave) {
  return obterPesquisaCultura(chave).solucoes.concat(SOLUCOES_AGUA);
}

function fontesDaCultura(chave) {
  const vistos = new Set();
  return obterPesquisaCultura(chave).fontes.concat(FONTES_GERAIS).filter(function (f) {
    if (!f || !f.url || vistos.has(f.url)) return false;
    vistos.add(f.url);
    return true;
  });
}

function curiosidadesDaCultura(chave) {
  return obterPesquisaCultura(chave).curiosidades.concat(CURIOSIDADES_AGUA);
}

/* ------------------------------------------------------------------ */
/* Renderizacao                                                        */
/* ------------------------------------------------------------------ */
function _esc(txt) {
  return String(txt == null ? "" : txt)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function _htmlFontes(chave) {
  const p = obterPesquisaCultura(chave);
  const fontes = fontesDaCultura(chave);
  const itens = fontes.map(function (f) {
    return '\n      <li class="py-2 border-b border-white/5 last:border-0">' +
      '<span class="text-cyan-300 font-semibold">' + _esc(f.orgao) + '</span> — ' +
      '<span class="text-slate-300">' + _esc(f.titulo) + '</span><br>' +
      '<a href="' + _esc(f.url) + '" target="_blank" rel="noopener noreferrer" ' +
      'class="text-xs text-slate-400 hover:text-cyan-300 break-all underline decoration-white/20">' +
      _esc(f.url) + '</a></li>';
  }).join("");

  const opcoes = Object.keys(PESQUISA_CULTURAS).map(function (k) {
    return '<option value="' + _esc(k) + '"' +
      (k === normalizarCultura(chave) ? " selected" : "") + '>' +
      _esc(PESQUISA_CULTURAS[k].nome) + '</option>';
  }).join("");

  const excluidas = DOENCAS_EXCLUIDAS.map(function (d) {
    return '<li class="py-1.5">' + _esc(d.nome) + ' — <span class="text-slate-400">' +
      _esc(d.motivo) + '</span> <a href="' + _esc(d.url) +
      '" target="_blank" rel="noopener noreferrer" class="text-cyan-400/80 underline">fonte</a></li>';
  }).join("");

  const erros = validarCatalogo();
  return '\n    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">' +
    '<h3 class="text-lg font-bold flex items-center gap-2">' +
    '<i data-lucide="book-open" class="w-5 h-5 text-cyan-400"></i> ' +
    'Fontes das pesquisas · ' + _esc(p.nome) + '</h3>' +
    '<label class="text-xs text-slate-400 flex items-center gap-2">Ver fontes de outra cultura: ' +
    '<select data-fontes-cultura class="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs">' +
    opcoes + '</select></label></div>' +
    '<p class="text-xs text-slate-500 mb-4">Banco de dados desta conta: ' +
    '<strong class="text-slate-300">' + _esc(p.nome) + '</strong> · ' + fontes.length +
    ' fontes · acessadas em ' + DATA_PESQUISA + '. ' +
    'Este catalogo lista <strong class="text-cyan-300">apenas doencas transmitidas pela agua</strong> e ' +
    'cada doenca tem exatamente uma solucao (' + patogenosDaCultura(chave).length + ' x ' +
    solucoesDaCultura(chave).length + ').</p>' +
    '<ul class="text-sm leading-relaxed">' + itens + '</ul>' +
    '<div class="mt-5 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs text-slate-400 leading-relaxed">' +
    '<strong class="text-rose-300">Filtro de via hídrica — o que foi removido.</strong>' +
    '<ul class="mt-2 ml-4 list-disc">' + excluidas + '</ul></div>' +
    '<div class="mt-5 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-400 leading-relaxed">' +
    '<strong class="text-amber-300">Nota metodologica.</strong> ' +
    'Os niveis "Alto / Moderado / Baixo" sao leitura qualitativa das descricoes de severidade e perdas ' +
    'das publicacoes da Embrapa e do Fundecitrus — <strong>nao</strong> sao classificacao oficial do MAPA. ' +
    'BSL e classes de risco do Ministerio da Saude, da NR-32 e da OMS aplicam-se apenas a agentes que ' +
    'adoecem humanos e animais; fitopatogenos aparecem como "Nao aplicavel". ' +
    'A classificacao toxicologica GHS (Anvisa RDC 294/2019) e definida por produto formulado: ' +
    'consulte sempre o rotulo/bula e o AGROFIT. Nenhuma dose ou marca e recomendada; ' +
    'diagnostico e aplicacao exigem responsavel tecnico.' +
    (p.nota ? '<br><br>' + _esc(p.nota) : '') +
    (erros.length ? '<br><br><strong class="text-red-300">Catalogo inconsistente: ' +
      _esc(erros.join(" | ")) + '</strong>' : '') +
    '</div>';
}

/** Renderiza (ou atualiza) o bloco de fontes. */
async function renderFontesCultura(chaveCultura, seletor) {
  const alvo = document.querySelector(seletor || "[data-fontes]");
  if (!alvo) return;
  let chave = chaveCultura;
  if (!chave) {
    try {
      chave = window.ACQUASAFE_CULTURA ||
        (typeof obterLavouraDoUsuario === "function" ? await obterLavouraDoUsuario() : null);
    } catch (_) { chave = null; }
  }
  alvo.innerHTML = _htmlFontes(normalizarCultura(chave || "soja"));
  if (window.lucide) { try { lucide.createIcons(); } catch (_) {} }
  const sel = alvo.querySelector("[data-fontes-cultura]");
  if (sel) sel.addEventListener("change", () => renderFontesCultura(sel.value, seletor));
}

/** Renderiza o painel de curiosidades da cultura da conta. */
async function renderCuriosidades(chaveCultura, seletor) {
  const alvo = document.querySelector(seletor || "[data-curiosidades]");
  if (!alvo) return;
  let chave = chaveCultura;
  if (!chave) {
    try {
      chave = window.ACQUASAFE_CULTURA ||
        (typeof obterLavouraDoUsuario === "function" ? await obterLavouraDoUsuario() : null);
    } catch (_) { chave = null; }
  }
  chave = normalizarCultura(chave || "soja");
  const p = obterPesquisaCultura(chave);
  const itens = curiosidadesDaCultura(chave).map(function (c) {
    return '<li class="py-2.5 border-b border-white/5 last:border-0 leading-relaxed">' +
      '<i data-lucide="sparkles" class="inline w-3.5 h-3.5 text-violet-300 mr-1"></i>' +
      _esc(c.texto) + '<br><a href="' + _esc(c.url) +
      '" target="_blank" rel="noopener noreferrer" class="text-[11px] text-cyan-400/80 hover:text-cyan-300 underline">' +
      _esc(c.fonte) + '</a></li>';
  }).join("");
  alvo.innerHTML =
    '<div class="flex items-center justify-between gap-3 mb-3">' +
    '<h4 class="font-semibold text-sm flex items-center gap-2">' +
    '<i data-lucide="lightbulb" class="w-4 h-4 text-violet-300"></i> ' +
    'Curiosidades · ' + _esc(p.nome) + '</h4>' +
    '<span class="text-[10px] text-slate-500">fontes oficiais</span></div>' +
    '<ul class="text-xs text-slate-300">' + itens + '</ul>';
  if (window.lucide) { try { lucide.createIcons(); } catch (_) {} }
}

/* Auto-inicializacao: [data-fontes] e o botao de curiosidades. */
if (typeof document !== "undefined") {
  const iniciar = function () {
    document.querySelectorAll("[data-fontes]").forEach(function (el) {
      renderFontesCultura(null, el.id ? "#" + el.id : "[data-fontes]").catch(() => {});
    });
    document.querySelectorAll("[data-curiosidades-btn]").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        const alvo = document.querySelector("[data-curiosidades]");
        if (!alvo) return;
        const abrindo = alvo.classList.contains("hidden");
        alvo.classList.toggle("hidden", !abrindo);
        btn.setAttribute("aria-expanded", String(abrindo));
        if (abrindo) await renderCuriosidades(null, "[data-curiosidades]");
      });
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
}

/* Exporta para testes (Node/vm) sem poluir o navegador. */
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    FONTE, FONTES_GERAIS, PATOGENOS_AGUA, SOLUCOES_AGUA,
    PESQUISA_CULTURAS, DOENCAS_EXCLUIDAS, CURIOSIDADES_AGUA,
    CONTA_PH_DIRETO, ehContaPhDireto, validarCatalogo,
    normalizarCultura, obterPesquisaCultura, patogenosDaCultura,
    solucoesDaCultura, fontesDaCultura, curiosidadesDaCultura
  };
}
