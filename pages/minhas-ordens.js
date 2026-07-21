import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import withAuth from '../components/withAuth';
import api from '../lib/api';

function formatTS(n) {
  const v = Number(n || 0);

  return `T$ ${v.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatData(d) {
  if (!d) return '-';
  try {
    const dt = new Date(d);
    return dt.toLocaleString('pt-BR');
  } catch {
    return String(d);
  }
}

function statusLabel(st) {
  const s = String(st || '').toLowerCase();

  if (s === 'aberta') return 'Aberta';
  if (s === 'parcial') return 'Parcialmente executada';
  if (s === 'executada') return 'Executada';
  if (s === 'cancelada') return 'Cancelada';

  return st || '-';
}

function dataStatusOrdem(item) {
  if (item.status === 'executada') {
    return {
      label: 'Executada em',
      data: item.executadoEm,
    };
  }

  if (item.status === 'cancelada') {
    return {
      label: 'Cancelada em',
      data: item.canceladoEm,
    };
  }

  if (item.status === 'parcial') {
    return {
      label: 'Última execução',
      data: item.executadoEm,
    };
  }

  return {
    label: 'Criada em',
    data: item.criadoEm,
  };
}

function MinhasOrdens() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [clubes, setClubes] = useState([]);
  const [itens, setItens] = useState([]);

  const [filtroClubeId, setFiltroClubeId] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  async function carregarTudo() {
    setCarregando(true);
    setErro('');

    try {
      const respClubes = await api.get('/clube/clubes');
      const listaClubes = Array.isArray(respClubes.data) ? respClubes.data : [];
      setClubes(listaClubes);

      const respOrdens = await api.get('/mercado/minhas-ordens?todas=true');
      const ordens = Array.isArray(respOrdens.data) ? respOrdens.data : [];

      const mapClubeNome = (clubeId) => {
        const c = listaClubes.find((x) => String(x.id) === String(clubeId));
        return c?.nome || c?.nomeClube || '—';
      };

      const itensOrdens = ordens
  .map((o) => {
    const quantidade = Number(o.quantidade || 0);
    const restante = Number(o.restante || 0);

    const status =
      o.status ||
      (restante <= 0
        ? 'executada'
        : restante < quantidade
        ? 'parcial'
        : 'aberta');

    return {
      fonte: 'ORDEM',
      id: o.id,
      tipo: o.tipo,
      clubeId: o.clubeId,
      clubeNome: mapClubeNome(o.clubeId),
      preco: Number(o.preco || 0),
      quantidade,
      executada: Math.max(0, quantidade - restante),
      restante,
      status,
      criadoEm: o.criadoEm,
      executadoEm: o.executadoEm || null,
      canceladoEm: o.canceladoEm || null,
    };
  })
  .sort(
    (a, b) =>
      new Date(b.criadoEm).getTime() -
      new Date(a.criadoEm).getTime()
  );

setItens(itensOrdens);
    } catch (e) {
      console.error(e);
      setErro(
        e?.response?.data?.erro ||
          e?.response?.data?.message ||
          'Erro ao carregar suas ordens.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  const itensFiltrados = useMemo(() => {
    return itens.filter((x) => {
      if (filtroClubeId && String(x.clubeId) !== String(filtroClubeId)) return false;
      if (filtroTipo && String(x.tipo) !== String(filtroTipo)) return false;
      if (filtroStatus && String(x.status) !== String(filtroStatus)) return false;
      return true;
    });
  }, [itens, filtroClubeId, filtroTipo, filtroStatus]);

  useEffect(() => {
    setPage(1);
  }, [filtroClubeId, filtroTipo, filtroStatus, pageSize]);

  const totalItens = itensFiltrados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalItens / Number(pageSize || 10)));

  useEffect(() => {
    if (page > totalPaginas) setPage(totalPaginas);
    if (page < 1) setPage(1);
  }, [page, totalPaginas]);

  const itensPaginados = useMemo(() => {
    const size = Number(pageSize || 10);
    const start = (page - 1) * size;
    const end = start + size;
    return itensFiltrados.slice(start, end);
  }, [itensFiltrados, page, pageSize]);

  async function cancelarOrdem(ordemId) {
  const confirmou = window.confirm(
    'Deseja cancelar a quantidade restante desta ordem?'
  );

  if (!confirmou) return;

  try {
    await api.post(
      `/mercado/ordem/cancelar/${ordemId}`
    );

    await carregarTudo();
  } catch (e) {
    console.error(e);

    alert(
      e?.response?.data?.erro ||
        'Não foi possível cancelar esta ordem.'
    );
  }
}


  return (
    <Container>
      <Titulo>Minhas Ordens</Titulo>

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
              <option value="compra">Compra</option>
              <option value="venda">Venda</option>
            </select>
          </Filtro>

          <Filtro>
            <label>Status</label>
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="aberta">Aberta</option>
              <option value="parcial">Parcialmente executada</option>
              <option value="executada">Executada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </Filtro>

          <Filtro>
            <label>Por página</label>
            <select
              value={String(pageSize)}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </Filtro>

          <Botao onClick={carregarTudo} disabled={carregando}>
            {carregando ? 'Atualizando…' : 'Atualizar'}
          </Botao>
        </Filtros>
      </FiltrosCard>

      {erro && <Erro>{erro}</Erro>}

      <ResumoTopo>
        <span>
          Exibindo <b>{Math.min((page - 1) * pageSize + 1, totalItens || 0)}</b>–
          <b>{Math.min(page * pageSize, totalItens)}</b> de <b>{totalItens}</b>
        </span>

        <Paginacao>
          <MiniSec
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Anterior
          </MiniSec>

          <PaginaInfo>
            Página <b>{page}</b> de <b>{totalPaginas}</b>
          </PaginaInfo>

          <MiniSec
            type="button"
            onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
            disabled={page >= totalPaginas}
          >
            Próxima
          </MiniSec>
        </Paginacao>
      </ResumoTopo>

      <DesktopCard>
        {itensFiltrados.length === 0 ? (
          <Vazio>Nenhuma ordem encontrada com esses filtros.</Vazio>
        ) : (
          <>
            <TabelaWrap>
              <Tabela>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Origem</th>
                    <th>Tipo</th>
                    <th>Clube</th>
                    <th>Preço</th>
                    <th>Qtd</th>
                    <th>Restante</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {itensPaginados.map((x) => {
                    const tipoHist = String(x.tipoHistorico || '').toUpperCase();
                    const isCompra = x.tipo === 'compra' || tipoHist === 'COMPRA';

                    const podeCancelar =
  x.fonte === 'ORDEM' &&
  ['aberta', 'parcial'].includes(x.status) &&
  Number(x.restante || 0) > 0;

                    const emEdicao = editandoId === x.id;

                    return (
                      <tr key={`${x.fonte}-${x.id}`}>
                        <td>{formatData(x.criadoEm)}</td>
                        <td>{x.origem}</td>
                        <Tipo $compra={isCompra}>
                          {x.tipo === 'outro'
                            ? tipoHist || '—'
                            : isCompra
                            ? 'COMPRA'
                            : 'VENDA'}
                        </Tipo>

                        <td>{x.clubeNome}</td>

                        <td>
                          {emEdicao ? (
                            <Input
                              type="number"
                              value={editPreco}
                              onChange={(e) => setEditPreco(e.target.value)}
                            />
                          ) : (
                            formatT$(x.preco)
                          )}
                        </td>

                        <td>
                          {emEdicao ? (
                            <Input
                              type="number"
                              value={editQtd}
                              onChange={(e) => setEditQtd(e.target.value)}
                            />
                          ) : (
                            x.quantidade
                          )}
                        </td>

                        <td>{x.restante ?? '-'}</td>
                        <td>{statusLabel(x.status)}</td>

                        <td>
                          {emEdicao ? (
                            <AcoesLinha>
                              <Mini type="button" onClick={() => salvarEdicao(x.id)}>
                                Salvar
                              </Mini>
                              <MiniSec type="button" onClick={cancelarEdicao}>
                                Cancelar
                              </MiniSec>
                            </AcoesLinha>
                          ) : (
                            <AcoesLinha>
                              {podeEditar && (
                                <Mini type="button" onClick={() => iniciarEdicao(x)}>
                                  Editar
                                </Mini>
                              )}
                              {podeCancelar && (
                                <MiniDanger type="button" onClick={() => cancelarOrdem(x.id)}>
                                  Cancelar ordem
                                </MiniDanger>
                              )}
                              {!podeEditar && !podeCancelar && (
                                <span style={{ color: '#64748b' }}>—</span>
                              )}
                            </AcoesLinha>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Tabela>
            </TabelaWrap>

            <ResumoRodape>
              <Paginacao>
                <MiniSec type="button" onClick={() => setPage(1)} disabled={page <= 1}>
                  Primeira
                </MiniSec>
                <MiniSec
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Anterior
                </MiniSec>
                <PaginaInfo>
                  Página <b>{page}</b> de <b>{totalPaginas}</b>
                </PaginaInfo>
                <MiniSec
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
                  disabled={page >= totalPaginas}
                >
                  Próxima
                </MiniSec>
                <MiniSec
                  type="button"
                  onClick={() => setPage(totalPaginas)}
                  disabled={page >= totalPaginas}
                >
                  Última
                </MiniSec>
              </Paginacao>
            </ResumoRodape>
          </>
        )}
      </DesktopCard>

      <MobileLista>
        {itensFiltrados.length === 0 ? (
          <Vazio>Nenhuma ordem encontrada com esses filtros.</Vazio>
        ) : (
          itensPaginados.map((x) => {
            const tipoHist = String(x.tipoHistorico || '').toUpperCase();
            const isCompra = x.tipo === 'compra' || tipoHist === 'COMPRA';

            const podeCancelar =
  x.fonte === 'ORDEM' &&
  ['aberta', 'parcial'].includes(x.status) &&
  Number(x.restante || 0) > 0;

            const emEdicao = editandoId === x.id;

            return (
              <MobileItem key={`${x.fonte}-${x.id}`}>
                <MobileTop>
                  <MobileClube>{x.clubeNome}</MobileClube>
                  <TipoPill $compra={isCompra}>
                    {x.tipo === 'outro' ? tipoHist || '—' : isCompra ? 'COMPRA' : 'VENDA'}
                  </TipoPill>
                </MobileTop>

                <MobileGrid>
                  <InfoBloco>
                    <span>Data</span>
                    <strong>{formatData(x.criadoEm)}</strong>
                  </InfoBloco>

                  <InfoBloco>
                    <span>Origem</span>
                    <strong>{x.origem}</strong>
                  </InfoBloco>

                  <InfoBloco>
                    <span>Preço</span>
                    <strong>
                      {emEdicao ? (
                        <Input
                          type="number"
                          value={editPreco}
                          onChange={(e) => setEditPreco(e.target.value)}
                        />
                      ) : (
                        formatT$(x.preco)
                      )}
                    </strong>
                  </InfoBloco>

                  <InfoBloco>
                    <span>Quantidade</span>
                    <strong>
                      {emEdicao ? (
                        <Input
                          type="number"
                          value={editQtd}
                          onChange={(e) => setEditQtd(e.target.value)}
                        />
                      ) : (
                        x.quantidade
                      )}
                    </strong>
                  </InfoBloco>

                  <InfoBloco>
                    <span>Restante</span>
                    <strong>{x.restante ?? '-'}</strong>
                  </InfoBloco>

                  <InfoBloco>
                    <span>Status</span>
                    <strong>{statusLabel(x.status)}</strong>
                  </InfoBloco>
                </MobileGrid>

                <MobileAcoes>
                  {emEdicao ? (
                    <>
                      <Mini type="button" onClick={() => salvarEdicao(x.id)}>
                        Salvar
                      </Mini>
                      <MiniSec type="button" onClick={cancelarEdicao}>
                        Cancelar
                      </MiniSec>
                    </>
                  ) : (
                    <>
                      {podeEditar && (
                        <Mini type="button" onClick={() => iniciarEdicao(x)}>
                          Editar
                        </Mini>
                      )}
                      {podeCancelar && (
                        <MiniDanger type="button" onClick={() => cancelarOrdem(x.id)}>
                          Cancelar ordem
                        </MiniDanger>
                      )}
                      {!podeEditar && !podeCancelar && <SemAcao>Sem ações</SemAcao>}
                    </>
                  )}
                </MobileAcoes>
              </MobileItem>
            );
          })
        )}
      </MobileLista>

      <Nota>
        * Edição só é permitida enquanto a ordem estiver <b>aberta</b> e <b>ainda não tiver execução parcial</b>.
      </Nota>
    </Container>
  );
}

export default withAuth(MinhasOrdens);

const Container = styled.div`
  padding: 24px;
  color: #e2e8f0;

  @media (max-width: 900px) {
    padding: 14px 10px 18px;
  }
`;

const Titulo = styled.h1`
  color: #ffffff;
  margin: 0 0 1rem;
  font-size: 2rem;

  @media (max-width: 900px) {
    font-size: 1.55rem;
  }
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
`;

const MobileClube = styled.div`
  color: #fff;
  font-weight: 800;
  font-size: 1rem;
`;

const TipoPill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  color: ${({ $compra }) => ($compra ? '#86efac' : '#fecaca')};
  background: ${({ $compra }) =>
    $compra ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'};
  border: 1px solid
    ${({ $compra }) =>
      $compra ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'};
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

const MobileAcoes = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const SemAcao = styled.span`
  color: #64748b;
  font-size: 0.9rem;
`;

const Filtros = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  align-items: end;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

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
    outline: none;
  }
`;

const Botao = styled.button`
  padding: 0.75rem 0.95rem;
  border-radius: 10px;
  border: none;
  background: #3b82f6;
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
  min-height: 44px;

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Erro = styled.div`
  margin: 0.75rem 0;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  padding: 0.85rem;
  border-radius: 10px;
  color: #fecaca;
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
  font-size: 0.92rem;

  th,
  td {
    padding: 0.75rem;
    border-bottom: 1px solid #1e293b;
    text-align: left;
    white-space: nowrap;
  }

  th {
    color: #94a3b8;
    font-weight: 600;
  }
`;

const Tipo = styled.td`
  font-weight: 700;
  color: ${({ $compra }) => ($compra ? '#22c55e' : '#ef4444')};
`;

const AcoesLinha = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const Mini = styled.button`
  padding: 0.45rem 0.65rem;
  border-radius: 8px;
  border: 1px solid #1e293b;
  background: #111827;
  color: #e2e8f0;
  cursor: pointer;

  &:hover {
    background: #0b1220;
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const MiniSec = styled(Mini)`
  border-color: #334155;
  color: #cbd5e1;
`;

const MiniDanger = styled(Mini)`
  border-color: rgba(239, 68, 68, 0.55);
  color: #fecaca;
`;

const Input = styled.input`
  width: 100%;
  max-width: 120px;
  padding: 0.5rem 0.6rem;
  border-radius: 8px;
  border: 1px solid #1e293b;
  background: #111827;
  color: #e2e8f0;
  outline: none;
`;

const Nota = styled.p`
  margin-top: 0.85rem;
  color: #94a3b8;
  font-size: 0.9rem;
`;

const ResumoTopo = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0 0.9rem;
  color: #94a3b8;
  flex-wrap: wrap;

  b {
    color: #e2e8f0;
  }
`;

const ResumoRodape = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 0.9rem;
`;

const Paginacao = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const PaginaInfo = styled.div`
  color: #94a3b8;
  padding: 0 0.25rem;

  b {
    color: #e2e8f0;
  }
`;