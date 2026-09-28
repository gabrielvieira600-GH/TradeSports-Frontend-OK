import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
let refreshEmAndamento = null;

export function tokenExpirado(token, margemSegundos = 30) {
  if (!token) return true;
  try {
    const payload = token.split('.')[1];
    const normalizado = payload.replace(/-/g, '+').replace(/_/g, '/');
    const dados = JSON.parse(window.atob(normalizado));
    if (!dados?.exp) return false;
    return Date.now() >= (Number(dados.exp) * 1000) - (margemSegundos * 1000);
  } catch {
    return true;
  }
}

export function salvarCredenciais(token, refreshToken) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('token', token);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  window.dispatchEvent(new Event('auth-token-updated'));
}

export function limparCredenciais() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('usuario');
  localStorage.removeItem('saldo');
  localStorage.removeItem('sessionCreatedAt');
  localStorage.removeItem('lastActivityAt');
  localStorage.removeItem('sessionExpiresAt');
  window.dispatchEvent(new Event('auth-token-updated'));
}

export async function renovarTokenAcesso() {
  if (typeof window === 'undefined' || !API_BASE) return null;
  if (refreshEmAndamento) return refreshEmAndamento;

  const executarRenovacao = async () => {
    const tokenAtual = localStorage.getItem('token');
    if (tokenAtual && !tokenExpirado(tokenAtual)) return tokenAtual;
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;
    let response;
    try {
      response = await fetch(`${API_BASE.replace(/\/$/, '')}/api/session/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (erro) {
      erro.sessaoTemporariamenteIndisponivel = true;
      throw erro;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.token || !data?.refreshToken) {
      if (response.status === 401 || response.status === 403) limparCredenciais();
      const erro = new Error(data?.erro || 'Não foi possível renovar a sessão.');
      erro.status = response.status;
      throw erro;
    }

    salvarCredenciais(data.token, data.refreshToken);
    return data.token;
  };

  const tarefa = navigator.locks?.request
    ? navigator.locks.request('tradesports-session-refresh', executarRenovacao)
    : executarRenovacao();

  refreshEmAndamento = tarefa.finally(() => {
    refreshEmAndamento = null;
  });

  return refreshEmAndamento;
}

export async function obterTokenAcessoValido() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  if (token && !tokenExpirado(token)) {
    if (localStorage.getItem('refreshToken')) return token;
    let response;
    try {
      response = await fetch(`${API_BASE.replace(/\/$/, '')}/api/session/adopt`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (erro) {
      erro.sessaoTemporariamenteIndisponivel = true;
      throw erro;
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.token || !data?.refreshToken) {
      const erro = new Error(data?.erro || 'Não foi possível tornar a sessão persistente.');
      erro.status = response.status;
      throw erro;
    }
    salvarCredenciais(data.token, data.refreshToken);
    return data.token;
  }
  return renovarTokenAcesso();
}

export async function encerrarSessaoRemota() {
  if (typeof window === 'undefined' || !API_BASE) return;
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return;
  await fetch(`${API_BASE.replace(/\/$/, '')}/api/session/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    keepalive: true,
  }).catch(() => null);
}

if (typeof window !== 'undefined' && !window.__tradeSportsAuthInterceptor) {
  window.__tradeSportsAuthInterceptor = true;
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error?.config || {};
      const url = String(original.url || '');
      const podeRenovar = error?.response?.status === 401 &&
        !original._authRetry &&
        !url.includes('/api/login') &&
        !url.includes('/api/session/');

      if (!podeRenovar) return Promise.reject(error);

      original._authRetry = true;
      try {
        const novoToken = await renovarTokenAcesso();
        if (!novoToken) {
          limparCredenciais();
          return Promise.reject(error);
        }
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${novoToken}`;
        return axios(original);
      } catch (refreshError) {
        if (!refreshError?.sessaoTemporariamenteIndisponivel) limparCredenciais();
        return Promise.reject(error);
      }
    }
  );
}
