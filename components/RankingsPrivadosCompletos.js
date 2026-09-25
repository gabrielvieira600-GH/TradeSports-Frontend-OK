import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import {
  FiArchive,
  FiAward,
  FiBarChart2,
  FiCopy,
  FiLock,
  FiMessageCircle,
  FiPlus,
  FiSearch,
  FiSettings,
  FiShield,
  FiTrash2,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import api from '../lib/api';
import withAuth from './withAuth';
import UserAvatar from './UserAvatar';

const dinheiro = (valor) =>
  `T$ ${Number(valor || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const percentual = (valor) =>
  `${Number(valor || 0) > 0 ? '+' : ''}${Number(valor || 0).toFixed(2)}%`;

const rotuloStatus = (status) =>
  ({ ativo: 'Ativo', encerrado: 'Encerrado', arquivado: 'Arquivado' }[status] || status);

export function RankingsPrivadosPage({ embedded = false, onListChange }) {
  const router = useRouter();
  const [lista, setLista] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const [selecionado, setSelecionado] = useState('');
  const [aba, setAba] = useState('ranking');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);
  const [criando, setCriando] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [post, setPost] = useState('');
  const [buscaUsuarios, setBuscaUsuarios] = useState('');
  const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);
  const [pesquisandoUsuarios, setPesquisandoUsuarios] = useState(false);
  const [convidandoUsuarioId, setConvidandoUsuarioId] = useState('');
  const conviteProcessado = useRef('');
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    imagemUrl: '',
    regras: '',
    visibilidade: 'convite',
    criterioClassificacao: 'rentabilidade',
    maxParticipantes: 50,
    aprovacaoManual: false,
    dataInicio: '',
    dataFim: '',
  });

  async function carregarLista() {
    const { data } = await api.get('/private-rankings');
    setLista(data);
    onListChange?.(Array.isArray(data?.rankings) ? data.rankings : []);
    return data;
  }

  async function carregarDetalhe(id = selecionado) {
    if (!id) return;
    setCarregandoDetalhe(true);
    try {
      const { data } = await api.get(`/private-rankings/${id}`);
      setDetalhe(data);
    } finally {
      setCarregandoDetalhe(false);
    }
  }

  useEffect(() => {
    carregarLista()
      .catch((e) => setErro(e?.response?.data?.erro || 'Não foi possível carregar os rankings privados.'))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    if (selecionado) {
      carregarDetalhe(selecionado).catch((e) =>
        setErro(e?.response?.data?.erro || 'Não foi possível abrir este ranking.')
      );
    }
  }, [selecionado]);

  useEffect(() => {
    const rankings = Array.isArray(lista?.rankings) ? lista.rankings : [];
    if (!rankings.length) {
      if (selecionado) {
        setSelecionado('');
        setDetalhe(null);
      }
      return;
    }

    if (rankings.some((item) => String(item._id) === String(selecionado))) return;

    const solicitado = rankings.find(
      (item) => String(item._id) === String(router.query.ranking || '')
    );
    setSelecionado(String((solicitado || rankings[0])._id));
    setAba(router.query.secao === 'gestao' ? 'gestao' : 'ranking');
  }, [lista, selecionado, router.query.ranking, router.query.secao]);

  useEffect(() => {
    if (
      router.query.codigo &&
      lista &&
      conviteProcessado.current !== String(router.query.codigo)
    ) {
      const valor = String(router.query.codigo);
      conviteProcessado.current = valor;
      setCodigo(valor);
      entrar(valor);
    }
  }, [router.query.codigo, lista]);

  useEffect(() => {
    if (!lista || !router.query.ranking) return;
    const rankingId = String(router.query.ranking);
    if (lista.rankings?.some((item) => String(item._id) === rankingId)) {
      setSelecionado(rankingId);
      if (router.query.secao === 'gestao') setAba('gestao');
    }
  }, [lista, router.query.ranking, router.query.secao]);

  async function executar(acao) {
    setErro('');
    setSucesso('');
    try {
      await acao();
    } catch (e) {
      setErro(e?.response?.data?.erro || 'Não foi possível concluir a ação.');
    }
  }

  async function criar(e) {
    e.preventDefault();
    await executar(async () => {
      const { data } = await api.post('/private-rankings', form);
      await carregarLista();
      setCriando(false);
      setSelecionado(String(data.ranking._id));
      setAba('ranking');
      setSucesso('Ranking criado. O código e o link já podem ser compartilhados.');
    });
  }

  async function entrar(valor = codigo) {
    if (!String(valor || '').trim()) return setErro('Informe um código de convite.');
    await executar(async () => {
      const { data } = await api.post(`/private-rankings/entrar/${String(valor).trim()}`);
      await carregarLista();
      setSelecionado(String(data.rankingId));
      setAba('ranking');
      setSucesso(
        data.status === 'pendente'
          ? 'Solicitação enviada para aprovação.'
          : 'Você entrou no ranking privado.'
      );
    });
  }

  async function publicar(e) {
    e.preventDefault();
    await executar(async () => {
      await api.post(`/private-rankings/${selecionado}/posts`, { texto: post });
      setPost('');
      await carregarDetalhe();
    });
  }

  async function acaoMembro(usuarioId, acao) {
    if (!usuarioId) {
      setErro('Não foi possível identificar o usuário desta solicitação. Atualize a página e tente novamente.');
      return;
    }
    await executar(async () => {
      await api.patch(`/private-rankings/${selecionado}/membros/${usuarioId}`, { acao });
      await Promise.all([carregarDetalhe(), carregarLista()]);
      setSucesso(acao === 'aprovar' ? 'Solicitação aprovada.' : acao === 'recusar' ? 'Solicitação recusada.' : 'Participante atualizado.');
    });
  }

  async function pesquisarUsuarios(e) {
    e?.preventDefault();
    const busca = buscaUsuarios.trim();
    if (busca.length < 2) {
      setUsuariosEncontrados([]);
      setErro('Digite ao menos dois caracteres para pesquisar.');
      return;
    }
    setErro('');
    setSucesso('');
    setPesquisandoUsuarios(true);
    try {
      const { data } = await api.get('/social/usuarios', { params: { busca, limit: 10 } });
      setUsuariosEncontrados(Array.isArray(data?.usuarios) ? data.usuarios : []);
    } catch (e) {
      setUsuariosEncontrados([]);
      setErro(e?.response?.data?.erro || 'Não foi possível pesquisar usuários.');
    } finally {
      setPesquisandoUsuarios(false);
    }
  }

  async function convidarUsuario(usuarioId) {
    setConvidandoUsuarioId(String(usuarioId));
    await executar(async () => {
      await api.post('/ranking-convites', {
        rankingId: selecionado,
        destinatarioId: usuarioId,
      });
      setUsuariosEncontrados((atuais) => atuais.filter((item) => String(item.id) !== String(usuarioId)));
      setSucesso('Convite enviado. O usuário poderá aceitar ou recusar pela notificação ou pela página de convites.');
    });
    setConvidandoUsuarioId('');
  }

  async function encerrar() {
    if (!window.confirm('Encerrar a competição e registrar o campeão atual?')) return;
    await executar(async () => {
      await api.post(`/private-rankings/${selecionado}/encerrar`);
      await Promise.all([carregarDetalhe(), carregarLista()]);
      setSucesso('Competição encerrada e troféu concedido.');
    });
  }

  async function arquivar() {
    if (!window.confirm('Arquivar este ranking? Ele continuará disponível para consulta.')) return;
    await executar(async () => {
      await api.post(`/private-rankings/${selecionado}/arquivar`);
      await Promise.all([carregarDetalhe(), carregarLista()]);
      setSucesso('Competição arquivada.');
    });
  }

  async function excluir() {
    if (!window.confirm('Excluir este ranking privado? Ele deixará de aparecer para todos os participantes.')) return;
    await executar(async () => {
      await api.delete(`/private-rankings/${selecionado}`);
      setSelecionado('');
      setDetalhe(null);
      setAba('ranking');
      await carregarLista();
      setSucesso('Ranking excluído.');
    });
  }

  function copiarLink(ranking = detalhe?.ranking) {
    if (!ranking?.codigoConvite || typeof window === 'undefined') return;
    const url = `${window.location.origin}/ranking?aba=privados&codigo=${ranking.codigoConvite}`;
    navigator.clipboard?.writeText(url);
    setSucesso('Link de convite copiado.');
  }

  function abrirRanking(id) {
    setSelecionado(String(id));
    setDetalhe(null);
    setAba('ranking');
    setErro('');
    setSucesso('');
  }

  const podeCriar = lista?.plano === 'premium';
  const ranking = detalhe?.ranking;
  const membrosPendentes = useMemo(
    () => detalhe?.membros?.filter((item) => item.status === 'pendente') || [],
    [detalhe]
  );
  const Wrapper = embedded ? EmbeddedPage : Page;

  if (carregando) return <Wrapper><Loading>Carregando rankings privados...</Loading></Wrapper>;

  return (
    <Wrapper>
      {!embedded && (
        <PrivateHeader>
          <div>
            <PrivateTitle>Rankings privados</PrivateTitle>
            <PrivateText>Compare sua rentabilidade com grupos e amigos.</PrivateText>
          </div>
        </PrivateHeader>
      )}

      {!!lista?.rankings?.length && (
        <RankingSelector>
          <SelectorHeading>
            <strong>Escolha o ranking</strong>
            <span>{lista.rankings.length} disponíve{lista.rankings.length === 1 ? 'l' : 'is'}</span>
          </SelectorHeading>
          <RankingOptions>
            {lista.rankings.map((item) => (
              <RankingOption
                key={item._id}
                type="button"
                $active={String(item._id) === String(selecionado)}
                onClick={() => abrirRanking(item._id)}
              >
                <span>{item.nome}</span>
                {item.membroStatus === 'pendente' && <small>Pendente</small>}
                {item.status !== 'ativo' && <small>{rotuloStatus(item.status)}</small>}
              </RankingOption>
            ))}
          </RankingOptions>
        </RankingSelector>
      )}

      {erro && <Alert $erro>{erro}</Alert>}
      {sucesso && <Alert>{sucesso}</Alert>}

      {!lista?.rankings?.length ? (
        <EmptyState>
          <FiAward />
          <strong>Você ainda não participa de rankings privados</strong>
          <span>Use um código de convite ou crie sua própria competição.</span>
        </EmptyState>
      ) : null}

      {selecionado && carregandoDetalhe && !ranking && (
        <Loading>Carregando classificação...</Loading>
      )}

      {ranking && (
        <DetailSection>
          <DetailHeader>
            <DetailIdentity>
              <div>
                <DetailStatus>
                  Ranking privado · {rotuloStatus(ranking.status)} · {detalhe.papel === 'proprietario' ? 'Criado por você' : 'Participando'}
                </DetailStatus>
                <h2>{ranking.nome}</h2>
                <p>
                  {detalhe.classificacao?.length || 0} participante{detalhe.classificacao?.length === 1 ? '' : 's'}
                  {' · '}{ranking.visibilidade === 'publico' ? 'Público' : 'Por convite'}
                  {ranking.descricao ? ` · ${ranking.descricao}` : ''}
                </p>
              </div>
            </DetailIdentity>
            <DetailActions>
              {ranking.status === 'ativo' && (
                <SecondaryButton type="button" onClick={() => copiarLink()}><FiCopy /> Convidar</SecondaryButton>
              )}
              {detalhe.podeGerir && (
                <SecondaryButton type="button" onClick={() => setAba('gestao')}><FiSettings /> Gerenciar</SecondaryButton>
              )}
              {detalhe.papel === 'proprietario' && ranking.status === 'ativo' && (
                <AdminButton type="button" onClick={encerrar}><FiAward /> Encerrar</AdminButton>
              )}
              {detalhe.papel === 'proprietario' && ranking.status === 'encerrado' && (
                <AdminButton type="button" onClick={arquivar}><FiArchive /> Arquivar</AdminButton>
              )}
              {detalhe.papel === 'proprietario' && (
                <DeleteButton type="button" onClick={excluir}><FiTrash2 /> Excluir</DeleteButton>
              )}
            </DetailActions>
          </DetailHeader>

          {detalhe.solicitacaoPendente && (
            <PendingNotice>
              <FiLock />
              <div><strong>Solicitação aguardando aprovação</strong><span>O proprietário foi notificado e você receberá uma notificação quando houver uma resposta.</span></div>
            </PendingNotice>
          )}

          <Tabs>
            {[
              ['ranking', 'Ranking', FiBarChart2],
              ['feed', 'Feed', FiMessageCircle],
              ['estatisticas', 'Estatísticas', FiUsers],
              ['campeoes', 'Campeões', FiAward],
              ['gestao', membrosPendentes.length ? `Gestão (${membrosPendentes.length})` : 'Gestão', FiSettings],
            ].map(([id, label, Icon]) => (
              <Tab key={id} $active={aba === id} onClick={() => setAba(id)}><Icon /> {label}</Tab>
            ))}
          </Tabs>

          {carregandoDetalhe ? <Loading>Atualizando classificação...</Loading> : (
            <>
              {aba === 'ranking' && (
                detalhe.classificacao.length ? (
                  <RankingTableContainer>
                    <RankingTable>
                      <thead><tr><th>Pos.</th><th>Usuário</th><th>Valorização histórica</th><th className="patrimonio">Patrimônio</th></tr></thead>
                      <tbody>
                        {detalhe.classificacao.map((item) => {
                          const souEu = String(item.usuarioId) === String(detalhe.usuarioAtualId);
                          return (
                            <RankingRow key={item.usuarioId} $highlight={souEu}>
                              <td><RankingPosition $position={item.posicao}>{item.posicao}º</RankingPosition></td>
                              <td>
                                <RankingUser>
                                  <UserAvatar usuario={item} size={36} />
                                  <div>
                                    <strong>{item.nomeUsuario ? `@${item.nomeUsuario}` : item.nome}</strong>
                                    {souEu && <small>Você</small>}
                                  </div>
                                </RankingUser>
                              </td>
                              <td><Variation $positive={item.rentabilidade >= 0}>{percentual(item.rentabilidade)}</Variation></td>
                              <td className="patrimonio"><strong>{dinheiro(item.patrimonio)}</strong></td>
                            </RankingRow>
                          );
                        })}
                      </tbody>
                    </RankingTable>
                  </RankingTableContainer>
                ) : (
                  <EmptyRanking>Este ranking ainda não possui participantes classificados.</EmptyRanking>
                )
              )}

              {aba === 'feed' && (
                <Panel>
                  <PanelHead><div><h3>Feed exclusivo</h3><p>Visível somente aos participantes.</p></div></PanelHead>
                  {detalhe.participante ? <>
                    <PostForm onSubmit={publicar}><textarea value={post} onChange={(e) => setPost(e.target.value)} maxLength={1500} placeholder="Compartilhe uma atualização com o ranking..." /><CreateButton>Publicar</CreateButton></PostForm>
                    {!detalhe.posts.length && <GroupEmpty>Nenhuma publicação ainda.</GroupEmpty>}
                    {detalhe.posts.map((item) => <Post key={item._id}><strong>@{item.autorId?.nomeUsuario || item.autorId?.nome}</strong><span>{new Date(item.createdAt).toLocaleString('pt-BR')}</span><p>{item.texto}</p></Post>)}
                  </> : <Locked><FiLock /> Entre no ranking para acessar o feed.</Locked>}
                </Panel>
              )}

              {aba === 'estatisticas' && (
                <StatsGrid>
                  {[
                    ['Participantes', detalhe.estatisticas.participantes],
                    ['Patrimônio médio', dinheiro(detalhe.estatisticas.patrimonioMedio)],
                    ['Rentabilidade média', percentual(detalhe.estatisticas.rentabilidadeMedia)],
                    ['Líder', detalhe.estatisticas.lider?.nomeUsuario ? `@${detalhe.estatisticas.lider.nomeUsuario}` : '—'],
                  ].map(([label, value]) => <StatCard key={label}><span>{label}</span><strong>{value}</strong></StatCard>)}
                </StatsGrid>
              )}

              {aba === 'campeoes' && (
                <Panel>
                  <PanelHead><div><h3>Histórico de campeões</h3><p>Troféus registrados ao encerramento.</p></div></PanelHead>
                  {!detalhe.historicoCampeoes.length ? <GroupEmpty>Nenhuma edição encerrada ainda.</GroupEmpty> : detalhe.historicoCampeoes.map((item) => <Champion key={item.rankingId}><FiAward /><div><strong>@{item.campeao?.nomeUsuario || item.campeao?.nome}</strong><span>{item.nome} · {new Date(item.encerradoEm).toLocaleDateString('pt-BR')} · {item.trofeu}</span></div></Champion>)}
                </Panel>
              )}

              {aba === 'gestao' && (
                <Panel>
                  <PanelHead><div><h3>Participantes e permissões</h3><p>Proprietário, administradores, participantes e solicitações.</p></div></PanelHead>
                  {!detalhe.podeGerir ? <Locked><FiLock /> Apenas proprietário e administradores podem gerenciar.</Locked> : <>
                    {membrosPendentes.length > 0 && <PendingBox>
                      <PendingTitle><strong>Solicitações de entrada</strong><span>{membrosPendentes.length} pendente{membrosPendentes.length > 1 ? 's' : ''}</span></PendingTitle>
                      {membrosPendentes.map((membro) => <Member key={membro._id}>
                        <div><strong>@{membro.usuarioId?.nomeUsuario || membro.usuarioId?.nome}</strong><span>Aguardando sua decisão</span></div>
                        <MemberActions>
                          <button onClick={() => acaoMembro(membro.usuarioId?._id, 'aprovar')}>Aprovar</button>
                          <button className="danger" onClick={() => acaoMembro(membro.usuarioId?._id, 'recusar')}>Recusar</button>
                        </MemberActions>
                      </Member>)}
                    </PendingBox>}

                    {detalhe.papel === 'proprietario' && <InviteUsers>
                      <InviteUsersHeader>
                        <strong>Convidar pela TradeSports</strong>
                        <span>Pesquise pelo nome ou @. O usuário receberá uma notificação para aceitar ou recusar.</span>
                      </InviteUsersHeader>
                      <SearchUsers onSubmit={pesquisarUsuarios}>
                        <FiSearch />
                        <input value={buscaUsuarios} onChange={(e) => setBuscaUsuarios(e.target.value)} placeholder="Pesquisar usuário" />
                        <button disabled={pesquisandoUsuarios}>{pesquisandoUsuarios ? 'Buscando...' : 'Buscar'}</button>
                      </SearchUsers>
                      {usuariosEncontrados.length > 0 && <SearchResults>
                        {usuariosEncontrados.map((usuario) => <SearchUser key={usuario.id}>
                          <div><strong>{usuario.nomeUsuario ? `@${usuario.nomeUsuario}` : usuario.nome}</strong><span>{usuario.nomeUsuario && usuario.nome ? usuario.nome : `Plano ${usuario.plano || 'Lite'}`}</span></div>
                          <button type="button" disabled={convidandoUsuarioId === String(usuario.id)} onClick={() => convidarUsuario(usuario.id)}>{convidandoUsuarioId === String(usuario.id) ? 'Enviando...' : 'Convidar'}</button>
                        </SearchUser>)}
                      </SearchResults>}
                    </InviteUsers>}

                    <MemberList>
                      {detalhe.membros.filter((membro) => membro.status !== 'pendente').map((membro) => <Member key={membro._id}><div><strong>@{membro.usuarioId?.nomeUsuario || membro.usuarioId?.nome}</strong><span>{membro.papel} · {membro.status}</span></div>{membro.papel !== 'proprietario' && <MemberActions>{detalhe.papel === 'proprietario' && membro.status === 'aprovado' && <button onClick={() => acaoMembro(membro.usuarioId?._id, membro.papel === 'administrador' ? 'participante' : 'administrador')}>{membro.papel === 'administrador' ? 'Remover admin' : 'Tornar admin'}</button>}<button onClick={() => acaoMembro(membro.usuarioId?._id, 'remover')}>Remover</button><button className="danger" onClick={() => acaoMembro(membro.usuarioId?._id, 'bloquear')}>Bloquear</button></MemberActions>}</Member>)}
                    </MemberList>
                  </>}
                  <Rules><strong>Regras</strong><p>{ranking.regras || 'Aplicam-se as regras gerais do mercado e o critério indicado na classificação.'}</p></Rules>
                  {detalhe.papel === 'proprietario' && <DangerZone>{ranking.status === 'ativo' && <button onClick={encerrar}><FiAward /> Encerrar e premiar campeão</button>}{ranking.status === 'encerrado' && <button onClick={arquivar}><FiArchive /> Arquivar competição</button>}</DangerZone>}
                </Panel>
              )}
            </>
          )}
        </DetailSection>
      )}

      <PrivateTools>
        <PrivateToolsCopy>
          <strong>Outras ações</strong>
          <span>Entre por código ou crie uma nova competição.</span>
        </PrivateToolsCopy>
        <HeaderActions>
          <JoinBox>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Código de convite"
              aria-label="Código de convite"
            />
            <button type="button" onClick={() => entrar()}>Entrar</button>
          </JoinBox>
          <QuietCreateButton
            type="button"
            onClick={() => podeCriar ? setCriando(true) : router.push('/planos')}
          >
            <FiPlus /> {podeCriar ? 'Criar ranking' : 'Criar com Premium'}
          </QuietCreateButton>
        </HeaderActions>
        {lista?.plano === 'lite' && (
          <CompactLiteInfo>
            <FiShield /> Você pode participar de até dois rankings privados.
          </CompactLiteInfo>
        )}
      </PrivateTools>

      {criando && (
        <ModalOverlay onMouseDown={() => setCriando(false)}>
          <ModalCard onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="novo-ranking-titulo">
            <ModalTop>
              <div><ModalTitle id="novo-ranking-titulo">Novo ranking privado</ModalTitle><ModalText>Configure sua competição. Somente o criador precisa ser Premium.</ModalText></div>
              <ModalClose type="button" onClick={() => setCriando(false)} aria-label="Fechar"><FiX /></ModalClose>
            </ModalTop>
            <Form onSubmit={criar}>
              <Field><span>Nome</span><input required maxLength={80} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Liga dos Amigos" /></Field>
              <Field><span>Descrição</span><textarea maxLength={500} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Explique a proposta da competição" /></Field>
              <TwoColumns>
                <Field><span>Visibilidade</span><select value={form.visibilidade} onChange={(e) => setForm({ ...form, visibilidade: e.target.value })}><option value="convite">Somente por convite</option><option value="publico">Pública</option></select></Field>
                <Field><span>Critério</span><select value="rentabilidade" disabled><option value="rentabilidade">Rentabilidade</option></select></Field>
              </TwoColumns>
              <TwoColumns>
                <Field><span>Início</span><input type="date" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} /></Field>
                <Field><span>Fim</span><input type="date" value={form.dataFim} onChange={(e) => setForm({ ...form, dataFim: e.target.value })} /></Field>
              </TwoColumns>
              <Field><span>Máximo de participantes</span><input type="number" min="2" max="500" value={form.maxParticipantes} onChange={(e) => setForm({ ...form, maxParticipantes: Number(e.target.value) })} /></Field>
              <Field><span>Regras</span><textarea maxLength={3000} value={form.regras} onChange={(e) => setForm({ ...form, regras: e.target.value })} placeholder="Regras adicionais do ranking" /></Field>
              <Checkbox><input type="checkbox" checked={form.aprovacaoManual} onChange={(e) => setForm({ ...form, aprovacaoManual: e.target.checked })} /> Aprovar novos participantes manualmente</Checkbox>
              <ModalActions><CancelButton type="button" onClick={() => setCriando(false)}>Cancelar</CancelButton><CreateButton type="submit">Criar ranking privado</CreateButton></ModalActions>
            </Form>
          </ModalCard>
        </ModalOverlay>
      )}
    </Wrapper>
  );
}

export default withAuth(RankingsPrivadosPage);

const Page = styled.main`padding:28px;max-width:1400px;margin:auto;color:#e2e8f0;@media(max-width:700px){padding:14px}`;
const EmbeddedPage = styled.section`color:#e2e8f0;margin-top:4px`;
const PrivateHeader = styled.div`margin-bottom:18px;padding:18px;border:1px solid rgba(148,163,184,.13);border-radius:18px;background:radial-gradient(circle at top right,rgba(250,204,21,.12),transparent 38%),rgba(15,23,42,.7);display:flex;align-items:center;justify-content:space-between;gap:16px;@media(max-width:850px){flex-direction:column;align-items:stretch}`;
const PrivateTitle = styled.h2`margin:0;color:#f8fafc;font-size:1.15rem`;
const PrivateText = styled.p`margin:6px 0 0;color:#94a3b8;font-size:.86rem;line-height:1.5`;
const RankingSelector = styled.section`margin-bottom:16px;display:flex;align-items:center;gap:14px;min-width:0;@media(max-width:720px){align-items:flex-start;flex-direction:column}`;
const SelectorHeading = styled.div`display:grid;gap:3px;flex:none;strong{color:#e2e8f0;font-size:.8rem}span{color:#64748b;font-size:.68rem}`;
const RankingOptions = styled.div`display:flex;align-items:center;gap:7px;max-width:100%;overflow-x:auto;padding:2px 2px 5px;scrollbar-width:thin`;
const RankingOption = styled.button`min-height:38px;padding:8px 12px;border:1px solid ${({$active})=>$active?'rgba(59,130,246,.42)':'rgba(148,163,184,.13)'};border-radius:10px;background:${({$active})=>$active?'rgba(37,99,235,.2)':'rgba(15,23,42,.5)'};color:${({$active})=>$active?'#eff6ff':'#94a3b8'};font-size:.78rem;font-weight:800;white-space:nowrap;cursor:pointer;display:flex;align-items:center;gap:7px;&:hover{color:#f8fafc;background:rgba(59,130,246,.12)}small{padding:3px 5px;border-radius:999px;background:rgba(250,204,21,.1);color:#fde68a;font-size:.57rem;text-transform:uppercase}`;
const HeaderActions = styled.div`display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap;@media(max-width:600px){align-items:stretch;flex-direction:column}`;
const JoinBox = styled.div`display:flex;input{width:150px;border:1px solid rgba(148,163,184,.18);border-radius:11px 0 0 11px;padding:10px 11px;background:rgba(15,23,42,.8);color:#f8fafc;outline:none}button{border:1px solid rgba(148,163,184,.18);border-left:0;border-radius:0 11px 11px 0;padding:0 12px;background:rgba(255,255,255,.05);color:#cbd5e1;font-weight:800;cursor:pointer}@media(max-width:600px){input{width:100%}}`;
const CreateButton = styled.button`border:1px solid rgba(250,204,21,.32);border-radius:12px;padding:10px 14px;background:rgba(250,204,21,.13);color:#fde68a;font-weight:900;cursor:pointer;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:7px;&:hover{background:rgba(250,204,21,.2)}`;
const LiteInfo = styled.div`margin-bottom:16px;display:flex;gap:12px;align-items:center;padding:13px 16px;border-radius:13px;background:rgba(15,23,42,.7);border:1px solid rgba(250,204,21,.15);color:#facc15;div{display:flex;flex-direction:column}span{color:#94a3b8;font-size:.75rem;margin-top:3px}`;
const Alert = styled.div`margin:12px 0;padding:11px 14px;border-radius:11px;background:${({$erro})=>$erro?'rgba(239,68,68,.08)':'rgba(34,197,94,.08)'};border:1px solid ${({$erro})=>$erro?'rgba(239,68,68,.25)':'rgba(34,197,94,.25)'};color:${({$erro})=>$erro?'#fca5a5':'#86efac'};font-size:.85rem`;
const PrivateGrid = styled.div`display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;@media(max-width:900px){grid-template-columns:1fr}`;
const PrivateGroup = styled.section``;
const GroupTitle = styled.h3`margin:0 0 10px;color:#e2e8f0;font-size:.95rem`;
const CardList = styled.div`display:flex;flex-direction:column;gap:12px`;
const PrivateCard = styled.article`padding:15px;border:1px solid rgba(148,163,184,.13);border-radius:16px;background:rgba(255,255,255,.025);transition:.18s ease;&:hover{border-color:rgba(250,204,21,.2);background:rgba(255,255,255,.035)}`;
const CardTop = styled.div`display:flex;align-items:flex-start;justify-content:space-between;gap:12px`;
const CardName = styled.strong`display:block;color:#f8fafc;font-size:.96rem`;
const CardDescription = styled.p`margin:5px 0 0;color:#94a3b8;font-size:.78rem;line-height:1.45`;
const RoleBadge = styled.span`padding:5px 8px;border-radius:999px;background:rgba(59,130,246,.13);color:#bfdbfe;font-size:.68rem;font-weight:900;white-space:nowrap`;
const CardMeta = styled.div`margin-top:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;span{color:#64748b;font-size:.74rem}strong{color:#cbd5e1;font-size:.82rem;text-transform:capitalize}`;
const InviteCode = styled.code`padding:4px 7px;border-radius:8px;background:rgba(15,23,42,.9);color:#fde68a;font-size:.78rem;font-weight:900`;
const CardActions = styled.div`margin-top:14px;display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap`;
const SecondaryButton = styled.button`border:1px solid rgba(148,163,184,.16);border-radius:10px;padding:8px 10px;background:rgba(255,255,255,.035);color:#cbd5e1;font-size:.76rem;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;&:hover{background:rgba(59,130,246,.12);border-color:rgba(59,130,246,.25)}`;
const GroupEmpty = styled.div`padding:16px;border:1px dashed rgba(148,163,184,.13);border-radius:13px;color:#64748b;text-align:center;font-size:.78rem`;
const EmptyState = styled.div`min-height:230px;border:1px dashed rgba(148,163,184,.16);border-radius:18px;background:rgba(15,23,42,.4);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#64748b;gap:7px;svg{font-size:34px;color:#d6b82d}strong{color:#e2e8f0;font-size:1rem}span{font-size:.8rem}`;
const DetailSection = styled.section`margin-top:4px`;
const PendingNotice = styled.div`display:flex;align-items:center;gap:11px;margin:12px 0;padding:12px 14px;border:1px solid rgba(250,204,21,.25);border-radius:12px;background:rgba(250,204,21,.065);color:#fde68a;div{display:grid;gap:3px}span{color:#94a3b8;font-size:.72rem}`;
const DetailHeader = styled.div`padding:8px 2px 16px;border-bottom:1px solid rgba(148,163,184,.12);display:flex;align-items:center;justify-content:space-between;gap:16px;@media(max-width:760px){align-items:flex-start;flex-direction:column}`;
const DetailIdentity = styled.div`display:flex;align-items:center;gap:13px;h2{margin:3px 0;color:#f8fafc;font-size:1.18rem}p{margin:0;color:#94a3b8;font-size:.8rem}`;
const LeagueLogo = styled.div`width:52px;height:52px;border-radius:13px;background:#18334e;color:#fde68a;display:grid;place-items:center;font-weight:900;font-size:1.2rem;overflow:hidden;flex:none;img{width:100%;height:100%;object-fit:cover}`;
const DetailStatus = styled.span`color:#d6b82d;font-size:.66rem;font-weight:900;text-transform:uppercase;letter-spacing:.05em`;
const DetailActions = styled.div`display:flex;align-items:center;justify-content:flex-end;gap:9px;@media(max-width:600px){width:100%;justify-content:flex-start;flex-wrap:wrap}`;
const AdminButton = styled.button`border:1px solid rgba(250,204,21,.24);border-radius:10px;padding:8px 10px;background:rgba(250,204,21,.08);color:#fde68a;font-size:.76rem;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px`;
const DeleteButton = styled.button`border:1px solid rgba(239,68,68,.24);border-radius:10px;padding:8px 10px;background:rgba(239,68,68,.07);color:#fca5a5;font-size:.76rem;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px`;
const InviteSummary = styled.div`text-align:right;span,strong{display:block}span{color:#64748b;font-size:.62rem;text-transform:uppercase}strong{color:#fde68a;font-size:.8rem;letter-spacing:.1em}`;
const CloseDetail = styled.button`width:34px;height:34px;border:1px solid rgba(148,163,184,.16);border-radius:999px;background:rgba(255,255,255,.04);color:#cbd5e1;display:grid;place-items:center;cursor:pointer`;
const Tabs = styled.div`display:flex;gap:7px;overflow:auto;margin:13px 0`;
const Tab = styled.button`display:flex;align-items:center;gap:6px;white-space:nowrap;padding:9px 12px;border-radius:9px;border:1px solid ${({$active})=>$active?'rgba(250,204,21,.3)':'rgba(148,163,184,.14)'};background:${({$active})=>$active?'rgba(250,204,21,.09)':'rgba(15,23,42,.6)'};color:${({$active})=>$active?'#fde68a':'#94a3b8'};font-size:.78rem;font-weight:800;cursor:pointer`;
const Panel = styled.section`background:rgba(15,23,42,.65);border:1px solid rgba(148,163,184,.13);border-radius:16px;padding:18px;overflow:auto`;
const PanelHead = styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:10px;h3{margin:0;color:#f8fafc;font-size:1rem}p{margin:4px 0 0;color:#64748b;font-size:.73rem}`;
const CountBadge = styled.span`background:rgba(59,130,246,.1);color:#bfdbfe;border-radius:999px;padding:6px 9px;font-size:.68rem;white-space:nowrap`;
const TableWrap = styled.div`overflow:auto`;
const Table = styled.table`width:100%;border-collapse:collapse;min-width:650px;th{text-align:left;color:#64748b;font-size:.68rem;text-transform:uppercase;padding:10px}td{padding:12px 10px;border-top:1px solid rgba(148,163,184,.1);color:#cbd5e1;font-size:.82rem}small{display:block;color:#64748b;margin-top:3px;text-transform:capitalize}`;
const Position = styled.span`display:grid;place-items:center;width:32px;height:32px;border-radius:10px;background:${({$top})=>$top?'rgba(250,204,21,.12)':'rgba(148,163,184,.08)'};color:${({$top})=>$top?'#fde68a':'#94a3b8'};font-weight:900`;
const Variation = styled.strong`color:${({$positive})=>$positive?'#4ade80':'#f87171'}`;
const PostForm = styled.form`display:flex;gap:9px;margin-bottom:14px;textarea{flex:1;min-height:74px;resize:vertical;border:1px solid rgba(148,163,184,.16);border-radius:11px;padding:11px;background:rgba(15,23,42,.8);color:#f8fafc;outline:none}@media(max-width:600px){flex-direction:column}`;
const Post = styled.article`padding:13px;border:1px solid rgba(148,163,184,.1);border-radius:11px;margin-top:9px;background:rgba(255,255,255,.02);span{color:#64748b;font-size:.67rem;margin-left:8px}p{margin:8px 0 0;color:#cbd5e1;white-space:pre-wrap;font-size:.82rem}`;
const StatsGrid = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:12px;@media(max-width:800px){grid-template-columns:1fr 1fr}@media(max-width:450px){grid-template-columns:1fr}`;
const StatCard = styled.div`background:rgba(15,23,42,.65);border:1px solid rgba(148,163,184,.13);border-radius:14px;padding:18px;span{display:block;color:#64748b;font-size:.73rem}strong{display:block;color:#f8fafc;font-size:1.05rem;margin-top:7px}`;
const Champion = styled.div`display:flex;gap:12px;align-items:center;padding:12px;border-bottom:1px solid rgba(148,163,184,.1);color:#facc15;div strong,div span{display:block}span{color:#64748b;font-size:.7rem;margin-top:3px}`;
const Locked = styled.div`display:flex;gap:8px;align-items:center;justify-content:center;padding:36px;color:#94a3b8;font-size:.82rem`;
const MemberList = styled.div`display:flex;flex-direction:column;gap:8px`;
const Member = styled.div`display:flex;justify-content:space-between;gap:12px;align-items:center;background:rgba(255,255,255,.02);border:1px solid rgba(148,163,184,.1);border-radius:10px;padding:11px;span{display:block;color:#64748b;font-size:.7rem;margin-top:3px;text-transform:capitalize}@media(max-width:650px){align-items:flex-start;flex-direction:column}`;
const MemberActions = styled.div`display:flex;gap:5px;flex-wrap:wrap;button{background:rgba(59,130,246,.1);border:1px solid rgba(148,163,184,.16);color:#cbd5e1;border-radius:7px;padding:6px 8px;cursor:pointer;font-size:.68rem}.danger{background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.28);color:#fca5a5}`;
const PendingBox = styled.section`margin-bottom:15px;padding:13px;border:1px solid rgba(250,204,21,.26);border-radius:13px;background:rgba(250,204,21,.055);display:grid;gap:8px`;
const PendingTitle = styled.div`display:flex;align-items:center;justify-content:space-between;color:#fde68a;margin-bottom:2px;span{padding:4px 8px;border-radius:999px;background:rgba(250,204,21,.12);font-size:.65rem;font-weight:900}`;
const InviteUsers = styled.section`margin-bottom:15px;padding:14px;border:1px solid rgba(59,130,246,.2);border-radius:13px;background:rgba(59,130,246,.045)`;
const InviteUsersHeader = styled.div`display:grid;gap:4px;margin-bottom:10px;strong{color:#f8fafc;font-size:.86rem}span{color:#64748b;font-size:.72rem;line-height:1.45}`;
const SearchUsers = styled.form`display:flex;align-items:center;border:1px solid rgba(148,163,184,.18);border-radius:10px;background:rgba(15,23,42,.78);overflow:hidden;color:#64748b;svg{margin-left:11px;flex:none}input{min-width:0;flex:1;border:0;outline:0;background:transparent;color:#f8fafc;padding:10px}button{align-self:stretch;border:0;background:rgba(59,130,246,.18);color:#bfdbfe;padding:0 13px;font-weight:800;cursor:pointer}button:disabled{opacity:.55}`;
const SearchResults = styled.div`display:grid;gap:7px;margin-top:10px`;
const SearchUser = styled.div`display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 10px;border:1px solid rgba(148,163,184,.12);border-radius:9px;background:rgba(255,255,255,.025);div{display:grid;gap:2px}strong{color:#e2e8f0;font-size:.78rem}span{color:#64748b;font-size:.67rem}button{border:1px solid rgba(250,204,21,.25);border-radius:8px;background:rgba(250,204,21,.1);color:#fde68a;padding:7px 9px;font-weight:800;cursor:pointer}button:disabled{opacity:.55}`;
const Rules = styled.div`margin-top:18px;border-top:1px solid rgba(148,163,184,.1);padding-top:15px;color:#94a3b8;font-size:.8rem;p{white-space:pre-wrap;line-height:1.5}`;
const DangerZone = styled.div`margin-top:15px;button{background:transparent;border:1px solid rgba(250,204,21,.28);color:#fde68a;border-radius:9px;padding:9px 12px;cursor:pointer;display:flex;gap:6px;align-items:center;font-weight:800}`;
const RankingTableContainer = styled.div`overflow:hidden;border:1px solid rgba(148,163,184,.13);border-radius:16px;background:rgba(15,23,42,.62);@media(max-width:560px){border-radius:13px}`;
const RankingTable = styled.table`width:100%;border-collapse:collapse;table-layout:fixed;th,td{padding:14px 16px;text-align:left;vertical-align:middle;border-bottom:1px solid rgba(148,163,184,.1)}th{background:rgba(255,255,255,.035);color:#94a3b8;font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em}th:first-child,td:first-child{width:82px;text-align:center}th:nth-child(3),td:nth-child(3){width:190px;text-align:right}th:nth-child(4),td:nth-child(4){width:180px;text-align:right}tbody tr:last-child td{border-bottom:0}@media(max-width:700px){th,td{padding:12px 10px}th:first-child,td:first-child{width:54px}th:nth-child(3),td:nth-child(3){width:112px}.patrimonio{display:none}}`;
const RankingRow = styled.tr`background:${({$highlight})=>$highlight?'rgba(59,130,246,.11)':'transparent'};transition:background .18s ease;&:hover{background:${({$highlight})=>$highlight?'rgba(59,130,246,.15)':'rgba(255,255,255,.035)'}};td{color:#cbd5e1;font-size:.82rem}`;
const RankingPosition = styled.strong`display:inline-grid;min-width:36px;height:30px;padding:0 7px;place-items:center;border-radius:8px;background:${({$position})=>Number($position)===1?'rgba(250,204,21,.16)':Number($position)===2?'rgba(203,213,225,.13)':Number($position)===3?'rgba(251,146,60,.14)':'rgba(255,255,255,.04)'};color:${({$position})=>Number($position)===1?'#fde047':Number($position)===2?'#cbd5e1':Number($position)===3?'#fdba74':'#e2e8f0'};font-size:.84rem`;
const RankingUser = styled.div`display:flex;align-items:center;gap:10px;min-width:0;div{min-width:0}strong{display:block;overflow:hidden;color:#f8fafc;font-size:.88rem;text-overflow:ellipsis;white-space:nowrap}small{display:block;margin-top:3px;color:#60a5fa;font-size:.68rem;font-weight:700}`;
const EmptyRanking = styled.div`min-height:180px;border:1px dashed rgba(148,163,184,.16);border-radius:16px;display:grid;place-items:center;text-align:center;color:#64748b;font-size:.82rem`;
const PrivateTools = styled.section`position:relative;margin-top:22px;padding:13px 14px;border:1px solid rgba(148,163,184,.11);border-radius:13px;background:rgba(15,23,42,.34);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap`;
const PrivateToolsCopy = styled.div`display:grid;gap:3px;strong{color:#cbd5e1;font-size:.78rem}span{color:#64748b;font-size:.68rem}`;
const QuietCreateButton = styled.button`border:1px solid rgba(148,163,184,.16);border-radius:10px;padding:9px 11px;background:rgba(255,255,255,.025);color:#94a3b8;font-size:.75rem;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;&:hover{color:#e2e8f0;background:rgba(255,255,255,.05)}`;
const CompactLiteInfo = styled.div`width:100%;padding-top:9px;border-top:1px solid rgba(148,163,184,.08);display:flex;align-items:center;gap:6px;color:#64748b;font-size:.67rem;svg{color:#d6b82d}`;
const Loading = styled.div`padding:30px;text-align:center;color:#94a3b8;font-size:.82rem`;
const ModalOverlay = styled.div`position:fixed;inset:0;z-index:1000;padding:20px;background:rgba(2,6,23,.78);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center`;
const ModalCard = styled.div`width:100%;max-width:590px;max-height:92vh;overflow-y:auto;border:1px solid rgba(148,163,184,.16);border-radius:20px;background:radial-gradient(circle at top right,rgba(250,204,21,.11),transparent 36%),#0f172a;box-shadow:0 24px 70px rgba(0,0,0,.45)`;
const ModalTop = styled.div`padding:20px 20px 14px;border-bottom:1px solid rgba(148,163,184,.12);display:flex;align-items:flex-start;justify-content:space-between;gap:16px`;
const ModalTitle = styled.h2`margin:0;color:#f8fafc;font-size:1.18rem`;
const ModalText = styled.p`margin:7px 0 0;color:#94a3b8;font-size:.84rem;line-height:1.5`;
const ModalClose = styled.button`width:34px;height:34px;border:1px solid rgba(148,163,184,.16);border-radius:999px;background:rgba(255,255,255,.04);color:#cbd5e1;display:grid;place-items:center;cursor:pointer;&:hover{background:rgba(239,68,68,.12);color:#fecaca}`;
const Form = styled.form`padding:18px 20px 20px`;
const Field = styled.label`display:block;margin-bottom:14px;span{display:block;margin-bottom:6px;color:#cbd5e1;font-size:.78rem;font-weight:800}input,textarea,select{width:100%;border:1px solid rgba(148,163,184,.16);border-radius:12px;padding:11px 12px;background:rgba(15,23,42,.75);color:#f8fafc;font-size:.88rem;outline:none}textarea{min-height:88px;resize:vertical;line-height:1.45}select{color-scheme:dark}input:focus,textarea:focus,select:focus{border-color:rgba(250,204,21,.42)}`;
const TwoColumns = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:12px;@media(max-width:550px){grid-template-columns:1fr}`;
const Checkbox = styled.label`margin:6px 0 16px;display:flex;align-items:center;gap:9px;color:#cbd5e1;font-size:.82rem;cursor:pointer;input{width:16px;height:16px;accent-color:#eab308}`;
const ModalActions = styled.div`margin-top:18px;display:flex;justify-content:flex-end;gap:10px;@media(max-width:520px){flex-direction:column-reverse}`;
const CancelButton = styled.button`border:1px solid rgba(148,163,184,.18);border-radius:12px;padding:10px 14px;background:rgba(255,255,255,.04);color:#cbd5e1;font-weight:800;cursor:pointer`;
