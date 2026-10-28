import { createContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { desvincularPushDoUsuario } from '../lib/pushNotifications';
import {
  encerrarSessaoRemota,
  limparCredenciais,
  obterTokenAcessoValido,
  salvarCredenciais,
} from '../lib/authSession';

export const AuthContext = createContext();
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function lerUsuarioLocal() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('usuario') || 'null');
  } catch {
    return null;
  }
}

function lerTokenLocal() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function credencialFoiRecusada(error) {
  const status = Number(error?.status || error?.response?.status || 0);
  return status === 401 || status === 403;
}

export const AuthProvider = ({ children }) => {
  // A sessão em cache é carregada no primeiro render. A confirmação no servidor
  // acontece em segundo plano e nunca bloqueia a abertura do site/PWA.
  const [usuario, setUsuario] = useState(lerUsuarioLocal);
  const [token, setToken] = useState(lerTokenLocal);
  const loading = false;

  const dispatchTopbarUpdate = () => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('force-topbar-update'));
    window.dispatchEvent(new Event('watchlist-updated'));
    window.dispatchEvent(new Event('notifications-updated'));
  };

  const finalizarLogoutLocal = (redirectToLogin = true) => {
    limparCredenciais();
    setToken(null);
    setUsuario(null);
    dispatchTopbarUpdate();
    if (redirectToLogin && typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  };

  const logout = async (redirectToLogin = true) => {
    const tokenAtual = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (tokenAtual && API_BASE) {
      await desvincularPushDoUsuario(API_BASE, tokenAtual).catch(() => null);
    }
    await encerrarSessaoRemota();
    finalizarLogoutLocal(redirectToLogin);
  };

  useEffect(() => {
    let ativo = true;

    const restaurarSessao = async () => {
      const possuiCredenciais = Boolean(
        localStorage.getItem('token') || localStorage.getItem('refreshToken')
      );

      if (!possuiCredenciais) {
        if (localStorage.getItem('usuario')) finalizarLogoutLocal(false);
        return;
      }

      try {
        const tokenValido = await obterTokenAcessoValido();
        if (!tokenValido) {
          if (!localStorage.getItem('refreshToken')) finalizarLogoutLocal(false);
          return;
        }
        if (ativo) setToken(tokenValido);

        const response = await axios.get(`${API_BASE}/usuario/atual`, {
          headers: { Authorization: `Bearer ${tokenValido}` },
        });
        const usuarioAtual = response.data?.usuario || response.data || null;
        if (!usuarioAtual) return;

        if (ativo) setUsuario(usuarioAtual);
        localStorage.setItem('usuario', JSON.stringify(usuarioAtual));
        if (typeof usuarioAtual.saldo === 'number') {
          localStorage.setItem('saldo', usuarioAtual.saldo.toFixed(2));
        }
        dispatchTopbarUpdate();
      } catch (error) {
        // Falhas de rede e indisponibilidade temporária do backend não devem
        // desconectar nem esconder a interface que já está disponível em cache.
        if (credencialFoiRecusada(error)) {
          finalizarLogoutLocal(false);
        } else {
          console.warn('[AuthContext] Sincronização da sessão adiada:', error);
        }
      }
    };

    const atualizarCredenciaisLocais = () => {
      if (!ativo) return;
      setToken(localStorage.getItem('token'));
      setUsuario(lerUsuarioLocal());
    };

    const sincronizarAbas = (event) => {
      if (event.key && !['token', 'refreshToken', 'usuario'].includes(event.key)) return;
      atualizarCredenciaisLocais();
    };

    window.addEventListener('auth-token-updated', atualizarCredenciaisLocais);
    window.addEventListener('storage', sincronizarAbas);
    restaurarSessao();

    return () => {
      ativo = false;
      window.removeEventListener('auth-token-updated', atualizarCredenciaisLocais);
      window.removeEventListener('storage', sincronizarAbas);
    };
  }, []);

  const login = (usuarioData, tokenData, refreshTokenData) => {
    salvarCredenciais(tokenData, refreshTokenData);
    localStorage.setItem('usuario', JSON.stringify(usuarioData));
    if (typeof usuarioData?.saldo === 'number') {
      localStorage.setItem('saldo', usuarioData.saldo.toFixed(2));
    }
    setToken(tokenData);
    setUsuario(usuarioData);
    dispatchTopbarUpdate();
  };

  const refreshUsuario = async () => {
    try {
      const tokenAtual = await obterTokenAcessoValido();
      if (!tokenAtual) return null;
      const resp = await axios.get(`${API_BASE}/usuario/atual`, {
        headers: { Authorization: `Bearer ${tokenAtual}` },
      });
      const usuarioAtualizado = resp.data?.usuario || resp.data || null;
      if (!usuarioAtualizado) return null;
      setUsuario(usuarioAtualizado);
      localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
      if (typeof usuarioAtualizado.saldo === 'number') {
        localStorage.setItem('saldo', usuarioAtualizado.saldo.toFixed(2));
      }
      dispatchTopbarUpdate();
      return usuarioAtualizado;
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      return null;
    }
  };

  const refreshSaldo = async () => {
    try {
      const tokenAtual = await obterTokenAcessoValido();
      if (!tokenAtual) return null;
      const resp = await axios.get(`${API_BASE}/usuario/saldo`, {
        headers: { Authorization: `Bearer ${tokenAtual}` },
      });
      const novoSaldo = Number(resp.data?.saldo || 0);
      setUsuario((anterior) => {
        if (!anterior) return anterior;
        const atualizado = { ...anterior, saldo: novoSaldo };
        localStorage.setItem('usuario', JSON.stringify(atualizado));
        localStorage.setItem('saldo', novoSaldo.toFixed(2));
        return atualizado;
      });
      dispatchTopbarUpdate();
      return novoSaldo;
    } catch (err) {
      console.error('Erro ao atualizar saldo:', err);
      return null;
    }
  };

  useEffect(() => {
    const sincronizarUsuario = () => {
      try {
        const armazenado = localStorage.getItem('usuario');
        if (!armazenado) return;
        const novoUsuario = JSON.parse(armazenado);
        if (novoUsuario && typeof novoUsuario === 'object') setUsuario(novoUsuario);
      } catch (err) {
        console.error('[TradeSports] Erro ao sincronizar usuario:', err);
      }
    };
    window.addEventListener('tradesports-usuario-atualizado', sincronizarUsuario);
    return () => window.removeEventListener('tradesports-usuario-atualizado', sincronizarUsuario);
  }, []);

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
  }), [usuario, token, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
