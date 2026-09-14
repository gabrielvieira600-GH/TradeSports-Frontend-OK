import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { POLITICA_PRIVACIDADE_PUBLICA } from '../lib/legal/publicDocuments';

export default function PoliticaPrivacidadeModal({
  onClose,
  onAceitar,
  exigirLeitura = false,
  textoBotao = 'Li e estou ciente',
}) {
  const [scrollNoFim, setScrollNoFim] = useState(!exigirLeitura);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!exigirLeitura) setScrollNoFim(true);
  }, [exigirLeitura]);

  const verificarScroll = () => {
    const el = bodyRef.current;
    if (!el) return;
    const chegou = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
    if (chegou) setScrollNoFim(true);
  };

  return (
    <Overlay role="dialog" aria-modal="true" aria-label="Política de Privacidade">
      <Modal>
        <Header>
          <strong>Política de Privacidade</strong>
          <button type="button" onClick={onClose} aria-label="Fechar">×</button>
        </Header>

        <Body ref={bodyRef} onScroll={verificarScroll}>
          <pre>{POLITICA_PRIVACIDADE_PUBLICA}</pre>
        </Body>

        <Actions>
          {onClose && (
            <Secondary type="button" onClick={onClose}>
              Fechar
            </Secondary>
          )}
          {onAceitar && (
            <Primary
              type="button"
              disabled={exigirLeitura && !scrollNoFim}
              onClick={() => onAceitar()}
            >
              {textoBotao}
            </Primary>
          )}
        </Actions>
      </Modal>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  padding: 18px;
  display: grid;
  place-items: center;
  background: rgba(0,0,0,.62);
`;

const Modal = styled.div`
  width: min(900px, 96vw);
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 14px;
  background: #fff;
  color: #111827;
`;

const Header = styled.div`
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #e5e7eb;

  button {
    border: 0;
    background: transparent;
    color: #111827;
    font-size: 1.3rem;
    cursor: pointer;
  }
`;

const Body = styled.div`
  padding: 18px;
  overflow: auto;

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font: inherit;
    font-size: .88rem;
    line-height: 1.65;
  }
`;

const Actions = styled.div`
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #e5e7eb;
`;

const Primary = styled.button`
  border: 0;
  border-radius: 9px;
  padding: 10px 14px;
  background: #2563eb;
  color: #fff;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: .45;
    cursor: not-allowed;
  }
`;

const Secondary = styled.button`
  border: 1px solid #d1d5db;
  border-radius: 9px;
  padding: 10px 14px;
  background: #fff;
  color: #111827;
  font-weight: 700;
  cursor: pointer;
`;
