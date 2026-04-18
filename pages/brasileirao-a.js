import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
import Image from 'next/image';
import NegociacaoModal from '../components/NegociacaoModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
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
  console.log('API_BASE=', API_BASE);
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
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
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

  @media (max-width: 640px) {
    gap: 10px;
  }
`;

const LeagueMark = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.03)
  );
  border: 1px solid rgba(148, 163, 184, 0.12);

  @media (max-width: 640px) {
    width: 46px;
    height: 46px;
    border-radius: 14px;
  }
`;

const LeagueCopy = styled.div``;

const Titulo = styled.h1`
  margin: 0;
  font-size: 1.55rem;
  color: #f8fafc;

  @media (max-width: 640px) {
    font-size: 1.18rem;
  }
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
  border: 1px solid rgba(148, 163, 184, 0.16);
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

  @media (max-width: 640px) {
    width: 42px;
    height: 42px;
  }
`;

const DesktopTable = styled.div`
  display: block;

  @media (max-width: 900px) {
    display: none;
  }
`;

const MobileCards = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: grid;
    gap: 10px;
  }
`;

const TableSurface = styled.div`
  background: transparent;
`;

const TableWrap = styled.div`
  overflow-x: auto;
  border-radius: 18px;
`;

const Tabela = styled.table`
  width: 100%;
  min-width: 780px;
  border-collapse: collapse;

  thead th {
    text-align: left;
    font-size: 0.78rem;
    color: #94a3b8;
    font-weight: 800;
    padding: 14px 10px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  tbody td {
    padding: 14px 10px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.08);
    vertical-align: middle;
  }

  tbody tr:hover {
    background: rgba(255, 255, 255, 0.025);
  }
`;

const Pos = styled.div`
  width: 28px;
  text-align: center;
  font-weight: 800;
  color: #f8fafc;
`;

const ClubeCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StarButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ $active }) => ($active ? '#fde68a' : '#64748b')};
  font-size: 1.3rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  flex: 0 0 auto;
`;

const ClubNameWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  min-width: 0;
`;

const EscudoWrap = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(148, 163, 184, 0.08);
  overflow: hidden;
`;

const ClubText = styled.div`
  strong {
    color: #f8fafc;
    font-size: 0.94rem;
  }
`;

const NumberCol = styled.div`
  color: #e2e8f0;
  font-weight: 700;
`;

const StatusText = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 800;
  color: ${({ $ipo }) => ($ipo ? '#86efac' : '#93c5fd')};
  background: ${({ $ipo }) =>
    $ipo ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.12)'};
  border: 1px solid
    ${({ $ipo }) => ($ipo ? 'rgba(34,197,94,0.16)' : 'rgba(59,130,246,0.16)')};
`;

const Botao = styled.button`
  background: #2563eb;
  color: white;
  border: none;
  padding: 9px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 800;

  &:hover {
    background: #1d4ed8;
  }
`;

const Card = styled.div`
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(11, 19, 36, 0.96));
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 16px;
  padding: 12px;
`;

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`;

const CardLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const PosMobile = styled.div`
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  font-weight: 800;
  color: #f8fafc;
  flex: 0 0 auto;
`;

const EscudoMobile = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(148, 163, 184, 0.08);
  overflow: hidden;
  flex: 0 0 auto;
`;

const ClubMain = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;

  strong {
    color: #f8fafc;
    font-size: 0.96rem;
    cursor: pointer;
  }
`;

const CardMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 12px;
`;

const MetricBox = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 12px;
  padding: 10px;

  span {
    display: block;
    color: #94a3b8;
    font-size: 0.76rem;
    margin-bottom: 6px;
  }

  strong {
    color: #f8fafc;
    font-size: 0.98rem;
  }
`;

const CardButton = styled.button`
  width: 100%;
  margin-top: 12px;
  border: none;
  border-radius: 12px;
  padding: 12px;
  background: #2563eb;
  color: white;
  font-weight: 800;
  cursor: pointer;
`;