import React, { useMemo } from 'react';
import styled from 'styled-components';

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
  box-shadow: 0 12px 40px rgba(0,0,0,0.35);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.08);
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
  border-top: 1px solid rgba(0,0,0,0.08);
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
`;

const BotaoSec = styled.button`
  border: 1px solid rgba(0,0,0,0.2);
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 700;
  background: #fff;
  color: #111827;
`;

export default function PoliticaPrivacidadeModal({ onClose, onAceitar }) {
  const texto = useMemo(
    () =>
      `# POLÍTICA DE PRIVACIDADE DA TRADESPORTS

**Documento:** Política de Privacidade da Plataforma TradeSports  
**ID:** TS-JUR-PRI-001  
**Versão:** 1.0 — Minuta para validação jurídica  
**Status:** Em elaboração  
**Data da versão:** 23 de julho de 2026  
**Responsável pelo documento:** TradeSports — Jurídico e Compliance  
**Classificação:** Público após aprovação  

> **ATENÇÃO INTERNA — NÃO PUBLICAR SEM REVISÃO:** esta minuta deve ser validada por profissional jurídico especializado em proteção de dados e direito digital. Antes da publicação, devem ser preenchidos os campos entre colchetes, confirmados os fornecedores efetivamente utilizados, definidos os prazos internos de retenção e concluído o inventário das operações de tratamento.

## QUADRO-RESUMO

Este quadro facilita a leitura, mas não substitui o conteúdo integral da Política.

| Tema | Informação essencial |
|---|---|
| Controladora | **[RAZÃO SOCIAL]**, CNPJ **[CNPJ]**, com sede em **[ENDEREÇO COMPLETO]** (“TradeSports”) |
| Aplicação | Sites, aplicativos, APIs, atendimento, campanhas e demais serviços da TradeSports |
| Público | Pessoas com 18 anos ou mais, conforme os Termos de Uso |
| Dados principais | Cadastro, contato, autenticação, operações, pagamentos, segurança, dispositivo, atendimento e, quando disponível, atividade social |
| Finalidades principais | Criar e proteger a conta, executar o contrato, processar operações, prevenir fraudes, atender obrigações legais e melhorar os serviços |
| Compartilhamento | Prestadores necessários à operação, autoridades competentes e terceiros autorizados pelo titular, nos limites desta Política |
| Direitos | Confirmação, acesso, correção, informação, portabilidade quando regulamentada e aplicável, oposição, revisão, eliminação nas hipóteses legais e demais direitos da LGPD |
| Canal de privacidade | **[E-MAIL OU PORTAL DE PRIVACIDADE]** |
| Encarregado | **[NOME OU IDENTIFICAÇÃO DO ENCARREGADO]**, contato **[CONTATO DO ENCARREGADO]** |

## 1. OBJETIVO E ABRANGÊNCIA

1.1. Esta Política explica como a TradeSports coleta, utiliza, compartilha, armazena, protege e elimina dados pessoais relacionados à Plataforma e aos seus serviços.

1.2. A Política aplica-se a usuários cadastrados, visitantes, interessados, participantes de campanhas, pessoas que entram em contato com a TradeSports e representantes de fornecedores ou parceiros.

1.3. O tratamento também é regido pela Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais (“LGPD”), pelo Marco Civil da Internet, por normas setoriais aplicáveis e pelos Termos de Uso da TradeSports.

1.4. Regras adicionais poderão ser apresentadas em avisos específicos no momento da coleta. Se houver conflito, o aviso específico prevalecerá para aquela operação, sem reduzir direitos previstos em lei.

## 2. QUEM CONTROLA OS DADOS

2.1. A controladora dos dados pessoais é **[RAZÃO SOCIAL]**, inscrita no CNPJ sob o nº **[CNPJ]**, com sede em **[ENDEREÇO COMPLETO]**, responsável pelas decisões sobre o tratamento realizado no contexto da TradeSports.

2.2. O encarregado pelo tratamento de dados pessoais poderá ser contatado em **[CONTATO DO ENCARREGADO]**. Enquanto não houver indicação nominal obrigatória ou definitiva, o canal institucional de privacidade será **[E-MAIL OU PORTAL DE PRIVACIDADE]**.

2.3. Alguns fornecedores poderão atuar como operadores, tratando dados segundo instruções da TradeSports. Outros poderão atuar como controladores independentes quando definirem suas próprias finalidades e obrigações, como determinadas instituições financeiras, autoridades ou serviços contratados diretamente pelo usuário.

## 3. DEFINIÇÕES

Para esta Política:

- **Dado pessoal:** informação relacionada a pessoa natural identificada ou identificável.
- **Dado pessoal sensível:** dado sobre origem racial ou étnica, convicção religiosa, opinião política, filiação sindical ou a organização religiosa, filosófica ou política, saúde, vida sexual, dado genético ou biométrico vinculado a pessoa natural.
- **Tratamento:** qualquer operação realizada com dados pessoais, como coleta, uso, acesso, armazenamento, compartilhamento, análise, alteração ou eliminação.
- **Titular:** pessoa natural a quem os dados se referem.
- **Controlador:** quem decide as finalidades e os elementos essenciais do tratamento.
- **Operador:** quem trata dados em nome do controlador.
- **Plataforma:** sites, aplicativos, APIs, funcionalidades, conteúdos e serviços da TradeSports.

## 4. DADOS QUE PODEMOS TRATAR

### 4.1. Dados fornecidos pelo titular

Podemos coletar:

a) nome e sobrenome;  
b) nome de usuário;  
c) e-mail e telefone;  
d) data de nascimento, gênero informado e CPF;  
e) senha, armazenada por meio de representação criptográfica segura, e dados de autenticação;  
f) endereço e demais informações cadastrais, quando necessários;  
g) dados e documentos encaminhados ao atendimento;  
h) preferências, respostas a pesquisas e comunicações; e  
i) registros de aceite, inclusive versão dos Termos de Uso, da Política de Privacidade e de outros documentos aplicáveis.

### 4.2. Dados de identificação e prevenção a fraudes

Conforme o risco, a funcionalidade utilizada e as obrigações aplicáveis, a TradeSports ou um fornecedor especializado poderá solicitar:

a) documento oficial e informações nele contidas;  
b) imagem do rosto, selfie, prova de vida ou comparação biométrica;  
c) comprovante de endereço;  
d) comprovação de titularidade de conta de pagamento;  
e) informações sobre origem ou destino de recursos; e  
f) evidências necessárias à análise de fraude, contestação ou segurança.

Dados biométricos somente serão tratados quando necessários, mediante base legal adequada, transparência específica e controles compatíveis com sua natureza sensível. A TradeSports não realizará essa coleta se a funcionalidade não estiver implementada.

### 4.3. Dados financeiros e operacionais

Podemos tratar:

a) depósitos, saques, estornos, bloqueios e saldos;  
b) identificadores de transação e dados necessários de conta ou meio de pagamento;  
c) ordens, execuções, cancelamentos, posições, clubes, preços, quantidades e taxas;  
d) benefícios contratuais denominados “dividendos”, liquidações e ajustes;  
e) plano contratado, limites aplicáveis e consumo do limite semanal; e  
f) comprovantes, conciliações e histórico financeiro.

A TradeSports não deve armazenar senha bancária nem código de segurança completo de cartão. Dados de pagamento poderão ser coletados diretamente pelo prestador responsável, de acordo com seu próprio aviso de privacidade.

### 4.4. Dados técnicos, de uso e segurança

Podemos coletar automaticamente:

a) endereço IP, data, hora e duração do acesso;  
b) navegador, sistema operacional, tipo e identificadores do dispositivo;  
c) idioma, fuso horário e localização aproximada derivada do IP;  
d) páginas, telas, botões e funcionalidades utilizados;  
e) cookies, identificadores de sessão e tecnologias semelhantes;  
f) falhas, desempenho, origem do acesso e eventos de segurança; e  
g) tentativas de login, alterações de credenciais e padrões de uso potencialmente anômalos.

### 4.5. Dados de comunicação e atendimento

Podemos tratar mensagens, anexos, protocolos, avaliações, registros de chamadas quando previamente informadas e demais interações realizadas por e-mail, formulário, chat, telefone ou canais oficiais.

### 4.6. Dados de perfil e funcionalidades sociais

Quando a camada social for disponibilizada, poderemos tratar nome de usuário, fotografia, biografia, seguidores, pessoas seguidas, publicações, comentários, reações, denúncias, preferências e histórico de moderação.

O usuário será informado sobre quais elementos são públicos antes da publicação. Conteúdos públicos poderão ser vistos, copiados ou compartilhados por terceiros, inclusive fora da Plataforma. Não se deve publicar CPF, endereço, dados bancários, documentos, credenciais ou dados sensíveis próprios ou de terceiros.

### 4.7. Dados obtidos de terceiros

Podemos receber dados de:

a) instituições e prestadores de pagamento;  
b) fornecedores de identidade, antifraude, segurança e atendimento;  
c) provedores de autenticação, e-mail, hospedagem e análise;  
d) fontes públicas e autoridades competentes; e  
e) terceiros autorizados pelo titular.

Quando cabível, informaremos a origem e as categorias de dados mediante solicitação.

## 5. FINALIDADES E BASES LEGAIS

A base legal depende da finalidade e do contexto. As principais operações estão resumidas abaixo:

| Finalidade | Exemplos de dados | Base legal principal |
|---|---|---|
| Criar, autenticar e administrar a conta | Cadastro, contato, senha protegida, aceite e sessão | Execução de contrato e procedimentos preliminares |
| Confirmar e recuperar o acesso | E-mail, usuário, tokens e eventos de segurança | Execução de contrato e legítimo interesse |
| Executar ordens, pagamentos, saques, taxas, benefícios e liquidações | Dados operacionais, financeiros e de titularidade | Execução de contrato |
| Cumprir obrigações legais, regulatórias, fiscais, contábeis e ordens de autoridades | Cadastro, operações, documentos e registros | Cumprimento de obrigação legal ou regulatória |
| Prevenir fraude, abuso, manipulação, incidentes e acessos indevidos | IP, dispositivo, comportamento, identidade e operações | Legítimo interesse, proteção do crédito, exercício regular de direitos e, quando aplicável, obrigação legal |
| Atender solicitações, reclamações e disputas | Contato, mensagens, conta e operações | Execução de contrato, cumprimento legal e exercício regular de direitos |
| Exercer ou defender direitos em processos | Dados relacionados ao caso | Exercício regular de direitos |
| Manter e melhorar a Plataforma | Telemetria, falhas e uso agregado | Legítimo interesse, respeitados os direitos e as expectativas do titular |
| Enviar comunicações operacionais | E-mail, telefone e eventos da conta | Execução de contrato e legítimo interesse |
| Enviar marketing não essencial | Contato e preferências | Consentimento, quando exigido, ou legítimo interesse após avaliação aplicável |
| Personalizar cookies não essenciais e determinadas análises | Identificadores e navegação | Consentimento, quando aplicável |
| Operar perfis e recursos sociais | Perfil, conteúdo e interações | Execução de contrato; consentimento quando especificamente exigido |

5.1. Quando utilizarmos legítimo interesse, avaliaremos finalidade legítima, necessidade, expectativas razoáveis, impactos e salvaguardas. O titular poderá apresentar oposição pelos canais indicados nesta Política.

5.2. Quando o tratamento depender de consentimento, ele será solicitado de forma livre, informada e inequívoca e poderá ser revogado a qualquer momento. A revogação não afeta tratamentos realizados anteriormente nem aqueles amparados por outra base legal.

5.3. A TradeSports não condicionará o serviço ao consentimento para finalidade desnecessária à sua execução.

## 6. COMUNICAÇÕES

6.1. Comunicações operacionais e de segurança, como confirmação de e-mail, redefinição de senha, comprovantes, alertas de acesso e alterações relevantes, são necessárias à conta e não constituem publicidade.

6.2. Comunicações promocionais poderão ser recusadas pelo link de descadastramento ou pelo canal informado. A alteração de preferência poderá levar prazo razoável para ser processada.

6.3. Mesmo após o descadastramento de marketing, a TradeSports poderá enviar mensagens necessárias à execução do contrato, à segurança ou ao cumprimento legal.

## 7. COOKIES E TECNOLOGIAS SEMELHANTES

7.1. Cookies estritamente necessários poderão ser utilizados para autenticação, segurança, prevenção a fraude, balanceamento, preferências essenciais e funcionamento da Plataforma.

7.2. Cookies de desempenho, análise, personalização ou publicidade serão utilizados de acordo com as escolhas apresentadas no gerenciador de consentimento, quando exigido.

7.3. O usuário poderá alterar preferências no mecanismo disponibilizado ou no navegador. A desativação de cookies necessários poderá impedir o funcionamento de partes da Plataforma.

7.4. Antes do lançamento, a TradeSports deverá publicar Aviso de Cookies com a lista atual de tecnologias, fornecedores, finalidades e durações efetivamente utilizadas.

## 8. COMPARTILHAMENTO DE DADOS

Podemos compartilhar dados, sempre dentro do necessário, com:

a) fornecedores de nuvem, banco de dados, hospedagem e monitoramento;  
b) prestadores de e-mail, comunicação e atendimento;  
c) instituições e prestadores de pagamento, conciliação e saque;  
d) fornecedores de verificação de identidade, biometria, antifraude e segurança, quando contratados;  
e) prestadores profissionais de auditoria, contabilidade, tecnologia e assessoria jurídica;  
f) autoridades administrativas, judiciais, policiais ou regulatórias, quando houver obrigação, ordem válida ou fundamento jurídico;  
g) partes de operação societária, reorganização, investimento, aquisição ou transferência de ativos, sujeitas a confidencialidade e continuidade da proteção; e  
h) terceiros indicados ou autorizados pelo titular.

8.1. A TradeSports não vende dados pessoais.

8.2. Fornecedores são selecionados e contratados com exigências proporcionais de confidencialidade, segurança, finalidade e proteção de dados.

8.3. A lista ou as categorias atualizadas dos principais fornecedores poderão ser solicitadas pelo canal de privacidade, resguardados segredos comerciais e informações de segurança.

## 9. TRANSFERÊNCIAS INTERNACIONAIS

9.1. Alguns fornecedores de infraestrutura, comunicação, análise ou segurança poderão armazenar ou acessar dados fora do Brasil.

9.2. Nessas hipóteses, a TradeSports adotará mecanismo válido previsto na LGPD e na regulamentação da Autoridade Nacional de Proteção de Dados (“ANPD”), como decisão de adequação, cláusulas-padrão contratuais, normas corporativas globais ou outra hipótese legal aplicável.

9.3. Informações sobre países, fornecedores relevantes e mecanismos utilizados poderão ser solicitadas pelo canal de privacidade, observadas limitações legítimas de segurança e segredo comercial.

## 10. DECISÕES AUTOMATIZADAS E ANTIFRAUDE

10.1. Sistemas automatizados poderão apoiar a detecção de acesso anômalo, fraude, abuso, contas relacionadas, manipulação de mercado, risco de pagamento e outras violações.

10.2. Essas análises poderão considerar dados cadastrais, dispositivo, IP, histórico de acesso, padrões operacionais, titularidade e inconsistências, sem utilizar critérios discriminatórios ilícitos.

10.3. Uma análise poderá resultar em solicitação de verificação adicional, limitação preventiva, retenção para conferência ou encaminhamento à revisão humana. Medidas serão proporcionais ao risco e não permanecerão além do necessário.

10.4. Quando houver decisão tomada unicamente com base em tratamento automatizado que afete os interesses do titular, ele poderá solicitar revisão e informações claras sobre os critérios e procedimentos utilizados, observados os segredos comercial e industrial.

## 11. DADOS PÚBLICOS E CONTEÚDO DE TERCEIROS

11.1. Elementos indicados como públicos no perfil ou na comunidade poderão ser acessíveis a outros usuários e mecanismos externos, conforme a configuração da funcionalidade.

11.2. O usuário somente poderá publicar dados de terceiros se possuir autorização ou outra base legal adequada.

11.3. Denúncias de exposição indevida, fraude, assédio ou violação de privacidade poderão ser enviadas a **[CANAL DE MODERAÇÃO/PRIVACIDADE]**.

11.4. A remoção de conteúdo da exibição pública não implica eliminação imediata de todas as cópias, que poderão ser mantidas quando necessárias à segurança, auditoria, exercício de direitos ou obrigação legal.

## 12. PRAZOS DE RETENÇÃO

12.1. Os dados serão mantidos pelo tempo necessário à finalidade informada, ao cumprimento de obrigações e ao exercício de direitos.

12.2. Antes da publicação, a TradeSports deverá validar a seguinte matriz mínima:

| Categoria | Critério de retenção |
|---|---|
| Conta e cadastro | Durante a relação e, após o encerramento, pelo prazo necessário a obrigações e defesa de direitos |
| Aceites e versões jurídicas | Pelo prazo de vigência da relação e dos prazos prescricionais aplicáveis |
| Ordens, execuções, saldos e registros financeiros | Pelos prazos legais, contábeis, fiscais, regulatórios e de defesa aplicáveis |
| Logs de acesso a aplicações | Pelo prazo mínimo legal aplicável ao provedor, atualmente 6 meses para registros de acesso a aplicações de internet, sem prejuízo de guarda superior com fundamento válido |
| Segurança e antifraude | Enquanto necessários à prevenção, investigação, auditoria e defesa, segundo o risco e a proporcionalidade |
| Atendimento e reclamações | Durante o atendimento e pelos prazos necessários a auditoria e exercício de direitos |
| Marketing | Até revogação, oposição, descadastramento ou término da finalidade, conforme a base legal |
| Conteúdo social | Enquanto publicado ou necessário às finalidades legítimas posteriores previstas nesta Política |
| Cópias de segurança | Até a rotação segura dos backups, com acesso restrito e sem retorno ao uso comum |

12.3. Encerrada a finalidade e inexistindo fundamento para retenção, os dados serão eliminados ou anonimizados de forma segura.

12.4. A exclusão da conta não apaga automaticamente registros que a TradeSports deva ou possa conservar para cumprimento legal, prevenção a fraude, auditoria ou exercício regular de direitos.

## 13. SEGURANÇA

13.1. A TradeSports adotará medidas técnicas e administrativas proporcionais ao risco, que poderão incluir controle de acesso, segregação de privilégios, proteção criptográfica, registro de eventos, testes, backups, gestão de vulnerabilidades e resposta a incidentes.

13.2. Senhas devem ser protegidas por mecanismo criptográfico de derivação e não armazenadas em texto legível.

13.3. Nenhum sistema é absolutamente seguro. O usuário deve manter senha exclusiva, proteger seus dispositivos, desconfiar de mensagens não solicitadas e comunicar imediatamente atividade não reconhecida.

13.4. Vulnerabilidades devem ser comunicadas de forma responsável a **[E-MAIL DE SEGURANÇA]**, sem exploração, acesso indevido ou divulgação que aumente o risco.

## 14. INCIDENTES DE SEGURANÇA

14.1. A TradeSports manterá procedimento de resposta, avaliação, contenção, registro e correção de incidentes envolvendo dados pessoais.

14.2. Quando um incidente puder acarretar risco ou dano relevante, a TradeSports comunicará a ANPD e os titulares afetados nos prazos e nas condições da regulamentação vigente, incluindo as informações exigidas e as medidas de mitigação aplicáveis.

14.3. A comunicação poderá ser atualizada à medida que informações tecnicamente confirmadas se tornem disponíveis.

## 15. DIREITOS DO TITULAR

Nos termos da LGPD, o titular poderá solicitar, quando aplicável:

a) confirmação da existência de tratamento;  
b) acesso aos dados;  
c) correção de dados incompletos, inexatos ou desatualizados;  
d) anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade;  
e) portabilidade, observada a regulamentação, os segredos comercial e industrial e a viabilidade aplicável;  
f) eliminação dos dados tratados com consentimento, ressalvadas as hipóteses legais de conservação;  
g) informação sobre compartilhamentos;  
h) informação sobre a possibilidade de negar consentimento e suas consequências;  
i) revogação do consentimento;  
j) oposição a tratamento realizado com fundamento em hipótese de dispensa de consentimento, em caso de descumprimento da LGPD;  
k) revisão de decisões tomadas unicamente com base em tratamento automatizado que afetem seus interesses; e  
l) petição perante a ANPD e órgãos de defesa do consumidor.

15.1. Solicitações poderão ser realizadas por **[E-MAIL OU PORTAL DE PRIVACIDADE]**.

15.2. Para proteger o titular, poderemos solicitar confirmação razoável de identidade. Não serão exigidos dados desproporcionais.

15.3. A TradeSports responderá nos prazos legais. Pedidos poderão ser limitados ou recusados quando houver fundamento jurídico, como proteção de terceiros, segredo comercial, impossibilidade de autenticação, obrigação de conservação ou exercício regular de direitos. A justificativa será informada quando cabível.

15.4. Alguns dados cadastrais poderão ser corrigidos diretamente na conta. Alterações de CPF, titularidade ou informações críticas estarão sujeitas a verificação.

## 16. ENCERRAMENTO DE CONTA E ELIMINAÇÃO

16.1. O titular poderá solicitar o encerramento pelos meios disponíveis, desde que sejam resolvidos saldo, ordens, posições, disputas e obrigações pendentes.

16.2. O encerramento impede novos usos ordinários, mas não elimina registros que precisem ser mantidos com fundamento jurídico.

16.3. Dados retidos após o encerramento terão acesso limitado às finalidades que justificam sua conservação.

## 17. CRIANÇAS E ADOLESCENTES

17.1. A Plataforma transacional é destinada exclusivamente a pessoas com 18 anos ou mais. A TradeSports não autoriza o cadastro de crianças ou adolescentes.

17.2. Se identificarmos conta de menor ou coleta incompatível, poderemos bloquear o acesso, solicitar comprovação e eliminar os dados quando não houver fundamento para conservação.

17.3. Responsáveis que suspeitem de uso indevido poderão entrar em contato pelo canal de privacidade.

## 18. ALTERAÇÕES DESTA POLÍTICA

18.1. Esta Política poderá ser atualizada para refletir mudanças legais, regulatórias, tecnológicas ou operacionais.

18.2. A nova versão indicará data e número de versão. Alterações relevantes serão comunicadas com destaque razoável antes de produzirem efeitos, quando exigido.

18.3. Se uma nova finalidade depender de consentimento, ele será solicitado separadamente. A continuidade do uso não será tratada como consentimento quando a lei exigir manifestação específica.

18.4. A TradeSports manterá histórico das versões e evidências dos aceites aplicáveis.

## 19. CANAIS E RECLAMAÇÕES

19.1. Dúvidas, solicitações ou reclamações sobre privacidade podem ser enviadas a:

**Controladora:** [RAZÃO SOCIAL]  
**CNPJ:** [CNPJ]  
**Endereço:** [ENDEREÇO COMPLETO]  
**Canal de privacidade:** [E-MAIL OU PORTAL]  
**Encarregado:** [NOME OU IDENTIFICAÇÃO]  
**Contato do encarregado:** [CONTATO]  
**Atendimento geral:** [E-MAIL/CANAL E HORÁRIO]

19.2. O titular também poderá procurar a ANPD e os órgãos de defesa do consumidor, observados os procedimentos aplicáveis.

## 20. LEGISLAÇÃO E INTERPRETAÇÃO

20.1. Esta Política será interpretada conforme a legislação brasileira.

20.2. Nada nesta Política limita direitos assegurados pela LGPD, pelo Código de Defesa do Consumidor ou por outras normas obrigatórias.

20.3. Se alguma disposição for considerada inválida, as demais permanecerão aplicáveis na máxima extensão permitida.

## 21. VIGÊNCIA

**Versão:** 1.0  
**Publicação:** [DATA DE PUBLICAÇÃO]  
**Entrada em vigor:** [DATA DE ENTRADA EM VIGOR]

---

# ANEXO I — CONTROLES OBRIGATÓRIOS ANTES DA PUBLICAÇÃO

Este anexo é interno e deve ser removido da versão pública.

1. Preencher razão social, CNPJ, sede e canais oficiais.
2. Nomear ou identificar o encarregado e publicar contato.
3. Concluir inventário de dados, sistemas, fornecedores, países e bases legais.
4. Confirmar quais dados o cadastro realmente coleta e remover categorias hipotéticas desnecessárias.
5. Confirmar se haverá biometria, prova de vida ou documentos; criar aviso específico se houver.
6. Validar matriz de retenção com jurídico, contabilidade, segurança e requisitos regulatórios.
7. Listar os fornecedores efetivos de hospedagem, banco de dados, e-mail, pagamento, antifraude, analytics e atendimento.
8. Formalizar contratos de operador e cláusulas de proteção de dados.
9. Mapear transferências internacionais e implementar os mecanismos da regulamentação da ANPD.
10. Publicar Aviso de Cookies e implementar gerenciador de consentimento para tecnologias não essenciais.
11. Implementar canal operacional para direitos dos titulares, com autenticação, protocolo e controle de prazo.
12. Implementar processo de revisão de decisões automatizadas e informar critérios em linguagem clara.
13. Aprovar plano de resposta a incidentes e fluxo de comunicação no prazo regulatório.
14. Revisar controles de acesso, criptografia, backups, logs, vulnerabilidades e fornecedores.
15. Garantir que a exclusão de conta respeite pendências e retenções justificadas.
16. Criar procedimento para dados de menores identificados indevidamente.
17. Separar aceite dos Termos de Uso do conhecimento desta Política; obter consentimentos específicos somente quando essa for a base legal.
18. Registrar a versão 1.0, data, hora e evidência de disponibilização ao usuário.
19. Conferir coerência com Termos de Uso, Aviso de Riscos, contratos de fornecedores e funcionamento real da Plataforma.
20. Submeter a versão final a validação jurídica antes do lançamento com dinheiro real.

# ANEXO II — ORIENTAÇÃO PARA O MODAL DO CADASTRO

1. O título visível deve ser **“Política de Privacidade — Versão 1.0”**.
2. O modal deve permitir leitura integral, abertura em página independente e download ou impressão.
3. A Política deve permanecer acessível antes e depois do cadastro.
4. A interface não deve afirmar que o tratamento inteiro depende de consentimento.
5. Se houver uma caixa de confirmação, o texto recomendado é:  
   **“Declaro que tive acesso e estou ciente da Política de Privacidade — versão 1.0.”**
6. Consentimentos opcionais, como marketing ou cookies não essenciais, devem possuir controles separados e desmarcados por padrão.
7. O backend deve registrar a versão disponibilizada e a data do evento, sem registrar aceites falsos para políticas que o usuário não visualizou.

# REFERÊNCIAS NORMATIVAS PRINCIPAIS

- Constituição Federal, art. 5º, incisos X, XII e LXXIX.
- Lei nº 8.078/1990 — Código de Defesa do Consumidor.
- Lei nº 12.965/2014 — Marco Civil da Internet.
- Decreto nº 8.771/2016.
- Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais.
- Regulamentos, guias e orientações vigentes da Autoridade Nacional de Proteção de Dados.
- Resolução CD/ANPD nº 15/2024 — Comunicação de Incidente de Segurança.
- Resolução CD/ANPD nº 18/2024, com alterações vigentes — Atuação do Encarregado.
- Resolução CD/ANPD nº 19/2024 — Transferência Internacional de Dados.
`,
    []
  );

  return (
    <Overlay onClick={async () => { if (onAceitar) await onAceitar(); onClose(); }}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Política de Privacidade (TradeSports)</ModalTitle>
          <Fechar type="button" onClick={async () => { if (onAceitar) await onAceitar(); onClose(); }} aria-label="Fechar">
            ✕
          </Fechar>
        </ModalHeader>

        <ModalBody>
          <TextoPre>{texto}</TextoPre>
        </ModalBody>

        <ModalFooter>
          <BotaoSec type="button" onClick={async () => { if (onAceitar) await onAceitar(); onClose(); }}>
            Fechar
          </BotaoSec>
          <BotaoPrim type="button" onClick={async () => { if (onAceitar) await onAceitar(); onClose(); }}>
            Entendi
          </BotaoPrim>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
}
