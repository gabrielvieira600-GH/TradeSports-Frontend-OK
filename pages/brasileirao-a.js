import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
import Image from 'next/image';
import NegociacaoModal from '../components/NegociacaoModal';

const API_BASE = 'http://localhost:4001';
const LIGA_ID = 'brasileirao-a';
const LIGA_NOME = 'Brasileirão Série A';

function calcularPrecoLiquidacao(posicao) {
  const precoBase = 5;
  return precoBase * Math.pow(1.05, 20 - posicao);
}
function calcularLiquidezAjustada(clube) {
    const base = clube.valorLiquidacaoBase || clube.valorLiquidacao || 0;
    const fator = clube.splitFactorCumulativo || 1;

    return Number((base / fator).toFixed(2));
  }
export default function BrasileiraoA() {
  const router = useRouter();
  const [clubes, setClubes] = useState([]);
  const [watchlist, setWatchlist] = useState({ clubes: [], ligas: [] });
  const [modalAberto, setModalAberto] = useState(false);
  const [clubeSelecionado, setClubeSelecionado] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const abrirModal = (clube) => {
    setClubeSelecionado(clube);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setClubeSelecionado(null);
  };

  const abrirPaginaClube = (clubeId) => router.push(`/clube/${clubeId}`);

  const carregarWatchlist = async () => {
    try {
      if (!token) return;
      const { data } = await axios.get(`${API_BASE}/watchlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWatchlist(data?.watchlist || { clubes: [], ligas: [] });
    } catch (e) {
      console.warn('[WATCHLIST] erro ao carregar:', e?.response?.data || e.message);
    }
  };

  const toggleLiga = async () => {
    try {
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const { data } = await axios.post(
        `${API_BASE}/watchlist/toggle`,
        { entityType: 'liga', entityId: LIGA_ID, nome: LIGA_NOME },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setWatchlist(data?.watchlist || { clubes: [], ligas: [] });
      window.dispatchEvent(new Event('watchlist-updated'));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (e) {
      console.warn('[WATCHLIST] erro ao favoritar liga:', e?.response?.data || e.message);
    }
  };

  const toggleClube = async (clube) => {
    try {
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const { data } = await axios.post(
        `${API_BASE}/watchlist/toggle`,
        {
          entityType: 'clube',
          entityId: clube.id,
          nome: clube.nome,
          ligaId: LIGA_ID,
          ligaNome: LIGA_NOME,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setWatchlist(data?.watchlist || { clubes: [], ligas: [] });
      window.dispatchEvent(new Event('watchlist-updated'));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (e) {
      console.warn('[WATCHLIST] erro ao favoritar clube:', e?.response?.data || e.message);
    }
  };

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [resTabela, resClubes] = await Promise.all([
          axios.get(`${API_BASE}/api/tabela-brasileirao`),
          axios.get(`${API_BASE}/clube/clubes`),
        ]);

        const clubesApi = resTabela.data.data;
        const clubesJson = resClubes.data;

        const clubesCruzados = clubesApi
          .map((clubeApi) => {
            const clubeLocal = clubesJson.find(
              (c) =>
                (c.nome || '').toLowerCase().replace(/\s/g, '') ===
                (clubeApi.nome || '').toLowerCase().replace(/\s/g, '')
            );

            if (!clubeLocal) return null;

            return {
              id: clubeLocal.id,
              nome: clubeLocal.nome,
              escudo: clubeApi.escudo || '',
              posicao: clubeApi.posicao,
              preco: Number(clubeLocal.preco || 0),
              precoAtual: clubeLocal.precoAtual != null ? Number(clubeLocal.precoAtual) : undefined,
              cotasDisponiveis: clubeLocal.cotasDisponiveis,
              ipoEncerrado: clubeLocal.ipoEncerrado,
            };
          })
          .filter(Boolean);

        setClubes(clubesCruzados);
      } catch (e) {
        console.error('Erro ao buscar dados:', e);
      }
    };

    fetchDados();
    carregarWatchlist();
  }, []);

  const favoritosClubes = useMemo(
    () => new Set((watchlist?.clubes || []).map((c) => String(c.id))),
    [watchlist]
  );

  const favoritasLigas = useMemo(
    () => new Set((watchlist?.ligas || []).map((l) => String(l.id))),
    [watchlist]
  );

  return (
    <Container>
      <Hero>
        <LeagueMain>
          <LeagueMark>
            <Image
              src="/images/logos/brasileirao-serie-a.png"
              alt="Logo Brasileirão Série A"
              width={34}
              height={34}
            />
          </LeagueMark>

          <LeagueCopy>
            <Titulo>{LIGA_NOME}</Titulo>
            <LeagueMeta>
              <span>20 clubes</span>
              <span>•</span>
              <span>IPO + secundário</span>
            </LeagueMeta>
          </LeagueCopy>
        </LeagueMain>

        <LeagueActions>
          <LeagueStar
            type="button"
            onClick={toggleLiga}
            $active={favoritasLigas.has(LIGA_ID)}
            title="Favoritar liga"
          >
            {favoritasLigas.has(LIGA_ID) ? '★' : '☆'}
          </LeagueStar>
        </LeagueActions>
      </Hero>

      {modalAberto && clubeSelecionado && (
        <NegociacaoModal
          isOpen={modalAberto}
          onClose={fecharModal}
          clube={clubeSelecionado}
          modoInicial="compra"
        />
      )}

      <TableSurface>
        <TableHead>
        </TableHead>

        <TableWrap>
          <Tabela>
            <thead>
              <tr>
                <th>#</th>
                <th>Clube</th>
                <th>Liquidação</th>
                <th>Mercado</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {clubes.map((clube) => {
                const mercado = clube.precoAtual ?? clube.preco ?? 0;
                const liquidation = calcularPrecoLiquidacao(clube.posicao);
                const inWatchlist = favoritosClubes.has(String(clube.id));
                const liquidez = calcularLiquidezAjustada(clube);

                return (
                  <tr key={clube.id}>
                    <td>
                      <Pos>{clube.posicao}</Pos>
                    </td>

                    <td>
                      <ClubeCell>
                        <StarButton
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleClube(clube);
                          }}
                          $active={inWatchlist}
                          title="Favoritar clube"
                        >
                          {inWatchlist ? '★' : '☆'}
                        </StarButton>

                        <ClubNameWrap onClick={() => abrirPaginaClube(clube.id)}>
                          <EscudoWrap>
                            <Image
                              src={clube.escudo}
                              alt={`Escudo do ${clube.nome}`}
                              width={26}
                              height={26}
                            />
                          </EscudoWrap>

                          <ClubText>
                            <strong>{clube.nome}</strong>
                          </ClubText>
                        </ClubNameWrap>
                      </ClubeCell>
                    </td>

                    <td>
                      <NumberCol>
                        <span>{liquidation.toFixed(2)}</span>
                      </NumberCol>
                    </td>

                    <td>
                      <NumberCol>
                        <span>{mercado.toFixed(2)}</span>
                      </NumberCol>
                    </td>

                    <td>
                      <StatusText $ipo={!clube.ipoEncerrado}>
                        {!clube.ipoEncerrado ? 'IPO aberto' : 'Mercado aberto'}
                      </StatusText>
                    </td>

                    <td>
                      <Botao onClick={() => abrirModal(clube)}>Negociar</Botao>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Tabela>
        </TableWrap>
      </TableSurface>
    </Container>
  );
}

const Container = styled.div`
  padding: 0.35rem 0.2rem 1.2rem;
  color: white;
`;

const Hero = styled.div`
  margin-bottom: 14px;
  padding: 6px 2px 14px;
  border-bottom: 1px solid rgba(148,163,184,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const LeagueMain = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const LeagueMark = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
  border: 1px solid rgba(148,163,184,0.12);
`;

const LeagueCopy = styled.div``;

const Kicker = styled.div`
  color: #00ff95;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
`;

const Titulo = styled.h1`
  margin: 0;
  font-size: 1.55rem;
  color: #f8fafc;
`;

const LeagueMeta = styled.div`
  margin-top: 5px;
  color: #94a3b8;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const LeagueActions = styled.div`
  display: flex;
  align-items: center;
`;

const LeagueStar = styled.button`
  border: 1px solid rgba(148,163,184,0.16);
  background: ${({ $active }) =>
    $active
      ? 'linear-gradient(180deg, rgba(250,204,21,0.22), rgba(250,204,21,0.06))'
      : 'rgba(255,255,255,0.04)'};
  color: ${({ $active }) => ($active ? '#fde68a' : '#cbd5e1')};
  width: 46px;
  height: 46px;
  border-radius: 14px;
  font-size: 1.45rem;
  cursor: pointer;
`;

const TableSurface = styled.div`
  background: transparent;
`;

const TableHead = styled.div`
  margin-bottom: 10px;
`;

const TableTitle = styled.h2`
  margin: 0;
  color: #f8fafc;
  font-size: 1.02rem;
`;

const TableSubtitle = styled.div`
  margin-top: 4px;
  color: #94a3b8;
  font-size: 0.82rem;
`;

const TableWrap = styled.div`
  overflow-x: auto;
`;

const Tabela = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: white;
  min-width: 880px;

  th,
  td {
    padding: 14px 12px;
    text-align: left;
    vertical-align: middle;
  }

  th {
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.72rem;
    font-weight: 800;
    border-bottom: 1px solid rgba(148,163,184,0.12);
  }

  tbody tr {
    border-bottom: 1px solid rgba(148,163,184,0.08);
    transition: background 0.16s ease;
  }

  tbody tr:hover {
    background: rgba(255,255,255,0.025);
  }
`;

const Pos = styled.div`
  color: #dbeafe;
  font-weight: 800;
  font-size: 1rem;
`;

const ClubeCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StarButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ $active }) => ($active ? '#facc15' : '#64748b')};
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 24px;
  flex: 0 0 auto;
`;

const ClubNameWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const EscudoWrap = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(148,163,184,0.08);
  flex: 0 0 auto;
`;

const ClubText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    color: #f8fafc;
    font-size: 0.95rem;
  }

  small {
    color: #64748b;
    font-size: 0.76rem;
  }
`;

const NumberCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  span {
    color: #f8fafc;
    font-size: 0.95rem;
    font-weight: 800;
  }

  small {
    color: #64748b;
    font-size: 0.75rem;
  }
`;

const StatusText = styled.div`
  color: ${({ $ipo }) => ($ipo ? '#86efac' : '#86efac')};
  font-size: 0.84rem;
  font-weight: 800;
`;

const Botao = styled.button`
  background: linear-gradient(180deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 800;
  box-shadow: 0 10px 22px rgba(37,99,235,0.22);

  &:hover {
    filter: brightness(1.05);
  }
`;

