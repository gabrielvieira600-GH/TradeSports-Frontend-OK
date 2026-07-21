import styled from 'styled-components';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import ClubBadge from './ClubBadge';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function Topbar() {
  const router = useRouter();

  const [saldo, setSaldo] = useState('0.00');
  const [usuario, setUsuario] = useState(null);

  const [bancoAberto, setBancoAberto] = useState(false);
  const [notifAberto, setNotifAberto] = useState(false);

  const [notificacoes, setNotificacoes] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [busca, setBusca] = useState('');
  const [clubes, setClubes] = useState([]);
  const [usuariosBusca, setUsuariosBusca] = useState([]);
  const [carregandoUsuariosBusca, setCarregandoUsuariosBusca] =
    useState(false);

  const [searchAberto, setSearchAberto] = useState(false);
  const [searchIndexAtivo, setSearchIndexAtivo] = useState(-1);

  const bancoRef = useRef(null);
  const notifRef = useRef(null);
  const searchDesktopRef = useRef(null);
  const searchMobileRef = useRef(null);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const meuPerfilId =
  usuario?._id ||
  usuario?.id ||
  usuario?.usuarioId ||
  usuario?.userId ||
  usuario?.mongoId ||
  null;

const meuPerfilHref = meuPerfilId
  ? `/perfil/${meuPerfilId}`
  : '/social';
  const normalizeText = (txt = '') =>
    String(txt)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .trim();

  const hydrateUser = () => {
    try {
      const usuarioSalvo = localStorage.getItem('usuario');
      const saldoSalvo = localStorage.getItem('saldo');

      const parsed =
        usuarioSalvo && usuarioSalvo !== 'undefined'
          ? JSON.parse(usuarioSalvo)
          : null;

      setUsuario(parsed);

      if (saldoSalvo) {
        setSaldo(saldoSalvo);
      } else if (parsed?.saldo !== undefined) {
        setSaldo(String(parsed.saldo));
      }
    } catch {
      setUsuario(null);
    }
  };

  const carregarClubes = async () => {
    try {
      if (!API_BASE) return;

      const { data } = await axios.get(`${API_BASE}/clube/clubes`);

      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setClubes(
        lista
          .map((clube) => ({
            ...clube,
            id: clube.id ?? clube.legacyId,
            legacyId: clube.legacyId ?? clube.id,
            nome: clube.nome || clube.nomeApi || 'Clube',
          }))
          .filter((clube) => clube.id || clube.legacyId)
      );
    } catch (err) {
      console.warn(
        '[TOPBAR SEARCH] erro ao carregar clubes:',
        err?.response?.data || err.message
      );
    }
  };

  const carregarUsuariosBusca = async (termo) => {
    try {
      if (!API_BASE || !token || !termo || termo.length < 2) {
        setUsuariosBusca([]);
        return;
      }

      setCarregandoUsuariosBusca(true);

      const { data } = await axios.get(`${API_BASE}/social/usuarios`, {
        params: {
          busca: termo,
          limit: 6,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsuariosBusca(Array.isArray(data?.usuarios) ? data.usuarios : []);
    } catch (err) {
  console.error('[TOPBAR SEARCH] erro ao buscar usuários:', {
    status: err?.response?.status,
    data: err?.response?.data,
    message: err?.message,
    url: `${API_BASE}/social/usuarios`,
    termo,
  });

  setUsuariosBusca([]);
} finally {
  setCarregandoUsuariosBusca(false);
}
  };

  const carregarNotificacoes = async () => {
    try {
      if (!token || !API_BASE) return;

      const { data } = await axios.get(`${API_BASE}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotificacoes(
        Array.isArray(data?.notifications) ? data.notifications : []
      );

      setUnreadCount(Number(data?.unreadCount || 0));
    } catch {}
  };

  useEffect(() => {
    hydrateUser();
    carregarNotificacoes();
    carregarClubes();
  }, []);

  useEffect(() => {
    const atualizar = () => {
      hydrateUser();
      carregarNotificacoes();
    };

    window.addEventListener('storage', atualizar);
    window.addEventListener('force-topbar-update', atualizar);
    window.addEventListener('watchlist-updated', atualizar);
    window.addEventListener('notifications-updated', atualizar);

    return () => {
      window.removeEventListener('storage', atualizar);
      window.removeEventListener('force-topbar-update', atualizar);
      window.removeEventListener('watchlist-updated', atualizar);
      window.removeEventListener('notifications-updated', atualizar);
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      carregarNotificacoes();
    }, 30000);

    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const termo = busca.trim();

    if (!token || termo.length < 2) {
      setUsuariosBusca([]);
      setCarregandoUsuariosBusca(false);
      return;
    }

    const timeout = setTimeout(() => {
      carregarUsuariosBusca(termo);
    }, 280);

    return () => clearTimeout(timeout);
  }, [busca, token]);

  useEffect(() => {
    const onClick = (e) => {
      if (
        bancoAberto &&
        bancoRef.current &&
        !bancoRef.current.contains(e.target)
      ) {
        setBancoAberto(false);
      }

      if (
        notifAberto &&
        notifRef.current &&
        !notifRef.current.contains(e.target)
      ) {
        setNotifAberto(false);
      }

      const clicouForaDesktop =
        searchDesktopRef.current &&
        !searchDesktopRef.current.contains(e.target);

      const clicouForaMobile =
        searchMobileRef.current &&
        !searchMobileRef.current.contains(e.target);

      if (clicouForaDesktop && clicouForaMobile) {
        setSearchAberto(false);
        setSearchIndexAtivo(-1);
      }
    };

    document.addEventListener('mousedown', onClick);

    return () => document.removeEventListener('mousedown', onClick);
  }, [bancoAberto, notifAberto]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMobile = window.innerWidth <= 640;

    if (notifAberto && isMobile) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [notifAberto]);

  const marcarTodasComoLidas = async () => {
    if (!token || !API_BASE) return;

    try {
      await axios.post(
        `${API_BASE}/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await carregarNotificacoes();

      window.dispatchEvent(new Event('notifications-updated'));
    } catch {}
  };

  const marcarUmaComoLida = async (id) => {
    if (!token || !API_BASE) return;

    try {
      await axios.post(
        `${API_BASE}/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await carregarNotificacoes();

      window.dispatchEvent(new Event('notifications-updated'));
    } catch {}
  };

  const getNotificationTargetUrl = (notificacao) => {
    const metadata = notificacao?.metadata || notificacao?.meta || {};

    if (metadata?.targetUrl) {
      return String(metadata.targetUrl);
    }

    const clubeId =
      metadata?.clubeId ||
      metadata?.entityId ||
      notificacao?.entityId ||
      notificacao?.clubeId;

    if (clubeId) {
      return `/clube/${clubeId}`;
    }

    return null;
  };

  const handleNotificationClick = async (notificacao) => {
    if (!notificacao) return;

    const targetUrl = getNotificationTargetUrl(notificacao);

    if (!notificacao.read) {
      await marcarUmaComoLida(notificacao.id);
    }

    if (targetUrl) {
      setNotifAberto(false);
      router.push(targetUrl);
    }
  };

  const clubesFiltrados = useMemo(() => {
    const termo = normalizeText(busca);

    if (!termo || termo.length < 2) {
      return [];
    }

    return clubes
      .filter((clube) => {
        const nome = normalizeText(clube.nome);
        const nomeApi = normalizeText(clube.nomeApi || '');

        return nome.includes(termo) || nomeApi.includes(termo);
      })
      .slice(0, 6);
  }, [busca, clubes]);

  const usuariosFiltrados = useMemo(() => {
    const termo = normalizeText(busca);

    if (!termo || termo.length < 2) {
      return [];
    }

    return usuariosBusca.slice(0, 6);
  }, [busca, usuariosBusca]);

  const resultadosBusca = useMemo(() => {
    const resultadosClubes = clubesFiltrados.map((clube) => ({
      tipo: 'clube',
      id: String(clube.id ?? clube.legacyId),
      label: clube.nome,
      subtitle: 'Abrir página do clube',
      data: clube,
    }));

    const resultadosUsuarios = usuariosFiltrados.map((usuarioPerfil) => ({
      tipo: 'usuario',
      id: String(usuarioPerfil.id),
      label: usuarioPerfil.nomeUsuario
        ? `@${usuarioPerfil.nomeUsuario}`
        : usuarioPerfil.nomePublico || usuarioPerfil.nome || 'Usuário',
      subtitle: `${usuarioPerfil.estatisticas?.seguidores || 0} seguidores · ${
        usuarioPerfil.quantidadePosicoes || 0
      } posições`,
      data: usuarioPerfil,
    }));

    return [...resultadosClubes, ...resultadosUsuarios];
  }, [clubesFiltrados, usuariosFiltrados]);

  const irParaClube = (clube) => {
    const clubeId = clube?.id ?? clube?.legacyId;

    if (!clubeId) return;

    setBusca('');
    setSearchAberto(false);
    setSearchIndexAtivo(-1);

    router.push(`/clube/${clubeId}`);
  };

  const irParaPerfil = (usuarioPerfil) => {
    const usuarioId = usuarioPerfil?.id ?? usuarioPerfil?._id;

    if (!usuarioId) return;

    setBusca('');
    setSearchAberto(false);
    setSearchIndexAtivo(-1);

    router.push(`/perfil/${usuarioId}`);
  };

  const irParaResultadoBusca = (resultado) => {
    if (!resultado) return;

    if (resultado.tipo === 'clube') {
      irParaClube(resultado.data);
      return;
    }

    if (resultado.tipo === 'usuario') {
      irParaPerfil(resultado.data);
    }
  };

  const encontrarResultadoPorBusca = () => {
    const termo = normalizeText(busca);

    if (!termo) return null;

    const clubeExato = clubes.find(
      (clube) => normalizeText(clube.nome) === termo
    );

    if (clubeExato) {
      return {
        tipo: 'clube',
        id: String(clubeExato.id ?? clubeExato.legacyId),
        data: clubeExato,
      };
    }

    const usuarioExato = usuariosFiltrados.find((usuarioPerfil) => {
      const nomeUsuario = normalizeText(usuarioPerfil.nomeUsuario || '');
      const nomePublico = normalizeText(
        usuarioPerfil.nomePublico || usuarioPerfil.nome || ''
      );

      return nomeUsuario === termo || nomePublico === termo;
    });

    if (usuarioExato) {
      return {
        tipo: 'usuario',
        id: String(usuarioExato.id),
        data: usuarioExato,
      };
    }

    return resultadosBusca[0] || null;
  };

  const handleBusca = (e) => {
    e.preventDefault();

    const resultadoEncontrado = encontrarResultadoPorBusca();

    if (resultadoEncontrado) {
      irParaResultadoBusca(resultadoEncontrado);
      return;
    }

    const termo = busca.trim();

    if (!termo) return;

    router.push(`/brasileirao-a?search=${encodeURIComponent(termo)}`);
  };

  const handleSearchKeyDown = (e) => {
    if (!searchAberto || resultadosBusca.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();

      setSearchIndexAtivo((idx) =>
        idx >= resultadosBusca.length - 1 ? 0 : idx + 1
      );

      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();

      setSearchIndexAtivo((idx) =>
        idx <= 0 ? resultadosBusca.length - 1 : idx - 1
      );

      return;
    }

    if (e.key === 'Enter' && searchIndexAtivo >= 0) {
      e.preventDefault();

      irParaResultadoBusca(resultadosBusca[searchIndexAtivo]);
    }

    if (e.key === 'Escape') {
      setSearchAberto(false);
      setSearchIndexAtivo(-1);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/';
  };

  const notificationsPreview = useMemo(
    () => notificacoes.slice(0, 12),
    [notificacoes]
  );

  const renderSearchBox = (mobile = false) => (
    <SearchBoxWrap ref={mobile ? searchMobileRef : searchDesktopRef}>
      <SearchIcon>⌕</SearchIcon>

      <SearchInput
        type="text"
        placeholder="Pesquisar clube, mercado ou perfil"
        value={busca}
        onChange={(e) => {
          setBusca(e.target.value);
          setSearchAberto(true);
          setSearchIndexAtivo(-1);
        }}
        onFocus={() => setSearchAberto(true)}
        onKeyDown={handleSearchKeyDown}
        autoComplete="off"
      />

      {searchAberto && busca.trim().length >= 2 && (
        <SearchDropdown>
          {resultadosBusca.length === 0 ? (
            <SearchEmpty>
              {carregandoUsuariosBusca
                ? 'Buscando perfis...'
                : 'Nenhum resultado encontrado.'}
            </SearchEmpty>
          ) : (
            <>
              {clubesFiltrados.length > 0 && (
                <SearchSectionTitle>Clubes</SearchSectionTitle>
              )}

              {clubesFiltrados.map((clube, index) => (
                <SearchOption
                  key={`clube-${clube.id ?? clube.legacyId}`}
                  type="button"
                  $active={index === searchIndexAtivo}
                  onMouseEnter={() => setSearchIndexAtivo(index)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    irParaClube(clube);
                  }}
                >
                  <SearchOptionAvatar>
                    <ClubBadge clube={clube.nome} size={28} />
                  </SearchOptionAvatar>

                  <SearchOptionText>
                    <strong>{clube.nome}</strong>
                    <span>Abrir página do clube</span>
                  </SearchOptionText>
                </SearchOption>
              ))}

              {usuariosFiltrados.length > 0 && (
                <SearchSectionTitle>Usuários</SearchSectionTitle>
              )}

              {usuariosFiltrados.map((usuarioPerfil, index) => {
                const resultIndex = clubesFiltrados.length + index;

                const nomePerfil = usuarioPerfil.nomeUsuario
                  ? `@${usuarioPerfil.nomeUsuario}`
                  : usuarioPerfil.nomePublico ||
                    usuarioPerfil.nome ||
                    'Usuário';

                return (
                  <SearchOption
                    key={`usuario-${usuarioPerfil.id}`}
                    type="button"
                    $active={resultIndex === searchIndexAtivo}
                    onMouseEnter={() => setSearchIndexAtivo(resultIndex)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      irParaPerfil(usuarioPerfil);
                    }}
                  >
                    <SearchUserAvatar>
                      {String(nomePerfil)
                        .replace('@', '')
                        .charAt(0)
                        .toUpperCase()}
                    </SearchUserAvatar>

                    <SearchOptionText>
                      <strong>{nomePerfil}</strong>
                      <span>
                        {usuarioPerfil.estatisticas?.seguidores || 0}{' '}
                        seguidores · {usuarioPerfil.quantidadePosicoes || 0}{' '}
                        posições
                      </span>
                    </SearchOptionText>

                    <SearchPlanBadge
                      $premium={usuarioPerfil.plano === 'premium'}
                    >
                      {usuarioPerfil.plano === 'premium' ? 'Premium' : 'Lite'}
                    </SearchPlanBadge>
                  </SearchOption>
                );
              })}
            </>
          )}
        </SearchDropdown>
      )}
    </SearchBoxWrap>
  );

  return (
    <Barra>
      <TopRow>
        <LeftBlock>
          <Logo>
            <Link href="/" aria-label="TradeSports">
              <LogoImagem src="/tradesports-logo.png" alt="TradeSports" />
            </Link>
          </Logo>
        </LeftBlock>

        <RightBlock>
          {!usuario ? (
            <>
              <DesktopSearchForm onSubmit={handleBusca}>
                {renderSearchBox()}
              </DesktopSearchForm>

              <GuestActions>
                <ComoFuncionaLink

  href="/como-funciona"

  aria-label="Como funciona"

>

  <ComoFuncionaIcon aria-hidden="true">

    i

  </ComoFuncionaIcon>

  <ComoFuncionaTexto>

    Como funciona

  </ComoFuncionaTexto>

</ComoFuncionaLink>
                <Link href="/login" passHref>
                  <BotaoAzul as="span">Login</BotaoAzul>
                </Link>

                <Link href="/cadastro" passHref>
                  <BotaoVerde as="span">Registrar</BotaoVerde>
                </Link>
              </GuestActions>
            </>
          ) : (
            <UserRow>
              <DesktopSearchForm onSubmit={handleBusca}>
                {renderSearchBox()}
              </DesktopSearchForm>

              <IconWrap ref={notifRef}>
                <IconButton
                  type="button"
                  onClick={() => setNotifAberto((v) => !v)}
                  aria-label="Notificações"
                >
                  <Bell>🔔</Bell>

                  {unreadCount > 0 && (
                    <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>
                  )}
                </IconButton>

                {notifAberto && (
                  <>
                    <NotifMobileOverlay
                      onClick={() => setNotifAberto(false)}
                    />

                    <NotifDropdown>
                      <NotifHeader>
                        <NotifHeaderText>
                          <strong>Notificações</strong>
                          <small>{unreadCount} não lida(s)</small>
                        </NotifHeaderText>

                        <NotifHeaderActions>
                          <MarkAllBtn
                            type="button"
                            onClick={marcarTodasComoLidas}
                          >
                            Marcar tudo
                          </MarkAllBtn>

                          <CloseNotifBtn
                            type="button"
                            onClick={() => setNotifAberto(false)}
                            aria-label="Fechar notificações"
                          >
                            ✕
                          </CloseNotifBtn>
                        </NotifHeaderActions>
                      </NotifHeader>

                      {notificationsPreview.length === 0 ? (
                        <NotifEmpty>
                          Você ainda não recebeu notificações.
                        </NotifEmpty>
                      ) : (
                        <NotifList>
                          {notificationsPreview.map((n) => (
                            <NotifItem
                              key={n.id}
                              $unread={!n.read}
                              $clickable={Boolean(getNotificationTargetUrl(n))}
                              onClick={() => handleNotificationClick(n)}
                              title={
                                getNotificationTargetUrl(n)
                                  ? 'Clique para abrir'
                                  : 'Notificação'
                              }
                            >
                              <NotifDot $unread={!n.read} />

                              <NotifBody>
                                <strong>{n.title}</strong>
                                <p>{n.body}</p>
                                <small>
                                  {new Date(n.createdAt).toLocaleString(
                                    'pt-BR'
                                  )}
                                </small>
                              </NotifBody>
                            </NotifItem>
                          ))}
                        </NotifList>
                      )}
                    </NotifDropdown>
                  </>
                )}
              </IconWrap>

              <BancoWrap ref={bancoRef}>
                <BotaoVerde
                  type="button"
                  onClick={() => setBancoAberto((v) => !v)}
                >
                  <UserAndSaldo>
                    <SaldoInline>
                      👤 R$ {parseFloat(saldo || 0).toFixed(2)}
                    </SaldoInline>
                  </UserAndSaldo>
                </BotaoVerde>

                {bancoAberto && (
                  <Dropdown>
                     <DropLink href="/como-funciona">Como funciona</DropLink>
                    <DropLink href={meuPerfilHref}>Meu perfil</DropLink>
                    <DropLink href="/carteira">Carteira</DropLink>
                    <DropLink href="/ranking">Ranking</DropLink>
                    <DropLink href="/social">Comunidade</DropLink>
                    <DropLink href="/convites">Convites</DropLink>
                    <DropLink href="/minhas-ordens">Minhas Ordens</DropLink>
                    <DropLink href="/minhas-transacoes">
                      Minhas Transações
                    </DropLink>
                    <DropLink href="/extrato">Extrato</DropLink>
                    <DropLink href="/deposito">Depósito</DropLink>
                    <DropLink href="/saque">Saque</DropLink>
                  </Dropdown>
                )}
              </BancoWrap>

              <Botao type="button" onClick={handleLogout}>
                Sair
              </Botao>
            </UserRow>
          )}
        </RightBlock>
      </TopRow>

      <MobileSearchRow>
        <SearchForm onSubmit={handleBusca}>
          {renderSearchBox(true)}
        </SearchForm>
      </MobileSearchRow>
    </Barra>
  );
}

const Barra = styled.header`
  width: 100%;
  padding: 10px 18px 12px;
  background:
    radial-gradient(
      circle at top center,
      rgba(37, 99, 235, 0.18),
      transparent 35%
    ),
    linear-gradient(180deg, #0f172a, #0b1324);
  color: white;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  box-sizing: border-box;
  position: sticky;
  top: 0;
  z-index: 50;

  @media (max-width: 640px) {
    padding: 10px 10px 12px;
  }
`;

const TopRow = styled.div`
  width: 100%;
  max-width: none;
  margin: 0;

  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;

  @media (max-width: 640px) {
    grid-template-columns: auto 1fr;
    gap: 8px;
  }
`;

const LeftBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
`;

const RightBlock = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-width: 0;
  gap: 10px;

  @media (max-width: 640px) {
    gap: 8px;
  }
`;

const Logo = styled.h1`
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  min-height: 42px;

  a {
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    height: 42px;
  }

  @media (max-width: 640px) {
    min-height: 38px;

    a {
      height: 38px;
    }
  }
`;

const LogoImagem = styled.img`
  display: block;
  height: 140px;
  width: auto;
  object-fit: contain;

  @media (max-width: 900px) {
    height: 100px;
  }

  @media (max-width: 640px) {
    height: 100px;
  }
`;

const ComoFuncionaLink = styled(Link)`

  min-height: 42px;

  padding: 0 12px;

  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 7px;

  border: 1px solid rgba(96, 165, 250, 0.22);

  border-radius: 12px;

  background: rgba(59, 130, 246, 0.07);

  color: #bfdbfe;

  font-size: 0.82rem;

  font-weight: 800;

  text-decoration: none;

  white-space: nowrap;

  &:hover {

    border-color: rgba(96, 165, 250, 0.38);

    background: rgba(59, 130, 246, 0.13);

    color: #ffffff;

  }

  @media (max-width: 900px) {

    width: 42px;

    padding: 0;

  }

  @media (max-width: 640px) {

    width: 38px;

    min-height: 38px;

    border-radius: 12px;

  }

`;

const ComoFuncionaIcon = styled.span`

  width: 19px;

  height: 19px;

  display: grid;

  place-items: center;

  flex: 0 0 auto;

  border-radius: 50%;

  background: rgba(96, 165, 250, 0.17);

  color: #93c5fd;

  font-size: 0.72rem;

  font-weight: 900;

`;

const ComoFuncionaTexto = styled.span`

  @media (max-width: 900px) {

    display: none;

  }

`;

const GuestActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
`;

const UserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  justify-content: flex-end;
  min-width: 0;
`;

const DesktopSearchForm = styled.form`
  position: relative;
  width: min(440px, 32vw);
  min-width: 220px;

  @media (max-width: 900px) {
    width: min(300px, 28vw);
    min-width: 180px;
  }

  @media (max-width: 640px) {
    display: none;
  }
`;

const MobileSearchRow = styled.div`
  display: none;

  @media (max-width: 640px) {
    display: block;
    margin-top: 10px;
  }
`;

const SearchForm = styled.form`
  position: relative;
  width: 100%;
`;

const SearchBoxWrap = styled.div`
  position: relative;
  width: 100%;
`;

const SearchDropdown = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 8px);

  background: linear-gradient(180deg, #0f172a, #111827);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.38);

  padding: 6px;
  z-index: 90;
  overflow: hidden;
`;

const SearchSectionTitle = styled.div`
  padding: 8px 10px 5px;
  color: #64748b;
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const SearchOption = styled.button`
  width: 100%;
  border: 0;
  border-radius: 12px;
  background: ${({ $active }) =>
    $active ? 'rgba(59, 130, 246, 0.16)' : 'transparent'};
  color: #f8fafc;
  padding: 10px;

  display: flex;
  align-items: center;
  gap: 10px;

  text-align: left;
  cursor: pointer;

  &:hover {
    background: rgba(59, 130, 246, 0.16);
  }
`;

const SearchOptionAvatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 999px;

  display: grid;
  place-items: center;
  flex: 0 0 auto;
`;

const SearchUserAvatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 999px;

  display: grid;
  place-items: center;
  flex: 0 0 auto;

  background: rgba(59, 130, 246, 0.17);
  color: #93c5fd;
  font-size: 0.9rem;
  font-weight: 900;
`;

const SearchOptionText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;

  strong {
    color: #f8fafc;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    color: #94a3b8;
    font-size: 0.75rem;
  }
`;

const SearchPlanBadge = styled.span`
  margin-left: auto;
  padding: 4px 7px;
  border-radius: 999px;

  background: ${({ $premium }) =>
    $premium ? 'rgba(250, 204, 21, 0.11)' : 'rgba(34, 197, 94, 0.09)'};

  color: ${({ $premium }) => ($premium ? '#fde68a' : '#86efac')};

  border: 1px solid
    ${({ $premium }) =>
      $premium ? 'rgba(250, 204, 21, 0.2)' : 'rgba(34, 197, 94, 0.16)'};

  font-size: 0.62rem;
  font-weight: 900;
  text-transform: uppercase;
  white-space: nowrap;
`;

const SearchEmpty = styled.div`
  padding: 12px;
  color: #94a3b8;
  font-size: 0.86rem;
  text-align: center;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1rem;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 14px 0 42px;

  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
  outline: none;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    border-color: rgba(96, 165, 250, 0.5);
    background: rgba(255, 255, 255, 0.07);
  }
`;

const IconWrap = styled.div`
  position: relative;
  flex: 0 0 auto;
`;

const IconButton = styled.button`
  position: relative;
  height: 42px;
  width: 42px;

  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.05);
  color: white;

  cursor: pointer;
  font-size: 1.05rem;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  @media (max-width: 640px) {
    height: 38px;
    width: 38px;
    border-radius: 12px;
  }
`;

const Bell = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const Badge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;

  min-width: 19px;
  height: 19px;
  padding: 0 5px;

  border-radius: 999px;
  background: linear-gradient(180deg, #ef4444, #dc2626);
  color: #fff;

  font-size: 11px;
  font-weight: 800;

  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const NotifMobileOverlay = styled.div`
  display: none;

  @media (max-width: 640px) {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(2, 6, 23, 0.72);
    z-index: 69;
  }
`;

const NotifDropdown = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 10px);

  width: 390px;
  max-width: min(390px, calc(100vw - 20px));

  background: linear-gradient(180deg, #0f172a, #111827);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 16px;
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.35);

  overflow: hidden;
  z-index: 70;

  @media (max-width: 640px) {
    position: fixed;
    left: 50%;
    right: auto;
    top: 76px;
    transform: translateX(-50%);

    width: calc(100vw - 16px);
    max-width: 430px;
    max-height: calc(100vh - 96px);
    border-radius: 18px;
  }
`;

const NotifHeader = styled.div`
  padding: 14px 16px;

  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;

  border-bottom: 1px solid rgba(148, 163, 184, 0.1);

  strong {
    display: block;
    color: #f8fafc;
    font-size: 0.95rem;
  }

  small {
    color: #94a3b8;
  }

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

const NotifHeaderText = styled.div`
  min-width: 0;
`;

const NotifHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
`;

const MarkAllBtn = styled.button`
  border: 0;
  background: transparent;
  color: #60a5fa;
  font-weight: 700;
  cursor: pointer;
`;

const CloseNotifBtn = styled.button`
  display: none;

  @media (max-width: 640px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    height: 32px;
    width: 32px;

    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.04);
    color: #e5e7eb;

    cursor: pointer;
    font-size: 0.95rem;
  }
`;

const NotifList = styled.div`
  max-height: 420px;
  overflow: auto;

  @media (max-width: 640px) {
    max-height: calc(100vh - 190px);
  }
`;

const NotifItem = styled.button`
  width: 100%;
  border: 0;
  padding: 14px 16px;

  display: flex;
  gap: 12px;

  text-align: left;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

  background: ${({ $unread }) =>
    $unread ? 'rgba(59,130,246,.08)' : 'transparent'};

  border-bottom: 1px solid rgba(148, 163, 184, 0.08);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  @media (max-width: 640px) {
    padding: 14px 14px 15px;
  }
`;

const NotifDot = styled.span`
  width: 10px;
  height: 10px;
  margin-top: 6px;

  border-radius: 999px;
  background: ${({ $unread }) => ($unread ? '#22c55e' : '#334155')};

  flex: 0 0 auto;
`;

const NotifBody = styled.div`
  strong {
    color: #f8fafc;
    display: block;
    margin-bottom: 4px;
    font-size: 0.92rem;
  }

  p {
    color: #cbd5e1;
    margin: 0 0 6px;
    line-height: 1.35;
    font-size: 0.9rem;
  }

  small {
    color: #64748b;
  }

  @media (max-width: 640px) {
    strong {
      font-size: 0.9rem;
    }

    p {
      font-size: 0.88rem;
    }
  }
`;

const NotifEmpty = styled.div`
  padding: 22px 16px;
  color: #94a3b8;
  text-align: center;
`;

const BancoWrap = styled.div`
  position: relative;
  flex: 0 0 auto;
`;

const Dropdown = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 8px);

  min-width: 220px;
  max-width: min(240px, calc(100vw - 20px));

  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 12px;

  padding: 8px;

  display: flex;
  flex-direction: column;

  z-index: 50;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.25);
`;

const DropLink = styled(Link)`
  color: #e5e7eb;
  text-decoration: none;

  padding: 10px 12px;
  border-radius: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const BaseButton = styled.button`
  border: none;
  border-radius: 14px;

  padding: 10px 14px;
  min-height: 42px;

  color: white;
  font-size: 0.92rem;
  font-weight: 800;
  text-decoration: none;

  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  line-height: 1;
  white-space: nowrap;

  @media (max-width: 640px) {
    min-height: 38px;
    padding: 9px 12px;
    border-radius: 12px;
    font-size: 0.88rem;
  }
`;

const BotaoAzul = styled(BaseButton)`
  background: #2563eb;

  &:hover {
    background: #1d4ed8;
  }
`;

const BotaoVerde = styled(BaseButton)`
  background: #16a34a;

  &:hover {
    background: #15803d;
  }
`;

const Botao = styled(BaseButton)`
  background: #334155;

  &:hover {
    background: #475569;
  }
`;

const UserAndSaldo = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 900px) {
    gap: 6px;
  }

  @media (max-width: 640px) {
    gap: 6px;
  }
`;

const SaldoInline = styled.span`
  font-weight: 800;
`;