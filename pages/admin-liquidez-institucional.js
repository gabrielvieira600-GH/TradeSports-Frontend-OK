import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;
const money = (v) => `T$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

async function request(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.erro || 'Falha na operação.');
  return data;
}

export default function AdminLiquidezInstitucional() {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const load = () => request('/api/admin/liquidez-institucional').then(setData).catch((e) => setMessage(e.message));
  useEffect(() => { load(); }, []);

  async function action(path, body = {}) {
    setBusy(true); setMessage('');
    try {
      await request(`/api/admin/liquidez-institucional/${path}`, { method: 'POST', body: JSON.stringify(body) });
      setMessage('Operação concluída.'); await load();
    } catch (e) { setMessage(e.message); } finally { setBusy(false); }
  }

  const exposure = data?.exposure || {};
  return <main style={s.page}>
    <header style={s.header}>
      <div><small style={s.kicker}>OPERAÇÃO INTERNA</small><h1 style={s.h1}>Liquidez institucional</h1>
        <p style={s.muted}>Conta invisível ao público, emissão, recompra, exposição e preços por rodada.</p></div>
      <span style={s.badge}>{data?.marketMode || 'CARREGANDO'}</span>
    </header>
    {message && <div style={s.notice}>{message}</div>}
    <section style={s.grid}>
      <Card label="Fundo + reserva" value={money(exposure.liquidationFund)} />
      <Card label="Obrigação atual" value={money(exposure.currentObligation)} />
      <Card label="Cenário adverso" value={money(exposure.adverseObligation)} />
      <Card label="Cobertura" value={exposure.coveragePct == null ? '—' : `${(exposure.coveragePct * 100).toFixed(1)}%`} />
    </section>
    <section style={s.card}>
      <h2>Controles</h2><div style={s.actions}>
        <button disabled={busy} onClick={() => action('inicializar')}>Inicializar mercado</button>
        <button disabled={busy} onClick={() => action('suspender')}>Suspender durante jogos</button>
        <button disabled={busy} onClick={() => action('reprecificar')}>Consolidar e reprecificar</button>
        <button disabled={busy} onClick={() => action('retomar')}>Retomar liquidez</button>
      </div>
    </section>
    <section style={s.card}><h2>Clubes</h2><div style={{ overflowX: 'auto' }}><table style={s.table}>
      <thead><tr><th>Clube</th><th>Emitidas</th><th>Em estoque</th><th>Referência</th><th>Compra</th><th>Venda</th><th>Distribuído</th><th>Recomprado</th><th>Status</th></tr></thead>
      <tbody>{(data?.states || []).map((x) => <tr key={x.clubLegacyId}>
        <td>#{x.clubLegacyId}</td><td>{x.issuedShares} / {x.maxShares}</td><td>{x.institutionHeldIssuedShares}</td>
        <td>{money(x.basePositionValue)}</td><td>{money(x.institutionalBid)}</td><td>{money(x.institutionalAsk)}</td>
        <td>{money(x.distributionGross)}</td><td>{money(x.buybackGross)}</td>
        <td>{x.institutionalSuspended ? 'Suspensa' : x.issuanceSuspended ? 'Emissão suspensa' : 'Ativa'}</td>
      </tr>)}</tbody>
    </table></div></section>
  </main>;
}

function Card({ label, value }) { return <div style={s.metric}><span style={s.muted}>{label}</span><strong style={s.value}>{value}</strong></div>; }
const s = {
  page: { minHeight: '100vh', padding: '32px', color: '#eef5ff', background: '#07111f', fontFamily: 'Inter, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'center', marginBottom: 24 },
  kicker: { color: '#36e59b', letterSpacing: 2 }, h1: { margin: '6px 0', fontSize: 36 }, muted: { color: '#94a3b8' },
  badge: { padding: '10px 14px', border: '1px solid #36e59b55', borderRadius: 999, color: '#36e59b' },
  notice: { marginBottom: 16, padding: 12, background: '#102238', borderRadius: 10 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14, marginBottom: 18 },
  metric: { padding: 18, background: '#0d1b2d', border: '1px solid #1d334b', borderRadius: 14, display: 'grid', gap: 10 },
  value: { fontSize: 24 }, card: { marginTop: 18, padding: 20, background: '#0d1b2d', border: '1px solid #1d334b', borderRadius: 14 },
  actions: { display: 'flex', gap: 10, flexWrap: 'wrap' }, table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
};
