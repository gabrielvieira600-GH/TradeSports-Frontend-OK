import Link from 'next/link';
import styled, { css, keyframes } from 'styled-components';
import {
  FiAlertTriangle,
  FiClock,
  FiInbox,
  FiLoader,
  FiSearch,
} from 'react-icons/fi';

const ICONES_PADRAO = {
  vazio: FiInbox,
  busca: FiSearch,
  carregando: FiLoader,
  erro: FiAlertTriangle,
  indisponivel: FiClock,
};

export default function EstadoInterface({
  variante = 'vazio',
  titulo,
  descricao,
  icone,
  acao,
  hrefAcao,
  onAcao,
  acaoSecundaria,
  hrefAcaoSecundaria,
  onAcaoSecundaria,
  compacto = false,
  className,
}) {
  const IconePadrao = ICONES_PADRAO[variante] || FiInbox;
  const conteudoIcone = icone || <IconePadrao />;
  const carregando = variante === 'carregando';
  const erro = variante === 'erro';

  return (
    <Painel
      className={className}
      $variante={variante}
      $compacto={compacto}
      role={erro ? 'alert' : 'status'}
      aria-live={erro ? 'assertive' : 'polite'}
      aria-busy={carregando}
    >
      <Icone $variante={variante} $girando={carregando} aria-hidden="true">
        {conteudoIcone}
      </Icone>

      <Conteudo>
        <Titulo>{titulo}</Titulo>
        {descricao && <Descricao>{descricao}</Descricao>}
      </Conteudo>

      {(acao || acaoSecundaria) && (
        <Acoes>
          {acao &&
            (hrefAcao ? (
              <AcaoPrincipalLink href={hrefAcao}>{acao}</AcaoPrincipalLink>
            ) : (
              <AcaoPrincipalButton type="button" onClick={onAcao}>
                {acao}
              </AcaoPrincipalButton>
            ))}

          {acaoSecundaria &&
            (hrefAcaoSecundaria ? (
              <AcaoSecundariaLink href={hrefAcaoSecundaria}>
                {acaoSecundaria}
              </AcaoSecundariaLink>
            ) : (
              <AcaoSecundariaButton
                type="button"
                onClick={onAcaoSecundaria}
              >
                {acaoSecundaria}
              </AcaoSecundariaButton>
            ))}
        </Acoes>
      )}
    </Painel>
  );
}

const girar = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Painel = styled.section`
  width: 100%;
  min-height: ${({ $compacto }) => ($compacto ? '150px' : '220px')};
  padding: ${({ $compacto }) => ($compacto ? '24px 20px' : '36px 28px')};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  border: 1px solid
    ${({ $variante }) =>
      $variante === 'erro'
        ? 'rgba(248, 113, 113, 0.28)'
        : $variante === 'indisponivel'
        ? 'rgba(245, 158, 11, 0.24)'
        : 'rgba(148, 163, 184, 0.14)'};
  border-radius: ${({ $compacto }) => ($compacto ? '15px' : '20px')};
  background:
    radial-gradient(
      circle at 50% 0,
      ${({ $variante }) =>
          $variante === 'erro'
            ? 'rgba(239, 68, 68, 0.10)'
            : $variante === 'indisponivel'
            ? 'rgba(245, 158, 11, 0.08)'
            : 'rgba(59, 130, 246, 0.08)'},
      transparent 54%
    ),
    rgba(15, 23, 42, 0.62);
  color: #e2e8f0;
  text-align: center;
  box-sizing: border-box;
`;

const Icone = styled.div`
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border: 1px solid
    ${({ $variante }) =>
      $variante === 'erro'
        ? 'rgba(248, 113, 113, 0.24)'
        : $variante === 'indisponivel'
        ? 'rgba(245, 158, 11, 0.22)'
        : 'rgba(96, 165, 250, 0.18)'};
  border-radius: 15px;
  background:
    ${({ $variante }) =>
      $variante === 'erro'
        ? 'rgba(239, 68, 68, 0.10)'
        : $variante === 'indisponivel'
        ? 'rgba(245, 158, 11, 0.09)'
        : 'rgba(59, 130, 246, 0.09)'};
  color:
    ${({ $variante }) =>
      $variante === 'erro'
        ? '#fca5a5'
        : $variante === 'indisponivel'
        ? '#fbbf24'
        : '#60a5fa'};
  font-size: 1.35rem;

  svg {
    ${({ $girando }) =>
      $girando &&
      css`
        animation: ${girar} 0.85s linear infinite;
      `}
  }
`;

const Conteudo = styled.div`
  max-width: 560px;
`;

const Titulo = styled.h3`
  margin: 0;
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.01em;
`;

const Descricao = styled.p`
  margin: 7px 0 0;
  color: #94a3b8;
  font-size: 0.86rem;
  line-height: 1.55;
`;

const Acoes = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const estiloAcao = css`
  min-height: 44px;
  padding: 10px 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  font-size: 0.8rem;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    background 0.16s ease,
    border-color 0.16s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
  }
`;

const estiloPrincipal = css`
  ${estiloAcao}
  border: 1px solid rgba(59, 130, 246, 0.42);
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;

  &:hover {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
  }
`;

const estiloSecundario = css`
  ${estiloAcao}
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.045);
  color: #e2e8f0;

  &:hover {
    border-color: rgba(96, 165, 250, 0.3);
    background: rgba(59, 130, 246, 0.10);
  }
`;

const AcaoPrincipalLink = styled(Link)`
  ${estiloPrincipal}
`;

const AcaoPrincipalButton = styled.button`
  ${estiloPrincipal}
`;

const AcaoSecundariaLink = styled(Link)`
  ${estiloSecundario}
`;

const AcaoSecundariaButton = styled.button`
  ${estiloSecundario}
`;
