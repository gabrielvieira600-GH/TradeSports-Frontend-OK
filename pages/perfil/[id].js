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

function PerfilPage() {
  const router = useRouter();
  const { id } = router.query;

  const [usuario, setUsuario] = useState(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [erroPerfil, setErroPerfil] = useState('');

  const [processandoFollow, setProcessandoFollow] = useState(false);

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

  const rentabilidadePositiva = Number(mercado.rentabilidade || 0) >= 0;
  const resultadoPositivo = Number(mercado.resultado || 0) >= 0;

  const podeConvidar = useMemo(() => {
    return (
      usuarioLogadoPremium &&
      perfilPremium &&
      rankingsCriados.length > 0 &&
      usuario?.id
    );
  }, [
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
    carregarPlanoUsuario();
  }, []);

  useEffect(() => {
    if (usuarioLogadoPremium) {
      carregarRankingsPrivadosCriados();
    }
  }, [usuarioLogadoPremium]);

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

              <DesdeBadge>
                Desde {formatarData(usuario.criadoEm)}
              </DesdeBadge>
            </BadgesLinha>
          </NomeArea>
        </HeroLeft>

        <HeroRight>
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

        <BotaoSecundario
          type="button"
          onClick={() => router.push('/convites')}
        >
          Ver convites
        </BotaoSecundario>
      </AcoesTopo>

      <GridMetricas>
        <MetricaCard>
          <span>Seguidores</span>
          <strong>
            {formatarNumero(usuario.estatisticas?.seguidores)}
          </strong>
        </MetricaCard>

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

          {!usuarioLogadoPremium ? (
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
        <PainelTitulo>
          Principais posições
        </PainelTitulo>

        {!Array.isArray(mercado.topPosicoes) ||
        mercado.topPosicoes.length === 0 ? (
          <EstadoCard>
            Este usuário ainda não possui posições em carteira.
          </EstadoCard>
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
                    <strong className={Number(posicao.rentabilidade || 0) >= 0 ? 'positivo' : 'negativo'}>
                      {formatarPercentual(posicao.rentabilidade)}
                    </strong>
                  </MiniMetrica>
                </PosicaoMetricas>
              </PosicaoItem>
            ))}
          </ListaPosicoes>
        )}
      </Painel>
    </Container>
  );
}

export default withAuth(PerfilPage);

const Container = styled.div`
  width: 100%;
  padding: 0.2rem 0 2rem;
  color: #f8fafc;
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
`;

const HeroLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;

  @media (max-width: 560px) {
    flex-direction: column;
    align-items: flex-start;
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
`;

const NomeArea = styled.div`
  min-width: 0;
`;

const NomePrincipal = styled.h1`
  margin: 0;
  color: #f8fafc;
  font-size: 1.9rem;
  line-height: 1.1;

  @media (max-width: 560px) {
    font-size: 1.45rem;
  }
`;

const NomeSecundario = styled.div`
  margin-top: 5px;
  color: #94a3b8;
  font-size: 0.95rem;
`;

const BadgesLinha = styled.div`
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
`;

const HeroRight = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(150px, 1fr));
  gap: 10px;
  min-width: 330px;

  @media (max-width: 820px) {
    min-width: 0;
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
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
`;

const AcoesTopo = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
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
`;

const GridMetricas = styled.div`
  margin-bottom: 16px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 460px) {
    grid-template-columns: 1fr;
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
`;

const GridPrincipal = styled.div`
  margin-bottom: 16px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.78fr);
  gap: 16px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Painel = styled.section`
  padding: 18px;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.66);
`;

const PainelTitulo = styled.h2`
  margin: 0 0 14px;
  color: #f8fafc;
  font-size: 1.05rem;
`;

const PerformanceGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 9px;
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

  @media (max-width: 520px) {
    align-items: flex-start;
    flex-direction: column;

    strong {
      text-align: left;
    }
  }
`;

const TextoAuxiliar = styled.p`
  margin: 0;
  color: #94a3b8;
  font-size: 0.86rem;
  line-height: 1.5;
`;

const ConviteForm = styled.form``;

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
  font-weight: 950;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background: rgba(250, 204, 21, 0.22);
  }
`;

const ListaPosicoes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
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
`;

const PosicaoMetricas = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
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