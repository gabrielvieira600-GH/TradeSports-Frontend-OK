import { useEffect, useMemo, useState } from "react";

export default function Footer() {
  const [modalAberto, setModalAberto] = useState(null); // "risco" | "privacidade" | "uso" | null

  const ANO_ATUAL = new Date().getFullYear();

  const serverTimeBR = useMemo(() => {
    try {
      return new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    } catch {
      return new Date().toLocaleString("pt-BR");
    }
  }, []);

  const POLITICA_RISCO_TEXTO = `POLÍTICA DE RISCO — TRADESPORTS

Última atualização: [DATA]

⸻

1. OBJETIVO

Esta Política de Risco tem como objetivo informar os usuários da TradeSports (“Plataforma”) sobre os principais riscos envolvidos na utilização do ambiente de negociação de cotas virtuais.

Ao utilizar a Plataforma, o usuário declara ciência e aceitação integral dos riscos descritos neste documento.

⸻

2. NATUREZA DA PLATAFORMA

A TradeSports é:

uma plataforma digital de negociação de cotas virtuais em ambiente próprio, cuja dinâmica econômica depende da interação entre usuários e de fatores externos, especialmente o desempenho esportivo real.

A Plataforma:
	•	não garante lucro ou rentabilidade;
	•	não presta consultoria financeira;
	•	não assegura liquidez;
	•	não controla o comportamento do mercado.

⸻

3. RISCO DE PERDA FINANCEIRA

O usuário reconhece que:
	•	poderá perder total ou parcialmente os valores utilizados;
	•	não há garantia de recuperação de capital;
	•	decisões de compra e venda são de responsabilidade exclusiva do usuário.

⸻

4. RISCO DE MERCADO

Os preços das cotas podem:
	•	variar significativamente em curtos períodos;
	•	sofrer oscilações abruptas;
	•	refletir comportamento coletivo e especulativo dos usuários.

⸻

5. RISCO DE LIQUIDEZ

O usuário poderá enfrentar situações em que:
	•	não haja compradores ou vendedores disponíveis;
	•	ordens não sejam executadas;
	•	seja necessário negociar a preços desfavoráveis;
	•	não seja possível sair de uma posição no momento desejado.

⸻

6. RISCO OPERACIONAL

A Plataforma pode estar sujeita a:
	•	indisponibilidade temporária;
	•	falhas técnicas;
	•	atrasos na execução de ordens;
	•	erros sistêmicos ou de integração com terceiros.

⸻

7. RISCO REGULATÓRIO E JURÍDICO

A TradeSports:

não se apresenta como banco, instituição financeira, corretora de valores mobiliários ou operadora de apostas de quota fixa;

No entanto:
	•	determinadas atividades relacionadas a pagamentos, verificação de identidade, prevenção a fraudes e movimentação de recursos podem depender de terceiros regulados;
	•	o ambiente regulatório pode evoluir ou ser interpretado de forma diversa por autoridades competentes;
	•	alterações legais ou regulatórias podem impactar a operação da Plataforma.

⸻

8. RISCO DE PARCEIROS E TERCEIROS

A operação depende de terceiros, incluindo:
	•	provedores de pagamento;
	•	APIs de dados esportivos;
	•	serviços de hospedagem e infraestrutura.

Eventuais falhas nesses serviços podem impactar:
	•	depósitos e saques;
	•	atualização de dados;
	•	funcionamento da Plataforma.

⸻

9. RISCO DE DEPÓSITOS E SAQUES

Operações financeiras podem estar sujeitas a:
	•	atrasos no processamento;
	•	bloqueios temporários;
	•	necessidade de verificação adicional;
	•	cancelamentos ou estornos, especialmente em meios como cartão de crédito.

⸻

10. RISCO DE CONTRAPARTE (PLATAFORMA)

A TradeSports poderá:
	•	suspender ou bloquear contas;
	•	reter valores temporariamente;
	•	revisar ou cancelar operações;

em casos de:
	•	suspeita de fraude;
	•	exigência legal;
	•	necessidade operacional.

⸻

11. RISCO DE ABUSO DE MERCADO

A Plataforma pode ser impactada por comportamentos como:
	•	manipulação de preços;
	•	operações artificiais;
	•	uso de múltiplas contas;
	•	estratégias abusivas de negociação.

Embora existam mecanismos de controle, tais práticas podem afetar:
	•	preços;
	•	liquidez;
	•	estabilidade do mercado.

⸻

12. RISCO DE CONCENTRAÇÃO

O mercado pode apresentar:
	•	baixa diversificação de participantes;
	•	concentração de cotas em poucos usuários;
	•	influência desproporcional de determinados agentes.

⸻

13. RISCO RELACIONADO AO DESEMPENHO ESPORTIVO

Os preços das cotas são influenciados por:
	•	resultados de partidas;
	•	classificação dos clubes;
	•	eventos esportivos imprevistos.

Fatores externos podem impactar significativamente o valor das cotas.

⸻

14. RISCO DE INTERRUPÇÃO DE SERVIÇO

Eventos extraordinários podem afetar a operação, incluindo:
	•	falhas técnicas;
	•	indisponibilidade de serviços externos;
	•	eventos de força maior;
	•	mudanças estruturais no campeonato.

⸻

15. RISCO DE SEGURANÇA DA CONTA

O usuário é responsável por:
	•	manter suas credenciais seguras;
	•	não compartilhar acesso;
	•	adotar medidas de proteção.

A TradeSports não se responsabiliza por acessos indevidos decorrentes de negligência do usuário.

⸻

16. RISCO DE DECISÃO DO USUÁRIO

O usuário reconhece que:
	•	todas as decisões são de sua responsabilidade;
	•	não há orientação personalizada;
	•	a Plataforma não garante adequação das operações ao seu perfil.

⸻

17. AUSÊNCIA DE GARANTIAS

A TradeSports não garante:
	•	lucro;
	•	liquidez;
	•	estabilidade de preços;
	•	continuidade ininterrupta da operação.

⸻

18. ATUALIZAÇÕES DA POLÍTICA

Esta Política poderá ser atualizada a qualquer momento.

O uso contínuo da Plataforma implica aceitação das alterações.

⸻

19. CONTATO

Dúvidas sobre esta Política:

📧 [email@tradesports.com]`;

  const POLITICA_PRIVACIDADE_TEXTO = `POLÍTICA DE PRIVACIDADE — TRADESPORTS

Última atualização: [DATA]

⸻

1. INTRODUÇÃO

A presente Política de Privacidade descreve como a TradeSports coleta, utiliza, compartilha e protege os dados pessoais dos usuários da Plataforma.

Ao utilizar a Plataforma, o usuário declara ciência e concordância com esta Política.

⸻

2. CONTROLADOR DOS DADOS

O controlador dos dados pessoais é:

[RAZÃO SOCIAL DA EMPRESA]
CNPJ: [CNPJ]
Endereço: [ENDEREÇO COMPLETO]
E-mail de contato: [email@tradesports.com]

⸻

3. ENCARREGADO DE DADOS (DPO)

Para questões relacionadas à proteção de dados:

📧 [privacidade@tradesports.com]

⸻

4. DADOS COLETADOS

A TradeSports poderá coletar:

4.1 Dados cadastrais
	•	nome completo
	•	CPF
	•	data de nascimento
	•	e-mail
	•	telefone

⸻

4.2 Dados de identificação
	•	documentos (quando exigido)
	•	selfie / verificação

⸻

4.3 Dados financeiros
	•	histórico de depósitos e saques
	•	saldo
	•	operações realizadas

⸻

4.4 Dados de uso
	•	interações na plataforma
	•	ordens e negociações
	•	comportamento de navegação

⸻

4.5 Dados técnicos
	•	IP
	•	dispositivo
	•	navegador
	•	logs

⸻

5. FINALIDADES DO TRATAMENTO

Os dados são utilizados para:
	•	criação e gestão da conta
	•	execução das operações
	•	prevenção a fraudes
	•	cumprimento de obrigações legais
	•	comunicação com o usuário
	•	melhoria da plataforma

⸻

6. BASES LEGAIS

A TradeSports trata dados com base em:
	•	execução de contrato
	•	cumprimento de obrigação legal
	•	legítimo interesse
	•	consentimento (quando aplicável)

⸻

6.1 Detalhamento por finalidade
	•	Cadastro: execução de contrato
	•	Transações: execução de contrato
	•	Antifraude: legítimo interesse
	•	Compliance: obrigação legal
	•	Marketing: consentimento

⸻

7. COMPARTILHAMENTO DE DADOS

Os dados poderão ser compartilhados com:
	•	parceiros de pagamento
	•	provedores de tecnologia
	•	serviços de antifraude
	•	autoridades legais (quando exigido)

⸻

8. TRANSFERÊNCIA INTERNACIONAL

Os dados poderão ser processados fora do Brasil, incluindo:
	•	serviços de hospedagem
	•	ferramentas de análise
	•	provedores de segurança

A TradeSports adota medidas para garantir proteção adequada.

⸻

9. COOKIES E TECNOLOGIAS

A Plataforma utiliza cookies para:
	•	funcionamento essencial
	•	análise de uso
	•	melhoria da experiência

Tipos de cookies:
	•	essenciais
	•	analíticos
	•	funcionais

O usuário pode gerenciar cookies no navegador.

⸻

10. RETENÇÃO DE DADOS

Os dados são armazenados:
	•	enquanto a conta estiver ativa
	•	pelo período necessário para cumprimento legal
	•	para prevenção de fraudes

Exemplos:
	•	dados cadastrais: até encerramento + prazo legal
	•	transações: conforme exigências regulatórias
	•	logs: conforme necessidade operacional

⸻

11. DIREITOS DO TITULAR

Nos termos da LGPD, o usuário pode:
	•	confirmar tratamento
	•	acessar dados
	•	corrigir dados
	•	solicitar exclusão
	•	solicitar portabilidade
	•	revogar consentimento

Solicitações:

📧 [privacidade@tradesports.com]

⸻

12. SEGURANÇA

A TradeSports adota medidas como:
	•	criptografia
	•	controle de acesso
	•	monitoramento
	•	proteção contra acessos não autorizados

⸻

13. DECISÕES AUTOMATIZADAS E ANTIFRAUDE

A Plataforma poderá utilizar:
	•	sistemas automatizados
	•	análise de comportamento
	•	detecção de risco

Esses sistemas podem:
	•	bloquear operações
	•	limitar contas
	•	exigir verificação adicional

⸻

14. MENORES DE IDADE

A Plataforma é destinada apenas a maiores de 18 anos.

Contas identificadas como pertencentes a menores:
	•	poderão ser bloqueadas
	•	poderão ser encerradas

⸻

15. ALTERAÇÕES DA POLÍTICA

Esta Política poderá ser atualizada a qualquer momento.

A versão vigente será publicada na Plataforma.

⸻

16. CONTATO

📧 [email@tradesports.com]
📧 [privacidade@tradesports.com]`;

  // Coloque aqui o texto real dos termos (ou importe de onde você mantém hoje)
  const TERMOS_USO = `TERMOS DE USO — TRADESPORTS

Última atualização: [DATA]

⸻

1. ACEITAÇÃO DOS TERMOS

Ao acessar e utilizar a plataforma TradeSports (“Plataforma”), o usuário declara ter lido, compreendido e aceitado integralmente estes Termos de Uso, bem como a Política de Privacidade e a Política de Risco.

Caso não concorde com qualquer disposição, o usuário não deverá utilizar a Plataforma.

⸻

2. DEFINIÇÕES

Para fins destes Termos:
	•	Plataforma: sistema digital operado pela TradeSports que permite a negociação de cotas virtuais entre usuários.
	•	Usuário: pessoa física cadastrada na Plataforma.
	•	Cotas Virtuais: unidades digitais representativas de ativos simulados vinculados ao desempenho esportivo de clubes.
	•	Saldo: registro contábil interno representando os valores disponíveis do usuário na Plataforma.
	•	Ordem: instrução de compra ou venda de cotas virtuais.
	•	Mercado: ambiente de negociação entre usuários baseado em oferta e demanda.

⸻

3. NATUREZA DA PLATAFORMA

A TradeSports é:

uma plataforma digital de negociação de cotas virtuais em ambiente próprio, com dinâmica econômica interna baseada na interação entre usuários, podendo integrar terceiros para determinadas etapas operacionais e financeiras.

A TradeSports:
	•	não se apresenta como banco, instituição financeira, corretora de valores mobiliários ou operadora de apostas de quota fixa;
	•	não garante rentabilidade, lucro ou valorização;
	•	não administra investimentos ou presta consultoria financeira.

⸻

4. NATUREZA DAS COTAS VIRTUAIS

As cotas virtuais:
	•	não representam participação societária;
	•	não constituem valores mobiliários;
	•	não representam crédito contra clubes;
	•	não conferem direitos esportivos, econômicos ou federativos;
	•	não são ativos financeiros regulados.

Tratam-se exclusivamente de:

ativos digitais simulados para fins de negociação dentro da Plataforma.

⸻

5. CADASTRO E CONTA

O usuário declara que:
	•	possui capacidade civil plena;
	•	fornece informações verdadeiras e atualizadas;
	•	é titular dos meios de pagamento utilizados.

A TradeSports poderá:
	•	solicitar verificação de identidade (KYC);
	•	suspender ou encerrar contas em caso de irregularidade;
	•	recusar cadastro sem obrigação de justificativa.

⸻

6. FUNCIONAMENTO DO MERCADO

A negociação ocorre exclusivamente entre usuários.

6.1 Formação de preço

Os preços das cotas:
	•	são definidos por oferta e demanda;
	•	podem sofrer alta volatilidade;
	•	podem apresentar baixa liquidez;
	•	podem não refletir qualquer valor econômico real.

⸻

6.2 Ordens
	•	ordens podem ser executadas total ou parcialmente;
	•	ordens podem permanecer abertas sem execução;
	•	cancelamentos podem estar sujeitos a regras operacionais e antifraude.

⸻

7. TAXAS

A TradeSports poderá cobrar:
	•	taxa de negociação (maker/taker);
	•	taxa de saque;
	•	outras taxas operacionais previamente informadas.

⸻

8. DEPÓSITOS E SAQUES

8.1 Depósitos
	•	realizados por meios de pagamento integrados;
	•	podem depender de parceiros terceiros;
	•	estão sujeitos a validação e aprovação.

⸻

8.2 Saques
	•	somente para contas de mesma titularidade;
	•	sujeitos a análise de segurança e antifraude;
	•	podem sofrer retenção temporária em caso de suspeita;
	•	prazos podem variar conforme o meio de pagamento.

⸻

8.3 Restrições

A TradeSports poderá:
	•	recusar depósitos ou saques;
	•	bloquear valores temporariamente;
	•	solicitar documentação adicional.

⸻

9. RISCOS

O usuário declara ciência de que:
	•	pode perder integralmente os valores utilizados;
	•	não há garantia de liquidez;
	•	o mercado pode ser volátil;
	•	eventos esportivos influenciam preços;
	•	falhas técnicas podem ocorrer.

⸻

10. NÃO RECOMENDAÇÃO (NO SUITABILITY)

A TradeSports:
	•	não presta consultoria;
	•	não realiza recomendações;
	•	não avalia perfil de risco do usuário;
	•	não garante adequação das operações.

O usuário é o único responsável por suas decisões.

⸻

11. CONDUTAS PROIBIDAS

É vedado ao usuário:
	•	fraudar ou manipular o mercado;
	•	utilizar contas de terceiros;
	•	explorar falhas do sistema;
	•	praticar lavagem de dinheiro;
	•	realizar auto-negociação (self-trade);
	•	manipular preços artificialmente.

⸻

12. MONITORAMENTO E COMPLIANCE

A TradeSports poderá:
	•	monitorar atividades;
	•	bloquear contas preventivamente;
	•	cancelar operações suspeitas;
	•	reportar atividades a autoridades competentes.

⸻

13. SUSPENSÃO E ENCERRAMENTO

A conta poderá ser:
	•	suspensa;
	•	limitada;
	•	encerrada;

em caso de:
	•	violação destes Termos;
	•	suspeita de fraude;
	•	exigência legal ou regulatória.

⸻

14. LIMITAÇÃO DE RESPONSABILIDADE

A TradeSports não se responsabiliza por:
	•	perdas financeiras do usuário;
	•	decisões de negociação;
	•	falta de liquidez;
	•	oscilações de preço;
	•	indisponibilidade temporária;
	•	falhas de terceiros (pagamentos, APIs, etc.).

A responsabilidade da TradeSports é limitada ao funcionamento da Plataforma conforme estes Termos.

⸻

15. PROPRIEDADE INTELECTUAL

Todos os elementos da Plataforma são de propriedade da TradeSports, incluindo:
	•	marca;
	•	software;
	•	layout;
	•	funcionalidades.

É proibida reprodução sem autorização.

⸻

16. COMUNICAÇÃO

As comunicações oficiais serão realizadas por:
	•	e-mail cadastrado;
	•	notificações na Plataforma.

O usuário é responsável por manter seus dados atualizados.

⸻

17. ALTERAÇÕES DOS TERMOS

A TradeSports poderá alterar estes Termos a qualquer momento.

As alterações entrarão em vigor na data de publicação.

O uso contínuo da Plataforma implica aceitação.

⸻

18. LEGISLAÇÃO E FORO

Estes Termos são regidos pelas leis da República Federativa do Brasil.

Fica eleito o foro da comarca de [CIDADE/UF], com renúncia a qualquer outro.`;

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
        <Modal
          titulo="Política de Privacidade (TradeSports)"
          texto={POLITICA_PRIVACIDADE_TEXTO}
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
