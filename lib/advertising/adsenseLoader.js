const SCRIPT_ID = 'tradesports-google-adsense';

let carregamentoEmAndamento = null;

export function carregarAdSenseUmaVez(clientId) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('ADSENSE_FORA_DO_NAVEGADOR'));
  }

  if (window.adsbygoogle?.loaded) {
    return Promise.resolve();
  }

  if (carregamentoEmAndamento) return carregamentoEmAndamento;

  carregamentoEmAndamento = new Promise((resolve, reject) => {
    const scriptExistente =
      document.getElementById(SCRIPT_ID) ||
      document.querySelector(
        'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'
      );

    const concluir = () => {
      if (scriptExistente) scriptExistente.dataset.loaded = 'true';
      resolve();
    };

    const falhar = () => {
      carregamentoEmAndamento = null;
      reject(new Error('ADSENSE_SCRIPT_NAO_CARREGADO'));
    };

    if (scriptExistente) {
      if (
        scriptExistente.dataset.loaded === 'true' ||
        window.adsbygoogle?.loaded
      ) {
        resolve();
        return;
      }

      scriptExistente.addEventListener('load', concluir, { once: true });
      scriptExistente.addEventListener('error', falhar, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src =
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js' +
      `?client=${encodeURIComponent(clientId)}`;

    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolve();
      },
      { once: true }
    );
    script.addEventListener('error', falhar, { once: true });

    document.head.appendChild(script);
  });

  return carregamentoEmAndamento;
}
