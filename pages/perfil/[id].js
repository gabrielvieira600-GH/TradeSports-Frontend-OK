import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import api from '../../lib/api';
import withAuth from '../../components/withAuth';
import ClubBadge from '../../components/ClubBadge';

function formatarMoeda(valor) {
  return `T$ ${Number(valor || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatarNumero(valor, casas = 0) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

function formatarPercentual(valor) {
  const numero = Number(valor || 0);

  return `${numero >= 0 ? '+' : ''}${numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

function formatarData(data) {
  if (!data) return '-';

  try {
    return new Date(data).toLocaleDateString('pt-BR');
  } catch {
    return '-';
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

function obterUsuarioLogadoId() {
  if (typeof window === 'undefined') return '';

  try {
    const usuarioSalvo = localStorage.getItem('usuario');

    const usuario =
      usuarioSalvo && usuarioSalvo !== 'undefined'
        ? JSON.parse(usuarioSalvo)
        : null;

    return String(
      usuario?._id ||
        usuario?.id ||
        usuario?.usuarioId ||
        usuario?.userId ||
        usuario?.mongoId ||
        ''
    );
  } catch {
    return '';
  }
}

function PerfilPage() {
  const router = useRouter();
  const { id } = router.query;

  const [usuario, setUsuario] = useState(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [erroPerfil, setErroPerfil] = useState('');
  const [usuarioLogadoId, setUsuarioLogadoId] = useState('');
  const [processandoFollow, setProcessandoFollow] = useState(false);
  const [modalSeguidoresAberto, setModalSeguidoresAberto] = useState(false);
const [seguidoresPerfil, setSeguidoresPerfil] = useState([]);
const [buscaSeguidores, setBuscaSeguidores] = useState('');
const [carregandoSeguidores, setCarregandoSeguidores] = useState(false);
const [erroSeguidores, setErroSeguidores] = useState('');
  const [planoUsuarioLogado, setPlanoUsuarioLogado] = useState('lite');
  const [rankingsCriados, setRankingsCriados] = useState([]);
  const [carregandoRankings, setCarregandoRankings] = useState(false);

  const [rankingSelecionadoParaConvite, setRankingSelecionadoParaConvite] =
    useState('');
  const [mensagemConvite, setMensagemConvite] = useState('');
  const [enviandoConvite, setEnviandoConvite] = useState(false);
  const [erroConvite, setErroConvite] = useState('');
  const [sucessoConvite, setSucessoConvite] = useState('');

  const usuarioLogadoPremium = planoUsuarioLogado === 'premium';

  const perfilPremium =
    usuario?.plano === 'premium' ||
    usuario?.premiumAtivo === true;

  const mercado = usuario?.mercado || {};
  const ranking = usuario?.ranking || {};

const rankingHeroLabel = perfilPremium
  ? 'Ranking Premium'
  : 'Ranking Geral';

const rankingHeroPosicao = perfilPremium
  ? ranking.premium
  : ranking.geral;
  const rentabilidadePositiva = Number(mercado.rentabilidade || 0) >= 0;
  const resultadoPositivo = Number(mercado.resultado || 0) >= 0;
  const perfilProprio =
  usuarioLogadoId &&
  usuario?.id &&
  String(usuarioLogadoId) === String(usuario.id);
  const podeVerPosicoes =
  Boolean(perfilProprio) || Boolean(usuarioLogadoPremium);
  const podeConvidar = useMemo(() => {
  return (
    !perfilProprio &&
    usuarioLogadoPremium &&
    perfilPremium &&
    rankingsCriados.length > 0 &&
    usuario?.id
  );
}, [
  perfilProprio,
  usuarioLogadoPremium,
  perfilPremium,
  rankingsCriados.length,
  usuario,
]);

  async function carregarPerfil() {
    if (!id) return;

    try {
      setCarregandoPerfil(true);
      setErroPerfil('');
      setErroConvite('');
      setSucessoConvite('');

      const { data } = await api.get(`/social/usuarios/${id}`);

      setUsuario(data?.usuario || null);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);

      setErroPerfil(
        err?.response?.data?.erro ||
          'Não foi possível carregar este perfil.'
      );

      setUsuario(null);
    } finally {
      setCarregandoPerfil(false);
    }
  }

  async function carregarPlanoUsuario() {
    try {
      const { data } = await api.get('/usuario/plano');

      const plano =
        data?.plano === 'premium' ||
        data?.planoEfetivo === 'premium'
          ? 'premium'
          : 'lite';

      setPlanoUsuarioLogado(plano);
    } catch (err) {
      console.error('Erro ao carregar plano do usuário:', err);
      setPlanoUsuarioLogado('lite');
    }
  }

  async function carregarRankingsPrivadosCriados() {
    try {
      setCarregandoRankings(true);

      const { data } = await api.get('/rankings-privados');

      const criados = Array.isArray(data?.criados)
        ? data.criados
        : [];

      setRankingsCriados(criados);

      if (criados.length > 0) {
        setRankingSelecionadoParaConvite((atual) => {
          if (atual) return atual;

          return criados[0]._id || criados[0].id || '';
        });
      }
    } catch (err) {
      console.error('Erro ao carregar rankings privados:', err);
      setRankingsCriados([]);
    } finally {
      setCarregandoRankings(false);
    }
  }

  async function alternarFollow() {
    if (!usuario?.id) return;

    try {
      setProcessandoFollow(true);
      setErroPerfil('');

      const seguindoAtual = Boolean(usuario?.relacao?.seguindo);

      const endpoint = seguindoAtual
        ? `/social/usuarios/${usuario.id}/deixar-de-seguir`
        : `/social/usuarios/${usuario.id}/seguir`;

      const { data } = await api.post(endpoint);

      setUsuario((atual) => {
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
    } catch (err) {
      console.error('Erro ao seguir/deixar de seguir:', err);

      setErroPerfil(
        err?.response?.data?.erro ||
          'Não foi possível atualizar a relação social.'
      );
    } finally {
      setProcessandoFollow(false);
    }
  }
  
  async function carregarSeguidoresPerfil(busca = '') {
  if (!usuario?.id) return;

  try {
    setCarregandoSeguidores(true);
    setErroSeguidores('');

    const { data } = await api.get(
      `/social/usuarios/${usuario.id}/seguidores`,
      {
        params: {
          busca,
          limit: 80,
        },
      }
    );

    setSeguidoresPerfil(
      Array.isArray(data?.usuarios) ? data.usuarios : []
    );
  } catch (err) {
    console.error('Erro ao carregar seguidores:', err);

    setErroSeguidores(
      err?.response?.data?.erro ||
        'Não foi possível carregar os seguidores deste perfil.'
    );

    setSeguidoresPerfil([]);
  } finally {
    setCarregandoSeguidores(false);
  }
}

function abrirModalSeguidores() {
  setBuscaSeguidores('');
  setErroSeguidores('');
  setModalSeguidoresAberto(true);
  carregarSeguidoresPerfil('');
}

function fecharModalSeguidores() {
  setModalSeguidoresAberto(false);
  setBuscaSeguidores('');
  setSeguidoresPerfil([]);
  setErroSeguidores('');
}

  async function enviarConviteRanking(e) {
    e.preventDefault();

    if (!usuario?.id) return;

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
        destinatarioId: usuario.id,
        mensagem: String(mensagemConvite || '').trim(),
      });

      setSucessoConvite('Convite enviado com sucesso.');
      setMensagemConvite('');
    } catch (err) {
      console.error('Erro ao enviar convite:', err);

      setErroConvite(
        err?.response?.data?.erro ||
          'Não foi possível enviar o convite.'
      );
    } finally {
      setEnviandoConvite(false);
    }
  }

  useEffect(() => {
    if (!router.isReady) return;

    carregarPerfil();
  }, [router.isReady, id]);

  useEffect(() => {
  setUsuarioLogadoId(obterUsuarioLogadoId());
  carregarPlanoUsuario();
}, []);

  useEffect(() => {
    if (usuarioLogadoPremium) {
      carregarRankingsPrivadosCriados();
    }
  }, [usuarioLogadoPremium]);
  
  useEffect(() => {
  if (!modalSeguidoresAberto || !usuario?.id) return;

  const timeout = setTimeout(() => {
    carregarSeguidoresPerfil(buscaSeguidores.trim());
  }, 280);

  return () => clearTimeout(timeout);
}, [buscaSeguidores, modalSeguidoresAberto, usuario?.id]);

  if (carregandoPerfil) {
    return (
      <Container>
        <EstadoCard>
          Carregando perfil...
        </EstadoCard>
      </Container>
    );
  }
  
  if (erroPerfil && !usuario) {
    return (
      <Container>
        <VoltarBotao type="button" onClick={() => router.push('/social')}>
          ← Voltar para Comunidade
        </VoltarBotao>

        <MensagemErro>
          {erroPerfil}
        </MensagemErro>
      </Container>
    );
  }

  if (!usuario) {
    return (
      <Container>
        <EstadoCard>
          Perfil não encontrado.
        </EstadoCard>
      </Container>
    );
  }
  
  

  return (
    <Container>
      <VoltarBotao type="button" onClick={() => router.push('/social')}>
        ← Voltar para Comunidade
      </VoltarBotao>

      {erroPerfil && (
        <MensagemErro>
          {erroPerfil}
        </MensagemErro>
      )}

      <HeroCard>
        <HeroLeft>
          <AvatarGrande>
            {nomeExibicao(usuario).charAt(0).toUpperCase()}
          </AvatarGrande>

          <NomeArea>
            <NomePrincipal>
              {usuario.nomeUsuario
                ? `@${usuario.nomeUsuario}`
                : nomeExibicao(usuario)}
            </NomePrincipal>

            {usuario.nome && usuario.nomeUsuario && (
              <NomeSecundario>
                {usuario.nome}
              </NomeSecundario>
            )}

            <BadgesLinha>
              <PlanoBadge $premium={perfilPremium}>
                {perfilPremium ? 'Premium' : 'Lite'}
              </PlanoBadge>

              {usuario.relacao?.segueVoce && (
                <SegueVoceBadge>
                  Segue você
                </SegueVoceBadge>
              )}

              
            </BadgesLinha>
          </NomeArea>
        </HeroLeft>

        <HeroRight>
  <HeroStat>
    <span>{rankingHeroLabel}</span>
    <strong>
      {rankingHeroPosicao
        ? `${rankingHeroPosicao}º`
        : '-'}
    </strong>
  </HeroStat>

  <HeroStat>
    <span>Rentabilidade geral</span>
    <strong className={rentabilidadePositiva ? 'positivo' : 'negativo'}>
      {formatarPercentual(mercado.rentabilidade)}
    </strong>
  </HeroStat>

  <HeroStat>
    <span>Patrimônio</span>
    <strong>
      {formatarMoeda(mercado.patrimonio)}
    </strong>
  </HeroStat>
</HeroRight>
      </HeroCard>

      <AcoesTopo>
  {perfilProprio ? (
    <BotaoSecundario type="button" disabled>
      Meu perfil
    </BotaoSecundario>
  ) : (
    <BotaoPrimario
      type="button"
      disabled={processandoFollow}
      onClick={alternarFollow}
    >
      {processandoFollow
        ? 'Atualizando...'
        : usuario.relacao?.seguindo
        ? 'Deixar de seguir'
        : 'Seguir'}
    </BotaoPrimario>
  )}

  <BotaoSecundario
    type="button"
    onClick={() => router.push('/convites')}
  >
    Ver convites
  </BotaoSecundario>
</AcoesTopo>

      <GridMetricas>
        <MetricaButton
  type="button"
  onClick={abrirModalSeguidores}
>
  <span>Seguidores</span>
  <strong>
    {formatarNumero(usuario.estatisticas?.seguidores)}
  </strong>
</MetricaButton>

        <MetricaCard>
          <span>Seguindo</span>
          <strong>
            {formatarNumero(usuario.estatisticas?.seguindo)}
          </strong>
        </MetricaCard>

        <MetricaCard>
          <span>Posições</span>
          <strong>
            {formatarNumero(mercado.quantidadePosicoes)}
          </strong>
        </MetricaCard>

        <MetricaCard>
          <span>Total de cotas</span>
          <strong>
            {formatarNumero(mercado.quantidadeCotas, 0)}
          </strong>
        </MetricaCard>
      </GridMetricas>

      <GridPrincipal>
        <Painel>
          <PainelTitulo>
            Performance do usuário
          </PainelTitulo>

          <PerformanceGrid>
            <LinhaInfo>
              <span>Saldo disponível</span>
              <strong>{formatarMoeda(mercado.saldo)}</strong>
            </LinhaInfo>

            <LinhaInfo>
              <span>Valor em posições</span>
              <strong>{formatarMoeda(mercado.valorPosicoes)}</strong>
            </LinhaInfo>

            <LinhaInfo>
              <span>Patrimônio total</span>
              <strong>{formatarMoeda(mercado.patrimonio)}</strong>
            </LinhaInfo>

            <LinhaInfo>
              <span>Capital de referência</span>
              <strong>{formatarMoeda(mercado.capitalInicial)}</strong>
            </LinhaInfo>

            <LinhaInfo>
              <span>Resultado geral</span>
              <strong className={resultadoPositivo ? 'positivo' : 'negativo'}>
                {resultadoPositivo ? '+' : ''}
                {formatarMoeda(mercado.resultado)}
              </strong>
            </LinhaInfo>

            <LinhaInfo>
              <span>Rentabilidade geral</span>
              <strong className={rentabilidadePositiva ? 'positivo' : 'negativo'}>
                {formatarPercentual(mercado.rentabilidade)}
              </strong>
            </LinhaInfo>
          </PerformanceGrid>
        </Painel>

        <Painel>
          <PainelTitulo>
            Convidar para ranking privado
          </PainelTitulo>

          {perfilProprio ? (
  <TextoAuxiliar>
    Este é o seu perfil público. Outros usuários Premium poderão te convidar para rankings privados.
  </TextoAuxiliar>
) : !usuarioLogadoPremium ? (
  <TextoAuxiliar>
    Apenas usuários Premium podem convidar outros usuários para rankings privados.
  </TextoAuxiliar>
) : !perfilPremium ? (
            <TextoAuxiliar>
              Este usuário é Lite. Apenas usuários Premium podem participar de rankings privados.
            </TextoAuxiliar>
          ) : carregandoRankings ? (
            <TextoAuxiliar>
              Carregando seus rankings privados...
            </TextoAuxiliar>
          ) : rankingsCriados.length === 0 ? (
            <TextoAuxiliar>
              Você ainda não criou rankings privados. Crie um ranking privado na página de Ranking para convidar usuários.
            </TextoAuxiliar>
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
                  placeholder="Ex: entra na nossa liga da Temporada Zero!"
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
                disabled={!podeConvidar || enviandoConvite}
              >
                {enviandoConvite
                  ? 'Enviando convite...'
                  : 'Convidar para ranking privado'}
              </BotaoConvite>
            </ConviteForm>
          )}
        </Painel>
      </GridPrincipal>

      <Painel>
  <PainelHeader>
    <PainelTitulo>
      Principais posições
    </PainelTitulo>

    {!podeVerPosicoes && (
      <PremiumMiniBadge>
        Premium
      </PremiumMiniBadge>
    )}
  </PainelHeader>

  {!Array.isArray(mercado.topPosicoes) ||
  mercado.topPosicoes.length === 0 ? (
    <EstadoCard>
      Este usuário ainda não possui posições em carteira.
    </EstadoCard>
  ) : !podeVerPosicoes ? (
    <PremiumLockedArea>
      <BlurredPositions aria-hidden="true">
        {[1, 2, 3].map((item) => (
          <BlurCard key={item}>
            <ClubeResumo>
              <BlurAvatar />

              <div>
                <BlurLine $width="120px" />
                <BlurLine $width="72px" $small />
              </div>
            </ClubeResumo>

            <BlurGrid>
              <BlurMetric />
              <BlurMetric />
              <BlurMetric />
              <BlurMetric />
            </BlurGrid>
          </BlurCard>
        ))}
      </BlurredPositions>

      <PremiumOverlay>
        <PremiumLockIcon>
          🔒
        </PremiumLockIcon>

        <PremiumLockTitle>
          Posições disponíveis apenas para Premium
        </PremiumLockTitle>

        <PremiumLockTexto>
          Usuários Lite não podem ver a carteira detalhada de outros usuários.
        </PremiumLockTexto>

        <UpgradeButton
          type="button"
          onClick={() => router.push('/planos')}
        >
          Fazer upgrade
        </UpgradeButton>
      </PremiumOverlay>
    </PremiumLockedArea>
  ) : (
    <ListaPosicoes>
      {mercado.topPosicoes.map((posicao) => (
        <PosicaoItem key={posicao.clubeId}>
          <ClubeResumo>
            <ClubBadge
              clube={posicao.nomeClube}
              size={36}
            />

            <div>
              <strong>
                {posicao.nomeClube}
              </strong>

              <span>
                {formatarNumero(posicao.quantidade)} cotas
              </span>
            </div>
          </ClubeResumo>

          <PosicaoMetricas>
            <MiniMetrica>
              <span>Preço médio</span>
              <strong>{formatarMoeda(posicao.precoMedio)}</strong>
            </MiniMetrica>

            <MiniMetrica>
              <span>Preço atual</span>
              <strong>{formatarMoeda(posicao.precoAtual)}</strong>
            </MiniMetrica>

            <MiniMetrica>
              <span>Valor atual</span>
              <strong>{formatarMoeda(posicao.valorAtual)}</strong>
            </MiniMetrica>

            <MiniMetrica>
              <span>Rentabilidade</span>
              <strong
                className={
                  Number(posicao.rentabilidade || 0) >= 0
                    ? 'positivo'
                    : 'negativo'
                }
              >
                {formatarPercentual(posicao.rentabilidade)}
              </strong>
            </MiniMetrica>
          </PosicaoMetricas>
        </PosicaoItem>
      ))}
    </ListaPosicoes>
  )}
</Painel>

{modalSeguidoresAberto && (
  <ModalOverlay
    onClick={fecharModalSeguidores}
  >
    <ModalCard
      onClick={(e) => e.stopPropagation()}
    >
      <ModalTopo>
        <div>
          <ModalTitulo>
            Seguidores
          </ModalTitulo>

          <ModalTexto>
            Usuários que seguem{' '}
            {usuario.nomeUsuario
              ? `@${usuario.nomeUsuario}`
              : nomeExibicao(usuario)}
          </ModalTexto>
        </div>

        <BotaoFecharModal
          type="button"
          onClick={fecharModalSeguidores}
        >
          ×
        </BotaoFecharModal>
      </ModalTopo>

      <ModalBuscaArea>
        <ModalBuscaInput
          type="text"
          value={buscaSeguidores}
          placeholder="Pesquisar seguidores"
          autoFocus
          onChange={(e) => setBuscaSeguidores(e.target.value)}
        />
      </ModalBuscaArea>

      {erroSeguidores && (
        <MensagemErro>
          {erroSeguidores}
        </MensagemErro>
      )}

      <ModalListaArea>
        {carregandoSeguidores ? (
          <ModalEstado>
            Carregando seguidores...
          </ModalEstado>
        ) : seguidoresPerfil.length === 0 ? (
          <ModalEstado>
            {buscaSeguidores.trim()
              ? 'Nenhum seguidor encontrado para essa busca.'
              : 'Este perfil ainda não possui seguidores.'}
          </ModalEstado>
        ) : (
          <ListaUsuariosModal>
            {seguidoresPerfil.map((seguidor) => {
              const nomeSeguidor = seguidor.nomeUsuario
                ? `@${seguidor.nomeUsuario}`
                : seguidor.nomePublico || seguidor.nome || 'Usuário';

              return (
                <UsuarioModalItem
                  key={seguidor.id}
                  type="button"
                  onClick={() => {
                    fecharModalSeguidores();
                    router.push(`/perfil/${seguidor.id}`);
                  }}
                >
                  <UsuarioModalAvatar>
                    {String(nomeSeguidor)
                      .replace('@', '')
                      .charAt(0)
                      .toUpperCase()}
                  </UsuarioModalAvatar>

                  <UsuarioModalInfo>
                    <strong>
                      {nomeSeguidor}
                    </strong>

                    {seguidor.nome && seguidor.nomeUsuario && (
                      <span>
                        {seguidor.nome}
                      </span>
                    )}
                  </UsuarioModalInfo>

                  <UsuarioModalBadges>
                    <PlanoBadge $premium={seguidor.plano === 'premium'}>
                      {seguidor.plano === 'premium'
                        ? 'Premium'
                        : 'Lite'}
                    </PlanoBadge>

                    {seguidor.seguindo && (
                      <SegueVoceBadge>
                        Seguindo
                      </SegueVoceBadge>
                    )}
                  </UsuarioModalBadges>
                </UsuarioModalItem>
              );
            })}
          </ListaUsuariosModal>
        )}
      </ModalListaArea>
    </ModalCard>
  </ModalOverlay>
)}

    </Container>
  );
}

export default withAuth(PerfilPage);

const Container = styled.div`
  width: 100%;
  padding: 0.2rem 0 2rem;
  color: #f8fafc;

  @media (max-width: 640px) {
    padding: 0 0 1rem;
  }
`;

const VoltarBotao = styled.button`
  margin-bottom: 14px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 12px;
  padding: 9px 12px;

  background: rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
  font-weight: 800;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.07);
    color: #f8fafc;
  }

  @media (max-width: 640px) {
    margin-bottom: 8px;
    padding: 7px 10px;
    border-radius: 10px;
    font-size: 0.76rem;
  }
`;

const HeroCard = styled.section`
  margin-bottom: 16px;
  padding: 22px;
  border: 1px solid rgba(96, 165, 250, 0.24);
  border-radius: 24px;

  background:
    radial-gradient(
      circle at top left,
      rgba(59, 130, 246, 0.2),
      transparent 34%
    ),
    radial-gradient(
      circle at top right,
      rgba(250, 204, 21, 0.12),
      transparent 34%
    ),
    linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.72));

  display: flex;
  justify-content: space-between;
  gap: 24px;
  overflow: hidden;

  @media (max-width: 820px) {
    flex-direction: column;
  }

  @media (max-width: 640px) {
    margin-bottom: 10px;
    padding: 13px;
    border-radius: 18px;
    gap: 12px;
  }
`;

const HeroLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;

  @media (max-width: 640px) {
    gap: 11px;
    align-items: center;
  }
`;

const AvatarGrande = styled.div`
  width: 104px;
  height: 104px;
  border-radius: 999px;

  display: grid;
  place-items: center;

  background: linear-gradient(135deg, #2563eb, #60a5fa);
  color: #fff;
  border: 4px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 16px 40px rgba(37, 99, 235, 0.28);

  font-size: 2.4rem;
  font-weight: 950;

  @media (max-width: 640px) {
    width: 62px;
    height: 62px;
    border-width: 3px;
    box-shadow: none;
    font-size: 1.45rem;
    flex: 0 0 auto;
  }
`;

const NomeArea = styled.div`
  min-width: 0;
`;

const NomePrincipal = styled.h1`
  margin: 0;
  color: #f8fafc;
  font-size: 1.9rem;
  line-height: 1.1;

  @media (max-width: 640px) {
    font-size: 1.18rem;
  }
`;

const NomeSecundario = styled.div`
  margin-top: 5px;
  color: #94a3b8;
  font-size: 0.95rem;

  @media (max-width: 640px) {
    margin-top: 3px;
    font-size: 0.76rem;
  }
`;

const BadgesLinha = styled.div`
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 640px) {
    margin-top: 7px;
    gap: 5px;
  }
`;

const PlanoBadge = styled.span`
  width: fit-content;
  padding: 6px 9px;
  border-radius: 999px;

  background: ${({ $premium }) =>
    $premium
      ? 'rgba(250, 204, 21, 0.13)'
      : 'rgba(34, 197, 94, 0.1)'};

  color: ${({ $premium }) =>
    $premium ? '#fde68a' : '#86efac'};

  border: 1px solid
    ${({ $premium }) =>
      $premium
        ? 'rgba(250, 204, 21, 0.22)'
        : 'rgba(34, 197, 94, 0.18)'};

  font-size: 0.7rem;
  font-weight: 950;
  text-transform: uppercase;

  @media (max-width: 640px) {
    padding: 4px 6px;
    font-size: 0.55rem;
  }
`;

const SegueVoceBadge = styled.span`
  width: fit-content;
  padding: 6px 9px;
  border-radius: 999px;

  background: rgba(59, 130, 246, 0.14);
  color: #bfdbfe;
  border: 1px solid rgba(59, 130, 246, 0.22);

  font-size: 0.7rem;
  font-weight: 950;
  text-transform: uppercase;

  @media (max-width: 640px) {
    padding: 4px 6px;
    font-size: 0.55rem;
  }
`;

const DesdeBadge = styled.span`
  width: fit-content;
  padding: 6px 9px;
  border-radius: 999px;

  background: rgba(148, 163, 184, 0.1);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.14);

  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;

  @media (max-width: 640px) {
    padding: 4px 6px;
    font-size: 0.55rem;
  }
`;

const HeroRight = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(135px, 1fr));
  gap: 10px;
  min-width: 500px;

  @media (max-width: 820px) {
    min-width: 0;
  }

  @media (max-width: 640px) {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}
`;

const HeroStat = styled.div`
  padding: 15px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(148, 163, 184, 0.12);

  span {
    display: block;
    margin-bottom: 7px;
    color: #94a3b8;
    font-size: 0.76rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  strong {
    color: #f8fafc;
    font-size: 1.25rem;
  }

  .positivo {
    color: #86efac;
  }

  .negativo {
    color: #fca5a5;
  }

  @media (max-width: 640px) {
    padding: 10px;
    border-radius: 13px;

    span {
      margin-bottom: 4px;
      font-size: 0.58rem;
      letter-spacing: 0.03em;
    }

    strong {
      font-size: 0.86rem;
    }
  }
`;

const AcoesTopo = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 9px;

  @media (max-width: 640px) {
    margin-bottom: 10px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
`;

const BotaoPrimario = styled.button`
  border: 1px solid rgba(59, 130, 246, 0.34);
  border-radius: 13px;
  padding: 11px 15px;

  background: rgba(59, 130, 246, 0.16);
  color: #bfdbfe;
  font-weight: 950;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background: rgba(59, 130, 246, 0.25);
  }

  @media (max-width: 640px) {
    padding: 9px 10px;
    border-radius: 11px;
    font-size: 0.76rem;
  }
`;

const BotaoSecundario = styled.button`
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 13px;
  padding: 11px 15px;

  background: rgba(255, 255, 255, 0.045);
  color: #cbd5e1;
  font-weight: 900;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.075);
    color: #f8fafc;
  }

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }

  @media (max-width: 640px) {
    padding: 9px 10px;
    border-radius: 11px;
    font-size: 0.76rem;
  }
`;

const GridMetricas = styled.div`
  margin-bottom: 16px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    margin-bottom: 10px;
    gap: 8px;
  }
`;

const MetricaCard = styled.div`
  padding: 15px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 17px;
  background: rgba(15, 23, 42, 0.68);

  span {
    display: block;
    margin-bottom: 7px;
    color: #94a3b8;
    font-size: 0.76rem;
    font-weight: 800;
  }

  strong {
    color: #f8fafc;
    font-size: 1.35rem;
  }

  @media (max-width: 640px) {
    padding: 10px;
    border-radius: 13px;

    span {
      margin-bottom: 4px;
      font-size: 0.62rem;
    }

    strong {
      font-size: 0.95rem;
    }
  }
`;

const MetricaButton = styled.button`
  padding: 15px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 17px;
  background: rgba(15, 23, 42, 0.68);

  text-align: left;
  cursor: pointer;

  span {
    display: block;
    margin-bottom: 7px;
    color: #94a3b8;
    font-size: 0.76rem;
    font-weight: 800;
  }

  strong {
    color: #f8fafc;
    font-size: 1.35rem;
  }

  &:hover {
    border-color: rgba(59, 130, 246, 0.32);
    background: rgba(59, 130, 246, 0.08);
  }

  @media (max-width: 640px) {
    padding: 10px;
    border-radius: 13px;

    span {
      margin-bottom: 4px;
      font-size: 0.62rem;
    }

    strong {
      font-size: 0.95rem;
    }
  }
`;

const GridPrincipal = styled.div`
  margin-bottom: 16px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.78fr);
  gap: 16px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 640px) {
    margin-bottom: 10px;
    gap: 10px;
  }
`;

const Painel = styled.section`
  padding: 18px;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.66);

  @media (max-width: 640px) {
    padding: 12px;
    border-radius: 16px;
  }
`;

const PainelTitulo = styled.h2`
  margin: 0 0 14px;
  color: #f8fafc;
  font-size: 1.05rem;

  @media (max-width: 640px) {
    margin-bottom: 9px;
    font-size: 0.92rem;
  }
`;

const PerformanceGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 9px;

  @media (max-width: 640px) {
    gap: 7px;
  }
`;

const LinhaInfo = styled.div`
  padding: 12px;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.04);

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  span {
    color: #94a3b8;
    font-size: 0.84rem;
  }

  strong {
    color: #f8fafc;
    font-size: 0.9rem;
    text-align: right;
  }

  .positivo {
    color: #86efac;
  }

  .negativo {
    color: #fca5a5;
  }

  @media (max-width: 640px) {
    padding: 9px;
    border-radius: 11px;
    gap: 8px;

    span {
      font-size: 0.7rem;
    }

    strong {
      font-size: 0.76rem;
    }
  }
`;

const TextoAuxiliar = styled.p`
  margin: 0;
  color: #94a3b8;
  font-size: 0.86rem;
  line-height: 1.5;

  @media (max-width: 640px) {
    font-size: 0.75rem;
    line-height: 1.4;
  }
`;

const CampoGrupo = styled.label`
  display: block;
  margin-bottom: 13px;

  @media (max-width: 640px) {
    margin-bottom: 9px;
  }
`;

const CampoLabel = styled.span`
  display: block;
  margin-bottom: 6px;
  color: #cbd5e1;
  font-size: 0.76rem;
  font-weight: 800;

  @media (max-width: 640px) {
    margin-bottom: 4px;
    font-size: 0.66rem;
  }
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

  @media (max-width: 640px) {
    padding: 9px 10px;
    border-radius: 10px;
    font-size: 0.76rem;
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

  @media (max-width: 640px) {
    min-height: 62px;
    padding: 9px 10px;
    border-radius: 10px;
    font-size: 0.76rem;
  }
`;

const BotaoConvite = styled.button`
  width: 100%;
  border: 1px solid rgba(250, 204, 21, 0.32);
  border-radius: 12px;
  padding: 11px 14px;

  background: rgba(250, 204, 21, 0.14);
  color: #fde68a;
  font-weight: 950;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background: rgba(250, 204, 21, 0.22);
  }

  @media (max-width: 640px) {
    padding: 9px 10px;
    border-radius: 10px;
    font-size: 0.76rem;
  }
`;

const PainelHeader = styled.div`
  margin-bottom: 14px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  ${PainelTitulo} {
    margin-bottom: 0;
  }

  @media (max-width: 640px) {
    margin-bottom: 9px;
  }
`;

const PremiumMiniBadge = styled.span`
  width: fit-content;
  padding: 5px 8px;
  border-radius: 999px;

  background: rgba(250, 204, 21, 0.12);
  color: #fde68a;
  border: 1px solid rgba(250, 204, 21, 0.22);

  font-size: 0.65rem;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  @media (max-width: 640px) {
    padding: 4px 7px;
    font-size: 0.56rem;
  }
`;

const PremiumLockedArea = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 16px;

  @media (max-width: 640px) {
    border-radius: 13px;
  }
`;

const BlurredPositions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  filter: blur(5px);
  opacity: 0.58;
  pointer-events: none;
  user-select: none;

  @media (max-width: 640px) {
    gap: 8px;
    filter: blur(4px);
  }
`;

const BlurCard = styled.article`
  padding: 13px;
  border: 1px solid rgba(148, 163, 184, 0.11);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.035);

  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 12px;
  align-items: center;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 640px) {
    padding: 10px;
    gap: 8px;
    border-radius: 13px;
  }
`;

const BlurAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: rgba(96, 165, 250, 0.26);

  @media (max-width: 640px) {
    width: 30px;
    height: 30px;
  }
`;

const BlurLine = styled.div`
  width: ${({ $width }) => $width || '100px'};
  max-width: 100%;
  height: ${({ $small }) => ($small ? '9px' : '13px')};
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.34);
  margin-top: ${({ $small }) => ($small ? '6px' : '0')};

  @media (max-width: 640px) {
    height: ${({ $small }) => ($small ? '7px' : '10px')};
  }
`;

const BlurGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    gap: 7px;
  }
`;

const BlurMetric = styled.div`
  height: 48px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.58);
  border: 1px solid rgba(148, 163, 184, 0.08);

  @media (max-width: 640px) {
    height: 38px;
    border-radius: 10px;
  }
`;

const PremiumOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;

  padding: 22px;

  display: grid;
  place-content: center;
  justify-items: center;
  text-align: center;

  background:
    radial-gradient(
      circle at center,
      rgba(15, 23, 42, 0.82),
      rgba(15, 23, 42, 0.7)
    );

  @media (max-width: 640px) {
    padding: 14px;
  }
`;

const PremiumLockIcon = styled.div`
  width: 42px;
  height: 42px;
  margin-bottom: 10px;
  border-radius: 999px;

  display: grid;
  place-items: center;

  background: rgba(250, 204, 21, 0.12);
  border: 1px solid rgba(250, 204, 21, 0.22);
  color: #fde68a;
  font-size: 1.2rem;

  @media (max-width: 640px) {
    width: 34px;
    height: 34px;
    margin-bottom: 7px;
    font-size: 1rem;
  }
`;

const PremiumLockTitle = styled.strong`
  display: block;
  max-width: 420px;
  color: #f8fafc;
  font-size: 1.05rem;
  line-height: 1.25;

  @media (max-width: 640px) {
    font-size: 0.86rem;
  }
`;

const PremiumLockTexto = styled.p`
  margin: 8px 0 14px;
  max-width: 430px;
  color: #cbd5e1;
  font-size: 0.86rem;
  line-height: 1.45;

  @media (max-width: 640px) {
    margin: 6px 0 10px;
    font-size: 0.7rem;
    line-height: 1.35;
  }
`;

const UpgradeButton = styled.button`
  border: 1px solid rgba(250, 204, 21, 0.32);
  border-radius: 12px;
  padding: 10px 15px;

  background: rgba(250, 204, 21, 0.16);
  color: #fde68a;
  font-weight: 950;
  cursor: pointer;

  &:hover {
    background: rgba(250, 204, 21, 0.24);
  }

  @media (max-width: 640px) {
    padding: 8px 11px;
    border-radius: 10px;
    font-size: 0.75rem;
  }
`;

const ListaPosicoes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 640px) {
    gap: 8px;
  }
`;

const PosicaoItem = styled.article`
  padding: 13px;
  border: 1px solid rgba(148, 163, 184, 0.11);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.035);

  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 12px;
  align-items: center;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 640px) {
    padding: 10px;
    gap: 8px;
    border-radius: 13px;
  }
`;

const ClubeResumo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  strong {
    display: block;
    color: #f8fafc;
    font-size: 0.92rem;
  }

  span {
    display: block;
    margin-top: 2px;
    color: #94a3b8;
    font-size: 0.76rem;
  }

  @media (max-width: 640px) {
    gap: 8px;

    strong {
      font-size: 0.78rem;
    }

    span {
      font-size: 0.66rem;
    }
  }
`;

const PosicaoMetricas = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    gap: 7px;
  }
`;

const MiniMetrica = styled.div`
  padding: 9px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.58);

  span {
    display: block;
    margin-bottom: 4px;
    color: #94a3b8;
    font-size: 0.68rem;
  }

  strong {
    color: #f8fafc;
    font-size: 0.78rem;
  }

  .positivo {
    color: #86efac;
  }

  .negativo {
    color: #fca5a5;
  }

  @media (max-width: 640px) {
    padding: 7px;
    border-radius: 10px;

    span {
      margin-bottom: 3px;
      font-size: 0.57rem;
    }

    strong {
      font-size: 0.66rem;
    }
  }
`;

const EstadoCard = styled.div`
  padding: 28px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 15px;

  color: #94a3b8;
  text-align: center;
  background: rgba(255, 255, 255, 0.025);
`;
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  padding: 20px;

  background: rgba(2, 6, 23, 0.78);
  backdrop-filter: blur(8px);

  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 640px) {
    padding: 12px;
    align-items: flex-end;
  }
`;

const ModalCard = styled.div`
  width: 100%;
  max-width: 460px;
  max-height: 82vh;
  overflow: hidden;

  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 20px;

  background:
    radial-gradient(
      circle at top right,
      rgba(59, 130, 246, 0.12),
      transparent 36%
    ),
    #0f172a;

  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);

  display: flex;
  flex-direction: column;

  @media (max-width: 640px) {
    max-width: 100%;
    max-height: 86vh;
    border-radius: 20px 20px 0 0;
  }
`;

const ModalTopo = styled.div`
  padding: 18px 18px 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);

  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
`;

const ModalTitulo = styled.h2`
  margin: 0;
  color: #f8fafc;
  font-size: 1.12rem;

  @media (max-width: 640px) {
    font-size: 1rem;
  }
`;

const ModalTexto = styled.p`
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 0.8rem;
  line-height: 1.4;
`;

const BotaoFecharModal = styled.button`
  width: 34px;
  height: 34px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 999px;

  background: rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;

  &:hover {
    background: rgba(239, 68, 68, 0.12);
    color: #fecaca;
  }
`;

const ModalBuscaArea = styled.div`
  padding: 12px 18px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
`;

const ModalBuscaInput = styled.input`
  width: 100%;
  height: 42px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 999px;
  padding: 0 14px;

  background: rgba(15, 23, 42, 0.82);
  color: #f8fafc;
  outline: none;

  &::placeholder {
    color: #64748b;
  }

  &:focus {
    border-color: rgba(59, 130, 246, 0.55);
  }

  @media (max-width: 640px) {
    height: 38px;
    font-size: 0.82rem;
  }
`;

const ModalListaArea = styled.div`
  overflow-y: auto;
  padding: 8px;
`;

const ModalEstado = styled.div`
  padding: 26px 12px;
  color: #94a3b8;
  text-align: center;
  font-size: 0.86rem;
`;

const ListaUsuariosModal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UsuarioModalItem = styled.button`
  width: 100%;
  border: 0;
  border-radius: 14px;
  padding: 10px;

  background: transparent;
  color: #f8fafc;

  display: flex;
  align-items: center;
  gap: 10px;

  text-align: left;
  cursor: pointer;

  &:hover {
    background: rgba(59, 130, 246, 0.12);
  }
`;

const UsuarioModalAvatar = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 999px;

  display: grid;
  place-items: center;
  flex: 0 0 auto;

  background: rgba(59, 130, 246, 0.17);
  color: #93c5fd;
  font-weight: 950;

  @media (max-width: 640px) {
    width: 36px;
    height: 36px;
    font-size: 0.84rem;
  }
`;

const UsuarioModalInfo = styled.div`
  min-width: 0;
  flex: 1;

  strong {
    display: block;
    color: #f8fafc;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    display: block;
    margin-top: 2px;
    color: #94a3b8;
    font-size: 0.74rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const UsuarioModalBadges = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 0 0 auto;

  @media (max-width: 420px) {
    display: none;
  }
`;
const MensagemErro = styled.div`
  margin-bottom: 14px;
  padding: 12px 14px;
  border: 1px solid rgba(239, 68, 68, 0.24);
  border-radius: 12px;

  background: rgba(239, 68, 68, 0.08);
  color: #fca5a5;
  font-size: 0.84rem;
`;

const MensagemSucesso = styled.div`
  margin-bottom: 14px;
  padding: 12px 14px;
  border: 1px solid rgba(34, 197, 94, 0.22);
  border-radius: 12px;

  background: rgba(34, 197, 94, 0.08);
  color: #86efac;
  font-size: 0.84rem;
`;