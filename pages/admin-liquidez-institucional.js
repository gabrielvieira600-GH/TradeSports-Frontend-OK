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
  const [savingClub, setSavingClub] = useState(null);
  const [limitDrafts, setLimitDrafts] = useState({});
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const result = await request('/api/admin/liquidez-institucional');
      setData(result);
      setLimitDrafts(Object.fromEntries((result.states || []).map((state) => [
        state.clubLegacyId,
        {
          dailyBuybackPerUser: String(state.dailyBuybackPerUser ?? 0),
          dailyBuybackPerClub: String(state.dailyBuybackPerClub ?? 0),
        },
      ])));
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => { load(); }, []);

  async function action(path, body = {}) {
    setBusy(true); setMessage('');
    try {
      await request(`/api/admin/liquidez-institucional/${path}`, { method: 'POST', body: JSON.stringify(body) });
      setMessage('Operação concluída.'); await load();
    } catch (e) { setMessage(e.message); } finally { setBusy(false); }
  }

  function updateLimitDraft(clubLegacyId, field, value) {
    if (value !== '' && !/^\d+$/.test(value)) return;
    setLimitDrafts((current) => ({
      ...current,
      [clubLegacyId]: {
        ...current[clubLegacyId],
        [field]: value,
      },
    }));
  }

  async function saveClubLimits(club) {
    const draft = limitDrafts[club.clubLegacyId] || {};
    const perUser = Number(draft.dailyBuybackPerUser);
    const perClub = Number(draft.dailyBuybackPerClub);

    setMessage('');
    if (
      draft.dailyBuybackPerUser === '' ||
      draft.dailyBuybackPerClub === '' ||
      !Number.isInteger(perUser) ||
      !Number.isInteger(perClub) ||
      perUser < 0 ||
      perClub < 0
    ) {
      setMessage('Informe limites inteiros iguais ou maiores que zero.');
      return;
    }
    if (perUser > perClub) {
      setMessage('O limite por usuário não pode ser maior que o limite total do clube.');
      return;
    }

    setSavingClub(club.clubLegacyId);
    try {
      const result = await request(
        `/api/admin/liquidez-institucional/clubes/${club.clubLegacyId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            dailyBuybackPerUser: perUser,
            dailyBuybackPerClub: perClub,
          }),
        }
      );
      setData((current) => ({
        ...current,
        states: (current?.states || []).map((state) =>
          state.clubLegacyId === club.clubLegacyId
            ? {
                ...state,
                dailyBuybackPerUser: result.state.dailyBuybackPerUser,
                dailyBuybackPerClub: result.state.dailyBuybackPerClub,
              }
            : state
        ),
      }));
      setLimitDrafts((current) => ({
        ...current,
        [club.clubLegacyId]: {
          dailyBuybackPerUser: String(result.state.dailyBuybackPerUser),
          dailyBuybackPerClub: String(result.state.dailyBuybackPerClub),
        },
      }));
      setMessage(`Limites de ${club.clubName || `clube #${club.clubLegacyId}`} atualizados.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSavingClub(null);
    }
  }

  const exposure = data?.exposure || {};
  return <main style={s.page}>
    <header style={s.header}>
      <div><small style={s.kicker}>OPERAÇÃO INTERNA</small><h1 style={s.h1}>Liquidez institucional</h1>
        <p style={s.muted}>Conta invisível ao público, emissão, recompra, exposição e preços por rodada.</p></div>
      <span style={s.badge}>{data?.marketMode || 'CARREGANDO'}</span>
    </header>
    {message && <div role="status" style={s.notice}>{message}</div>}
    <section style={s.grid}>
      <Card label="Fundo + reserva" value={money(exposure.liquidationFund)} />
      <Card label="Obrigação atual" value={money(exposure.currentObligation)} />
      <Card label="Cenário adverso" value={money(exposure.adverseObligation)} />
      <Card label="Cobertura" value={exposure.coveragePct == null ? '—' : `${(exposure.coveragePct * 100).toFixed(1)}%`} />
    </section>
    <section style={s.card}>
      <h2>Controles</h2><div style={s.actions}>
        <button disabled={busy || savingClub != null} onClick={() => action('inicializar')}>Inicializar mercado</button>
        <button disabled={busy || savingClub != null} onClick={() => action('suspender')}>Suspender durante jogos</button>
        <button disabled={busy || savingClub != null} onClick={() => action('reprecificar')}>Consolidar e reprecificar</button>
        <button disabled={busy || savingClub != null} onClick={() => action('retomar')}>Retomar liquidez</button>
      </div>
    </section>
    <section style={s.card}>
      <div style={s.sectionHeader}>
        <div>
          <h2 style={s.sectionTitle}>Clubes e limites diários</h2>
          <p style={s.muted}>Defina quantas cotas cada conta pode vender para a instituição e o total diário de recompra de cada clube. A alteração passa a valer imediatamente.</p>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}><table style={s.table}>
      <thead><tr><th>Clube</th><th>Emitidas</th><th>Referência</th><th>Compra</th><th>Limite por usuário</th><th>Limite do clube</th><th>Status</th><th>Ação</th></tr></thead>
      <tbody>{(data?.states || []).map((x) => <tr key={x.clubLegacyId}>
        <td><strong>{x.clubName || `Clube #${x.clubLegacyId}`}</strong><small style={s.clubId}>ID #{x.clubLegacyId}</small></td>
        <td>{x.issuedShares} / {x.maxShares}</td>
        <td>{money(x.basePositionValue)}</td><td>{money(x.institutionalBid)}</td>
        <td><input type="number" aria-label={`Limite por usuário de ${x.clubName || x.clubLegacyId}`} inputMode="numeric" min="0" step="1" style={s.numberInput} value={limitDrafts[x.clubLegacyId]?.dailyBuybackPerUser ?? ''} onChange={(event) => updateLimitDraft(x.clubLegacyId, 'dailyBuybackPerUser', event.target.value)} /></td>
        <td><input type="number" aria-label={`Limite total de ${x.clubName || x.clubLegacyId}`} inputMode="numeric" min="0" step="1" style={s.numberInput} value={limitDrafts[x.clubLegacyId]?.dailyBuybackPerClub ?? ''} onChange={(event) => updateLimitDraft(x.clubLegacyId, 'dailyBuybackPerClub', event.target.value)} /></td>
        <td>{x.institutionalSuspended ? 'Suspensa' : x.issuanceSuspended ? 'Emissão suspensa' : 'Ativa'}</td>
        <td><button style={s.saveButton} disabled={savingClub === x.clubLegacyId || busy} onClick={() => saveClubLimits(x)}>{savingClub === x.clubLegacyId ? 'Salvando...' : 'Salvar limites'}</button></td>
      </tr>)}</tbody>
      {!data && <tbody><tr><td colSpan="8" style={s.empty}>Carregando clubes...</td></tr></tbody>}
      {data && (data.states || []).length === 0 && <tbody><tr><td colSpan="8" style={s.empty}>Nenhum clube com liquidez institucional foi encontrado.</td></tr></tbody>}
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
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 18 },
  sectionTitle: { margin: '0 0 6px' },
  actions: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px', textAlign: 'left' },
  clubId: { display: 'block', marginTop: 4, color: '#64748b' },
  numberInput: { width: 105, padding: '9px 10px', border: '1px solid #29445f', borderRadius: 8, background: '#07111f', color: '#eef5ff', fontSize: 15 },
  saveButton: { whiteSpace: 'nowrap', padding: '9px 12px', border: 0, borderRadius: 8, background: '#16a36a', color: '#fff', fontWeight: 700, cursor: 'pointer' },
  empty: { padding: 24, textAlign: 'center', color: '#94a3b8' },
};
