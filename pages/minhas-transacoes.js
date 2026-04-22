import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import withAuth from '../components/withAuth';
import api from '../lib/api';

function formatBRL(v) {
  const n = Number(v || 0);
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatData(d) {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleString('pt-BR');
  } catch {
    return String(d);
  }
}

function labelTipo(t) {
  switch (String(t).toUpperCase()) {
    case 'COMPRA':
      return 'Compra';
    case 'VENDA':
      return 'Venda';
    case 'LIQUIDACAO':
      return 'Liquidação';
    case 'DEPOSITO':
      return 'Depósito';
    case 'SAQUE':
      return 'Saque';
    default:
      return t;
  }
}

function corTipo(t) {
  const x = String(t).toUpperCase();
  if (x === 'COMPRA' || x === 'DEPOSITO') return '#22c55e';
  if (x === 'VENDA' || x === 'SAQUE') return '#ef4444';
  if (x === 'LIQUIDACAO') return '#38bdf8';
  return '#e2e8f0';
}

function MinhasTransacoes() {
  const [itens, setItens] = useState([]);
  const [clubes, setClubes] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const [filtroClubeId, setFiltroClubeId] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroOrigem, setFiltroOrigem] = useState('');

  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [paginaAtual, setPaginaAtual] = useState(1);

  async function carregar() {
    setCarregando(true);
    try {
      const respClubes = await api.get('/clube/clubes');
      setClubes(Array.isArray(respClubes.data) ? respClubes.data : []);

      const resp = await api.get('/usuario/historico');
      setItens(Array.isArray(resp.data) ? resp.data : []);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const itensFiltrados = useMemo(() => {
    return itens.filter((x) => {
      if (filtroTipo && String(x.tipo) !== filtroTipo) return false;
      if (filtroOrigem && String(x.origem) !== filtroOrigem) return false;
      if (filtroClubeId && String(x.clubeId) !== String(filtroClubeId)) return false;
      return true;
    });
  }, [itens, filtroTipo, filtroOrigem, filtroClubeId]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroTipo, filtroOrigem, filtroClubeId, itensPorPagina]);

  const totalPaginas = Math.max(1, Math.ceil(itensFiltrados.length / itensPorPagina));
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const itensPaginados = itensFiltrados.slice(inicio, inicio + itensPorPagina);

  const irParaPagina = (p) => {
    const alvo = Math.min(Math.max(1, Number(p) || 1), totalPaginas);
    setPaginaAtual(alvo);
  };

  return (
    <Wrap>
      <Titulo>Minhas Transações</Titulo>
      <Sub>Execuções realizadas (não inclui ordens abertas)</Sub>

      <FiltrosCard>
        <Filtros>
          <Filtro>
            <label>Clube</label>
            <select value={filtroClubeId} onChange={(e) => setFiltroClubeId(e.target.value)}>
              <option value="">Todos</option>
              {clubes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </Filtro>

          <Filtro>
            <label>Tipo</label>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Todos</option>
              <option value="COMPRA">Compra</option>
              <option value="VENDA">Venda</option>
              <option value="LIQUIDACAO">Liquidação</option>
              <option value="DEPOSITO">Depósito</option>
              <option value="SAQUE">Saque</option>
            </select>
          </Filtro>

          <Filtro>
            <label>Origem</label>
            <select value={filtroOrigem} onChange={(e) => setFiltroOrigem(e.target.value)}>
              <option value="">Todas</option>
              <option value="IPO">IPO</option>
              <option value="SECUNDARIO">Mercado Secundário</option>
              <option value="LIQUIDACAO">Liquidação</option>
            </select>
          </Filtro>
        </Filtros>
      </FiltrosCard>

      <PaginacaoBar>
        <PaginacaoEsq>
          <label>
            Itens por página
            <select
              value={itensPorPagina}
              onChange={(e) => setItensPorPagina(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>

          <Resumo>
            {itensFiltrados.length === 0
              ? '0 transações'
              : `${itensFiltrados.length} transações • Página ${paginaAtual} de ${totalPaginas}`}
          </Resumo>
        </PaginacaoEsq>

        <PaginacaoDir>
          <BotaoPagina
            type="button"
            onClick={() => irParaPagina(paginaAtual - 1)}
            disabled={paginaAtual <= 1}
          >
            Anterior
          </BotaoPagina>

          <BotaoPagina
            type="button"
            onClick={() => irParaPagina(paginaAtual + 1)}
            disabled={paginaAtual >= totalPaginas}
          >
            Próxima
          </BotaoPagina>
        </PaginacaoDir>
      </PaginacaoBar>

      <DesktopCard>
        {carregando ? (
          <Vazio>Carregando...</Vazio>
        ) : itensFiltrados.length === 0 ? (
          <Vazio>Nenhuma transação encontrada.</Vazio>
        ) : (
          <TabelaWrap>
            <Tabela>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Origem</th>
                  <th>Clube</th>
                  <th>Qtd</th>
                  <th>Preço</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {itensPaginados.map((x) => (
                  <tr key={x.id}>
                    <td>{formatData(x.data)}</td>
                    <Tipo style={{ color: corTipo(x.tipo) }}>{labelTipo(x.tipo)}</Tipo>
                    <td>{x.origem || '-'}</td>
                    <td>{x.clubeNome || '-'}</td>
                    <td>{x.quantidade || '-'}</td>
                    <td>{x.valorUnitario ? formatBRL(x.valorUnitario) : '-'}</td>
                    <td>{x.totalPago ? formatBRL(x.totalPago) : formatBRL(x.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </Tabela>
          </TabelaWrap>
        )}
      </DesktopCard>

      <MobileLista>
        {carregando ? (
          <Vazio>Carregando...</Vazio>
        ) : itensFiltrados.length === 0 ? (
          <Vazio>Nenhuma transação encontrada.</Vazio>
        ) : (
          itensPaginados.map((x) => (
            <MobileItem key={x.id}>
              <MobileTop>
                <TipoPill style={{ color: corTipo(x.tipo), borderColor: corTipo(x.tipo) }}>
                  {labelTipo(x.tipo)}
                </TipoPill>
                <MobileData>{formatData(x.data)}</MobileData>
              </MobileTop>

              <MobileGrid>
                <InfoBloco>
                  <span>Origem</span>
                  <strong>{x.origem || '-'}</strong>
                </InfoBloco>

                <InfoBloco>
                  <span>Clube</span>
                  <strong>{x.clubeNome || '-'}</strong>
                </InfoBloco>

                <InfoBloco>
                  <span>Qtd</span>
                  <strong>{x.quantidade || '-'}</strong>
                </InfoBloco>

                <InfoBloco>
                  <span>Preço</span>
                  <strong>{x.valorUnitario ? formatBRL(x.valorUnitario) : '-'}</strong>
                </InfoBloco>

                <InfoBloco>
                  <span>Total</span>
                  <strong>{x.totalPago ? formatBRL(x.totalPago) : formatBRL(x.valor)}</strong>
                </InfoBloco>
              </MobileGrid>
            </MobileItem>
          ))
        )}
      </MobileLista>
    </Wrap>
  );
}

export default withAuth(MinhasTransacoes);

const Wrap = styled.div`
  padding: 24px;
  color: #e2e8f0;

  @media (max-width: 900px) {
    padding: 14px 10px 18px;
  }
`;

const Titulo = styled.h1`
  color: #ffffff;
  margin: 0;
  font-size: 2rem;

  @media (max-width: 900px) {
    font-size: 1.55rem;
  }
`;

const Sub = styled.p`
  margin: 0.35rem 0 1rem;
  color: #94a3b8;
`;

const FiltrosCard = styled.div`
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 14px;
`;

const DesktopCard = styled.div`
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 14px;
  padding: 1rem;

  @media (max-width: 900px) {
    display: none;
  }
`;

const MobileLista = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: grid;
    gap: 12px;
  }
`;

const MobileItem = styled.div`
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 14px;
  padding: 12px;
`;

const MobileTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const MobileData = styled.div`
  color: #94a3b8;
  font-size: 0.8rem;
  text-align: right;
`;

const TipoPill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid currentColor;
`;

const MobileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const InfoBloco = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 10px;
  padding: 10px;

  span {
    display: block;
    font-size: 0.72rem;
    color: #94a3b8;
    margin-bottom: 6px;
  }

  strong {
    color: #e2e8f0;
    font-size: 0.88rem;
    word-break: break-word;
  }
`;

const Card = styled.div``;

const Filtros = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const Filtro = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  label {
    font-size: 0.85rem;
    color: #94a3b8;
  }

  select {
    width: 100%;
    min-width: 0;
    padding: 0.7rem 0.75rem;
    border-radius: 10px;
    border: 1px solid #1e293b;
    background: #111827;
    color: #e2e8f0;
  }
`;

const Vazio = styled.div`
  padding: 1rem;
  color: #94a3b8;
`;

const TabelaWrap = styled.div`
  overflow-x: auto;
`;

const Tabela = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.75rem;
    border-bottom: 1px solid #1e293b;
    white-space: nowrap;
  }

  th {
    color: #94a3b8;
    font-weight: 600;
    text-align: left;
  }
`;

const Tipo = styled.td`
  font-weight: 700;
`;

const PaginacaoBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin: 8px 0 14px;
`;

const PaginacaoEsq = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    opacity: 0.9;
  }

  select {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #fff;
    padding: 8px 10px;
    border-radius: 8px;
    outline: none;

    option {
      color: #000;
    }
  }
`;

const Resumo = styled.div`
  font-size: 12px;
  opacity: 0.8;
`;

const PaginacaoDir = styled.div`
  display: flex;
  gap: 10px;
`;

const BotaoPagina = styled.button`
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #fff;
  padding: 9px 12px;
  border-radius: 8px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.16);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;