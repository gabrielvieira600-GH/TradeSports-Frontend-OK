import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../../lib/api';
import { useAdvertising } from '../../contexts/AdvertisingContext';
import RewardedOrdersButton from './RewardedOrdersButton';

export default function RewardedOrdersFloatingPrompt() {
  const { plano, resolved } = useAdvertising();
  const [quota, setQuota] = useState(null);

  const carregarQuota = useCallback(async () => {
    if (!resolved || plano !== 'lite') {
      setQuota(null);
      return;
    }

    try {
      const { data } = await api.get('/mercado/limite-ordens');
      setQuota(data || null);
    } catch (_) {
      // O prompt é complementar: falhas silenciosas não interferem no mercado.
      setQuota(null);
    }
  }, [plano, resolved]);

  useEffect(() => {
    carregarQuota();
  }, [carregarQuota]);

  if (!resolved || plano !== 'lite' || !quota) return null;
  if (!quota.temporadaAtiva || quota.mercadoAberto === false) return null;
  if (quota.rewardedAds?.disponivel === false) return null;

  const restantes = Math.max(0, Number(quota.restantes || 0));

  // Mantém a interface discreta: a oferta ganha destaque quando a franquia
  // está acabando ou já foi esgotada.
  if (restantes > 2 && !quota.limiteAtingido) return null;

  return (
    <FloatingArea role="complementary" aria-label="Ordens extras por anúncio premiado">
      <RewardedOrdersButton
        rewardedAds={quota.rewardedAds}
        onRewardGranted={carregarQuota}
      />
    </FloatingArea>
  );
}

const FloatingArea = styled.div`
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 700;
  width: min(390px, calc(100vw - 28px));
  padding: 0;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.98);
  box-shadow: 0 18px 50px rgba(2, 6, 23, 0.42);

  @media (max-width: 640px) {
    right: 10px;
    bottom: max(10px, env(safe-area-inset-bottom));
    width: calc(100vw - 20px);
  }
`;
