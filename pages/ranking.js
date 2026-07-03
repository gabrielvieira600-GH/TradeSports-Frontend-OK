import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import api from '../lib/api';
import withAuth from '../components/withAuth';

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
  carregarRanking(
    pagina,
    categoria
  );
}, [pagina, categoria]);

  const topTres = useMemo(() => {
    if (pagina !== 1) return [];

    return ranking
      .filter((usuario) =>
        [1, 2, 3].includes(
          Number(usuario.posicao)
        )
      )
      .sort(
        (a, b) =>
          Number(a.posicao) -
          Number(b.posicao)
      );
  }, [ranking, pagina]);
  
  const categoriaMeuPlano =
  planoUsuario === 'premium'
    ? 'premium'
    : 'lite';

const nomeMeuPlano =
  planoUsuario === 'premium'
    ? 'Premium'
    : 'Lite';

const tituloCategoria =
  categoria === 'geral'
    ? 'Ranking geral'
    : categoria === 'premium'
    ? 'Ranking Premium'
    : 'Ranking Lite';

const totalCategoriaAtual =
  categoria === 'geral'
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

  return (
    <Container>
      <Cabecalho>
        <CabecalhoTexto>
          <Eyebrow>Mercado simulado</Eyebrow>

          <Titulo>
            Ranking TradeSports
          </Titulo>

          <Subtitulo>
            Todos começam com T$ 1.000,00.
            Analise os clubes, negocie suas
            unidades e aumente seu patrimônio
            para subir no ranking.
          </Subtitulo>
        </CabecalhoTexto>

        <ResumoGeral>
          <ResumoLabel>
          {tituloCategoria}
          </ResumoLabel>

          <ResumoValor>
          {totalCategoriaAtual.toLocaleString(
          'pt-BR'
           )}
          </ResumoValor>
        </ResumoGeral>
      </Cabecalho>
       <AbasRanking>
  <AbaRanking
    type="button"
    $ativa={
      categoria === 'geral'
    }
    onClick={() =>
      mudarCategoria('geral')
    }
  >
    Geral

    <ContadorAba>
      {totaisPorCategoria.geral}
    </ContadorAba>
  </AbaRanking>

  <AbaRanking
    type="button"
    $ativa={
      categoria ===
      categoriaMeuPlano
    }
    onClick={() =>
      mudarCategoria(
        categoriaMeuPlano
      )
    }
  >
    Ranking {nomeMeuPlano}

    <ContadorAba>
      {
        totaisPorCategoria[
          categoriaMeuPlano
        ]
      }
    </ContadorAba>
  </AbaRanking>
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
    $premium={
      planoUsuario === 'premium'
    }
  >
    {nomeMeuPlano}
  </BadgePlano>

  <MeuRankingBadge>
    {usuarioAtual.nomeUsuario
      ? `@${usuarioAtual.nomeUsuario}`
      : usuarioAtual.nome ||
        'Você'}
  </MeuRankingBadge>
</MeuRankingIdentificacao>
          </MeuRankingTopo>

          <MeuRankingGrid>
            <MeuRankingMetrica>
              <span>Patrimônio</span>
              <strong>
                {formatarTS(
                  usuarioAtual.patrimonio
                )}
              </strong>
            </MeuRankingMetrica>

            <MeuRankingMetrica>
              <span>Rentabilidade</span>

              <Variacao
                $positivo={
                  Number(
                    usuarioAtual.rentabilidade
                  ) >= 0
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
                {formatarTS(
                  usuarioAtual.saldo
                )}
              </strong>
            </MeuRankingMetrica>

            <MeuRankingMetrica>
              <span>Valor das posições</span>
              <strong>
                {formatarTS(
                  usuarioAtual.valorPosicoes
                )}
              </strong>
            </MeuRankingMetrica>
          </MeuRankingGrid>
        </MeuRanking>
      )}

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
          {topTres.length > 0 && (
            <Podio>
              {topTres.map((usuario) => (
                <PodioCard
                  key={usuario.usuarioId}
                  $posicao={usuario.posicao}
                >
                  <PodioPosicao
                    $posicao={usuario.posicao}
                  >
                    {usuario.posicao}º
                  </PodioPosicao>

                  <Avatar>
                    {String(
                      usuario.nomeUsuario ||
                        usuario.nome ||
                        'U'
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </Avatar>

                  <PodioUsuario>
                    {usuario.nomeUsuario
                      ? `@${usuario.nomeUsuario}`
                      : usuario.nome ||
                        'Usuário'}
                  </PodioUsuario>

                  <PodioPatrimonio>
                    {formatarTS(
                      usuario.patrimonio
                    )}
                  </PodioPatrimonio>

                  <Variacao
                    $positivo={
                      Number(
                        usuario.rentabilidade
                      ) >= 0
                    }
                  >
                    {formatarPercentual(
                      usuario.rentabilidade
                    )}
                  </Variacao>
                </PodioCard>
              ))}
            </Podio>
          )}

          {ranking.length === 0 ? (
            <VazioCard>
  Nenhum usuário disponível no{' '}
  {tituloCategoria.toLowerCase()}.
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
                      {ranking.map((usuario) => {
                        const souEu =
                          String(
                            usuario.usuarioId
                          ) ===
                          String(
                            usuarioAtual?.usuarioId
                          );

                        return (
                          <LinhaRanking
                            key={
                              usuario.usuarioId
                            }
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
                                    <PlanoUsuarioLinha
  $premium={
    usuario.plano === 'premium'
  }
>
  {usuario.plano === 'premium'
    ? 'Premium'
    : 'Lite'}
</PlanoUsuarioLinha>
                                  </strong>

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
                                {formatarTS(
                                  usuario.patrimonio
                                )}
                              </ValorDestaque>
                            </td>

                            <td>
                              <Variacao
                                $positivo={
                                  Number(
                                    usuario.rentabilidade
                                  ) >= 0
                                }
                              >
                                {formatarPercentual(
                                  usuario.rentabilidade
                                )}
                              </Variacao>
                            </td>

                            <td>
                              {formatarTS(
                                usuario.saldo
                              )}
                            </td>

                            <td>
                              {
                                usuario.quantidadePosicoes
                              }
                            </td>

                            <td>
                              {Number(
                                usuario.quantidadeUnidades ||
                                  0
                              ).toLocaleString(
                                'pt-BR',
                                {
                                  maximumFractionDigits: 4,
                                }
                              )}
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
                  {ranking.map((usuario) => {
                    const souEu =
                      String(
                        usuario.usuarioId
                      ) ===
                      String(
                        usuarioAtual?.usuarioId
                      );

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
                                  : usuario.nome ||
                                    'Usuário'}
                              </strong>

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
                            {formatarTS(
                              usuario.patrimonio
                            )}
                          </strong>
                        </PatrimonioMobile>

                        <MetricasMobile>
                          <MetricaMobile>
                            <span>
                              Rentabilidade
                            </span>

                            <Variacao
                              $positivo={
                                Number(
                                  usuario.rentabilidade
                                ) >= 0
                              }
                            >
                              {formatarPercentual(
                                usuario.rentabilidade
                              )}
                            </Variacao>
                          </MetricaMobile>

                          <MetricaMobile>
                            <span>
                              Saldo
                            </span>

                            <strong>
                              {formatarTS(
                                usuario.saldo
                              )}
                            </strong>
                          </MetricaMobile>

                          <MetricaMobile>
                            <span>
                              Posições
                            </span>

                            <strong>
                              {
                                usuario.quantidadePosicoes
                              }
                            </strong>
                          </MetricaMobile>

                          <MetricaMobile>
                            <span>
                              Unidades
                            </span>

                            <strong>
                              {Number(
                                usuario.quantidadeUnidades ||
                                  0
                              ).toLocaleString(
                                'pt-BR',
                                {
                                  maximumFractionDigits: 4,
                                }
                              )}
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
                  disabled={pagina <= 1}
                  onClick={() =>
                    mudarPagina(pagina - 1)
                  }
                >
                  Anterior
                </BotaoPagina>

                <InformacaoPagina>
                  Página {pagina} de{' '}
                  {totalPaginas}
                </InformacaoPagina>

                <BotaoPagina
                  type="button"
                  disabled={
                    pagina >= totalPaginas
                  }
                  onClick={() =>
                    mudarPagina(pagina + 1)
                  }
                >
                  Próxima
                </BotaoPagina>
              </Paginacao>
            </>
          )}
        </>
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

const Podio = styled.section`
  margin-bottom: 24px;
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 14px;
  align-items: end;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const PodioCard = styled.div`
  min-height: ${({ $posicao }) =>
    Number($posicao) === 1
      ? '220px'
      : '195px'};

  padding: 18px;
  border: 1px solid
    ${({ $posicao }) =>
      Number($posicao) === 1
        ? 'rgba(250, 204, 21, 0.3)'
        : 'rgba(148, 163, 184, 0.15)'};

  border-radius: 18px;

  background:
    ${({ $posicao }) =>
      Number($posicao) === 1
        ? `radial-gradient(
            circle at top,
            rgba(250, 204, 21, 0.16),
            transparent 46%
          ), rgba(15, 23, 42, 0.75)`
        : 'rgba(15, 23, 42, 0.68)'};

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @media (max-width: 700px) {
    min-height: auto;
  }
`;

const PodioPosicao = styled.div`
  margin-bottom: 10px;
  color: ${({ $posicao }) => {
    if (Number($posicao) === 1) {
      return '#fde047';
    }

    if (Number($posicao) === 2) {
      return '#cbd5e1';
    }

    return '#fdba74';
  }};

  font-size: 1rem;
  font-weight: 900;
`;

const Avatar = styled.div`
  width: 58px;
  height: 58px;
  margin-bottom: 10px;
  border-radius: 999px;
  display: grid;
  place-items: center;

  background: linear-gradient(
    135deg,
    #2563eb,
    #60a5fa
  );

  color: white;
  font-size: 1.3rem;
  font-weight: 900;
`;

const PodioUsuario = styled.strong`
  color: #f8fafc;
  font-size: 0.95rem;
`;

const PodioPatrimonio = styled.strong`
  margin: 8px 0 4px;
  color: #f8fafc;
  font-size: 1.15rem;
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

