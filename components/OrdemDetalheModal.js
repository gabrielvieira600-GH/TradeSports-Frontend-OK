import { useEffect } from 'react';
import styled from 'styled-components';

function formatarTS(valor) {
  return `T$ ${Number(valor || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function OrdemDetalheModal({ ordem, onClose }) {
  useEffect(() => {
    if (!ordem || typeof document === 'undefined') return undefined;

    const overflowAnterior = document.body.style.overflow;
    const fecharComEscape = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', fecharComEscape);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener('keydown', fecharComEscape);
    };
  }, [ordem, onClose]);

  if (!ordem) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Fechar type="button" onClick={onClose} aria-label="Fechar detalhes da ordem">
          ×
        </Fechar>
        <h2>Detalhes da Ordem</h2>

        <Linha><strong>Tipo:</strong> <Tipo tipo={ordem.tipo}>{ordem.tipo.toUpperCase()}</Tipo></Linha>
        <Linha><strong>Clube:</strong> {ordem.clubeNome}</Linha>
        <Linha><strong>Quantidade:</strong> {ordem.quantidade} cotas</Linha>
        <Linha><strong>Preço Unitário:</strong> {formatarTS(ordem.preco)}</Linha>
        <Linha><strong>Total:</strong> {formatarTS(ordem.quantidade * ordem.preco)}</Linha>
        <Linha><strong>Data:</strong> {new Date(ordem.data).toLocaleString('pt-BR')}</Linha>
        {ordem.usuarioId && <Linha><strong>ID do Usuário:</strong> {ordem.usuarioId}</Linha>}
        {ordem.ordemId && <Linha><strong>ID da Ordem:</strong> {ordem.ordemId}</Linha>}
      </ModalContainer>
    </Overlay>
  );
}

// Styled Components
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  background: rgba(0,0,0,0.6);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding:
    max(16px, env(safe-area-inset-top))
    max(12px, env(safe-area-inset-right))
    max(16px, env(safe-area-inset-bottom))
    max(12px, env(safe-area-inset-left));
`;

const ModalContainer = styled.div`
  background: #0f172a;
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  color: white;
  position: relative;
  box-shadow: 0 0 20px rgba(0,0,0,0.3);

  h2 {
    margin: 0 48px 18px 0;
    font-size: 1.25rem;
  }

  @media (max-width: 520px) {
    padding: 20px 16px;
    border-radius: 14px;
  }
`;

const Fechar = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;

  &:hover {
    color: white;
  }
`;

const Linha = styled.p`
  margin: 0.5rem 0;
  display: grid;
  grid-template-columns: minmax(118px, auto) minmax(0, 1fr);
  gap: 10px;
  color: #e2e8f0;
  line-height: 1.4;
  overflow-wrap: anywhere;

  strong {
    color: #38bdf8;
  }

  @media (max-width: 380px) {
    grid-template-columns: 1fr;
    gap: 2px;
    margin: 0.75rem 0;
  }
`;

const Tipo = styled.span`
  color: ${({ tipo }) => (tipo === 'compra' ? '#22c55e' : '#ef4444')};
  font-weight: bold;
`;
