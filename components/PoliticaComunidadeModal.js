import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

// Modal 100% self-contained (sem dependências externas)

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 9999;
`;

const Modal = styled.div`
  width: 100%;
  max-width: 900px;
  height: 85vh;
  background: #f7f7f9;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
`;

const Fechar = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  color: #111827;
  padding: 6px;
`;

const ModalBody = styled.div`
  flex: 1;
  overflow: auto;
  padding: 16px;
`;

const TextoPre = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  color: #111827;
`;

const ModalFooter = styled.div`
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const BotaoPrim = styled.button`
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 700;
  background: #2563eb;
  color: #fff;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BotaoSec = styled.button`
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 700;
  background: #fff;
  color: #111827;
`;

export default function PoliticaComunidadeModal({
  onClose,
  onAceitar,
  exigirLeitura = false,
  textoBotao = "Li e concordo",
}) {
  const [scrollNoFim, setScrollNoFim] = useState(!exigirLeitura);
  const bodyRef = useRef(null);
  const texto = useMemo(
    () =>
      `# POLÍTICA DA COMUNIDADE DA TRADESPORTS

**Documento:** Política da Comunidade da Plataforma TradeSports  
**ID:** TS-JUR-COM-001  
**Versão:** 1.0  
**Status:** Vigente a partir do lançamento público  
**Data da versão:** 26 de julho de 2026  
**Responsável pelo documento:** TradeSports — Jurídico e Compliance  
**Classificação:** Público  
**Entrada em vigor:** Na data de lançamento público da TradeSports  

## QUADRO-RESUMO

Este quadro facilita a leitura, mas não substitui o conteúdo integral da Política.

| Tema | Regra essencial |
|---|---|
| Finalidade | Manter um ambiente seguro, respeitoso, autêntico e compatível com a integridade da Plataforma |
| Abrangência | Perfis, nomes de usuário, biografias, imagens, publicações, comentários, respostas, reações, seguidores, mensagens e demais interações sociais |
| Público | Usuários elegíveis conforme os Termos de Uso; a Plataforma não é destinada a menores de 18 anos |
| Opiniões | Debates esportivos, análises, estratégias e críticas de boa-fé são permitidos |
| Integridade | É proibido manipular preços, engajamento, reputação ou decisões de outros usuários |
| Segurança | Ameaças, assédio, discriminação, exposição de dados pessoais, golpes e conteúdo ilegal são proibidos |
| Publicidade | Conteúdo patrocinado, afiliado ou decorrente de benefício deve ser identificado claramente |
| Moderação | Pode haver aviso, redução de alcance, remoção, limitação de recursos, suspensão ou encerramento, conforme gravidade e reincidência |
| Contestação | O usuário poderá pedir revisão de decisões de moderação pelo canal indicado |
| Denúncias | Devem ser feitas de boa-fé; denúncias abusivas ou coordenadas também violam esta Política |
| Recursos financeiros | Sanção social não autoriza confisco de saldo ou posições; restrições financeiras dependem de fundamento próprio nos Termos, na segurança ou na lei |
| Canal | Canais oficiais de atendimento, denúncia e recurso disponibilizados na Plataforma |

## 1. OBJETIVO

1.1. Esta Política estabelece as regras de participação nas funcionalidades sociais da TradeSports e os critérios gerais de prevenção, denúncia e moderação de condutas e conteúdos.

1.2. A TradeSports pretende favorecer debates esportivos, troca de informações, aprendizado, interação entre torcedores e discussão responsável sobre as funcionalidades da Plataforma.

1.3. Liberdade de expressão, pluralidade de opiniões e rivalidade esportiva saudável são bem-vindas. Esses direitos não abrangem ameaças, assédio, discriminação, fraude, manipulação, exposição indevida de pessoas, violação de direitos ou outras condutas proibidas nesta Política.

1.4. Esta Política busca proteger:

a) a segurança e a dignidade das pessoas;  
b) a autenticidade das interações;  
c) a integridade informacional e operacional da Plataforma;  
d) a privacidade e os dados pessoais;  
e) os direitos de propriedade intelectual; e  
f) o cumprimento das leis, dos Termos de Uso e das regras específicas da TradeSports.

## 2. ABRANGÊNCIA

2.1. Esta Política aplica-se a todo conteúdo, comportamento e interação relacionados às funcionalidades sociais da TradeSports, incluindo:

a) nome de usuário, nome de exibição, fotografia, avatar, biografia e demais elementos do perfil;  
b) publicações, imagens, vídeos, links, enquetes e arquivos;  
c) comentários, respostas, menções, reações e compartilhamentos;  
d) seguidores, conexões, listas e grupos, quando disponíveis;  
e) mensagens privadas ou diretas, quando disponíveis;  
f) transmissões ao vivo, salas ou recursos de áudio, quando disponíveis;  
g) denúncias, recursos, contatos com a moderação e avaliações; e  
h) tentativas de contornar regras ou sanções, ainda que realizadas fora da interface principal.

2.2. Condutas praticadas fora da TradeSports poderão ser consideradas quando estiverem diretamente relacionadas à segurança de usuários, fraude, manipulação da Plataforma, ameaça concreta, evasão de sanção ou uso indevido de informações obtidas na TradeSports.

2.3. Esta Política aplica-se a usuários, visitantes, administradores de perfis, parceiros, anunciantes e demais pessoas que utilizem ou apareçam nas funcionalidades sociais.

## 3. RELAÇÃO COM OUTROS DOCUMENTOS

3.1. Esta Política integra o conjunto normativo da TradeSports e deve ser lida em conjunto com:

a) os Termos de Uso;  
b) a Política de Privacidade;  
c) a Política de Risco;  
d) as Regras de Mercado;  
e) a Política Antifraude; e  
f) as regras específicas de cada competição, campanha ou funcionalidade.

3.2. Em caso de conflito, prevalecerão: (i) a legislação obrigatória; (ii) os Termos de Uso; (iii) a regra específica aplicável; e (iv) esta Política, ressalvada disposição mais protetiva ao usuário exigida por lei.

3.3. O fato de determinada conduta não estar descrita literalmente neste documento não impede providências quando ela violar a lei, os Termos de Uso, direitos de terceiros ou a finalidade evidente de uma regra.

3.4. A aplicação desta Política não representa renúncia do usuário a direitos assegurados pela legislação.

## 4. DISPONIBILIDADE E ELEGIBILIDADE

4.1. Esta Política produzirá efeitos a partir do lançamento público da TradeSports e abrangerá todas as funcionalidades sociais disponibilizadas aos usuários.

4.2. A TradeSports é destinada a pessoas com 18 anos ou mais, conforme os Termos de Uso. É proibido criar ou manter conta em nome de menor, permitir que menor utilize a conta ou apresentar falsamente a idade.

4.3. A participação social poderá depender de conta verificada, confirmação de e-mail, tempo mínimo de cadastro, histórico de segurança ou outros critérios objetivos informados pela Plataforma.

4.4. Algumas funcionalidades poderão ser limitadas para contas novas ou sob análise, desde que a limitação seja proporcional, não discriminatória e compatível com a segurança do serviço.

## 5. PRINCÍPIOS DA COMUNIDADE

Espera-se que cada participante:

a) trate outras pessoas com respeito, inclusive durante rivalidades esportivas;  
b) diferencie fatos, opiniões, previsões, publicidade, humor e sátira;  
c) verifique informações antes de apresentá-las como verdadeiras;  
d) divulgue conflitos de interesse e relações comerciais relevantes;  
e) respeite privacidade, autoria, imagem, honra e demais direitos;  
f) utilize apenas uma conta, salvo autorização expressa;  
g) não pressione outras pessoas a assumir riscos ou realizar operações;  
h) ajude a identificar golpes, manipulações e riscos reais; e  
i) utilize os canais de denúncia de boa-fé.

## 6. CONTEÚDOS E CONDUTAS PERMITIDOS

6.1. São permitidos, observadas as demais regras:

a) opiniões sobre clubes, atletas, campeonatos, desempenho esportivo e mercado da Plataforma;  
b) análises estatísticas, projeções e estratégias identificadas como opinião ou estimativa;  
c) críticas fundamentadas à TradeSports, aos clubes, a entidades esportivas ou a outros agentes;  
d) humor, sátira, memes e provocações esportivas que não ultrapassem os limites desta Política;  
e) relato verdadeiro de experiência pessoal;  
f) correção respeitosa de informações;  
g) compartilhamento de fontes públicas e legítimas; e  
h) conteúdo educacional sobre uso responsável da Plataforma.

6.2. Discordância, crítica, erro de boa-fé, impopularidade ou opinião minoritária, isoladamente, não justificam remoção.

6.3. Conteúdo opinativo sobre possíveis movimentos de preço deverá ser apresentado como análise pessoal, sem promessa de resultado e sem ocultação de interesse relevante.

## 7. VIOLÊNCIA, AMEAÇAS E INCITAÇÃO

7.1. É proibido:

a) ameaçar, incentivar, celebrar ou organizar violência física;  
b) desejar morte, lesão grave ou violência sexual contra pessoa ou grupo identificável;  
c) divulgar instruções voltadas à prática de violência ou crime;  
d) promover organizações criminosas, terroristas ou violentas;  
e) publicar imagens de violência extrema com finalidade de choque, glorificação ou intimidação; ou  
f) praticar extorsão, chantagem ou coação.

7.2. Conteúdo jornalístico, educativo ou de denúncia poderá ser permitido quando houver contexto suficiente, necessidade e cuidado com vítimas e pessoas vulneráveis.

7.3. A TradeSports poderá remover imediatamente conteúdo que indique risco concreto e iminente e, quando cabível, preservar informações e cooperar com autoridades competentes nos limites da lei.

## 8. ASSÉDIO, INTIMIDAÇÃO E HUMILHAÇÃO

8.1. É proibido:

a) perseguir, intimidar ou atacar repetidamente uma pessoa;  
b) incentivar outras pessoas a assediar, ridicularizar ou silenciar alguém;  
c) realizar contato insistente após pedido claro para cessar;  
d) publicar insultos degradantes dirigidos de forma persistente;  
e) sexualizar alguém sem consentimento;  
f) ameaçar divulgar informações privadas ou conteúdo íntimo; ou  
g) explorar luto, doença, deficiência, vulnerabilidade econômica ou situação traumática para humilhar.

8.2. Críticas a ideias, estratégias e condutas são permitidas. Ataques pessoais persistentes, campanhas de humilhação e intimidação sistemática não são.

8.3. O contexto será considerado, inclusive reciprocidade, frequência, alvo, assimetria de poder, intenção aparente, impacto e eventual pedido para interromper o contato.

## 9. ÓDIO, DISCRIMINAÇÃO E DESUMANIZAÇÃO

9.1. É proibido atacar, excluir, inferiorizar, ameaçar ou desumanizar pessoas com base em características protegidas, incluindo raça, cor, etnia, nacionalidade, origem, religião, sexo, gênero, identidade de gênero, orientação sexual, deficiência, idade ou condição de saúde.

9.2. Também são proibidos símbolos, estereótipos, comparações degradantes, negação de direitos e elogio a práticas de perseguição quando empregados para promover ódio ou discriminação.

9.3. Discussões críticas, acadêmicas, jornalísticas, históricas ou de denúncia poderão ser permitidas quando o contexto deixar claro que não há promoção da conduta discriminatória.

## 10. EXPLORAÇÃO SEXUAL E PROTEÇÃO DE PESSOAS VULNERÁVEIS

10.1. É estritamente proibido:

a) conteúdo de exploração ou abuso sexual;  
b) conteúdo sexual envolvendo menores de idade ou pessoa apresentada como menor;  
c) divulgação, ameaça de divulgação ou solicitação de imagem íntima sem consentimento;  
d) oferta ou solicitação de serviço sexual quando ilegal ou incompatível com a Plataforma; e  
e) incentivo à exploração de pessoa vulnerável.

10.2. A TradeSports poderá remover imediatamente o conteúdo, restringir a conta, preservar evidências e adotar as medidas legais cabíveis.

## 11. PRIVACIDADE, DADOS PESSOAIS E EXPOSIÇÃO INDEVIDA

11.1. É proibido divulgar, solicitar ou ameaçar divulgar dados pessoais ou informações privadas de terceiros sem autorização ou base legal, incluindo:

a) documentos, CPF, endereço, telefone, e-mail pessoal e dados bancários;  
b) senha, código de autenticação, token, chave ou credencial;  
c) localização precisa ou rotina que crie risco à segurança;  
d) conteúdo de comunicação privada;  
e) informações médicas, biométricas, sexuais ou familiares;  
f) saldo, extrato, posição, estratégia ou histórico não tornado público pelo titular; e  
g) qualquer combinação de dados destinada a identificar, constranger, fraudar ou ameaçar alguém.

11.2. O usuário deve evitar publicar seus próprios documentos, credenciais e informações financeiras. A publicação voluntária não transfere à TradeSports a obrigação de manter o conteúdo disponível.

11.3. Imagens, gravações e comunicações de terceiros devem respeitar consentimento, expectativa legítima de privacidade e legislação aplicável.

## 12. AUTENTICIDADE, IDENTIDADE E IMPERSONAÇÃO

12.1. É proibido:

a) fingir ser outra pessoa, clube, atleta, entidade, empresa ou representante oficial;  
b) utilizar nome, imagem, marca ou descrição de modo capaz de causar confusão relevante;  
c) criar conta ou perfil para enganar, difamar ou contornar sanção;  
d) negociar, vender, ceder ou emprestar perfil; ou  
e) ocultar identidade para praticar fraude, manipulação ou assédio.

12.2. Contas de comentário, fã, sátira ou paródia deverão ser claramente identificadas e não poderão sugerir vínculo oficial inexistente.

12.3. A TradeSports poderá solicitar verificação adicional antes de conceder selo, destaque ou identificação de autenticidade. Selos não representam endosso de opiniões ou garantia de idoneidade.

## 13. INTEGRIDADE DAS INFORMAÇÕES

13.1. É proibido criar, alterar ou disseminar deliberadamente informação falsa ou materialmente enganosa capaz de:

a) induzir usuários a erro sobre preços, liquidez, regras, taxas, resultados ou funcionamento da TradeSports;  
b) influenciar artificialmente decisões de compra ou venda;  
c) simular comunicação oficial da TradeSports, de clube ou de entidade esportiva;  
d) criar pânico, urgência artificial ou falsa escassez;  
e) ocultar condição essencial de promoção, campanha ou parceria; ou  
f) prejudicar pessoa ou organização mediante falsificação de evidências.

13.2. Previsões, rumores e informações ainda não confirmadas devem ser identificados como tais e, sempre que possível, acompanhados de fonte.

13.3. Erros de boa-fé poderão ser corrigidos por edição, aviso contextual, redução temporária de distribuição ou pedido de correção, conforme o caso.

13.4. Humor e sátira devem ser reconhecíveis como tais e não podem ser usados como pretexto para fraude, ameaça ou manipulação.

## 14. INTEGRIDADE DE MERCADO E MANIPULAÇÃO

14.1. É proibido utilizar recursos sociais para manipular, tentar manipular ou criar aparência enganosa sobre preço, demanda, liquidez, popularidade ou oportunidade relacionada às cotas e operações da TradeSports.

14.2. São exemplos de condutas proibidas:

a) coordenar compras, vendas, cancelamentos ou publicações com finalidade de produzir movimento artificial de preço;  
b) promover esquema de valorização artificial seguido de venda coordenada, inclusive práticas conhecidas como *pump and dump*;  
c) espalhar informação sabidamente falsa para induzir outros usuários a comprar, vender ou manter posições;  
d) prometer lucro, retorno garantido, risco inexistente ou informação privilegiada;  
e) pagar, oferecer vantagem ou ameaçar pessoas para publicar, apagar, recomendar ou executar operação;  
f) simular demanda, consenso, reputação, histórico ou volume por meio de contas relacionadas;  
g) utilizar informação obtida de modo ilícito, confidencial ou em violação de dever;  
h) manipular enquetes, tendências, seguidores, reações ou comentários para influenciar decisões financeiras;  
i) organizar retaliação contra quem não aderir a estratégia ou operação coletiva; e  
j) oferecer compra, venda, cessão ou liquidação de cotas fora dos mecanismos autorizados da Plataforma.

14.3. É permitido debater estratégias, hipóteses e expectativas de boa-fé, desde que o usuário:

a) não apresente opinião como fato certo;  
b) não prometa resultado;  
c) não omita interesse relevante;  
d) não coordene comportamento manipulativo; e  
e) não utilize dados falsos, confidenciais ou obtidos ilicitamente.

14.4. Conteúdo social poderá ser analisado em conjunto com ordens, negociações, contas relacionadas e registros técnicos para prevenção e apuração de fraude ou manipulação, conforme os Termos de Uso e a Política de Privacidade.

## 15. CONFLITOS DE INTERESSE, PUBLICIDADE E RECOMENDAÇÕES

15.1. O usuário deverá informar de forma clara e próxima ao conteúdo quando:

a) possuir posição relevante que possa se beneficiar da mensagem;  
b) receber dinheiro, desconto, comissão, produto, acesso, convite ou outra vantagem;  
c) mantiver vínculo profissional, societário, familiar ou comercial relevante; ou  
d) publicar em nome de terceiro.

15.2. A divulgação deverá utilizar linguagem inequívoca, como “publicidade”, “patrocinado”, “parceria paga” ou “tenho posição nesta cota”, conforme o caso.

15.3. É proibido:

a) ocultar publicidade ou conflito material;  
b) enviar publicidade em massa ou repetitiva;  
c) anunciar produto, serviço ou oportunidade ilegal, fraudulenta ou não autorizada;  
d) solicitar depósito, pagamento, credencial ou transferência fora dos canais oficiais;  
e) oferecer gestão informal de conta, promessa de retorno ou operação em nome de terceiros; e  
f) utilizar marca, layout ou linguagem da TradeSports para simular aprovação oficial.

15.4. Conteúdo de influenciadores, parceiros ou afiliados estará sujeito às mesmas regras e a eventuais normas específicas de publicidade.

## 16. GOLPES, FRAUDES E ENGENHARIA SOCIAL

16.1. É proibido:

a) criar promoção, sorteio, suporte ou atendimento falso;  
b) solicitar senha, código, token, documento ou dado bancário;  
c) divulgar link malicioso, arquivo infectado ou página de captura de credenciais;  
d) cobrar para liberar saldo, saque, prêmio ou suposto benefício da TradeSports;  
e) oferecer recuperação de conta ou valor mediante pagamento;  
f) praticar pirâmide, fraude, estelionato ou esquema enganoso; e  
g) utilizar relacionamento afetivo, autoridade, urgência ou medo para obter vantagem.

16.2. A TradeSports não solicitará senha completa nem código de autenticação por publicação, comentário, mensagem privada ou atendimento informal.

16.3. Suspeitas de fraude devem ser encaminhadas pelo canal oficial de segurança ou atendimento disponibilizado na Plataforma.

## 17. SPAM E COMPORTAMENTO INAUTÊNTICO

17.1. É proibido:

a) publicar conteúdo idêntico ou substancialmente semelhante de forma excessiva;  
b) mencionar, seguir ou enviar mensagens em massa sem contexto legítimo;  
c) criar contas múltiplas ou redes coordenadas para ampliar alcance ou evitar limites;  
d) comprar, vender ou trocar seguidores, reações, comentários ou avaliações;  
e) utilizar automação não autorizada para publicar, reagir, seguir ou coletar dados;  
f) manipular sistemas de recomendação, busca, tendência ou denúncia; e  
g) inserir palavras-chave, links ou marcações enganosas apenas para obter alcance.

17.2. A TradeSports poderá limitar frequência, alcance ou funcionalidades para proteger a estabilidade e a autenticidade da Plataforma.

## 18. AUTOMAÇÃO, ROBÔS E CONTEÚDO GERADO POR INTELIGÊNCIA ARTIFICIAL

18.1. Ferramentas automatizadas, robôs, integrações ou APIs somente poderão ser utilizados quando expressamente autorizados e de acordo com os limites técnicos e contratuais.

18.2. O uso de inteligência artificial para auxiliar na criação de conteúdo não afasta a responsabilidade do usuário.

18.3. Conteúdo sintético ou significativamente alterado deverá ser identificado quando sua aparência puder induzir uma pessoa razoável a acreditar que evento, fala, imagem, voz, documento ou comunicação oficial é autêntico.

18.4. É proibido usar automação ou inteligência artificial para:

a) personificar pessoa ou entidade;  
b) criar provas falsas;  
c) produzir fraude, assédio ou desinformação coordenada;  
d) simular apoio popular ou atividade orgânica; ou  
e) contornar medidas de segurança e moderação.

## 19. PROPRIEDADE INTELECTUAL E DIREITOS DE TERCEIROS

19.1. O usuário somente deve publicar conteúdo que tenha direito de utilizar.

19.2. É proibido publicar ou distribuir, sem autorização ou fundamento legal:

a) obra protegida por direito autoral;  
b) transmissão, imagem, áudio ou trecho esportivo protegido;  
c) marca, escudo ou identidade visual de modo a causar confusão sobre vínculo oficial;  
d) segredo comercial ou informação confidencial; ou  
e) conteúdo que viole direito de imagem, voz, nome ou personalidade.

19.3. Referência nominativa a clubes, atletas, campeonatos e marcas para comentário, crítica, informação ou identificação poderá ser permitida nos limites da lei, sem sugerir patrocínio ou afiliação inexistente.

19.4. Titulares de direitos poderão encaminhar denúncia fundamentada pelo canal oficial de atendimento disponibilizado na Plataforma, identificando o conteúdo, o direito alegado, a localização e as informações necessárias à análise.

## 20. CONTEÚDO ILEGAL, PRODUTOS RESTRITOS E ATIVIDADES INCOMPATÍVEIS

20.1. É proibido utilizar a TradeSports para oferecer, solicitar, facilitar ou promover:

a) crime, fraude ou atividade ilegal;  
b) armas, drogas ilícitas, documentos falsos ou dados roubados;  
c) exploração sexual ou tráfico de pessoas;  
d) invasão de sistemas, malware ou obtenção ilícita de credenciais;  
e) lavagem de dinheiro, ocultação patrimonial ou dissimulação de origem de recursos;  
f) jogo, aposta ou serviço financeiro ilegal ou não autorizado;  
g) arrecadação ou intermediação financeira não autorizada; e  
h) qualquer produto ou serviço incompatível com a finalidade da Plataforma.

20.2. A TradeSports poderá restringir links, transações externas, campanhas e ofertas comerciais que criem risco relevante aos usuários ou à Plataforma.

## 21. DENÚNCIAS

21.1. Usuários poderão denunciar conteúdo, perfil ou comportamento pela funcionalidade de denúncia ou pelo canal oficial de atendimento disponibilizado na Plataforma.

21.2. Sempre que possível, a denúncia deverá indicar:

a) conteúdo ou conta denunciada;  
b) regra possivelmente violada;  
c) contexto relevante; e  
d) documentos ou evidências legítimas.

21.3. A denúncia será tratada de forma confidencial na medida possível. A identidade do denunciante não será revelada ao denunciado, salvo consentimento, necessidade de defesa, obrigação legal ou determinação competente.

21.4. É proibido:

a) denunciar conteúdo apenas por discordância;  
b) organizar denúncias falsas ou em massa;  
c) apresentar documento ou contexto manipulado;  
d) ameaçar alguém com denúncia para obter vantagem; ou  
e) retaliar pessoa que denunciou de boa-fé.

21.5. O envio de denúncia não garante remoção. A decisão considerará conteúdo, contexto, evidências e regras aplicáveis.

## 22. FERRAMENTAS DE CONTROLE DO USUÁRIO

22.1. Quando disponíveis, o usuário poderá:

a) deixar de seguir;  
b) silenciar;  
c) bloquear;  
d) limitar respostas ou mensagens;  
e) controlar visibilidade do perfil; e  
f) denunciar conteúdo ou conta.

22.2. Bloqueio e silêncio são ferramentas pessoais e não equivalem a decisão de que houve infração.

22.3. A TradeSports poderá manter determinados registros ou conteúdos inacessíveis ao público quando necessários para segurança, auditoria, defesa de direitos ou cumprimento legal.

## 23. MODERAÇÃO

23.1. A TradeSports poderá tomar conhecimento de possível violação por:

a) denúncia de usuário ou terceiro;  
b) detecção automatizada;  
c) análise de segurança, antifraude ou integridade;  
d) comunicação de autoridade ou titular de direito; ou  
e) revisão realizada por equipe autorizada.

23.2. A TradeSports não garante revisão prévia de todo conteúdo e não endossa publicações apenas por estarem disponíveis.

23.3. Conforme o caso, a moderação poderá:

a) não adotar medida;  
b) solicitar contexto ou correção;  
c) adicionar aviso, rótulo ou contexto;  
d) limitar recomendação, distribuição, interação ou descoberta;  
e) ocultar ou remover conteúdo;  
f) impedir determinada ação social;  
g) aplicar advertência;  
h) suspender funcionalidades ou a conta;  
i) encerrar a conta; e  
j) adotar medidas de segurança ou legais cabíveis.

23.4. Sistemas automatizados poderão auxiliar em detecção, prioridade e aplicação de medidas. Decisões de impacto relevante deverão admitir revisão humana quando legalmente exigida ou operacionalmente cabível.

23.5. A TradeSports buscará aplicar as regras de modo coerente, sem favorecimento ou punição em razão do clube apoiado, opinião esportiva, popularidade ou relação pessoal.

## 24. CRITÉRIOS DE DECISÃO E PROPORCIONALIDADE

24.1. A medida será definida considerando, quando aplicável:

a) natureza e gravidade da violação;  
b) risco ou dano produzido;  
c) intenção aparente e grau de participação;  
d) alcance, repetição e duração;  
e) uso de coordenação, automação ou fraude;  
f) vulnerabilidade do alvo;  
g) histórico e reincidência;  
h) cooperação e correção espontânea;  
i) possibilidade de medida menos restritiva; e  
j) exigência legal ou de segurança.

24.2. Violações leves e isoladas poderão resultar em orientação, correção ou remoção. Violações graves, reiteradas, fraudulentas ou capazes de produzir risco imediato poderão resultar em suspensão ou encerramento sem advertência prévia.

24.3. Tentativa, incentivo, auxílio, coordenação e evasão de sanção poderão receber tratamento semelhante ao da infração consumada.

24.4. A ausência de sanção anterior em caso semelhante não cria direito à repetição da conduta nem impede correção de entendimento.

## 25. EFEITOS SOBRE CONTA, SALDO E OPERAÇÕES

25.1. Medidas por infração exclusivamente social deverão, como regra, limitar-se ao conteúdo, ao alcance ou às funcionalidades sociais.

25.2. Remoção de conteúdo, advertência ou suspensão social não implica perda, confisco ou transferência de saldo, cotas ou direitos econômicos do usuário.

25.3. Restrições sobre depósito, saque, negociação, liquidação ou acesso geral à conta dependerão de fundamento autônomo previsto nos Termos de Uso, na Política Antifraude, em obrigação legal, ordem competente ou necessidade concreta de segurança.

25.4. Quando o encerramento da conta também atingir funcionalidades transacionais, a TradeSports deverá observar o procedimento de encerramento, apuração e devolução previsto nos Termos de Uso e na legislação, ressalvados bloqueios legalmente exigidos.

25.5. Nenhuma sanção autoriza apropriação indevida de recursos do usuário.

## 26. COMUNICAÇÃO DA DECISÃO

26.1. Quando não houver impedimento legal, risco à segurança, proteção de investigação ou inviabilidade técnica, a comunicação ao usuário deverá informar:

a) conteúdo ou comportamento analisado;  
b) regra aplicada;  
c) medida adotada;  
d) duração, quando temporária; e  
e) forma e prazo para contestação.

26.2. A TradeSports poderá limitar detalhes que revelem mecanismos antifraude, identidade de denunciante, dados de terceiros ou informações protegidas.

26.3. Em situações urgentes, a medida poderá ser aplicada antes da comunicação.

## 27. CONTESTAÇÃO E REVISÃO

27.1. O usuário poderá contestar decisão de moderação pelo canal indicado na própria comunicação ou pelo canal oficial de atendimento disponibilizado na Plataforma, dentro do prazo informado na decisão, salvo indisponibilidade justificada.

27.2. A contestação deverá:

a) identificar a decisão;  
b) explicar objetivamente o motivo da discordância; e  
c) apresentar contexto ou evidência legítima.

27.3. Sempre que possível, a revisão relevante será conduzida por pessoa diferente daquela que tomou a decisão inicial ou por nível de supervisão adequado.

27.4. A revisão poderá manter, reduzir, ampliar ou revogar a medida, conforme fatos e regras aplicáveis. Eventual agravamento deverá ser motivado por nova informação, erro material ou infração adicional.

27.5. Denúncias repetitivas, abusivas ou sem fato novo poderão ser encerradas.

27.6. O procedimento interno não impede acesso a canais de defesa do consumidor, autoridades ou Poder Judiciário.

## 28. PRESERVAÇÃO DE REGISTROS E COOPERAÇÃO

28.1. A TradeSports poderá preservar conteúdo removido, registros de acesso, denúncias, decisões, recursos e evidências pelo período necessário para:

a) segurança e prevenção a fraudes;  
b) defesa de direitos;  
c) auditoria e consistência da moderação;  
d) atendimento de obrigação legal ou ordem válida; e  
e) apuração de incidentes.

28.2. A preservação e o fornecimento de registros observarão a legislação, a Política de Privacidade, os requisitos de segurança e as competências das autoridades.

28.3. A TradeSports poderá cooperar com autoridades e titulares de direitos mediante solicitação juridicamente válida, preservando sigilo e direitos dos usuários.

28.4. A remoção pública de conteúdo não significa eliminação imediata de todos os registros quando houver fundamento legítimo para conservação.

## 29. CONTEÚDO DO USUÁRIO E LICENÇA OPERACIONAL

29.1. O usuário permanece titular dos direitos que possua sobre o conteúdo publicado.

29.2. Ao publicar, o usuário concede à TradeSports licença não exclusiva, gratuita e limitada ao necessário para hospedar, armazenar, reproduzir tecnicamente, formatar, exibir, distribuir dentro da Plataforma, moderar e disponibilizar o conteúdo conforme as configurações escolhidas.

29.3. A licença:

a) não transfere a propriedade do conteúdo;  
b) não autoriza venda autônoma do conteúdo pela TradeSports;  
c) permanece enquanto o conteúdo estiver disponível ou durante prazo tecnicamente e juridicamente necessário após sua remoção; e  
d) está sujeita às configurações de privacidade, à Política de Privacidade e à lei.

29.4. Uso publicitário externo que identifique o usuário ou destaque conteúdo específico dependerá de base jurídica e transparência adequadas e, quando necessário, autorização separada.

## 30. PRIVACIDADE E DADOS NA MODERAÇÃO

30.1. A moderação poderá envolver dados do perfil, conteúdo, interações, denúncias, registros técnicos, histórico de medidas e, quando necessário, relação com operações e contas vinculadas.

30.2. Esses dados poderão ser tratados para executar os Termos, proteger direitos, prevenir fraude, cumprir obrigação legal e atender outros fundamentos descritos na Política de Privacidade.

30.3. A TradeSports deverá limitar o acesso às pessoas e fornecedores que necessitem das informações para suas funções, com controles de segurança e confidencialidade.

30.4. O usuário poderá exercer os direitos previstos na legislação de proteção de dados pelos canais indicados na Política de Privacidade, sem prejuízo das limitações legais relativas a fraude, segredo comercial, direitos de terceiros e defesa em processos.

## 31. ALTERAÇÕES DESTA POLÍTICA

31.1. Esta Política poderá ser atualizada para refletir mudanças legais, riscos, funcionalidades, critérios de moderação ou práticas operacionais.

31.2. A versão vigente, sua data e seu histórico serão disponibilizados em local acessível.

31.3. Alterações materiais serão comunicadas com antecedência razoável, quando possível, e poderão exigir nova ciência ou aceite antes da continuidade no uso das funcionalidades sociais.

31.4. Medidas urgentes de segurança ou exigidas por lei poderão produzir efeitos imediatos, com comunicação posterior quando cabível.

## 32. CANAIS DE CONTATO

Para dúvidas, denúncias ou recursos:

- **Comunidade e moderação:** funcionalidade de denúncia ou canal oficial de atendimento da Plataforma  
- **Segurança e fraude:** canal oficial de segurança ou atendimento da Plataforma  
- **Privacidade e dados pessoais:** canal de privacidade indicado na Política de Privacidade  
- **Propriedade intelectual:** canal oficial de atendimento da Plataforma  
- **Atendimento geral:** canais disponibilizados na área de atendimento da Plataforma  

As comunicações deverão conter informações suficientes para identificação e análise do pedido, sem envio desnecessário de senhas, códigos de autenticação ou dados pessoais sensíveis.

## 33. REFERÊNCIAS NORMATIVAS

Esta Política considera, entre outras normas e referências:

- Constituição da República Federativa do Brasil de 1988;
- Lei nº 8.078/1990 — Código de Defesa do Consumidor;
- Lei nº 9.610/1998 — Lei de Direitos Autorais;
- Lei nº 10.406/2002 — Código Civil;
- Lei nº 12.965/2014 — Marco Civil da Internet;
- Decreto nº 8.771/2016 — Regulamentação do Marco Civil da Internet;
- Lei nº 13.185/2015 — Programa de Combate à Intimidação Sistemática;
- Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais;
- Lei nº 14.811/2024 — medidas de proteção e tipificação da intimidação sistemática virtual;
- Lei nº 15.211/2025 — Estatuto Digital da Criança e do Adolescente, naquilo que for aplicável;
- jurisprudência vigente do Supremo Tribunal Federal sobre responsabilidade de provedores de aplicações, especialmente os Temas 533 e 987, sujeita a atualizações; e
- normas civis, penais, consumeristas, publicitárias, esportivas e regulatórias aplicáveis.

## HISTÓRICO DE ALTERAÇÕES

| Versão | Data | Status | Alteração | Responsável |
|---|---|---|---|---|
| 1.0 | 26/07/2026 | Vigente a partir do lançamento público | Criação integral da Política da Comunidade | TradeSports — Jurídico e Compliance |
`,
    [],
  );

  useEffect(() => {
    const body = bodyRef.current;
    if (!exigirLeitura || !body) return;
    body.scrollTop = 0;
    setScrollNoFim(body.scrollHeight <= body.clientHeight + 10);
  }, [exigirLeitura]);

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Política da Comunidade (TradeSports)</ModalTitle>
          <Fechar type="button" onClick={onClose} aria-label="Fechar">
            ✕
          </Fechar>
        </ModalHeader>

        <ModalBody
          ref={bodyRef}
          onScroll={(e) => {
            if (!exigirLeitura) return;
            const el = e.currentTarget;
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
              setScrollNoFim(true);
            }
          }}
        >
          <TextoPre>{texto}</TextoPre>
        </ModalBody>

        <ModalFooter>
          <BotaoSec type="button" onClick={onClose}>
            Fechar
          </BotaoSec>
          <BotaoPrim
            type="button"
            disabled={exigirLeitura && !scrollNoFim}
            onClick={async () => {
              if (onAceitar) await onAceitar();
              else onClose();
            }}
          >
            {textoBotao}
          </BotaoPrim>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
}
