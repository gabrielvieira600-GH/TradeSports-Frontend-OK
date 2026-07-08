import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import api from '../lib/api';
import withAuth from '../components/withAuth';

function formatarData(data) {
  if (!data) return '';

  try {
    return new Date(data).toLocaleDateString('pt-BR');
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

function SocialPage() {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

  const [carregandoBusca, setCarregandoBusca] = useState(false);
  const [carregandoPerfil, setCarregandoPerfil] = useState(false);
  const [erroBusca, setErroBusca] = useState('');
  const [erroPerfil, setErroPerfil] = useState('');

  const [planoUsuarioLogado, setPlanoUsuarioLogado] = useState('lite');
  const [rankingsCriados, setRankingsCriados] = useState([]);
  const [carregandoRankings, setCarregandoRankings] = useState(false);

  const [rankingSelecionadoParaConvite, setRankingSelecionadoParaConvite] =
    useState('');
  const [mensagemConvite, setMensagemConvite] = useState('');
  const [enviandoConvite, setEnviandoConvite] = useState(false);
  const [erroConvite, setErroConvite] = useState('');
  const [sucessoConvite, setSucessoConvite] = useState('');

  const [seguindoProcessando, setSeguindoProcessando] = useState(false);

  const usuarioLogadoPremium = planoUsuarioLogado === 'premium';

  const perfilSelecionadoPremium =
    usuarioSelecionado?.plano === 'premium' ||
    usuarioSelecionado?.premiumAtivo === true;

  const podeConvidarParaRanking = useMemo(() => {
    return (
      usuarioLogadoPremium &&
      perfilSelecionadoPremium &&
      rankingsCriados.length > 0 &&
      usuarioSelecionado?.id
    );
  }, [
    usuarioLogadoPremium,
    perfilSelecionadoPremium,
    rankingsCriados.length,
    usuarioSelecionado,
  ]);

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

  async function carregarRankingsPrivadosCriados() {
    try {
      setCarregandoRankings(true);

      const { data } = await api.get('/rankings-privados');

      const criados = Array.isArray(data?.criados) ? data.criados : [];

      setRankingsCriados(criados);

      if (criados.length > 0) {
        setRankingSelecionadoParaConvite((atual) => atual || criados[0]._id);
      }
    } catch (err) {
      console.error('Erro ao carregar rankings privados:', err);
      setRankingsCriados([]);
    } finally {
      setCarregandoRankings(false);
    }
  }

  async function buscarUsuarios(e) {
    e?.preventDefault?.();

    const termo = String(busca || '').trim();

    if (termo.length < 2) {
      setErroBusca('Digite pelo menos 2 caracteres para buscar.');
      setUsuarios([]);
      return;
    }

    try {
      setCarregandoBusca(true);
      setErroBusca('');

      const { data } = await api.get('/social/usuarios', {
        params: {
          busca: termo,
          limit: 20,
        },
      });

      setUsuarios(Array.isArray(data?.usuarios) ? data.usuarios : []);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);

      setErroBusca(
        err?.response?.data?.erro || 'Não foi possível buscar usuários.'
      );

      setUsuarios([]);
    } finally {
      setCarregandoBusca(false);
    }
  }

    function abrirPerfil(usuarioId) {
    if (!usuarioId) return;

    router.push(`/perfil/${usuarioId}`);
  }

  async function seguirUsuario() {
    if (!usuarioSelecionado?.id) return;

    try {
      setSeguindoProcessando(true);
      setErroPerfil('');

      const seguindoAtual = Boolean(usuarioSelecionado?.relacao?.seguindo);

      const endpoint = seguindoAtual
        ? `/social/usuarios/${usuarioSelecionado.id}/deixar-de-seguir`
        : `/social/usuarios/${usuarioSelecionado.id}/seguir`;

      const { data } = await api.post(endpoint);

      setUsuarioSelecionado((atual) => {
        if (!atual) return atual;

        return {
          ...atual,
          relacao: {
            ...(atual.relacao || {}),
            seguindo: Boolean(data?.seguindo),
          },
          estatisticas: {
            ...(atual.estatisticas || {}),
            seguidores:
              data?.estatisticas?.seguidores ??
              atual?.estatisticas?.seguidores ??
              0,
            seguindo:
              data?.estatisticas?.seguindo ??
              atual?.estatisticas?.seguindo ??
              0,
          },
        };
      });

      setUsuarios((atuais) =>
        atuais.map((usuario) => {
          if (String(usuario.id) !== String(usuarioSelecionado.id)) {
            return usuario;
          }

          return {
            ...usuario,
            seguindo: Boolean(data?.seguindo),
            estatisticas: {
              ...(usuario.estatisticas || {}),
              seguidores:
                data?.estatisticas?.seguidores ??
                usuario?.estatisticas?.seguidores ??
                0,
            },
          };
        })
      );
    } catch (err) {
      console.error('Erro ao seguir/deixar de seguir:', err);

      setErroPerfil(
        err?.response?.data?.erro ||
          'Não foi possível atualizar a relação social.'
      );
    } finally {
      setSeguindoProcessando(false);
    }
  }

  async function enviarConviteRanking(e) {
    e.preventDefault();

    if (!usuarioSelecionado?.id) return;

    if (!rankingSelecionadoParaConvite) {
      setErroConvite('Selecione um ranking privado.');
      return;
    }

    try {
      setEnviandoConvite(true);
      setErroConvite('');
      setSucessoConvite('');

      await api.post('/ranking-convites', {
        rankingId: rankingSelecionadoParaConvite,
        destinatarioId: usuarioSelecionado.id,
        mensagem: String(mensagemConvite || '').trim(),
      });

      setSucessoConvite('Convite enviado com sucesso.');
      setMensagemConvite('');
    } catch (err) {
      console.error('Erro ao enviar convite:', err);

      setErroConvite(
        err?.response?.data?.erro ||
          'Não foi possível enviar o convite para ranking privado.'
      );
    } finally {
      setEnviandoConvite(false);
    }
  }

  useEffect(() => {
    carregarPlanoUsuario();
  }, []);

  useEffect(() => {
    if (usuarioLogadoPremium) {
      carregarRankingsPrivadosCriados();
    }
  }, [usuarioLogadoPremium]);

  return (
    <Container>
      <Cabecalho>
        <div>
          <Eyebrow>Comunidade</Eyebrow>

          <Titulo>
            Encontre usuários, siga perfis e convide para rankings privados
          </Titulo>

          <Subtitulo>
            Busque outros traders da TradeSports, acompanhe perfis e monte
            competições privadas com usuários Premium.
          </Subtitulo>
        </div>

        <ResumoCard>
          <ResumoLabel>Seu plano</ResumoLabel>

          <ResumoValor $premium={usuarioLogadoPremium}>
            {usuarioLogadoPremium ? 'Premium' : 'Lite'}
          </ResumoValor>
        </ResumoCard>
      </Cabecalho>

      <GridPrincipal>
        <PainelBusca>
          <BuscaForm onSubmit={buscarUsuarios}>
            <CampoBusca
              type="text"
              value={busca}
              placeholder="Buscar por nome ou @usuário"
              onChange={(e) => {
                setBusca(e.target.value);
                setErroBusca('');
              }}
            />

            <BotaoPrimario type="submit" disabled={carregandoBusca}>
              {carregandoBusca ? 'Buscando...' : 'Buscar'}
            </BotaoPrimario>
          </BuscaForm>

          {erroBusca && <MensagemErro>{erroBusca}</MensagemErro>}

          {carregandoBusca ? (
            <EstadoCard>Buscando usuários...</EstadoCard>
          ) : usuarios.length === 0 ? (
            <EstadoCard>
              Busque usuários para visualizar perfis da comunidade.
            </EstadoCard>
          ) : (
            <ListaUsuarios>
              {usuarios.map((usuario) => (
                <UsuarioItem
                  key={usuario.id}
                  type="button"
                  $ativo={
                    String(usuarioSelecionado?.id) === String(usuario.id)
                  }
                  onClick={() => abrirPerfil(usuario.id)}
                >
                  <Avatar>
                    {nomeExibicao(usuario).charAt(0).toUpperCase()}
                  </Avatar>

                  <UsuarioResumo>
                    <strong>
                      {usuario.nomeUsuario
                        ? `@${usuario.nomeUsuario}`
                        : usuario.nomePublico}
                    </strong>

                    <span>
                      {usuario.estatisticas?.seguidores || 0} seguidores ·{' '}
                      {usuario.quantidadePosicoes || 0} posições
                    </span>
                  </UsuarioResumo>

                  <PlanoBadge $premium={usuario.plano === 'premium'}>
                    {usuario.plano === 'premium' ? 'Premium' : 'Lite'}
                  </PlanoBadge>
                </UsuarioItem>
              ))}
            </ListaUsuarios>
          )}
        </PainelBusca>

        <PainelPerfil>
          {carregandoPerfil ? (
            <EstadoCard>Carregando perfil...</EstadoCard>
          ) : erroPerfil ? (
            <MensagemErro>{erroPerfil}</MensagemErro>
          ) : !usuarioSelecionado ? (
            <PerfilVazio>
              <PerfilVazioTitulo>
                Selecione um perfil
              </PerfilVazioTitulo>

              <PerfilVazioTexto>
                Clique em um usuário encontrado na busca para ver detalhes,
                seguir e convidar para rankings privados.
              </PerfilVazioTexto>
            </PerfilVazio>
          ) : (
            <>
              <PerfilCard>
                <PerfilTopo>
                  <PerfilAvatar>
                    {nomeExibicao(usuarioSelecionado)
                      .charAt(0)
                      .toUpperCase()}
                  </PerfilAvatar>

                  <PerfilInfo>
                    <PerfilNome>
                      {usuarioSelecionado.nomeUsuario
                        ? `@${usuarioSelecionado.nomeUsuario}`
                        : usuarioSelecionado.nomePublico}
                    </PerfilNome>

                    {usuarioSelecionado.nome &&
                      usuarioSelecionado.nomeUsuario && (
                        <PerfilSubnome>
                          {usuarioSelecionado.nome}
                        </PerfilSubnome>
                      )}

                    <PerfilBadges>
                      <PlanoBadge
                        $premium={usuarioSelecionado.plano === 'premium'}
                      >
                        {usuarioSelecionado.plano === 'premium'
                          ? 'Premium'
                          : 'Lite'}
                      </PlanoBadge>

                      {usuarioSelecionado.relacao?.segueVoce && (
                        <SegueVoceBadge>
                          Segue você
                        </SegueVoceBadge>
                      )}
                    </PerfilBadges>
                  </PerfilInfo>
                </PerfilTopo>

                <PerfilMetricas>
                  <Metrica>
                    <span>Seguidores</span>
                    <strong>
                      {Number(
                        usuarioSelecionado.estatisticas?.seguidores || 0
                      ).toLocaleString('pt-BR')}
                    </strong>
                  </Metrica>

                  <Metrica>
                    <span>Seguindo</span>
                    <strong>
                      {Number(
                        usuarioSelecionado.estatisticas?.seguindo || 0
                      ).toLocaleString('pt-BR')}
                    </strong>
                  </Metrica>

                  <Metrica>
                    <span>Posições</span>
                    <strong>
                      {Number(
                        usuarioSelecionado.mercado?.quantidadePosicoes || 0
                      ).toLocaleString('pt-BR')}
                    </strong>
                  </Metrica>

                  <Metrica>
                    <span>Na plataforma desde</span>
                    <strong>
                      {formatarData(usuarioSelecionado.criadoEm) || '-'}
                    </strong>
                  </Metrica>
                </PerfilMetricas>

                <PerfilAcoes>
                  <BotaoPrimario
                    type="button"
                    disabled={seguindoProcessando}
                    onClick={seguirUsuario}
                  >
                    {seguindoProcessando
                      ? 'Atualizando...'
                      : usuarioSelecionado.relacao?.seguindo
                      ? 'Deixar de seguir'
                      : 'Seguir'}
                  </BotaoPrimario>
                </PerfilAcoes>
              </PerfilCard>

              <ConviteCard>
                <ConviteTitulo>
                  Convidar para ranking privado
                </ConviteTitulo>

                {!usuarioLogadoPremium ? (
                  <ConviteTexto>
                    Apenas usuários Premium podem convidar outros usuários para
                    rankings privados.
                  </ConviteTexto>
                ) : !perfilSelecionadoPremium ? (
                  <ConviteTexto>
                    Este usuário é Lite. Apenas usuários Premium podem
                    participar de rankings privados.
                  </ConviteTexto>
                ) : carregandoRankings ? (
                  <ConviteTexto>
                    Carregando seus rankings privados...
                  </ConviteTexto>
                ) : rankingsCriados.length === 0 ? (
                  <ConviteTexto>
                    Você ainda não criou rankings privados. Crie um ranking na
                    aba Privados para convidar outros usuários.
                  </ConviteTexto>
                ) : (
                  <ConviteForm onSubmit={enviarConviteRanking}>
                    <CampoGrupo>
                      <CampoLabel>
                        Ranking privado
                      </CampoLabel>

                      <SelectRanking
                        value={rankingSelecionadoParaConvite}
                        onChange={(e) => {
                          setRankingSelecionadoParaConvite(e.target.value);
                          setErroConvite('');
                          setSucessoConvite('');
                        }}
                      >
                        {rankingsCriados.map((ranking) => (
                          <option
                            key={ranking._id || ranking.id}
                            value={ranking._id || ranking.id}
                          >
                            {ranking.nome}
                          </option>
                        ))}
                      </SelectRanking>
                    </CampoGrupo>

                    <CampoGrupo>
                      <CampoLabel>
                        Mensagem opcional
                      </CampoLabel>

                      <TextareaConvite
                        value={mensagemConvite}
                        maxLength={500}
                        placeholder="Ex: Entra na nossa liga da Temporada Zero!"
                        onChange={(e) => {
                          setMensagemConvite(e.target.value);
                          setErroConvite('');
                          setSucessoConvite('');
                        }}
                      />
                    </CampoGrupo>

                    {erroConvite && (
                      <MensagemErro>
                        {erroConvite}
                      </MensagemErro>
                    )}

                    {sucessoConvite && (
                      <MensagemSucesso>
                        {sucessoConvite}
                      </MensagemSucesso>
                    )}

                    <BotaoConvite
                      type="submit"
                      disabled={!podeConvidarParaRanking || enviandoConvite}
                    >
                      {enviandoConvite
                        ? 'Enviando convite...'
                        : 'Convidar para ranking privado'}
                    </BotaoConvite>
                  </ConviteForm>
                )}
              </ConviteCard>
            </>
          )}
        </PainelPerfil>
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

const GridPrincipal = styled.div`
  display: grid;
  grid-template-columns: minmax(320px, 0.9fr) minmax(0, 1.2fr);
  gap: 18px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const PainelBusca = styled.section`
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.62);
`;

const PainelPerfil = styled.section`
  min-width: 0;
`;

const BuscaForm = styled.form`
  display: flex;
  gap: 8px;
  margin-bottom: 14px;

  @media (max-width: 560px) {
    flex-direction: column;
  }
`;

const CampoBusca = styled.input`
  flex: 1;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  padding: 11px 12px;

  background: rgba(15, 23, 42, 0.78);
  color: #f8fafc;
  font-size: 0.9rem;
  outline: none;

  &:focus {
    border-color: rgba(59, 130, 246, 0.55);
  }

  &::placeholder {
    color: #64748b;
  }
`;

const BotaoPrimario = styled.button`
  border: 1px solid rgba(59, 130, 246, 0.32);
  border-radius: 12px;
  padding: 10px 14px;

  background: rgba(59, 130, 246, 0.15);
  color: #bfdbfe;
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background: rgba(59, 130, 246, 0.23);
  }
`;

const ListaUsuarios = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const UsuarioItem = styled.button`
  width: 100%;
  border: 1px solid
    ${({ $ativo }) =>
      $ativo ? 'rgba(59, 130, 246, 0.45)' : 'rgba(148, 163, 184, 0.12)'};
  border-radius: 14px;
  padding: 11px;

  background: ${({ $ativo }) =>
    $ativo ? 'rgba(59, 130, 246, 0.11)' : 'rgba(255, 255, 255, 0.025)'};

  display: grid;
  grid-template-columns: 38px 1fr auto;
  align-items: center;
  gap: 10px;

  text-align: left;
  cursor: pointer;

  &:hover {
    background: rgba(59, 130, 246, 0.1);
  }
`;

const Avatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 999px;

  display: grid;
  place-items: center;

  background: rgba(59, 130, 246, 0.17);
  color: #93c5fd;
  font-size: 0.95rem;
  font-weight: 900;
`;

const UsuarioResumo = styled.div`
  min-width: 0;

  strong {
    display: block;
    color: #f8fafc;
    font-size: 0.86rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    display: block;
    margin-top: 2px;
    color: #94a3b8;
    font-size: 0.72rem;
  }
`;

const PlanoBadge = styled.span`
  width: fit-content;
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

const EstadoCard = styled.div`
  padding: 24px;
  border: 1px solid rgba(148, 163, 184, 0.11);
  border-radius: 15px;
  color: #94a3b8;
  text-align: center;
  background: rgba(255, 255, 255, 0.025);
`;

const PerfilVazio = styled(EstadoCard)`
  min-height: 260px;
  display: grid;
  place-content: center;
`;

const PerfilVazioTitulo = styled.strong`
  color: #f8fafc;
  font-size: 1rem;
`;

const PerfilVazioTexto = styled.p`
  margin: 7px auto 0;
  max-width: 460px;
  color: #94a3b8;
  line-height: 1.5;
`;

const PerfilCard = styled.article`
  margin-bottom: 16px;
  padding: 18px;
  border: 1px solid rgba(59, 130, 246, 0.22);
  border-radius: 18px;

  background:
    radial-gradient(
      circle at top right,
      rgba(59, 130, 246, 0.13),
      transparent 38%
    ),
    rgba(15, 23, 42, 0.7);
`;

const PerfilTopo = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
`;

const PerfilAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 999px;

  display: grid;
  place-items: center;

  background: linear-gradient(135deg, #2563eb, #60a5fa);
  color: #fff;
  font-size: 1.45rem;
  font-weight: 900;
`;

const PerfilInfo = styled.div`
  min-width: 0;
`;

const PerfilNome = styled.h2`
  margin: 0;
  color: #f8fafc;
  font-size: 1.2rem;
`;

const PerfilSubnome = styled.div`
  margin-top: 3px;
  color: #94a3b8;
  font-size: 0.84rem;
`;

const PerfilBadges = styled.div`
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
`;

const SegueVoceBadge = styled.span`
  width: fit-content;
  padding: 4px 7px;
  border-radius: 999px;

  background: rgba(59, 130, 246, 0.12);
  color: #bfdbfe;
  border: 1px solid rgba(59, 130, 246, 0.18);

  font-size: 0.62rem;
  font-weight: 900;
  text-transform: uppercase;
`;

const PerfilMetricas = styled.div`
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 680px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Metrica = styled.div`
  padding: 11px;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.04);

  span {
    display: block;
    margin-bottom: 4px;
    color: #94a3b8;
    font-size: 0.7rem;
  }

  strong {
    color: #f8fafc;
    font-size: 0.88rem;
  }
`;

const PerfilAcoes = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ConviteCard = styled.section`
  padding: 17px;
  border: 1px solid rgba(250, 204, 21, 0.18);
  border-radius: 18px;

  background:
    radial-gradient(
      circle at top right,
      rgba(250, 204, 21, 0.1),
      transparent 36%
    ),
    rgba(15, 23, 42, 0.68);
`;

const ConviteTitulo = styled.strong`
  display: block;
  color: #f8fafc;
  font-size: 1rem;
`;

const ConviteTexto = styled.p`
  margin: 7px 0 0;
  color: #94a3b8;
  font-size: 0.84rem;
  line-height: 1.5;
`;

const ConviteForm = styled.form`
  margin-top: 14px;
`;

const CampoGrupo = styled.label`
  display: block;
  margin-bottom: 13px;
`;

const CampoLabel = styled.span`
  display: block;
  margin-bottom: 6px;
  color: #cbd5e1;
  font-size: 0.76rem;
  font-weight: 800;
`;

const SelectRanking = styled.select`
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  padding: 11px 12px;

  background: rgba(15, 23, 42, 0.78);
  color: #f8fafc;
  font-size: 0.9rem;
  outline: none;

  &:focus {
    border-color: rgba(59, 130, 246, 0.55);
  }
`;

const TextareaConvite = styled.textarea`
  width: 100%;
  min-height: 88px;
  resize: vertical;

  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  padding: 11px 12px;

  background: rgba(15, 23, 42, 0.78);
  color: #f8fafc;
  font-size: 0.9rem;
  line-height: 1.45;
  outline: none;

  &:focus {
    border-color: rgba(59, 130, 246, 0.55);
  }

  &::placeholder {
    color: #64748b;
  }
`;

const BotaoConvite = styled.button`
  width: 100%;
  border: 1px solid rgba(250, 204, 21, 0.32);
  border-radius: 12px;
  padding: 11px 14px;

  background: rgba(250, 204, 21, 0.14);
  color: #fde68a;
  font-weight: 900;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background: rgba(250, 204, 21, 0.22);
  }
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

const MensagemSucesso = styled.div`
  margin: 12px 0;
  padding: 11px 13px;
  border: 1px solid rgba(34, 197, 94, 0.22);
  border-radius: 12px;

  background: rgba(34, 197, 94, 0.08);
  color: #86efac;
  font-size: 0.82rem;
`;