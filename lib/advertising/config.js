const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';
const ADS_PREVIEW = process.env.NEXT_PUBLIC_ADS_PREVIEW === 'true';

const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || '';
const ADSENSE_FEED_SLOT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_FEED_SLOT_ID?.trim() || '';

const REWARDED_ADS_ENABLED =
  process.env.NEXT_PUBLIC_REWARDED_ADS_ENABLED === 'true';
const REWARDED_AD_PROVIDER =
  process.env.NEXT_PUBLIC_REWARDED_AD_PROVIDER?.trim() || '';
const REWARDED_FEATURE_KEYS = (
  process.env.NEXT_PUBLIC_REWARDED_FEATURE_KEYS || ''
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
const slotAdSenseValido = /^\d+$/.test(ADSENSE_FEED_SLOT_ID);

export const advertisingConfig = Object.freeze({
  enabled: ADS_ENABLED,
  preview: ADS_PREVIEW,
  feedInterval,
  feedMaxAds,
  adsense: Object.freeze({
    clientId: ADSENSE_CLIENT_ID,
    feedSlotId: ADSENSE_FEED_SLOT_ID,
    configured: clienteAdSenseValido && slotAdSenseValido,
  }),
  rewarded: Object.freeze({
    enabled: REWARDED_ADS_ENABLED,
    provider: REWARDED_AD_PROVIDER,
    featureKeys: Object.freeze(REWARDED_FEATURE_KEYS),
  }),
});

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
