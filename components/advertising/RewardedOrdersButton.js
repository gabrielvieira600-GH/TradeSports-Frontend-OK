import { useState } from 'react';
import styled from 'styled-components';
import { useAdvertising } from '../../contexts/AdvertisingContext';
import { advertisingConfig } from '../../lib/advertising/config';
import {
  REWARDED_AD_ERRORS,
  REWARDED_FEATURE_ORDENS_LITE,
  solicitarRewardedAd,
} from '../../lib/advertising/rewardedAds';

function mensagemDoErro(err) {
  const codigo = err?.response?.data?.codigo || err?.code || err?.message;
  const mensagemApi = err?.response?.data?.erro;

  if (mensagemApi) return mensagemApi;

  switch (codigo) {
    case REWARDED_AD_ERRORS.NO_INVENTORY:
      return 'Nenhum anúncio premiado está disponível agora. Tente novamente mais tarde.';
    case REWARDED_AD_ERRORS.SLOT_UNSUPPORTED:
      return 'Este navegador ou dispositivo não oferece suporte ao anúncio premiado.';
    case REWARDED_AD_ERRORS.NOT_READY:
      return 'O anúncio não ficou disponível a tempo. Tente novamente.';
    case REWARDED_AD_ERRORS.ALREADY_RUNNING:
      return 'Já existe um anúncio premiado em andamento.';
    case REWARDED_AD_ERRORS.PROVIDER_UNAVAILABLE:
      return 'Não foi possível carregar o provedor de anúncios agora.';
    case REWARDED_AD_ERRORS.REWARD_NOT_CONFIRMED:
      return 'O anúncio foi encerrado antes da confirmação da recompensa.';
    case 'REWARDED_AD_LIMITE_SEMANAL':
      return 'Você já utilizou os 5 anúncios premiados desta semana.';
    default:
      return 'Não foi possível liberar as ordens extras. Tente novamente.';
  }
}

export default function RewardedOrdersButton({
  rewardedAds,
  disabled = false,
  onRewardGranted,
}) {
  const { plano, resolved } = useAdvertising();
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const configurado =
    advertisingConfig.rewarded.enabled &&
    advertisingConfig.rewarded.configured &&
    advertisingConfig.rewarded.provider === 'google-ad-manager-web';

  if (!configurado || !resolved || plano !== 'lite') {
    return null;
  }

  const concluidos = Math.max(0, Number(rewardedAds?.concluidos || 0));
  const maximo = Math.max(1, Number(rewardedAds?.maximoSemanal || 5));
  const restantes = Math.max(
    0,
    Number.isFinite(Number(rewardedAds?.restantes))
      ? Number(rewardedAds.restantes)
      : maximo - concluidos
  );
  const ordensPorAnuncio = Math.max(
    1,
    Number(rewardedAds?.ordensPorAnuncio || 2)
  );

  const disponivel =
    rewardedAds?.disponivel !== false &&
    restantes > 0 &&
    !disabled;

  async function assistirAnuncio() {
    if (!disponivel || carregando) return;

    setCarregando(true);
    setErro('');
    setMensagem('');

    try {
      const resultado = await solicitarRewardedAd({
        featureKey: REWARDED_FEATURE_ORDENS_LITE,
        plano,
        planoResolvido: resolved,
      });

      setMensagem(
        `Recompensa confirmada: +${Number(
          resultado?.recompensa?.quantidade || ordensPorAnuncio
        )} ordens nesta semana.`
      );

      if (typeof onRewardGranted === 'function') {
        onRewardGranted(resultado);
      }
    } catch (err) {
      console.error('Erro no rewarded ad:', err);
      setErro(mensagemDoErro(err));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Container>
      <Cabecalho>
        <div>
          <Titulo>Ganhe +{ordensPorAnuncio} ordens</Titulo>
          <Descricao>
            Assista voluntariamente a um anúncio premiado para liberar +{ordensPorAnuncio}{' '}
            ordens nesta semana. Fechar ou recusar o anúncio não remove nenhuma
            funcionalidade da sua conta.
          </Descricao>
        </div>

        <Contador>
          {concluidos}/{maximo} usados
        </Contador>
      </Cabecalho>

      <AcaoLinha>
        <Botao
          type="button"
          onClick={assistirAnuncio}
          disabled={!disponivel || carregando}
        >
          {carregando
            ? 'Preparando anúncio...'
            : restantes > 0
            ? `Assistir anúncio e ganhar +${ordensPorAnuncio} ordens`
            : 'Limite semanal de anúncios atingido'}
        </Botao>

        <Restantes>
          {restantes > 0
            ? `${restantes} anúncio${restantes === 1 ? '' : 's'} premiado${
                restantes === 1 ? '' : 's'
              } restante${restantes === 1 ? '' : 's'} nesta semana`
            : 'Novo ciclo na próxima semana'}
        </Restantes>
      </AcaoLinha>

      {mensagem && <Mensagem $sucesso>{mensagem}</Mensagem>}
      {erro && <Mensagem>{erro}</Mensagem>}
    </Container>
  );
}

const Container = styled.div`
  margin-top: 13px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(250, 204, 21, 0.2);
  background: rgba(161, 98, 7, 0.09);
`;

const Cabecalho = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 560px) {
    flex-direction: column;
  }
`;

const Titulo = styled.strong`
  display: block;
  color: #fef3c7;
  font-size: 0.84rem;
`;

const Descricao = styled.p`
  margin: 4px 0 0;
  color: #cbd5e1;
  font-size: 0.73rem;
  line-height: 1.45;
`;

const Contador = styled.span`
  flex: 0 0 auto;
  padding: 5px 8px;
  border-radius: 999px;
  color: #fde68a;
  background: rgba(202, 138, 4, 0.16);
  font-size: 0.7rem;
  font-weight: 800;
`;

const AcaoLinha = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const Botao = styled.button`
  border: 0;
  border-radius: 10px;
  padding: 9px 12px;
  cursor: pointer;
  color: #111827;
  background: #facc15;
  font-size: 0.76rem;
  font-weight: 900;
  transition: transform 0.15s ease, opacity 0.15s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

const Restantes = styled.span`
  color: #94a3b8;
  font-size: 0.7rem;
`;

const Mensagem = styled.div`
  margin-top: 9px;
  color: ${({ $sucesso }) => ($sucesso ? '#bbf7d0' : '#fecaca')};
  font-size: 0.72rem;
  font-weight: 700;
`;
