import { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../lib/api';
import withAuth from '../components/withAuth';
import MarketStatusCard from '../components/MarketStatusCard';

const ITENS_POR_PAGINA = 50;

function formatarTS(valor) {
  const numero = Number(valor || 0);

  return `T$ ${numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatarPercentual(valor) {
  const numero = Number(valor || 0);
  const sinal = numero > 0 ? '+' : '';

  return `${sinal}${numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [usuarioAtual, setUsuarioAtual] = useState(null);
  const [categoria, setCategoria] = useState('geral');

  const [planoUsuario, setPlanoUsuario] = useState('lite');

  const [totaisPorCategoria, setTotaisPorCategoria] = useState({
  geral: 0,
  lite: 0,
  premium: 0,
  });
  const [abaPrivadosAtiva, setAbaPrivadosAtiva] = useState(false);

const [rankingsPrivados, setRankingsPrivados] = useState({
  criados: [],
  participando: [],
});

const [carregandoPrivados, setCarregandoPrivados] = useState(false);

const [erroPrivados, setErroPrivados] = useState('');
const [modalCriarPrivadoAberto, setModalCriarPrivadoAberto] = useState(false);

const [criandoPrivado, setCriandoPrivado] = useState(false);

const [erroCriarPrivado, setErroCriarPrivado] = useState('');

const [formPrivado, setFormPrivado] = useState({
  nome: '',
  descricao: '',
  maxParticipantes: 50,
  aprovacaoManual: false,
});

const [rankingPrivadoSelecionado, setRankingPrivadoSelecionado] = useState(null);

const [classificacaoPrivada, setClassificacaoPrivada] = useState([]);

const [usuarioAtualPrivado, setUsuarioAtualPrivado] = useState(null);

const [carregandoClassificacaoPrivada, setCarregandoClassificacaoPrivada] = useState(false);

const [erroClassificacaoPrivada, setErroClassificacaoPrivada] = useState('');

const [paginaPrivada, setPaginaPrivada] = useState(1);

const [totalPaginasPrivada, setTotalPaginasPrivada] = useState(1);

const [totalUsuariosPrivado, setTotalUsuariosPrivado] = useState(0);  
const [membrosPrivados, setMembrosPrivados] = useState([]);
const [carregandoMembrosPrivados, setCarregandoMembrosPrivados] =
  useState(false);
const [erroMembrosPrivados, setErroMembrosPrivados] = useState('');
const [sucessoMembrosPrivados, setSucessoMembrosPrivados] = useState('');

const [buscaNovoParticipante, setBuscaNovoParticipante] = useState('');
const [adicionandoParticipante, setAdicionandoParticipante] =
  useState(false);
const [removendoParticipanteId, setRemovendoParticipanteId] =
  useState('');
const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalUsuarios, setTotalUsuarios] = useState(0);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarRanking = async (
  paginaSolicitada = 1,
  categoriaSolicitada = categoria
) => {
  try {
    setCarregando(true);
    setErro('');

    const { data } = await api.get('/usuario/ranking', {
      params: {
        page: paginaSolicitada,
        limit: ITENS_POR_PAGINA,
        categoria: categoriaSolicitada,
      },
    });

    setRanking(
      Array.isArray(data?.ranking)
        ? data.ranking
        : []
    );

    const usuarioRecebido =
      data?.usuarioAtual || null;

    setUsuarioAtual(usuarioRecebido);

    setPlanoUsuario(
      usuarioRecebido?.plano === 'premium'
        ? 'premium'
        : 'lite'
    );

    setTotaisPorCategoria({
      geral: Number(
        data?.totaisPorCategoria?.geral || 0
      ),

      lite: Number(
        data?.totaisPorCategoria?.lite || 0
      ),

      premium: Number(
        data?.totaisPorCategoria?.premium || 0
      ),
    });

    setPagina(
      Number(
        data?.page ||
          paginaSolicitada
      )
    );

    setTotalPaginas(
      Math.max(
        1,
        Number(
          data?.totalPages || 1
        )
      )
    );

    setTotalUsuarios(
      Number(
        data?.totalUsuarios || 0
      )
    );
  } catch (err) {
    console.error(
      'Erro ao carregar ranking:',
      err
    );

    setErro(
      err?.response?.data?.erro ||
        'Não foi possível carregar o ranking.'
    );

    setRanking([]);
    setUsuarioAtual(null);
  } finally {
    setCarregando(false);
  }
};

  useEffect(() => {
  if (abaPrivadosAtiva) {
    return;
  }

  carregarRanking(
    pagina,
    categoria
  );
}, [pagina, categoria, abaPrivadosAtiva]);

  useEffect(() => {
  if (
    abaPrivadosAtiva &&
    planoUsuario === 'premium'
  ) {
    carregarRankingsPrivados();
  }
}, [abaPrivadosAtiva, planoUsuario]);
  
  const categoriaMeuPlano =
  planoUsuario === 'premium'
    ? 'premium'
    : 'lite';

const nomeMeuPlano =
  planoUsuario === 'premium'
    ? 'Premium'
    : 'Lite';

const tituloCategoria =
  abaPrivadosAtiva
    ? 'Rankings privados'
    : categoria === 'geral'
    ? 'Ranking geral'
    : categoria === 'premium'
    ? 'Ranking Premium'
    : 'Ranking Lite';

const totalPrivados =
  Number(
    rankingsPrivados.criados.length +
      rankingsPrivados.participando.length
  );

const totalCategoriaAtual =
  abaPrivadosAtiva
    ? totalPrivados
    : categoria === 'geral'
    ? totaisPorCategoria.geral
    : categoria === 'premium'
    ? totaisPorCategoria.premium
    : totaisPorCategoria.lite;

  const mudarCategoria = (
  novaCategoria
) => {
  if (
    ![
      'geral',
      'lite',
      'premium',
    ].includes(novaCategoria)
  ) {
    return;
  }

  setAbaPrivadosAtiva(false);

  setCategoria(
    novaCategoria
  );

  setPagina(1);

  if (
    typeof window !==
    'undefined'
  ) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
};
  
  const abrirAbaPrivados = () => {
  if (planoUsuario !== 'premium') {
    return;
  }

  setAbaPrivadosAtiva(true);

  if (
    typeof window !==
    'undefined'
  ) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
};

  const mudarPagina = (novaPagina) => {
    const paginaValida = Math.min(
      totalPaginas,
      Math.max(1, novaPagina)
    );

    setPagina(paginaValida);

    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const mudarPaginaPrivada = (novaPagina) => {
  if (!rankingPrivadoSelecionado?.id) {
    return;
  }

  const paginaValida = Math.min(
    totalPaginasPrivada,
    Math.max(1, novaPagina)
  );

  setPaginaPrivada(paginaValida);

  carregarClassificacaoPrivada(
    rankingPrivadoSelecionado.id,
    paginaValida
  );
  
  const carregarMembrosPrivados = async (rankingPrivadoId) => {
  if (!rankingPrivadoId) return;

  try {
    setCarregandoMembrosPrivados(true);
    setErroMembrosPrivados('');

    const { data } = await api.get(
      `/rankings-privados/${rankingPrivadoId}/membros`
    );

    setMembrosPrivados(
      Array.isArray(data?.membros)
        ? data.membros
        : []
    );
  } catch (err) {
    console.error(
      'Erro ao carregar membros privados:',
      err
    );

    setErroMembrosPrivados(
      err?.response?.data?.erro ||
        'Não foi possível carregar os participantes deste ranking.'
    );

    setMembrosPrivados([]);
  } finally {
    setCarregandoMembrosPrivados(false);
  }
};

const adicionarParticipantePrivado = async (e) => {
  e.preventDefault();

  if (!rankingPrivadoSelecionado?.id) {
    return;
  }

  const busca = String(buscaNovoParticipante || '').trim();

  if (!busca) {
    setErroMembrosPrivados(
      'Informe o @usuário, nome ou e-mail do participante.'
    );
    return;
  }

  try {
    setAdicionandoParticipante(true);
    setErroMembrosPrivados('');
    setSucessoMembrosPrivados('');

    await api.post(
      `/rankings-privados/${rankingPrivadoSelecionado.id}/adicionar`,
      {
        busca,
      }
    );

    setBuscaNovoParticipante('');
    setSucessoMembrosPrivados(
      'Participante adicionado com sucesso.'
    );

    await carregarClassificacaoPrivada(
      rankingPrivadoSelecionado.id,
      paginaPrivada
    );

    await carregarMembrosPrivados(
      rankingPrivadoSelecionado.id
    );

    await carregarRankingsPrivados();
  } catch (err) {
    console.error(
      'Erro ao adicionar participante:',
      err
    );

    setErroMembrosPrivados(
      err?.response?.data?.erro ||
        'Não foi possível adicionar este participante.'
    );
  } finally {
    setAdicionandoParticipante(false);
  }
};

const removerParticipantePrivado = async (usuarioId) => {
  if (!rankingPrivadoSelecionado?.id || !usuarioId) {
    return;
  }

  const confirmar = window.confirm(
    'Tem certeza que deseja remover este participante do ranking privado?'
  );

  if (!confirmar) {
    return;
  }

  try {
    setRemovendoParticipanteId(String(usuarioId));
    setErroMembrosPrivados('');
    setSucessoMembrosPrivados('');

    await api.post(
      `/rankings-privados/${rankingPrivadoSelecionado.id}/remover/${usuarioId}`
    );

    setSucessoMembrosPrivados(
      'Participante removido com sucesso.'
    );

    await carregarClassificacaoPrivada(
      rankingPrivadoSelecionado.id,
      paginaPrivada
    );

    await carregarMembrosPrivados(
      rankingPrivadoSelecionado.id
    );

    await carregarRankingsPrivados();
  } catch (err) {
    console.error(
      'Erro ao remover participante:',
      err
    );

    setErroMembrosPrivados(
      err?.response?.data?.erro ||
        'Não foi possível remover este participante.'
    );
  } finally {
    setRemovendoParticipanteId('');
  }
};

  if (typeof window !== 'undefined') {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
};

const carregarRankingsPrivados = async () => {
  try {
    setCarregandoPrivados(true);
    setErroPrivados('');

    const { data } = await api.get('/rankings-privados');

    setRankingsPrivados({
      criados: Array.isArray(data?.criados)
        ? data.criados
        : [],

      participando: Array.isArray(data?.participando)
        ? data.participando
        : [],
    });
  } catch (err) {
    console.error(
      'Erro ao carregar rankings privados:',
      err
    );

    setErroPrivados(
      err?.response?.data?.erro ||
        'Não foi possível carregar seus rankings privados.'
    );

    setRankingsPrivados({
      criados: [],
      participando: [],
    });
  } finally {
    setCarregandoPrivados(false);
  }
};

const criarRankingPrivado = async (e) => {
  e.preventDefault();

  try {
    setCriandoPrivado(true);
    setErroCriarPrivado('');

    const nome = String(formPrivado.nome || '').trim();

    if (!nome) {
      setErroCriarPrivado('Informe o nome do ranking privado.');
      return;
    }

    const payload = {
      nome,
      descricao: String(formPrivado.descricao || '').trim(),
      maxParticipantes: Number(formPrivado.maxParticipantes || 50),
      aprovacaoManual: Boolean(formPrivado.aprovacaoManual),
    };

    await api.post('/rankings-privados', payload);

    setFormPrivado({
      nome: '',
      descricao: '',
      maxParticipantes: 50,
      aprovacaoManual: false,
    });

    setModalCriarPrivadoAberto(false);

    await carregarRankingsPrivados();
  } catch (err) {
    console.error(
      'Erro ao criar ranking privado:',
      err
    );

    setErroCriarPrivado(
      err?.response?.data?.erro ||
        'Não foi possível criar o ranking privado.'
    );
  } finally {
    setCriandoPrivado(false);
  }
};

const carregarClassificacaoPrivada = async (
  rankingPrivadoId,
  paginaSolicitada = 1
) => {
  try {
    setCarregandoClassificacaoPrivada(true);
    setErroClassificacaoPrivada('');

    const { data } = await api.get(
      `/rankings-privados/${rankingPrivadoId}/classificacao`,
      {
        params: {
          page: paginaSolicitada,
          limit: ITENS_POR_PAGINA,
        },
      }
    );

    setRankingPrivadoSelecionado(
      data?.ranking || null
    );

    setClassificacaoPrivada(
      Array.isArray(data?.classificacao)
        ? data.classificacao
        : []
    );

    setUsuarioAtualPrivado(
      data?.usuarioAtual || null
    );

    setPaginaPrivada(
      Number(data?.page || paginaSolicitada)
    );

    setTotalPaginasPrivada(
      Math.max(
        1,
        Number(data?.totalPages || 1)
      )
    );

    setTotalUsuariosPrivado(
      Number(data?.totalUsuarios || 0)
    );
    await carregarMembrosPrivados(rankingPrivadoId);
  } catch (err) {
    console.error(
      'Erro ao carregar classificação privada:',
      err
    );

    setErroClassificacaoPrivada(
      err?.response?.data?.erro ||
        'Não foi possível carregar a classificação deste ranking privado.'
    );

    setRankingPrivadoSelecionado(null);
    setClassificacaoPrivada([]);
    setUsuarioAtualPrivado(null);
  } finally {
    setCarregandoClassificacaoPrivada(false);
  }
};
const voltarParaListaPrivados = () => {
  setRankingPrivadoSelecionado(null);
  setClassificacaoPrivada([]);
  setUsuarioAtualPrivado(null);
  setErroClassificacaoPrivada('');
  setPaginaPrivada(1);
  setTotalPaginasPrivada(1);
  setTotalUsuariosPrivado(0);

  setMembrosPrivados([]);
  setErroMembrosPrivados('');
  setSucessoMembrosPrivados('');
  setBuscaNovoParticipante('');
  setRemovendoParticipanteId('');
};
  return (
  <Container>
    <MarketStatusCard compacto />
    <Cabecalho>
      <CabecalhoTexto>
        <Eyebrow>Mercado simulado</Eyebrow>

        <Titulo>
          Ranking TradeSports
        </Titulo>

        <Subtitulo>
          Todos começam com T$ 1.000,00.
          Analise os clubes, negocie suas unidades
          e aumente seu patrimônio para subir no ranking.
        </Subtitulo>
      </CabecalhoTexto>

      <ResumoGeral>
        <ResumoLabel>
          {tituloCategoria}
        </ResumoLabel>

        <ResumoValor>
          {totalCategoriaAtual.toLocaleString('pt-BR')}
        </ResumoValor>
      </ResumoGeral>
    </Cabecalho>

    <AbasRanking>
      <AbaRanking
        type="button"
        $ativa={
          !abaPrivadosAtiva &&
          categoria === 'geral'
        }
        onClick={() => mudarCategoria('geral')}
      >
        Geral

        <ContadorAba>
          {totaisPorCategoria.geral}
        </ContadorAba>
      </AbaRanking>

      <AbaRanking
        type="button"
        $ativa={
          !abaPrivadosAtiva &&
          categoria === categoriaMeuPlano
        }
        onClick={() =>
          mudarCategoria(categoriaMeuPlano)
        }
      >
        Ranking {nomeMeuPlano}

        <ContadorAba>
          {totaisPorCategoria[categoriaMeuPlano]}
        </ContadorAba>
      </AbaRanking>

      {planoUsuario === 'premium' && (
        <AbaRanking
          type="button"
          $ativa={abaPrivadosAtiva}
          onClick={abrirAbaPrivados}
        >
          Privados

          <ContadorAba>
            {totalPrivados}
          </ContadorAba>
        </AbaRanking>
      )}
    </AbasRanking>

    {usuarioAtual && (
      <MeuRanking>
        <MeuRankingTopo>
          <div>
            <MeuRankingLabel>
              Sua classificação
            </MeuRankingLabel>

            <MeuRankingPosicao>
              {Number(
                usuarioAtual.posicaoGeral ||
                  usuarioAtual.posicao ||
                  0
              ) > 0
                ? `${Number(
                    usuarioAtual.posicaoGeral ||
                      usuarioAtual.posicao
                  )}º geral`
                : 'Sem posição geral'}
            </MeuRankingPosicao>

            <MeuRankingPlano>
              {Number(
                usuarioAtual.posicaoNoPlano ||
                  usuarioAtual.posicaoPlano ||
                  0
              ) > 0
                ? `${Number(
                    usuarioAtual.posicaoNoPlano ||
                      usuarioAtual.posicaoPlano
                  )}º no ranking ${nomeMeuPlano}`
                : `Sem posição no ranking ${nomeMeuPlano}`}
            </MeuRankingPlano>
          </div>

          <MeuRankingIdentificacao>
            <BadgePlano
              $premium={planoUsuario === 'premium'}
            >
              {nomeMeuPlano}
            </BadgePlano>

            <MeuRankingBadge>
              {usuarioAtual.nomeUsuario
                ? `@${usuarioAtual.nomeUsuario}`
                : usuarioAtual.nome || 'Você'}
            </MeuRankingBadge>
          </MeuRankingIdentificacao>
        </MeuRankingTopo>

        <MeuRankingGrid>
          <MeuRankingMetrica>
            <span>Patrimônio</span>
            <strong>
              {formatarTS(usuarioAtual.patrimonio)}
            </strong>
          </MeuRankingMetrica>

          <MeuRankingMetrica>
            <span>Rentabilidade</span>

            <Variacao
              $positivo={
                Number(usuarioAtual.rentabilidade) >= 0
              }
            >
              {formatarPercentual(
                usuarioAtual.rentabilidade
              )}
            </Variacao>
          </MeuRankingMetrica>

          <MeuRankingMetrica>
            <span>Saldo disponível</span>
            <strong>
              {formatarTS(usuarioAtual.saldo)}
            </strong>
          </MeuRankingMetrica>

          <MeuRankingMetrica>
            <span>Valor das posições</span>
            <strong>
              {formatarTS(usuarioAtual.valorPosicoes)}
            </strong>
          </MeuRankingMetrica>
        </MeuRankingGrid>
      </MeuRanking>
    )}

    {abaPrivadosAtiva ? (
  <PrivadosSection>
    {rankingPrivadoSelecionado ? (
      <>
        <PrivadosHeader>
          <div>
            <PrivadosTitulo>
              {rankingPrivadoSelecionado.nome}
            </PrivadosTitulo>

            <PrivadosTexto>
              {rankingPrivadoSelecionado.descricao ||
                'Classificação privada da temporada atual.'}
            </PrivadosTexto>
          </div>

          <BotaoCriarPrivado
            type="button"
            onClick={voltarParaListaPrivados}
          >
            Voltar
          </BotaoCriarPrivado>
        </PrivadosHeader>

        {usuarioAtualPrivado && (
          <MeuRanking>
            <MeuRankingTopo>
              <div>
                <MeuRankingLabel>
                  Sua posição neste ranking
                </MeuRankingLabel>

                <MeuRankingPosicao>
                  {usuarioAtualPrivado.posicao}º lugar
                </MeuRankingPosicao>

                <MeuRankingPlano>
                  {totalUsuariosPrivado.toLocaleString('pt-BR')}{' '}
                  participante
                  {totalUsuariosPrivado === 1 ? '' : 's'}
                </MeuRankingPlano>
              </div>

              <MeuRankingBadge>
                {usuarioAtualPrivado.nomeUsuario
                  ? `@${usuarioAtualPrivado.nomeUsuario}`
                  : usuarioAtualPrivado.nome || 'Você'}
              </MeuRankingBadge>
            </MeuRankingTopo>

            <MeuRankingGrid>
              <MeuRankingMetrica>
                <span>Patrimônio</span>
                <strong>
                  {formatarTS(usuarioAtualPrivado.patrimonio)}
                </strong>
              </MeuRankingMetrica>

              <MeuRankingMetrica>
                <span>Rentabilidade</span>

                <Variacao
                  $positivo={
                    Number(usuarioAtualPrivado.rentabilidade) >= 0
                  }
                >
                  {formatarPercentual(usuarioAtualPrivado.rentabilidade)}
                </Variacao>
              </MeuRankingMetrica>

              <MeuRankingMetrica>
                <span>Saldo disponível</span>
                <strong>
                  {formatarTS(usuarioAtualPrivado.saldo)}
                </strong>
              </MeuRankingMetrica>

              <MeuRankingMetrica>
                <span>Valor das posições</span>
                <strong>
                  {formatarTS(usuarioAtualPrivado.valorPosicoes)}
                </strong>
              </MeuRankingMetrica>
            </MeuRankingGrid>
          </MeuRanking>
        )}
                {rankingPrivadoSelecionado?.isCriador && (
          <PainelMembros>
            <PainelMembrosTopo>
              <div>
                <PainelMembrosTitulo>
                  Participantes
                </PainelMembrosTitulo>

                <PainelMembrosTexto>
                  Adicione ou remova usuários Premium deste ranking privado.
                </PainelMembrosTexto>
              </div>

              <ContadorMembros>
                {membrosPrivados.length} membro
                {membrosPrivados.length === 1 ? '' : 's'}
              </ContadorMembros>
            </PainelMembrosTopo>

            <FormularioAdicionarMembro
              onSubmit={adicionarParticipantePrivado}
            >
              <CampoInput
                type="text"
                value={buscaNovoParticipante}
                placeholder="@usuario, nome ou e-mail"
                onChange={(e) => {
                  setBuscaNovoParticipante(e.target.value);
                  setErroMembrosPrivados('');
                  setSucessoMembrosPrivados('');
                }}
              />

              <BotaoSalvarModal
                type="submit"
                disabled={adicionandoParticipante}
              >
                {adicionandoParticipante
                  ? 'Adicionando...'
                  : 'Adicionar participante'}
              </BotaoSalvarModal>
            </FormularioAdicionarMembro>

            {erroMembrosPrivados && (
              <MensagemErro>
                {erroMembrosPrivados}
              </MensagemErro>
            )}

            {sucessoMembrosPrivados && (
              <MensagemSucesso>
                {sucessoMembrosPrivados}
              </MensagemSucesso>
            )}

            {carregandoMembrosPrivados ? (
              <CarregandoCard>
                Carregando participantes...
              </CarregandoCard>
            ) : membrosPrivados.length === 0 ? (
              <VazioCard>
                Nenhum participante encontrado.
              </VazioCard>
            ) : (
              <ListaMembros>
                {membrosPrivados.map((membro) => (
                  <MembroItem key={membro.usuarioId}>
                    <UsuarioCelula>
                      <AvatarPequeno>
                        {String(
                          membro.nomeUsuario ||
                            membro.nome ||
                            'U'
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarPequeno>

                      <UsuarioInfo>
                        <strong>
                          {membro.nomeUsuario
                            ? `@${membro.nomeUsuario}`
                            : membro.nome || 'Usuário'}
                        </strong>

                        <PlanoUsuarioLinha
                          $premium={membro.plano === 'premium'}
                        >
                          {membro.plano === 'premium'
                            ? 'Premium'
                            : 'Lite'}
                        </PlanoUsuarioLinha>

                        {membro.isCriador && (
                          <small>
                            Criador
                          </small>
                        )}

                        {!membro.isCriador && membro.status === 'pendente' && (
                          <small>
                            Pendente
                          </small>
                        )}
                      </UsuarioInfo>
                    </UsuarioCelula>

                    <MembroAcoes>
                      {membro.isCriador ? (
                        <RankingPrivadoStatus>
                          Criador
                        </RankingPrivadoStatus>
                      ) : (
                        <BotaoRemoverMembro
                          type="button"
                          disabled={
                            removendoParticipanteId ===
                            String(membro.usuarioId)
                          }
                          onClick={() =>
                            removerParticipantePrivado(membro.usuarioId)
                          }
                        >
                          {removendoParticipanteId ===
                          String(membro.usuarioId)
                            ? 'Removendo...'
                            : 'Remover'}
                        </BotaoRemoverMembro>
                      )}
                    </MembroAcoes>
                  </MembroItem>
                ))}
              </ListaMembros>
            )}
          </PainelMembros>
        )}
        {erroClassificacaoPrivada && (
          <MensagemErro>
            {erroClassificacaoPrivada}
          </MensagemErro>
        )}

        {carregandoClassificacaoPrivada ? (
          <CarregandoCard>
            Carregando classificação privada...
          </CarregandoCard>
        ) : classificacaoPrivada.length === 0 ? (
          <VazioCard>
            Nenhum participante aprovado neste ranking privado.
          </VazioCard>
        ) : (
          <>
            <DesktopOnly>
              <TabelaContainer>
                <Tabela>
                  <thead>
                    <tr>
                      <th>Posição</th>
                      <th>Usuário</th>
                      <th>Patrimônio</th>
                      <th>Rentabilidade</th>
                      <th>Saldo</th>
                      <th>Posições</th>
                      <th>Unidades</th>
                    </tr>
                  </thead>

                  <tbody>
                    {classificacaoPrivada.map((usuario) => {
                      const souEu =
                        String(usuario.usuarioId) ===
                        String(usuarioAtualPrivado?.usuarioId);

                      return (
                        <LinhaRanking
                          key={usuario.usuarioId}
                          $destaque={souEu}
                        >
                          <td>
                            <PosicaoCelula>
                              {usuario.posicao}º
                            </PosicaoCelula>
                          </td>

                          <td>
                            <UsuarioCelula>
                              <AvatarPequeno>
                                {String(
                                  usuario.nomeUsuario ||
                                    usuario.nome ||
                                    'U'
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </AvatarPequeno>

                              <UsuarioInfo>
                                <strong>
                                  {usuario.nomeUsuario
                                    ? `@${usuario.nomeUsuario}`
                                    : usuario.nome || 'Usuário'}
                                </strong>

                                <PlanoUsuarioLinha
                                  $premium={usuario.plano === 'premium'}
                                >
                                  {usuario.plano === 'premium'
                                    ? 'Premium'
                                    : 'Lite'}
                                </PlanoUsuarioLinha>

                                {souEu && (
                                  <small>
                                    Você
                                  </small>
                                )}
                              </UsuarioInfo>
                            </UsuarioCelula>
                          </td>

                          <td>
                            <ValorDestaque>
                              {formatarTS(usuario.patrimonio)}
                            </ValorDestaque>
                          </td>

                          <td>
                            <Variacao
                              $positivo={Number(usuario.rentabilidade) >= 0}
                            >
                              {formatarPercentual(usuario.rentabilidade)}
                            </Variacao>
                          </td>

                          <td>
                            {formatarTS(usuario.saldo)}
                          </td>

                          <td>
                            {usuario.quantidadePosicoes}
                          </td>

                          <td>
                            {Number(
                              usuario.quantidadeUnidades || 0
                            ).toLocaleString('pt-BR', {
                              maximumFractionDigits: 4,
                            })}
                          </td>
                        </LinhaRanking>
                      );
                    })}
                  </tbody>
                </Tabela>
              </TabelaContainer>
            </DesktopOnly>

            <MobileOnly>
              <ListaMobile>
                {classificacaoPrivada.map((usuario) => {
                  const souEu =
                    String(usuario.usuarioId) ===
                    String(usuarioAtualPrivado?.usuarioId);

                  return (
                    <CardMobile
                      key={usuario.usuarioId}
                      $destaque={souEu}
                    >
                      <CardMobileTopo>
                        <PosicaoMobile>
                          {usuario.posicao}º
                        </PosicaoMobile>

                        <UsuarioMobile>
                          <AvatarPequeno>
                            {String(
                              usuario.nomeUsuario ||
                                usuario.nome ||
                                'U'
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarPequeno>

                          <div>
                            <strong>
                              {usuario.nomeUsuario
                                ? `@${usuario.nomeUsuario}`
                                : usuario.nome || 'Usuário'}
                            </strong>

                            <PlanoUsuarioLinha
                              $premium={usuario.plano === 'premium'}
                            >
                              {usuario.plano === 'premium'
                                ? 'Premium'
                                : 'Lite'}
                            </PlanoUsuarioLinha>

                            {souEu && (
                              <small>
                                Você
                              </small>
                            )}
                          </div>
                        </UsuarioMobile>
                      </CardMobileTopo>

                      <PatrimonioMobile>
                        <span>Patrimônio</span>

                        <strong>
                          {formatarTS(usuario.patrimonio)}
                        </strong>
                      </PatrimonioMobile>

                      <MetricasMobile>
                        <MetricaMobile>
                          <span>Rentabilidade</span>

                          <Variacao
                            $positivo={Number(usuario.rentabilidade) >= 0}
                          >
                            {formatarPercentual(usuario.rentabilidade)}
                          </Variacao>
                        </MetricaMobile>

                        <MetricaMobile>
                          <span>Saldo</span>

                          <strong>
                            {formatarTS(usuario.saldo)}
                          </strong>
                        </MetricaMobile>

                        <MetricaMobile>
                          <span>Posições</span>

                          <strong>
                            {usuario.quantidadePosicoes}
                          </strong>
                        </MetricaMobile>

                        <MetricaMobile>
                          <span>Unidades</span>

                          <strong>
                            {Number(
                              usuario.quantidadeUnidades || 0
                            ).toLocaleString('pt-BR', {
                              maximumFractionDigits: 4,
                            })}
                          </strong>
                        </MetricaMobile>
                      </MetricasMobile>
                    </CardMobile>
                  );
                })}
              </ListaMobile>
            </MobileOnly>

            <Paginacao>
              <BotaoPagina
                type="button"
                disabled={paginaPrivada <= 1}
                onClick={() => mudarPaginaPrivada(paginaPrivada - 1)}
              >
                Anterior
              </BotaoPagina>

              <InformacaoPagina>
                Página {paginaPrivada} de {totalPaginasPrivada}
              </InformacaoPagina>

              <BotaoPagina
                type="button"
                disabled={paginaPrivada >= totalPaginasPrivada}
                onClick={() => mudarPaginaPrivada(paginaPrivada + 1)}
              >
                Próxima
              </BotaoPagina>
            </Paginacao>
          </>
        )}
      </>
    ) : (
      <>
        {erroPrivados && (
          <MensagemErro>
            {erroPrivados}
          </MensagemErro>
        )}

        {carregandoPrivados ? (
          <CarregandoCard>
            Carregando rankings privados...
          </CarregandoCard>
        ) : (
          <>
            <PrivadosHeader>
              <div>
                <PrivadosTitulo>
                  Seus rankings privados
                </PrivadosTitulo>

                <PrivadosTexto>
                  Crie competições fechadas com outros usuários Premium usando
                  a mesma carteira e a mesma rentabilidade da temporada.
                </PrivadosTexto>
              </div>

              <BotaoCriarPrivado
                type="button"
                onClick={() => {
                  setErroCriarPrivado('');
                  setModalCriarPrivadoAberto(true);
                }}
              >
                Criar ranking privado
              </BotaoCriarPrivado>
            </PrivadosHeader>

            {rankingsPrivados.criados.length === 0 &&
            rankingsPrivados.participando.length === 0 ? (
              <VazioCard>
                Você ainda não possui rankings privados.
              </VazioCard>
            ) : (
              <PrivadosGrid>
                {rankingsPrivados.criados.length > 0 && (
                  <PrivadosGrupo>
                    <PrivadosGrupoTitulo>
                      Criados por você
                    </PrivadosGrupoTitulo>

                    <PrivadosLista>
                      {rankingsPrivados.criados.map((rankingPrivado) => (
                        <RankingPrivadoCard key={rankingPrivado._id}>
                          <RankingPrivadoTopo>
                            <div>
                              <RankingPrivadoNome>
                                {rankingPrivado.nome}
                              </RankingPrivadoNome>

                              <RankingPrivadoDescricao>
                                {rankingPrivado.descricao ||
                                  'Ranking privado sem descrição.'}
                              </RankingPrivadoDescricao>
                            </div>

                            <RankingPrivadoStatus>
                              Criador
                            </RankingPrivadoStatus>
                          </RankingPrivadoTopo>

                          <RankingPrivadoMeta>
                            <span>Participantes</span>

                            <strong>
                              {Number(rankingPrivado.totalParticipantes || 0)}/
                              {Number(rankingPrivado.maxParticipantes || 0)}
                            </strong>
                          </RankingPrivadoMeta>

                          <RankingPrivadoMeta>
                            <span>Código de convite</span>

                            <CodigoConvite>
                              {rankingPrivado.codigoConvite}
                            </CodigoConvite>
                          </RankingPrivadoMeta>

                          <RankingPrivadoAcoes>
                            <BotaoSecundario
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(
                                  rankingPrivado.codigoConvite
                                );
                              }}
                            >
                              Copiar código
                            </BotaoSecundario>

                            <BotaoSecundario
                              type="button"
                              onClick={() => {
                                carregarClassificacaoPrivada(
                                  rankingPrivado._id || rankingPrivado.id
                                );
                              }}
                            >
                              Ver ranking
                            </BotaoSecundario>
                          </RankingPrivadoAcoes>
                        </RankingPrivadoCard>
                      ))}
                    </PrivadosLista>
                  </PrivadosGrupo>
                )}

                {rankingsPrivados.participando.length > 0 && (
                  <PrivadosGrupo>
                    <PrivadosGrupoTitulo>
                      Participando
                    </PrivadosGrupoTitulo>

                    <PrivadosLista>
                      {rankingsPrivados.participando.map((rankingPrivado) => (
                        <RankingPrivadoCard key={rankingPrivado._id}>
                          <RankingPrivadoTopo>
                            <div>
                              <RankingPrivadoNome>
                                {rankingPrivado.nome}
                              </RankingPrivadoNome>

                              <RankingPrivadoDescricao>
                                {rankingPrivado.descricao ||
                                  'Ranking privado sem descrição.'}
                              </RankingPrivadoDescricao>
                            </div>

                            <RankingPrivadoStatus>
                              {rankingPrivado?.membro?.status === 'pendente'
                                ? 'Pendente'
                                : 'Participante'}
                            </RankingPrivadoStatus>
                          </RankingPrivadoTopo>

                          <RankingPrivadoMeta>
                            <span>Participantes</span>

                            <strong>
                              {Number(rankingPrivado.totalParticipantes || 0)}/
                              {Number(rankingPrivado.maxParticipantes || 0)}
                            </strong>
                          </RankingPrivadoMeta>

                          <RankingPrivadoMeta>
                            <span>Código de convite</span>

                            <CodigoConvite>
                              {rankingPrivado.codigoConvite}
                            </CodigoConvite>
                          </RankingPrivadoMeta>

                          <RankingPrivadoAcoes>
                            <BotaoSecundario
                              type="button"
                              onClick={() => {
                                carregarClassificacaoPrivada(
                                  rankingPrivado._id || rankingPrivado.id
                                );
                              }}
                            >
                              Ver ranking
                            </BotaoSecundario>
                          </RankingPrivadoAcoes>
                        </RankingPrivadoCard>
                      ))}
                    </PrivadosLista>
                  </PrivadosGrupo>
                )}
              </PrivadosGrid>
            )}
          </>
        )}
      </>
    )}
  </PrivadosSection>
) : (
  <>
    {erro && (
      <MensagemErro>
        {erro}
      </MensagemErro>
    )}

    {carregando ? (
      <CarregandoCard>
        Carregando ranking...
      </CarregandoCard>
    ) : (
      <>
        {ranking.length === 0 ? (
  <VazioCard>
    Nenhum usuário disponível no{' '}
    {tituloCategoria.toLowerCase()}.
  </VazioCard>
) : (
  <>
    <TabelaLigaContainer>
      <TabelaLiga>
        <thead>
          <tr>
            <th>Pos.</th>
            <th>Usuário</th>
            <th>Valorização histórica</th>
            <th className="patrimonio">
              Patrimônio
            </th>
          </tr>
        </thead>

        <tbody>
          {ranking.map((usuario) => {
            const souEu =
              String(usuario.usuarioId) ===
              String(usuarioAtual?.usuarioId);

            return (
              <LinhaLiga
                key={usuario.usuarioId}
                $destaque={souEu}
              >
                <td>
                  <PosicaoLiga
                    $posicao={usuario.posicao}
                  >
                    {usuario.posicao}º
                  </PosicaoLiga>
                </td>

                <td>
                  <UsuarioCelula>
                    <AvatarPequeno>
                      {String(
                        usuario.nomeUsuario ||
                          usuario.nome ||
                          'U'
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarPequeno>

                    <UsuarioLiga>
                      <strong>
                        {usuario.nomeUsuario
                          ? `@${usuario.nomeUsuario}`
                          : usuario.nome || 'Usuário'}
                      </strong>

                      {souEu && <small>Você</small>}
                    </UsuarioLiga>
                  </UsuarioCelula>
                </td>

                <td>
                  <Variacao
                    $positivo={
                      Number(usuario.rentabilidade) >= 0
                    }
                  >
                    {formatarPercentual(
                      usuario.rentabilidade
                    )}
                  </Variacao>
                </td>

                <td className="patrimonio">
                  <ValorDestaque>
                    {formatarTS(usuario.patrimonio)}
                  </ValorDestaque>
                </td>
              </LinhaLiga>
            );
          })}
        </tbody>
      </TabelaLiga>
    </TabelaLigaContainer>

            <Paginacao>
              <BotaoPagina
                type="button"
                disabled={pagina <= 1}
                onClick={() => mudarPagina(pagina - 1)}
              >
                Anterior
              </BotaoPagina>

              <InformacaoPagina>
                Página {pagina} de {totalPaginas}
              </InformacaoPagina>

              <BotaoPagina
                type="button"
                disabled={pagina >= totalPaginas}
                onClick={() => mudarPagina(pagina + 1)}
              >
                Próxima
              </BotaoPagina>
            </Paginacao>
          </>
        )}
      </>
    )}
  </>
)}

{modalCriarPrivadoAberto && (
  <ModalOverlay
    onClick={() => {
      if (!criandoPrivado) {
        setModalCriarPrivadoAberto(false);
      }
    }}
  >
    <ModalCard
      onClick={(e) => e.stopPropagation()}
    >
      <ModalTopo>
        <div>
          <ModalTitulo>
            Criar ranking privado
          </ModalTitulo>

          <ModalTexto>
            Crie uma competição fechada para usuários Premium.
            A classificação usará a mesma carteira, patrimônio e
            rentabilidade da temporada atual.
          </ModalTexto>
        </div>

        <BotaoFecharModal
          type="button"
          disabled={criandoPrivado}
          onClick={() => {
            setModalCriarPrivadoAberto(false);
          }}
        >
          ×
        </BotaoFecharModal>
      </ModalTopo>

      <FormularioPrivado onSubmit={criarRankingPrivado}>
        <CampoGrupo>
          <CampoLabel>
            Nome do ranking
          </CampoLabel>

          <CampoInput
            type="text"
            value={formPrivado.nome}
            maxLength={80}
            placeholder="Ex: Liga dos Amigos"
            onChange={(e) =>
              setFormPrivado((atual) => ({
                ...atual,
                nome: e.target.value,
              }))
            }
          />
        </CampoGrupo>

        <CampoGrupo>
          <CampoLabel>
            Descrição
          </CampoLabel>

          <CampoTextarea
            value={formPrivado.descricao}
            maxLength={500}
            placeholder="Ex: Ranking privado entre amigos para a temporada atual."
            onChange={(e) =>
              setFormPrivado((atual) => ({
                ...atual,
                descricao: e.target.value,
              }))
            }
          />
        </CampoGrupo>

        <CampoGrupo>
          <CampoLabel>
            Limite de participantes
          </CampoLabel>

          <CampoInput
            type="number"
            min="2"
            max="500"
            value={formPrivado.maxParticipantes}
            onChange={(e) =>
              setFormPrivado((atual) => ({
                ...atual,
                maxParticipantes: e.target.value,
              }))
            }
          />
        </CampoGrupo>

        <CheckboxLinha>
          <input
            type="checkbox"
            checked={formPrivado.aprovacaoManual}
            onChange={(e) =>
              setFormPrivado((atual) => ({
                ...atual,
                aprovacaoManual: e.target.checked,
              }))
            }
          />

          <span>
            Exigir aprovação manual para novos participantes
          </span>
        </CheckboxLinha>

        {erroCriarPrivado && (
          <MensagemErro>
            {erroCriarPrivado}
          </MensagemErro>
        )}

        <ModalAcoes>
          <BotaoCancelarModal
            type="button"
            disabled={criandoPrivado}
            onClick={() => {
              setModalCriarPrivadoAberto(false);
            }}
          >
            Cancelar
          </BotaoCancelarModal>

          <BotaoSalvarModal
            type="submit"
            disabled={criandoPrivado}
          >
            {criandoPrivado
              ? 'Criando...'
              : 'Criar ranking'}
          </BotaoSalvarModal>
        </ModalAcoes>
      </FormularioPrivado>
    </ModalCard>
  </ModalOverlay>
)}
</Container>
);
}

export default withAuth(RankingPage);

const Container = styled.div`
  width: 100%;
  padding: 0.2rem 0 2rem;
  color: #f8fafc;
`;

const Cabecalho = styled.div`
  margin-bottom: 20px;
  padding: 8px 2px 20px;
  border-bottom: 1px solid
    rgba(148, 163, 184, 0.12);

  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;

  @media (max-width: 700px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const CabecalhoTexto = styled.div`
  max-width: 720px;
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
  font-size: 1.75rem;
  color: #f8fafc;

  @media (max-width: 640px) {
    font-size: 1.38rem;
  }
`;

const Subtitulo = styled.p`
  margin: 8px 0 0;
  color: #94a3b8;
  font-size: 0.92rem;
  line-height: 1.55;
`;

const ResumoGeral = styled.div`
  min-width: 150px;
  padding: 14px 18px;
  border: 1px solid
    rgba(148, 163, 184, 0.14);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
`;

const ResumoLabel = styled.div`
  color: #94a3b8;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const ResumoValor = styled.strong`
  display: block;
  margin-top: 5px;
  color: #f8fafc;
  font-size: 1.45rem;
`;

const AbasRanking = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 5px;
  width: fit-content;
  max-width: 100%;
  border: 1px solid
    rgba(148, 163, 184, 0.13);
  border-radius: 14px;
  background: rgba(
    15,
    23,
    42,
    0.58
  );

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const AbaRanking = styled.button`
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
    $ativa
      ? '#eff6ff'
      : '#94a3b8'};

  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    color: #f8fafc;
    background: rgba(
      59,
      130,
      246,
      0.12
    );
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

  background: rgba(
    148,
    163,
    184,
    0.13
  );

  color: #cbd5e1;
  font-size: 0.68rem;
  font-weight: 900;
`;

const MeuRanking = styled.section`
  margin-bottom: 22px;
  padding: 18px;
  border: 1px solid
    rgba(59, 130, 246, 0.26);
  border-radius: 18px;

  background:
    radial-gradient(
      circle at top right,
      rgba(59, 130, 246, 0.18),
      transparent 35%
    ),
    rgba(15, 23, 42, 0.72);
`;

const MeuRankingTopo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 18px;
`;

const MeuRankingLabel = styled.div`
  color: #93c5fd;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const MeuRankingPosicao = styled.strong`
  display: block;
  margin-top: 4px;
  color: #f8fafc;
  font-size: 1.55rem;
`;

const MeuRankingPlano = styled.div`
  margin-top: 4px;
  color: #93c5fd;
  font-size: 0.82rem;
  font-weight: 700;
`;

const MeuRankingIdentificacao = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 7px;
`;

const BadgePlano = styled.span`
  padding: 7px 10px;
  border-radius: 999px;

  background: ${({ $premium }) =>
    $premium
      ? 'rgba(250, 204, 21, 0.13)'
      : 'rgba(34, 197, 94, 0.12)'};

  color: ${({ $premium }) =>
    $premium
      ? '#fde68a'
      : '#86efac'};

  border: 1px solid
    ${({ $premium }) =>
      $premium
        ? 'rgba(250, 204, 21, 0.22)'
        : 'rgba(34, 197, 94, 0.2)'};

  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const MeuRankingBadge = styled.span`
  padding: 7px 11px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.15);
  color: #bfdbfe;
  font-size: 0.8rem;
  font-weight: 700;
`;

const MeuRankingGrid = styled.div`
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 800px) {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
`;

const MeuRankingMetrica = styled.div`
  padding: 12px;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.04);

  span {
    display: block;
    margin-bottom: 5px;
    color: #94a3b8;
    font-size: 0.74rem;
  }

  strong {
    color: #f8fafc;
    font-size: 0.95rem;
  }
`;

const TabelaLigaContainer = styled.div`
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.62);

  @media (max-width: 560px) {
    border-radius: 13px;
  }
`;

const TabelaLiga = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  th,
  td {
    padding: 14px 16px;
    text-align: left;
    vertical-align: middle;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  }

  th {
    background: rgba(255, 255, 255, 0.035);
    color: #94a3b8;
    font-size: 0.68rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  th:first-child,
  td:first-child {
    width: 82px;
    text-align: center;
  }

  th:nth-child(3),
  td:nth-child(3) {
    width: 190px;
    text-align: right;
  }

  th:nth-child(4),
  td:nth-child(4) {
    width: 180px;
    text-align: right;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  @media (max-width: 700px) {
    th,
    td {
      padding: 12px 10px;
    }

    th:first-child,
    td:first-child {
      width: 54px;
    }

    th:nth-child(3),
    td:nth-child(3) {
      width: 112px;
    }

    .patrimonio {
      display: none;
    }
  }
`;

const LinhaLiga = styled.tr`
  background: ${({ $destaque }) =>
    $destaque
      ? 'rgba(59, 130, 246, 0.11)'
      : 'transparent'};

  transition: background 0.18s ease;

  &:hover {
    background: ${({ $destaque }) =>
      $destaque
        ? 'rgba(59, 130, 246, 0.15)'
        : 'rgba(255, 255, 255, 0.035)'};
  }
`;

const PosicaoLiga = styled.strong`
  display: inline-grid;
  min-width: 36px;
  height: 30px;
  padding: 0 7px;
  place-items: center;
  border-radius: 8px;

  background: ${({ $posicao }) => {
    if (Number($posicao) === 1) {
      return 'rgba(250, 204, 21, 0.16)';
    }

    if (Number($posicao) === 2) {
      return 'rgba(203, 213, 225, 0.13)';
    }

    if (Number($posicao) === 3) {
      return 'rgba(251, 146, 60, 0.14)';
    }

    return 'rgba(255, 255, 255, 0.04)';
  }};

  color: ${({ $posicao }) => {
    if (Number($posicao) === 1) return '#fde047';
    if (Number($posicao) === 2) return '#cbd5e1';
    if (Number($posicao) === 3) return '#fdba74';

    return '#e2e8f0';
  }};

  font-size: 0.84rem;
`;

const UsuarioLiga = styled.div`
  min-width: 0;

  strong {
    display: block;
    overflow: hidden;
    color: #f8fafc;
    font-size: 0.88rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    display: block;
    margin-top: 3px;
    color: #60a5fa;
    font-size: 0.68rem;
    font-weight: 700;
  }
`;

const TabelaContainer = styled.div`
  overflow-x: auto;
`;

const Tabela = styled.table`
  width: 100%;
  min-width: 880px;
  border-collapse: collapse;

  th,
  td {
    padding: 14px 12px;
    text-align: left;
    border-bottom: 1px solid
      rgba(148, 163, 184, 0.1);
  }

  th {
    color: #94a3b8;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  td {
    color: #cbd5e1;
    font-size: 0.86rem;
  }
`;

const LinhaRanking = styled.tr`
  background: ${({ $destaque }) =>
    $destaque
      ? 'rgba(59, 130, 246, 0.10)'
      : 'transparent'};

  &:hover {
    background: rgba(255, 255, 255, 0.035);
  }
`;

const PosicaoCelula = styled.strong`
  color: #f8fafc;
  font-size: 0.95rem;
`;

const UsuarioCelula = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AvatarPequeno = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 999px;

  display: grid;
  place-items: center;

  background: rgba(59, 130, 246, 0.17);
  color: #93c5fd;
  font-size: 0.8rem;
  font-weight: 900;
`;

const UsuarioInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    color: #f8fafc;
  }

  small {
    color: #60a5fa;
  }
`;

const PlanoUsuarioLinha = styled.span`
  width: fit-content;
  padding: 2px 6px;
  border-radius: 999px;

  background: ${({ $premium }) =>
    $premium
      ? 'rgba(250, 204, 21, 0.11)'
      : 'rgba(34, 197, 94, 0.09)'};

  color: ${({ $premium }) =>
    $premium
      ? '#fde68a'
      : '#86efac'};

  font-size: 0.61rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const ValorDestaque = styled.strong`
  color: #f8fafc;
`;

const Variacao = styled.strong`
  color: ${({ $positivo }) =>
    $positivo ? '#22c55e' : '#ef4444'};
`;

const DesktopOnly = styled.div`
  display: block;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileOnly = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const ListaMobile = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardMobile = styled.div`
  padding: 15px;
  border: 1px solid
    ${({ $destaque }) =>
      $destaque
        ? 'rgba(59, 130, 246, 0.32)'
        : 'rgba(148, 163, 184, 0.13)'};

  border-radius: 16px;

  background: ${({ $destaque }) =>
    $destaque
      ? 'rgba(59, 130, 246, 0.09)'
      : 'rgba(255, 255, 255, 0.025)'};
`;

const CardMobileTopo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const PosicaoMobile = styled.strong`
  color: #f8fafc;
  font-size: 1.05rem;
`;

const UsuarioMobile = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;

  strong,
  small {
    display: block;
  }

  strong {
    color: #f8fafc;
    font-size: 0.87rem;
  }

  small {
    margin-top: 2px;
    color: #60a5fa;
    font-size: 0.72rem;
  }
`;

const PatrimonioMobile = styled.div`
  margin: 15px 0 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);

  span {
    display: block;
    margin-bottom: 4px;
    color: #94a3b8;
    font-size: 0.72rem;
  }

  strong {
    color: #f8fafc;
    font-size: 1.1rem;
  }
`;

const MetricasMobile = styled.div`
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 9px;
`;

const MetricaMobile = styled.div`
  span {
    display: block;
    margin-bottom: 3px;
    color: #64748b;
    font-size: 0.69rem;
  }

  strong {
    color: #cbd5e1;
    font-size: 0.82rem;
  }
`;

const PrivadosSection = styled.section`
  margin-top: 4px;
`;

const PrivadosHeader = styled.div`
  margin-bottom: 18px;
  padding: 18px;
  border: 1px solid
    rgba(148, 163, 184, 0.13);
  border-radius: 18px;

  background:
    radial-gradient(
      circle at top right,
      rgba(250, 204, 21, 0.12),
      transparent 38%
    ),
    rgba(15, 23, 42, 0.7);

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 700px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PrivadosTitulo = styled.h2`
  margin: 0;
  color: #f8fafc;
  font-size: 1.15rem;
`;

const PrivadosTexto = styled.p`
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 0.86rem;
  line-height: 1.5;
`;

const BotaoCriarPrivado = styled.button`
  border: 1px solid
    rgba(250, 204, 21, 0.28);
  border-radius: 12px;
  padding: 10px 14px;

  background: rgba(
    250,
    204,
    21,
    0.12
  );

  color: #fde68a;
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: rgba(
      250,
      204,
      21,
      0.18
    );
  }
`;

const PrivadosGrid = styled.div`
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const PrivadosGrupo = styled.section``;

const PrivadosGrupoTitulo = styled.h3`
  margin: 0 0 10px;
  color: #e2e8f0;
  font-size: 0.95rem;
`;

const PrivadosLista = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RankingPrivadoCard = styled.article`
  padding: 15px;
  border: 1px solid
    rgba(148, 163, 184, 0.13);
  border-radius: 16px;

  background: rgba(
    255,
    255,
    255,
    0.025
  );
`;

const RankingPrivadoTopo = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const RankingPrivadoNome = styled.strong`
  display: block;
  color: #f8fafc;
  font-size: 0.96rem;
`;

const RankingPrivadoDescricao = styled.p`
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 0.78rem;
  line-height: 1.45;
`;

const RankingPrivadoStatus = styled.span`
  padding: 5px 8px;
  border-radius: 999px;

  background: rgba(
    59,
    130,
    246,
    0.13
  );

  color: #bfdbfe;
  font-size: 0.68rem;
  font-weight: 900;
  white-space: nowrap;
`;

const RankingPrivadoMeta = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  span {
    color: #64748b;
    font-size: 0.74rem;
  }

  strong {
    color: #cbd5e1;
    font-size: 0.82rem;
  }
`;

const CodigoConvite = styled.code`
  padding: 4px 7px;
  border-radius: 8px;

  background: rgba(
    15,
    23,
    42,
    0.9
  );

  color: #fde68a;
  font-size: 0.78rem;
  font-weight: 900;
`;

const RankingPrivadoAcoes = styled.div`
  margin-top: 14px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const BotaoSecundario = styled.button`
  border: 1px solid
    rgba(148, 163, 184, 0.18);
  border-radius: 10px;
  padding: 8px 11px;

  background: rgba(
    255,
    255,
    255,
    0.04
  );

  color: #e2e8f0;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;

  &:hover {
    background: rgba(
      59,
      130,
      246,
      0.12
    );
  }
`;

const PainelMembros = styled.section`
  margin-bottom: 20px;
  padding: 18px;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 18px;

  background:
    radial-gradient(
      circle at top right,
      rgba(59, 130, 246, 0.1),
      transparent 38%
    ),
    rgba(15, 23, 42, 0.68);
`;

const PainelMembrosTopo = styled.div`
  margin-bottom: 14px;

  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;

  @media (max-width: 700px) {
    flex-direction: column;
  }
`;

const PainelMembrosTitulo = styled.h3`
  margin: 0;
  color: #f8fafc;
  font-size: 1rem;
`;

const PainelMembrosTexto = styled.p`
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 0.82rem;
  line-height: 1.45;
`;

const ContadorMembros = styled.span`
  padding: 6px 9px;
  border-radius: 999px;

  background: rgba(59, 130, 246, 0.13);
  color: #bfdbfe;

  border: 1px solid rgba(59, 130, 246, 0.18);

  font-size: 0.72rem;
  font-weight: 900;
  white-space: nowrap;
`;

const FormularioAdicionarMembro = styled.form`
  margin-bottom: 14px;

  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const ListaMembros = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MembroItem = styled.div`
  padding: 12px;
  border: 1px solid rgba(148, 163, 184, 0.11);
  border-radius: 14px;

  background: rgba(255, 255, 255, 0.035);

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const MembroAcoes = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BotaoRemoverMembro = styled.button`
  border: 1px solid rgba(239, 68, 68, 0.28);
  border-radius: 10px;
  padding: 8px 11px;

  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;

  font-size: 0.78rem;
  font-weight: 900;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background: rgba(239, 68, 68, 0.16);
  }
`;

const MensagemSucesso = styled.div`
  margin-bottom: 18px;
  padding: 13px 15px;
  border: 1px solid rgba(34, 197, 94, 0.22);
  border-radius: 13px;

  background: rgba(34, 197, 94, 0.08);
  color: #86efac;
`;

const Paginacao = styled.div`
  margin-top: 22px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
`;

const BotaoPagina = styled.button`
  border: 1px solid
    rgba(148, 163, 184, 0.16);
  border-radius: 11px;
  padding: 9px 14px;

  background: rgba(255, 255, 255, 0.04);
  color: #f8fafc;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background: rgba(59, 130, 246, 0.15);
  }
`;

const InformacaoPagina = styled.span`
  color: #94a3b8;
  font-size: 0.82rem;
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
`;

const ModalCard = styled.div`
  width: 100%;
  max-width: 560px;
  max-height: 92vh;
  overflow-y: auto;

  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 20px;

  background:
    radial-gradient(
      circle at top right,
      rgba(250, 204, 21, 0.11),
      transparent 36%
    ),
    #0f172a;

  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
`;

const ModalTopo = styled.div`
  padding: 20px 20px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);

  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

const ModalTitulo = styled.h2`
  margin: 0;
  color: #f8fafc;
  font-size: 1.18rem;
`;

const ModalTexto = styled.p`
  margin: 7px 0 0;
  color: #94a3b8;
  font-size: 0.84rem;
  line-height: 1.5;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background: rgba(239, 68, 68, 0.12);
    color: #fecaca;
  }
`;

const FormularioPrivado = styled.form`
  padding: 18px 20px 20px;
`;

const CampoGrupo = styled.label`
  display: block;
  margin-bottom: 14px;
`;

const CampoLabel = styled.span`
  display: block;
  margin-bottom: 6px;
  color: #cbd5e1;
  font-size: 0.78rem;
  font-weight: 800;
`;

const CampoInput = styled.input`
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  padding: 11px 12px;

  background: rgba(15, 23, 42, 0.75);
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

const CampoTextarea = styled.textarea`
  width: 100%;
  min-height: 96px;
  resize: vertical;

  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  padding: 11px 12px;

  background: rgba(15, 23, 42, 0.75);
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

const CheckboxLinha = styled.label`
  margin: 6px 0 16px;

  display: flex;
  align-items: center;
  gap: 9px;

  color: #cbd5e1;
  font-size: 0.82rem;
  cursor: pointer;

  input {
    width: 16px;
    height: 16px;
    accent-color: #2563eb;
  }
`;

const ModalAcoes = styled.div`
  margin-top: 18px;

  display: flex;
  justify-content: flex-end;
  gap: 10px;

  @media (max-width: 520px) {
    flex-direction: column-reverse;
  }
`;

const BotaoCancelarModal = styled.button`
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  padding: 10px 14px;

  background: rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BotaoSalvarModal = styled.button`
  border: 1px solid rgba(250, 204, 21, 0.32);
  border-radius: 12px;
  padding: 10px 15px;

  background: rgba(250, 204, 21, 0.15);
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
  margin-bottom: 18px;
  padding: 13px 15px;
  border: 1px solid
    rgba(239, 68, 68, 0.24);
  border-radius: 13px;

  background: rgba(239, 68, 68, 0.08);
  color: #fca5a5;
`;

const CarregandoCard = styled.div`
  padding: 30px;
  border: 1px solid
    rgba(148, 163, 184, 0.12);
  border-radius: 15px;

  color: #94a3b8;
  text-align: center;
`;

const VazioCard = styled(CarregandoCard)``;

