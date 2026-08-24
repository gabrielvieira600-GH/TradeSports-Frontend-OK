import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useAdvertising } from '../../contexts/AdvertisingContext';
import {
  adSenseSlotEstaConfigurado,
  advertisingConfig,
  getAdSenseSlot,
} from '../../lib/advertising/config';
import { carregarAdSenseUmaVez } from '../../lib/advertising/adsenseLoader';

const STATUS_SEM_ANUNCIO = new Set(['unfilled', 'unfill-optimized']);

export default function AdSenseBanner({
  slotName,
  enabled = true,
  className,
  minHeight = 90,
}) {
  const { canShowAds } = useAdvertising();
  const anuncioRef = useRef(null);
  const requisicaoEnviadaRef = useRef(false);
  const [semAnuncio, setSemAnuncio] = useState(false);

  const { clientId } = advertisingConfig.adsense;
  const slotId = getAdSenseSlot(slotName);
  const modoPreview = advertisingConfig.preview;
  const configurado = adSenseSlotEstaConfigurado(slotName);
  const podeRenderizar =
    enabled && canShowAds && (modoPreview || configurado);

  useEffect(() => {
    if (!podeRenderizar || modoPreview || !configurado) return undefined;

    const elemento = anuncioRef.current;
    if (!elemento) return undefined;

    let ativo = true;

    const observarStatus = () => {
      const status = elemento.getAttribute('data-ad-status');

      if (STATUS_SEM_ANUNCIO.has(status)) {
        setSemAnuncio(true);
      } else if (status === 'filled') {
        setSemAnuncio(false);
      }
    };

    const observer = new MutationObserver(observarStatus);
    observer.observe(elemento, {
      attributes: true,
      attributeFilter: ['data-ad-status'],
    });

    if (!requisicaoEnviadaRef.current) {
      requisicaoEnviadaRef.current = true;

      carregarAdSenseUmaVez(clientId)
        .then(() => {
          if (!ativo) return;

          window.adsbygoogle = window.adsbygoogle || [];
          window.adsbygoogle.push({});
        })
        .catch((err) => {
          if (!ativo) return;

          console.error('Não foi possível carregar o anúncio:', err);
          setSemAnuncio(true);
        });
    }

    observarStatus();

    return () => {
      ativo = false;
      observer.disconnect();
    };
  }, [clientId, configurado, modoPreview, podeRenderizar]);

  if (!podeRenderizar) return null;

  if (modoPreview) {
    return (
      <AnuncioContainer
        className={className}
        aria-label="Publicidade em modo de pré-visualização"
      >
        <PublicidadeLabel>Publicidade</PublicidadeLabel>

        <Preview $minHeight={minHeight}>
          <strong>Banner responsivo do Google AdSense</strong>
          <span>
            Pré-visualização de {slotName} — nenhuma solicitação foi enviada.
          </span>
        </Preview>
      </AnuncioContainer>
    );
  }

  return (
    <AnuncioContainer
      className={className}
      $oculto={semAnuncio}
      aria-label="Publicidade"
    >
      <PublicidadeLabel>Publicidade</PublicidadeLabel>

      <ins
        ref={anuncioRef}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: `${minHeight}px` }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </AnuncioContainer>
  );
}

const AnuncioContainer = styled.aside`
  display: ${({ $oculto }) => ($oculto ? 'none' : 'block')};
  width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 12px 14px 14px;

  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.48);

  @media (max-width: 640px) {
    padding: 10px 8px 12px;
    border-radius: 14px;
  }
`;

const PublicidadeLabel = styled.div`
  margin-bottom: 8px;
  color: #64748b;
  font-size: 0.64rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Preview = styled.div`
  min-height: ${({ $minHeight }) => `${$minHeight}px`};
  padding: 18px;
  border: 1px dashed rgba(96, 165, 250, 0.35);
  border-radius: 12px;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;

  color: #94a3b8;
  text-align: center;

  strong {
    color: #cbd5e1;
    font-size: 0.84rem;
  }

  span {
    font-size: 0.72rem;
  }
`;
