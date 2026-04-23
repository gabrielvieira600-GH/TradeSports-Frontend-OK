import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import api from '../lib/api';
import NegociacaoModal from '../components/NegociacaoModal';
import withAuth from '../components/withAuth';
import Image from 'next/image';

const PALETA_CORES = [
  '#3b82f6',
  '#22c55e',
  '#f97316',
  '#a855f7',
  '#ef4444',
  '#eab308',
  '#06b6d4',
  '#ec4899',
  '#0ea5e9',
  '#10b981',
];

function CarteiraPage() {
  const router = useRouter();

  const [carteira, setCarteira] = useState([]);
  const [clubes, setClubes] = useState([]);
  const [erro, setErro] = useState('');
  const [resumo, setResumo] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [clubeSelecionado, setClubeSelecionado] = useState(null);
  const [historico, setHistorico] = useState([]);

  const [itensPorPaginaCarteira, setItensPorPaginaCarteira] = useState(10);
  const [paginaCarteira, setPaginaCarteira] = useState(1);
  const [itensPorPaginaHistorico, setItensPorPaginaHistorico] = useState(10);
  const [paginaHistorico, setPaginaHistorico] = useState(1);
  const [saldo, setSaldo] = useState(0);

  const [serieCarteira, setSerieCarteira] = useState([]);
  const [intervaloGrafico, setIntervaloGrafico] = useState('SEASON');

  const abrirPaginaClube = (clubeId) => {
    router.push(`/clube/${clubeId}`);
  };

  const abrirModalDeVenda = (ativo) => {
    const clubeCompleto = clubes.find((c) => c.id === ativo.clubeId);
    if (!clubeCompleto) return;
    setClubeSelecionado(clubeCompleto);
    setModalAberto(true);
  };

  const getPrecoAtual = (clubeId) => {
    const clube = clubes.find((c) => c.id === clubeId);
    return clube ? clube.precoAtual || clube.preco : 0;
  };

  const calcularPLRealizado = (historicoBruto) => {
    if (!historicoBruto || historicoBruto.length === 0) return 0;

    const ordenado = [...historicoBruto].sort(
      (a, b) => new Date(a.data) - new Date(b.data)
    );

    const posicoes = {};
    let plRealizado = 0;

    ordenado.forEach((op) => {
      const clubeId = op.clubeId ?? null;
      const quantidade = Number(op.quantidade || 0);
      const preco = Number(op.valorUnitario || 0);
      const tipo = String(op.tipo || '').toUpperCase();

      if (!clubeId || !quantidade || !preco) return;

      const key = String(clubeId);
      if (!posicoes[key]) {
        posicoes[key] = { qty: 0, costTotal: 0 };
      }

      const pos = posicoes[key];

      const isCompra =
        tipo.includes('COMPRA') || tipo === 'IPO' || tipo.includes('SUBSCRI');
      const isVenda = tipo.includes('VENDA') || tipo.includes('LIQUIDA');

      if (isCompra) {
        pos.costTotal += quantidade * preco;
        pos.qty += quantidade;
      } else if (isVenda) {
        const avg = pos.qty > 0 ? pos.costTotal / pos.qty : preco;
        const custo = avg * quantidade;
        const recebido = preco * quantidade;
        const pl = recebido - custo;

        plRealizado += pl;

        pos.costTotal -= custo;
        pos.qty -= quantidade;

        if (pos.qty <= 0) {
          pos.qty = 0;
          pos.costTotal = 0;
        }
      }
    });

    return plRealizado;
  };

  const calcularTotalDividendos = (historicoBruto) => {
    if (!historicoBruto || historicoBruto.length === 0) return 0;
    return historicoBruto
      .filter((op) => String(op.tipo || '').toUpperCase().startsWith('DIV'))
      .reduce((acc, op) => acc + Number(op.totalPago || 0), 0);
  };

  useEffect(() => {
    let cancelado = false;

    const carregarCarteira = async () => {
      try {
        const [respClubes, respCarteira, respSaldo] = await Promise.all([
          api.get('/clube/clubes'),
          api.get('/usuario/carteira'),
          api.get('/usuario/saldo'),
        ]);

        if (cancelado) return;

        setClubes(respClubes.data || []);
        setCarteira(respCarteira.data || []);
        setSaldo(Number(respSaldo?.data?.saldo ?? 0));
      } catch (err) {
        console.error('Erro ao carregar dados da carteira:', err);
        if (!cancelado) {
          setErro('Erro ao carregar dados da carteira.');
          setCarteira([]);
        }
      }
    };

    carregarCarteira();

    return () => {
      cancelado = true;
    };
  }, []);

  

  useEffect(() => {
    if (carteira.length > 0 && clubes.length > 0) {
      let totalInvestido = 0;
      let totalAtual = 0;
      let totalCotas = 0;

      carteira.forEach((ativo) => {
        const precoAtual = getPrecoAtual(ativo.clubeId);
        totalInvestido += ativo.quantidade * ativo.precoMedio;
        totalAtual += ativo.quantidade * precoAtual;
        totalCotas += ativo.quantidade;
      });

      const plNaoRealizado = totalAtual - totalInvestido;
      const plRealizado = calcularPLRealizado(historico);
      const totalDividendos = calcularTotalDividendos(historico);
      const plTotal = plRealizado + plNaoRealizado;
      const valorTotalCarteira = totalAtual + saldo;
      const variacaoCarteira =
        valorTotalCarteira > 0 ? (plTotal / valorTotalCarteira) * 100 : 0;

      setResumo({
        totalInvestido,
        totalAtual,
        totalCotas,
        plNaoRealizado,
        plRealizado,
        plTotal,
        totalDividendos,
        valorTotalCarteira,
        variacaoCarteira,
      });
    } else {
      setResumo(null);
    }
  }, [carteira, clubes, historico, saldo]);

  useEffect(() => {
    if (!historico.length || !clubes.length) {
      setSerieCarteira([]);
      return;
    }

    try {
      const precoAtualPorClube = {};
      clubes.forEach((c) => {
        const key = String(c.id);
        precoAtualPorClube[key] = Number(c.precoAtual || c.preco || 0);
      });

      const quantidades = {};
      carteira.forEach((ativo) => {
        const key = String(ativo.clubeId);
        quantidades[key] = Number(ativo.quantidade || 0);
      });

      let saldoCorrente = Number(saldo || 0);

      const calcularValorCarteira = () => {
        let totalAtivos = 0;
        Object.entries(quantidades).forEach(([id, qtd]) => {
          const preco = precoAtualPorClube[id] || 0;
          totalAtivos += qtd * preco;
        });
        return saldoCorrente + totalAtivos;
      };

      const pontosReverso = [];

      const agora = new Date();
      pontosReverso.push({
        data: agora,
        valor: calcularValorCarteira(),
      });

      const histOrdenado = [...historico].sort(
        (a, b) => new Date(b.data) - new Date(a.data)
      );

      histOrdenado.forEach((op) => {
        const tipo = String(op.tipo || '').toUpperCase();
        const quantidade = Number(op.quantidade || 0);
        const totalPago = Number(op.totalPago || 0);
        const clubeIdRaw =
          op.clubeId ?? op.clubeID ?? op.clube_id ?? op.idClube ?? null;
        const clubeKey = clubeIdRaw != null ? String(clubeIdRaw) : null;

        const isCompra =
          tipo.includes('COMPRA') || tipo === 'IPO' || tipo.includes('SUBSCRI');
        const isVenda = tipo.includes('VENDA') || tipo.includes('LIQUIDA');

        if (isCompra) {
          saldoCorrente += totalPago;
          if (clubeKey) {
            if (!quantidades[clubeKey]) quantidades[clubeKey] = 0;
            quantidades[clubeKey] -= quantidade;
          }
        } else if (isVenda) {
          saldoCorrente -= totalPago;
          if (clubeKey) {
            if (!quantidades[clubeKey]) quantidades[clubeKey] = 0;
            quantidades[clubeKey] += quantidade;
          }
        }

        const dataOp = new Date(op.data);
        pontosReverso.push({
          data: dataOp,
          valor: calcularValorCarteira(),
        });
      });

      const pontosOrdenados = pontosReverso
        .sort((a, b) => a.data - b.data)
        .filter((p, idx, arr) => {
          if (idx === 0) return true;
          return p.data.getTime() !== arr[idx - 1].data.getTime();
        });

      setSerieCarteira(pontosOrdenados);
    } catch (e) {
      console.error('Erro ao montar série histórica da carteira:', e);
      setSerieCarteira([]);
    }
  }, [historico, clubes, carteira, saldo]);

  const pontosFiltrados = useMemo(() => {
    if (!serieCarteira.length) return [];

    if (intervaloGrafico === 'SEASON') return serieCarteira;

    const agora = new Date();
    let cutoff = null;

    switch (intervaloGrafico) {
      case '1D':
        cutoff = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7D':
        cutoff = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30D': {
        const d = new Date(agora);
        d.setDate(d.getDate() - 30);
        cutoff = d;
        break;
      }
      case 'SEASON': {
        const d = new Date(agora);
        d.setMonth(d.getMonth() - 12);
        cutoff = d;
        break;
      }
      default:
        cutoff = null;
    }

    if (!cutoff) return serieCarteira;
    return serieCarteira.filter((p) => p.data >= cutoff);
  }, [serieCarteira, intervaloGrafico]);

  const distribuicaoCarteira = (() => {
    if (!carteira.length || !clubes.length) return [];

    return carteira
      .map((ativo) => {
        const precoAtual = getPrecoAtual(ativo.clubeId);
        const totalAtual = ativo.quantidade * precoAtual;
        return {
          clubeId: ativo.clubeId,
          nome: ativo.nome,
          totalAtual,
        };
      })
      .filter((item) => item.totalAtual > 0);
  })();

  const totalValorCarteiraGrafico = distribuicaoCarteira.reduce(
    (acc, item) => acc + item.totalAtual,
    0
  );

  const gradDistribuicao = (() => {
    if (!distribuicaoCarteira.length || totalValorCarteiraGrafico <= 0) {
      return 'conic-gradient(#1f2937 0deg 360deg)';
    }

    let anguloAcumulado = 0;
    const segmentos = distribuicaoCarteira.map((item, idx) => {
      const frac = item.totalAtual / totalValorCarteiraGrafico;
      const angulo = frac * 360;
      const inicio = anguloAcumulado;
      const fim = anguloAcumulado + angulo;
      anguloAcumulado = fim;
      const cor = PALETA_CORES[idx % PALETA_CORES.length];
      return `${cor} ${inicio}deg ${fim}deg`;
    });

    return `conic-gradient(${segmentos.join(', ')})`;
  })();

  const plPorClube = (() => {
    if (!carteira.length || !clubes.length) return [];
    return carteira.map((ativo) => {
      const precoAtual = getPrecoAtual(ativo.clubeId);
      const totalAtual = ativo.quantidade * precoAtual;
      const custo = ativo.quantidade * ativo.precoMedio;
      const pl = totalAtual - custo;
      return {
        clubeId: ativo.clubeId,
        nome: ativo.nome,
        pl,
      };
    });
  })();

  const plMaxAbs = plPorClube.reduce(
    (acc, item) => Math.max(acc, Math.abs(item.pl)),
    0
  );

  const totalPaginasCarteira = Math.max(
    1,
    Math.ceil((carteira?.length || 0) / itensPorPaginaCarteira)
  );

  useEffect(() => {
    if (paginaCarteira > totalPaginasCarteira) {
      setPaginaCarteira(totalPaginasCarteira);
    }
    if (paginaCarteira < 1) setPaginaCarteira(1);
  }, [paginaCarteira, totalPaginasCarteira]);

  const carteiraPaginada = useMemo(() => {
    const start = (paginaCarteira - 1) * itensPorPaginaCarteira;
    const end = start + itensPorPaginaCarteira;
    return (carteira || []).slice(start, end);
  }, [carteira, paginaCarteira, itensPorPaginaCarteira]);

  const historicoOrdenado = useMemo(() => {
    return [...(historico || [])].sort((a, b) => {
      const da = a?.data ? new Date(a.data).getTime() : 0;
      const db = b?.data ? new Date(b.data).getTime() : 0;
      return db - da;
    });
  }, [historico]);

  const totalPaginasHistorico = Math.max(
    1,
    Math.ceil((historicoOrdenado?.length || 0) / itensPorPaginaHistorico)
  );

  useEffect(() => {
    if (paginaHistorico > totalPaginasHistorico) {
      setPaginaHistorico(totalPaginasHistorico);
    }
    if (paginaHistorico < 1) setPaginaHistorico(1);
  }, [paginaHistorico, totalPaginasHistorico]);

  const historicoPaginado = useMemo(() => {
    const start = (paginaHistorico - 1) * itensPorPaginaHistorico;
    const end = start + itensPorPaginaHistorico;
    return (historicoOrdenado || []).slice(start, end);
  }, [historicoOrdenado, paginaHistorico, itensPorPaginaHistorico]);

  return (
    <>
      {modalAberto && clubeSelecionado && (
        <NegociacaoModal
          isOpen={modalAberto}
          onClose={() => {
            setModalAberto(false);
            setClubeSelecionado(null);
          }}
          clube={clubeSelecionado}
          modoInicial="venda"
        />
      )}

      <Container>
        <Titulo>Minha Carteira</Titulo>

        {erro && <Erro>{erro}</Erro>}

        {resumo && (
          <ResumoGrid>
            <ResumoCard>
              <LabelResumo>Valor total da carteira</LabelResumo>
              <ValorPrincipal>R$ {resumo.valorTotalCarteira.toFixed(2)}</ValorPrincipal>
            </ResumoCard>

            <ResumoCard>
              <LabelResumo>Total investido</LabelResumo>
              <ValorSecundario>R$ {resumo.totalInvestido.toFixed(2)}</ValorSecundario>
            </ResumoCard>

            <ResumoCard>
              <LabelResumo>P/L total</LabelResumo>
              <ValorSecundario $positivo={resumo.plTotal >= 0}>
                R$ {resumo.plTotal.toFixed(2)}
              </ValorSecundario>
            </ResumoCard>

            <ResumoCard>
              <LabelResumo>Dividendos recebidos</LabelResumo>
              <ValorSecundario $positivo>
                R$ {Number(resumo.totalDividendos || 0).toFixed(2)}
              </ValorSecundario>
            </ResumoCard>

            <ResumoCard>
              <LabelResumo>Variação da carteira</LabelResumo>
              <ValorSecundario $positivo={resumo.variacaoCarteira >= 0}>
                {resumo.variacaoCarteira.toFixed(2)}%
              </ValorSecundario>
            </ResumoCard>

            <ResumoCard>
              <LabelResumo>Total de cotas</LabelResumo>
              <ValorSecundario>{resumo.totalCotas}</ValorSecundario>
            </ResumoCard>
          </ResumoGrid>
        )}

        {(serieCarteira.length > 0 ||
          distribuicaoCarteira.length > 0 ||
          plPorClube.length > 0) && (
          <GraficosWrapper>
            {serieCarteira.length > 0 && (
              <GraficoCard>
                <h3>Evolução do Valor da Carteira</h3>
                <RangeSelector>
                  <RangeButton
                    ativo={intervaloGrafico === '1D'}
                    onClick={() => setIntervaloGrafico('1D')}
                  >
                    24h
                  </RangeButton>
                  <RangeButton
                    ativo={intervaloGrafico === '7D'}
                    onClick={() => setIntervaloGrafico('7D')}
                  >
                    7 dias
                  </RangeButton>
                  <RangeButton
                    ativo={intervaloGrafico === '30D'}
                    onClick={() => setIntervaloGrafico('30D')}
                  >
                    1 mês
                  </RangeButton>
                  <RangeButton
                    ativo={intervaloGrafico === 'SEASON'}
                    onClick={() => setIntervaloGrafico('SEASON')}
                  >
                    3 meses
                  </RangeButton>
                </RangeSelector>
                <GraficoLinhaCarteira pontos={pontosFiltrados} />
              </GraficoCard>
            )}

            {distribuicaoCarteira.length > 0 && (
              <GraficoCard>
                <h3>Distribuição da Carteira por Clube</h3>
                <PizzaWrapper>
                  <Pizza style={{ backgroundImage: gradDistribuicao }} />
                  <Legenda>
                    {distribuicaoCarteira
                      .slice()
                      .sort((a, b) => b.totalAtual - a.totalAtual)
                      .map((item, idx) => {
                        const perc =
                          totalValorCarteiraGrafico > 0
                            ? (item.totalAtual / totalValorCarteiraGrafico) * 100
                            : 0;
                        const cor = PALETA_CORES[idx % PALETA_CORES.length];

                        return (
                          <LegendaItem key={item.clubeId}>
                            <CorDot style={{ backgroundColor: cor }} />
                            <span>{item.nome}</span>
                            <span>
                              R$ {item.totalAtual.toFixed(2)} ({perc.toFixed(1)}%)
                            </span>
                          </LegendaItem>
                        );
                      })}
                  </Legenda>
                </PizzaWrapper>
              </GraficoCard>
            )}
          </GraficosWrapper>
        )}

        {carteira.length === 0 ? (
          <VazioText>Você ainda não possui cotas.</VazioText>
        ) : (
          <>
            <Toolbar>
              <ToolbarLeft>
                <span>Itens por página:</span>
                <select
                  value={itensPorPaginaCarteira}
                  onChange={(e) => {
                    setItensPorPaginaCarteira(Number(e.target.value));
                    setPaginaCarteira(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </ToolbarLeft>

              <ToolbarRight>
                <PageButton
                  type="button"
                  onClick={() => setPaginaCarteira((p) => Math.max(1, p - 1))}
                  disabled={paginaCarteira <= 1}
                >
                  Anterior
                </PageButton>

                <PageInfo>
                  Página {paginaCarteira} de {totalPaginasCarteira}
                </PageInfo>

                <PageButton
                  type="button"
                  onClick={() =>
                    setPaginaCarteira((p) => Math.min(totalPaginasCarteira, p + 1))
                  }
                  disabled={paginaCarteira >= totalPaginasCarteira}
                >
                  Próxima
                </PageButton>
              </ToolbarRight>
            </Toolbar>

            <DesktopTableWrap>
              <Tabela>
                <thead>
                  <tr>
                    <th>Clube</th>
                    <th>Cotas</th>
                    <th>Preço Médio</th>
                    <th>Preço Atual</th>
                    <th>Total Investido</th>
                    <th>Valorização (%)</th>
                    <th>Lucro/Prejuízo</th>
                    <th>Valor Atual</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {carteiraPaginada.map((ativo, index) => {
                    const precoAtual = getPrecoAtual(ativo.clubeId);
                    const totalInvestidoAtivo = ativo.quantidade * ativo.precoMedio;
                    const valorAtual = ativo.quantidade * precoAtual;
                    const lucro = valorAtual - totalInvestidoAtivo;
                    const variacaoPerc =
                      totalInvestidoAtivo > 0
                        ? (lucro / totalInvestidoAtivo) * 100
                        : 0;

                    return (
                      <tr key={index}>
                        <td
                          onClick={() => abrirPaginaClube(ativo.clubeId)}
                          style={{
                            cursor: 'pointer',
                            color: '#60a5fa',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Image
                            src={ativo.escudo}
                            alt={`Escudo do ${ativo.nome}`}
                            width={24}
                            height={24}
                            style={{ marginRight: '8px', verticalAlign: 'middle' }}
                          />
                          {ativo.nome}
                        </td>
                        <td>{ativo.quantidade}</td>
                        <td>R$ {ativo.precoMedio.toFixed(2)}</td>
                        <td>R$ {precoAtual.toFixed(2)}</td>
                        <td>R$ {totalInvestidoAtivo.toFixed(2)}</td>
                        <td style={{ color: variacaoPerc >= 0 ? '#22c55e' : '#ef4444' }}>
                          {variacaoPerc.toFixed(2)}%
                        </td>
                        <td style={{ color: lucro >= 0 ? '#22c55e' : '#ef4444' }}>
                          R$ {lucro.toFixed(2)}
                        </td>
                        <td>R$ {valorAtual.toFixed(2)}</td>
                        <td>
                          <BotaoVender onClick={() => abrirModalDeVenda(ativo)}>
                            Negociar
                          </BotaoVender>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Tabela>
            </DesktopTableWrap>

            <MobileLista>
              {carteiraPaginada.map((ativo, index) => {
                const precoAtual = getPrecoAtual(ativo.clubeId);
                const totalInvestidoAtivo = ativo.quantidade * ativo.precoMedio;
                const valorAtual = ativo.quantidade * precoAtual;
                const lucro = valorAtual - totalInvestidoAtivo;
                const variacaoPerc =
                  totalInvestidoAtivo > 0 ? (lucro / totalInvestidoAtivo) * 100 : 0;

                return (
                  <MobileCard key={index}>
                    <MobileTop>
                      <MobileClub
                        onClick={() => abrirPaginaClube(ativo.clubeId)}
                      >
                        <Image
                          src={ativo.escudo}
                          alt={`Escudo do ${ativo.nome}`}
                          width={28}
                          height={28}
                        />
                        <strong>{ativo.nome}</strong>
                      </MobileClub>

                      <BotaoVender onClick={() => abrirModalDeVenda(ativo)}>
                        Negociar
                      </BotaoVender>
                    </MobileTop>

                    <MobileMetrics>
                      <MetricBox>
                        <span>Cotas</span>
                        <strong>{ativo.quantidade}</strong>
                      </MetricBox>

                      <MetricBox>
                        <span>Preço Médio</span>
                        <strong>R$ {ativo.precoMedio.toFixed(2)}</strong>
                      </MetricBox>

                      <MetricBox>
                        <span>Preço Atual</span>
                        <strong>R$ {precoAtual.toFixed(2)}</strong>
                      </MetricBox>

                      <MetricBox>
                        <span>Total Investido</span>
                        <strong>R$ {totalInvestidoAtivo.toFixed(2)}</strong>
                      </MetricBox>

                      <MetricBox>
                        <span>Valorização</span>
                        <strong style={{ color: variacaoPerc >= 0 ? '#22c55e' : '#ef4444' }}>
                          {variacaoPerc.toFixed(2)}%
                        </strong>
                      </MetricBox>

                      <MetricBox>
                        <span>Lucro/Prejuízo</span>
                        <strong style={{ color: lucro >= 0 ? '#22c55e' : '#ef4444' }}>
                          R$ {lucro.toFixed(2)}
                        </strong>
                      </MetricBox>

                      <MetricBoxFull>
                        <span>Valor Atual</span>
                        <strong>R$ {valorAtual.toFixed(2)}</strong>
                      </MetricBoxFull>
                    </MobileMetrics>
                  </MobileCard>
                );
              })}
            </MobileLista>
          </>
        )}

        {historicoOrdenado.length > 0 && (
          <>
            <SectionTitle>Histórico de Transações</SectionTitle>

            <Toolbar>
              <ToolbarLeft>
                <span>Itens por página:</span>
                <select
                  value={itensPorPaginaHistorico}
                  onChange={(e) => {
                    setItensPorPaginaHistorico(Number(e.target.value));
                    setPaginaHistorico(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </ToolbarLeft>

              <ToolbarRight>
                <PageButton
                  type="button"
                  onClick={() => setPaginaHistorico((p) => Math.max(1, p - 1))}
                  disabled={paginaHistorico <= 1}
                >
                  Anterior
                </PageButton>

                <PageInfo>
                  Página {paginaHistorico} de {totalPaginasHistorico}
                </PageInfo>

                <PageButton
                  type="button"
                  onClick={() =>
                    setPaginaHistorico((p) => Math.min(totalPaginasHistorico, p + 1))
                  }
                  disabled={paginaHistorico >= totalPaginasHistorico}
                >
                  Próxima
                </PageButton>
              </ToolbarRight>
            </Toolbar>

            <DesktopTableWrap>
              <Tabela>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Clube</th>
                    <th>Quantidade</th>
                    <th>Valor Unitário</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {historicoPaginado.map((item, index) => (
                    <tr key={index}>
                      <td>{item.data ? new Date(item.data).toLocaleString('pt-BR') : '-'}</td>
                      <td>{item.tipo || '-'}</td>
                      <td>{item.clubeNome || item.nome || '-'}</td>
                      <td>{item.quantidade || '-'}</td>
                      <td>
                        {item.valorUnitario != null
                          ? `R$ ${Number(item.valorUnitario).toFixed(2)}`
                          : '-'}
                      </td>
                      <td>
                        {item.totalPago != null
                          ? `R$ ${Number(item.totalPago).toFixed(2)}`
                          : item.valor != null
                          ? `R$ ${Number(item.valor).toFixed(2)}`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tabela>
            </DesktopTableWrap>

            <MobileLista>
              {historicoPaginado.map((item, index) => (
                <MobileCard key={index}>
                  <MobileTop>
                    <MobileTitle>{item.tipo || '-'}</MobileTitle>
                    <MobileDate>
                      {item.data ? new Date(item.data).toLocaleString('pt-BR') : '-'}
                    </MobileDate>
                  </MobileTop>

                  <MobileMetrics>
                    <MetricBox>
                      <span>Clube</span>
                      <strong>{item.clubeNome || item.nome || '-'}</strong>
                    </MetricBox>

                    <MetricBox>
                      <span>Quantidade</span>
                      <strong>{item.quantidade || '-'}</strong>
                    </MetricBox>

                    <MetricBox>
                      <span>Valor Unitário</span>
                      <strong>
                        {item.valorUnitario != null
                          ? `R$ ${Number(item.valorUnitario).toFixed(2)}`
                          : '-'}
                      </strong>
                    </MetricBox>

                    <MetricBoxFull>
                      <span>Total</span>
                      <strong>
                        {item.totalPago != null
                          ? `R$ ${Number(item.totalPago).toFixed(2)}`
                          : item.valor != null
                          ? `R$ ${Number(item.valor).toFixed(2)}`
                          : '-'}
                      </strong>
                    </MetricBoxFull>
                  </MobileMetrics>
                </MobileCard>
              ))}
            </MobileLista>
          </>
        )}
      </Container>
    </>
  );
}

export default withAuth(CarteiraPage);

function GraficoLinhaCarteira({ pontos }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!pontos || pontos.length === 0) {
    return (
      <p style={{ opacity: 0.7, fontSize: '0.85rem' }}>
        Ainda não há operações suficientes para montar o gráfico.
      </p>
    );
  }

  const width = 900;
  const height = 260;
  const paddingX = 26;
  const paddingY = 18;

  const valores = pontos.map((p) => Number(p.valor || 0));
  const tempos = pontos.map((p) => p.data.getTime());

  const minValor = Math.min(...valores);
  const maxValor = Math.max(...valores);
  const minTime = Math.min(...tempos);
  const maxTime = Math.max(...tempos);

  const rangeValor = maxValor - minValor || 1;
  const rangeTime = maxTime - minTime || 1;

  const firstValor = valores[0] || 0;
  const lastValor = valores[valores.length - 1] || 0;
  const positivo = lastValor >= firstValor;
  const corLinha = positivo ? '#22c55e' : '#ef4444';
  const corGlow = positivo ? 'rgba(34,197,94,0.22)' : 'rgba(239,68,68,0.22)';
  const corAreaTopo = positivo ? 'rgba(34,197,94,0.22)' : 'rgba(239,68,68,0.22)';

  const pontosSvg = pontos.map((p, idx) => {
    const t = p.data.getTime();
    const xNorm = (t - minTime) / rangeTime;
    const yNorm = (Number(p.valor || 0) - minValor) / rangeValor;

    const x = paddingX + xNorm * (width - paddingX * 2);
    const y = height - paddingY - yNorm * (height - paddingY * 2);

    return { x, y, data: p.data, valor: Number(p.valor || 0), idx };
  });

  const pathD = pontosSvg
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');

  const first = pontosSvg[0];
  const last = pontosSvg[pontosSvg.length - 1];
  const activePoint = hoverIndex != null ? pontosSvg[hoverIndex] : last;

  const areaPathD =
    pathD +
    ` L ${last.x.toFixed(2)} ${(height - paddingY).toFixed(2)} L ${first.x.toFixed(
      2
    )} ${(height - paddingY).toFixed(2)} Z`;

  const yTicks = Array.from({ length: 4 }).map((_, i) => {
    const value = minValor + (rangeValor / 3) * i;
    const y =
      height -
      paddingY -
      ((value - minValor) * (height - paddingY * 2)) / rangeValor;

    return { value, y };
  });

  return (
    <GraficoLinhaWrapper>
      <HeroMetric>
        <MetricValue $positivo={positivo}>
          R$ {activePoint.valor.toFixed(2)}
        </MetricValue>
        <MetricMeta>
          <span>
            {activePoint.data.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit',
            })}
          </span>
          <Dot />
          <span>{positivo ? 'P&L positivo' : 'P&L negativo'}</span>
        </MetricMeta>
      </HeroMetric>

      <ChartShell>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          style={{ width: '100%', height: '260px', display: 'block' }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="areaCarteiraGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={corAreaTopo} />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {yTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={tick.y}
                x2={width - paddingX}
                y2={tick.y}
                stroke="rgba(148,163,184,0.10)"
                strokeWidth="1"
                strokeDasharray="4 6"
              />
              <text
                x={width - paddingX}
                y={tick.y - 6}
                textAnchor="end"
                fontSize="11"
                fill="#64748b"
              >
                R$ {tick.value.toFixed(0)}
              </text>
            </g>
          ))}

          <path d={areaPathD} fill="url(#areaCarteiraGradient)" stroke="none" />

          <path
            d={pathD}
            fill="none"
            stroke={corGlow}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            opacity="0.55"
          />

          <path
            d={pathD}
            fill="none"
            stroke={corLinha}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {activePoint && (
            <>
              <line
                x1={activePoint.x}
                y1={paddingY}
                x2={activePoint.x}
                y2={height - paddingY}
                stroke="rgba(148,163,184,0.25)"
                strokeWidth="1"
                strokeDasharray="5 5"
              />
              <circle cx={activePoint.x} cy={activePoint.y} r={5.5} fill={corLinha} />
              <circle cx={activePoint.x} cy={activePoint.y} r={11} fill={corLinha} opacity="0.12" />
            </>
          )}

          {pontosSvg.map((p) => (
            <circle
              key={p.idx}
              cx={p.x}
              cy={p.y}
              r="10"
              fill="transparent"
              onMouseEnter={() => setHoverIndex(p.idx)}
            />
          ))}
        </svg>

        {activePoint && (
          <HoverCard
            style={{
              left: `${Math.min(84, Math.max(8, (activePoint.x / width) * 100))}%`,
            }}
          >
            <strong>Posição da carteira</strong>
            <span>R$ {activePoint.valor.toFixed(2)}</span>
            <small>
              {activePoint.data.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </small>
          </HoverCard>
        )}
      </ChartShell>

      <InfoLinha>
        <span>
          Início:{' '}
          {first.data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          })}
        </span>
        <span>
          Atual:{' '}
          {last.data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          })}{' '}
          • R$ {last.valor.toFixed(2)}
        </span>
      </InfoLinha>
    </GraficoLinhaWrapper>
  );
}

const Container = styled.div`
  padding: 24px;
  color: white;

  @media (max-width: 900px) {
    padding: 14px 10px 18px;
  }
`;

const Titulo = styled.h1`
  margin: 0 0 1rem;
  font-size: 2rem;

  @media (max-width: 900px) {
    font-size: 1.55rem;
  }
`;

const ResumoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const ResumoCard = styled.div`
  background-color: #1e293b;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.12);
`;

const LabelResumo = styled.div`
  color: #94a3b8;
  font-size: 0.82rem;
  margin-bottom: 8px;
`;

const ValorPrincipal = styled.div`
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 900;
`;

const ValorSecundario = styled.div`
  color: ${({ $positivo }) =>
    $positivo === undefined ? '#ffffff' : $positivo ? '#22c55e' : '#ef4444'};
  font-size: 1.05rem;
  font-weight: 800;
`;

const GraficosWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const GraficoCard = styled.div`
  background-color: #0f172a;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #1f2937;

  h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
    color: #e5e7eb;
  }

  @media (max-width: 520px) {
    padding: 0.85rem;
  }
`;

const RangeSelector = styled.div`
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
`;

const RangeButton = styled.button`
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  border: 1px solid ${({ ativo }) => (ativo ? '#22c55e' : '#1f2937')};
  background-color: ${({ ativo }) => (ativo ? '#16a34a' : '#020617')};
  color: #e5e7eb;
  font-size: 0.75rem;
  cursor: pointer;

  &:hover {
    background-color: #15803d;
  }
`;

const HeroMetric = styled.div`
  margin-bottom: 0.8rem;
`;

const MetricValue = styled.div`
  color: ${({ $positivo }) => ($positivo ? '#86efac' : '#fca5a5')};
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1;
`;

const MetricMeta = styled.div`
  margin-top: 0.32rem;
  color: #94a3b8;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const Dot = styled.span`
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: #475569;
`;

const ChartShell = styled.div`
  position: relative;
  border-radius: 18px;
  padding: 12px 10px 6px;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.03),
    rgba(255,255,255,0.015)
  );
  border: 1px solid rgba(148,163,184,0.10);
`;

const HoverCard = styled.div`
  position: absolute;
  top: 14px;
  transform: translateX(-50%);
  min-width: 170px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(15,23,42,0.96);
  border: 1px solid rgba(148,163,184,0.14);
  box-shadow: 0 14px 30px rgba(0,0,0,0.28);
  pointer-events: none;

  strong {
    display: block;
    color: #f8fafc;
    font-size: 0.8rem;
    margin-bottom: 3px;
  }

  span {
    display: block;
    color: #e5e7eb;
    font-weight: 800;
    margin-bottom: 4px;
  }

  small {
    color: #94a3b8;
    font-size: 0.72rem;
  }
`;

const GraficoLinhaWrapper = styled.div`
  width: 100%;
`;

const InfoLinha = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  margin-top: 0.4rem;
  color: #9ca3af;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.2rem;
  }
`;

const PizzaWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 680px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Pizza = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 999px;
  background-color: #1f2937;
  border: 4px solid #111827;
  box-shadow: 0 0 0 1px #111827;
  flex: 0 0 auto;

  @media (max-width: 520px) {
    width: 120px;
    height: 120px;
  }
`;

const Legenda = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
  width: 100%;
`;

const LegendaItem = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;

  span:last-child {
    text-align: right;
  }

  @media (max-width: 520px) {
    grid-template-columns: auto 1fr;
    gap: 0.35rem;

    span:last-child {
      grid-column: 2;
      text-align: left;
      font-size: 0.78rem;
      color: #94a3b8;
    }
  }
`;

const CorDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 8px 0 12px;
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  span {
    opacity: 0.9;
  }

  select {
    padding: 6px 10px;
    border-radius: 8px;
    background: #0b1220;
    color: #e5e7eb;
    border: 1px solid rgba(255,255,255,0.12);
  }
`;

const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const PageButton = styled.button`
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.12);
  background: transparent;
  color: #e5e7eb;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const PageInfo = styled.span`
  opacity: 0.9;
`;

const DesktopTableWrap = styled.div`
  overflow-x: auto;

  @media (max-width: 900px) {
    display: none;
  }
`;

const MobileLista = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: grid;
    gap: 12px;
  }
`;

const MobileCard = styled.div`
  background-color: #1e293b;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 14px;
  padding: 12px;
`;

const MobileTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
`;

const MobileClub = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #60a5fa;
  cursor: pointer;

  strong {
    color: #fff;
    font-size: 0.98rem;
  }
`;

const MobileTitle = styled.div`
  color: #fff;
  font-weight: 800;
  font-size: 0.95rem;
`;

const MobileDate = styled.div`
  color: #94a3b8;
  font-size: 0.8rem;
  text-align: right;
`;

const MobileMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const MetricBox = styled.div`
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(148,163,184,0.08);
  border-radius: 10px;
  padding: 10px;

  span {
    display: block;
    font-size: 0.72rem;
    color: #94a3b8;
    margin-bottom: 6px;
  }

  strong {
    color: #e2e8f0;
    font-size: 0.88rem;
    word-break: break-word;
  }
`;

const MetricBoxFull = styled(MetricBox)`
  grid-column: 1 / -1;
`;

const VazioText = styled.p`
  color: #94a3b8;
`;

const Tabela = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 0.95rem;
  background-color: #1e293b;

  th,
  td {
    padding: 0.75rem;
    text-align: left;
  }

  th {
    background-color: #0f172a;
    color: #94a3b8;
    text-transform: uppercase;
    font-size: 0.85rem;
  }

  tr {
    border-bottom: 1px solid #334155;
  }

  tr:hover {
    background-color: #0f172a;
  }
`;

const BotaoVender = styled.button`
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.48rem 0.85rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.84rem;
  white-space: nowrap;

  &:hover {
    background-color: #2563eb;
  }
`;

const SectionTitle = styled.h2`
  margin: 1.8rem 0 0.8rem;
  font-size: 1.2rem;
  color: #fff;
`;

const Erro = styled.p`
  color: #f87171;
  margin-top: 1rem;
`;