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

export default function BrasileiraoA() {
  const router = useRouter();
  const [clubes, setClubes] = useState([]);
  const [watchlist, setWatchlist] = useState({ clubes: [], ligas: [] });
  const [modalAberto, setModalAberto] = useState(false);
  const [clubeSelecionado, setClubeSelecionado] = useState(null);
  const [filtro, setFiltro] = useState('');

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const abrirModal = (clube) => {
    setClubeSelecionado(clube);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setClubeSelecionado(null);
  };

  const abrirPaginaClube = (clubeId) => router.push(`/clube/${clubeId}`);

  const normalizeName = (txt = '') =>
    String(txt)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase()
      .trim();

  const aliases = {
    gremio: 'gremio',
    saopaulo: 'saopaulo',
    cuiaba: 'cuiaba',
    goias: 'goias',
    athleticoparanaense: 'atleticoparanaense',
    athletico: 'atleticoparanaense',
    fortaleza: 'fortalezaec',
    fortalezaec: 'fortalezaec',
    americamg: 'americamineiro',
    americamineiro: 'americamineiro',
    atleticomg: 'atleticomg',
  };

  const canon = (nome = '') => {
    const base = normalizeName(nome);
    return aliases[base] || base;
  };

  const carregarWatchlist = async () => {
    try {
      if (!token || !API_BASE) return;
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
    const termoInicial =
      typeof router.query.search === 'string' ? router.query.search : '';
    if (termoInicial) setFiltro(termoInicial);
  }, [router.query.search]);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        if (!API_BASE) return;

        const [resTabela, resClubes] = await Promise.all([
          axios.get(`${API_BASE}/api/tabela-brasileirao`),
          axios.get(`${API_BASE}/clube/clubes`),
        ]);

        const clubesApi = Array.isArray(resTabela?.data?.data)
          ? resTabela.data.data
          : [];
        const clubesJson = Array.isArray(resClubes?.data) ? resClubes.data : [];

        const clubesCruzados = clubesApi
          .map((clubeApi) => {
            const clubeLocal = clubesJson.find(
              (c) => canon(c.nome || '') === canon(clubeApi.nome || '')
            );

            if (!clubeLocal) return null;

            return {
              id: clubeLocal.id,
              nome: clubeLocal.nome,
              escudo: clubeApi.escudo || '',
              posicao: clubeApi.posicao,
              preco: Number(clubeLocal.preco || 0),
              precoAtual:
                clubeLocal.precoAtual != null
                  ? Number(clubeLocal.precoAtual)
                  : undefined,
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

  const clubesFiltrados = useMemo(() => {
    if (!filtro.trim()) return clubes;
    const termo = canon(filtro);
    return clubes.filter((clube) => canon(clube.nome).includes(termo));
  }, [clubes, filtro]);

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

      <SearchInline>
        <SearchInlineIcon>⌕</SearchInlineIcon>
        <SearchInlineInput
          type="text"
          placeholder="Pesquisar clube"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </SearchInline>

      {modalAberto && clubeSelecionado && (
        <NegociacaoModal
          isOpen={modalAberto}
          onClose={fecharModal}
          clube={clubeSelecionado}
          modoInicial="compra"
        />
      )}

      <TableCard>
        <TableHeader>
          <HeaderCellSmall>#</HeaderCellSmall>
          <HeaderCellClub>Clube</HeaderCellClub>
          <HeaderCellPrice>Liq./IPO</HeaderCellPrice>
          <HeaderCellPrice>Mercado</HeaderCellPrice>
          <HeaderCellTrade>Negociar</HeaderCellTrade>
        </TableHeader>

        <Rows>
          {clubesFiltrados.map((clube) => {
            const mercado = clube.precoAtual ?? clube.preco ?? 0;
            const liquidation = calcularPrecoLiquidacao(clube.posicao);
            const inWatchlist = favoritosClubes.has(String(clube.id));

            return (
              <Row key={clube.id}>
                <ColSmall>
                  <Pos>{clube.posicao}</Pos>
                </ColSmall>

                <ColClub>
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

                  <ClubTap onClick={() => abrirPaginaClube(clube.id)}>
                    <EscudoWrap>
                      <Image
                        src={clube.escudo}
                        alt={`Escudo do ${clube.nome}`}
                        width={24}
                        height={24}
                      />
                    </EscudoWrap>
                    <ClubName>{clube.nome}</ClubName>
                  </ClubTap>
                </ColClub>

                <ColPrice>
                  <PriceValue>{liquidation.toFixed(2)}</PriceValue>
                </ColPrice>

                <ColPrice>
                  <PriceValue>{mercado.toFixed(2)}</PriceValue>
                </ColPrice>

                <ColTrade>
                  <TradeButton onClick={() => abrirModal(clube)}>
                    Negociar
                  </TradeButton>
                </ColTrade>
              </Row>
            );
          })}
        </Rows>
      </TableCard>
    </Container>
  );
}

const Container = styled.div`
  padding: 0.2rem 0 1rem;
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

const SearchInline = styled.div`
  position: relative;
  margin-bottom: 14px;
`;

const SearchInlineIcon = styled.span`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
`;

const SearchInlineInput = styled.input`
  width: 100%;
  height: 46px;
  padding: 0 14px 0 42px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
  outline: none;

  &::placeholder {
    color: #94a3b8;
  }
`;

const TableCard = styled.div`
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.75), rgba(11, 19, 36, 0.95));
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 34px minmax(0, 1.8fr) 82px 82px 96px;
  gap: 8px;
  align-items: center;
  padding: 12px 10px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);

  @media (max-width: 640px) {
    grid-template-columns: 28px minmax(0, 1.6fr) 70px 70px 88px;
    gap: 6px;
    padding: 10px 8px;
  }
`;

const HeaderCellBase = styled.div`
  color: #94a3b8;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const HeaderCellSmall = styled(HeaderCellBase)`
  text-align: center;
`;

const HeaderCellClub = styled(HeaderCellBase)``;

const HeaderCellPrice = styled(HeaderCellBase)`
  text-align: center;
`;

const HeaderCellTrade = styled(HeaderCellBase)`
  text-align: center;
`;

const Rows = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 34px minmax(0, 1.8fr) 82px 82px 96px;
  gap: 8px;
  align-items: center;
  padding: 12px 10px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 640px) {
    grid-template-columns: 28px minmax(0, 1.6fr) 70px 70px 88px;
    gap: 6px;
    padding: 10px 8px;
  }
`;

const ColSmall = styled.div`
  display: flex;
  justify-content: center;
`;

const ColClub = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const ColPrice = styled.div`
  display: flex;
  justify-content: center;
`;

const ColTrade = styled.div`
  display: flex;
  justify-content: center;
`;

const Pos = styled.div`
  width: 24px;
  text-align: center;
  font-weight: 800;
  color: #f8fafc;
  font-size: 0.92rem;
`;

const StarButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ $active }) => ($active ? '#fde68a' : '#64748b')};
  font-size: 1.15rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  flex: 0 0 auto;
`;

const ClubTap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  cursor: pointer;
`;

const EscudoWrap = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(148, 163, 184, 0.08);
  overflow: hidden;
  flex: 0 0 auto;

  @media (max-width: 640px) {
    width: 28px;
    height: 28px;
  }
`;

const ClubName = styled.div`
  color: #f8fafc;
  font-size: 0.93rem;
  font-weight: 700;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  @media (max-width: 640px) {
    font-size: 0.84rem;
  }
`;

const PriceValue = styled.div`
  color: #e2e8f0;
  font-weight: 800;
  font-size: 0.9rem;

  @media (max-width: 640px) {
    font-size: 0.8rem;
  }
`;

const TradeButton = styled.button`
  width: 100%;
  max-width: 92px;
  border: none;
  border-radius: 999px;
  padding: 10px 8px;
  background: #2563eb;
  color: white;
  font-weight: 800;
  font-size: 0.84rem;
  cursor: pointer;

  &:hover {
    background: #1d4ed8;
  }

  @media (max-width: 640px) {
    max-width: 84px;
    padding: 9px 6px;
    font-size: 0.78rem;
  }
`;