import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import api from '../lib/api';
import { useToast } from '../components/ToastProvider';
import withAuth from '../components/withAuth';

const TIPOS_EXTRATO = [
  {
    id: 'SALDO_INICIAL',
    label: 'Saldo inicial',
  },
  {
    id: 'DEPOSITO',
    label: 'Depósitos',
  },
  {
    id: 'SAQUE',
    label: 'Retiradas',
  },
  {
    id: 'IPO',
    label: 'Compras no IPO',
  },
  {
    id: 'COMPRA',
    label: 'Compras',
  },
  {
    id: 'VENDA',
    label: 'Vendas',
  },
  {
    id: 'DIVIDENDO',
    label: 'Dividendos',
  },
  {
    id: 'LIQUIDACAO',
    label: 'Liquidações',
  },
  {
    id: 'AJUSTE',
    label: 'Ajustes',
  },
];

function formatTS(valor) {
  const numero = Number(valor || 0);

  return `T$ ${numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatData(data) {
  if (!data) return '—';

  const dataConvertida = new Date(data);

  if (
    Number.isNaN(
      dataConvertida.getTime()
    )
  ) {
    return '—';
  }

  return dataConvertida.toLocaleString(
    'pt-BR'
  );
}

function yyyyMMdd(data) {
  const ano = data.getFullYear();

  const mes = String(
    data.getMonth() + 1
  ).padStart(2, '0');

  const dia = String(
    data.getDate()
  ).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function nomeTipo(tipo) {
  const nomes = {
    SALDO_INICIAL: 'Saldo inicial',
    DEPOSITO: 'Depósito',
    SAQUE: 'Retirada',
    IPO: 'Compra no IPO',
    COMPRA: 'Compra',
    VENDA: 'Venda',
    DIVIDENDO: 'Dividendos',
    LIQUIDACAO: 'Liquidação',
    AJUSTE: 'Ajuste',
  };

  return nomes[tipo] || tipo || 'Operação';
}

function nomeTaxa(tipoTaxa) {
  const tipo = String(
    tipoTaxa || ''
  ).toLowerCase();

  if (tipo === 'maker') {
    return 'Maker';
  }

  if (tipo === 'taker') {
    return 'Taker';
  }

  return null;
}

function Extrato() {
  const { adicionarToast } = useToast();

  const [itens, setItens] = useState([]);
  const [saldoInicial, setSaldoInicial] =
    useState(0);
  const [saldoAtual, setSaldoAtual] =
    useState(0);

  const [resumo, setResumo] = useState({
    totalCreditos: 0,
    totalDebitos: 0,
    totalTaxas: 0,
  });

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] = useState('');

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [tipos, setTipos] = useState(
    TIPOS_EXTRATO.reduce(
      (acc, tipo) => ({
        ...acc,
        [tipo.id]: true,
      }),
      {}
    )
  );

  const tiposQuery = useMemo(() => {
    return Object.entries(tipos)
      .filter(([, marcado]) => marcado)
      .map(([tipo]) => tipo)
      .join(',');
  }, [tipos]);

  const aplicarRange = (dias) => {
    const hoje = new Date();
    const inicio = new Date();

    inicio.setDate(
      hoje.getDate() - dias
    );

    setFrom(yyyyMMdd(inicio));
    setTo(yyyyMMdd(hoje));
  };

  const limparRange = () => {
    setFrom('');
    setTo('');
  };

  const alternarTipo = (tipo) => {
    setTipos((atual) => ({
      ...atual,
      [tipo]: !atual[tipo],
    }));
  };

  const selecionarTodos = () => {
    setTipos(
      TIPOS_EXTRATO.reduce(
        (acc, tipo) => ({
          ...acc,
          [tipo.id]: true,
        }),
        {}
      )
    );
  };

  const limparTipos = () => {
    setTipos(
      TIPOS_EXTRATO.reduce(
        (acc, tipo) => ({
          ...acc,
          [tipo.id]: false,
        }),
        {}
      )
    );
  };

  const carregar = async () => {
    setCarregando(true);
    setErro('');

    try {
      const params = {
        tipos:
          tiposQuery ||
          '__NENHUM_TIPO__',
      };

      if (from) {
        params.from = from;
      }

      if (to) {
        params.to = to;
      }

      const { data } = await api.get(
        '/usuario/extrato',
        {
          params,
        }
      );

      setItens(
        Array.isArray(data?.itens)
          ? data.itens
          : []
      );

      setSaldoInicial(
        Number(
          data?.saldoInicial || 0
        )
      );

      setSaldoAtual(
        Number(
          data?.saldoAtual || 0
        )
      );

      setResumo({
        totalCreditos: Number(
          data?.resumo?.totalCreditos ||
            0
        ),

        totalDebitos: Number(
          data?.resumo?.totalDebitos ||
            0
        ),

        totalTaxas: Number(
          data?.resumo?.totalTaxas ||
            0
        ),
      });
    } catch (err) {
      console.error(
        'Erro ao carregar extrato:',
        err
      );

      const mensagem =
        err?.response?.data?.erro ||
        err?.response?.data?.message ||
        'Não foi possível carregar o extrato.';

      setErro(mensagem);
      setItens([]);

      adicionarToast(
        mensagem,
        'erro'
      );
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Wrap>
      <Header>
        <div>
          <Eyebrow>
            Movimentações financeiras simuladas
          </Eyebrow>

          <H1>Extrato</H1>

          <Sub>
            Acompanhe créditos, débitos, taxas e o
            saldo resultante de cada operação.
          </Sub>
        </div>

        <Disclaimer>
          Todos os valores são fictícios e
          representados em T$.
        </Disclaimer>
      </Header>

      <ResumoGrid>
        <ResumoCard $destaque>
          <ResumoLabel>
            Saldo atual
          </ResumoLabel>

          <ResumoValor>
            {formatTS(saldoAtual)}
          </ResumoValor>
        </ResumoCard>

        <ResumoCard>
          <ResumoLabel>
            Saldo inicial
          </ResumoLabel>

          <ResumoValor>
            {formatTS(saldoInicial)}
          </ResumoValor>
        </ResumoCard>

        <ResumoCard $credito>
          <ResumoLabel>
            Créditos
          </ResumoLabel>

          <ResumoValor>
            + {formatTS(
              resumo.totalCreditos
            )}
          </ResumoValor>
        </ResumoCard>

        <ResumoCard $debito>
          <ResumoLabel>
            Débitos
          </ResumoLabel>

          <ResumoValor>
            - {formatTS(
              resumo.totalDebitos
            )}
          </ResumoValor>
        </ResumoCard>

        <ResumoCard $taxa>
          <ResumoLabel>
            Taxas cobradas
          </ResumoLabel>

          <ResumoValor>
            {formatTS(
              resumo.totalTaxas
            )}
          </ResumoValor>
        </ResumoCard>
      </ResumoGrid>

      <FiltrosCard>
        <FiltrosTopo>
          <div>
            <FiltrosTitulo>
              Filtrar movimentações
            </FiltrosTitulo>

            <FiltrosTexto>
              Selecione um período e os tipos de
              lançamento que deseja consultar.
            </FiltrosTexto>
          </div>

          <PeriodosRapidos>
            <BtnPill
              type="button"
              onClick={() =>
                aplicarRange(1)
              }
            >
              24h
            </BtnPill>

            <BtnPill
              type="button"
              onClick={() =>
                aplicarRange(7)
              }
            >
              7 dias
            </BtnPill>

            <BtnPill
              type="button"
              onClick={() =>
                aplicarRange(30)
              }
            >
              1 mês
            </BtnPill>

            <BtnPill
              type="button"
              onClick={() =>
                aplicarRange(90)
              }
            >
              3 meses
            </BtnPill>

            <BtnPill
              type="button"
              onClick={limparRange}
            >
              Desde o início
            </BtnPill>
          </PeriodosRapidos>
        </FiltrosTopo>

        <LinhaFiltros>
          <Campo>
            <CampoLabel>
              Data inicial
            </CampoLabel>

            <CampoInput
              type="date"
              value={from}
              onChange={(e) =>
                setFrom(e.target.value)
              }
            />
          </Campo>

          <Campo>
            <CampoLabel>
              Data final
            </CampoLabel>

            <CampoInput
              type="date"
              value={to}
              onChange={(e) =>
                setTo(e.target.value)
              }
            />
          </Campo>

          <BtnPrimary
            type="button"
            onClick={carregar}
            disabled={carregando}
          >
            {carregando
              ? 'Carregando...'
              : 'Aplicar filtros'}
          </BtnPrimary>
        </LinhaFiltros>

        <TiposCabecalho>
          <span>Tipos de lançamento</span>

          <div>
            <BotaoTexto
              type="button"
              onClick={selecionarTodos}
            >
              Selecionar todos
            </BotaoTexto>

            <BotaoTexto
              type="button"
              onClick={limparTipos}
            >
              Limpar
            </BotaoTexto>
          </div>
        </TiposCabecalho>

        <LinhaChecks>
          {TIPOS_EXTRATO.map(
            (tipo) => (
              <Check
                key={tipo.id}
                $marcado={
                  Boolean(tipos[tipo.id])
                }
              >
                <input
                  type="checkbox"
                  checked={Boolean(
                    tipos[tipo.id]
                  )}
                  onChange={() =>
                    alternarTipo(
                      tipo.id
                    )
                  }
                />

                <span>{tipo.label}</span>
              </Check>
            )
          )}
        </LinhaChecks>
      </FiltrosCard>

      {erro && (
        <ErroCard>{erro}</ErroCard>
      )}

      {carregando ? (
        <EstadoCard>
          Carregando movimentações...
        </EstadoCard>
      ) : itens.length === 0 ? (
        <EstadoCard>
          <EstadoTitulo>
            Nenhuma movimentação encontrada
          </EstadoTitulo>

          <EstadoTexto>
            Altere o período ou selecione outros
            tipos de lançamento para consultar o
            extrato.
          </EstadoTexto>
        </EstadoCard>
      ) : (
        <>
          <DesktopTableCard>
            <TabelaWrap>
              <Tabela>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Operação</th>
                    <th>Detalhes</th>
                    <th>Valor</th>
                    <th>Taxa</th>
                    <th>Saldo após</th>
                  </tr>
                </thead>

                <tbody>
                  {itens.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <DataTabela>
                          {formatData(
                            item.data
                          )}
                        </DataTabela>
                      </td>

                      <td>
                        <TipoBadge
                          $tipo={
                            item.tipo
                          }
                        >
                          {nomeTipo(
                            item.tipo
                          )}
                        </TipoBadge>
                      </td>

                      <td>
                        <DetalhesOperacao>
                          <strong>
                            {item.descricao}
                          </strong>

                          {Number(
                            item.quantidade || 0
                          ) > 0 && (
                            <span>
                              {Number(
                                item.quantidade
                              ).toLocaleString(
                                'pt-BR',
                                {
                                  maximumFractionDigits: 4,
                                }
                              )}{' '}
                              cotas a{' '}
                              {formatTS(
                                item.precoUnitario
                              )}{' '}
                              cada
                            </span>
                          )}

                          {item.orderId && (
                            <small>
                              Ordem{' '}
                              {String(
                                item.orderId
                              ).slice(-8)}
                            </small>
                          )}
                        </DetalhesOperacao>
                      </td>

                      <td>
                        <ValorMovimento
                          $credito={
                            item.direcao ===
                            'C'
                          }
                        >
                          {item.direcao ===
                          'C'
                            ? '+'
                            : '-'}{' '}
                          {formatTS(
                            item.valor
                          )}
                        </ValorMovimento>
                      </td>

                      <td>
                        {Number(
                          item.taxa || 0
                        ) > 0 ? (
                          <TaxaInfo>
                            <strong>
                              {formatTS(
                                item.taxa
                              )}
                            </strong>

                            {nomeTaxa(
                              item.tipoTaxa
                            ) && (
                              <span>
                                {nomeTaxa(
                                  item.tipoTaxa
                                )}
                              </span>
                            )}
                          </TaxaInfo>
                        ) : (
                          <SemValor>—</SemValor>
                        )}
                      </td>

                      <td>
                        <SaldoApos>
                          {formatTS(
                            item.saldoApos
                          )}
                        </SaldoApos>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tabela>
            </TabelaWrap>
          </DesktopTableCard>

          <MobileLista>
            {itens.map((item) => (
              <MobileItem key={item.id}>
                <MobileTop>
                  <TipoBadge
                    $tipo={item.tipo}
                  >
                    {nomeTipo(
                      item.tipo
                    )}
                  </TipoBadge>

                  <ValorMovimento
                    $credito={
                      item.direcao === 'C'
                    }
                  >
                    {item.direcao === 'C'
                      ? '+'
                      : '-'}{' '}
                    {formatTS(item.valor)}
                  </ValorMovimento>
                </MobileTop>

                <MobileDescricao>
                  {item.descricao}
                </MobileDescricao>

                <MobileData>
                  {formatData(item.data)}
                </MobileData>

                <MobileGrid>
                  {Number(
                    item.quantidade || 0
                  ) > 0 && (
                    <>
                      <InfoBloco>
                        <span>
                          Quantidade
                        </span>

                        <strong>
                          {Number(
                            item.quantidade
                          ).toLocaleString(
                            'pt-BR',
                            {
                              maximumFractionDigits: 4,
                            }
                          )}
                        </strong>
                      </InfoBloco>

                      <InfoBloco>
                        <span>
                          Preço unitário
                        </span>

                        <strong>
                          {formatTS(
                            item.precoUnitario
                          )}
                        </strong>
                      </InfoBloco>

                      <InfoBloco>
                        <span>
                          Valor bruto
                        </span>

                        <strong>
                          {formatTS(
                            item.valorBruto
                          )}
                        </strong>
                      </InfoBloco>
                    </>
                  )}

                  <InfoBloco>
                    <span>Taxa</span>

                    <strong>
                      {Number(
                        item.taxa || 0
                      ) > 0
                        ? formatTS(
                            item.taxa
                          )
                        : 'Sem taxa'}
                    </strong>

                    {nomeTaxa(
                      item.tipoTaxa
                    ) && (
                      <small>
                        {nomeTaxa(
                          item.tipoTaxa
                        )}
                      </small>
                    )}
                  </InfoBloco>

                  <InfoBloco $largo>
                    <span>
                      Saldo após a operação
                    </span>

                    <strong>
                      {formatTS(
                        item.saldoApos
                      )}
                    </strong>
                  </InfoBloco>
                </MobileGrid>

                {item.orderId && (
                  <OrderId>
                    Ordem{' '}
                    {String(
                      item.orderId
                    ).slice(-8)}
                  </OrderId>
                )}
              </MobileItem>
            ))}
          </MobileLista>
        </>
      )}
    </Wrap>
  );
}

export default withAuth(Extrato);

const Wrap = styled.div`
  padding: 24px;
  color: #e5e7eb;

  @media (max-width: 900px) {
    padding: 14px 10px 18px;
  }
`;

const Header = styled.header`
  margin-bottom: 18px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;

  @media (max-width: 760px) {
    flex-direction: column;
  }
`;

const Eyebrow = styled.div`
  margin-bottom: 6px;
  color: #60a5fa;
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const H1 = styled.h1`
  margin: 0;
  color: #ffffff;
  font-size: 2rem;
  font-weight: 900;

  @media (max-width: 900px) {
    font-size: 1.55rem;
  }
`;

const Sub = styled.p`
  max-width: 650px;
  margin: 7px 0 0;
  color: #94a3b8;
  font-size: 0.86rem;
  line-height: 1.5;
`;

const Disclaimer = styled.div`
  max-width: 280px;
  padding: 10px 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 11px;
  background: rgba(59, 130, 246, 0.08);
  color: #bfdbfe;
  font-size: 0.73rem;
  line-height: 1.4;
`;

const ResumoGrid = styled.section`
  margin-bottom: 16px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 11px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 680px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const ResumoCard = styled.div`
  min-width: 0;
  padding: 14px;
  border: 1px solid
    ${({ $credito, $debito, $taxa, $destaque }) =>
      $credito
        ? 'rgba(34, 197, 94, 0.2)'
        : $debito
        ? 'rgba(239, 68, 68, 0.2)'
        : $taxa
        ? 'rgba(250, 204, 21, 0.2)'
        : $destaque
        ? 'rgba(59, 130, 246, 0.25)'
        : 'rgba(148, 163, 184, 0.14)'};

  border-radius: 14px;

  background:
    ${({ $credito, $debito, $taxa, $destaque }) =>
      $credito
        ? 'rgba(34, 197, 94, 0.07)'
        : $debito
        ? 'rgba(239, 68, 68, 0.07)'
        : $taxa
        ? 'rgba(250, 204, 21, 0.06)'
        : $destaque
        ? 'rgba(59, 130, 246, 0.08)'
        : 'rgba(15, 23, 42, 0.62)'};
`;

const ResumoLabel = styled.span`
  display: block;
  margin-bottom: 7px;
  color: #94a3b8;
  font-size: 0.7rem;
`;

const ResumoValor = styled.strong`
  display: block;
  overflow: hidden;
  color: #f8fafc;
  font-size: 0.95rem;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FiltrosCard = styled.section`
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 15px;
  background: rgba(15, 23, 42, 0.62);
`;

const FiltrosTopo = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;

  @media (max-width: 800px) {
    flex-direction: column;
  }
`;

const FiltrosTitulo = styled.strong`
  display: block;
  color: #f8fafc;
  font-size: 0.92rem;
`;

const FiltrosTexto = styled.p`
  margin: 5px 0 0;
  color: #64748b;
  font-size: 0.74rem;
`;

const PeriodosRapidos = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
`;

const BtnPill = styled.button`
  padding: 6px 10px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.1);
  color: #bfdbfe;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;

  &:hover {
    background: rgba(59, 130, 246, 0.17);
  }
`;

const LinhaFiltros = styled.div`
  margin-top: 14px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: 10px;
  align-items: end;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const Campo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CampoLabel = styled.label`
  color: #94a3b8;
  font-size: 0.72rem;
`;

const CampoInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 9px;
  background: rgba(2, 6, 23, 0.55);
  color: #e5e7eb;
  color-scheme: dark;

  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.55);
  }
`;

const BtnPrimary = styled.button`
  min-height: 39px;
  padding: 9px 15px;
  border: 0;
  border-radius: 9px;
  background: #2563eb;
  color: #ffffff;
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #1d4ed8;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const TiposCabecalho = styled.div`
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 800;

  div {
    display: flex;
    gap: 10px;
  }
`;

const BotaoTexto = styled.button`
  padding: 0;
  border: 0;
  background: transparent;
  color: #60a5fa;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
`;

const LinhaChecks = styled.div`
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Check = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 9px;
  border: 1px solid
    ${({ $marcado }) =>
      $marcado
        ? 'rgba(59, 130, 246, 0.28)'
        : 'rgba(148, 163, 184, 0.12)'};

  border-radius: 9px;
  background: ${({ $marcado }) =>
    $marcado
      ? 'rgba(59, 130, 246, 0.1)'
      : 'rgba(255, 255, 255, 0.025)'};

  color: ${({ $marcado }) =>
    $marcado ? '#bfdbfe' : '#64748b'};

  font-size: 0.7rem;
  cursor: pointer;

  input {
    accent-color: #2563eb;
  }
`;

const ErroCard = styled.div`
  margin-bottom: 14px;
  padding: 13px 15px;
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.08);
  color: #fca5a5;
`;

const EstadoCard = styled.div`
  padding: 30px 18px;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.58);
  color: #94a3b8;
  text-align: center;
`;

const EstadoTitulo = styled.strong`
  display: block;
  color: #e2e8f0;
`;

const EstadoTexto = styled.p`
  max-width: 460px;
  margin: 7px auto 0;
  color: #64748b;
  font-size: 0.8rem;
  line-height: 1.5;
`;

const DesktopTableCard = styled.div`
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 14px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.62);

  @media (max-width: 900px) {
    display: none;
  }
`;

const TabelaWrap = styled.div`
  overflow-x: auto;
`;

const Tabela = styled.table`
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;

  th,
  td {
    padding: 13px 12px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    text-align: left;
    vertical-align: middle;
  }

  th {
    background: rgba(2, 6, 23, 0.35);
    color: #94a3b8;
    font-size: 0.67rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  tbody tr:hover {
    background: rgba(255, 255, 255, 0.025);
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }
`;

const DataTabela = styled.span`
  color: #94a3b8;
  font-size: 0.74rem;
  white-space: nowrap;
`;

const TipoBadge = styled.span`
  display: inline-flex;
  padding: 6px 9px;
  border-radius: 999px;

  background: ${({ $tipo }) => {
    if (
      ['DEPOSITO', 'VENDA', 'DIVIDENDO', 'LIQUIDACAO'].includes($tipo)
    ) {
      return 'rgba(34, 197, 94, 0.12)';
    }

    if (
      ['SAQUE', 'COMPRA', 'IPO'].includes($tipo)
    ) {
      return 'rgba(239, 68, 68, 0.11)';
    }

    if ($tipo === 'AJUSTE') {
      return 'rgba(250, 204, 21, 0.11)';
    }

    return 'rgba(59, 130, 246, 0.12)';
  }};

  color: ${({ $tipo }) => {
    if (
      ['DEPOSITO', 'VENDA', 'DIVIDENDO', 'LIQUIDACAO'].includes($tipo)
    ) {
      return '#86efac';
    }

    if (
      ['SAQUE', 'COMPRA', 'IPO'].includes($tipo)
    ) {
      return '#fca5a5';
    }

    if ($tipo === 'AJUSTE') {
      return '#fde68a';
    }

    return '#93c5fd';
  }};

  font-size: 0.67rem;
  font-weight: 900;
  white-space: nowrap;
`;

const DetalhesOperacao = styled.div`
  max-width: 330px;

  strong {
    display: block;
    overflow: hidden;
    color: #e2e8f0;
    font-size: 0.79rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span,
  small {
    display: block;
    margin-top: 4px;
    color: #64748b;
    font-size: 0.68rem;
  }
`;

const ValorMovimento = styled.strong`
  color: ${({ $credito }) =>
    $credito ? '#86efac' : '#fca5a5'};
  font-size: 0.8rem;
  white-space: nowrap;
`;

const TaxaInfo = styled.div`
  strong {
    display: block;
    color: #fde68a;
    font-size: 0.76rem;
  }

  span {
    display: block;
    margin-top: 3px;
    color: #94a3b8;
    font-size: 0.65rem;
  }
`;

const SemValor = styled.span`
  color: #475569;
`;

const SaldoApos = styled.strong`
  color: #f8fafc;
  font-size: 0.8rem;
  white-space: nowrap;
`;

const MobileLista = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: grid;
    gap: 12px;
  }
`;

const MobileItem = styled.article`
  padding: 13px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.62);
`;

const MobileTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const MobileDescricao = styled.strong`
  display: block;
  margin-top: 12px;
  color: #f8fafc;
  font-size: 0.87rem;
  line-height: 1.4;
`;

const MobileData = styled.div`
  margin-top: 4px;
  color: #64748b;
  font-size: 0.7rem;
`;

const MobileGrid = styled.div`
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 430px) {
    grid-template-columns: 1fr;
  }
`;

const InfoBloco = styled.div`
  grid-column: ${({ $largo }) =>
    $largo ? '1 / -1' : 'auto'};

  padding: 9px;
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.025);

  span {
    display: block;
    margin-bottom: 5px;
    color: #64748b;
    font-size: 0.67rem;
  }

  strong {
    display: block;
    color: #e2e8f0;
    font-size: 0.78rem;
  }

  small {
    display: block;
    margin-top: 3px;
    color: #94a3b8;
    font-size: 0.63rem;
  }
`;

const OrderId = styled.div`
  margin-top: 10px;
  color: #475569;
  font-size: 0.65rem;
`;