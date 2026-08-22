import { advertisingConfig } from './config';

export const REWARDED_AD_ERRORS = Object.freeze({
  PREMIUM: 'PREMIUM_SEM_ANUNCIOS',
  PLAN_NOT_RESOLVED: 'PLANO_NAO_CONFIRMADO',
  FEATURE_NOT_ALLOWED: 'RECURSO_NAO_HABILITADO',
  PROVIDER_UNAVAILABLE: 'PROVEDOR_INDISPONIVEL',
  REWARD_NOT_CONFIRMED: 'RECOMPENSA_NAO_CONFIRMADA',
});

function criarErroRewarded(codigo) {
  const erro = new Error(codigo);
  erro.code = codigo;
  return erro;
}

function getAdMobBridge() {
  if (typeof window === 'undefined') return null;

  return window.TradeSportsAdMob || null;
}

export function podeOferecerRewardedAd({
  featureKey,
  plano,
  planoResolvido,
}) {
  if (!planoResolvido || plano !== 'lite') return false;
  if (!advertisingConfig.rewarded.enabled) return false;
  if (advertisingConfig.rewarded.provider !== 'admob-native') return false;

  if (!advertisingConfig.rewarded.featureKeys.includes(featureKey)) {
    return false;
  }

  const bridge = getAdMobBridge();

  return Boolean(
    bridge &&
      typeof bridge.isRewardedReady === 'function' &&
      typeof bridge.showRewarded === 'function' &&
      bridge.isRewardedReady(featureKey)
  );
}

export async function solicitarRewardedAd({
  featureKey,
  plano,
  planoResolvido,
}) {
  if (!planoResolvido) {
    throw criarErroRewarded(REWARDED_AD_ERRORS.PLAN_NOT_RESOLVED);
  }

  if (plano === 'premium') {
    throw criarErroRewarded(REWARDED_AD_ERRORS.PREMIUM);
  }

  if (!advertisingConfig.rewarded.featureKeys.includes(featureKey)) {
    throw criarErroRewarded(REWARDED_AD_ERRORS.FEATURE_NOT_ALLOWED);
  }

  if (!podeOferecerRewardedAd({ featureKey, plano, planoResolvido })) {
    throw criarErroRewarded(REWARDED_AD_ERRORS.PROVIDER_UNAVAILABLE);
  }

  const comprovante = await getAdMobBridge().showRewarded(featureKey);

  if (!comprovante?.rewardEarned || !comprovante?.transactionId) {
    throw criarErroRewarded(REWARDED_AD_ERRORS.REWARD_NOT_CONFIRMED);
  }

  // O comprovante deve ser validado pelo backend/SSV antes de liberar qualquer
  // benefício. O cliente nunca concede recursos diretamente.
  return comprovante;
}
