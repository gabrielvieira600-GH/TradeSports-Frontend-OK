import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import api from '../lib/api';
import withAuth from '../components/withAuth';

function formatarData(data) {
  if (!data) return '';

  try {
    return new Date(data).toLocaleString('pt-BR');
  } catch {
    return '';
  }
}

function nomeUsuario(usuario) {
  return (
    usuario?.nomeUsuario ||
    usuario?.nomePublico ||
    usuario?.nome ||
    'Usuário'
  );
}

function statusLabel(status) {
  const mapa = {
    pendente: 'Pendente',
    aceito: 'Aceito',
    recusado: 'Recusado',
    cancelado: 'Cancelado',
    expirado: 'Expirado',
  };

  return mapa[status] || status || '-';
}

function ConvitesPage() {
  const [aba, setAba] = useState('recebidos');

  const [recebidos, setRecebidos] = useState([]);
  const [enviados, setEnviados] = useState([]);

  const [carregandoRecebidos, setCarregandoRecebidos] = useState(false);
  const [carregandoEnviados, setCarregandoEnviados] = useState(false);

  const [erroRecebidos, setErroRecebidos] = useState('');
  const [erroEnviados, setErroEnviados] = useState('');

  const [processandoId, setProcessandoId] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  const totalPendentesRecebidos = useMemo(
    () => recebidos.filter((convite) => convite.status === 'pendente').length,
    [recebidos]
  );

  const totalPendentesEnviados = useMemo(
    () => enviados.filter((convite) => convite.status === 'pendente').length,
    [enviados]
  );

  async function carregarRecebidos() {
    try {
      setCarregandoRecebidos(true);
      setErroRecebidos('');

      const { data } = await api.get('/ranking-convites/recebidos');

      setRecebidos(Array.isArray(data?.convites) ? data.convites : []);
    } catch (err) {
      console.error('Erro ao carregar convites recebidos:', err);

      setErroRecebidos(
        err?.response?.data?.erro ||
          'Não foi possível carregar os convites recebidos.'
      );

      setRecebidos([]);
    } finally {
      setCarregandoRecebidos(false);
    }
  }

  async function carregarEnviados() {
    try {
      setCarregandoEnviados(true);
      setErroEnviados('');

      const { data } = await api.get('/ranking-convites/enviados');

      setEnviados(Array.isArray(data?.convites) ? data.convites : []);
    } catch (err) {
      console.error('Erro ao carregar convites enviados:', err);

      setErroEnviados(
        err?.response?.data?.erro ||
          'Não foi possível carregar os convites enviados.'
      );

      setEnviados([]);
    } finally {
      setCarregandoEnviados(false);
    }
  }

  async function recarregarTudo() {
    await Promise.all([
      carregarRecebidos(),
      carregarEnviados(),
    ]);
  }

  async function aceitarConvite(conviteId) {
    try {
      setProcessandoId(conviteId);
      setMensagemErro('');
      setMensagemSucesso('');

      await api.post(`/ranking-convites/${conviteId}/aceitar`);

      setMensagemSucesso('Convite aceito com sucesso.');

      await recarregarTudo();
    } catch (err) {
      console.error('Erro ao aceitar convite:', err);

      setMensagemErro(
        err?.response?.data?.erro ||
          'Não foi possível aceitar este convite.'
      );
    } finally {
      setProcessandoId(null);
    }
  }

  async function recusarConvite(conviteId) {
    try {
      setProcessandoId(conviteId);
      setMensagemErro('');
      setMensagemSucesso('');

      await api.post(`/ranking-convites/${conviteId}/recusar`);

      setMensagemSucesso('Convite recusado.');

      await recarregarTudo();
    } catch (err) {
      console.error('Erro ao recusar convite:', err);

      setMensagemErro(
        err?.response?.data?.erro ||
          'Não foi possível recusar este convite.'
      );
    } finally {
      setProcessandoId(null);
    }
  }

  async function cancelarConvite(conviteId) {
    try {
      setProcessandoId(conviteId);
      setMensagemErro('');
      setMensagemSucesso('');

      await api.post(`/ranking-convites/${conviteId}/cancelar`);

      setMensagemSucesso('Convite cancelado.');

      await recarregarTudo();
    } catch (err) {
      console.error('Erro ao cancelar convite:', err);

      setMensagemErro(
        err?.response?.data?.erro ||
          'Não foi possível cancelar este convite.'
      );
    } finally {
      setProcessandoId(null);
    }
  }

  useEffect(() => {
    recarregarTudo();
  }, []);

  const listaAtual = aba === 'recebidos' ? recebidos : enviados;
  const carregandoAtual =
    aba === 'recebidos' ? carregandoRecebidos : carregandoEnviados;
  const erroAtual = aba === 'recebidos' ? erroRecebidos : erroEnviados;

  return (
    <Container>
      <Cabecalho>
        <div>
          <Eyebrow>Comunidade</Eyebrow>

          <Titulo>
            Convites de rankings privados
          </Titulo>

          <Subtitulo>
            Aceite ou recuse convites recebidos e acompanhe os convites que você enviou para outros usuários Premium.
          </Subtitulo>
        </div>

        <ResumoCard>
          <ResumoLabel>Pendentes</ResumoLabel>

          <ResumoValor>
            {totalPendentesRecebidos + totalPendentesEnviados}
          </ResumoValor>
        </ResumoCard>
      </Cabecalho>

      <Abas>
        <AbaBotao
          type="button"
          $ativa={aba === 'recebidos'}
          onClick={() => setAba('recebidos')}
        >
          Recebidos

          <ContadorAba>
            {totalPendentesRecebidos}
          </ContadorAba>
        </AbaBotao>

        <AbaBotao
          type="button"
          $ativa={aba === 'enviados'}
          onClick={() => setAba('enviados')}
        >
          Enviados

          <ContadorAba>
            {totalPendentesEnviados}
          </ContadorAba>
        </AbaBotao>
      </Abas>

      {mensagemErro && (
        <MensagemErro>
          {mensagemErro}
        </MensagemErro>
      )}

      {mensagemSucesso && (
        <MensagemSucesso>
          {mensagemSucesso}
        </MensagemSucesso>
      )}

      {erroAtual && (
        <MensagemErro>
          {erroAtual}
        </MensagemErro>
      )}

      {carregandoAtual ? (
        <EstadoCard>
          Carregando convites...
        </EstadoCard>
      ) : listaAtual.length === 0 ? (
        <EstadoCard>
          {aba === 'recebidos'
            ? 'Você ainda não recebeu convites de rankings privados.'
            : 'Você ainda não enviou convites de rankings privados.'}
        </EstadoCard>
      ) : (
        <ListaConvites>
          {listaAtual.map((convite) => {
            const ranking = convite.ranking || {};
            const remetente = convite.remetente || {};
            const destinatario = convite.destinatario || {};
            const pendente = convite.status === 'pendente';
            const processando = processandoId === convite.id;

            return (
              <ConviteCard key={convite.id}>
                <ConviteTopo>
                  <div>
                    <RankingNome>
                      {ranking.nome || 'Ranking privado'}
                    </RankingNome>

                    <RankingDescricao>
                      {ranking.descricao ||
                        'Ranking privado da temporada atual.'}
                    </RankingDescricao>
                  </div>

                  <StatusBadge $status={convite.status}>
                    {statusLabel(convite.status)}
                  </StatusBadge>
                </ConviteTopo>

                <ConviteGrid>
                  <Metrica>
                    <span>
                      {aba === 'recebidos'
                        ? 'Enviado por'
                        : 'Enviado para'}
                    </span>

                    <strong>
                      {aba === 'recebidos'
                        ? nomeUsuario(remetente)
                        : nomeUsuario(destinatario)}
                    </strong>
                  </Metrica>

                  <Metrica>
                    <span>Participantes</span>

                    <strong>
                      {Number(ranking.totalParticipantes || 0)}/
                      {Number(ranking.maxParticipantes || 0)}
                    </strong>
                  </Metrica>

                  <Metrica>
                    <span>Enviado em</span>

                    <strong>
                      {formatarData(convite.enviadoEm) || '-'}
                    </strong>
                  </Metrica>

                  <Metrica>
                    <span>Respondido em</span>

                    <strong>
                      {formatarData(convite.respondidoEm) || '-'}
                    </strong>
                  </Metrica>
                </ConviteGrid>

                {convite.mensagem && (
                  <MensagemConvite>
                    “{convite.mensagem}”
                  </MensagemConvite>
                )}

                {aba === 'recebidos' && pendente && (
                  <Acoes>
                    <BotaoAceitar
                      type="button"
                      disabled={processando}
                      onClick={() => aceitarConvite(convite.id)}
                    >
                      {processando ? 'Processando...' : 'Aceitar'}
                    </BotaoAceitar>

                    <BotaoRecusar
                      type="button"
                      disabled={processando}
                      onClick={() => recusarConvite(convite.id)}
                    >
                      Recusar
                    </BotaoRecusar>
                  </Acoes>
                )}

                {aba === 'enviados' && pendente && (
                  <Acoes>
                    <BotaoRecusar
                      type="button"
                      disabled={processando}
                      onClick={() => cancelarConvite(convite.id)}
                    >
                      {processando ? 'Cancelando...' : 'Cancelar convite'}
                    </BotaoRecusar>
                  </Acoes>
                )}
              </ConviteCard>
            );
          })}
        </ListaConvites>
      )}
    </Container>
  );
}

export default withAuth(ConvitesPage);

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
  color: #f8fafc;
  font-size: 1.4rem;
`;

const Abas = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  padding: 5px;
  width: fit-content;
  max-width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.58);

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const AbaBotao = styled.button`
  min-height: 40px;
  padding: 9px 14px;
  border: 1px solid
    ${({ $ativa }) =>
      $ativa
        ? 'rgba(59, 130, 246, 0.4)'
        : 'transparent'};
  border-radius: 10px;

  background: ${({ $ativa }) =>
    $ativa
      ? 'rgba(37, 99, 235, 0.22)'
      : 'transparent'};

  color: ${({ $ativa }) =>
    $ativa ? '#eff6ff' : '#94a3b8'};

  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    color: #f8fafc;
    background: rgba(59, 130, 246, 0.12);
  }

  @media (max-width: 640px) {
    flex: 1;
  }
`;

const ContadorAba = styled.span`
  min-width: 23px;
  height: 23px;
  padding: 0 6px;
  border-radius: 999px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  background: rgba(148, 163, 184, 0.13);
  color: #cbd5e1;
  font-size: 0.68rem;
  font-weight: 900;
`;

const EstadoCard = styled.div`
  padding: 30px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 15px;

  color: #94a3b8;
  text-align: center;
  background: rgba(255, 255, 255, 0.025);
`;

const ListaConvites = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ConviteCard = styled.article`
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 18px;

  background:
    radial-gradient(
      circle at top right,
      rgba(59, 130, 246, 0.09),
      transparent 36%
    ),
    rgba(15, 23, 42, 0.7);
`;

const ConviteTopo = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;

  @media (max-width: 560px) {
    flex-direction: column;
  }
`;

const RankingNome = styled.strong`
  display: block;
  color: #f8fafc;
  font-size: 1rem;
`;

const RankingDescricao = styled.p`
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 0.82rem;
  line-height: 1.45;
`;

const StatusBadge = styled.span`
  padding: 6px 9px;
  border-radius: 999px;

  background: ${({ $status }) => {
    if ($status === 'aceito') return 'rgba(34, 197, 94, 0.1)';
    if ($status === 'recusado') return 'rgba(239, 68, 68, 0.1)';
    if ($status === 'cancelado') return 'rgba(148, 163, 184, 0.1)';
    return 'rgba(250, 204, 21, 0.12)';
  }};

  color: ${({ $status }) => {
    if ($status === 'aceito') return '#86efac';
    if ($status === 'recusado') return '#fca5a5';
    if ($status === 'cancelado') return '#cbd5e1';
    return '#fde68a';
  }};

  border: 1px solid
    ${({ $status }) => {
      if ($status === 'aceito') return 'rgba(34, 197, 94, 0.18)';
      if ($status === 'recusado') return 'rgba(239, 68, 68, 0.18)';
      if ($status === 'cancelado') return 'rgba(148, 163, 184, 0.16)';
      return 'rgba(250, 204, 21, 0.2)';
    }};

  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
  white-space: nowrap;
`;

const ConviteGrid = styled.div`
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 460px) {
    grid-template-columns: 1fr;
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
    font-size: 0.84rem;
  }
`;

const MensagemConvite = styled.div`
  margin-top: 13px;
  padding: 12px;
  border-left: 3px solid rgba(59, 130, 246, 0.48);
  border-radius: 10px;

  background: rgba(59, 130, 246, 0.08);
  color: #bfdbfe;
  font-size: 0.84rem;
  line-height: 1.45;
`;

const Acoes = styled.div`
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
`;

const BotaoAceitar = styled.button`
  border: 1px solid rgba(34, 197, 94, 0.26);
  border-radius: 12px;
  padding: 10px 14px;

  background: rgba(34, 197, 94, 0.12);
  color: #86efac;
  font-weight: 900;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background: rgba(34, 197, 94, 0.2);
  }
`;

const BotaoRecusar = styled.button`
  border: 1px solid rgba(239, 68, 68, 0.24);
  border-radius: 12px;
  padding: 10px 14px;

  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  font-weight: 900;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background: rgba(239, 68, 68, 0.18);
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