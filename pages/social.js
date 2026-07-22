import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import api from '../lib/api';
import withAuth from '../components/withAuth';

function formatarDataRelativa(data) {
  if (!data) return '';

  try {
    const agora = new Date();
    const dataEvento = new Date(data);
    const diffMs = agora.getTime() - dataEvento.getTime();
    const diffMinutos = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMinutos / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffMinutos < 1) return 'agora';
    if (diffMinutos < 60) return `${diffMinutos} min`;
    if (diffHoras < 24) return `${diffHoras} h`;
    if (diffDias < 7) return `${diffDias} d`;

    return dataEvento.toLocaleDateString('pt-BR');
  } catch {
    return '';
  }
}

function nomeExibicao(usuario) {
  return (
    usuario?.nomePublico ||
    usuario?.nomeUsuario ||
    usuario?.nome ||
    'Usuário'
  );
}

function getEventoIcone(tipo) {
  switch (tipo) {
    case 'FOLLOW_USER':
      return '👥';

    case 'PRIVATE_RANKING_CREATED':
      return '🏆';

    case 'PRIVATE_RANKING_JOINED':
    case 'PRIVATE_RANKING_INVITE_ACCEPTED':
      return '🎟️';

    case 'RANKING_POSITION_CHANGED':
      return '📈';

    case 'TRADE_EXECUTED':
      return '⚡';

    case 'MILESTONE_RENTABILITY':
      return '🚀';

    default:
      return '📣';
  }
}

function getEventoCategoria(tipo) {
  switch (tipo) {
    case 'FOLLOW_USER':
      return 'Social';

    case 'PRIVATE_RANKING_CREATED':
    case 'PRIVATE_RANKING_JOINED':
    case 'PRIVATE_RANKING_INVITE_ACCEPTED':
      return 'Ranking privado';

    case 'RANKING_POSITION_CHANGED':
      return 'Ranking';

    case 'TRADE_EXECUTED':
      return 'Mercado';

    case 'MILESTONE_RENTABILITY':
      return 'Performance';

    default:
      return 'Comunidade';
  }
}

function montarTituloEvento(evento) {
  if (evento?.titulo) return evento.titulo;

  const usuario = nomeExibicao(evento?.usuario);

  switch (evento?.tipo) {
    case 'FOLLOW_USER':
      return `${usuario} começou a seguir outro usuário`;

    case 'PRIVATE_RANKING_CREATED':
      return `${usuario} criou um ranking privado`;

    case 'PRIVATE_RANKING_JOINED':
      return `${usuario} entrou em um ranking privado`;

    case 'PRIVATE_RANKING_INVITE_ACCEPTED':
      return `${usuario} aceitou um convite para ranking privado`;

    case 'RANKING_POSITION_CHANGED':
      return `${usuario} mudou de posição no ranking`;

    case 'TRADE_EXECUTED':
      return `${usuario} executou uma negociação`;

    case 'MILESTONE_RENTABILITY':
      return `${usuario} atingiu uma nova marca de rentabilidade`;

    default:
      return 'Novo acontecimento na comunidade';
  }
}

function montarTextoEvento(evento) {
  if (evento?.mensagem) return evento.mensagem;

  const usuarioAlvo = evento?.usuarioAlvo
    ? nomeExibicao(evento.usuarioAlvo)
    : '';

  const rankingPrivado = evento?.rankingPrivado?.nome || '';

  switch (evento?.tipo) {
    case 'FOLLOW_USER':
      return usuarioAlvo
        ? `Agora está acompanhando ${usuarioAlvo}.`
        : 'Novo vínculo social na comunidade.';

    case 'PRIVATE_RANKING_CREATED':
      return rankingPrivado
        ? `Ranking criado: ${rankingPrivado}.`
        : 'Um novo ranking privado foi criado.';

    case 'PRIVATE_RANKING_JOINED':
    case 'PRIVATE_RANKING_INVITE_ACCEPTED':
      return rankingPrivado
        ? `Participando do ranking ${rankingPrivado}.`
        : 'Nova participação em ranking privado.';

    case 'RANKING_POSITION_CHANGED':
      return 'A classificação da temporada foi atualizada.';

    case 'TRADE_EXECUTED':
      return 'Uma negociação movimentou o mercado simulado.';

    case 'MILESTONE_RENTABILITY':
      return 'Uma nova marca de performance foi alcançada.';

    default:
      return 'Acompanhe os principais movimentos da comunidade TradeSports.';
  }
}

function SocialPage() {
  const router = useRouter();

  const [eventos, setEventos] = useState([]);
  const [carregandoFeed, setCarregandoFeed] = useState(true);
  const [erroFeed, setErroFeed] = useState('');
  const [filtro, setFiltro] = useState('todos');

  const [planoUsuarioLogado, setPlanoUsuarioLogado] = useState('lite');

  const usuarioLogadoPremium = planoUsuarioLogado === 'premium';

  const eventosFiltrados = useMemo(() => {
    if (filtro === 'todos') return eventos;

    if (filtro === 'social') {
      return eventos.filter((evento) => evento.tipo === 'FOLLOW_USER');
    }

    if (filtro === 'rankings') {
      return eventos.filter((evento) =>
        [
          'PRIVATE_RANKING_CREATED',
          'PRIVATE_RANKING_JOINED',
          'PRIVATE_RANKING_INVITE_ACCEPTED',
          'RANKING_POSITION_CHANGED',
        ].includes(evento.tipo)
      );
    }

    if (filtro === 'mercado') {
      return eventos.filter((evento) =>
        ['TRADE_EXECUTED', 'MILESTONE_RENTABILITY'].includes(evento.tipo)
      );
    }

    return eventos;
  }, [eventos, filtro]);

  async function carregarPlanoUsuario() {
    try {
      const { data } = await api.get('/usuario/plano');

      setPlanoUsuarioLogado(
        data?.plano === 'premium' || data?.planoEfetivo === 'premium'
          ? 'premium'
          : 'lite'
      );
    } catch (err) {
      console.error('Erro ao carregar plano:', err);
      setPlanoUsuarioLogado('lite');
    }
  }

  async function carregarFeed() {
    try {
      setCarregandoFeed(true);
      setErroFeed('');

      const { data } = await api.get('/social/feed', {
        params: {
          limit: 50,
        },
      });

      setEventos(
        Array.isArray(data?.eventos)
          ? data.eventos
          : Array.isArray(data?.feed)
          ? data.feed
          : []
      );
    } catch (err) {
      console.error('Erro ao carregar feed social:', err);

      if (err?.response?.status === 404) {
        setEventos([]);
        setErroFeed('');
        return;
      }

      setErroFeed(
        err?.response?.data?.erro ||
          'Não foi possível carregar o feed da comunidade.'
      );

      setEventos([]);
    } finally {
      setCarregandoFeed(false);
    }
  }

  function abrirDestinoEvento(evento) {
    const targetUrl =
      evento?.targetUrl ||
      evento?.metadata?.targetUrl ||
      '';

    if (targetUrl) {
      router.push(targetUrl);
      return;
    }

    if (evento?.usuarioId || evento?.usuario?.id || evento?.usuario?._id) {
      router.push(
        `/perfil/${evento.usuarioId || evento.usuario.id || evento.usuario._id}`
      );
    }
  }

  useEffect(() => {
    carregarPlanoUsuario();
    carregarFeed();
  }, []);

  return (
    <Container>
      <Cabecalho>
        <CabecalhoTexto>
          <Eyebrow>Feed</Eyebrow>

          <Titulo>
            Acompanhe os principais movimentos da TradeSports
          </Titulo>

          <Subtitulo>
            Veja atividades sociais, rankings privados, mudanças de posição e
            marcos importantes dos usuários da plataforma.
          </Subtitulo>
        </CabecalhoTexto>

        <ResumoCard>
          

          <ResumoValor $premium={usuarioLogadoPremium}>
            {usuarioLogadoPremium ? 'Premium' : 'Lite'}
          </ResumoValor>
        </ResumoCard>
      </Cabecalho>

      <FeedToolbar>
        <BotaoAtualizar
          type="button"
          disabled={carregandoFeed}
          onClick={carregarFeed}
        >
          {carregandoFeed ? 'Atualizando...' : 'Atualizar'}
        </BotaoAtualizar>
      </FeedToolbar>

      {erroFeed && (
        <MensagemErro>
          {erroFeed}
        </MensagemErro>
      )}

      <GridPrincipal>
        <FeedColuna>
          {carregandoFeed ? (
            <EstadoCard>
              Carregando feed da comunidade...
            </EstadoCard>
          ) : eventosFiltrados.length === 0 ? (
            <FeedVazio>
              <FeedVazioIcone>
                📣
              </FeedVazioIcone>

              <FeedVazioTitulo>
                O feed ainda está vazio
              </FeedVazioTitulo>

            </FeedVazio>
          ) : (
            <FeedLista>
              {eventosFiltrados.map((evento) => {
                const usuario = evento.usuario || {};
                const nomeUsuario = nomeExibicao(usuario);
                const categoria = getEventoCategoria(evento.tipo);

                return (
                  <FeedCard
                    key={evento._id || evento.id}
                    type="button"
                    onClick={() => abrirDestinoEvento(evento)}
                  >
                    <FeedIcone>
                      {getEventoIcone(evento.tipo)}
                    </FeedIcone>

                    <FeedConteudo>
                      <FeedMeta>
                        <span>{categoria}</span>

                        <small>
                          {formatarDataRelativa(
                            evento.createdAt || evento.criadoEm
                          )}
                        </small>
                      </FeedMeta>

                      <FeedTitulo>
                        {montarTituloEvento({
                          ...evento,
                          usuario: {
                            ...usuario,
                            nomePublico: nomeUsuario,
                          },
                        })}
                      </FeedTitulo>

                      <FeedTexto>
                        {montarTextoEvento(evento)}
                      </FeedTexto>

                      {usuario?.id || usuario?._id ? (
                        <FeedUsuario>
                          <MiniAvatar>
                            {nomeUsuario.charAt(0).toUpperCase()}
                          </MiniAvatar>

                          <span>
                            {usuario.nomeUsuario
                              ? `@${usuario.nomeUsuario}`
                              : nomeUsuario}
                          </span>
                        </FeedUsuario>
                      ) : null}
                    </FeedConteudo>
                  </FeedCard>
                );
              })}
            </FeedLista>
          )}
        </FeedColuna>
      </GridPrincipal>
    </Container>
  );
}

export default withAuth(SocialPage);

const Container = styled.div`
  width: 100%;
  padding: 0.2rem 0 2rem;
  color: #f8fafc;
`;

const Cabecalho = styled.div`
  margin-bottom: 20px;
  padding: 8px 2px 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);

  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;

  @media (max-width: 760px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const CabecalhoTexto = styled.div`
  max-width: 820px;
`;

const Eyebrow = styled.div`
  margin-bottom: 7px;
  color: #60a5fa;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const Titulo = styled.h1`
  margin: 0;
  max-width: 860px;
  font-size: 1.65rem;
  color: #f8fafc;

  @media (max-width: 640px) {
    font-size: 1.32rem;
  }
`;

const Subtitulo = styled.p`
  margin: 8px 0 0;
  max-width: 760px;
  color: #94a3b8;
  font-size: 0.92rem;
  line-height: 1.55;
`;

const ResumoCard = styled.div`
  min-width: 145px;
  padding: 14px 16px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
`;

const ResumoLabel = styled.div`
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const ResumoValor = styled.strong`
  display: block;
  margin-top: 5px;
  color: ${({ $premium }) => ($premium ? '#fde68a' : '#86efac')};
  font-size: 1.15rem;
`;

const FeedToolbar = styled.div`
  margin-bottom: 16px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 700px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const Filtros = styled.div`
  padding: 5px;
  width: fit-content;
  max-width: 100%;

  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.58);

  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 700px) {
    width: 100%;
    overflow-x: auto;
  }
`;

const FiltroBotao = styled.button`
  min-height: 38px;
  border: 1px solid
    ${({ $ativo }) =>
      $ativo ? 'rgba(59, 130, 246, 0.4)' : 'transparent'};

  border-radius: 10px;
  padding: 8px 13px;

  background: ${({ $ativo }) =>
    $ativo ? 'rgba(37, 99, 235, 0.22)' : 'transparent'};

  color: ${({ $ativo }) => ($ativo ? '#eff6ff' : '#94a3b8')};

  font-size: 0.8rem;
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    color: #f8fafc;
    background: rgba(59, 130, 246, 0.12);
  }

  @media (max-width: 700px) {
    flex: 1;
  }
`;

const BotaoAtualizar = styled.button`
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  padding: 10px 13px;

  background: rgba(255, 255, 255, 0.045);
  color: #e2e8f0;
  font-size: 0.8rem;
  font-weight: 900;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background: rgba(59, 130, 246, 0.12);
  }
`;

const GridPrincipal = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const FeedColuna = styled.section`
  min-width: 0;
`;

const FeedLista = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FeedCard = styled.button`
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 18px;
  padding: 15px;

  background:
    radial-gradient(
      circle at top right,
      rgba(59, 130, 246, 0.08),
      transparent 34%
    ),
    rgba(15, 23, 42, 0.66);

  display: grid;
  grid-template-columns: 46px 1fr;
  gap: 13px;

  text-align: left;
  cursor: pointer;

  &:hover {
    border-color: rgba(59, 130, 246, 0.28);
    background:
      radial-gradient(
        circle at top right,
        rgba(59, 130, 246, 0.13),
        transparent 36%
      ),
      rgba(15, 23, 42, 0.76);
  }

  @media (max-width: 640px) {
    grid-template-columns: 40px 1fr;
    padding: 13px;
    border-radius: 16px;
  }
`;

const FeedIcone = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 999px;

  display: grid;
  place-items: center;

  background: rgba(59, 130, 246, 0.14);
  border: 1px solid rgba(59, 130, 246, 0.2);

  font-size: 1.15rem;

  @media (max-width: 640px) {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
`;

const FeedConteudo = styled.div`
  min-width: 0;
`;

const FeedMeta = styled.div`
  margin-bottom: 5px;

  display: flex;
  align-items: center;
  gap: 8px;

  span {
    color: #60a5fa;
    font-size: 0.68rem;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  small {
    color: #64748b;
    font-size: 0.72rem;
    font-weight: 800;
  }
`;

const FeedTitulo = styled.strong`
  display: block;
  color: #f8fafc;
  font-size: 0.98rem;
  line-height: 1.35;
`;

const FeedTexto = styled.p`
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 0.84rem;
  line-height: 1.45;
`;

const FeedUsuario = styled.div`
  margin-top: 11px;

  display: flex;
  align-items: center;
  gap: 8px;

  span {
    color: #cbd5e1;
    font-size: 0.78rem;
    font-weight: 800;
  }
`;

const MiniAvatar = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 999px;

  display: grid;
  place-items: center;

  background: rgba(59, 130, 246, 0.17);
  color: #93c5fd;
  font-size: 0.68rem;
  font-weight: 950;
`;

const LateralColuna = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const LateralCard = styled.section`
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 18px;

  background:
    radial-gradient(
      circle at top right,
      rgba(250, 204, 21, 0.08),
      transparent 34%
    ),
    rgba(15, 23, 42, 0.62);
`;

const LateralTitulo = styled.strong`
  display: block;
  color: #f8fafc;
  font-size: 0.95rem;
`;

const LateralTexto = styled.p`
  margin: 7px 0 0;
  color: #94a3b8;
  font-size: 0.82rem;
  line-height: 1.5;
`;

const ListaInfo = styled.ul`
  margin: 12px 0 0;
  padding-left: 18px;
  color: #cbd5e1;
  font-size: 0.8rem;
  line-height: 1.7;

  li::marker {
    color: #60a5fa;
  }
`;

const BotaoSecundario = styled.button`
  margin-top: 13px;
  width: 100%;

  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  padding: 10px 13px;

  background: rgba(255, 255, 255, 0.045);
  color: #e2e8f0;
  font-size: 0.8rem;
  font-weight: 900;
  cursor: pointer;

  &:hover {
    background: rgba(59, 130, 246, 0.12);
  }
`;

const FeedVazio = styled.div`
  padding: 38px 18px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 18px;

  background: rgba(15, 23, 42, 0.62);

  text-align: center;
`;

const FeedVazioIcone = styled.div`
  margin-bottom: 10px;
  font-size: 2rem;
`;

const FeedVazioTitulo = styled.strong`
  display: block;
  color: #f8fafc;
  font-size: 1rem;
`;

const FeedVazioTexto = styled.p`
  margin: 7px auto 0;
  max-width: 520px;
  color: #94a3b8;
  font-size: 0.86rem;
  line-height: 1.5;
`;

const EstadoCard = styled.div`
  padding: 28px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 15px;

  color: #94a3b8;
  text-align: center;
  background: rgba(255, 255, 255, 0.025);
`;

const MensagemErro = styled.div`
  margin: 12px 0;
  padding: 11px 13px;
  border: 1px solid rgba(239, 68, 68, 0.24);
  border-radius: 12px;

  background: rgba(239, 68, 68, 0.08);
  color: #fca5a5;
  font-size: 0.82rem;
`;