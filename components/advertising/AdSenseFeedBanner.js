import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import styled from 'styled-components';
import { advertisingConfig } from '../../lib/advertising/config';

const STATUS_SEM_ANUNCIO = new Set(['unfilled', 'unfill-optimized']);

export default function AdSenseFeedBanner({ enabled }) {
  const anuncioRef = useRef(null);
  const requisicaoEnviadaRef = useRef(false);
  const [semAnuncio, setSemAnuncio] = useState(false);

  const { clientId, feedSlotId, configured } = advertisingConfig.adsense;
  const modoPreview = advertisingConfig.preview && !configured;

  useEffect(() => {
    if (!enabled || modoPreview || !configured) return undefined;

    const elemento = anuncioRef.current;

    if (!elemento) return undefined;

    const observarStatus = () => {
      const status = elemento.getAttribute('data-ad-status');

      if (STATUS_SEM_ANUNCIO.has(status)) {
        setSemAnuncio(true);
      }
    };

    const observer = new MutationObserver(observarStatus);

    observer.observe(elemento, {
      attributes: true,
      attributeFilter: ['data-ad-status'],
    });

    if (!requisicaoEnviadaRef.current) {
      requisicaoEnviadaRef.current = true;

      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      } catch (err) {
        console.error('Não foi possível solicitar o anúncio do feed:', err);
        setSemAnuncio(true);
      }
    }

    observarStatus();

    return () => observer.disconnect();
  }, [configured, enabled, modoPreview]);

  if (!enabled) return null;

  if (modoPreview) {
    return (
      <AnuncioContainer aria-label="Publicidade em modo de pré-visualização">
        <PublicidadeLabel>Publicidade</PublicidadeLabel>

        <Preview>
          <strong>Banner responsivo do Google AdSense</strong>
          <span>Pré-visualização — nenhuma solicitação de anúncio foi enviada.</span>
        </Preview>
      </AnuncioContainer>
    );
  }

  if (!configured) return null;

  return (
    <AnuncioContainer $oculto={semAnuncio} aria-label="Publicidade">
      <Script
        id="tradesports-google-adsense"
        strategy="afterInteractive"
        async
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      />

      <PublicidadeLabel>Publicidade</PublicidadeLabel>

      <ins
        ref={anuncioRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={feedSlotId}
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
  min-height: 96px;
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
