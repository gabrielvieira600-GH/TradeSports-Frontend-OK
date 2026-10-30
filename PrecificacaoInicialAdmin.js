import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || '';
async function request(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.erro || `HTTP ${response.status}`);
  return data;
}
const field = { padding: '10px', borderRadius: 8, background: '#111e32', color: '#fff', border: '1px solid #40506a' };
export default function PrecificacaoInicialAdmin() {
  const [markets, setMarkets] = useState([]);
  const [market, setMarket] = useState('');
  const [clubs, setClubs] = useState([]);
  const [prices, setPrices] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => { request('/api/admin/initial-prices/markets').then(r => {
    setMarkets(r.mercados || []); setMarket(v => v || r.mercados?.[0]?.id || '');
  }).catch(e => setMessage(e.message)); }, []);
  useEffect(() => { if (!market) return; setClubs([]); setPrices({});
    request(`/api/admin/initial-prices/${encodeURIComponent(market)}`).then(r => {
      setClubs(r.clubes || []);
      setPrices(Object.fromEntries((r.clubes || []).map(c => [c.id, String(c.precoInicial)])));
    }).catch(e => setMessage(e.message));
  }, [market]);
  const selected = markets.find(m => m.id === market);
  async function save() {
    if (!selected?.fechado) return setMessage('Feche a liga antes de alterar os preços.');
    const alterados = clubs.filter(c => String(c.precoInicial) !== String(Number(prices[c.id]))).map(c => ({ id: c.id, preco: Number(prices[c.id]) }));
    if (!alterados.length) return setMessage('Nenhuma alteração pendente.');
    if (alterados.some(c => !Number.isFinite(c.preco) || c.preco <= 0 || Math.round(c.preco * 100) !== c.preco * 100)) return setMessage('Informe preços positivos com até duas casas decimais.');
    if (!window.confirm(`Atualizar o preço inicial de ${alterados.length} clube(s) de ${selected.nome}? Essa operação só é permitida antes das negociações.`)) return;
    setBusy(true); setMessage('');
    try {
      const r = await request(`/api/admin/initial-prices/${encodeURIComponent(market)}`, { method: 'PATCH', body: JSON.stringify({ clubes: alterados }) });
      setMessage(`${r.atualizados} preço(s) atualizado(s).`);
      const fresh = await request(`/api/admin/initial-prices/${encodeURIComponent(market)}`);
      setClubs(fresh.clubes || []); setPrices(Object.fromEntries((fresh.clubes || []).map(c => [c.id, String(c.precoInicial)])));
    } catch (e) { setMessage(e.message); } finally { setBusy(false); }
  }
  return <section style={{ padding: 24, margin: '24px 0', border: '1px solid #34445c', borderRadius: 16, background: '#0c192a', color: '#e5e7eb' }}>
    <h2 style={{ marginTop: 0 }}>Precificação inicial dos clubes</h2>
    <p>Defina o preço de abertura das cotas antes do lançamento. O valor de liquidação continua dependendo da classificação final. As negociações passam a determinar o preço de mercado após a abertura.</p>
    <label htmlFor="market-initial-prices">Liga: </label>{' '}
    <select id="market-initial-prices" style={field} value={market} onChange={e => { setMarket(e.target.value); setMessage(''); }}>
      {markets.map(m => <option key={m.id} value={m.id}>{m.nome} — {m.fechado ? 'Fechada' : 'Aberta'}</option>)}
    </select>
    <p style={{ color: selected?.fechado ? '#86efac' : '#fca5a5' }}>{selected?.fechado ? 'Mercado fechado: edição permitida para clubes sem operações.' : 'Mercado aberto: feche-o no controle de mercados antes de editar.'}</p>
    <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr><th style={{ textAlign: 'left' }}>Clube</th><th style={{ textAlign: 'left' }}>Cotas IPO</th><th style={{ textAlign: 'left' }}>Preço inicial (T$)</th><th style={{ textAlign: 'left' }}>Situação</th></tr></thead><tbody>
      {clubs.map(c => <tr key={c.id} style={{ borderTop: '1px solid #34445c' }}><td style={{ padding: 8 }}>{c.nome}</td><td>{c.cotasDisponiveis}</td><td><input type="number" min="0.01" step="0.01" style={{ ...field, width: 115 }} value={prices[c.id] ?? ''} disabled={!selected?.fechado || !c.editavel || busy} onChange={e => setPrices(p => ({ ...p, [c.id]: e.target.value }))}/></td><td style={{ color: c.editavel ? '#86efac' : '#fca5a5' }}>{c.editavel ? 'Disponível' : 'Com operações / cotas emitidas'}</td></tr>)}
    </tbody></table></div>
    {!clubs.length && <p>Nenhum clube encontrado. Atualize primeiro a tabela esportiva da liga.</p>}
    {message && <p role="status">{message}</p>}
    <button type="button" disabled={busy || !selected?.fechado || !clubs.length} onClick={save} style={{ ...field, marginTop: 16, background: '#1d4ed8', cursor: 'pointer' }}>{busy ? 'Salvando...' : 'Salvar preços iniciais'}</button>
  </section>;
}
