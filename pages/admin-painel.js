import { useEffect, useMemo, useState } from 'react';

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
}

function getToken() {
  const t = localStorage.getItem('token');
  return t && t !== 'undefined' ? t : null;
}

async function apiFetch(path, { method = 'GET', body } = {}) {
  const base = getApiBase();
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const resp = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const msg = data?.erro || data?.message || `HTTP ${resp.status}`;
    throw new Error(msg);
  }

  return data;
}

export default function AdminPainel() {
  const [status, setStatus] = useState(null);
  const [rodada, setRodada] = useState('');
  const [temporada, setTemporada] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('info');

  const [clubes, setClubes] = useState([]);
  const [clubeIdSplit, setClubeIdSplit] = useState('');
  const [ratioSplit, setRatioSplit] = useState('2');

  const base = useMemo(() => getApiBase(), []);

  async function carregarStatus() {
    setLoading(true);
    setMsg('');
    try {
      const s = await apiFetch('/api/admin/status');
      setStatus(s);
      setMsg('Status carregado com sucesso.');
      setMsgType('success');
    } catch (e) {
      setMsg(`Erro: ${e.message}`);
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  }

  async function carregarClubes() {
    try {
      const data = await apiFetch('/clube/clubes');
      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data?.clubes)
          ? data.clubes
          : [];

      setClubes(lista);

      if (!clubeIdSplit && lista.length > 0) {
        setClubeIdSplit(String(lista[0].id));
      }
    } catch (e) {
      console.error('Erro ao carregar clubes:', e);
    }
  }

  async function resetTemporada() {
    setLoading(true);
    setMsg('');

    try {
      const body = {};
      if (temporada !== '') body.temporada = Number(temporada);
      body.rodadaAtual = 0;

      await apiFetch('/admin/temporada/reset', {
        method: 'POST',
        body,
      });

      setMsg('Temporada resetada com sucesso.');
      setMsgType('success');
      await carregarStatus();
    } catch (e) {
      setMsg(`Erro: ${e.message}`);
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  }

  async function dispararDividendos() {
    setLoading(true);
    setMsg('');

    try {
      const body = {};
      if (rodada !== '') body.rodada = Number(rodada);

      const r = await apiFetch('/api/admin/dividendos/disparar', {
        method: 'POST',
        body,
      });

      setMsg(`Dividendos disparados com sucesso. Pagos: ${r.pagos} | Rodada: ${r.rodada}`);
      setMsgType('success');
      await carregarStatus();
    } catch (e) {
      setMsg(`Erro: ${e.message}`);
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  }

  async function dispararLiquidacao() {
    setLoading(true);
    setMsg('');

    try {
      const r = await apiFetch('/api/admin/liquidacao/disparar', {
        method: 'POST',
      });

      setMsg(r.mensagem || 'Liquidação disparada com sucesso.');
      setMsgType('success');
      await carregarStatus();
    } catch (e) {
      setMsg(`Erro: ${e.message}`);
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  }

  async function executarSplit() {
    setLoading(true);
    setMsg('');

    try {
      const clubeId = Number(clubeIdSplit);
      const ratio = Number(ratioSplit);

      if (!clubeId || !ratio || ratio <= 1) {
        throw new Error('Selecione um clube e um fator de split válido.');
      }

      const clubeSelecionado = clubes.find((c) => String(c.id) === String(clubeId));

      const confirmado = window.confirm(
        `Confirma executar split ${ratio}:1 em ${clubeSelecionado?.nome || `clube ${clubeId}`}?\n\n` +
        `Isso irá ajustar preço, ordens abertas, carteiras e histórico desse clube.`
      );

      if (!confirmado) {
        setMsg('Operação cancelada.');
        setMsgType('info');
        return;
      }

      const r = await apiFetch('/api/admin/split', {
        method: 'POST',
        body: { clubeId, ratio },
      });

      setMsg(
        r?.mensagem ||
        `Split ${ratio}:1 executado com sucesso para o clube ${clubeSelecionado?.nome || clubeId}.`
      );
      setMsgType('success');

      await Promise.all([carregarStatus(), carregarClubes()]);
    } catch (e) {
      setMsg(`Erro: ${e.message}`);
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarStatus();
    carregarClubes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = status?.counts || {};

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div>
          <div style={styles.kicker}>Painel administrativo</div>
          <h1 style={styles.title}>Controle do TradeSports</h1>
          <p style={styles.subtitle}>
            Gerencie temporada, dividendos, liquidação e split de cotas em um único lugar.
          </p>
        </div>

        <div style={styles.apiBadge}>
          <span style={styles.apiLabel}>API</span>
          <span>{base}</span>
        </div>
      </div>

      <div style={styles.metricsGrid}>
        <MetricCard title="Usuários" value={counts.usuarios ?? 0} />
        <MetricCard title="Clubes" value={counts.clubes ?? 0} />
        <MetricCard title="Investimentos" value={counts.investimentos ?? 0} />
        <MetricCard title="Ordens" value={counts.ordens ?? 0} />
      </div>

      {msg ? (
        <div
          style={{
            ...styles.alert,
            ...(msgType === 'success'
              ? styles.alertSuccess
              : msgType === 'error'
                ? styles.alertError
                : styles.alertInfo),
          }}
        >
          {msg}
        </div>
      ) : null}

      <div style={styles.grid}>
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Ações rápidas</h2>
              <p style={styles.cardText}>
                Comandos principais para gestão operacional da plataforma.
              </p>
            </div>
          </div>

          <div style={styles.actionGrid}>
            <button style={styles.primaryButton} onClick={carregarStatus} disabled={loading}>
              Recarregar status
            </button>

            <button style={styles.secondaryButton} onClick={dispararDividendos} disabled={loading}>
              Disparar dividendos
            </button>

            <button style={styles.secondaryButton} onClick={dispararLiquidacao} disabled={loading}>
              Disparar liquidação
            </button>

            <button style={styles.dangerButton} onClick={resetTemporada} disabled={loading}>
              Reset temporada
            </button>
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Parâmetros operacionais</h2>
              <p style={styles.cardText}>
                Configure rodada para dividendos e temporada para reset.
              </p>
            </div>
          </div>

          <div style={styles.formGrid}>
            <Field
              label="Rodada para dividendos"
              value={rodada}
              onChange={setRodada}
              placeholder="Ex: 12"
            />

            <Field
              label="Temporada para reset"
              value={temporada}
              onChange={setTemporada}
              placeholder="Ex: 2026"
            />
          </div>
        </section>

        <section style={{ ...styles.card, gridColumn: '1 / -1' }}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Split de cotas</h2>
              <p style={styles.cardText}>
                Ajuste manualmente a quantidade e o preço de um clube sem alterar o patrimônio total.
              </p>
            </div>
          </div>

          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>Clube</label>
              <select
                value={clubeIdSplit}
                onChange={(e) => setClubeIdSplit(e.target.value)}
                disabled={loading}
                style={styles.select}
              >
                {clubes.map((clube) => (
                  <option key={clube.id} value={clube.id}>
                    {clube.nome} (ID {clube.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>Fator do split</label>
              <select
                value={ratioSplit}
                onChange={(e) => setRatioSplit(e.target.value)}
                disabled={loading}
                style={styles.select}
              >
                <option value="2">2:1</option>
                <option value="3">3:1</option>
                <option value="4">4:1</option>
                <option value="5">5:1</option>
                <option value="10">10:1</option>
              </select>
            </div>

            <div style={styles.splitActionWrap}>
              <button
                style={styles.primaryButton}
                onClick={executarSplit}
                disabled={loading || !clubeIdSplit}
              >
                Executar split
              </button>
            </div>
          </div>
        </section>

        <section style={{ ...styles.card, gridColumn: '1 / -1' }}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Status do sistema</h2>
              <p style={styles.cardText}>
                Resumo técnico da operação e retorno atual da API administrativa.
              </p>
            </div>
          </div>

          <div style={styles.statusBox}>
            <pre style={styles.pre}>
              {status ? JSON.stringify(status, null, 2) : 'Carregando...'}
            </pre>
          </div>
        </section>
      </div>

      <p style={styles.footerNote}>
        Acesso protegido por token de administrador. Se aparecer erro 403, o usuário logado não está com permissão de admin.
      </p>
    </div>
  );
}

function MetricCard({ title, value }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricTitle}>{title}</div>
      <div style={styles.metricValue}>{value}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  );
}

const styles = {
  page: {
    padding: '28px',
    maxWidth: '1180px',
    margin: '0 auto',
    color: '#f8fafc',
  },

  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
    flexWrap: 'wrap',
    marginBottom: '24px',
  },

  kicker: {
    fontSize: '0.78rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#00ff95',
    marginBottom: '8px',
  },

  title: {
    margin: 0,
    fontSize: '2rem',
    lineHeight: 1.05,
  },

  subtitle: {
    marginTop: '10px',
    marginBottom: 0,
    color: '#94a3b8',
    maxWidth: '680px',
    lineHeight: 1.6,
  },

  apiBadge: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '14px 16px',
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(148,163,184,0.14)',
    minWidth: '220px',
  },

  apiLabel: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
    marginBottom: '18px',
  },

  metricCard: {
    borderRadius: '18px',
    padding: '16px 18px',
    background: 'linear-gradient(180deg, rgba(15,23,42,0.96), rgba(11,19,36,0.96))',
    border: '1px solid rgba(148,163,184,0.12)',
    boxShadow: '0 14px 34px rgba(0,0,0,0.18)',
  },

  metricTitle: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginBottom: '8px',
  },

  metricValue: {
    fontSize: '1.65rem',
    fontWeight: 900,
    color: '#f8fafc',
  },

  alert: {
    padding: '14px 16px',
    borderRadius: '14px',
    marginBottom: '18px',
    fontWeight: 600,
  },

  alertSuccess: {
    background: 'rgba(34,197,94,0.12)',
    border: '1px solid rgba(34,197,94,0.22)',
    color: '#bbf7d0',
  },

  alertError: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.22)',
    color: '#fecaca',
  },

  alertInfo: {
    background: 'rgba(59,130,246,0.12)',
    border: '1px solid rgba(59,130,246,0.22)',
    color: '#dbeafe',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '18px',
  },

  card: {
    borderRadius: '20px',
    padding: '20px',
    background: 'linear-gradient(180deg, rgba(15,23,42,0.96), rgba(11,19,36,0.96))',
    border: '1px solid rgba(148,163,184,0.12)',
    boxShadow: '0 18px 42px rgba(0,0,0,0.20)',
  },

  cardHeader: {
    marginBottom: '16px',
  },

  cardTitle: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#f8fafc',
  },

  cardText: {
    marginTop: '8px',
    marginBottom: 0,
    color: '#94a3b8',
    lineHeight: 1.55,
    fontSize: '0.92rem',
  },

  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
    alignItems: 'end',
  },

  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '0.86rem',
    color: '#cbd5e1',
    fontWeight: 700,
  },

  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid rgba(148,163,184,0.16)',
    background: 'rgba(255,255,255,0.04)',
    color: '#f8fafc',
    outline: 'none',
  },

  select: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid rgba(148,163,184,0.16)',
    background: 'rgba(255,255,255,0.04)',
    color: '#f8fafc',
    outline: 'none',
  },

  splitActionWrap: {
    display: 'flex',
    alignItems: 'end',
  },

  primaryButton: {
    background: 'linear-gradient(180deg, #3b82f6, #2563eb)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 16px',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 10px 24px rgba(37,99,235,0.22)',
  },

  secondaryButton: {
    background: 'rgba(255,255,255,0.05)',
    color: '#f8fafc',
    border: '1px solid rgba(148,163,184,0.16)',
    borderRadius: '12px',
    padding: '12px 16px',
    fontWeight: 700,
    cursor: 'pointer',
  },

  dangerButton: {
    background: 'rgba(239,68,68,0.12)',
    color: '#fecaca',
    border: '1px solid rgba(239,68,68,0.20)',
    borderRadius: '12px',
    padding: '12px 16px',
    fontWeight: 800,
    cursor: 'pointer',
  },

  statusBox: {
    borderRadius: '16px',
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(148,163,184,0.10)',
    overflow: 'hidden',
  },

  pre: {
    margin: 0,
    padding: '18px',
    whiteSpace: 'pre-wrap',
    color: '#cbd5e1',
    fontSize: '0.84rem',
    lineHeight: 1.55,
  },

  footerNote: {
    marginTop: '18px',
    color: '#64748b',
    fontSize: '0.82rem',
  },
};