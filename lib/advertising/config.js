const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';
const ADS_PREVIEW = process.env.NEXT_PUBLIC_ADS_PREVIEW === 'true';

const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || '';
const ADSENSE_FEED_SLOT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_FEED_SLOT_ID?.trim() || '';
const ADSENSE_HOME_SLOT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT_ID?.trim() || '';
const ADSENSE_DASHBOARD_SLOT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_DASHBOARD_SLOT_ID?.trim() || '';
const ADSENSE_MARKET_SLOT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_MARKET_SLOT_ID?.trim() || '';

const REWARDED_ADS_ENABLED =
  process.env.NEXT_PUBLIC_REWARDED_ADS_ENABLED === 'true';
const REWARDED_AD_PROVIDER =
  process.env.NEXT_PUBLIC_REWARDED_AD_PROVIDER?.trim() ||
  'google-ad-manager-web';
const REWARDED_GAM_AD_UNIT_PATH =
  process.env.NEXT_PUBLIC_GAM_REWARDED_AD_UNIT_PATH?.trim() || '';
const REWARDED_FEATURE_KEYS = (
  process.env.NEXT_PUBLIC_REWARDED_FEATURE_KEYS ||
  'lite_weekly_orders'
)
  .split(',')
  .map((featureKey) => featureKey.trim())
  .filter(Boolean);

function numeroInteiroLimitado(valor, padrao, minimo, maximo) {
  const numero = Number.parseInt(valor, 10);

  if (!Number.isInteger(numero)) return padrao;

  return Math.min(Math.max(numero, minimo), maximo);
}

const feedInterval = numeroInteiroLimitado(
  process.env.NEXT_PUBLIC_FEED_AD_INTERVAL,
  5,
  3,
  12
);

const feedMaxAds = numeroInteiroLimitado(
  process.env.NEXT_PUBLIC_FEED_AD_MAX,
  2,
  1,
  3
);

const clienteAdSenseValido = /^ca-pub-\d+$/.test(ADSENSE_CLIENT_ID);

function slotAdSenseValido(slotId) {
  return /^\d+$/.test(slotId);
}

function rewardedGamPathValido(adUnitPath) {
  return /^\/\d+\/.+/.test(String(adUnitPath || ''));
}

const slots = Object.freeze({
  feed: ADSENSE_FEED_SLOT_ID,
  home: ADSENSE_HOME_SLOT_ID,
  dashboard: ADSENSE_DASHBOARD_SLOT_ID,
  market: ADSENSE_MARKET_SLOT_ID,
});

export const advertisingConfig = Object.freeze({
  enabled: ADS_ENABLED,
  preview: ADS_PREVIEW,
  feedInterval,
  feedMaxAds,

  adsense: Object.freeze({
    clientId: ADSENSE_CLIENT_ID,
    feedSlotId: ADSENSE_FEED_SLOT_ID,
    homeSlotId: ADSENSE_HOME_SLOT_ID,
    dashboardSlotId: ADSENSE_DASHBOARD_SLOT_ID,
    marketSlotId: ADSENSE_MARKET_SLOT_ID,
    clientConfigured: clienteAdSenseValido,
    slots,
    configured:
      clienteAdSenseValido && slotAdSenseValido(ADSENSE_FEED_SLOT_ID),
  }),

  rewarded: Object.freeze({
    enabled: REWARDED_ADS_ENABLED,
    provider: REWARDED_AD_PROVIDER,
    adUnitPath: REWARDED_GAM_AD_UNIT_PATH,
    featureKeys: Object.freeze(REWARDED_FEATURE_KEYS),
    configured:
      REWARDED_AD_PROVIDER === 'google-ad-manager-web' &&
      rewardedGamPathValido(REWARDED_GAM_AD_UNIT_PATH),
  }),
});

export function getAdSenseSlot(slotName) {
  return advertisingConfig.adsense.slots[slotName] || '';
}

export function adSenseSlotEstaConfigurado(slotName) {
  return (
    advertisingConfig.adsense.clientConfigured &&
    slotAdSenseValido(getAdSenseSlot(slotName))
  );
}

export function podeExibirPublicidadeNoFeed({ plano, planoResolvido }) {
  if (!planoResolvido || plano !== 'lite') return false;
  if (!advertisingConfig.enabled) return false;

  return advertisingConfig.preview || advertisingConfig.adsense.configured;
}

export function deveInserirPublicidadeDepoisDoEvento(indice) {
  const posicao = indice + 1;

  if (posicao % advertisingConfig.feedInterval !== 0) return false;

  const numeroDoAnuncio = posicao / advertisingConfig.feedInterval;

  return numeroDoAnuncio <= advertisingConfig.feedMaxAds;
}
