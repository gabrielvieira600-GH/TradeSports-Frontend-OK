import { useEffect, useMemo, useState } from "react";

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL;
}

function getToken() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  return token && token !== "undefined" ? token : null;
}

async function apiFetch(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${getApiBase()}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.erro || data?.message || `HTTP ${response.status}`);
  }
  return data;
}

const statusLabels = {
  rascunho: "Rascunho",
  ativa: "Ativa",
  encerrada: "Encerrada",
  cancelada: "Cancelada",
  agendada: "Agendada",
  aberta: "Aberta",
};

const statusColors = {
  rascunho: ["#cbd5e1", "rgba(148,163,184,.13)"],
  ativa: ["#86efac", "rgba(34,197,94,.13)"],
  aberta: ["#86efac", "rgba(34,197,94,.13)"],
  agendada: ["#93c5fd", "rgba(59,130,246,.13)"],
  encerrada: ["#c4b5fd", "rgba(139,92,246,.13)"],
  cancelada: ["#fca5a5", "rgba(239,68,68,.13)"],
};

function formatDate(value) {
  if (!value) return "Não definida";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Não definida"
    : date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function toIsoOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export default function AdminPainel() {
  const [status, setStatus] = useState(null);
  const [temporadas, setTemporadas] = useState([]);
  const [temporadaSelecionadaId, setTemporadaSelecionadaId] = useState("");
  const [rodadas, setRodadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [rodadaDividendos, setRodadaDividendos] = useState("");
  const [clubes, setClubes] = useState([]);
  const [clubeIdSplit, setClubeIdSplit] = useState("");
  const [ratioSplit, setRatioSplit] = useState("2");
  const [novaTemporada, setNovaTemporada] = useState({
    codigo: "",
    nome: "",
    descricao: "",
    capitalInicial: "1000",
    limiteOrdensLiteSemanal: "15",
    inicioPrevisto: "",
    fimPrevisto: "",
  });
  const [novaRodada, setNovaRodada] = useState({
    numero: "",
    nome: "",
    inicioPrevisto: "",
    fimPrevisto: "",
    observacoes: "",
  });

  const base = useMemo(() => getApiBase(), []);
  const temporadaSelecionada = useMemo(
    () =>
      temporadas.find(
        (item) => String(item._id) === String(temporadaSelecionadaId),
      ) || null,
    [temporadas, temporadaSelecionadaId],
  );
  const temporadaAtiva = useMemo(
    () => temporadas.find((item) => item.status === "ativa") || null,
    [temporadas],
  );
  const rodadaAberta = useMemo(
    () => rodadas.find((item) => item.status === "aberta") || null,
    [rodadas],
  );

  function notify(text, type = "info") {
    setMsg(text);
    setMsgType(type);
  }

  async function carregarStatus({ silent = false } = {}) {
    try {
      const data = await apiFetch("/api/admin/status");
      setStatus(data);
      if (!silent) notify("Status atualizado.", "success");
    } catch (error) {
      notify(`Erro: ${error.message}`, "error");
    }
  }

  async function carregarTemporadas({ manterSelecao = true } = {}) {
    const data = await apiFetch("/api/admin/temporadas");
    const lista = Array.isArray(data?.temporadas) ? data.temporadas : [];
    setTemporadas(lista);
    setTemporadaSelecionadaId((atual) => {
      if (
        manterSelecao &&
        lista.some((item) => String(item._id) === String(atual))
      )
        return atual;
      const preferida =
        lista.find((item) => item.status === "ativa") || lista[0];
      return preferida ? String(preferida._id) : "";
    });
  }

  async function carregarRodadas(temporadaId) {
    if (!temporadaId) {
      setRodadas([]);
      return;
    }
    try {
      const data = await apiFetch(
        `/api/admin/temporadas/${temporadaId}/rodadas`,
      );
      setRodadas(Array.isArray(data?.rodadas) ? data.rodadas : []);
    } catch (error) {
      setRodadas([]);
      notify(`Erro: ${error.message}`, "error");
    }
  }

  async function carregarClubes() {
    try {
      const data = await apiFetch("/clube/clubes");
      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data?.clubes)
          ? data.clubes
          : [];
      setClubes(lista);
      setClubeIdSplit(
        (atual) => atual || (lista[0] ? String(lista[0].id) : ""),
      );
    } catch (error) {
      console.error("Erro ao carregar clubes:", error);
    }
  }

  async function executarAcao(action, successMessage) {
    setLoading(true);
    setMsg("");
    try {
      await action();
      notify(successMessage, "success");
      await Promise.all([
        carregarTemporadas(),
        carregarStatus({ silent: true }),
      ]);
      if (temporadaSelecionadaId) await carregarRodadas(temporadaSelecionadaId);
    } catch (error) {
      notify(`Erro: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  }

  async function criarTemporada(event) {
    event.preventDefault();
    if (!novaTemporada.codigo.trim() || !novaTemporada.nome.trim()) {
      notify("Informe o código e o nome da temporada.", "error");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const data = await apiFetch("/api/admin/temporadas", {
        method: "POST",
        body: {
          codigo: novaTemporada.codigo.trim(),
          nome: novaTemporada.nome.trim(),
          descricao: novaTemporada.descricao.trim(),
          capitalInicial: Number(novaTemporada.capitalInicial),
          limiteOrdensLiteSemanal: Number(
            novaTemporada.limiteOrdensLiteSemanal,
          ),
          inicioPrevisto: toIsoOrNull(novaTemporada.inicioPrevisto),
          fimPrevisto: toIsoOrNull(novaTemporada.fimPrevisto),
        },
      });
      setNovaTemporada({
        codigo: "",
        nome: "",
        descricao: "",
        capitalInicial: "1000",
        limiteOrdensLiteSemanal: "15",
        inicioPrevisto: "",
        fimPrevisto: "",
      });
      await carregarTemporadas({ manterSelecao: false });
      if (data?.temporada?._id)
        setTemporadaSelecionadaId(String(data.temporada._id));
      notify("Temporada criada em rascunho.", "success");
    } catch (error) {
      notify(`Erro: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  }

  function acaoTemporada(tipo) {
    if (!temporadaSelecionada) return;
    const verbos = {
      iniciar: "iniciar",
      encerrar: "encerrar definitivamente",
      cancelar: "cancelar",
    };
    if (
      !window.confirm(
        `Confirma ${verbos[tipo]} a temporada “${temporadaSelecionada.nome}”?`,
      )
    )
      return;
    executarAcao(
      () =>
        apiFetch(`/api/admin/temporadas/${temporadaSelecionada._id}/${tipo}`, {
          method: "POST",
        }),
      `Temporada ${tipo === "iniciar" ? "iniciada" : tipo === "encerrar" ? "encerrada" : "cancelada"} com sucesso.`,
    );
  }

  async function criarRodada(event) {
    event.preventDefault();
    if (!temporadaSelecionada) return;
    const numero = Number(novaRodada.numero);
    if (!Number.isInteger(numero) || numero < 1) {
      notify("Informe um número de rodada inteiro maior que zero.", "error");
      return;
    }
    await executarAcao(async () => {
      await apiFetch(
        `/api/admin/temporadas/${temporadaSelecionada._id}/rodadas`,
        {
          method: "POST",
          body: {
            numero,
            nome: novaRodada.nome.trim(),
            inicioPrevisto: toIsoOrNull(novaRodada.inicioPrevisto),
            fimPrevisto: toIsoOrNull(novaRodada.fimPrevisto),
            observacoes: novaRodada.observacoes.trim(),
          },
        },
      );
      setNovaRodada({
        numero: "",
        nome: "",
        inicioPrevisto: "",
        fimPrevisto: "",
        observacoes: "",
      });
      await carregarRodadas(temporadaSelecionada._id);
    }, `Rodada ${numero} criada como agendada.`);
  }

  function acaoRodada(rodadaItem, tipo) {
    const verbos = {
      abrir: "abrir",
      encerrar: "encerrar definitivamente",
      cancelar: "cancelar",
    };
    if (
      !window.confirm(`Confirma ${verbos[tipo]} a rodada ${rodadaItem.numero}?`)
    )
      return;
    executarAcao(
      async () => {
        await apiFetch(`/api/admin/rodadas/${rodadaItem._id}/${tipo}`, {
          method: "POST",
        });
        await carregarRodadas(temporadaSelecionadaId);
      },
      `Rodada ${rodadaItem.numero} ${tipo === "abrir" ? "aberta" : tipo === "encerrar" ? "encerrada" : "cancelada"} com sucesso.`,
    );
  }

  async function dispararDividendos() {
    if (
      !window.confirm(
        `Confirma o disparo de dividendos${rodadaDividendos ? ` para a rodada ${rodadaDividendos}` : ""}?`,
      )
    )
      return;
    await executarAcao(async () => {
      const body = rodadaDividendos ? { rodada: Number(rodadaDividendos) } : {};
      await apiFetch("/api/admin/dividendos/disparar", {
        method: "POST",
        body,
      });
    }, "Dividendos processados com sucesso.");
  }

  async function dispararLiquidacao() {
    if (
      !window.confirm("Confirma o disparo manual da liquidação do campeonato?")
    )
      return;
    await executarAcao(
      () => apiFetch("/api/admin/liquidacao/disparar", { method: "POST" }),
      "Liquidação disparada com sucesso.",
    );
  }

  async function executarSplit() {
    const clubeId = Number(clubeIdSplit);
    const ratio = Number(ratioSplit);
    if (!clubeId || !ratio || ratio <= 1)
      return notify("Selecione um clube e um fator válido.", "error");
    const clube = clubes.find((item) => String(item.id) === String(clubeId));
    if (
      !window.confirm(
        `Confirma o split ${ratio}:1 em ${clube?.nome || `clube ${clubeId}`}?\n\nPreço, ordens, carteiras e histórico serão ajustados.`,
      )
    )
      return;
    await executarAcao(
      () =>
        apiFetch("/api/admin/split", {
          method: "POST",
          body: { clubeId, ratio },
        }),
      `Split ${ratio}:1 executado em ${clube?.nome || clubeId}.`,
    );
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([
      carregarStatus({ silent: true }),
      carregarTemporadas({ manterSelecao: false }),
      carregarClubes(),
    ])
      .catch((error) => notify(`Erro: ${error.message}`, "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    carregarRodadas(temporadaSelecionadaId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temporadaSelecionadaId]);

  const counts = status?.counts || {};

  return (
    <div style={styles.page}>
      <header style={styles.hero}>
        <div>
          <div style={styles.kicker}>Painel administrativo</div>
          <h1 style={styles.title}>Operação da TradeSports</h1>
          <p style={styles.subtitle}>
            Gerencie o ciclo de temporadas e rodadas e mantenha as ferramentas
            operacionais em um único lugar.
          </p>
        </div>
        <div style={styles.apiBadge}>
          <span style={styles.apiLabel}>API conectada</span>
          <span style={styles.apiValue}>{base || "Não configurada"}</span>
        </div>
      </header>

      <div style={styles.metricsGrid}>
        <MetricCard title="Usuários" value={counts.usuarios ?? 0} />
        <MetricCard title="Clubes" value={counts.clubes ?? 0} />
        <MetricCard title="Investimentos" value={counts.investimentos ?? 0} />
        <MetricCard title="Dividendos" value={counts.dividendos ?? 0} />
      </div>

      {msg && (
        <div
          style={{
            ...styles.alert,
            ...(msgType === "success"
              ? styles.alertSuccess
              : msgType === "error"
                ? styles.alertError
                : styles.alertInfo),
          }}
        >
          {msg}
        </div>
      )}

      <section style={styles.currentGrid}>
        <CurrentCard
          label="Temporada ativa"
          title={temporadaAtiva?.nome || "Nenhuma temporada ativa"}
          status={temporadaAtiva?.status}
          detail={
            temporadaAtiva
              ? `${temporadaAtiva.codigo} • rodada atual ${temporadaAtiva.rodadaAtual || 0}`
              : "Inicie uma temporada em rascunho."
          }
        />
        <CurrentCard
          label="Rodada da seleção"
          title={
            rodadaAberta
              ? `Rodada ${rodadaAberta.numero}`
              : "Nenhuma rodada aberta"
          }
          status={rodadaAberta?.status}
          detail={
            rodadaAberta
              ? "Rodada esportiva em andamento."
              : "Abra uma rodada agendada da temporada selecionada."
          }
        />
      </section>

      <section style={styles.card}>
        <SectionHeader
          title="Temporadas"
          text="Crie a temporada como rascunho, revise os parâmetros e só então inicie a operação."
        />
        <form onSubmit={criarTemporada} style={styles.formGrid}>
          <Field
            label="Código *"
            value={novaTemporada.codigo}
            onChange={(v) => setNovaTemporada((s) => ({ ...s, codigo: v }))}
            placeholder="brasileirao-2026"
          />
          <Field
            label="Nome *"
            value={novaTemporada.nome}
            onChange={(v) => setNovaTemporada((s) => ({ ...s, nome: v }))}
            placeholder="Brasileirão 2026"
          />
          <Field
            label="Capital inicial"
            type="number"
            min="0"
            value={novaTemporada.capitalInicial}
            onChange={(v) =>
              setNovaTemporada((s) => ({ ...s, capitalInicial: v }))
            }
          />
          <Field
            label="Limite semanal de ordens — Plano Lite"
            type="number"
            min="1"
            value={novaTemporada.limiteOrdensLiteSemanal}
            onChange={(v) =>
              setNovaTemporada((s) => ({ ...s, limiteOrdensLiteSemanal: v }))
            }
          />
          <Field
            label="Início previsto"
            type="datetime-local"
            value={novaTemporada.inicioPrevisto}
            onChange={(v) =>
              setNovaTemporada((s) => ({ ...s, inicioPrevisto: v }))
            }
          />
          <Field
            label="Fim previsto"
            type="datetime-local"
            value={novaTemporada.fimPrevisto}
            onChange={(v) =>
              setNovaTemporada((s) => ({ ...s, fimPrevisto: v }))
            }
          />
          <Field
            label="Descrição"
            value={novaTemporada.descricao}
            onChange={(v) => setNovaTemporada((s) => ({ ...s, descricao: v }))}
            placeholder="Competição e regras desta temporada"
          />
          <div style={styles.buttonAlign}>
            <button
              type="submit"
              style={styles.primaryButton}
              disabled={loading}
            >
              Criar temporada
            </button>
          </div>
        </form>

        <div style={styles.divider} />
        <div style={styles.selectorRow}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Temporada selecionada</label>
            <select
              style={styles.select}
              value={temporadaSelecionadaId}
              onChange={(e) => setTemporadaSelecionadaId(e.target.value)}
              disabled={loading || !temporadas.length}
            >
              {!temporadas.length && (
                <option value="">Nenhuma temporada cadastrada</option>
              )}
              {temporadas.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.nome} — {statusLabels[item.status] || item.status}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => carregarTemporadas()}
            disabled={loading}
          >
            Atualizar lista
          </button>
        </div>

        {temporadaSelecionada && (
          <div style={styles.detailBox}>
            <div style={styles.detailTop}>
              <div>
                <h3 style={styles.detailTitle}>{temporadaSelecionada.nome}</h3>
                <div style={styles.muted}>{temporadaSelecionada.codigo}</div>
              </div>
              <StatusBadge status={temporadaSelecionada.status} />
            </div>
            <div style={styles.detailGrid}>
              <Detail
                label="Capital inicial"
                value={`R$ ${Number(temporadaSelecionada.capitalInicial || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              />
              <Detail
                label="Limite do Plano Lite"
                value={`${temporadaSelecionada.limiteOrdensLiteSemanal ?? temporadaSelecionada.limiteOrdensLitePorRodada ?? 15} por semana`}
              />
              <Detail
                label="Início previsto"
                value={formatDate(temporadaSelecionada.inicioPrevisto)}
              />
              <Detail
                label="Fim previsto"
                value={formatDate(temporadaSelecionada.fimPrevisto)}
              />
            </div>
            <div style={styles.actionRow}>
              {temporadaSelecionada.status === "rascunho" && (
                <button
                  style={styles.successButton}
                  disabled={loading || Boolean(temporadaAtiva)}
                  onClick={() => acaoTemporada("iniciar")}
                >
                  Iniciar temporada
                </button>
              )}
              {temporadaSelecionada.status === "ativa" && (
                <button
                  style={styles.warningButton}
                  disabled={loading || Boolean(rodadaAberta)}
                  onClick={() => acaoTemporada("encerrar")}
                >
                  Encerrar temporada
                </button>
              )}
              {["rascunho", "ativa"].includes(temporadaSelecionada.status) && (
                <button
                  style={styles.dangerButton}
                  disabled={loading || Boolean(rodadaAberta)}
                  onClick={() => acaoTemporada("cancelar")}
                >
                  Cancelar temporada
                </button>
              )}
            </div>
            {temporadaSelecionada.status === "ativa" && rodadaAberta && (
              <p style={styles.helper}>
                Encerre ou cancele a rodada aberta antes de encerrar ou cancelar
                esta temporada.
              </p>
            )}
          </div>
        )}
      </section>

      <section style={styles.card}>
        <SectionHeader
          title="Rodadas"
          text="Cadastre as rodadas conforme o calendário de cada campeonato ou esporte. Não existe quantidade total predefinida; apenas uma rodada pode permanecer aberta por temporada."
        />
        {!temporadaSelecionada ? (
          <p style={styles.empty}>
            Crie ou selecione uma temporada para gerenciar rodadas.
          </p>
        ) : (
          <>
            <form onSubmit={criarRodada} style={styles.formGrid}>
              <Field
                label="Número *"
                type="number"
                min="1"
                value={novaRodada.numero}
                onChange={(v) => setNovaRodada((s) => ({ ...s, numero: v }))}
              />
              <Field
                label="Nome opcional"
                value={novaRodada.nome}
                onChange={(v) => setNovaRodada((s) => ({ ...s, nome: v }))}
                placeholder="Rodada de abertura"
              />
              <Field
                label="Início previsto"
                type="datetime-local"
                value={novaRodada.inicioPrevisto}
                onChange={(v) =>
                  setNovaRodada((s) => ({ ...s, inicioPrevisto: v }))
                }
              />
              <Field
                label="Fim previsto"
                type="datetime-local"
                value={novaRodada.fimPrevisto}
                onChange={(v) =>
                  setNovaRodada((s) => ({ ...s, fimPrevisto: v }))
                }
              />
              <Field
                label="Observações"
                value={novaRodada.observacoes}
                onChange={(v) =>
                  setNovaRodada((s) => ({ ...s, observacoes: v }))
                }
              />
              <div style={styles.buttonAlign}>
                <button
                  type="submit"
                  style={styles.primaryButton}
                  disabled={
                    loading ||
                    ["encerrada", "cancelada"].includes(
                      temporadaSelecionada.status,
                    )
                  }
                >
                  Criar rodada
                </button>
              </div>
            </form>
            <div style={styles.roundList}>
              {!rodadas.length && (
                <p style={styles.empty}>
                  Nenhuma rodada criada nesta temporada.
                </p>
              )}
              {rodadas.map((item) => (
                <div key={item._id} style={styles.roundCard}>
                  <div style={styles.roundMain}>
                    <div>
                      <strong style={styles.roundTitle}>
                        Rodada {item.numero}
                        {item.nome ? ` — ${item.nome}` : ""}
                      </strong>
                      <div style={styles.muted}>
                        {formatDate(item.inicioPrevisto)}
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div style={styles.actionRow}>
                    {item.status === "agendada" && (
                      <button
                        style={styles.successButton}
                        disabled={
                          loading ||
                          temporadaSelecionada.status !== "ativa" ||
                          Boolean(rodadaAberta)
                        }
                        onClick={() => acaoRodada(item, "abrir")}
                      >
                        Abrir rodada
                      </button>
                    )}
                    {item.status === "aberta" && (
                      <button
                        style={styles.warningButton}
                        disabled={loading}
                        onClick={() => acaoRodada(item, "encerrar")}
                      >
                        Encerrar rodada
                      </button>
                    )}
                    {["agendada", "aberta"].includes(item.status) && (
                      <button
                        style={styles.dangerButton}
                        disabled={loading}
                        onClick={() => acaoRodada(item, "cancelar")}
                      >
                        Cancelar rodada
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section style={styles.card}>
        <SectionHeader
          title="Ferramentas operacionais"
          text="Ações manuais separadas do ciclo de temporada. Todas exigem confirmação."
        />
        <div style={styles.toolsGrid}>
          <ToolBox
            title="Dividendos"
            text="Processa dividendos para a rodada informada; em branco, usa a regra do backend."
          >
            <Field
              label="Rodada"
              type="number"
              min="1"
              value={rodadaDividendos}
              onChange={setRodadaDividendos}
              placeholder="Ex.: 12"
            />
            <button
              style={styles.secondaryButton}
              onClick={dispararDividendos}
              disabled={loading}
            >
              Disparar dividendos
            </button>
          </ToolBox>
          <ToolBox
            title="Liquidação"
            text="Executa manualmente a liquidação do Campeonato Brasileiro."
          >
            <button
              style={styles.warningButton}
              onClick={dispararLiquidacao}
              disabled={loading}
            >
              Disparar liquidação
            </button>
          </ToolBox>
          <ToolBox
            title="Split de cotas"
            text="Ajusta preço, ordens, carteiras e histórico sem alterar o patrimônio."
          >
            <div>
              <label style={styles.label}>Clube</label>
              <select
                value={clubeIdSplit}
                onChange={(e) => setClubeIdSplit(e.target.value)}
                style={styles.select}
                disabled={loading}
              >
                {clubes.map((clube) => (
                  <option key={clube.id} value={clube.id}>
                    {clube.nome} (ID {clube.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={styles.label}>Fator</label>
              <select
                value={ratioSplit}
                onChange={(e) => setRatioSplit(e.target.value)}
                style={styles.select}
                disabled={loading}
              >
                {[2, 3, 4, 5, 10].map((ratio) => (
                  <option key={ratio} value={ratio}>
                    {ratio}:1
                  </option>
                ))}
              </select>
            </div>
            <button
              style={styles.secondaryButton}
              onClick={executarSplit}
              disabled={loading || !clubeIdSplit}
            >
              Executar split
            </button>
          </ToolBox>
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.headerWithButton}>
          <SectionHeader
            title="Status técnico"
            text="Contagens e eventos recentes retornados pela API administrativa."
          />
          <button
            style={styles.secondaryButton}
            onClick={() => carregarStatus()}
            disabled={loading}
          >
            Recarregar
          </button>
        </div>
        <div style={styles.statusBox}>
          <pre style={styles.pre}>
            {status ? JSON.stringify(status, null, 2) : "Carregando..."}
          </pre>
        </div>
      </section>
      <p style={styles.footerNote}>
        Acesso protegido por token de administrador. O backend continua sendo a
        autoridade final sobre transições e bloqueios.
      </p>
    </div>
  );
}

function SectionHeader({ title, text }) {
  return (
    <div style={styles.cardHeader}>
      <h2 style={styles.cardTitle}>{title}</h2>
      <p style={styles.cardText}>{text}</p>
    </div>
  );
}
function MetricCard({ title, value }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricTitle}>{title}</div>
      <div style={styles.metricValue}>{value}</div>
    </div>
  );
}
function CurrentCard({ label, title, status, detail }) {
  return (
    <div style={styles.currentCard}>
      <div style={styles.currentTop}>
        <span style={styles.apiLabel}>{label}</span>
        {status && <StatusBadge status={status} />}
      </div>
      <div style={styles.currentTitle}>{title}</div>
      <div style={styles.muted}>{detail}</div>
    </div>
  );
}
function StatusBadge({ status }) {
  const palette = statusColors[status] || ["#cbd5e1", "rgba(148,163,184,.13)"];
  return (
    <span
      style={{ ...styles.badge, color: palette[0], background: palette[1] }}
    >
      {statusLabels[status] || status}
    </span>
  );
}
function Detail({ label, value }) {
  return (
    <div>
      <div style={styles.detailLabel}>{label}</div>
      <div style={styles.detailValue}>{value}</div>
    </div>
  );
}
function Field({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  min,
}) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  );
}
function ToolBox({ title, text, children }) {
  return (
    <div style={styles.toolBox}>
      <h3 style={styles.toolTitle}>{title}</h3>
      <p style={styles.toolText}>{text}</p>
      <div style={styles.toolActions}>{children}</div>
    </div>
  );
}

const buttonBase = {
  borderRadius: "12px",
  padding: "12px 16px",
  fontWeight: 800,
  cursor: "pointer",
};
const styles = {
  page: {
    padding: "28px",
    maxWidth: "1180px",
    margin: "0 auto",
    color: "#f8fafc",
  },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  kicker: {
    fontSize: ".78rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".08em",
    color: "#00ff95",
    marginBottom: "8px",
  },
  title: { margin: 0, fontSize: "2rem", lineHeight: 1.05 },
  subtitle: {
    margin: "10px 0 0",
    color: "#94a3b8",
    maxWidth: "720px",
    lineHeight: 1.6,
  },
  apiBadge: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "14px 16px",
    borderRadius: "14px",
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(148,163,184,.14)",
    maxWidth: "360px",
  },
  apiLabel: {
    fontSize: ".72rem",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: ".06em",
    fontWeight: 800,
  },
  apiValue: { color: "#cbd5e1", fontSize: ".8rem", overflowWrap: "anywhere" },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "14px",
    marginBottom: "18px",
  },
  metricCard: {
    borderRadius: "18px",
    padding: "16px 18px",
    background: "linear-gradient(180deg,rgba(15,23,42,.96),rgba(11,19,36,.96))",
    border: "1px solid rgba(148,163,184,.12)",
  },
  metricTitle: { fontSize: ".8rem", color: "#94a3b8", marginBottom: "8px" },
  metricValue: { fontSize: "1.65rem", fontWeight: 900 },
  alert: {
    padding: "14px 16px",
    borderRadius: "14px",
    marginBottom: "18px",
    fontWeight: 600,
  },
  alertSuccess: {
    background: "rgba(34,197,94,.12)",
    border: "1px solid rgba(34,197,94,.22)",
    color: "#bbf7d0",
  },
  alertError: {
    background: "rgba(239,68,68,.12)",
    border: "1px solid rgba(239,68,68,.22)",
    color: "#fecaca",
  },
  alertInfo: {
    background: "rgba(59,130,246,.12)",
    border: "1px solid rgba(59,130,246,.22)",
    color: "#dbeafe",
  },
  currentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: "18px",
    marginBottom: "18px",
  },
  currentCard: {
    borderRadius: "20px",
    padding: "20px",
    background: "linear-gradient(135deg,rgba(8,26,50,.98),rgba(12,32,55,.96))",
    border: "1px solid rgba(0,255,149,.13)",
  },
  currentTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "14px",
  },
  currentTitle: { fontSize: "1.25rem", fontWeight: 900, marginBottom: "6px" },
  card: {
    borderRadius: "20px",
    padding: "20px",
    marginBottom: "18px",
    background: "linear-gradient(180deg,rgba(15,23,42,.96),rgba(11,19,36,.96))",
    border: "1px solid rgba(148,163,184,.12)",
    boxShadow: "0 18px 42px rgba(0,0,0,.18)",
  },
  cardHeader: { marginBottom: "16px" },
  cardTitle: { margin: 0, fontSize: "1.15rem" },
  cardText: {
    margin: "8px 0 0",
    color: "#94a3b8",
    lineHeight: 1.55,
    fontSize: ".92rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(205px,1fr))",
    gap: "14px",
    alignItems: "end",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: ".84rem",
    color: "#cbd5e1",
    fontWeight: 700,
  },
  input: {
    boxSizing: "border-box",
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(148,163,184,.16)",
    background: "rgba(255,255,255,.04)",
    color: "#f8fafc",
    outline: "none",
    colorScheme: "dark",
  },
  select: {
    boxSizing: "border-box",
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(148,163,184,.16)",
    background: "#101a2e",
    color: "#f8fafc",
    outline: "none",
  },
  buttonAlign: { display: "flex", alignItems: "end" },
  primaryButton: {
    ...buttonBase,
    background: "linear-gradient(180deg,#3b82f6,#2563eb)",
    color: "#fff",
    border: 0,
  },
  secondaryButton: {
    ...buttonBase,
    background: "rgba(255,255,255,.05)",
    color: "#f8fafc",
    border: "1px solid rgba(148,163,184,.16)",
  },
  successButton: {
    ...buttonBase,
    background: "rgba(34,197,94,.14)",
    color: "#bbf7d0",
    border: "1px solid rgba(34,197,94,.25)",
  },
  warningButton: {
    ...buttonBase,
    background: "rgba(245,158,11,.13)",
    color: "#fde68a",
    border: "1px solid rgba(245,158,11,.24)",
  },
  dangerButton: {
    ...buttonBase,
    background: "rgba(239,68,68,.12)",
    color: "#fecaca",
    border: "1px solid rgba(239,68,68,.22)",
  },
  divider: {
    height: "1px",
    background: "rgba(148,163,184,.12)",
    margin: "22px 0",
  },
  selectorRow: {
    display: "flex",
    gap: "12px",
    alignItems: "end",
    flexWrap: "wrap",
  },
  detailBox: {
    marginTop: "18px",
    borderRadius: "16px",
    padding: "18px",
    background: "rgba(0,0,0,.18)",
    border: "1px solid rgba(148,163,184,.1)",
  },
  detailTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    gap: "12px",
    marginBottom: "16px",
  },
  detailTitle: { margin: 0, fontSize: "1.1rem" },
  muted: { color: "#94a3b8", fontSize: ".84rem", lineHeight: 1.5 },
  badge: {
    display: "inline-flex",
    borderRadius: "999px",
    padding: "6px 10px",
    fontWeight: 800,
    fontSize: ".75rem",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
    gap: "14px",
  },
  detailLabel: { color: "#64748b", fontSize: ".75rem", marginBottom: "4px" },
  detailValue: { color: "#e2e8f0", fontWeight: 700, fontSize: ".9rem" },
  actionRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "16px",
  },
  helper: { color: "#fbbf24", fontSize: ".82rem", margin: "12px 0 0" },
  roundList: { display: "grid", gap: "12px", marginTop: "20px" },
  roundCard: {
    padding: "16px",
    borderRadius: "15px",
    background: "rgba(0,0,0,.18)",
    border: "1px solid rgba(148,163,184,.1)",
  },
  roundMain: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    gap: "12px",
  },
  roundTitle: { display: "block", marginBottom: "6px" },
  empty: { color: "#94a3b8", margin: "10px 0" },
  toolsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "14px",
  },
  toolBox: {
    borderRadius: "16px",
    padding: "16px",
    background: "rgba(0,0,0,.18)",
    border: "1px solid rgba(148,163,184,.1)",
  },
  toolTitle: { margin: 0, fontSize: "1rem" },
  toolText: {
    color: "#94a3b8",
    fontSize: ".84rem",
    lineHeight: 1.5,
    minHeight: "42px",
  },
  toolActions: { display: "grid", gap: "10px" },
  headerWithButton: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "start",
    flexWrap: "wrap",
  },
  statusBox: {
    borderRadius: "16px",
    background: "rgba(0,0,0,.22)",
    border: "1px solid rgba(148,163,184,.1)",
    overflow: "hidden",
    maxHeight: "420px",
    overflowY: "auto",
  },
  pre: {
    margin: 0,
    padding: "18px",
    whiteSpace: "pre-wrap",
    color: "#cbd5e1",
    fontSize: ".8rem",
    lineHeight: 1.55,
  },
  footerNote: { marginTop: "18px", color: "#64748b", fontSize: ".82rem" },
};
