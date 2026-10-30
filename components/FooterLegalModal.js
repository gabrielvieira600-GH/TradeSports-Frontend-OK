import { useEffect } from 'react';
import styled from 'styled-components';
import { TERMOS_USO_PUBLICOS, POLITICA_PRIVACIDADE_PUBLICA } from '../lib/legal/publicDocuments';

const COOKIE_POLICY = `POLÍTICA DE COOKIES — TRADESPORTS

A TradeSports utiliza cookies e tecnologias semelhantes para permitir a autenticação, proteger sessões, preservar a segurança e garantir o funcionamento da plataforma.

Cookies necessários: podem ser usados para autenticação, proteção de sessão, segurança, prevenção de fraude e preferências essenciais.

Medição e desempenho: quando habilitados, cookies e tecnologias de medição podem auxiliar na análise de desempenho, erros e navegação agregada.

Publicidade: a TradeSports pode utilizar Google AdSense e Google Ad Manager. Terceiros, incluindo o Google, podem usar cookies para veicular e medir anúncios, inclusive com base em visitas anteriores a este ou outros sites.

Você pode gerenciar a personalização de anúncios em https://adssettings.google.com/ e excluir, bloquear ou restringir cookies nas configurações do navegador. Bloquear cookies essenciais pode impedir o funcionamento de partes da plataforma.

Consulte a Política de Privacidade para informações adicionais sobre o tratamento de dados pessoais.`;

const DOCUMENTS = {
  termos: { title: 'Termos de Uso', text: TERMOS_USO_PUBLICOS },
  privacidade: { title: 'Política de Privacidade', text: POLITICA_PRIVACIDADE_PUBLICA },
  cookies: { title: 'Política de Cookies', text: COOKIE_POLICY },
};

export default function FooterLegalModal({ documentType, onClose }) {
  const doc = DOCUMENTS[documentType];
  useEffect(() => {
    if (!doc) return;
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [doc, onClose]);
  if (!doc) return null;
  return (
    <Overlay role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <Modal role="dialog" aria-modal="true" aria-label={doc.title}>
        <ModalHeader>
          <strong>{doc.title}</strong>
          <button type="button" aria-label="Fechar" onClick={onClose}>×</button>
        </ModalHeader>
        <ModalBody><pre>{doc.text}</pre></ModalBody>
        <ModalActions><button type="button" onClick={onClose}>Fechar</button></ModalActions>
      </Modal>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 9999; padding: 18px;
  display: grid; place-items: center; background: rgba(0,0,0,.65);
`;
const Modal = styled.div`
  width: min(900px, 96vw); max-height: 88vh; display: flex;
  flex-direction: column; overflow: hidden; border-radius: 14px;
  background: #fff; color: #111827;
`;
const ModalHeader = styled.div`
  padding: 14px 16px; display: flex; justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  button { border: 0; background: transparent; font-size: 1.3rem; cursor: pointer; }
`;
const ModalBody = styled.div`
  padding: 18px; overflow: auto;
  pre { margin: 0; white-space: pre-wrap; word-break: break-word;
    font: inherit; font-size: .88rem; line-height: 1.65; }
`;
const ModalActions = styled.div`
  padding: 12px 16px; display: flex; justify-content: flex-end;
  gap: 10px; border-top: 1px solid #e5e7eb;
  button { padding: 10px 14px; border: 1px solid #d1d5db;
    border-radius: 9px; background: #fff; cursor: pointer; font-weight: 700; }
`;
