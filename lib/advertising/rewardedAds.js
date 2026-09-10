import api from '../api';
import { advertisingConfig } from './config';

export const REWARDED_FEATURE_ORDENS_LITE = 'lite_weekly_orders';

export const REWARDED_AD_ERRORS = Object.freeze({
  PREMIUM: 'PREMIUM_SEM_ANUNCIOS',
  PLAN_NOT_RESOLVED: 'PLANO_NAO_CONFIRMADO',
  FEATURE_NOT_ALLOWED: 'RECURSO_NAO_HABILITADO',
  PROVIDER_UNAVAILABLE: 'PROVEDOR_INDISPONIVEL',
  NOT_CONFIGURED: 'REWARDED_NAO_CONFIGURADO',
  ALREADY_RUNNING: 'REWARDED_EM_ANDAMENTO',
  SLOT_UNSUPPORTED: 'REWARDED_NAO_SUPORTADO_NESTE_DISPOSITIVO',
  NO_INVENTORY: 'REWARDED_SEM_INVENTARIO',
  NOT_READY: 'REWARDED_NAO_FICOU_PRONTO',
  REWARD_NOT_CONFIRMED: 'RECOMPENSA_NAO_CONFIRMADA',
});

const GPT_SCRIPT_ID = 'tradesports-google-publisher-tag';
const GPT_SCRIPT_URL = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
const TEMPO_MAXIMO_CARREGAMENTO_MS = 30000;

let promessaGpt = null;
let rewardedEmAndamento = false;

function criarErroRewarded(codigo, causa = null) {
  const erro = new Error(codigo);
  erro.code = codigo;
  if (causa) erro.cause = causa;
  return erro;
}

function garantirGoogletag() {
  if (typeof window === 'undefined') return null;

  window.googletag = window.googletag || { cmd: [] };
  return window.googletag;
}

function carregarGooglePublisherTag() {
  if (typeof window === 'undefined') {
    return Promise.reject(
      criarErroRewarded(REWARDED_AD_ERRORS.PROVIDER_UNAVAILABLE)
    );
  }

  const googletag = garantirGoogletag();

  if (googletag?.apiReady) {
    return Promise.resolve(googletag);
  }

  if (promessaGpt) return promessaGpt;

  promessaGpt = new Promise((resolve, reject) => {
    const existente = document.getElementById(GPT_SCRIPT_ID);

    const finalizar = () => {
      const tag = garantirGoogletag();
      if (!tag) {
        reject(
          criarErroRewarded(REWARDED_AD_ERRORS.PROVIDER_UNAVAILABLE)
        );
        return;
      }
      resolve(tag);
    };

    if (existente) {
      if (window.googletag?.apiReady) {
        finalizar();
        return;
      }

      existente.addEventListener('load', finalizar, { once: true });
      existente.addEventListener(
        'error',
        () =>
          reject(
            criarErroRewarded(REWARDED_AD_ERRORS.PROVIDER_UNAVAILABLE)
          ),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.id = GPT_SCRIPT_ID;
    script.src = GPT_SCRIPT_URL;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = finalizar;
    script.onerror = () => {
      promessaGpt = null;
      reject(
        criarErroRewarded(REWARDED_AD_ERRORS.PROVIDER_UNAVAILABLE)
      );
    };

    document.head.appendChild(script);
  });

  return promessaGpt;
}

export function podeOferecerRewardedAd({
  featureKey,
  plano,
  planoResolvido,
}) {
  if (!planoResolvido || plano !== 'lite') return false;
  if (!advertisingConfig.rewarded.enabled) return false;
  if (!advertisingConfig.rewarded.configured) return false;
  if (advertisingConfig.rewarded.provider !== 'google-ad-manager-web') {
    return false;
  }

  return advertisingConfig.rewarded.featureKeys.includes(featureKey);
}

function validarElegibilidade({ featureKey, plano, planoResolvido }) {
  if (!planoResolvido) {
    throw criarErroRewarded(REWARDED_AD_ERRORS.PLAN_NOT_RESOLVED);
  }

  if (plano === 'premium') {
    throw criarErroRewarded(REWARDED_AD_ERRORS.PREMIUM);
  }

  if (!advertisingConfig.rewarded.enabled) {
    throw criarErroRewarded(REWARDED_AD_ERRORS.NOT_CONFIGURED);
  }

  if (!advertisingConfig.rewarded.featureKeys.includes(featureKey)) {
    throw criarErroRewarded(REWARDED_AD_ERRORS.FEATURE_NOT_ALLOWED);
  }

  if (!advertisingConfig.rewarded.configured) {
    throw criarErroRewarded(REWARDED_AD_ERRORS.NOT_CONFIGURED);
  }

  if (!podeOferecerRewardedAd({ featureKey, plano, planoResolvido })) {
    throw criarErroRewarded(REWARDED_AD_ERRORS.PROVIDER_UNAVAILABLE);
  }
}

async function iniciarTentativaNoBackend(featureKey) {
  const { data } = await api.post('/mercado/rewarded-ad/iniciar', {
    featureKey,
  });

  if (!data?.attemptId || !data?.claimToken) {
    throw criarErroRewarded(REWARDED_AD_ERRORS.REWARD_NOT_CONFIRMED);
  }

  return data;
}

async function confirmarRecompensaNoBackend({
  tentativa,
  payloadGoogle,
}) {
  const { data } = await api.post('/mercado/rewarded-ad/concluir', {
    attemptId: tentativa.attemptId,
    claimToken: tentativa.claimToken,
    providerReward: {
      type: String(payloadGoogle?.type || '').slice(0, 120),
      amount: Number.isFinite(Number(payloadGoogle?.amount))
        ? Number(payloadGoogle.amount)
        : null,
    },
  });

  if (!data?.sucesso) {
    throw criarErroRewarded(REWARDED_AD_ERRORS.REWARD_NOT_CONFIRMED);
  }

  return data;
}

function exibirSlotRewarded({ googletag, tentativa }) {
  return new Promise((resolve, reject) => {
    let slot = null;
    let encerrado = false;
    let recompensaBackendPromise = null;
    let recompensaConcedida = false;
    let timeoutId = null;

    const pubads = googletag.pubads();

    function removerListeners() {
      try {
        pubads.removeEventListener('rewardedSlotReady', onReady);
        pubads.removeEventListener('rewardedSlotGranted', onGranted);
        pubads.removeEventListener('rewardedSlotClosed', onClosed);
        pubads.removeEventListener('slotRenderEnded', onRenderEnded);
      } catch (_) {}
    }

    function destruirSlot() {
      if (!slot) return;
      try {
        googletag.destroySlots([slot]);
      } catch (_) {}
    }

    function cleanup() {
      if (timeoutId) clearTimeout(timeoutId);
      removerListeners();
      destruirSlot();
    }

    function falhar(codigo, causa = null) {
      if (encerrado) return;
      encerrado = true;
      cleanup();
      reject(criarErroRewarded(codigo, causa));
    }

    function onReady(event) {
      if (event.slot !== slot || encerrado) return;

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      // O clique no botão da TradeSports é o opt-in afirmativo do usuário.
      const exibido = event.makeRewardedVisible();

      if (!exibido) {
        falhar(REWARDED_AD_ERRORS.NOT_READY);
      }
    }

    function onGranted(event) {
      if (event.slot !== slot || encerrado || recompensaBackendPromise) return;

      recompensaConcedida = true;
      recompensaBackendPromise = confirmarRecompensaNoBackend({
        tentativa,
        payloadGoogle: event.payload,
      });
    }

    async function onClosed(event) {
      if (event.slot !== slot || encerrado) return;

      encerrado = true;
      cleanup();

      if (!recompensaConcedida || !recompensaBackendPromise) {
        reject(
          criarErroRewarded(REWARDED_AD_ERRORS.REWARD_NOT_CONFIRMED)
        );
        return;
      }

      try {
        const resultado = await recompensaBackendPromise;
        resolve(resultado);
      } catch (err) {
        reject(err);
      }
    }

    function onRenderEnded(event) {
      if (event.slot !== slot || encerrado) return;

      if (event.isEmpty === true) {
        falhar(REWARDED_AD_ERRORS.NO_INVENTORY);
      }
    }

    try {
      slot = googletag.defineOutOfPageSlot(
        advertisingConfig.rewarded.adUnitPath,
        googletag.enums.OutOfPageFormat.REWARDED
      );

      if (!slot) {
        falhar(REWARDED_AD_ERRORS.SLOT_UNSUPPORTED);
        return;
      }

      slot.addService(pubads);

      pubads.addEventListener('rewardedSlotReady', onReady);
      pubads.addEventListener('rewardedSlotGranted', onGranted);
      pubads.addEventListener('rewardedSlotClosed', onClosed);
      pubads.addEventListener('slotRenderEnded', onRenderEnded);

      googletag.enableServices();
      googletag.display(slot);

      timeoutId = window.setTimeout(() => {
        falhar(REWARDED_AD_ERRORS.NOT_READY);
      }, TEMPO_MAXIMO_CARREGAMENTO_MS);
    } catch (err) {
      falhar(REWARDED_AD_ERRORS.PROVIDER_UNAVAILABLE, err);
    }
  });
}

export async function solicitarRewardedAd({
  featureKey = REWARDED_FEATURE_ORDENS_LITE,
  plano,
  planoResolvido,
}) {
  validarElegibilidade({ featureKey, plano, planoResolvido });

  if (rewardedEmAndamento) {
    throw criarErroRewarded(REWARDED_AD_ERRORS.ALREADY_RUNNING);
  }

  rewardedEmAndamento = true;

  try {
    // O backend cria antes um desafio de uso único. Na Web o Google Ad Manager
    // não oferece server-side verification (SSV); o desafio, a janela curta,
    // a idempotência e o teto semanal reduzem abuso, mas não substituem SSV.
    const tentativa = await iniciarTentativaNoBackend(featureKey);
    const googletag = await carregarGooglePublisherTag();

    return await new Promise((resolve, reject) => {
      googletag.cmd.push(() => {
        exibirSlotRewarded({ googletag, tentativa }).then(resolve, reject);
      });
    });
  } finally {
    rewardedEmAndamento = false;
  }
}
