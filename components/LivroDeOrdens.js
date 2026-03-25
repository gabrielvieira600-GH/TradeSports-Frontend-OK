// frontend/components/LivroDeOrdens.js
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import api from '../lib/api';

/**
 * Props:
 *  - clubeId: number|string
 *  - lado: 'compra' | 'venda'
 *  - onSelecionarPreco: (preco:number) => void
 *  - onResumoChange?: ({ bestBid, bestAsk, mid, spreadPct }) => void
 */
export default function LivroDeOrdens({
  clubeId,
  lado,
  onSelecionarPreco,
  onResumoChange,
  ordensCompra = [],
  ordensVenda = [],
  onCancelar,
  meuId,
}) {
  const [compras, setCompras] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!clubeId) return;
      setLoading(true);
      try {
        const { data } = await api.get('/mercado/livro', { params: { clubeId } });
        if (!alive) return;
        setCompras(Array.isArray(data?.compras) ? data.compras : []);
        setVendas(Array.isArray(data?.vendas) ? data.vendas : []);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    const t = setInterval(load, 3000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [clubeId]);

  const agrupaNiveis = (ordens) => {
    const mapa = new Map();

    for (const o of ordens || []) {
      const p = Number(o?.preco);
      const r = Number(o?.restante ?? o?.quantidade ?? 0);
      if (!Number.isFinite(p) || r <= 0) continue;
      const key = p.toFixed(2);
      mapa.set(key, (mapa.get(key) ?? 0) + r);
    }

    return [...mapa.entries()].map(([precoStr, qtd]) => ({
      preco: Number(precoStr),
      qtd,
    }));
  };

  const niveisCompra = useMemo(() => {
    return agrupaNiveis(compras).sort((a, b) => b.preco - a.preco);
  }, [compras]);

  const niveisVenda = useMemo(() => {
    return agrupaNiveis(vendas).sort((a, b) => a.preco - b.preco);
  }, [vendas]);

  const bestBid = niveisCompra[0]?.preco ?? null;
  const bestAsk = niveisVenda[0]?.preco ?? null;
  const mid = bestBid != null && bestAsk != null ? (bestBid + bestAsk) / 2 : null;
  const spread = bestBid != null && bestAsk != null ? bestAsk - bestBid : null;
  const spreadPct =
    bestBid != null && bestAsk != null && bestAsk > 0
      ? ((bestAsk - bestBid) / bestAsk) * 100
      : null;
  const lastPrice =
    bestBid != null && bestAsk != null
      ? Number(((bestBid + bestAsk) / 2).toFixed(2))
      : (bestBid ?? bestAsk ?? null);

  useEffect(() => {
    onResumoChange?.({ bestBid, bestAsk, mid, spreadPct });
  }, [bestBid, bestAsk, mid, spreadPct, onResumoChange]);

  const maxQtdBuy = useMemo(() => Math.max(1, ...niveisCompra.map((n) => n.qtd)), [niveisCompra]);
  const maxQtdSell = useMemo(() => Math.max(1, ...niveisVenda.map((n) => n.qtd)), [niveisVenda]);

  const usarMelhor = () => {
    if (lado === 'compra' && bestAsk != null) onSelecionarPreco?.(bestAsk);
    if (lado === 'venda' && bestBid != null) onSelecionarPreco?.(bestBid);
  };

  return (
    <Wrap>
      <Header>
        <MetricCard $variant="bid">
          <small>Melhor oferta de compra</small>
          <strong>{bestBid != null ? `R$ ${bestBid.toFixed(2)}` : '—'}</strong>
        </MetricCard>

        <MetricCard $variant="last">
          <small>Ultimo preço</small>
          <strong>{lastPrice != null ? `R$ ${Number(lastPrice).toFixed(2)}` : '—'}</strong>
        </MetricCard>

        <MetricCard $variant="ask">
          <small>Melhor oferta de venda</small>
          <strong>{bestAsk != null ? `R$ ${bestAsk.toFixed(2)}` : '—'}</strong>
        </MetricCard>
      </Header>

      <Toolbar>
        <button
          type="button"
          onClick={usarMelhor}
          disabled={loading || (lado === 'compra' ? bestAsk == null : bestBid == null)}
          title={lado === 'compra' ? 'Usar melhor preço de venda' : 'Usar melhor preço de compra'}
        >
          Usar melhor preço
        </button>

        <span className="spread">
          {spread != null
            ? `Spread: R$ ${spread.toFixed(2)}${spreadPct != null ? ` • ${spreadPct.toFixed(2)}%` : ''}`
            : 'Spread: —'}
        </span>
      </Toolbar>

      <Grid>
        <Col>
          <h4>Ordens de Compra</h4>

          {niveisCompra.length === 0 && <Empty>Nenhuma ordem de compra</Empty>}

          {niveisCompra.map((n, i) => (
            <Row key={`b-${i}`} onClick={() => onSelecionarPreco?.(n.preco)}>
              <LevelBar
                style={{ width: `${(n.qtd / maxQtdBuy) * 100}%`, background: '#1E6F43' }}
              />
              <span className="preco">R$ {n.preco.toFixed(2)}</span>
              <span className="qtd">{n.qtd} cotas</span>
            </Row>
          ))}

          {Array.isArray(ordensCompra) && ordensCompra.length > 0 && (
            <>
              <h4 style={{ marginTop: 10 }}>Suas ordens de compra</h4>
              {ordensCompra.map((o) => {
                const minha = meuId && String(o.usuarioId) === String(meuId);
                if (!minha) return null;

                return (
                  <Linha key={`myb-${o.id}`} $minha={minha}>
                    <span>{o.quantidade} cotas</span>
                    <strong>R$ {Number(o.preco).toFixed(2)}</strong>
                    <BotaoCancelar onClick={() => onCancelar?.(o.id)}>Cancelar</BotaoCancelar>
                  </Linha>
                );
              })}
            </>
          )}
        </Col>

        <Col>
          <h4>Ordens de Venda</h4>

          {niveisVenda.length === 0 && <Empty>Nenhuma ordem de venda</Empty>}

          {niveisVenda.map((n, i) => (
            <Row key={`a-${i}`} onClick={() => onSelecionarPreco?.(n.preco)}>
              <LevelBar
                style={{ width: `${(n.qtd / maxQtdSell) * 100}%`, background: '#7A1D2A' }}
              />
              <span className="preco">R$ {n.preco.toFixed(2)}</span>
              <span className="qtd">{n.qtd} cotas</span>
            </Row>
          ))}

          {Array.isArray(ordensVenda) && ordensVenda.length > 0 && (
            <>
              <h4 style={{ marginTop: 10 }}>Suas ordens de venda</h4>
              {ordensVenda.map((o) => {
                const minha = meuId && String(o.usuarioId) === String(meuId);
                if (!minha) return null;

                return (
                  <Linha key={`mya-${o.id}`} $minha={minha}>
                    <span>{o.quantidade} cotas</span>
                    <strong>R$ {Number(o.preco).toFixed(2)}</strong>
                    <BotaoCancelar onClick={() => onCancelar?.(o.id)}>Cancelar</BotaoCancelar>
                  </Linha>
                );
              })}
            </>
          )}
        </Col>
      </Grid>
    </Wrap>
  );
}

const Wrap = styled.div`
  margin-top: 16px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.92));
  border: 1px solid rgba(148, 163, 184, 0.14);
  padding: 12px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.18);
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 10px;
`;

const MetricCard = styled.div`
  border-radius: 12px;
  padding: 10px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: ${({ $variant }) =>
    $variant === 'bid'
      ? 'linear-gradient(180deg, rgba(22,163,74,0.16), rgba(22,163,74,0.06))'
      : $variant === 'ask'
        ? 'linear-gradient(180deg, rgba(239,68,68,0.16), rgba(239,68,68,0.06))'
        : 'linear-gradient(180deg, rgba(59,130,246,0.16), rgba(59,130,246,0.06))'};
  display: flex;
  flex-direction: column;
  gap: 4px;

  small {
    color: #98a2b3;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  strong {
    color: #e4e7ec;
    font-weight: 700;
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;

  button {
    border: none;
    border-radius: 10px;
    padding: 10px 12px;
    cursor: pointer;
    background: linear-gradient(180deg, #2563eb, #1d4ed8);
    color: white;
    font-weight: 800;
    box-shadow: 0 10px 20px rgba(37, 99, 235, 0.25);
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }

  .spread {
    color: #cbd5e1;
    font-size: 0.85rem;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 999px;
    padding: 8px 10px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const Col = styled.div`
  background: #0f1524;
  border: 1px solid #20263a;
  border-radius: 10px;
  padding: 10px;

  h4 {
    margin: 0 0 8px 0;
    color: #cbd5e1;
    font-size: 14px;
  }
`;

const Row = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #1e2638;
  background: #0b0f1a;
  border-radius: 8px;
  padding: 8px;
  margin: 6px 0;
  cursor: pointer;
  overflow: hidden;

  .preco {
    color: #e4e7ec;
    font-variant-numeric: tabular-nums;
  }

  .qtd {
    margin-left: auto;
    color: #94a3b8;
    font-size: 12px;
  }
`;

const LevelBar = styled.span`
  position: absolute;
  inset: 0;
  height: 100%;
  opacity: 0.2;
  pointer-events: none;
`;

const Empty = styled.div`
  color: #94a3b8;
  font-size: 12px;
  padding: 12px;
  border: 1px dashed #223;
  border-radius: 8px;
  text-align: center;
`;

const Linha = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  background: ${({ $minha }) => ($minha ? 'rgba(255,255,255,.06)' : 'transparent')};
`;

const BotaoCancelar = styled.button`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 0;
  background: #ef4444;
  color: #fff;
  cursor: pointer;

  &:hover {
    filter: brightness(0.95);
  }
`;
