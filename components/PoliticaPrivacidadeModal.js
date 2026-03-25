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
      `POLÍTICA DE PRIVACIDADE — TRADESPORTS

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
📧 [privacidade@tradesports.com]`,
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
