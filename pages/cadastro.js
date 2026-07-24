import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";
import { useToast } from "../components/ToastProvider";
import PoliticaPrivacidadeModal from "../components/PoliticaPrivacidadeModal";

/**
 * Cadastro (TradeSports)
 * - Mantém o layout atual (cartão central) e adiciona:
 *   - Modal de Termos (com scroll obrigatório para habilitar "Aceitar")
 *   - Modal de Política de Risco
 *   - Modal de Política de Privacidade (componente separado)
 *
 * Observação: o checkbox de aceite só habilita depois do usuário aceitar no modal de Termos.
 */

const API = process.env.NEXT_PUBLIC_API_URL;
const VERSAO_TERMOS = "1.0";
const VERSAO_POLITICA_RISCO = 'v1.0';
const VERSAO_POLITICA_PRIVACIDADE = 'v1.0';


export default function Cadastro() {
  const router = useRouter();
  const { adicionarToast } = useToast();

  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    dataNascimento: "",
    cpf: "",
    genero: "",
    nomeUsuario: "",
    senha: "",
    confirmarSenha: "",
  });

  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Aceites
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [aceitouPoliticaRisco, setAceitouPoliticaRisco] = useState(false);
  const [aceitouPoliticaPrivacidade, setAceitouPoliticaPrivacidade] = useState(false);

  const [termosLiberados, setTermosLiberados] = useState(false);

  // Modais
  const [mostrarTermos, setMostrarTermos] = useState(false);
  const [mostrarPoliticaRisco, setMostrarPoliticaRisco] = useState(false);
  const [mostrarPoliticaPrivacidade, setMostrarPoliticaPrivacidade] = useState(false);

  // Controle de scroll do Termos
  const [termosScrollNoFim, setTermosScrollNoFim] = useState(false);
  const termosScrollRef = useRef(null);

  const termosTexto = useMemo(() => {
    return `# TERMOS DE USO DA TRADESPORTS

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
  }, []);

  useEffect(() => {
    // Sempre que abrir o modal de termos, reseta o controle de scroll.
    if (mostrarTermos) {
      setTermosScrollNoFim(false);
      // leva o scroll pro topo quando abrir
      setTimeout(() => {
        if (termosScrollRef.current) {
          termosScrollRef.current.scrollTop = 0;
        }
      }, 0);
    }
  }, [mostrarTermos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErro("");

    // CPF: só números
    if (name === "cpf") {
      const onlyDigits = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [name]: onlyDigits }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!aceitouTermos || !termosLiberados) {
      setErro("Você precisa aceitar os Termos de Uso para finalizar o cadastro.");
      return;
    }

    if (form.cpf.length !== 11) {
      setErro("Digite um CPF com 11 números.");
      return;
    }

    if (form.senha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    try {
      setEnviando(true);
      const resposta = await axios.post(`${API}/cadastro`, {
  nome: form.nome,
  sobrenome: form.sobrenome,
  email: form.email,
  dataNascimento: form.dataNascimento,
  cpf: form.cpf,
  genero: form.genero,
  nomeUsuario: form.nomeUsuario,
  senha: form.senha,
  aceitouTermos: true,
  versaoTermos: VERSAO_TERMOS,
  aceites: {
    termosUso: {
      versao: VERSAO_TERMOS,
    },
    politicaRisco: {
      versao: VERSAO_POLITICA_RISCO,
    },
    politicaPrivacidade: {
      versao: VERSAO_POLITICA_PRIVACIDADE,
    },
  },
});

window.sessionStorage.setItem(
  "emailVerificacaoPendente",
  form.email.trim().toLowerCase()
);

adicionarToast(
  resposta.data?.mensagem || "Cadastro realizado com sucesso!",
  resposta.status === 202 ? "warning" : "success"
);

router.push("/verificar-email?cadastro=1");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.erro ||
        "Erro ao cadastrar. Tente novamente.";
      setErro(msg);
      adicionarToast(msg, "error");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Container>
      <Shell>
        <BrandPanel>
          <BrandContent>
            <Eyebrow>Seu mercado. Sua estratégia.</Eyebrow>
            <BrandTitle>
              Transforme sua leitura do esporte em <em>decisões de mercado.</em>
            </BrandTitle>
            <BrandText>
              Monte sua carteira, acompanhe o desempenho dos clubes e negocie
              cotas virtuais em um ambiente competitivo e transparente.
            </BrandText>

            <BenefitList>
              <Benefit>
                <BenefitIcon>01</BenefitIcon>
                <div>
                  <strong>Mercado dinâmico</strong>
                  <span>Preços formados pela oferta e pela demanda.</span>
                </div>
              </Benefit>
              <Benefit>
                <BenefitIcon>02</BenefitIcon>
                <div>
                  <strong>Estratégia esportiva</strong>
                  <span>Informação e visão de jogo orientam suas escolhas.</span>
                </div>
              </Benefit>
              <Benefit>
                <BenefitIcon>03</BenefitIcon>
                <div>
                  <strong>Ambiente simulado</strong>
                  <span>Experiência expressa em moeda virtual T$.</span>
                </div>
              </Benefit>
            </BenefitList>
          </BrandContent>

          <PanelFooter>
            <StatusDot />
            Plataforma em ambiente de simulação
          </PanelFooter>
        </BrandPanel>

        <Card>
          <CardHeader>
            <StepLabel>Crie sua conta</StepLabel>
            <Titulo>Comece sua jornada</Titulo>
            <Subtitulo>
              Preencha seus dados para acessar o mercado TradeSports.
            </Subtitulo>
          </CardHeader>

        <Form onSubmit={handleSubmit}>
          <Linha2colunas>
            <Campo>
              <Label>Nome</Label>
              <Input
                name="nome"
                placeholder="Nome"
                value={form.nome}
                onChange={handleChange}
                required
              />
            </Campo>

            <Campo>
              <Label>Sobrenome completo</Label>
              <Input
                name="sobrenome"
                placeholder="Sobrenome completo"
                value={form.sobrenome}
                onChange={handleChange}
                required
              />
            </Campo>
          </Linha2colunas>

          <Linha2colunas>
            <Campo>
              <Label>E-mail</Label>
              <Input
                name="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </Campo>

            <Campo>
              <Label>Data de Nascimento</Label>
              <Input
                name="dataNascimento"
                type="date"
                value={form.dataNascimento}
                onChange={handleChange}
                required
              />
            </Campo>
          </Linha2colunas>

          <Linha2colunas>
            <Campo>
              <Label>CPF</Label>
              <Input
                name="cpf"
                placeholder="00000000000"
                inputMode="numeric"
                maxLength={11}
                value={form.cpf}
                onChange={handleChange}
                required
              />
            </Campo>

            <Campo>
              <Label>Gênero</Label>
              <Select name="genero" value={form.genero} onChange={handleChange} required>
                <option value="">Selecione o gênero</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
                <option value="Prefiro não informar">Prefiro não informar</option>
              </Select>
            </Campo>
          </Linha2colunas>

          <Campo>
            <Label>Nome de Usuário</Label>
            <Input
              name="nomeUsuario"
              placeholder="Ex: gvinvest"
              value={form.nomeUsuario}
              onChange={handleChange}
              required
            />
          </Campo>

          <Linha2colunas>
            <Campo>
              <Label>Senha</Label>
              <Input
                name="senha"
                type="password"
                placeholder="Mínimo de 8 caracteres"
                minLength={8}
                autoComplete="new-password"
                value={form.senha}
                onChange={handleChange}
                required
              />
            </Campo>

            <Campo>
              <Label>Confirmar Senha</Label>
              <Input
                name="confirmarSenha"
                type="password"
                placeholder="Repita sua senha"
                minLength={8}
                autoComplete="new-password"
                value={form.confirmarSenha}
                onChange={handleChange}
                required
              />
            </Campo>
          </Linha2colunas>

          {erro && <ErroMsg>{erro}</ErroMsg>}

          <AceiteLinha>
            <Checkbox
              type="checkbox"
              checked={aceitouTermos}
              disabled={!termosLiberados}
              onChange={(e) => setAceitouTermos(e.target.checked)}
              id="aceite-termos"
            />

            <AceiteTexto htmlFor="aceite-termos">
              Li e aceito os{" "}
              <LinkLike
                type="button"
                onClick={() => {
                  setMostrarTermos(true);
                  setTermosScrollNoFim(false);
                }}
              >
                Termos de Uso
              </LinkLike>{" "}
              , a{" "}
              <LinkLike type="button" onClick={() => setMostrarPoliticaRisco(true)}>
                Política de Risco
              </LinkLike>{" "}
              e a{" "}
              <LinkLike type="button" onClick={() => setMostrarPoliticaPrivacidade(true)}>
                Política de Privacidade
              </LinkLike>
              .
            </AceiteTexto>
          </AceiteLinha>

          <Botao
            type="submit"
            disabled={!aceitouTermos || !termosLiberados || enviando}
          >
            {enviando ? "Criando sua conta..." : "Criar minha conta"}
            {!enviando && <BotaoSeta aria-hidden="true">→</BotaoSeta>}
          </Botao>

          <LoginTexto>
            Já possui uma conta? <Link href="/login">Entrar agora</Link>
          </LoginTexto>

          <Nota>
            Ao criar sua conta, você declara ciência dos riscos e concorda com os Termos de Uso e as
            Políticas exibidas.
          </Nota>
        </Form>
        </Card>
      </Shell>

      {/* MODAL TERMOS (scroll obrigatório) */}
      {mostrarTermos && (
        <Overlay onClick={() => setMostrarTermos(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Termos de Uso (TradeSports)</ModalTitle>
              <Fechar type="button" onClick={() => setMostrarTermos(false)} aria-label="Fechar">
                ✕
              </Fechar>
            </ModalHeader>

            <ModalBody
              ref={termosScrollRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
                  setTermosScrollNoFim(true);
                }
              }}
            >
              <TermosPre>{termosTexto}</TermosPre>
            </ModalBody>

            <ModalFooter>
              <ModalHint>
                {!termosScrollNoFim
                  ? 'Role até o final dos Termos para habilitar o botão “Aceitar”.'
                  : `Ao aceitar, você concorda com esta versão (${VERSAO_TERMOS}).`}
              </ModalHint>

              <ModalActions>
                <BotaoSec type="button" onClick={() => setMostrarTermos(false)}>
                  Voltar
                </BotaoSec>
                <BotaoPrim
                  type="button"
                  disabled={!termosScrollNoFim}
                  onClick={() => {
                    setAceitouTermos(true);
                    setTermosLiberados(true);
                    setMostrarTermos(false);
                  }}
                >
                  Aceitar e continuar
                </BotaoPrim>
              </ModalActions>
            </ModalFooter>
          </Modal>
        </Overlay>
      )}

      {/* MODAL POLÍTICA DE RISCO */}
      {mostrarPoliticaRisco && (
        <Overlay onClick={() => { setAceitouPoliticaRisco(true); setMostrarPoliticaRisco(false); }}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Política de Risco (TradeSports)</ModalTitle>
              <Fechar
                type="button"
                onClick={() => { setAceitouPoliticaRisco(true); setMostrarPoliticaRisco(false); }}
                aria-label="Fechar"
              >
                ✕
              </Fechar>
            </ModalHeader>

            <ModalBody>
              <TermosPre>{politicaRiscoTexto}</TermosPre>
            </ModalBody>

            <ModalFooter>
              <ModalActions>
                <BotaoPrim type="button" onClick={() => { setAceitouPoliticaRisco(true); setMostrarPoliticaRisco(false); }}>
                  Entendi
                </BotaoPrim>
              </ModalActions>
            </ModalFooter>
          </Modal>
        </Overlay>
      )}

      {/* MODAL POLÍTICA DE PRIVACIDADE (componente separado) */}
      {mostrarPoliticaPrivacidade && (
        <PoliticaPrivacidadeModal onClose={() => setMostrarPoliticaPrivacidade(false)} onAceitar={() => setAceitouPoliticaPrivacidade(true)} />
      )}
    </Container>
  );
}

/* ======= Styles ======= */

const Container = styled.main`
  position: relative;
  min-height: 100vh;
  padding: 42px 24px;
  display: grid;
  place-items: center;
  overflow: hidden;
  background:
    linear-gradient(rgba(3, 12, 24, 0.9), rgba(3, 12, 24, 0.97)),
    radial-gradient(circle at 12% 12%, #12365b 0, transparent 42%),
    #030c18;
  color: #e5edf8;

  @media (max-width: 700px) {
    padding: 18px 12px;
    place-items: start center;
  }
`;

const Glow = styled.div`
  position: absolute;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  filter: blur(110px);
  opacity: 0.17;
  pointer-events: none;
  background: ${({ $um }) => ($um ? "#1d6fff" : "#13d97c")};
  top: ${({ $um }) => ($um ? "-180px" : "auto")};
  left: ${({ $um }) => ($um ? "-120px" : "auto")};
  right: ${({ $dois }) => ($dois ? "-160px" : "auto")};
  bottom: ${({ $dois }) => ($dois ? "-180px" : "auto")};
`;

const Shell = styled.section`
  position: relative;
  z-index: 1;
  width: min(1120px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(520px, 1.1fr);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 28px;
  overflow: hidden;
  background: rgba(8, 22, 39, 0.86);
  box-shadow: 0 34px 90px rgba(0, 0, 0, 0.42);

  @media (max-width: 940px) {
    grid-template-columns: 1fr;
    max-width: 680px;
  }
`;

const BrandPanel = styled.aside`
  position: relative;
  min-height: 720px;
  padding: 38px;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(150deg, rgba(18, 55, 91, 0.62), rgba(4, 18, 33, 0.94)),
    radial-gradient(circle at 30% 20%, rgba(31, 111, 235, 0.28), transparent 48%);
  border-right: 1px solid rgba(148, 163, 184, 0.12);

  @media (max-width: 940px) {
    display: none;
  }
`;

const BrandLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 11px;
  width: fit-content;
  color: #fff;
  text-decoration: none;
`;

const MobileBrand = styled(BrandLink)`
  display: none;
  margin-bottom: 26px;

  @media (max-width: 940px) {
    display: inline-flex;
  }
`;

const BrandMark = styled.span`
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  position: relative;
  border-radius: 13px;
  background: linear-gradient(145deg, #20db83, #0bad65);
  box-shadow: 0 10px 28px rgba(19, 217, 124, 0.2);

  span {
    position: absolute;
    color: #031423;
    font-size: 19px;
    font-weight: 950;
    line-height: 1;
  }

  span:first-child {
    transform: translate(-5px, -5px);
  }

  span:last-child {
    transform: translate(5px, 5px);
  }
`;

const BrandName = styled.strong`
  color: #fff;
  font-size: 1.24rem;
  font-weight: 900;
  letter-spacing: -0.04em;

  span {
    color: #21dc83;
  }
`;

const BrandContent = styled.div`
  margin: auto 0;
`;

const Eyebrow = styled.div`
  margin-bottom: 16px;
  color: #6ee7b7;
  font-size: 0.69rem;
  font-weight: 900;
  letter-spacing: 0.15em;
  text-transform: uppercase;
`;

const BrandTitle = styled.h2`
  margin: 0;
  max-width: 430px;
  color: #fff;
  font-size: clamp(2rem, 3vw, 3.25rem);
  line-height: 1.02;
  letter-spacing: -0.055em;

  em {
    color: #21dc83;
    font-style: normal;
  }
`;

const BrandText = styled.p`
  max-width: 430px;
  margin: 20px 0 30px;
  color: #9db0c7;
  font-size: 0.94rem;
  line-height: 1.7;
`;

const BenefitList = styled.div`
  display: grid;
  gap: 12px;
`;

const Benefit = styled.div`
  padding: 13px;
  display: flex;
  align-items: center;
  gap: 13px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.035);

  strong, span { display: block; }
  strong { color: #e8f0fa; font-size: 0.79rem; }
  span { margin-top: 3px; color: #72869e; font-size: 0.69rem; }
`;

const BenefitIcon = styled.span`
  width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 10px;
  background: rgba(32, 219, 131, 0.1);
  color: #4ade9d;
  font-size: 0.66rem;
  font-weight: 900;
`;

const PanelFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #71859d;
  font-size: 0.68rem;
`;

const StatusDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #21dc83;
  box-shadow: 0 0 12px rgba(33, 220, 131, 0.7);
`;

const Card = styled.div`
  padding: 42px 48px;
  background: rgba(6, 18, 33, 0.94);

  @media (max-width: 600px) {
    padding: 26px 20px 30px;
  }
`;

const CardHeader = styled.header`
  margin-bottom: 25px;
`;

const StepLabel = styled.div`
  margin-bottom: 8px;
  color: #4d94ff;
  font-size: 0.69rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const Titulo = styled.h1`
  margin: 0;
  color: #fff;
  font-size: clamp(1.8rem, 3vw, 2.35rem);
  line-height: 1.1;
  letter-spacing: -0.045em;
`;

const Subtitulo = styled.p`
  margin: 9px 0 0;
  color: #8295ac;
  font-size: 0.82rem;
  line-height: 1.55;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Linha2colunas = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 13px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Campo = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const Label = styled.label`
  color: #b5c2d2;
  font-size: 0.7rem;
  font-weight: 750;
`;

const inputBase = `
  width: 100%;
  height: 46px;
  box-sizing: border-box;
  padding: 0 13px;
  border: 1px solid rgba(148, 163, 184, 0.17);
  border-radius: 11px;
  background: rgba(2, 10, 20, 0.72);
  color: #eef5fc;
  font: inherit;
  font-size: 0.79rem;
  outline: none;
  transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;

  &::placeholder { color: #53657b; }
  &:hover { border-color: rgba(148, 163, 184, 0.28); }
  &:focus {
    border-color: rgba(65, 133, 255, 0.75);
    background: rgba(4, 17, 31, 0.94);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.13);
  }
`;

const Input = styled.input`${inputBase}`;
const Select = styled.select`
  ${inputBase}
  color-scheme: dark;
  cursor: pointer;
`;

const ErroMsg = styled.div`
  padding: 11px 13px;
  border: 1px solid rgba(248, 113, 113, 0.25);
  border-radius: 11px;
  background: rgba(239, 68, 68, 0.09);
  color: #fca5a5;
  font-size: 0.74rem;
  line-height: 1.45;
`;

const AceiteLinha = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 2px;
  padding: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.025);
`;

const Checkbox = styled.input`
  width: 17px;
  height: 17px;
  margin: 1px 0 0;
  flex: 0 0 auto;
  accent-color: #17c978;
`;

const AceiteTexto = styled.label`
  color: #8fa2b8;
  font-size: 0.7rem;
  line-height: 1.55;
`;

const LinkLike = styled.button`
  padding: 0;
  border: 0;
  background: transparent;
  color: #69a3ff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  &:hover { color: #93bdff; text-decoration: underline; }
`;

const Botao = styled.button`
  height: 48px;
  margin-top: 2px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 11px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #19d47e, #10b96c);
  color: #03160e;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(16, 185, 108, 0.17);
  transition: transform 160ms ease, box-shadow 160ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 15px 34px rgba(16, 185, 108, 0.25);
  }

  &:disabled { opacity: 0.48; cursor: not-allowed; box-shadow: none; }
`;

const BotaoSeta = styled.span`
  font-size: 1.1rem;
`;

const LoginTexto = styled.p`
  margin: 0;
  color: #6f829a;
  font-size: 0.73rem;
  text-align: center;

  a {
    color: #7eafff;
    font-weight: 850;
    text-decoration: none;
  }
  a:hover { text-decoration: underline; }
`;

const Nota = styled.p`
  margin: -3px 0 0;
  color: #53657b;
  font-size: 0.65rem;
  line-height: 1.5;
  text-align: center;
`;

/* Modal */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(1, 6, 13, 0.82);
  backdrop-filter: blur(8px);
`;

const Modal = styled.div`
  width: 100%;
  max-width: 780px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 18px;
  background: #f8fafc;
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
`;

const Fechar = styled.button`
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 9px;
  background: #eaf0f6;
  color: #334155;
  cursor: pointer;
`;

const ModalBody = styled.div`
  max-height: 60vh;
  padding: 18px;
  overflow: auto;
`;

const TermosPre = styled.pre`
  margin: 0;
  color: #1e293b;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 0.76rem;
  line-height: 1.65;
`;

const ModalFooter = styled.div`
  padding: 13px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid #e2e8f0;

  @media (max-width: 560px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const ModalHint = styled.div`
  color: #64748b;
  font-size: 0.69rem;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 9px;
`;

const BotaoSec = styled.button`
  height: 38px;
  padding: 0 15px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  background: #fff;
  color: #334155;
  font-weight: 800;
  cursor: pointer;
`;

const BotaoPrim = styled.button`
  height: 38px;
  padding: 0 15px;
  border: 0;
  border-radius: 9px;
  background: #2563eb;
  color: #fff;
  font-weight: 850;
  cursor: pointer;

  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;


