import { useEffect, useState } from 'react';
import AdminPainel from './admin-painel';

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL
}

function getToken() {
  if (typeof window === 'undefined') return null;
  const t = localStorage.getItem('token');
  return t && t !== 'undefined' ? t : null;
}

async function validarAdmin() {
  const token = getToken();
  if (!token) {
    throw new Error('Token não encontrado.');
  }

  const resp = await fetch(`${getApiBase()}/api/admin/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    throw new Error(data?.erro || data?.message || 'Acesso negado.');
  }

  return data;
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    async function init() {
      try {
        setLoading(true);
        setErro('');
        await validarAdmin();

        if (!ativo) return;
        setAutorizado(true);
      } catch (e) {
        if (!ativo) return;
        setAutorizado(false);
        setErro(e.message || 'Você não tem acesso ao painel administrativo.');
      } finally {
        if (ativo) setLoading(false);
      }
    }

    init();

    return () => {
      ativo = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 32, maxWidth: 900, margin: '0 auto', color: '#f8fafc' }}>
        <h1 style={{ marginBottom: 8 }}>Painel Admin</h1>
        <p style={{ color: '#94a3b8' }}>Validando acesso...</p>
      </div>
    );
  }

  if (!autorizado) {
    return (
      <div style={{ padding: 32, maxWidth: 760, margin: '0 auto', color: '#f8fafc' }}>
        <h1 style={{ marginBottom: 12 }}>Acesso restrito</h1>
        <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>
          Você não possui permissão para acessar o painel administrativo.
        </p>

        {erro ? (
          <div
            style={{
              marginTop: 18,
              padding: 14,
              borderRadius: 12,
              background: 'rgba(239,68,68,0.10)',
              border: '1px solid rgba(239,68,68,0.18)',
              color: '#fecaca',
            }}
          >
            {erro}
          </div>
        ) : null}

        <div style={{ marginTop: 18 }}>
          <a href="/" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
            Voltar para a plataforma
          </a>
        </div>
      </div>
    );
  }

  return <AdminPainel />;
}