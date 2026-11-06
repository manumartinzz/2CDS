# Pesquisa bibliográfica — patógenos, soluções químicas e níveis de periculosidade por cultura

**Projeto:** AcquaSafe · **Data de acesso às fontes:** 06/11/2026 · **Arquivo de dados:** `pesquisa-culturas.js`

Este documento registra, de forma auditável, **todas as fontes** usadas para montar os catálogos de patógenos, soluções químicas e periculosidade de cada uma das 11 opções de lavoura do cadastro. O mesmo conjunto aparece **ao final de cada banco de dados** no sistema (páginas Patógenos, Soluções e Periculosidade), filtrado pela cultura da conta logada, e também no Perfil da conta.

---

## 1. Fontes gerais (aplicáveis a todas as culturas e aos três catálogos)

- **MAPA · AGROFIT** — Agrotóxicos registrados no AGROFIT (cadastro oficial por cultura, alvo, ingrediente ativo e classificação toxicológica)  
  <https://www.gov.br/agricultura/pt-br/acesso-a-informacao/acoes-e-programas/cartas-de-servico/defesa-agropecuaria-agrotoxicos/agrotoxicos-registrados-no-agrofit>
- **MAPA** — Agrofit agora é o sistema oficial de cadastro de agroquímicos  
  <https://www.gov.br/agricultura/pt-br/assuntos/noticias/2022/agrofit-agora-e-o-sistema-oficial-de-cadastro-de-agroquimicos>
- **Embrapa · AgroAPI** — Documentação da API AGROFIT (campos de culturas, pragas, classificações toxicológica e ambiental)  
  <https://www.agroapi.cnptia.embrapa.br/portal/assets/docs/agrofit.pdf>
- **Anvisa · RDC 294/2019** — Novo marco regulatório: classificação toxicológica pelo GHS (categorias 1 a 5 e Não Classificado)  
  <https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2019/anvisa-aprova-novo-marco-regulatorio-para-agrotoxicos>
- **Anvisa** — Reclassificação toxicológica dos agrotóxicos (1.942 produtos avaliados)  
  <https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2019/publicada-reclassificacao-toxicologica-de-agrotoxicos>
- **Anvisa · Monografias** — Monografia A29 (acetamiprido): a classificação toxicológica é específica para cada produto, conforme art. 38 da RDC 294/2019  
  <https://www.gov.br/anvisa/pt-br/setorregulado/regularizacao/agrotoxicos/monografias/monografias-autorizadas/a/4150json-file-1/@@display-file/file>
- **Ministério da Saúde · Portaria GM/MS 3.398/2021** — Lista de Classificação de Risco dos Agentes Biológicos (classes 1 a 4)  
  <https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt3398_29_12_2021.html>
- **Ministério da Saúde · Portaria GM/MS 2.349/2017** — Aprova a Classificação de Risco dos Agentes Biológicos  
  <https://bvsms.saude.gov.br/bvs/saudelegis/gm/2017/prt2349_22_09_2017.html>
- **Ministério da Saúde** — Classificação de Risco dos Agentes Biológicos — 3ª edição (critérios: infectividade, patogenicidade, virulência, profilaxia e terapia)  
  <https://bvsms.saude.gov.br/bvs/publicacoes/classificacao_risco_agentes_biologicos_3ed.pdf>
- **MTE · NR-32** — Segurança e Saúde no Trabalho em Serviços de Saúde — Anexo I (classes de risco 1 a 4) e Anexo II (tabela de agentes)  
  <https://fiocruz.br/biosseguranca/Bis/manuais/legislacao/NR-32.pdf>
- **OMS / WHO** — Laboratory Biosafety Manual, 4ª edição (2020) — abordagem baseada em avaliação de risco  
  <https://www.who.int/publications/i/item/9789240011311>
- **MAPA · Defesa Vegetal** — Listas de Pragas Quarentenárias Ausentes (PQA) e Presentes (PQP) e Análise de Risco de Pragas  
  <https://www.gov.br/agricultura/pt-br/assuntos/noticias/mapa-disponibiliza-listagem-atualizada-de-pragas-quarentenarias>
- **Ministério da Saúde · Portaria GM/MS 888/2021** — Padrão de potabilidade: pH 6,0–9,5; cloro residual livre ≥ 0,2 mg/L e VMP 5 mg/L; turbidez ≤ 5 uT; ausência de E. coli em 100 mL  
  <https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html>
- **CONAMA · Resolução 357/2005** — Classificação dos corpos d'água: classe 3 destinada à irrigação de culturas arbóreas, cerealíferas e forrageiras (pH 6,0–9,0; coliformes termotolerantes)  
  <https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450>
- **EPPO** — EPPO Global Database — nomes científicos, sinonímia, plantas-hospedeiro e distribuição de mais de 99.700 espécies  
  <https://gd.eppo.int/>
- **CABI** — Crop Protection Compendium — datasheets revisadas por especialistas sobre pragas, doenças e hospedeiros  
  <https://www.cabi.org/Uploads/CABI/publishing/promotional-materials/insert/Cp%20Compendium%20A4%20Insert.pdf>

---

## 2. Fontes específicas por cultura

### Soja  `soja`

**Patógenos pesquisados:** 13 · **Soluções/controle:** 3 · **Fontes específicas:** 5 (mais 16 gerais).

- **Embrapa Soja** — Doenças — publicações sobre ferrugem-asiática, DFC, mancha-alvo e oídio  
  <https://www.embrapa.br/en/soja/publicacoes/doencas>
- **Embrapa Soja** — Manual de identificação de doenças de soja (2014)  
  <https://www.embrapa.br/en/busca-de-publicacoes/-/publicacao/991687/manual-de-identificacao-de-doencas-de-soja>
- **Embrapa Soja** — Circular Técnica 198 — avaliação da associação de fungicidas químicos e biológicos (safra 2024/2025)  
  <https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1157438/1/Circ-Tec-198-online.pdf>
- **Embrapa Soja** — Nematoides em soja: identificação e controle (Circular Técnica 76, 2010)  
  <https://www.infoteca.cnptia.embrapa.br/bitstream/doc/854178/1/CT76eletronica.pdf>
- **UNESP / FEIS** — Doenças da cultura da soja (Glycine max) — bactérias, fungos e controle químico  
  <https://www.feis.unesp.br/Home/departamentos/fitotecniatecnologiadealimentosesocioeconomia716/edsonlazarini/doencas-soja.pdf>

**Patógenos e agentes incluídos:** *Phakopsora pachyrhizi*, *Phakopsora meibomiae*, *Sclerotinia sclerotiorum*, *Corynespora cassiicola*, *Cercospora kikuchii*, *Septoria glycines*, *Microsphaera diffusa*, *Macrophomina phaseolina*, *Phytophthora sojae*, *Xanthomonas axonopodis pv. glycines*, *Heterodera glycines*, *Meloidogyne javanica*, *Pratylenchus brachyurus*.

> Classes de ingredientes ativos, não marcas nem doses. Consulte o AGROFIT por cultura + alvo antes de aplicar; o registro é dinâmico e exige responsável técnico.

### Café  `cafe`

**Patógenos pesquisados:** 8 · **Soluções/controle:** 3 · **Fontes específicas:** 3 (mais 16 gerais).

- **Embrapa** — Resistência de cafeeiros a doenças — ferrugem, cercosporiose, antracnose, rhizoctoniose e koleroga  
  <https://www.infoteca.cnptia.embrapa.br/bitstream/doc/901892/1/ct51doencasdocafeeiro.pdf>
- **Embrapa Rondônia** — Principais doenças do café em Rondônia (2005)  
  <https://www.embrapa.br/en/busca-de-publicacoes/-/publicacao/859497/principais-doencas-do-cafe-em-rondonia>
- **Embrapa / Consórcio Pesquisa Café** — Manual do Café — distúrbios fisiológicos, pragas e doenças do cafeeiro (ferrugem, cercosporiose, Phoma, mancha aureolada)  
  <http://www.sapc.embrapa.br/arquivos/consorcio/publicacoes_tecnicas/livro_disturbios_fisiologicos_pragas_doen%C3%A7as.pdf>

**Patógenos e agentes incluídos:** *Hemileia vastatrix*, *Cercospora coffeicola*, *Phoma costarricensis*, *Colletotrichum coffeanum*, *Koleroga noxia*, *Rhizoctonia solani*, *Pseudomonas syringae pv. garcae*, *Meloidogyne spp.*.

> Classes de ingredientes ativos, não marcas nem doses. Consulte o AGROFIT por cultura + alvo antes de aplicar; o registro é dinâmico e exige responsável técnico. A Embrapa destaca que o controle químico da ferrugem depende de calendário (período chuvoso) e do residual do produto.

### Trigo  `trigo`

**Patógenos pesquisados:** 7 · **Soluções/controle:** 3 · **Fontes específicas:** 3 (mais 16 gerais).

- **Embrapa Trigo** — Atenção com as doenças no trigo — ferrugem da folha (Puccinia triticina) e giberela; danos > 60% em cultivares suscetíveis  
  <https://www.embrapa.br/en/busca-de-noticias/-/noticia/55372349/atencao-com-as-doencas-no-trigo>
- **Embrapa Trigo** — Comunicado Técnico Online 140 — reação a ferrugem da folha, ferrugem do colmo, oídio, giberela, septória e mancha marrom  
  <https://www.cnpt.embrapa.br/biblio/co/p_co140.htm>
- **Embrapa Trigo** — Documento Online 16 — reação a doenças de cultivares (oídio, ferrugens, mancha da gluma, giberela)  
  <https://www.cnpt.embrapa.br/biblio/p_do16_7.htm>

**Patógenos e agentes incluídos:** *Puccinia triticina*, *Gibberella zeae / Fusarium graminearum*, *Puccinia graminis f. sp. tritici*, *Blumeria graminis f. sp. tritici*, *Stagonospora nodorum*, *Bipolaris sorokiniana*, *Drechslera tritici-repentis*.

> Classes de ingredientes ativos, não marcas nem doses. Consulte o AGROFIT por cultura + alvo antes de aplicar; o registro é dinâmico e exige responsável técnico. A Embrapa Trigo recomenda não ultrapassar o estádio de grão leitoso na última aplicação.

### Laranja / Citros  `laranja`

**Patógenos pesquisados:** 6 · **Soluções/controle:** 3 · **Fontes específicas:** 3 (mais 16 gerais).

- **Fundecitrus** — Greening (Huanglongbing / HLB) — agente causal, vetor Diaphorina citri, sintomas e manejo  
  <https://ww2.fundecitrus.com.br/doencas/greening>
- **Embrapa Mandioca e Fruticultura** — Monitoramento da invasão de Candidatus Liberibacter, agente causal do HLB, na Bahia (2012)  
  <https://www.embrapa.br/en/busca-de-publicacoes/-/publicacao/944796/monitoramento-da-invasao-de-candidatus-liberibacter-agente-causal-do-huanglongbing-hlb-dos-citros-em-areas-produtoras-da-bahia>
- **CDFA (California Dept. of Food and Agriculture)** — Huanglongbing Pest Profile — não existem controles químicos que atinjam a bactéria; manejo foca em erradicação e vetor  
  <https://www.cdfa.ca.gov/citrus/pests_diseases/hlb/PestProfile.html>

**Patógenos e agentes incluídos:** *'Candidatus Liberibacter asiaticus'*, *'Candidatus Liberibacter americanus'*, *Diaphorina citri*, *Phytophthora spp.*, *Xanthomonas citri*, *Colletotrichum gloeosporioides*.

>  Não há controle químico curativo para o HLB: o Fundecitrus e o CDFA recomendam eliminar a árvore doente, controlar o psilídeo e usar mudas de viveiros telados. Classes de ingredientes ativos, não marcas nem doses. Consulte o AGROFIT por cultura + alvo antes de aplicar; o registro é dinâmico e exige responsável técnico.

### Algodão  `algodao`

**Patógenos pesquisados:** 8 · **Soluções/controle:** 2 · **Fontes específicas:** 4 (mais 16 gerais).

- **Embrapa Algodão** — Guia de identificação e controle das principais doenças — ramulose, murcha de Fusarium, tombamento  
  <https://www.infoteca.cnptia.embrapa.br/bitstream/doc/272982/1/DOC113.PDF>
- **Embrapa Algodão** — Circular Técnica 76 — guia de identificação e controle de pragas e doenças do algodoeiro  
  <https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/273549/1/CIRTEC76.pdf>
- **Embrapa Agropecuária Oeste** — Detecção e controle químico de Colletotrichum em sementes de soja e algodão (2009)  
  <https://www.infoteca.cnptia.embrapa.br/bitstream/doc/574033/1/DOC2009100.pdf>
- **Embrapa** — Nematoides fitoparasitos de culturas anuais no Brasil (soja, algodoeiro e milho)  
  <https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/982653/1/cap7.pdf>

**Patógenos e agentes incluídos:** *Colletotrichum gossypii var. cephalosporioides*, *Fusarium oxysporum f. sp. vasinfectum*, *Rhizoctonia solani*, *Colletotrichum gossypii*, *Stemphylium solani*, *Meloidogyne incognita*, *Pratylenchus brachyurus*, *Aspergillus spp. / Penicillium spp.*.

> Classes de ingredientes ativos, não marcas nem doses. Consulte o AGROFIT por cultura + alvo antes de aplicar; o registro é dinâmico e exige responsável técnico. A Embrapa Algodão recomenda cultivares resistentes, tratamento de sementes, erradicação/queima de restos culturais e rotação antes do controle químico.

### Milho  `milho`

**Patógenos pesquisados:** 8 · **Soluções/controle:** 2 · **Fontes específicas:** 3 (mais 16 gerais).

- **Embrapa Milho e Sorgo** — Cultivo do Milho — Doenças (cercosporiose, ferrugem polissora, ferrugem tropical, podridões de colmo e espiga)  
  <https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/748764/1/Milho-Doencas.pdf>
- **Embrapa Milho e Sorgo** — Circular Técnica 83 — doenças foliares, grãos ardidos e micotoxinas  
  <https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/490415/1/Circ83.pdf>
- **Embrapa** — Agência de Informação Embrapa — Doenças do milho e manejo por resistência genética  
  <https://www.agencia.cnptia.embrapa.br/gestor/territorio_sisal/arvore/CONT000fckl80cd02wx5eo0a2ndxy5w90bbu.html>

**Patógenos e agentes incluídos:** *Cercospora zeae-maydis*, *Puccinia polysora*, *Physopella zeae*, *Exserohilum turcicum*, *Fusarium moniliforme / F. subglutinans*, *Fusarium graminearum*, *Aspergillus flavus*, *Puccinia sorghi*.

> Classes de ingredientes ativos, não marcas nem doses. Consulte o AGROFIT por cultura + alvo antes de aplicar; o registro é dinâmico e exige responsável técnico. A Embrapa prioriza resistência genética (sem custo adicional e sem impacto ambiental) e rotação de culturas.

### Cana-de-açúcar  `cana`

**Patógenos pesquisados:** 7 · **Soluções/controle:** 2 · **Fontes específicas:** 3 (mais 16 gerais).

- **Embrapa · Agência de Informação Tecnológica** — Cana-de-açúcar — Doenças fúngicas (ferrugem, carvão, mancha parda, podridão abacaxi, fusariose)  
  <https://www.agencia.cnptia.embrapa.br/gestor/cana-de-acucar/arvore/CONTAG01_79_22122006154841.html>
- **Instituto Biológico (SP)** — Principais doenças da cana: ferrugem marrom, ferrugem alaranjada, escaldadura, raquitismo da soqueira e carvão  
  <https://biologico.agricultura.sp.gov.br/uploads/docs/pag/v5_1/dagostini.html>
- **Embrapa (via MF Magazine)** — Ferrugem marrom (Puccinia melanocephala) e ferrugem alaranjada (Puccinia kuehnii) — redução de até 60%  
  <https://blog.mfrural.com.br/doencas-da-cana-de-acucar/>

**Patógenos e agentes incluídos:** *Puccinia melanocephala*, *Puccinia kuehnii*, *Leifsonia xyli subsp. xyli*, *Xanthomonas albilineans*, *Sporisorium scitamineum*, *Fusarium spp.*, *Cercospora spp.*.

> Classes de ingredientes ativos, não marcas nem doses. Consulte o AGROFIT por cultura + alvo antes de aplicar; o registro é dinâmico e exige responsável técnico. Na cana o manejo é predominantemente varietal e de mudas; não há controle químico curativo para doenças sistêmicas bacterianas.

### Arroz  `arroz`

**Patógenos pesquisados:** 6 · **Soluções/controle:** 3 · **Fontes específicas:** 2 (mais 16 gerais).

- **Embrapa · Ageitec** — Arroz de terras altas — Manejo de doenças: brusone (Magnaporthe oryzae), mancha-de-grãos e controle integrado  
  <https://www.embrapa.br/en/web/agencia-de-informacao-tecnologica/cultivos/arroz/producao/sistema-de-cultivo/arroz-de-terras-altas/manejo-de-pragas/manejo-de-doencas>
- **Embrapa · Ater Mais Digital** — Indicações de uso registradas: brusone (Pyricularia grisea), mancha-parda (Bipolaris oryzae) e ferrugens em arroz irrigado  
  <https://www.atermaisdigital.cnptia.embrapa.br/web/controle-de-pragas/w/maragato-500-ec>

**Patógenos e agentes incluídos:** *Magnaporthe oryzae / Pyricularia oryzae*, *Bipolaris oryzae*, *Microdochium oryzae*, *Fusarium spp.*, *Sarocladium oryzae*, *Rhynchosporium oryzae*.

> Classes de ingredientes ativos, não marcas nem doses. Consulte o AGROFIT por cultura + alvo antes de aplicar; o registro é dinâmico e exige responsável técnico. A Embrapa também documenta controle biológico com bactérias BRM 32111/32113, com aumento de 55% de biomassa em ensaios.

### Feijão  `feijao`

**Patógenos pesquisados:** 7 · **Soluções/controle:** 2 · **Fontes específicas:** 3 (mais 16 gerais).

- **Embrapa · Ageitec** — Doenças fúngicas da parte aérea do feijoeiro — antracnose, ferrugem e mancha angular  
  <https://www.embrapa.br/en/agencia-de-informacao-tecnologica/cultivos/feijao/producao/doencas/doencas-fungicas/doencas-fungicas-da-parte-aerea>
- **Embrapa · Agência de Informação Tecnológica** — Feijão-caupi — tombamento (Pythium / Rhizoctonia) e podridões radiculares  
  <https://www.agencia.cnptia.embrapa.br/gestor/feijao-caupi/arvore/CONTAG01_59_510200683537.html>
- **Embrapa · Ater Mais Digital** — Registros de uso: antracnose (Colletotrichum lindemuthianum) e ferrugem (Uromyces appendiculatus) em feijão  
  <https://www.atermaisdigital.cnptia.embrapa.br/web/controle-de-pragas/w/maragato-500-ec>

**Patógenos e agentes incluídos:** *Colletotrichum lindemuthianum*, *Uromyces appendiculatus*, *Pythium spp.*, *Rhizoctonia solani*, *Sclerotium rolfsii*, *Pseudocercospora griseola*, *Fusarium oxysporum f. sp. phaseoli*.

> Classes de ingredientes ativos, não marcas nem doses. Consulte o AGROFIT por cultura + alvo antes de aplicar; o registro é dinâmico e exige responsável técnico. A Embrapa alerta que a maioria das cultivares comerciais já tem resistência à ferrugem e que o excesso de umidade favorece antracnose e tombamento.

### Hortaliças  `hortalicas`

**Patógenos pesquisados:** 8 · **Soluções/controle:** 3 · **Fontes específicas:** 3 (mais 16 gerais).

- **Embrapa Hortaliças** — Doenças do tomateiro em ambiente protegido — tombamento (Pythium, Phytophthora, Rhizoctonia) e requeima  
  <https://www.infoteca.cnptia.embrapa.br/bitstream/doc/916721/1/ct100.pdf>
- **Embrapa Hortaliças** — Doenças da berinjela no Brasil — damping-off, Phytophthora capsici e P. nicotianae  
  <https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/916695/1/CT97.pdf>
- **Embrapa Hortaliças** — Doenças do coentro no Brasil — tombamento, Alternaria dauci e queima de folhas  
  <https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1066501/1/CT157.pdf>

**Patógenos e agentes incluídos:** *Pythium spp.*, *Rhizoctonia solani*, *Phytophthora infestans*, *Phytophthora capsici*, *Phytophthora nicotianae*, *Sclerotinia sclerotiorum*, *Alternaria dauci*, *Sclerotium rolfsii*.

> Classes de ingredientes ativos, não marcas nem doses. Consulte o AGROFIT por cultura + alvo antes de aplicar; o registro é dinâmico e exige responsável técnico. A Embrapa Hortaliças relaciona essas doenças diretamente à má qualidade da água de irrigação — o ponto que o sensor monitora. Para coentro, a Circular Técnica 157 informa que não existem fungicidas registrados.

### Outra cultura  `outra`

**Patógenos pesquisados:** 1 · **Soluções/controle:** 0 · **Fontes específicas:** 4 (mais 16 gerais).

- **Ministério da Saúde · Portaria GM/MS 888/2021** — Padrão de potabilidade da água para consumo humano  
  <https://bvsms.saude.gov.br/bvs/saudelegis/gm/2021/prt0888_07_05_2021.html>
- **CONAMA · Resolução 357/2005** — Águas doces classe 3 — irrigação de culturas arbóreas, cerealíferas e forrageiras  
  <https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=450>
- **EPPO** — EPPO Global Database — consulta de patógenos por planta-hospedeiro  
  <https://gd.eppo.int/>
- **CABI** — Crop Protection Compendium — busca de pragas por cultura  
  <https://www.cabi.org/Uploads/CABI/publishing/promotional-materials/insert/Cp%20Compendium%20A4%20Insert.pdf>

**Patógenos e agentes incluídos:** *Consulta por hospedeiro (EPPO / CABI)*.

> Para culturas fora da lista, o catálogo exibe os patógenos de veiculação hídrica e as soluções de tratamento de água, que são universais. Classes de ingredientes ativos, não marcas nem doses. Consulte o AGROFIT por cultura + alvo antes de aplicar; o registro é dinâmico e exige responsável técnico.

---

## 3. Bloco comum a todas as culturas

**Patógenos de veiculação hídrica (10):** *Escherichia coli (cepas patogênicas)*, *Coliformes termotolerantes*, *Vibrio cholerae*, *Leptospira interrogans*, *Salmonella spp.*, *Shigella sonnei*, *Giardia duodenalis*, *Cryptosporidium parvum*, *Hepatitis A virus (HAV)*, *Schistosoma mansoni*.

**Soluções de tratamento/calibração da água (9):** Hipoclorito de Sódio, Sulfato de Cobre, Ácido Peracético, Cloreto de Cálcio, Dióxido de Cloro, Peróxido de Hidrogênio, Carvão Ativado Granular, Solução tampão pH 7,00, Solução padrão de turbidez.

Esses itens são universais porque se referem à **água monitorada pelo sensor**, não à planta. Por isso aparecem em qualquer cultura selecionada.

---

## 4. Nota metodológica e limites

1. **BSL / classes de risco não se aplicam a fitopatógenos.** A classificação de risco do Ministério da Saúde (Portarias GM/MS 2.349/2017 e 3.398/2021), a NR-32 e o *Laboratory Biosafety Manual* da OMS (4ª ed., 2020) classificam agentes que causam doença em **humanos e animais**. A versão anterior do sistema atribuía BSL-2/BSL-3 a fungos e nematoides de plantas, o que é tecnicamente incorreto. Agora fitopatógenos aparecem como “Não aplicável” no eixo de saúde e são avaliados pelo **impacto na lavoura**.
2. **Impacto na lavoura é qualitativo.** Os níveis *Altíssimo / Alto / Moderado / Baixo* são uma leitura das descrições de severidade e perdas das publicações da Embrapa e do Fundecitrus. **Não** são classificação oficial do MAPA. Risco fitossanitário regulamentar depende de Análise de Risco de Pragas e das listas PQA/PQP.
3. **Classificação toxicológica é por produto.** A RDC 294/2019 (Anvisa), baseada no GHS, define as categorias 1–5 e “Não Classificado”. As monografias da Anvisa explicitam que a classificação é **específica para cada produto formulado** (art. 38), não para o ingrediente ativo. Por isso a coluna do catálogo diz “Específica por produto”.
4. **Nenhuma dose, marca comercial ou receita é recomendada.** O AGROFIT é um cadastro dinâmico; a consulta por **cultura + alvo biológico** deve ser refeita antes de qualquer aplicação, com receituário agronômico e responsável técnico. Onde a Embrapa documenta ausência de produtos registrados (ex.: tombamento em coentro), o catálogo diz isso explicitamente.
5. **Água:** os limites citados vêm da Portaria GM/MS 888/2021 (potabilidade) e da Resolução CONAMA 357/2005 (classe 3, irrigação). Os limiares usados nos *tooltips* do gráfico são os mesmos já usados pelos cards do painel, para não haver contradição na interface.
6. **Nomenclatura:** sinonímias e plantas-hospedeiro foram conferidas na EPPO Global Database e no CABI Crop Protection Compendium; a autoridade final de registro de produtos no Brasil é o AGROFIT/MAPA.

---

## 5. Onde as fontes aparecem no produto

| Local | O que é exibido |
|---|---|
| `patógenos.html` → “Fontes das pesquisas” | fontes da cultura da conta + 16 fontes gerais |
| `solucoes.html` → “Fontes das pesquisas” | fontes da cultura da conta + 16 fontes gerais |
| `periculosidade.html` → “Fontes das pesquisas” | fontes da cultura da conta + 16 fontes gerais |
| `perfil.html` → “Fontes das pesquisas” | fontes da cultura daquela conta |
| Seletor “Ver fontes de outra cultura” | permite consultar as fontes de **cada uma das 11 culturas** sem trocar de conta |
