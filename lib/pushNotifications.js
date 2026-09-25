function endpoint(apiBase, path) {
  return `${String(apiBase || '').replace(/\/$/, '')}${path}`;
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function ambientePush() {
  if (typeof window === 'undefined') return { supported: false };

  const supported = Boolean(
    'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
  );

  const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const standalone = Boolean(
    window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
  );

  return { supported, isiOS, standalone };
}

export async function registrarServiceWorkerPush() {
  const ambiente = ambientePush();
  if (!ambiente.supported) return { ...ambiente, registration: null };

  const registration = await navigator.serviceWorker.register('/sw.js', {
    scope: '/',
  });
  await navigator.serviceWorker.ready;
  return { ...ambiente, registration };
}

async function respostaJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const erro = new Error(data?.erro || 'Não foi possível configurar as notificações.');
    erro.codigo = data?.codigo;
    throw erro;
  }
  return data;
}

async function salvarAssinatura(apiBase, token, subscription) {
  return respostaJson(
    await fetch(endpoint(apiBase, '/push/subscribe'), {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ subscription: subscription.toJSON() }),
    })
  );
}

export async function consultarEstadoPush(apiBase, token) {
  const ambiente = await registrarServiceWorkerPush();
  if (!ambiente.supported || !ambiente.registration) {
    return { ...ambiente, subscribed: false, permission: 'unsupported' };
  }

  const subscription = await ambiente.registration.pushManager.getSubscription();
  if (subscription && token && apiBase) {
    await salvarAssinatura(apiBase, token, subscription).catch(() => null);
  }

  return {
    ...ambiente,
    subscribed: Boolean(subscription),
    permission: Notification.permission,
  };
}

export async function ativarNotificacoesPush(apiBase, token) {
  const ambiente = await registrarServiceWorkerPush();
  if (!ambiente.supported || !ambiente.registration) {
    throw new Error('Este navegador não oferece suporte a notificações push.');
  }

  if (ambiente.isiOS && !ambiente.standalone) {
    throw new Error('No iPhone, abra a TradeSports pelo atalho adicionado à Tela de Início.');
  }

  const config = await respostaJson(
    await fetch(endpoint(apiBase, '/push/config'), {
      headers: authHeaders(token),
    })
  );

  if (!config.configured || !config.publicKey) {
    const erro = new Error('O envio push ainda não foi configurado no servidor.');
    erro.codigo = 'PUSH_NAO_CONFIGURADO';
    throw erro;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(
      permission === 'denied'
        ? 'As notificações estão bloqueadas nas configurações do aparelho.'
        : 'A permissão para notificações não foi concedida.'
    );
  }

  let subscription = await ambiente.registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await ambiente.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.publicKey),
    });
  }

  try {
    await salvarAssinatura(apiBase, token, subscription);
  } catch (err) {
    await subscription.unsubscribe().catch(() => null);
    throw err;
  }

  return { subscribed: true, permission, ...ambiente };
}

export async function enviarPushDeTeste(apiBase, token) {
  return respostaJson(
    await fetch(endpoint(apiBase, '/push/test'), {
      method: 'POST',
      headers: authHeaders(token),
      body: '{}',
    })
  );
}

export async function desvincularPushDoUsuario(apiBase, token) {
  if (
    typeof window === 'undefined' ||
    !apiBase ||
    !token ||
    !('serviceWorker' in navigator)
  ) return;

  const registration = await navigator.serviceWorker.getRegistration('/');
  const subscription = await registration?.pushManager?.getSubscription();
  if (!subscription?.endpoint) return;

  await fetch(endpoint(apiBase, '/push/subscribe'), {
    method: 'DELETE',
    headers: authHeaders(token),
    body: JSON.stringify({ endpoint: subscription.endpoint }),
    keepalive: true,
  }).catch(() => null);
}
