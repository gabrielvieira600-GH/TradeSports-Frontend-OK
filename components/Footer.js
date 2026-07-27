import { useEffect, useState } from "react";
import PoliticaPrivacidadeModal from "./PoliticaPrivacidadeModal";
import PoliticaComunidadeModal from "./PoliticaComunidadeModal";

export default function Footer() {
  const [modalAberto, setModalAberto] = useState(null); // "risco" | "privacidade" | "comunidade" | "uso" | null

  const ANO_ATUAL = new Date().getFullYear();


  const POLITICA_RISCO_TEXTO = `AVISO DE RISCOS DA TRADESPORTS

Documento: Política de Riscos da Plataforma TradeSports: 1.0 — 
AVISO EM DESTAQUE

A utilização da TradeSports envolve risco de perda parcial ou total dos valores alocados. Os preços podem subir ou cair, ordens podem não ser executadas e não existe garantia de lucro, rentabilidade, liquidez ou recuperação do valor utilizado. Não utilize recursos necessários para despesas essenciais, pagamento de dívidas ou reserva de emergência.

Este Aviso apresenta os principais riscos conhecidos, mas não esgota todas as situações possíveis. Leia também os Termos de Uso, as regras da competição, a Tabela de Liquidação e a tabela de taxas antes de operar.

QUADRO-RESUMO DOS PRINCIPAIS RISCOS

Risco

O que pode acontecer

Perda financeira

O usuário pode perder parte ou a totalidade do valor alocado

Oscilação de preço

O preço de mercado pode variar rápida e significativamente

Liquidez

Pode não haver contraparte para comprar ou vender no preço desejado

Execução

Uma ordem pode não ser executada ou ser executada apenas parcialmente

Liquidação final

O valor final pode ser diferente do último preço negociado

Desempenho esportivo

Resultados, punições, lesões e mudanças de classificação podem afetar posições e preços

Dados externos

Informações esportivas podem sofrer atraso, erro ou retificação

Dividendos contratuais

O benefício depende do cumprimento integral das regras e não é garantido

Taxas

Custos podem reduzir ou eliminar eventual resultado positivo

Tecnologia

Falhas, indisponibilidade ou atraso podem impedir ou postergar operações

Pagamentos

Depósitos e saques podem depender de terceiros e verificações adicionais

Fraude e segurança

Invasão de conta, engenharia social e manipulação podem causar prejuízos

Regulação

Mudanças legais ou decisões de autoridades podem alterar ou suspender funcionalidades

1. OBJETIVO E ABRANGÊNCIA

1.1. Este Aviso de Riscos informa, em linguagem clara, os principais riscos relacionados ao acesso e ao uso das funcionalidades da TradeSports, especialmente aquisição, manutenção, negociação e liquidação de cotas digitais vinculadas a clubes e competições esportivas.

1.2. Este documento integra os Termos de Uso e deve ser lido em conjunto com:

a) as regras específicas de cada competição;b) a Tabela de Liquidação;c) a tabela de taxas vigente;d) a Política de Privacidade; ee) os avisos exibidos antes da confirmação de cada operação.

1.3. A ciência deste Aviso não representa renúncia do usuário a direitos assegurados por lei nem exclui responsabilidades legalmente atribuídas à TradeSports.

2. NATUREZA DA EXPERIÊNCIA E AUSÊNCIA DE GARANTIAS

2.1. A TradeSports disponibiliza uma experiência digital regida por regras contratuais, na qual preços, posições e resultados podem ser influenciados pela interação entre usuários, pelo desempenho esportivo e por outros fatores externos.

2.2. As cotas:

a) não conferem participação societária na TradeSports, em clubes, ligas ou federações;b) não atribuem direito de voto, gestão, propriedade, imagem ou crédito perante entidades esportivas; ec) não asseguram retorno, rendimento mínimo ou preservação do valor alocado.

2.3. As expressões “mercado”, “bolsa”, “ativo”, “cota”, “carteira”, “IPO” e “dividendos” descrevem funcionalidades da Plataforma. Essas expressões não determinam, por si só, a classificação jurídica ou regulatória do produto.

2.4. A qualificação jurídica da operação depende da legislação aplicável e de seu funcionamento efetivo. Este Aviso não declara nem garante que o produto seja ou deixe de ser investimento, valor mobiliário, ativo virtual, produto financeiro, jogo ou aposta.

2.5. A TradeSports não presta consultoria financeira, gestão de patrimônio, análise individual ou recomendação personalizada. Rankings, gráficos, estatísticas, notícias e conteúdos têm finalidade informativa e funcional.

3. RISCO DE PERDA FINANCEIRA

3.1. O usuário poderá perder parte ou a totalidade do valor alocado, inclusive em razão de:

a) queda do preço de mercado;b) baixa liquidez;c) diferença entre preço de aquisição e valor de liquidação;d) taxas e demais custos;e) eventos esportivos adversos;f) fraude ou uso indevido da conta; oug) eventos operacionais, legais ou regulatórios.

3.2. Resultados anteriores, simulações, rankings, desempenho histórico ou valorização de determinada cota não garantem resultados futuros.

3.3. O usuário não deve operar com valores destinados a alimentação, moradia, saúde, educação, impostos, pagamento de dívidas, reserva de emergência ou qualquer outra necessidade essencial.

3.4. Tomar empréstimos, usar cheque especial, atrasar obrigações ou aumentar endividamento para operar pode ampliar substancialmente o prejuízo.

4. RISCO DE MERCADO E OSCILAÇÃO DE PREÇOS

4.1. Os preços podem variar de forma rápida, intensa e imprevisível em razão de oferta e demanda, expectativas, notícias, resultados esportivos, concentração de participantes e comportamento coletivo.

4.2. O preço exibido em determinado momento:

a) não representa garantia de execução;b) pode mudar antes da confirmação da ordem;c) pode decorrer de volume reduzido; ed) pode divergir do preço inicial e do valor de liquidação final.

4.3. Em mercados com poucos participantes, uma única ordem ou um pequeno conjunto de operações pode produzir oscilação relevante.

4.4. Gráficos, médias e indicadores podem conter arredondamentos ou atraso de atualização e não substituem a conferência dos dados da ordem.

5. RISCO DE LIQUIDEZ

5.1. Não há garantia de que existirão compradores ou vendedores disponíveis.

5.2. O usuário poderá:

a) não conseguir encerrar uma posição quando desejar;b) precisar aguardar por contraparte;c) executar a ordem apenas parcialmente; oud) aceitar preço menos favorável para aumentar a possibilidade de execução.

5.3. A presença de ordens no livro não assegura que elas permanecerão ativas ou serão executadas, pois podem ser canceladas, expiradas, consumidas por outras ordens ou removidas por motivo de segurança.

6. RISCO DE ORDENS E EXECUÇÃO

6.1. Ordens podem permanecer abertas, ser executadas parcialmente, não ser executadas, expirar ou ser canceladas nas hipóteses previstas nos Termos de Uso.

6.2. Uma mesma ordem poderá gerar múltiplas execuções, inclusive a preços distintos dentro do limite autorizado.

6.3. O cancelamento solicitado pelo usuário:

a) não desfaz parcela já executada; eb) somente produz efeito depois da confirmação pelo sistema.

6.4. Atrasos de rede, alta demanda, indisponibilidade, diferença entre o relógio do dispositivo e o servidor ou atualização simultânea do livro podem fazer com que a situação final seja diferente daquela inicialmente visualizada.

6.5. O limite semanal do Plano Lite restringe a quantidade de ordens conforme a regra vigente. A abertura ou o encerramento de rodada não renova esse limite.

7. RISCO RELACIONADO AO DESEMPENHO ESPORTIVO

7.1. Resultados e expectativas esportivas podem alterar significativamente preços e liquidez.

7.2. Entre os eventos capazes de afetar as cotas estão:

a) vitórias, derrotas, empates e alterações de classificação;b) lesões, suspensões, escalações e transferências;c) perda ou restituição de pontos;d) decisões disciplinares, administrativas ou judiciais;e) adiamento, abandono ou anulação de partidas;f) mudanças de regulamento, calendário ou formato; eg) desistência, exclusão, rebaixamento ou substituição de participantes.

7.3. A TradeSports não controla clubes, atletas, árbitros, organizadores, federações ou autoridades esportivas.

8. RISCO DE DADOS ESPORTIVOS E RETIFICAÇÕES

8.1. A Plataforma depende de provedores, organizadores e fontes externas para classificações, resultados, calendários e estatísticas.

8.2. Esses dados podem apresentar atraso, indisponibilidade, divergência ou erro e podem ser retificados posteriormente.

8.3. Correções oficiais podem produzir atualização de classificação, elegibilidade, dividendos contratuais ou liquidação, conforme as regras da competição e os Termos de Uso.

8.4. Havendo dúvida relevante sobre a integridade dos dados, a TradeSports poderá suspender temporariamente negociações ou aguardar a estabilização da informação, sem afastar os direitos do usuário previstos em lei.

9. RISCO DE LIQUIDAÇÃO FINAL

9.1. Ao final da competição, as cotas serão liquidadas segundo a classificação final reconhecida e a Tabela de Liquidação previamente divulgada.

9.2. O valor de liquidação poderá ser maior ou menor que:

a) o preço inicialmente pago;b) o preço médio da posição; ec) o último preço negociado no mercado secundário.

9.3. A liquidação poderá aguardar homologação, julgamento de recursos esportivos ou estabilização razoável da classificação quando houver fato capaz de alterar o resultado.

9.4. Interrupção, cancelamento, abandono, redução ou mudança substancial da competição será tratado pela regra específica publicada. Na ausência de regra suficiente, deverá ser adotada solução objetiva, proporcional, documentada e compatível com a legislação aplicável.

10. RISCOS DOS “DIVIDENDOS” CONTRATUAIS

10.1. “Dividendos” são benefícios contratuais condicionados às regras da competição. Não são dividendos societários nem decorrem de participação em clube ou empresa.

10.2. O pagamento não é garantido e dependerá do cumprimento integral de critérios como posição, permanência, quantidade mínima mantida, datas de corte e demais condições publicadas.

10.3. Na regra padrão do Top 4, alterações de posição entre rodadas, redução da quantidade mantida ou aquisição posterior ao início do período podem reduzir ou eliminar a elegibilidade.

10.4. Adiamentos, correções de classificação, decisões disciplinares e falhas de dados podem postergar a apuração ou exigir recálculo.

10.5. Percentuais divulgados não representam promessa de rentabilidade, pois a elegibilidade é condicional e o preço da cota pode variar ou sofrer perda superior ao benefício.

11. IMPACTO DE TAXAS, TRIBUTOS E CUSTOS

11.1. Taxas de negociação, maker, taker, saque, serviço, plano ou outras informadas antes da contratação podem reduzir o resultado da operação.

11.2. Uma operação com diferença positiva de preço pode resultar em ganho líquido menor ou mesmo resultado negativo depois dos custos aplicáveis.

11.3. Tributos eventualmente incidentes e obrigações declaratórias pessoais são de responsabilidade do usuário, conforme a legislação aplicável. A TradeSports não presta consultoria tributária individual.

12. RISCO DE DEPÓSITOS, SALDOS E SAQUES

12.1. Depósitos e saques podem depender de instituições de pagamento, bancos e outros terceiros.

12.2. As operações podem estar sujeitas a prazo de processamento, indisponibilidade, limites, conferência de titularidade, análise antifraude, estorno, chargeback ou verificação adicional.

12.3. O saldo exibido pode incluir valores reservados, pendentes de confirmação, bloqueados ou ainda não disponíveis para saque.

12.4. Atrasos, bloqueios ou falhas de terceiros não excluem responsabilidades que a lei atribuir à TradeSports.

13. RISCO TECNOLÓGICO E OPERACIONAL

13.1. Sites, aplicativos, servidores, bancos de dados, APIs e integrações podem sofrer:

a) indisponibilidade temporária;b) lentidão ou falha de comunicação;c) erro de processamento ou sincronização;d) manutenção programada ou emergencial;e) ataque cibernético; ouf) caso fortuito ou força maior.

13.2. Esses eventos podem atrasar a exibição de dados, o envio ou cancelamento de ordens, a confirmação de operações, depósitos, saques, dividendos ou liquidação.

13.3. A TradeSports adotará medidas compatíveis para prevenção, continuidade e correção, mas não garante funcionamento ininterrupto ou ausência absoluta de falhas.

13.4. Erros comprovados serão analisados conforme os registros técnicos, os Termos de Uso e a legislação aplicável. Este Aviso não autoriza a TradeSports a transferir ao usuário riscos decorrentes de falha própria quando houver responsabilidade legal.

14. RISCO DE SEGURANÇA, FRAUDE E ENGENHARIA SOCIAL

14.1. Credenciais comprometidas, dispositivo infectado, reutilização de senha, compartilhamento de códigos e mensagens falsas podem permitir acesso indevido à conta.

14.2. O usuário deve utilizar senha forte e exclusiva, proteger seus dispositivos, conferir os canais oficiais e comunicar imediatamente atividade não reconhecida.

14.3. A TradeSports nunca solicitará senha completa por e-mail, mensagem ou atendimento.

14.4. Mecanismos antifraude reduzem, mas não eliminam, os riscos de invasão, falsidade documental, contas relacionadas, automação indevida, conluio ou manipulação.

14.5. Contas, saldos, ordens ou saques poderão ser temporariamente limitados durante investigação fundamentada, observados necessidade, proporcionalidade e os direitos do usuário.

15. RISCO DE MANIPULAÇÃO, CONCENTRAÇÃO E CONDUTA DE TERCEIROS

15.1. Outros usuários podem tentar criar preço artificial, liquidez fictícia, demanda enganosa ou vantagem indevida.

15.2. A concentração de cotas ou de volume em poucos participantes pode ampliar volatilidade, reduzir liquidez e aumentar a influência de determinadas ordens.

15.3. Controles de integridade e auditoria não asseguram a detecção preventiva de todas as condutas abusivas.

15.4. A TradeSports poderá cancelar ordens, revisar operações, limitar contas e adotar outras medidas previstas nos Termos de Uso quando houver indício razoável de fraude, manipulação, erro material ou violação.

16. RISCO REGULATÓRIO E JURÍDICO

16.1. Leis, regulamentos, interpretações administrativas, decisões judiciais e exigências de autoridades podem mudar.

16.2. Tais mudanças podem exigir:

a) alteração das regras ou da estrutura do produto;b) identificação e verificações adicionais;c) limitação territorial ou de público;d) suspensão de mercado, depósitos, saques ou outras funcionalidades; oue) descontinuação total ou parcial do serviço.

16.3. A TradeSports deverá cumprir determinações legais e regulatórias aplicáveis e comunicar impactos relevantes quando permitido.

16.4. A existência deste Aviso não substitui parecer jurídico-regulatório nem autorização eventualmente exigida para a operação.

17. RISCO DE TERCEIROS

17.1. A operação pode depender de provedores de pagamento, hospedagem, nuvem, e-mail, segurança, identidade, dados esportivos, atendimento e outras integrações.

17.2. Falhas, mudanças contratuais, interrupções ou encerramento desses serviços podem afetar temporariamente a Plataforma.

17.3. A contratação de terceiros não afasta responsabilidades da TradeSports quando a legislação assim determinar.

18. DECISÃO RESPONSÁVEL DO USUÁRIO

18.1. Antes de operar, o usuário deve avaliar:

a) se compreendeu o produto, suas regras e custos;b) se suporta perder integralmente o valor alocado;c) se a decisão compromete despesas essenciais ou aumenta dívidas;d) se está agindo de forma consciente, sem pressão, compulsão ou tentativa de recuperar perda anterior; ee) se as informações da ordem estão corretas.

18.2. O usuário deve interromper o uso e buscar orientação adequada caso perceba perda de controle, impacto financeiro desproporcional, sofrimento emocional ou comportamento compulsivo.

18.3. Recursos de limite, pausa, bloqueio ou autoexclusão, quando disponibilizados, devem ser utilizados conforme suas regras. A existência desses controles não elimina os riscos.

18.4. A responsabilidade pelas decisões do usuário não exclui deveres legais de informação, segurança, transparência e boa-fé da TradeSports.

19. ALTERAÇÕES DESTE AVISO

19.1. Este Aviso poderá ser atualizado para refletir mudanças legais, regulatórias, operacionais ou tecnológicas.

19.2. Alterações relevantes serão comunicadas de forma destacada e, quando necessário, estarão sujeitas a nova ciência ou aceite.

19.3. A versão, a data de vigência e o histórico de alterações deverão permanecer acessíveis.

19.4. Alterações não serão aplicadas retroativamente para prejudicar direitos já constituídos, salvo imposição legal, regulatória ou correção de erro, observada a legislação aplicável.

20. CONTATO

Dúvidas, relatos de erro, operações não reconhecidas ou solicitações relacionadas a este Aviso poderão ser encaminhadas para:

TradeSports — [RAZÃO SOCIAL]CNPJ: [CNPJ]Atendimento: [E-MAIL DE SUPORTE]Segurança: [E-MAIL DE SEGURANÇA]Canal adicional: [CANAL DE ATENDIMENTO]Horário: [HORÁRIO DE ATENDIMENTO]

ANEXO INTERNO A — CONTROLES OBRIGATÓRIOS ANTES DA PUBLICAÇÃO

Remover integralmente este anexo da versão pública.

Obter parecer jurídico-regulatório sobre a qualificação da operação real.

Preencher razão social, CNPJ, canais e horário de atendimento.

Confirmar coerência com os Termos de Uso, a Política de Privacidade e as regras de mercado.

Confirmar regras efetivas de ordens, execuções parciais, cancelamentos e limite semanal.

Confirmar a Tabela de Liquidação e o tratamento de competição interrompida, anulada ou alterada.

Confirmar critérios, base de cálculo e histórico dos dividendos contratuais.

Confirmar todas as taxas exibidas antes da operação.

Validar fluxos de depósito, saque, estorno, chargeback e verificação de titularidade.

Validar controles antifraude, logs, auditoria e atendimento a operações contestadas.

Definir controles de uso responsável compatíveis com a classificação regulatória final.

Exibir o aviso destacado antes da primeira operação e manter acesso permanente no rodapé e na conta.

Registrar versão, data, hora e evidências de ciência do usuário.

Manter alerta contextual antes da confirmação de operações de maior risco.

Garantir acessibilidade, leitura em dispositivos móveis e linguagem legível.

Submeter o documento à aprovação formal de Jurídico, Compliance, Produto e Segurança.

ANEXO INTERNO B — TEXTO RECOMENDADO PARA CIÊNCIA

Remover integralmente este anexo da versão pública.

Texto da caixa de ciência:

Li e compreendi o Aviso de Riscos da TradeSports — versão 1.0, inclusive a possibilidade de perda parcial ou total dos valores alocados, a ausência de garantia de lucro ou liquidez e a diferença entre preço de mercado e valor de liquidação final.

A caixa não deverá vir previamente marcada. O registro deve armazenar, no mínimo, usuário, versão do documento, data e hora e as demais evidências previstas na Política de Privacidade.

REFERÊNCIAS NORMATIVAS E INSTITUCIONAIS

Se a versão pública adotar texto enxuto, esta seção poderá permanecer apenas na documentação interna.

Lei nº 8.078/1990 — Código de Defesa do Consumidor.

Decreto nº 7.962/2013 — contratação no comércio eletrônico.

Lei nº 12.965/2014 — Marco Civil da Internet.

Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais.

Lei nº 14.790/2023 e regulamentação correlata — apenas na medida em que forem consideradas aplicáveis após a análise regulatória.

Orientações públicas da Comissão de Valores Mobiliários sobre risco e ausência de rentabilidade garantida — como referência de comunicação responsável, sem pressupor enquadramento da TradeSports no mercado de capitais.

`;

  const TERMOS_USO = `# TERMOS DE USO DA TRADESPORTS

**Documento:** Termos de Uso da Plataforma TradeSports  
**ID:** TS-JUR-TER-001  
**Versão:** 1.0 — Minuta para validação jurídica  
**Status:** Em elaboração  
**Data da versão:** 22 de julho de 2026  
**Responsável pelo documento:** TradeSports — Jurídico e Compliance  
**Classificação:** Público após aprovação  

> **ATENÇÃO INTERNA — NÃO PUBLICAR SEM REVISÃO:** esta minuta deve ser validada por advogado com experiência em direito digital, consumidor, meios de pagamento e regulação financeira/esportiva. Devem ser preenchidos os campos entre colchetes e confirmada a classificação regulatória do produto antes do lançamento com movimentação de dinheiro real.

## QUADRO-RESUMO

Este quadro facilita a leitura, mas não substitui as cláusulas completas.

| Tema | Regra essencial |
|---|---|
| Operadora | **[RAZÃO SOCIAL]**, CNPJ **[CNPJ]**, com sede em **[ENDEREÇO COMPLETO]** (“TradeSports”) |
| Serviço | Plataforma digital na qual usuários elegíveis adquirem e negociam posições digitais vinculadas a clubes e competições esportivas, conforme as regras publicadas |
| Público | Pessoas físicas com 18 anos ou mais, plenamente capazes, residentes no Brasil e aprovadas nos controles cadastrais |
| Conta | Pessoal, individual e intransferível; uma conta por usuário/CPF, salvo autorização expressa |
| Risco | Há risco de oscilação e perda parcial ou total do valor alocado; não existe promessa ou garantia de rentabilidade |
| Ordens | Podem não ser executadas, ser executadas parcialmente ou sofrer cancelamento nas hipóteses previstas |
| Taxas | Incidem conforme tabela exibida antes da confirmação da operação |
| Dividendos | Benefícios promocionais/contratuais sujeitos às regras específicas da competição; não constituem dividendos societários |
| Liquidação | Realizada conforme posição esportiva final e tabela previamente publicada para a competição |
| Saques | Sujeitos a disponibilidade, conferências de segurança, titularidade e prazos informados |
| Atendimento | **[E-MAIL DE SUPORTE]**, **[CANAL DE ATENDIMENTO]**, em **[HORÁRIO]** |
| Privacidade | Regida também pela Política de Privacidade da TradeSports |

## 1. ACEITAÇÃO E FORMAÇÃO DO CONTRATO

1.1. Estes Termos regulam o acesso e o uso dos sites, aplicativos, APIs, funcionalidades, conteúdos e serviços disponibilizados pela TradeSports, em conjunto denominados **“Plataforma”**.

1.2. Ao criar uma conta, marcar a caixa de aceite e concluir o cadastro, o usuário declara que:

a) leu estes Termos integralmente, inclusive o Quadro-Resumo;  
b) compreendeu as regras, os riscos e os custos do serviço;  
c) aceita vincular-se a estes Termos, à Política de Privacidade, ao Aviso de Riscos, às regras de cada competição e às tabelas de taxas aplicáveis; e  
d) prestou informações verdadeiras, completas e atualizadas.

1.3. O aceite será registrado eletronicamente, com a versão aceita, data, hora e, quando tecnicamente disponível e juridicamente adequado, endereço IP, dispositivo e demais evidências necessárias para demonstrar a manifestação de vontade.

1.4. Se o usuário não concordar com qualquer disposição, não deverá criar conta nem utilizar funcionalidades transacionais.

1.5. Em caso de conflito, prevalecerá a seguinte ordem: (i) norma legal obrigatória; (ii) regra específica da competição ou operação; (iii) estes Termos; (iv) materiais informativos. Nenhum material publicitário prevalecerá sobre informação obrigatória exibida antes da contratação.

## 2. DEFINIÇÕES

Para estes Termos:

- **Ativo Digital Esportivo ou Cota:** unidade escritural e contratual disponibilizada na Plataforma, vinculada a um clube em uma competição específica. Não confere participação societária, propriedade sobre clube, direito de voto, direito de imagem, crédito contra o clube ou qualquer poder de gestão.
- **Carteira:** ambiente que apresenta saldo disponível, posições, valores bloqueados, movimentações e histórico do usuário.
- **Competição:** campeonato, liga, torneio, temporada ou outro ciclo esportivo cadastrado na Plataforma.
- **Livro de Ordens:** mecanismo que organiza ofertas de compra e venda de acordo com os critérios operacionais publicados.
- **Mercado Primário ou Oferta Inicial:** etapa em que cotas são disponibilizadas inicialmente nas condições definidas para cada competição.
- **Mercado Secundário:** ambiente de encontro e execução de ordens entre usuários, quando habilitado.
- **Ordem:** instrução de compra ou venda enviada pelo usuário.
- **Negócio ou Execução:** encontro total ou parcial de ordens compatíveis, com registro da operação.
- **Posição:** quantidade de cotas mantida pelo usuário em determinado clube e competição.
- **Rodada:** marco esportivo usado para atualização de classificação, histórico e regras específicas; sua abertura ou seu encerramento não reinicia limite semanal de ordens.
- **Temporada:** ciclo operacional que reúne uma competição e permite a apuração de seu resultado final, sem exigir quantidade fixa de rodadas.
- **Saldo Disponível:** valor apto a ser utilizado ou solicitado para saque, descontados bloqueios, reservas, taxas, estornos e obrigações pendentes.
- **Tabela de Liquidação:** valores previamente divulgados que relacionam a classificação esportiva final ao valor de liquidação de cada cota.

## 3. NATUREZA E LIMITES DO SERVIÇO

3.1. A TradeSports oferece infraestrutura tecnológica e regras contratuais para a experiência descrita nestes Termos. A Plataforma não concede ao usuário qualquer participação ou direito perante clubes, atletas, ligas, federações ou organizadores, salvo se houver informação expressa em instrumento específico.

3.2. As expressões “mercado”, “bolsa”, “ativo”, “cota”, “IPO”, “carteira”, “dividendos” e similares são utilizadas para descrever funcionalidades e mecânicas da Plataforma. Seu uso não significa, por si só, que o produto seja ação, valor mobiliário, fundo de investimento, depósito bancário, moeda eletrônica, criptoativo ou participação societária.

3.3. A TradeSports não presta consultoria de investimentos, análise individual, gestão de patrimônio ou recomendação personalizada. Dados, rankings, gráficos, estatísticas e conteúdos têm finalidade informativa e funcional.

3.4. A classificação jurídica e regulatória da operação decorre da legislação aplicável e da forma efetiva de funcionamento do produto, não apenas da nomenclatura destes Termos. A TradeSports poderá adaptar, suspender ou descontinuar funcionalidades para cumprir determinação legal ou regulatória.

3.5. A Plataforma não promete lucro, retorno mínimo, preservação de capital, liquidez contínua ou possibilidade permanente de saída de uma posição.

## 4. ELEGIBILIDADE

4.1. Poderá criar conta quem, cumulativamente:

a) tiver 18 anos completos e plena capacidade civil;  
b) possuir CPF regular e documento válido;  
c) residir no Brasil, salvo expansão expressamente autorizada;  
d) utilizar e-mail e telefone próprios e acessíveis;  
e) agir em nome próprio e como beneficiário final dos recursos; e  
f) não estiver sujeito a restrição legal, sanção ou bloqueio que impeça a utilização.

4.2. É proibido cadastrar menor de idade, utilizar documento de terceiro, ocultar o beneficiário final, emprestar a conta ou operar por interposta pessoa.

4.3. A TradeSports poderá recusar cadastro ou limitar funcionalidades com base em critérios objetivos de segurança, prevenção a fraude, capacidade operacional, requisitos legais ou inconsistências cadastrais, sem discriminação ilícita.

## 5. CADASTRO, VERIFICAÇÃO E SEGURANÇA DA CONTA

5.1. Cada usuário poderá manter apenas uma conta vinculada ao seu CPF, salvo autorização expressa e documentada.

5.2. A conta é pessoal, individual e intransferível. O usuário deve:

a) criar senha forte e exclusiva;  
b) manter credenciais e dispositivos sob sua guarda;  
c) não compartilhar códigos, tokens ou links de verificação;  
d) manter dados atualizados; e  
e) avisar imediatamente sobre acesso, operação ou alteração não reconhecida.

5.3. Contas novas dependerão da confirmação do e-mail e poderão depender de verificação de telefone, identidade, prova de vida, titularidade bancária, origem de recursos e outras etapas compatíveis com o risco.

5.4. A TradeSports nunca solicitará senha completa por e-mail, mensagem ou atendimento. Comunicações suspeitas devem ser encaminhadas a **[E-MAIL DE SEGURANÇA]**.

5.5. A atividade realizada após autenticação válida será presumida como feita pelo titular, sem prejuízo da apuração de fraude, falha de segurança, fortuito interno ou responsabilidade prevista em lei.

5.6. Nome de usuário poderá ser sensível a letras maiúsculas e minúsculas, conforme informado no cadastro e na tela de acesso. O e-mail será normalizado para autenticação.

## 6. VERIFICAÇÕES, PREVENÇÃO A FRAUDE E COOPERAÇÃO

6.1. A TradeSports poderá realizar verificações antes ou depois do cadastro e das transações, inclusive solicitar documentos e informações adicionais, respeitando necessidade, proporcionalidade e legislação de proteção de dados.

6.2. Poderão ser analisados, entre outros, padrões de acesso, dispositivo, localização aproximada, titularidade da conta de pagamento, movimentações incompatíveis, contas relacionadas, tentativas de manipulação e uso automatizado indevido.

6.3. Depósitos e saques deverão, como regra, ocorrer por meio de instrumento de pagamento de mesma titularidade do usuário. Transferências de terceiros poderão ser devolvidas, bloqueadas para análise ou submetidas a comprovação.

6.4. A TradeSports poderá temporariamente bloquear saldo, operação, saque ou conta quando houver indício razoável de fraude, erro material, duplicidade, chargeback, violação destes Termos, risco de dano ou obrigação legal. O bloqueio será limitado ao necessário, revisado e comunicado quando isso não prejudicar investigação ou ordem de autoridade.

6.5. O usuário deverá cooperar com apurações legítimas. A falta injustificada de documentação poderá impedir novas operações, prolongar a análise estritamente pelo tempo necessário ou resultar em encerramento da conta, preservados os direitos legais.

## 7. DEPÓSITOS, SALDO E SAQUES

7.1. Os métodos, limites, prazos e eventuais custos de depósito e saque serão exibidos na Plataforma.

7.2. O saldo apresentado poderá ser composto por valores disponíveis, reservados em ordens, pendentes de liquidação, sujeitos a confirmação ou temporariamente bloqueados.

7.3. O envio de comprovante não substitui a efetiva confirmação da instituição responsável pelo pagamento.

7.4. A TradeSports poderá utilizar prestadores de pagamento autorizados e contas de liquidação compatíveis com a operação. A instituição responsável e as condições relevantes serão informadas quando aplicável.

7.5. Solicitações de saque estarão sujeitas a saldo disponível, titularidade, limites, conferências de segurança, prazo informado e indisponibilidade do sistema financeiro. Nenhum atraso causado exclusivamente por terceiro exclui a responsabilidade que a lei atribuir à TradeSports.

7.6. É proibido utilizar a Plataforma apenas para circular, fracionar, ocultar, triangular ou transferir recursos sem propósito legítimo relacionado aos serviços.

7.7. Valores creditados indevidamente, duplicados ou decorrentes de erro poderão ser estornados após registro e comunicação. Se já utilizados ou sacados, o usuário deverá restituí-los, assegurada contestação pelos canais de atendimento.

## 8. OFERTA INICIAL E COTAS

8.1. Cada competição informará os clubes participantes, quantidade inicial de cotas, preço, período, limites por usuário e demais condições.

8.2. Salvo regra específica, a oferta inicial de cada clube poderá conter até 1.000 cotas. Esse parâmetro poderá variar em competições futuras, mediante divulgação anterior.

8.3. A aquisição estará concluída apenas após confirmação da Plataforma. Exibição temporária, inclusão no carrinho ou envio de requisição não garante disponibilidade.

8.4. Esgotada a quantidade inicial, novas aquisições dependerão da disponibilidade no mercado secundário ou de evento expressamente previsto nas regras.

8.5. A cota é vinculada à competição identificada. O mesmo clube em outra temporada ou competição corresponderá a posição distinta.

## 9. ORDENS E LIVRO DE ORDENS

9.1. Antes de enviar uma ordem, o usuário deverá verificar clube, competição, lado da operação, quantidade, preço, prazo, taxas e valor estimado.

9.2. O envio de ordem representa instrução firme enquanto estiver ativa. O valor ou as cotas necessários poderão ser reservados imediatamente.

9.3. A prioridade observará os critérios informados na Plataforma, normalmente melhor preço e, entre ordens no mesmo preço, ordem cronológica de recepção válida.

9.4. Uma ordem poderá:

a) ser executada integralmente;  
b) ser executada parcialmente, permanecendo o saldo ativo;  
c) permanecer sem execução;  
d) expirar ou ser cancelada pelo usuário, se permitido; ou  
e) ser cancelada pela TradeSports nas hipóteses destes Termos.

9.5. O cancelamento solicitado não desfaz parcela já executada. A ordem somente será considerada cancelada após confirmação do sistema.

9.6. O usuário reconhece que pode não haver contraparte, volume ou preço compatível e que a liquidez não é garantida.

9.7. O Plano Lite poderá estar sujeito a limite semanal de ordens. A semana será contada de segunda-feira a domingo, no horário de Brasília, salvo informação diferente. Abrir ou encerrar rodada não renova esse limite. O painel mostrará o consumo e a regra aplicável a cancelamentos.

9.8. Limites de preço, quantidade, exposição e frequência poderão ser aplicados por segurança, integridade do mercado, perfil do plano ou capacidade operacional, com informação adequada.

## 10. EXECUÇÕES, PREÇOS E HISTÓRICO

10.1. O preço de mercado decorre das operações e regras da Plataforma e pode divergir do preço inicial, do valor da tabela de liquidação e de avaliações externas.

10.2. Uma ordem poderá gerar uma ou várias execuções, inclusive a preços diferentes dentro do limite autorizado.

10.3. O histórico eletrônico da Plataforma registrará ordens, execuções, cancelamentos, taxas e movimentações. O usuário deverá comunicar divergência pelo atendimento tão logo a identifique.

10.4. Gráficos e indicadores podem sofrer atraso, arredondamento ou consolidação. A tela de confirmação e o comprovante da execução prevalecem para a operação específica, ressalvado erro demonstrado.

10.5. É proibido tentar produzir preço artificial, liquidez fictícia ou impressão enganosa de demanda, inclusive por operações combinadas, contas relacionadas, ordens sem propósito econômico legítimo, automação não autorizada ou coordenação com terceiros.

## 11. TAXAS E TRIBUTOS

11.1. Poderão incidir taxas de negociação, maker, taker, saque, serviço, plano ou outras expressamente informadas.

11.2. A tabela vigente e o valor aplicável serão apresentados de maneira clara antes da confirmação da operação, sempre que o valor puder ser calculado naquele momento.

11.3. Alterações de taxas valerão prospectivamente, após comunicação e publicação da nova versão. Não haverá cobrança retroativa sobre operação já concluída.

11.4. Campanhas de isenção ou desconto poderão ter prazo, público e condições próprios.

11.5. O usuário é responsável por verificar e cumprir suas obrigações tributárias pessoais. A TradeSports disponibilizará os registros que a legislação ou a operação exigirem, mas não presta consultoria tributária individual.

## 12. BENEFÍCIOS DENOMINADOS “DIVIDENDOS”

12.1. “Dividendos”, na Plataforma, são benefícios contratuais vinculados a critérios esportivos e regras previamente divulgadas. **Não são dividendos societários**, não decorrem de participação em clube ou na TradeSports e não conferem direito sobre lucro empresarial.

12.2. Quando adotada a regra padrão do Top 4, o benefício poderá depender da permanência do mesmo clube na mesma posição entre as quatro primeiras colocações por três rodadas consecutivas, com percentuais de referência de 3% para o 1º, 2% para o 2º, 1% para o 3º e 0,5% para o 4º lugar, conforme base de cálculo indicada na competição.

12.3. A quantidade elegível poderá corresponder à menor quantidade mantida continuamente durante o período exigido, impedindo aquisição posterior de produzir benefício retroativo.

12.4. A regra específica da competição deverá informar base de cálculo, datas de corte, percentuais, arredondamento, elegibilidade, prazo e tratamento de partidas adiadas, decisões administrativas e correções de classificação.

12.5. Nenhum benefício futuro é garantido. Regras não poderão ser alteradas retroativamente para retirar valor já adquirido, salvo correção de erro, fraude, determinação legal ou fato esportivo oficialmente retificado, com fundamentação e registro.

## 13. CLASSIFICAÇÃO, DADOS ESPORTIVOS E RODADAS

13.1. A TradeSports utiliza dados de provedores, organizadores e fontes esportivas consideradas confiáveis, mas podem ocorrer atrasos, indisponibilidades e retificações.

13.2. A fonte oficial e os critérios de desempate de cada competição serão indicados nas regras aplicáveis.

13.3. A classificação poderá ser atualizada após revisão, decisão disciplinar, perda de pontos, partida adiada, erro do provedor ou correção da fonte oficial.

13.4. A TradeSports poderá suspender temporariamente negociações quando a integridade do preço ou da liquidação puder ser comprometida por dado incorreto, evento excepcional ou incerteza relevante.

13.5. A quantidade e o formato das rodadas seguirão a realidade de cada esporte e competição. A temporada não exige total fixo de rodadas previamente definido.

## 14. LIQUIDAÇÃO FINAL

14.1. Ao final da competição, as posições serão liquidadas segundo a classificação final reconhecida e a Tabela de Liquidação divulgada antes do início do ciclo, sem depender necessariamente do último preço negociado.

14.2. A tabela deverá indicar valores, posições, critérios de arredondamento, fonte da classificação, momento de corte e prazo estimado de crédito.

14.3. A TradeSports poderá aguardar homologação, término de recursos esportivos ou estabilização razoável do resultado quando houver disputa capaz de alterar a classificação.

14.4. Se uma competição for interrompida, anulada, reduzida, abandonada ou substancialmente modificada, será aplicada a regra específica publicada. Na ausência de regra suficiente, a TradeSports adotará solução objetiva, proporcional, documentada e compatível com a legislação do consumidor, podendo incluir postergação, liquidação por critério verificável ou restituição pertinente.

14.5. Após a liquidação, as cotas daquela competição serão encerradas e não permanecerão negociáveis, salvo previsão expressa.

## 15. SPLIT, AJUSTES E EVENTOS OPERACIONAIS

15.1. A TradeSports poderá realizar desdobramento ou grupamento técnico de cotas para melhorar a usabilidade, desde que preserve proporcionalmente o valor econômico total da posição imediatamente antes do ajuste, ressalvadas oscilações posteriores.

15.2. Ajustes serão registrados e comunicados com antecedência razoável, salvo urgência de segurança ou correção de erro.

15.3. Migrações, arredondamentos e correções técnicas deverão ser auditáveis. Eventuais diferenças residuais serão tratadas conforme regra previamente informada e legislação aplicável.

## 16. RISCOS

16.1. O usuário reconhece, entre outros, os riscos de:

a) perda parcial ou total do valor alocado;  
b) variação decorrente de desempenho esportivo, expectativas e liquidez;  
c) ausência de compradores ou vendedores;  
d) execução parcial ou não execução de ordens;  
e) mudanças de calendário, regulamento, participantes ou classificação;  
f) lesões, punições, decisões disciplinares e eventos extraordinários;  
g) falhas ou atrasos de internet, provedores, pagamentos e dados;  
h) fraude, comprometimento de credenciais e engenharia social;  
i) indisponibilidade temporária; e  
j) mudanças legais ou regulatórias.

16.2. O usuário deve operar apenas com recursos cuja perda possa suportar, avaliar sua situação financeira e não tratar a Plataforma como reserva de emergência.

16.3. A leitura e o aceite separado do Aviso de Riscos poderão ser exigidos antes da primeira operação e sempre que houver alteração material.

## 17. CONDUTAS PROIBIDAS

É proibido:

a) violar lei, direito de terceiro ou estes Termos;  
b) fraudar cadastro, identidade, titularidade, localização ou origem de recursos;  
c) compartilhar, vender, alugar ou ceder conta;  
d) manipular preços, volume, ranking, benefícios ou mecanismos de indicação;  
e) usar informação obtida ilicitamente ou explorar falha evidente;  
f) criar múltiplas contas ou coordenar contas relacionadas para contornar limites;  
g) usar robô, scraper, crawler, extensão ou API não autorizada que afete o serviço;  
h) interferir na segurança, sobrecarregar sistemas ou tentar acesso indevido;  
i) lavar, ocultar, triangular ou dar aparência lícita a recursos;  
j) praticar assédio, discriminação, ameaça, difamação ou divulgação de dado pessoal nas áreas sociais;  
k) publicar conteúdo ilegal, enganoso, sexualmente exploratório, violento, protegido sem autorização ou que incentive fraude; e  
l) utilizar marcas, telas, dados ou código da TradeSports fora das permissões concedidas.

## 18. RECURSOS SOCIAIS E CONTEÚDO DO USUÁRIO

18.1. Quando houver perfis, feed, seguidores, comentários, fóruns ou mensagens, o usuário será responsável pelo conteúdo que publicar e pelas permissões necessárias.

18.2. O usuário concede à TradeSports licença não exclusiva, gratuita, mundial e limitada ao prazo de proteção necessário para hospedar, reproduzir, adaptar tecnicamente e exibir o conteúdo dentro da Plataforma e em sua divulgação interna, na medida necessária à prestação do serviço. A licença não transfere a autoria.

18.3. A TradeSports poderá moderar, restringir alcance ou remover conteúdo que viole estes Termos ou a lei, preservando transparência, possibilidade de contestação quando cabível e obrigações do Marco Civil da Internet.

18.4. Opiniões de usuários não representam a TradeSports. Conteúdo social não constitui recomendação financeira nem garantia de resultado.

18.5. Denúncias poderão ser feitas por **[CANAL DE DENÚNCIA/MODERAÇÃO]**.

## 19. PROPRIEDADE INTELECTUAL

19.1. A Plataforma, seu software, identidade visual, textos, bancos de dados, seleção, organização e funcionalidades pertencem à TradeSports ou a seus licenciantes.

19.2. O usuário recebe licença pessoal, limitada, revogável, não exclusiva e intransferível para uso regular da Plataforma durante a vigência da conta.

19.3. Escudos, nomes, marcas e materiais de clubes, ligas e terceiros pertencem a seus titulares. Sua exibição não implica parceria, patrocínio ou endosso, salvo informação expressa.

## 20. DISPONIBILIDADE, MANUTENÇÃO E INCIDENTES

20.1. A TradeSports buscará disponibilidade e segurança compatíveis com o serviço, mas não garante operação ininterrupta.

20.2. Poderão ocorrer manutenções programadas ou emergenciais, suspensão de negociações e limitação temporária de funções.

20.3. Em incidente relevante, a TradeSports adotará medidas de contenção, recuperação, registro e comunicação exigidas pela lei, inclusive aos titulares e à autoridade competente quando aplicável.

20.4. Se uma interrupção afetar a formação de preço ou a igualdade entre usuários, a TradeSports poderá cancelar ordens não executadas, suspender o livro, restaurar estado consistente ou adotar outra medida proporcional, sem apagar negócios válidos arbitrariamente.

## 21. RESPONSABILIDADES

21.1. A TradeSports responde pela prestação adequada do serviço e pelas obrigações que não possam ser afastadas por lei.

21.2. Nada nestes Termos exclui responsabilidade por dolo, culpa grave, falha de segurança atribuível à TradeSports, defeito do serviço, violação de dever legal ou hipótese em que a limitação seja proibida pelo Código de Defesa do Consumidor.

21.3. A TradeSports não responde por perdas decorrentes exclusivamente de:

a) decisão consciente do usuário diante de risco claramente informado;  
b) informação falsa ou violação destes Termos pelo usuário;  
c) compartilhamento voluntário de credenciais, sem falha do serviço;  
d) indisponibilidade externa inevitável e alheia à cadeia de fornecimento, observada a lei; ou  
e) conteúdo ou conduta de outro usuário, sem prejuízo dos deveres legais após ciência ou ordem competente.

21.4. Não há indenização automática pela simples oscilação de preço, ausência de liquidez ou resultado esportivo desfavorável.

21.5. Cláusulas de limitação serão interpretadas restritivamente e nunca reduzirão direitos indisponíveis do consumidor.

## 22. SUSPENSÃO, RESTRIÇÃO E ENCERRAMENTO PELA TRADESPORTS

22.1. A TradeSports poderá advertir, limitar, suspender ou encerrar conta em caso de violação, fraude, risco relevante, inatividade prolongada, determinação legal, impossibilidade técnica ou descontinuação do serviço.

22.2. Sempre que compatível com a urgência e a segurança, o usuário será informado do motivo e terá canal para contestação.

22.3. A medida deverá ser proporcional. Bloqueio preventivo não implicará confisco. Saldos legítimos serão disponibilizados após as verificações e compensações permitidas, salvo ordem de autoridade ou obrigação legal.

22.4. Em encerramento, ordens ativas poderão ser canceladas e posições poderão ser liquidadas ou mantidas até o evento aplicável, conforme alternativa juridicamente possível e menos prejudicial informada ao usuário.

## 23. ENCERRAMENTO PELO USUÁRIO E DIREITO DE ARREPENDIMENTO

23.1. O usuário poderá solicitar encerramento da conta pelo **[CAMINHO NA PLATAFORMA]** ou atendimento, desde que resolva ordens, posições, saldo negativo, verificações e obrigações pendentes.

23.2. O encerramento não elimina registros cuja conservação seja necessária ao exercício de direitos, cumprimento de obrigação legal, prevenção a fraude ou outra base legítima.

23.3. Quando o direito de arrependimento previsto no Código de Defesa do Consumidor for aplicável, poderá ser exercido pelo canal **[CANAL]**, no prazo legal. A incidência e os efeitos sobre operação já executada, sujeita a preço variável ou prestação iniciada mediante solicitação, deverão observar a legislação e a natureza concreta do serviço, sem renúncia antecipada a direito obrigatório.

## 24. DADOS PESSOAIS E PRIVACIDADE

24.1. O tratamento de dados pessoais é detalhado na Política de Privacidade, que integra o conjunto contratual sem substituir estes Termos.

24.2. A TradeSports tratará dados para cadastro, autenticação, execução do contrato, segurança, prevenção a fraude, atendimento, cumprimento de obrigações e demais finalidades informadas, conforme bases legais aplicáveis.

24.3. Solicitações relativas a dados poderão ser enviadas ao encarregado pelo canal **[E-MAIL DO ENCARREGADO/DPO]**.

24.4. O usuário deverá ler a Política de Privacidade antes de concluir o cadastro. Autorizações opcionais, como marketing não essencial, serão coletadas separadamente quando exigido.

## 25. COMUNICAÇÕES E ATENDIMENTO

25.1. Comunicações contratuais e de segurança poderão ser enviadas por e-mail, notificação na Plataforma, SMS, aplicativo de mensagens ou outro canal cadastrado.

25.2. O usuário é responsável por manter seus contatos atualizados e verificar pastas de spam, sem que isso afaste o dever da TradeSports de usar meio adequado.

25.3. Canais oficiais:

- Atendimento: **[E-MAIL/URL]**;
- Segurança: **[E-MAIL]**;
- Privacidade: **[E-MAIL DO ENCARREGADO]**;
- Endereço: **[ENDEREÇO COMPLETO]**.

25.4. A TradeSports fornecerá confirmação de recebimento e resposta dentro dos prazos legais ou divulgados.

## 26. ALTERAÇÕES DESTES TERMOS

26.1. Estes Termos poderão ser alterados para refletir mudanças legais, regulatórias, operacionais, tecnológicas ou de segurança.

26.2. Alterações materiais serão comunicadas com antecedência razoável e entrarão em vigor na data indicada. Quando exigido ou adequado, será solicitado novo aceite.

26.3. Mudanças não reduzirão retroativamente direito econômico já constituído, salvo obrigação legal, correção de fraude ou erro devidamente demonstrado.

26.4. A versão vigente e o histórico de versões ficarão acessíveis na Plataforma.

## 27. DESCONTINUAÇÃO DO SERVIÇO

27.1. A TradeSports poderá descontinuar total ou parcialmente a Plataforma mediante plano de encerramento e aviso prévio razoável, salvo urgência legal ou impossibilidade comprovada.

27.2. O plano deverá tratar de ordens abertas, posições, liquidação, benefícios apurados, saques, suporte e conservação de registros, priorizando solução clara e proporcional.

## 28. CESSÃO E PRESTADORES

28.1. O usuário não poderá ceder sua conta ou posição fora dos mecanismos autorizados.

28.2. A TradeSports poderá contratar fornecedores de nuvem, dados esportivos, comunicação, identidade, antifraude, pagamentos e suporte, permanecendo responsável nos limites legais pela cadeia de fornecimento.

28.3. Eventual transferência do contrato em reorganização societária será comunicada e não reduzirá direitos do usuário.

## 29. LEI APLICÁVEL E SOLUÇÃO DE CONFLITOS

29.1. Estes Termos são regidos pelas leis da República Federativa do Brasil.

29.2. Antes de medida judicial, as partes são incentivadas, sem obrigatoriedade, a buscar solução pelo atendimento e por plataformas públicas de defesa do consumidor.

29.3. O usuário poderá recorrer ao Procon, ao consumidor.gov.br, à autoridade de proteção de dados e aos demais órgãos competentes, conforme o assunto.

29.4. Fica preservado o foro do domicílio do consumidor e qualquer outra competência assegurada por norma obrigatória. Não se impõe foro exclusivo que dificulte a defesa do usuário.

## 30. DISPOSIÇÕES GERAIS

30.1. A nulidade de uma disposição não afetará as demais; a cláusula inválida será interpretada ou substituída no limite necessário para preservar sua finalidade lícita.

30.2. A tolerância a descumprimento não significa renúncia, alteração contratual ou precedente obrigatório.

30.3. Títulos servem apenas à organização. Exemplos não limitam regras gerais.

30.4. Estes Termos, as regras específicas, a Política de Privacidade, o Aviso de Riscos e as tabelas apresentadas formam o acordo aplicável ao uso da Plataforma.

30.5. O usuário poderá baixar ou solicitar cópia da versão aceita.

## 31. DADOS DA OPERADORA

**Razão social:** [RAZÃO SOCIAL]  
**Nome fantasia:** TradeSports  
**CNPJ:** [CNPJ]  
**Endereço:** [ENDEREÇO COMPLETO]  
**E-mail de atendimento:** [E-MAIL]  
**Canal eletrônico:** [URL]  
**Encarregado de dados:** [NOME OU IDENTIFICAÇÃO DO CANAL]  
**Contato do encarregado:** [E-MAIL DO DPO]  

---

## ANEXO I — INFORMAÇÕES OBRIGATÓRIAS ANTES DE CADA COMPETIÇÃO

Antes de habilitar operações, a página da competição deverá informar, no mínimo:

1. nome, esporte, organizador e temporada;
2. clubes ou participantes elegíveis;
3. fonte oficial da classificação e critérios de desempate;
4. quantidade e preço das cotas na oferta inicial;
5. horários e regras de negociação;
6. limites de ordem, posição e exposição;
7. taxas aplicáveis;
8. regra dos benefícios denominados dividendos;
9. Tabela de Liquidação completa;
10. tratamento de adiamento, cancelamento, punição e alteração do campeonato;
11. datas de corte e prazo estimado de liquidação; e
12. versão das regras específicas.

## ANEXO II — CONTROLES MÍNIMOS DE PUBLICAÇÃO

Antes de publicar estes Termos, a TradeSports deverá:

- preencher todos os campos entre colchetes;
- obter parecer sobre enquadramento perante CVM, Banco Central, SPA/MF e demais autoridades potencialmente competentes;
- confirmar o fluxo e a segregação operacional dos recursos de usuários;
- publicar Política de Privacidade e Aviso de Riscos compatíveis;
- criar tabela pública de taxas e regras específicas das competições;
- implementar aceite versionado e separado para documentos juridicamente distintos;
- garantir cópia acessível da versão aceita;
- testar encerramento de conta, saque, contestação e atendimento;
- revisar a terminologia “IPO”, “bolsa”, “ativo” e “dividendos” à luz do parecer regulatório; e
- submeter a versão final a revisão jurídica formal.

## REFERÊNCIAS NORMATIVAS PRINCIPAIS

Esta minuta foi estruturada considerando, entre outras normas aplicáveis conforme o caso:

- Lei nº 8.078/1990 — Código de Defesa do Consumidor;
- Decreto nº 7.962/2013 — contratação no comércio eletrônico;
- Lei nº 12.965/2014 — Marco Civil da Internet;
- Decreto nº 8.771/2016 — regulamentação do Marco Civil da Internet;
- Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais;
- Lei nº 10.406/2002 — Código Civil;
- Lei nº 9.609/1998 e Lei nº 9.610/1998 — software e direitos autorais; e
- demais normas financeiras, de pagamentos, prevenção a ilícitos, publicidade, defesa da concorrência e regulação setorial que venham a incidir após validação do modelo.

## HISTÓRICO DE ALTERAÇÕES

| Versão | Data | Status | Alteração | Responsável |
|---|---|---|---|---|
| 1.0 | 22/07/2026 | Minuta para validação jurídica | Criação integral dos Termos de Uso | TradeSports — Jurídico e Compliance |`;

  const styles = {
    footer: {
      width: "100%",
      background: "rgba(10, 12, 18, 0.95)",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      color: "rgba(255,255,255,0.85)",
      padding: "28px 20px",
    },
    container: {
      maxWidth: 1300,
      margin: "0 auto",
      display: "flex",
      gap: 28,
      justifyContent: "space-between",
      flexWrap: "wrap",
    },
    col: {
      minWidth: 180,
      flex: "1 1 180px",
    },
    title: {
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 10,
      color: "rgba(255,255,255,0.95)",
      letterSpacing: 0.4,
      textTransform: "uppercase",
    },
    linkBtn: {
      display: "inline-block",
      background: "transparent",
      border: "none",
      padding: "6px 0",
      color: "rgba(255,255,255,0.78)",
      cursor: "pointer",
      textAlign: "left",
      fontSize: 13,
    },
    bottom: {
      maxWidth: 1300,
      margin: "18px auto 0",
      paddingTop: 16,
      borderTop: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      flexWrap: "wrap",
      gap: 12,
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: 12,
      color: "rgba(255,255,255,0.6)",
    },
    badge: {
      display: "inline-block",
      padding: "4px 8px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.15)",
      color: "rgba(255,255,255,0.75)",
      fontSize: 12,
      whiteSpace: "nowrap",
    },

    // Modal (CORREÇÃO PRINCIPAL AQUI: inset: 0)
    overlay: {
      position: "fixed",
      inset: 0, // <- ISSO FAZ O OVERLAY COBRIR A TELA INTEIRA
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: 16,
    },
    modal: {
      width: "min(900px, 96vw)",
      background: "#fff",
      borderRadius: 10,
      overflow: "hidden",
      boxShadow: "0 20px 70px rgba(0,0,0,0.35)",
      border: "1px solid rgba(0,0,0,0.08)",
    },
    modalHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 16px",
      borderBottom: "1px solid rgba(0,0,0,0.08)",
    },
    modalTitle: {
      fontSize: 14,
      fontWeight: 800,
      color: "#111827",
    },
    modalClose: {
      border: "1px solid rgba(0,0,0,0.18)",
      background: "#fff",
      color: "#111827",
      borderRadius: 8,
      padding: "6px 10px",
      cursor: "pointer",
      fontWeight: 700,
    },
    modalBody: {
      maxHeight: "72vh",
      overflow: "auto",
      padding: 16,
      background: "#fff",
      color: "#111827",
    },
    pre: {
      margin: 0,
      whiteSpace: "pre-wrap",
      lineHeight: 1.45,
      fontSize: 13,
      color: "#111827",
    },
    modalFooter: {
      padding: "12px 16px",
      borderTop: "1px solid rgba(0,0,0,0.08)",
      display: "flex",
      justifyContent: "flex-end",
      gap: 10,
      background: "#fff",
    },
    btnPrimary: {
      border: "none",
      background: "#2563eb",
      color: "#fff",
      borderRadius: 8,
      padding: "10px 14px",
      cursor: "pointer",
      fontWeight: 800,
    },
  };

  // trava scroll do body quando modal abre (opcional, mas dá acabamento profissional)
  useEffect(() => {
    if (modalAberto) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev || "";
      };
    }
  }, [modalAberto]);

  const Modal = ({ titulo, texto, onClose }) => (
    <div style={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>{titulo}</div>
          <button type="button" style={styles.modalClose} onClick={onClose}>
            Fechar
          </button>
        </div>
        <div style={styles.modalBody}>
          <pre style={styles.pre}>{texto}</pre>
        </div>
        <div style={styles.modalFooter}>
          <button type="button" style={styles.btnPrimary} onClick={onClose}>
            Entendi
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={styles.col}>
            <div style={styles.title}>Ajuda</div>
            <button type="button" style={styles.linkBtn} onClick={() => alert("Em breve: Central de Ajuda")}>
              Central de Ajuda
            </button>
            <br />
            <button type="button" style={styles.linkBtn} onClick={() => alert("Em breve: Depósitos")}>
              Depósitos
            </button>
            <br />
            <button type="button" style={styles.linkBtn} onClick={() => alert("Em breve: Saques")}>
              Saques
            </button>
            <br />
            <button type="button" style={styles.linkBtn} onClick={() => alert("Em breve: Contato")}>
              Contato
            </button>
          </div>

          <div style={styles.col}>
            <div style={styles.title}>Institucional</div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.75)" }}>
              TradeSports é uma plataforma de simulação econômica esportiva com mercado de negociação de cotas virtuais,
              precificadas por desempenho esportivo.
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
              Forneça razão social/CNPJ quando formalizados.
            </div>
          </div>

          <div style={styles.col}>
            <div style={styles.title}>Jurídico</div>
            <button type="button" style={styles.linkBtn} onClick={() => setModalAberto("risco")}>
              Política de Risco
            </button>
            <br />
            <button type="button" style={styles.linkBtn} onClick={() => setModalAberto("privacidade")}>
              Política de Privacidade
            </button>
            <br />
            <button type="button" style={styles.linkBtn} onClick={() => setModalAberto("uso")}>
              Termos de Uso
            </button>
            <br />
            <button type="button" style={styles.linkBtn} onClick={() => setModalAberto("comunidade")}>
              Política da Comunidade
            </button>
          </div>

          <div style={styles.col}>
            <div style={styles.title}>Segurança</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span style={styles.badge}>Prevenção a fraudes</span>
              <span style={styles.badge}>Logs e auditoria</span>
              <span style={styles.badge}>Boas práticas LGPD</span>
              <span style={styles.badge}>18+</span>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
              Importante: não há promessa de rentabilidade. Você pode perder total ou parcialmente os valores utilizados.
            </div>
          </div>
        </div>

        <div style={styles.bottom}>
          <div>© {ANO_ATUAL} TradeSports. Todos os direitos reservados.</div>
        </div>
      </footer>

      {modalAberto === "risco" && (
        <Modal
          titulo="Política de Risco (TradeSports)"
          texto={POLITICA_RISCO_TEXTO}
          onClose={() => setModalAberto(null)}
        />
      )}

      {modalAberto === "privacidade" && (
        <PoliticaPrivacidadeModal
          modoConsulta
          onClose={() => setModalAberto(null)}
        />
      )}

      {modalAberto === "comunidade" && (
        <PoliticaComunidadeModal
          modoConsulta
          onClose={() => setModalAberto(null)}
        />
      )}

      {modalAberto === "uso" && (
        <Modal
          titulo="Termos de Uso (TradeSports)"
          texto={TERMOS_USO}
          onClose={() => setModalAberto(null)}
        />
      )}
    </>
  );
}
