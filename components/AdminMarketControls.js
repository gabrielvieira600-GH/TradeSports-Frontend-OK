import { useEffect, useMemo, useState } from 'react';
import mercados from '../Data/mercados';

const apiBase = process.env.NEXT_PUBLIC_API_URL;

async function adminFetch(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const response = await fetch(`${apiBase}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.erro || `Falha HTTP ${response.status}`);
  return data;
}

export default function AdminMarketControls({ onMessage }) {
  const [states, setStates] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lista = useMemo(() => Object.values(mercados), []);

  async function carregar() {
    try {
      const data = await adminFetch('/api/admin/market-controls');
      const next = {};
      (data.mercados || []).forEach((item) => { next[item.id] = Boolean(item.fechado); });
      setStates(next);
      setError('');
    } catch (e) {
      setError(e.message || 'Não foi possível carregar os estados das ligas.');
    }
  }

  useEffect(() => { carregar(); }, []);

  async function alterarLiga(mercado) {
    const fechado = !states[mercado.id];
    setBusy(true);
    try {
      await adminFetch(`/api/admin/market-controls/${encodeURIComponent(mercado.id)}`, {
        method: 'PATCH', body: { fechado },
      });
      setStates((atual) => ({ ...atual, [mercado.id]: fechado }));
      setError('');
      onMessage?.(`${mercado.nome}: ${fechado ? 'mercado fechado' : 'negociações abertas'}.`, 'success');
    } catch (e) {
      setError(e.message || 'Não foi possível atualizar esta liga.');
    } finally { setBusy(false); }
  }

  async function alterarTodas(fechado) {
    setBusy(true);
    try {
      await adminFetch('/api/admin/market-controls/batch', { method: 'POST', body: { fechado } });
      setStates(Object.fromEntries(lista.map((item) => [item.id, fechado])));
      setError('');
      onMessage?.(fechado ? 'Negociações fechadas em todas as ligas.' : 'Negociações abertas em todas as ligas.', 'success');
    } catch (e) {
      setError(e.message || 'Não foi possível atualizar todas as ligas.');
    } finally { setBusy(false); }
  }

  const todasFechadas = lista.length > 0 && lista.every((item) => states[item.id]);
  const algumaFechada = lista.some((item) => states[item.id]);
  return (
    <section style={styles.panel} aria-labelledby="market-controls-title">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Controle de negociação</div>
          <h2 id="market-controls-title" style={styles.title}>Abertura dos mercados</h2>
          <p style={styles.description}>Ao fechar uma liga, os usuários não poderão enviar ordens nem comprar cotas do IPO.</p>
        </div>
        <div style={styles.actions}>
          <button disabled={busy || todasFechadas} onClick={() => alterarTodas(true)} style={styles.closeAll}>Fechar todas</button>
          <button disabled={busy || !algumaFechada} onClick={() => alterarTodas(false)} style={styles.openAll}>Abrir todas</button>
        </div>
      </div>
      {error && <div role="alert" style={styles.error}>{error}</div>}
      <div style={styles.grid}>
        {lista.map((mercado) => {
          const fechado = Boolean(states[mercado.id]);
          return (
            <div key={mercado.id} style={styles.row}>
              <span style={styles.name}>{mercado.nome}</span>
              <span style={{ ...styles.badge, ...(fechado ? styles.closed : styles.open) }}>{fechado ? 'Fechado' : 'Aberto'}</span>
              <button disabled={busy} onClick={() => alterarLiga(mercado)} style={fechado ? styles.openAll : styles.closeAll}>
                {fechado ? 'Abrir' : 'Fechar'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const styles = {
  panel: { margin: '18px 0 22px', padding: 18, border: '1px solid #26364b', borderRadius: 16, background: 'linear-gradient(145deg,#101d30,#0b1727)', color: '#e2e8f0' },
  header: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 16 },
  eyebrow: { color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '.08em', fontSize: '.68rem', fontWeight: 800 },
  title: { margin: '5px 0', fontSize: '1.1rem' },
  description: { margin: 0, color: '#94a3b8', fontSize: '.78rem' },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 8 },
  row: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto auto', alignItems: 'center', gap: 9, padding: '9px 10px', border: '1px solid rgba(148,163,184,.12)', borderRadius: 10, background: 'rgba(2,6,23,.3)' },
  name: { fontSize: '.78rem', fontWeight: 700 },
  badge: { padding: '4px 7px', borderRadius: 20, fontSize: '.66rem', fontWeight: 800 },
  open: { color: '#86efac', background: 'rgba(34,197,94,.12)' },
  closed: { color: '#fca5a5', background: 'rgba(239,68,68,.13)' },
  closeAll: { border: 0, borderRadius: 8, padding: '8px 10px', background: '#b91c1c', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '.72rem' },
  openAll: { border: 0, borderRadius: 8, padding: '8px 10px', background: '#15803d', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '.72rem' },
  error: { margin: '0 0 12px', color: '#fca5a5', fontSize: '.78rem' },
};
