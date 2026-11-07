# Pesquisa de fontes — catálogo de doenças por via hídrica

Data da pesquisa: **undefined** · Projeto: AcquaSafe · Arquivo de dados: `pesquisa-culturas.js`.

## 1. Critério de inclusão

> **Só entra no sistema a doença que contamina a plantação pela água.**

Foram consideradas vias hídricas documentadas: água de irrigação contaminada,
enxurrada/escoamento superficial, respingos de chuva ou de irrigação por aspersão,
zoósporos flagelados que nadam em água livre no solo, escleródios flutuantes e
propágulos/nematoides transportados pela água. Infecção que exige filme de água
livre na folha também entra quando a fonte oficial a descreve como dependente da água.

A revisão de Hong & Moorman (2005) registra em água de irrigação 17 espécies de
*Phytophthora*, 26 de *Pythium*, 27 gêneros de fungos, 8 bactérias, 10 vírus e 13
espécies de nematoides fitoparasitas — é a base conceitual do filtro.

## 2. Regra 1:1 (doença → solução)

Cada doença gera **exatamente uma solução**, cujo nome começa com o nome da doença
tratada (coluna `Doença tratada` na página Soluções). `validarCatalogo()` confere
contagem, vínculo, presença da via hídrica, presença da fonte e nomes vetados.
Resultado da validação automatizada: **0 erros**.

`patogenos.js` e `solucoes.js` deixaram de consultar as tabelas `doencas`/`solucoes`
do Supabase: elas contêm doenças de dispersão aérea/vetorial e soluções genéricas sem
vínculo com doença. **Nenhuma escrita no banco foi feita nesta atualização.**

## 3. Doenças removidas (com justificativa)

| Doença / grupo | Por que saiu | Fonte |
|---|---|---|
| Ferrugem-asiática da soja (Phakopsora pachyrhizi) | disseminação unicamente pelo vento (uredósporos) | [link](https://www.aease.org.br/agressividade-da-ferrugem-asiatica/) |
| Ferrugens (Puccinia spp., Hemileia vastatrix, Phakopsora gossypii) | esporos transportados pelo ar; sem via hídrica documentada | [link](http://sites.unoeste.br/gea/wp-content/uploads/2018/11/Manual-de-bolso-Identifica%C3%A7%C3%A3o-das-doen%C3%A7as-do-algodoeiro.pdf) |
| HLB / Greening dos citros (Candidatus Liberibacter asiaticus) | o Fundecitrus afirma explicitamente que não é disseminado por água — só psilídeo e enxertia | [link](https://ww2.fundecitrus.com.br/doencas/greening) |
| Vírus de soja (AMV, BPMV, SMV, CPMMV, TSV) e mosaico-dourado do feijão | sementes e insetos-vetores, não água | [link](https://gd.eppo.int/) |
| Oídios (Microsphaera diffusa, Oidium spp.) e raquitismo-da-soqueira (Leifsonia xyli) | disseminação aérea, mudas e implementos; sem via hídrica documentada | [link](https://www.cabi.org/Uploads/CABI/publishing/promotional-materials/insert/Cp%20Compendium%20A4%20Insert.pdf) |

## 4. Fontes oficiais e técnicas

| Órgão / publicação | O que sustenta | URL |
|---|---|---|
| Ministério da Saúde · Portaria GM/MS 888/2021 | Padrão de potabilidade: pH 6,0–9,5; cloro residual livre ≥ 0,2 mg/L e VMP 5 mg/L; turbidez ≤ 5 uT; ausência de E. coli em 100 mL | https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html |
| CONAMA · Resolução 357/2005 | Classe 3 destinada à irrigação de culturas arbóreas, cerealíferas e forrageiras (pH 6,0–9,0; coliformes termotolerantes) | https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450 |
| MAPA · AGROFIT | Agrotóxicos registrados no AGROFIT (cadastro oficial por cultura, alvo, ingrediente ativo e classificação toxicológica) | https://www.gov.br/agricultura/pt-br/acesso-a-informacao/acoes-e-programas/cartas-de-servico/defesa-agropecuaria-agrotoxicos/agrotoxicos-registrados-no-agrofit |
| MAPA | Agrofit agora é o sistema oficial de cadastro de agroquímicos | https://www.gov.br/agricultura/pt-br/assuntos/noticias/2022/agrofit-agora-e-o-sistema-oficial-de-cadastro-de-agroquimicos |
| Embrapa · AgroAPI | Documentação da API AGROFIT (culturas, alvos e classificações toxicológica/ambiental) | https://www.agroapi.cnptia.embrapa.br/portal/assets/docs/agrofit.pdf |
| Anvisa · RDC 294/2019 | Novo marco regulatório: classificação toxicológica pelo GHS (categorias 1 a 5 e Não Classificado) | https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2019/anvisa-aprova-novo-marco-regulatorio-para-agrotoxicos |
| Anvisa | Reclassificação toxicológica dos agrotóxicos (1.942 produtos avaliados) | https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2019/publicada-reclassificacao-toxicologica-de-agrotoxicos |
| Anvisa · Monografias | Monografia A29: a classificação toxicológica é específica para cada produto, conforme art. 38 da RDC 294/2019 | https://www.gov.br/anvisa/pt-br/setorregulado/regularizacao/agrotoxicos/monografias/monografias-autorizadas/a/4150json-file-1/@@display-file/file |
| Ministério da Saúde · Portaria GM/MS 3.398/2021 | Lista de Classificação de Risco dos Agentes Biológicos (classes 1 a 4) | https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt3398_29_12_2021.html |
| Ministério da Saúde · Portaria GM/MS 2.349/2017 | Aprova a Classificação de Risco dos Agentes Biológicos | https://bvsms.saude.gov.br/bvs/saudelegis/gm/2017/prt2349_22_09_2017.html |
| Ministério da Saúde | Classificação de Risco dos Agentes Biológicos — 3ª edição | https://bvsms.saude.gov.br/bvs/publicacoes/classificacao_risco_agentes_biologicos_3ed.pdf |
| MTE · NR-32 | Anexo I (classes de risco 1 a 4) e Anexo II (tabela de agentes) | https://fiocruz.br/biosseguranca/Bis/manuais/legislacao/NR-32.pdf |
| OMS / WHO | Laboratory Biosafety Manual, 4ª edição (2020) — abordagem baseada em avaliação de risco | https://www.who.int/publications/i/item/9789240011311 |
| MAPA · Defesa Vegetal | Listas de Pragas Quarentenárias Ausentes (PQA) e Presentes (PQP) e Análise de Risco de Pragas | https://www.gov.br/agricultura/pt-br/assuntos/noticias/mapa-disponibiliza-listagem-atualizada-de-pragas-quarentenarias |
| EPPO | EPPO Global Database — nomes científicos, sinonímia, plantas-hospedeiro e distribuição | https://gd.eppo.int/ |
| CABI | Crop Protection Compendium — datasheets sobre pragas, doenças e hospedeiros | https://www.cabi.org/Uploads/CABI/publishing/promotional-materials/insert/Cp%20Compendium%20A4%20Insert.pdf |
| Hong & Moorman (2005) · revisão | Plant Pathogens in Irrigation Water: Challenges and Opportunities — 17 Phytophthora, 26 Pythium, 27 gêneros de fungos, 8 bactérias, 10 vírus e 13 nematoides detectados em água de irrigação | https://www.researchgate.net/publication/240518240_Plant_Pathogens_in_Irrigation_Water_Challenges_and_Opportunities |
| UnB · dissertação (2014) | Pythium/Phytophthora em água de irrigação: zoósporos móveis nadam em filmes de água; Freitas et al. isolaram Pythium, Phytophthora, Rhizoctonia e Fusarium de reservatório no DF | https://repositorio.unb.br/bitstream/10482/18110/1/2014_EleniceAlvesBarboza.pdf |
| Embrapa · Ageitec (Feijão) | Doenças fúngicas do solo — "A água de irrigação também pode transportar propágulos desses patógenos" (Fusarium, Rhizoctonia, Macrophomina, Sclerotinia) | https://www.embrapa.br/en/web/agencia-de-informacao-tecnologica/cultivos/feijao/producao/doencas/doencas-fungicas/doencas-fungicas-do-solo |
| Embrapa · Frutas do Brasil (Melão) | Doenças causadas por nematoides — "O movimento de nematóides a longas distâncias só ocorre por meio da água de irrigações" | https://www.infoteca.cnptia.embrapa.br/bitstream/doc/131681/1/DOENCASCAUSADASPORNEMATOIDESTECNOLOGIANOMANEJODECONTROLE.pdf |
| Embrapa Hortaliças · COT 27 | Metodologia para seleção de hortaliças com resistência a nematoides: disseminação por água de irrigação contaminada | https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/779126/1/cot27.pdf |
| Embrapa Hortaliças · CT 100 | Qualidade da água de irrigação e disseminação de patógenos em hortaliças | https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/916721/1/ct100.pdf |
| Embrapa · CT 12 | "A disseminação do patógeno se dá por respingos de chuva ou de água de irrigação" (antracnose) | https://www.infoteca.cnptia.embrapa.br/bitstream/doc/425112/1/ct12.pdf |
| EPPO Global Database | Xanthomonas euvesicatoria pv. perforans — "short-distance dispersal is then facilitated by splashing water, such as irrigation or rain" | https://gd.eppo.int/taxon/XANTPF/datasheet |
| Bugwood / APS | Xanthomonas spp. — "bacteria are transferred to new plant tissues by splashing rain and irrigation water splash" | https://wiki.bugwood.org/Xanthomonas_species_(Bacterial_leaf_spot_on_ornamentals) |
| USDA/CAPS · pest datasheet | Xanthomonas oryzae pv. oryzae: "The bacterium can be disseminated by irrigation water, by splashing or windblown rain" | https://caps.ceris.purdue.edu/wp-content/uploads/2025/07/Xanthomonas-oryzae-pv-oryzae-2016.pdf |
| MAPA/Embrapa · Pragas Priorizadas (cap. 22) | Xoo: "a água de irrigação é considerada a forma mais comum de disseminação da doença em grandes áreas" | https://ainfo.cnptia.embrapa.br/digital/bitstream/item/198801/1/Livro-PragasPriorizadas-1ed-2018-Ainfo-ver-final-1-352-373.pdf |
| Embrapa/MAPA · ARP Xoo | "Sementes infectadas, água de irrigação ou de chuvas ... são considerados importantes dispersores da bactéria" | https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1112311/1/DOC36514.pdf |
| Embrapa · Arroz irrigado (manejo de doenças) | "É disseminado rapidamente pela água de irrigação"; esclerócios de Rhizoctonia oryzae "flutuam na água, acumulam-se ao redor da planta" | https://www.embrapa.br/en/web/agencia-de-informacao-tecnologica/cultivos/arroz/producao/sistema-de-cultivo/arroz-irrigado-na-regiao-tropical/manejo-de-pragas/manejo-de-doencas |
| Embrapa Trigo · CTO 35 | Avaliação de resistência à podridão-radicular de Phytophthora em soja: zoósporos "nadam curtas distâncias ou são levados por corrente de água" | https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1096564/1/ID443652018CTO35.pdf |
| Ficha técnica · P. sojae (Embrapa Trigo, Doc. 79) | "A doença é favorecida por água livre no solo ... liberação dos zoósporos, que são flagelados" | https://ihara.com.br/wp-content/uploads/sites/54/2023/03/ficha-tecnica-podridao-radicular-ihara.pdf |
| MAPA · Plano de Contingência Foc R4T | "Dispersão através da água": F. oxysporum dispersa-se eficientemente pela água de irrigação ou escoamento de chuvas | https://www.gov.br/agricultura/pt-br/assuntos/sanidade-animal-e-vegetal/sanidade-vegetal/planos-de-contingencia-pragas-ausentes/fusarium-oxysporum-livro-pragaspriorizadas_1ed-2018-243-258.pdf |
| Embrapa · Ageitec (Feijão-caupi) | "A disseminação da doença é feita pelas práticas culturais, água de irrigação, vento e sementes infectadas"; murcha-de-fusário disseminada pela água de irrigação | https://www.agencia.cnptia.embrapa.br/gestor/feijao-caupi/arvore/CONTAG01_59_510200683537.html |
| APS · White mold (Português) | Sclerotinia sclerotiorum: "a germinação nas folhas só ocorre na presença de água livre, como chuva, irrigação por aspersão e orvalho" | https://www.apsnet.org/edcenter/pdlessons/Pages/WhiteMoldPortuguese.aspx |
| Univ. Nebraska · Water Resources Bulletin (1975) | Pollution of Surface Irrigation Waters by Plant Pathogenic Organisms: Xanthomonas phaseoli, Sclerotinia sclerotiorum e nematoides em água de irrigação | https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1303&context=plantpathpapers |
| Fundecitrus | Cancro cítrico: "o fator ambiental mais importante nessa fase é a água, que serve como veículo de transporte da bactéria" | https://www.fundecitrus.com.br/pragas-e-doencas/cancro-citrico/ |
| Incaper · Livro Café Conilon (cap. 17) | Cercosporiose, antracnose, bacteriose e nematoides do cafeeiro: disseminação por respingos de água da chuva/irrigação por aspersão e enxurradas | https://biblioteca.incaper.es.gov.br/digital/bitstream/item/710/1/livro2007cafeconilon17.pdf |
| SciELO · Fitopatologia Brasileira | Giberela do trigo: "macroconídios ... liberados e dispersos pela ação da chuva"; dispersão por respingos | http://www.scielo.br/j/fb/a/WHmhpn6NbZJDn49RvBqjQ7D/?lang=pt |
| APS · Fusarium head blight (Português) | F. graminearum: "macroconídios ... disseminados para as plantas por meio de respingos de chuva" | https://www.apsnet.org/edcenter/pdlessons/Pages/FusariumPort.aspx |
| GEA / ESALQ-USP | Giberela e brusone no trigo: "A dispersão em curtas distâncias é realizada por conídios com respingos de chuva" | https://www.gea-esalq.com/informativo-gea-giberela-e-brusone-no-trigo |
| Embrapa · Agência de Informação (Milho) | Cercosporiose, mancha de Diplodia e antracnose: "disseminação ocorre através de esporos e restos de cultura levados pelo vento e respingos de chuva" | https://www.agencia.cnptia.embrapa.br/gestor/territorio_sisal/arvore/CONT000fckl80cd02wx5eo0a2ndxy5w90bbu.html |
| Embrapa · CT 16 | Mancha por Cercospora no milho: "A disseminação desse patógeno ocorre pelo vento e por respingos de chuva" | https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/484065/1/ct16.pdf |
| Embrapa / Campo & Negócios | Ramulose do algodoeiro: "a disseminação dos esporos do fungo a curtas distâncias ocorre por meio de respingos da água das chuvas ou irrigação" | https://campoenegocios.com/cenario-brasileiro-sobre-as-doencas-do-algodoeiro/ |
| UFU · Doenças fúngicas (Algodão, Feijão, Soja) | "Os conídios do fungo são dispersos principalmente pelos respingos de chuva e água de irrigação"; Fusarium por partículas de solo arrastadas pela água | https://www.portalselecao.ufu.br/sisarq/ArquivoAdministrativos/download/3f8dcd6ba8c3eafe3d3d0dce39c0460b |
| UNOESTE · Manual de bolso (Algodoeiro) | Ramulose: "Disseminação: pela água, pelo vento ..."; ferrugem do algodoeiro "pelo vento" (excluída) | http://sites.unoeste.br/gea/wp-content/uploads/2018/11/Manual-de-bolso-Identifica%C3%A7%C3%A3o-das-doen%C3%A7as-do-algodoeiro.pdf |
| Embrapa Arroz e Feijão · Boletim de P&D 1 | "A disseminação a curta distância ... é realizada por meio dos respingos da água de chuva ou da irrigação por aspersão" | https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/211439/1/bolpesq1.pdf |
| Embrapa Soja · SP 17 | "A disseminação ocorre pelo contato entre folhas doentes e sadias na presença de água da chuva ou de orvalho ou de irrigação" | https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1128404/1/p.-227-264-de-SP-17-2-020-online.pdf |
| Portal Embrapa | Vazio sanitário: "o fungo se dissemina a longas distâncias pelo vento" (Phakopsora pachyrhizi) | https://www.embrapa.br/en/busca-de-noticias/-/noticia/13556333/vazio-sanitario-e-medida-importante-contra-ferrugem-asiatica |
| AEASE · Agressividade da ferrugem asiática | "A disseminação da ferrugem ocorre unicamente através da dispersão dos uredosporos pelo vento" (até 96 km/semana) | https://www.aease.org.br/agressividade-da-ferrugem-asiatica/ |
| Fundecitrus · HLB / Greening | "Não é disseminada por sementes, vento, água ou qualquer instrumento agrícola" — apenas psilídeo e enxertia; CLas em >99% das plantas doentes | https://ww2.fundecitrus.com.br/doencas/greening |
| Instituto Biológico / Embrapa (cana) | Ferrugem marrom detectada no Brasil em 1986; ferrugem alaranjada confirmada em 2009 — disseminação pelo vento, excluída do catálogo hídrico | https://biologico.agricultura.sp.gov.br/uploads/docs/pag/v5_1/dagostini.html |

## 5. Catálogo por cultura

Contagens já incluem o bloco universal de 10 agentes de veiculação hídrica.

### Soja (`soja`) — 13 doenças / 13 soluções

| Doença | Patógeno | Via hídrica | Solução correspondente | Fonte |
|---|---|---|---|---|
| Podridão radicular de fitóftora | *Phytophthora sojae* | Zoósporos biflagelados nadam na água livre do solo (chuva/irrigação) até as raízes | Podridão radicular de fitóftora — filtrar e clorar a água de irrigação + cultivar resistente (Rps) | [Embrapa Trigo · CTO 35](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1096564/1/ID443652018CTO35.pdf) |
| Tombamento de plântulas / podridão de sementes | *Pythium spp.* | Zoósporos móveis em água de irrigação contaminada | Tombamento de plântulas / podridão de sementes — desinfestação do reservatório e da água de irrigação | [UnB · dissertação (2014)](https://repositorio.unb.br/bitstream/10482/18110/1/2014_EleniceAlvesBarboza.pdf) |
| Mofo-branco / podridão branca da haste | *Sclerotinia sclerotiorum* | Água de irrigação transporta propágulos/escleródios; infecção exige água livre | Mofo-branco / podridão branca da haste — manejar a irrigação e filtrar escleródios da água | [APS · White mold (Português)](https://www.apsnet.org/edcenter/pdlessons/Pages/WhiteMoldPortuguese.aspx) |
| Infecções intestinais / indicador de contaminação fecal | *Escherichia coli (cepas patogênicas)* | Água de irrigação contaminada (via fecal) | Infecções intestinais / indicador de contaminação fecal — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Indicador de contaminação fecal da água de irrigação | *Coliformes termotolerantes* | Água de irrigação / escoamento superficial | Indicador de contaminação fecal da água de irrigação — filtração + cloração e monitoramento | [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450) |
| Cólera | *Vibrio cholerae* | Água contaminada | Cólera — cloração e controle da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Leptospirose | *Leptospira interrogans* | Água contaminada / enxurrada | Leptospirose — desinfecção da água e controle de roedores | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Salmonelose / febre tifoide | *Salmonella spp.* | Água contaminada / respingos | Salmonelose / febre tifoide — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Shigelose / disenteria bacilar | *Shigella sonnei* | Água contaminada | Shigelose / disenteria bacilar — cloração da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Giardíase | *Giardia duodenalis* | Água contaminada (cistos) | Giardíase — filtração mecânica + desinfecção | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Criptosporidiose | *Cryptosporidium parvum* | Água contaminada (oocistos) | Criptosporidiose — filtração de barreira | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Hepatite A | *Hepatitis A virus (HAV)* | Água contaminada | Hepatite A — desinfecção da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Esquistossomose | *Schistosoma mansoni* | Água com cercárias | Esquistossomose — filtração e saneamento da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |

**Curiosidades desta cultura:**

- Os uredósporos da ferrugem-asiática podem percorrer até 96 km por semana pelo vento — por isso a doença foi retirada deste catálogo, que só lista vias hídricas. — [AEASE · Agressividade da ferrugem asiática](https://www.aease.org.br/agressividade-da-ferrugem-asiatica/)
- O vazio sanitário da soja dura de 60 a 90 dias e existe para reduzir o inóculo do fungo na entressafra. — [Portal Embrapa](https://www.embrapa.br/en/busca-de-noticias/-/noticia/13556333/vazio-sanitario-e-medida-importante-contra-ferrugem-asiatica)
- Zoósporos de Phytophthora sojae são atraídos por isoflavonoides (genisteína e daidzeína) liberados pelas raízes e nadam até elas na água do solo. — [Ficha técnica · P. sojae (Embrapa Trigo, Doc. 79)](https://ihara.com.br/wp-content/uploads/sites/54/2023/03/ficha-tecnica-podridao-radicular-ihara.pdf)
- A Portaria GM/MS 888/2021 fixa pH 6,0-9,5, cloro residual livre minimo de 0,2 mg/L (VMP 5 mg/L), turbidez ate 5 uT e ausencia de E. coli em 100 mL. — [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html)
- A CONAMA 357/2005 destina a classe 3 a irrigacao de culturas arboreas, cerealiferas e forrageiras, com pH 6,0-9,0. — [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450)

> Ferrugem-asiática, oídio e viroses foram removidos: não contaminam a lavoura pela água.

### Café (`cafe`) — 12 doenças / 12 soluções

| Doença | Patógeno | Via hídrica | Solução correspondente | Fonte |
|---|---|---|---|---|
| Cercosporiose / mancha-de-olho-pardo | *Cercospora coffeicola* | Conídios disseminados por respingos de chuva e irrigação por aspersão | Cercosporiose / mancha-de-olho-pardo — evitar aspersão excessiva e tratar a água de irrigação | [Incaper · Livro Café Conilon (cap. 17)](https://biblioteca.incaper.es.gov.br/digital/bitstream/item/710/1/livro2007cafeconilon17.pdf) |
| Antracnose do cafeeiro | *Colletotrichum coffeanum* | Respingos de chuva espalham os conídios; germinação exige água livre | Antracnose do cafeeiro — reduzir molhamento foliar e filtrar a água de aspersão | [Incaper · Livro Café Conilon (cap. 17)](https://biblioteca.incaper.es.gov.br/digital/bitstream/item/710/1/livro2007cafeconilon17.pdf) |
| Infecções intestinais / indicador de contaminação fecal | *Escherichia coli (cepas patogênicas)* | Água de irrigação contaminada (via fecal) | Infecções intestinais / indicador de contaminação fecal — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Indicador de contaminação fecal da água de irrigação | *Coliformes termotolerantes* | Água de irrigação / escoamento superficial | Indicador de contaminação fecal da água de irrigação — filtração + cloração e monitoramento | [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450) |
| Cólera | *Vibrio cholerae* | Água contaminada | Cólera — cloração e controle da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Leptospirose | *Leptospira interrogans* | Água contaminada / enxurrada | Leptospirose — desinfecção da água e controle de roedores | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Salmonelose / febre tifoide | *Salmonella spp.* | Água contaminada / respingos | Salmonelose / febre tifoide — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Shigelose / disenteria bacilar | *Shigella sonnei* | Água contaminada | Shigelose / disenteria bacilar — cloração da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Giardíase | *Giardia duodenalis* | Água contaminada (cistos) | Giardíase — filtração mecânica + desinfecção | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Criptosporidiose | *Cryptosporidium parvum* | Água contaminada (oocistos) | Criptosporidiose — filtração de barreira | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Hepatite A | *Hepatitis A virus (HAV)* | Água contaminada | Hepatite A — desinfecção da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Esquistossomose | *Schistosoma mansoni* | Água com cercárias | Esquistossomose — filtração e saneamento da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |

**Curiosidades desta cultura:**

- Em viveiros de café, o excesso de irrigação é apontado como um dos principais favorecedores de doenças foliares bacterianas e fúngicas. — [Incaper · Livro Café Conilon (cap. 17)](https://biblioteca.incaper.es.gov.br/digital/bitstream/item/710/1/livro2007cafeconilon17.pdf)
- Nematoides do cafeeiro são levados de uma área para outra pelas enxurradas, que carregam solo infestado. — [Incaper · Livro Café Conilon (cap. 17)](https://biblioteca.incaper.es.gov.br/digital/bitstream/item/710/1/livro2007cafeconilon17.pdf)
- A irrigação por aspersão em pivô central arrasta inóculo da face superior para a inferior das folhas e entre plantas da mesma linha. — [Incaper · Livro Café Conilon (cap. 17)](https://biblioteca.incaper.es.gov.br/digital/bitstream/item/710/1/livro2007cafeconilon17.pdf)
- A Portaria GM/MS 888/2021 fixa pH 6,0-9,5, cloro residual livre minimo de 0,2 mg/L (VMP 5 mg/L), turbidez ate 5 uT e ausencia de E. coli em 100 mL. — [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html)
- A CONAMA 357/2005 destina a classe 3 a irrigacao de culturas arboreas, cerealiferas e forrageiras, com pH 6,0-9,0. — [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450)

> A ferrugem do cafeeiro (Hemileia vastatrix) foi removida: disseminação predominantemente aérea.

### Trigo (`trigo`) — 12 doenças / 12 soluções

| Doença | Patógeno | Via hídrica | Solução correspondente | Fonte |
|---|---|---|---|---|
| Giberela / fusariose da espiga | *Fusarium graminearum* | Macroconídios liberados e dispersos por respingos de chuva | Giberela / fusariose da espiga — monitorar chuva/irrigação no florescimento e manejar a água | [SciELO · Fitopatologia Brasileira](http://www.scielo.br/j/fb/a/WHmhpn6NbZJDn49RvBqjQ7D/?lang=pt) |
| Brusone do trigo | *Pyricularia oryzae* | Conídios dispersos em curta distância por respingos de chuva | Brusone do trigo — evitar molhamento prolongado e controlar a lâmina de irrigação | [GEA / ESALQ-USP](https://www.gea-esalq.com/informativo-gea-giberela-e-brusone-no-trigo) |
| Infecções intestinais / indicador de contaminação fecal | *Escherichia coli (cepas patogênicas)* | Água de irrigação contaminada (via fecal) | Infecções intestinais / indicador de contaminação fecal — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Indicador de contaminação fecal da água de irrigação | *Coliformes termotolerantes* | Água de irrigação / escoamento superficial | Indicador de contaminação fecal da água de irrigação — filtração + cloração e monitoramento | [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450) |
| Cólera | *Vibrio cholerae* | Água contaminada | Cólera — cloração e controle da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Leptospirose | *Leptospira interrogans* | Água contaminada / enxurrada | Leptospirose — desinfecção da água e controle de roedores | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Salmonelose / febre tifoide | *Salmonella spp.* | Água contaminada / respingos | Salmonelose / febre tifoide — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Shigelose / disenteria bacilar | *Shigella sonnei* | Água contaminada | Shigelose / disenteria bacilar — cloração da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Giardíase | *Giardia duodenalis* | Água contaminada (cistos) | Giardíase — filtração mecânica + desinfecção | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Criptosporidiose | *Cryptosporidium parvum* | Água contaminada (oocistos) | Criptosporidiose — filtração de barreira | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Hepatite A | *Hepatitis A virus (HAV)* | Água contaminada | Hepatite A — desinfecção da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Esquistossomose | *Schistosoma mansoni* | Água com cercárias | Esquistossomose — filtração e saneamento da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |

**Curiosidades desta cultura:**

- Modelos de previsão da giberela usam temperatura, chuva do dia anterior e horas com umidade acima de 80% — a água é o motor da epidemia. — [SciELO · Fitopatologia Brasileira](http://www.scielo.br/j/fb/a/WHmhpn6NbZJDn49RvBqjQ7D/?lang=pt)
- Para infectar a espiga de trigo, a giberela precisa de 30 a 36 horas de molhamento foliar contínuo. — [GEA / ESALQ-USP](https://www.gea-esalq.com/informativo-gea-giberela-e-brusone-no-trigo)
- Grãos infectados por F. graminearum podem conter micotoxinas (DON e ZEA), por isso a doença afeta também a qualidade do alimento. — [APS · Fusarium head blight (Português)](https://www.apsnet.org/edcenter/pdlessons/Pages/FusariumPort.aspx)
- A Portaria GM/MS 888/2021 fixa pH 6,0-9,5, cloro residual livre minimo de 0,2 mg/L (VMP 5 mg/L), turbidez ate 5 uT e ausencia de E. coli em 100 mL. — [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html)
- A CONAMA 357/2005 destina a classe 3 a irrigacao de culturas arboreas, cerealiferas e forrageiras, com pH 6,0-9,0. — [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450)

> Ferrugens do trigo (Puccinia triticina) foram removidas: dispersão pelo vento.

### Laranja / Citros (`laranja`) — 12 doenças / 12 soluções

| Doença | Patógeno | Via hídrica | Solução correspondente | Fonte |
|---|---|---|---|---|
| Cancro cítrico | *Xanthomonas citri subsp. citri* | A água é o principal veículo: a bactéria nada no filme de água e se espalha por respingos | Cancro cítrico — desinfestar a água de irrigação e evitar aspersão sobre lesões | [Fundecitrus](https://www.fundecitrus.com.br/pragas-e-doencas/cancro-citrico/) |
| Gomose / podridão radicular dos citros | *Phytophthora spp.* | Zoósporos móveis em água de irrigação e solo encharcado | Gomose / podridão radicular dos citros — filtrar e desinfestar a água de irrigação | [Hong & Moorman (2005) · revisão](https://www.researchgate.net/publication/240518240_Plant_Pathogens_in_Irrigation_Water_Challenges_and_Opportunities) |
| Infecções intestinais / indicador de contaminação fecal | *Escherichia coli (cepas patogênicas)* | Água de irrigação contaminada (via fecal) | Infecções intestinais / indicador de contaminação fecal — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Indicador de contaminação fecal da água de irrigação | *Coliformes termotolerantes* | Água de irrigação / escoamento superficial | Indicador de contaminação fecal da água de irrigação — filtração + cloração e monitoramento | [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450) |
| Cólera | *Vibrio cholerae* | Água contaminada | Cólera — cloração e controle da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Leptospirose | *Leptospira interrogans* | Água contaminada / enxurrada | Leptospirose — desinfecção da água e controle de roedores | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Salmonelose / febre tifoide | *Salmonella spp.* | Água contaminada / respingos | Salmonelose / febre tifoide — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Shigelose / disenteria bacilar | *Shigella sonnei* | Água contaminada | Shigelose / disenteria bacilar — cloração da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Giardíase | *Giardia duodenalis* | Água contaminada (cistos) | Giardíase — filtração mecânica + desinfecção | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Criptosporidiose | *Cryptosporidium parvum* | Água contaminada (oocistos) | Criptosporidiose — filtração de barreira | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Hepatite A | *Hepatitis A virus (HAV)* | Água contaminada | Hepatite A — desinfecção da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Esquistossomose | *Schistosoma mansoni* | Água com cercárias | Esquistossomose — filtração e saneamento da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |

**Curiosidades desta cultura:**

- O cancro cítrico foi constatado no Brasil em 1957 e a água da chuva é o fator ambiental mais importante da disseminação. — [Fundecitrus](https://www.fundecitrus.com.br/pragas-e-doencas/cancro-citrico/)
- O HLB não passa pela água: o Fundecitrus afirma que não é disseminado por sementes, vento, água ou instrumentos — apenas pelo psilídeo e por enxertia. — [Fundecitrus · HLB / Greening](https://ww2.fundecitrus.com.br/doencas/greening)
- Chuvas com vento podem transportar a bactéria do cancro cítrico por alguns quilômetros a partir da árvore afetada. — [Fundecitrus](https://www.fundecitrus.com.br/pragas-e-doencas/cancro-citrico/)
- A Portaria GM/MS 888/2021 fixa pH 6,0-9,5, cloro residual livre minimo de 0,2 mg/L (VMP 5 mg/L), turbidez ate 5 uT e ausencia de E. coli em 100 mL. — [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html)
- A CONAMA 357/2005 destina a classe 3 a irrigacao de culturas arboreas, cerealiferas e forrageiras, com pH 6,0-9,0. — [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450)

> HLB/greening e o psilídeo vetor foram removidos: via exclusivamente por inseto/enxertia, não pela água.

### Algodão (`algodao`) — 12 doenças / 12 soluções

| Doença | Patógeno | Via hídrica | Solução correspondente | Fonte |
|---|---|---|---|---|
| Ramulose (superbrotamento) | *Colletotrichum gossypii var. cephalosporioides* | Respingos da água das chuvas ou da irrigação liberam os esporos da matriz mucilaginosa | Ramulose (superbrotamento) — evitar aspersão e respingos; tratar a água de irrigação | [Embrapa / Campo & Negócios](https://campoenegocios.com/cenario-brasileiro-sobre-as-doencas-do-algodoeiro/) |
| Murcha-de-fusário do algodoeiro | *Fusarium oxysporum f. sp. vasinfectum* | Partículas de solo infestado arrastadas pela água e água de irrigação | Murcha-de-fusário do algodoeiro — filtrar a água e evitar escoamento de área infestada | [MAPA · Plano de Contingência Foc R4T](https://www.gov.br/agricultura/pt-br/assuntos/sanidade-animal-e-vegetal/sanidade-vegetal/planos-de-contingencia-pragas-ausentes/fusarium-oxysporum-livro-pragaspriorizadas_1ed-2018-243-258.pdf) |
| Infecções intestinais / indicador de contaminação fecal | *Escherichia coli (cepas patogênicas)* | Água de irrigação contaminada (via fecal) | Infecções intestinais / indicador de contaminação fecal — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Indicador de contaminação fecal da água de irrigação | *Coliformes termotolerantes* | Água de irrigação / escoamento superficial | Indicador de contaminação fecal da água de irrigação — filtração + cloração e monitoramento | [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450) |
| Cólera | *Vibrio cholerae* | Água contaminada | Cólera — cloração e controle da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Leptospirose | *Leptospira interrogans* | Água contaminada / enxurrada | Leptospirose — desinfecção da água e controle de roedores | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Salmonelose / febre tifoide | *Salmonella spp.* | Água contaminada / respingos | Salmonelose / febre tifoide — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Shigelose / disenteria bacilar | *Shigella sonnei* | Água contaminada | Shigelose / disenteria bacilar — cloração da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Giardíase | *Giardia duodenalis* | Água contaminada (cistos) | Giardíase — filtração mecânica + desinfecção | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Criptosporidiose | *Cryptosporidium parvum* | Água contaminada (oocistos) | Criptosporidiose — filtração de barreira | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Hepatite A | *Hepatitis A virus (HAV)* | Água contaminada | Hepatite A — desinfecção da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Esquistossomose | *Schistosoma mansoni* | Água com cercárias | Esquistossomose — filtração e saneamento da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |

**Curiosidades desta cultura:**

- A ramulose pode reduzir drasticamente o porte da planta: o fungo mata o meristema apical e provoca superbrotamento. — [Embrapa / Campo & Negócios](https://campoenegocios.com/cenario-brasileiro-sobre-as-doencas-do-algodoeiro/)
- No algodoeiro, a disseminação a curta distância da ramulose ocorre por respingos de água; a longa distância, por sementes contaminadas. — [Embrapa / Campo & Negócios](https://campoenegocios.com/cenario-brasileiro-sobre-as-doencas-do-algodoeiro/)
- O manual de bolso da UNOESTE distingue explicitamente: ramulose 'pela água', ferrugem do algodoeiro 'pelo vento' — só a primeira entra neste catálogo. — [UNOESTE · Manual de bolso (Algodoeiro)](http://sites.unoeste.br/gea/wp-content/uploads/2018/11/Manual-de-bolso-Identifica%C3%A7%C3%A3o-das-doen%C3%A7as-do-algodoeiro.pdf)
- A Portaria GM/MS 888/2021 fixa pH 6,0-9,5, cloro residual livre minimo de 0,2 mg/L (VMP 5 mg/L), turbidez ate 5 uT e ausencia de E. coli em 100 mL. — [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html)
- A CONAMA 357/2005 destina a classe 3 a irrigacao de culturas arboreas, cerealiferas e forrageiras, com pH 6,0-9,0. — [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450)

> Ferrugem do algodoeiro e viroses transmitidas por pulgão foram removidas.

### Milho (`milho`) — 12 doenças / 12 soluções

| Doença | Patógeno | Via hídrica | Solução correspondente | Fonte |
|---|---|---|---|---|
| Cercosporiose / mancha cinzenta do milho | *Cercospora zeae-maydis* | Esporos e restos de cultura levados por respingos de chuva | Cercosporiose / mancha cinzenta do milho — reduzir respingos de aspersão sobre restos culturais | [Embrapa · Agência de Informação (Milho)](https://www.agencia.cnptia.embrapa.br/gestor/territorio_sisal/arvore/CONT000fckl80cd02wx5eo0a2ndxy5w90bbu.html) |
| Antracnose do milho / podridão do colmo | *Colletotrichum graminicola* | Conídios disseminados por respingos de chuva | Antracnose do milho / podridão do colmo — controlar a água de irrigação e o molhamento do colmo | [Embrapa · Agência de Informação (Milho)](https://www.agencia.cnptia.embrapa.br/gestor/territorio_sisal/arvore/CONT000fckl80cd02wx5eo0a2ndxy5w90bbu.html) |
| Infecções intestinais / indicador de contaminação fecal | *Escherichia coli (cepas patogênicas)* | Água de irrigação contaminada (via fecal) | Infecções intestinais / indicador de contaminação fecal — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Indicador de contaminação fecal da água de irrigação | *Coliformes termotolerantes* | Água de irrigação / escoamento superficial | Indicador de contaminação fecal da água de irrigação — filtração + cloração e monitoramento | [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450) |
| Cólera | *Vibrio cholerae* | Água contaminada | Cólera — cloração e controle da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Leptospirose | *Leptospira interrogans* | Água contaminada / enxurrada | Leptospirose — desinfecção da água e controle de roedores | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Salmonelose / febre tifoide | *Salmonella spp.* | Água contaminada / respingos | Salmonelose / febre tifoide — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Shigelose / disenteria bacilar | *Shigella sonnei* | Água contaminada | Shigelose / disenteria bacilar — cloração da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Giardíase | *Giardia duodenalis* | Água contaminada (cistos) | Giardíase — filtração mecânica + desinfecção | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Criptosporidiose | *Cryptosporidium parvum* | Água contaminada (oocistos) | Criptosporidiose — filtração de barreira | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Hepatite A | *Hepatitis A virus (HAV)* | Água contaminada | Hepatite A — desinfecção da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Esquistossomose | *Schistosoma mansoni* | Água com cercárias | Esquistossomose — filtração e saneamento da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |

**Curiosidades desta cultura:**

- A mancha por Cercospora no milho pode causar perdas superiores a 80% na produção de grãos. — [Embrapa · CT 16](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/484065/1/ct16.pdf)
- Restos de cultura infectados na superfície do solo são a fonte de inóculo que os respingos de chuva levantam até as folhas. — [Embrapa · CT 16](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/484065/1/ct16.pdf)
- A giberela (F. graminearum) sobrevive em colmos de milho e palha de trigo, e seus macroconídios são dispersos por respingos de chuva. — [APS · Fusarium head blight (Português)](https://www.apsnet.org/edcenter/pdlessons/Pages/FusariumPort.aspx)
- A Portaria GM/MS 888/2021 fixa pH 6,0-9,5, cloro residual livre minimo de 0,2 mg/L (VMP 5 mg/L), turbidez ate 5 uT e ausencia de E. coli em 100 mL. — [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html)
- A CONAMA 357/2005 destina a classe 3 a irrigacao de culturas arboreas, cerealiferas e forrageiras, com pH 6,0-9,0. — [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450)

> Ferrugens do milho (Puccinia polysora, P. sorghi) e mancha de Diplodia por via aérea foram removidas.

### Cana-de-açúcar (`cana`) — 12 doenças / 12 soluções

| Doença | Patógeno | Via hídrica | Solução correspondente | Fonte |
|---|---|---|---|---|
| Tombamento de plântulas / podridão radicular | *Pythium spp.* | Zoósporos móveis em água de irrigação contaminada | Tombamento de plântulas / podridão radicular — desinfestação do reservatório de irrigação | [UnB · dissertação (2014)](https://repositorio.unb.br/bitstream/10482/18110/1/2014_EleniceAlvesBarboza.pdf) |
| Nematoide-das-galhas da cana | *Meloidogyne javanica* | Juvenis J2 e solo infestado transportados pela água de irrigação | Nematoide-das-galhas da cana — filtrar a água de irrigação e evitar escoamento de solo infestado | [Embrapa · Frutas do Brasil (Melão)](https://www.infoteca.cnptia.embrapa.br/bitstream/doc/131681/1/DOENCASCAUSADASPORNEMATOIDESTECNOLOGIANOMANEJODECONTROLE.pdf) |
| Infecções intestinais / indicador de contaminação fecal | *Escherichia coli (cepas patogênicas)* | Água de irrigação contaminada (via fecal) | Infecções intestinais / indicador de contaminação fecal — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Indicador de contaminação fecal da água de irrigação | *Coliformes termotolerantes* | Água de irrigação / escoamento superficial | Indicador de contaminação fecal da água de irrigação — filtração + cloração e monitoramento | [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450) |
| Cólera | *Vibrio cholerae* | Água contaminada | Cólera — cloração e controle da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Leptospirose | *Leptospira interrogans* | Água contaminada / enxurrada | Leptospirose — desinfecção da água e controle de roedores | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Salmonelose / febre tifoide | *Salmonella spp.* | Água contaminada / respingos | Salmonelose / febre tifoide — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Shigelose / disenteria bacilar | *Shigella sonnei* | Água contaminada | Shigelose / disenteria bacilar — cloração da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Giardíase | *Giardia duodenalis* | Água contaminada (cistos) | Giardíase — filtração mecânica + desinfecção | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Criptosporidiose | *Cryptosporidium parvum* | Água contaminada (oocistos) | Criptosporidiose — filtração de barreira | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Hepatite A | *Hepatitis A virus (HAV)* | Água contaminada | Hepatite A — desinfecção da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Esquistossomose | *Schistosoma mansoni* | Água com cercárias | Esquistossomose — filtração e saneamento da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |

**Curiosidades desta cultura:**

- A ferrugem marrom da cana foi detectada no Brasil em 1986; a ferrugem alaranjada só foi confirmada em 2009 — ambas foram excluídas do catálogo por dispersão aérea. — [Instituto Biológico / Embrapa (cana)](https://biologico.agricultura.sp.gov.br/uploads/docs/pag/v5_1/dagostini.html)
- Fitonematoides se movem sozinhos menos de 50 cm por ano no solo; a água de irrigação é que os leva a longas distâncias. — [Embrapa · Frutas do Brasil (Melão)](https://www.infoteca.cnptia.embrapa.br/bitstream/doc/131681/1/DOENCASCAUSADASPORNEMATOIDESTECNOLOGIANOMANEJODECONTROLE.pdf)
- Reservatórios de irrigação podem abrigar Pythium, Phytophthora, Rhizoctonia e Fusarium simultaneamente. — [UnB · dissertação (2014)](https://repositorio.unb.br/bitstream/10482/18110/1/2014_EleniceAlvesBarboza.pdf)
- A Portaria GM/MS 888/2021 fixa pH 6,0-9,5, cloro residual livre minimo de 0,2 mg/L (VMP 5 mg/L), turbidez ate 5 uT e ausencia de E. coli em 100 mL. — [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html)
- A CONAMA 357/2005 destina a classe 3 a irrigacao de culturas arboreas, cerealiferas e forrageiras, com pH 6,0-9,0. — [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450)

> Ferrugens e o raquitismo-da-soqueira (mudas/implementos) foram removidos.

### Arroz (`arroz`) — 12 doenças / 12 soluções

| Doença | Patógeno | Via hídrica | Solução correspondente | Fonte |
|---|---|---|---|---|
| Crestamento bacteriano / queima bacteriana do arroz | *Xanthomonas oryzae pv. oryzae* | A água de irrigação é a forma mais comum de disseminação em grandes áreas; a bactéria sobrevive nela | Crestamento bacteriano / queima bacteriana do arroz — manejar e desinfestar a água de irrigação entre talhões | [MAPA/Embrapa · Pragas Priorizadas (cap. 22)](https://ainfo.cnptia.embrapa.br/digital/bitstream/item/198801/1/Livro-PragasPriorizadas-1ed-2018-Ainfo-ver-final-1-352-373.pdf) |
| Mancha-da-bainha / queima-da-bainha | *Rhizoctonia oryzae / R. solani* | Esclerócios flutuam na água, acumulam-se junto à planta e causam a infecção inicial | Mancha-da-bainha / queima-da-bainha — filtrar escleródios flutuantes da água de irrigação | [Embrapa · Arroz irrigado (manejo de doenças)](https://www.embrapa.br/en/web/agencia-de-informacao-tecnologica/cultivos/arroz/producao/sistema-de-cultivo/arroz-irrigado-na-regiao-tropical/manejo-de-pragas/manejo-de-doencas) |
| Infecções intestinais / indicador de contaminação fecal | *Escherichia coli (cepas patogênicas)* | Água de irrigação contaminada (via fecal) | Infecções intestinais / indicador de contaminação fecal — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Indicador de contaminação fecal da água de irrigação | *Coliformes termotolerantes* | Água de irrigação / escoamento superficial | Indicador de contaminação fecal da água de irrigação — filtração + cloração e monitoramento | [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450) |
| Cólera | *Vibrio cholerae* | Água contaminada | Cólera — cloração e controle da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Leptospirose | *Leptospira interrogans* | Água contaminada / enxurrada | Leptospirose — desinfecção da água e controle de roedores | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Salmonelose / febre tifoide | *Salmonella spp.* | Água contaminada / respingos | Salmonelose / febre tifoide — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Shigelose / disenteria bacilar | *Shigella sonnei* | Água contaminada | Shigelose / disenteria bacilar — cloração da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Giardíase | *Giardia duodenalis* | Água contaminada (cistos) | Giardíase — filtração mecânica + desinfecção | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Criptosporidiose | *Cryptosporidium parvum* | Água contaminada (oocistos) | Criptosporidiose — filtração de barreira | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Hepatite A | *Hepatitis A virus (HAV)* | Água contaminada | Hepatite A — desinfecção da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Esquistossomose | *Schistosoma mansoni* | Água com cercárias | Esquistossomose — filtração e saneamento da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |

**Curiosidades desta cultura:**

- Em arroz irrigado, a água é um dos modos mais importantes de dispersão do crestamento bacteriano — por isso o manejo da lâmina é parte do controle. — [MAPA/Embrapa · Pragas Priorizadas (cap. 22)](https://ainfo.cnptia.embrapa.br/digital/bitstream/item/198801/1/Livro-PragasPriorizadas-1ed-2018-Ainfo-ver-final-1-352-373.pdf)
- Os escleródios da mancha-da-bainha flutuam na água de irrigação e conseguem sobreviver até 2 anos no solo. — [Embrapa · Arroz irrigado (manejo de doenças)](https://www.embrapa.br/en/web/agencia-de-informacao-tecnologica/cultivos/arroz/producao/sistema-de-cultivo/arroz-irrigado-na-regiao-tropical/manejo-de-pragas/manejo-de-doencas)
- A brusone pode comprometer até 100% da produção em anos epidêmicos, mas seus conídios não sobrevivem mais de 24 h na água de irrigação — por isso não está no catálogo hídrico. — [Embrapa · Arroz irrigado (manejo de doenças)](https://www.embrapa.br/en/web/agencia-de-informacao-tecnologica/cultivos/arroz/producao/sistema-de-cultivo/arroz-irrigado-na-regiao-tropical/manejo-de-pragas/manejo-de-doencas)
- A Portaria GM/MS 888/2021 fixa pH 6,0-9,5, cloro residual livre minimo de 0,2 mg/L (VMP 5 mg/L), turbidez ate 5 uT e ausencia de E. coli em 100 mL. — [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html)
- A CONAMA 357/2005 destina a classe 3 a irrigacao de culturas arboreas, cerealiferas e forrageiras, com pH 6,0-9,0. — [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450)

> Brusone (conídios < 24 h na água, dispersão aérea) e carvão-da-folha (vento) foram removidos.

### Feijão (`feijao`) — 12 doenças / 12 soluções

| Doença | Patógeno | Via hídrica | Solução correspondente | Fonte |
|---|---|---|---|---|
| Antracnose do feijoeiro | *Colletotrichum lindemuthianum* | Respingos de água da chuva ou da irrigação por aspersão dissolvem a matriz gelatinosa e liberam os esporos | Antracnose do feijoeiro — evitar aspersão sobre lesões e tratar a água de irrigação | [Embrapa Arroz e Feijão · Boletim de P&D 1](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/211439/1/bolpesq1.pdf) |
| Mofo-branco do feijoeiro | *Sclerotinia sclerotiorum* | A água de irrigação transporta propágulos e escleródios; biofungicidas são aplicados via água de irrigação | Mofo-branco do feijoeiro — manejar a irrigação e filtrar propágulos da água | [Embrapa · Ageitec (Feijão)](https://www.embrapa.br/en/web/agencia-de-informacao-tecnologica/cultivos/feijao/producao/doencas/doencas-fungicas/doencas-fungicas-do-solo) |
| Infecções intestinais / indicador de contaminação fecal | *Escherichia coli (cepas patogênicas)* | Água de irrigação contaminada (via fecal) | Infecções intestinais / indicador de contaminação fecal — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Indicador de contaminação fecal da água de irrigação | *Coliformes termotolerantes* | Água de irrigação / escoamento superficial | Indicador de contaminação fecal da água de irrigação — filtração + cloração e monitoramento | [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450) |
| Cólera | *Vibrio cholerae* | Água contaminada | Cólera — cloração e controle da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Leptospirose | *Leptospira interrogans* | Água contaminada / enxurrada | Leptospirose — desinfecção da água e controle de roedores | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Salmonelose / febre tifoide | *Salmonella spp.* | Água contaminada / respingos | Salmonelose / febre tifoide — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Shigelose / disenteria bacilar | *Shigella sonnei* | Água contaminada | Shigelose / disenteria bacilar — cloração da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Giardíase | *Giardia duodenalis* | Água contaminada (cistos) | Giardíase — filtração mecânica + desinfecção | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Criptosporidiose | *Cryptosporidium parvum* | Água contaminada (oocistos) | Criptosporidiose — filtração de barreira | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Hepatite A | *Hepatitis A virus (HAV)* | Água contaminada | Hepatite A — desinfecção da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Esquistossomose | *Schistosoma mansoni* | Água com cercárias | Esquistossomose — filtração e saneamento da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |

**Curiosidades desta cultura:**

- Em experimento com irrigação por aspersão, a antracnose do feijão atingiu 12,25% de severidade a 0,5 m do foco contra 0,75% na área não irrigada. — [Embrapa Arroz e Feijão · Boletim de P&D 1](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/211439/1/bolpesq1.pdf)
- Sclerotinia sclerotiorum tem mais de 400 plantas hospedeiras; apenas gramíneas são consideradas não hospedeiras. — [Embrapa · Ageitec (Feijão)](https://www.embrapa.br/en/web/agencia-de-informacao-tecnologica/cultivos/feijao/producao/doencas/doencas-fungicas/doencas-fungicas-do-solo)
- A bactéria do crestamento comum do feijão (Xanthomonas phaseoli) foi detectada em água de irrigação superficial em Nebraska já em 1975. — [Univ. Nebraska · Water Resources Bulletin (1975)](https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1303&context=plantpathpapers)
- A Portaria GM/MS 888/2021 fixa pH 6,0-9,5, cloro residual livre minimo de 0,2 mg/L (VMP 5 mg/L), turbidez ate 5 uT e ausencia de E. coli em 100 mL. — [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html)
- A CONAMA 357/2005 destina a classe 3 a irrigacao de culturas arboreas, cerealiferas e forrageiras, com pH 6,0-9,0. — [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450)

> Ferrugem do feijoeiro (Uromyces) e mosaico-dourado (mosca-branca) foram removidos.

### Hortaliças (`hortalicas`) — 12 doenças / 12 soluções

| Doença | Patógeno | Via hídrica | Solução correspondente | Fonte |
|---|---|---|---|---|
| Tombamento de mudas (damping-off) / requeima | *Pythium spp. / Phytophthora capsici* | Zoósporos móveis nadam na água de irrigação e em filmes de água entre partículas de solo | Tombamento de mudas (damping-off) / requeima — filtrar e desinfestar a água de irrigação do viveiro | [UnB · dissertação (2014)](https://repositorio.unb.br/bitstream/10482/18110/1/2014_EleniceAlvesBarboza.pdf) |
| Mancha bacteriana do tomateiro e pimentão | *Xanthomonas euvesicatoria pv. perforans* | Respingos de água de irrigação ou de chuva são a principal via de curta distância | Mancha bacteriana do tomateiro e pimentão — evitar aspersão sobre a folhagem e desinfestar a água | [EPPO Global Database](https://gd.eppo.int/taxon/XANTPF/datasheet) |
| Infecções intestinais / indicador de contaminação fecal | *Escherichia coli (cepas patogênicas)* | Água de irrigação contaminada (via fecal) | Infecções intestinais / indicador de contaminação fecal — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Indicador de contaminação fecal da água de irrigação | *Coliformes termotolerantes* | Água de irrigação / escoamento superficial | Indicador de contaminação fecal da água de irrigação — filtração + cloração e monitoramento | [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450) |
| Cólera | *Vibrio cholerae* | Água contaminada | Cólera — cloração e controle da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Leptospirose | *Leptospira interrogans* | Água contaminada / enxurrada | Leptospirose — desinfecção da água e controle de roedores | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Salmonelose / febre tifoide | *Salmonella spp.* | Água contaminada / respingos | Salmonelose / febre tifoide — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Shigelose / disenteria bacilar | *Shigella sonnei* | Água contaminada | Shigelose / disenteria bacilar — cloração da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Giardíase | *Giardia duodenalis* | Água contaminada (cistos) | Giardíase — filtração mecânica + desinfecção | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Criptosporidiose | *Cryptosporidium parvum* | Água contaminada (oocistos) | Criptosporidiose — filtração de barreira | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Hepatite A | *Hepatitis A virus (HAV)* | Água contaminada | Hepatite A — desinfecção da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Esquistossomose | *Schistosoma mansoni* | Água com cercárias | Esquistossomose — filtração e saneamento da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |

**Curiosidades desta cultura:**

- A Embrapa Hortaliças recomenda expressamente usar água de boa qualidade, não contaminada, na irrigação: a água, implementos e insetos dispersam patógenos. — [Embrapa Hortaliças · CT 100](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/916721/1/ct100.pdf)
- Em alface, a disseminação de Meloidogyne spp. ocorre principalmente por substrato infestado, água de irrigação contaminada e solo em máquinas. — [Embrapa Hortaliças · COT 27](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/779126/1/cot27.pdf)
- Pythium e Phytophthora liberam zoósporos que nadam ativamente na água; por isso sistemas de irrigação recirculante podem espalhar a doença por toda a estufa. — [Hong & Moorman (2005) · revisão](https://www.researchgate.net/publication/240518240_Plant_Pathogens_in_Irrigation_Water_Challenges_and_Opportunities)
- A Portaria GM/MS 888/2021 fixa pH 6,0-9,5, cloro residual livre minimo de 0,2 mg/L (VMP 5 mg/L), turbidez ate 5 uT e ausencia de E. coli em 100 mL. — [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html)
- A CONAMA 357/2005 destina a classe 3 a irrigacao de culturas arboreas, cerealiferas e forrageiras, com pH 6,0-9,0. — [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450)

> Oídios e viroses de hortaliças transmitidas por afídeos foram removidos.

### Outra cultura (`outra`) — 10 doenças / 10 soluções

| Doença | Patógeno | Via hídrica | Solução correspondente | Fonte |
|---|---|---|---|---|
| Infecções intestinais / indicador de contaminação fecal | *Escherichia coli (cepas patogênicas)* | Água de irrigação contaminada (via fecal) | Infecções intestinais / indicador de contaminação fecal — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Indicador de contaminação fecal da água de irrigação | *Coliformes termotolerantes* | Água de irrigação / escoamento superficial | Indicador de contaminação fecal da água de irrigação — filtração + cloração e monitoramento | [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450) |
| Cólera | *Vibrio cholerae* | Água contaminada | Cólera — cloração e controle da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Leptospirose | *Leptospira interrogans* | Água contaminada / enxurrada | Leptospirose — desinfecção da água e controle de roedores | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Salmonelose / febre tifoide | *Salmonella spp.* | Água contaminada / respingos | Salmonelose / febre tifoide — cloração da água de irrigação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Shigelose / disenteria bacilar | *Shigella sonnei* | Água contaminada | Shigelose / disenteria bacilar — cloração da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Giardíase | *Giardia duodenalis* | Água contaminada (cistos) | Giardíase — filtração mecânica + desinfecção | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Criptosporidiose | *Cryptosporidium parvum* | Água contaminada (oocistos) | Criptosporidiose — filtração de barreira | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Hepatite A | *Hepatitis A virus (HAV)* | Água contaminada | Hepatite A — desinfecção da água | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |
| Esquistossomose | *Schistosoma mansoni* | Água com cercárias | Esquistossomose — filtração e saneamento da captação | [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html) |

**Curiosidades desta cultura:**

- Para culturas fora da lista, o sistema mostra apenas os agentes de veiculação hídrica — aqueles que chegam à lavoura pela água monitorada pelo sensor. — [Hong & Moorman (2005) · revisão](https://www.researchgate.net/publication/240518240_Plant_Pathogens_in_Irrigation_Water_Challenges_and_Opportunities)
- A água de irrigação pode carregar 17 espécies de Phytophthora, 26 de Pythium, 27 gêneros de fungos, 8 bactérias, 10 vírus e 13 espécies de nematoides fitoparasitas. — [Hong & Moorman (2005) · revisão](https://www.researchgate.net/publication/240518240_Plant_Pathogens_in_Irrigation_Water_Challenges_and_Opportunities)
- A Portaria GM/MS 888/2021 exige ausência de E. coli em 100 mL e cloro residual livre mínimo de 0,2 mg/L. — [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html)
- A Portaria GM/MS 888/2021 fixa pH 6,0-9,5, cloro residual livre minimo de 0,2 mg/L (VMP 5 mg/L), turbidez ate 5 uT e ausencia de E. coli em 100 mL. — [Ministério da Saúde · Portaria GM/MS 888/2021](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html)
- A CONAMA 357/2005 destina a classe 3 a irrigacao de culturas arboreas, cerealiferas e forrageiras, com pH 6,0-9,0. — [CONAMA · Resolução 357/2005](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450)

> Sem cultura específica cadastrada, nenhuma doença foliar é assumida: apenas o bloco universal de veiculação hídrica.

## 6. Limites legais e classificações mantidos

- Portaria GM/MS 888/2021: pH 6,0–9,5; cloro residual livre ≥ 0,2 mg/L (VMP 5 mg/L); turbidez ≤ 5 uT; ausência de *E. coli* em 100 mL.
- CONAMA 357/2005, classe 3 (irrigação): pH 6,0–9,0; coliformes termotolerantes 2.500/100 mL em 80% de ≥ 6 amostras bimestrais.
- Anvisa RDC 294/2019 (GHS): categorias 1–5 e Não Classificado, definidas **por produto formulado**; o catálogo não fornece doses nem marcas.
- Classes de risco biológico 1–4 (Portaria GM/MS 3.398/2021, NR-32, OMS LBM4) aplicam-se **apenas** a agentes que adoecem humanos e animais — nunca a fitopatógenos.

## 7. Observações de escopo

- Associações de patógenos de solo/água com cada cultura foram feitas apenas onde a via hídrica está documentada; confirme a espécie e o registro na sua região com responsável técnico.
- O gráfico do painel passou a ter 4 painéis de barras verticais independentes; as 4 caixas de valor exato não foram alteradas.
- O botão **Curiosidades** usa a cultura da conta logada (`window.ACQUASAFE_CULTURA`).
- A conta de teste `manucordeiro326@gmail.com` lê o pHmetro direto no portal via Web Serial; nenhuma senha é armazenada no repositório.
