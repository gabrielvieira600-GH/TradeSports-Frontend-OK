import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_BASE = 'http://localhost:4001';
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;
const INACTIVITY_TIMEOUT_MS = 2 * 60 * 60 * 1000;
const CHECK_INTERVAL_MS = 30 * 1000;

function nowMs() {
  return Date.now();
}

function getTokenPayload(token) {
  try {
    const payload = token?.split('.')?.[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
}

function clearStoredSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  localStorage.removeItem('saldo');
  localStorage.removeItem('sessionCreatedAt');
  localStorage.removeItem('lastActivityAt');
  localStorage.removeItem('sessionExpiresAt');
}

function getStoredSessionMeta() {
  return {
    sessionCreatedAt: Number(localStorage.getItem('sessionCreatedAt') || 0),
    lastActivityAt: Number(localStorage.getItem('lastActivityAt') || 0),
    sessionExpiresAt: Number(localStorage.getItem('sessionExpiresAt') || 0),
  };
}

function writeSessionMeta(token) {
  const now = nowMs();
  const payload = getTokenPayload(token);
  const jwtExpMs = payload?.exp ? Number(payload.exp) * 1000 : null;

  const absoluteExpiresAt = now + SESSION_MAX_AGE_MS;
  const inactivityExpiresAt = now + INACTIVITY_TIMEOUT_MS;
  const computedExpiresAt = jwtExpMs
    ? Math.min(jwtExpMs, absoluteExpiresAt, inactivityExpiresAt)
    : Math.min(absoluteExpiresAt, inactivityExpiresAt);

  localStorage.setItem('sessionCreatedAt', String(now));
  localStorage.setItem('lastActivityAt', String(now));
  localStorage.setItem('sessionExpiresAt', String(computedExpiresAt));
}

function updateActivity() {
  const token = localStorage.getItem('token');
  if (!token) return;

  const now = nowMs();
  const payload = getTokenPayload(token);
  const jwtExpMs = payload?.exp ? Number(payload.exp) * 1000 : null;
  const absoluteCreatedAt = Number(localStorage.getItem('sessionCreatedAt') || now);
  const absoluteExpiresAt = absoluteCreatedAt + SESSION_MAX_AGE_MS;
  const inactivityExpiresAt = now + INACTIVITY_TIMEOUT_MS;

  const nextExpiresAt = jwtExpMs
    ? Math.min(jwtExpMs, absoluteExpiresAt, inactivityExpiresAt)
    : Math.min(absoluteExpiresAt, inactivityExpiresAt);

  localStorage.setItem('lastActivityAt', String(now));
  localStorage.setItem('sessionExpiresAt', String(nextExpiresAt));
}

function isSessionExpired() {
  const token = localStorage.getItem('token');
  if (!token) return true;

  const payload = getTokenPayload(token);
  const now = nowMs();

  if (payload?.exp && now >= Number(payload.exp) * 1000) {
    return true;
  }

  const { sessionExpiresAt, lastActivityAt } = getStoredSessionMeta();

  if (!sessionExpiresAt || now >= sessionExpiresAt) {
    return true;
  }

  if (lastActivityAt && now - lastActivityAt >= INACTIVITY_TIMEOUT_MS) {
    return true;
  }

  return false;
}

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const dispatchTopbarUpdate = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('force-topbar-update'));
      window.dispatchEvent(new Event('watchlist-updated'));
      window.dispatchEvent(new Event('notifications-updated'));
    }
  };

  const logout = (redirectToLogin = true) => {
    clearStoredSession();
    setToken(null);
    setUsuario(null);
    dispatchTopbarUpdate();

    if (redirectToLogin && typeof window !== 'undefined') {
      const currentPath = window.location.pathname || '';
      if (currentPath !== '/login') {
        window.location.href = '/login';
      }
    }
  };

  const forceLogoutIfExpired = () => {
    if (typeof window === 'undefined') return false;
    if (!localStorage.getItem('token')) return false;
    if (!isSessionExpired()) return false;

    logout(true);
    return true;
  };

  useEffect(() => {
    const tokenSalvo = localStorage.getItem('token');

    if (!tokenSalvo || isSessionExpired()) {
      clearStoredSession();
      setLoading(false);
      return;
    }

    setToken(tokenSalvo);

    axios.get(`${API_BASE}/usuario/atual`, {
      headers: { Authorization: `Bearer ${tokenSalvo}` }
    })
      .then((response) => {
        const usuarioAtual = response.data?.usuario || response.data || null;
        if (!usuarioAtual) {
          logout(false);
          return;
        }

        setUsuario(usuarioAtual);
        localStorage.setItem('usuario', JSON.stringify(usuarioAtual));
        if (typeof usuarioAtual.saldo === 'number') {
          localStorage.setItem('saldo', usuarioAtual.saldo.toFixed(2));
        }
        updateActivity();
        dispatchTopbarUpdate();
      })
      .catch((error) => {
        console.error('[AuthContext] Erro ao buscar usuário atual:', error);
        logout(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const markActivity = () => {
      if (!localStorage.getItem('token')) return;
      if (forceLogoutIfExpired()) return;
      updateActivity();
    };

    const checkSession = () => {
      forceLogoutIfExpired();
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    activityEvents.forEach((evt) => window.addEventListener(evt, markActivity, { passive: true }));
    window.addEventListener('focus', checkSession);
    document.addEventListener('visibilitychange', checkSession);

    intervalRef.current = window.setInterval(checkSession, CHECK_INTERVAL_MS);

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, markActivity));
      window.removeEventListener('focus', checkSession);
      document.removeEventListener('visibilitychange', checkSession);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        const erroTexto = String(error?.response?.data?.erro || '');

        if (
          status === 401 ||
          status === 403 ||
          erroTexto.toLowerCase().includes('token inválido') ||
          erroTexto.toLowerCase().includes('token expirado')
        ) {
          logout(true);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, []);

  const login = (usuarioData, tokenData) => {
    localStorage.setItem('token', tokenData);
    localStorage.setItem('usuario', JSON.stringify(usuarioData));
    if (typeof usuarioData?.saldo === 'number') {
      localStorage.setItem('saldo', usuarioData.saldo.toFixed(2));
    }
    writeSessionMeta(tokenData);

    setToken(tokenData);
    setUsuario(usuarioData);
    dispatchTopbarUpdate();
  };

  const refreshUsuario = async () => {
    try {
      const tokenAtual = localStorage.getItem('token');
      if (!tokenAtual) return null;
      if (forceLogoutIfExpired()) return null;

      const resp = await axios.get(`${API_BASE}/usuario/atual`, {
        headers: { Authorization: `Bearer ${tokenAtual}` }
      });

      const usuarioAtualizado = resp.data?.usuario || resp.data || null;
      if (!usuarioAtualizado) return null;

      setUsuario(usuarioAtualizado);
      localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
      if (typeof usuarioAtualizado.saldo === 'number') {
        localStorage.setItem('saldo', usuarioAtualizado.saldo.toFixed(2));
      }

      updateActivity();
      dispatchTopbarUpdate();

      return usuarioAtualizado;
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      return null;
    }
  };

  const refreshSaldo = async () => {
    try {
      const tokenAtual = localStorage.getItem('token');
      if (!tokenAtual) return null;
      if (forceLogoutIfExpired()) return null;

      const resp = await axios.get(`${API_BASE}/usuario/saldo`, {
        headers: { Authorization: `Bearer ${tokenAtual}` }
      });

      const novoSaldo = Number(resp.data?.saldo || 0);

      setUsuario((prev) => {
        if (!prev) return prev;
        const atualizado = { ...prev, saldo: novoSaldo };
        localStorage.setItem('usuario', JSON.stringify(atualizado));
        localStorage.setItem('saldo', novoSaldo.toFixed(2));
        return atualizado;
      });

      updateActivity();
      dispatchTopbarUpdate();

      return novoSaldo;
    } catch (err) {
      console.error('Erro ao atualizar saldo:', err);
      return null;
    }
  };

  const contextValue = useMemo(() => ({
    usuario,
    setUsuario,
    token,
    setToken,
    login,
    refreshUsuario,
    refreshSaldo,
    logout,
    loading,
    SESSION_MAX_AGE_MS,
    INACTIVITY_TIMEOUT_MS,
  }), [usuario, token, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
