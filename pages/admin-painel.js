import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

const RESET_CONFIRMATION = "RESETAR_AMBIENTE_DE_TESTES";
const RESTORE_CONFIRMATION = "RESTAURAR_BACKUP_DE_TESTES";

const backupStatusLabels = {
  BACKING_UP: "Criando backup",
  BACKUP_COMPLETE: "Backup concluído",
  BACKUP_FAILED: "Falha no backup",
  RESET_COMPLETE: "Reset concluído",
  RESET_FAILED: "Falha no reset",
  RESET_VERIFICATION_FAILED: "Falha na verificação",
  RESTORED: "Restaurado",
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
  const [dashboard, setDashboard] = useState(null);
  const [mesDashboard, setMesDashboard] = useState(() => {
    const agora = new Date();
    return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
  });
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
  const [maintenancePreview, setMaintenancePreview] = useState(null);
  const [backups, setBackups] = useState([]);
  const [backupSelecionadoId, setBackupSelecionadoId] = useState("");
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [maintenanceModal, setMaintenanceModal] = useState(null);
  const [maintenanceConfirmation, setMaintenanceConfirmation] = useState("");
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
  const backupSelecionado = useMemo(
    () =>
      backups.find(
        (item) => String(item.id) === String(backupSelecionadoId),
      ) || null,
    [backups, backupSelecionadoId],
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

  async function carregarDashboard(mes = mesDashboard) {
    try {
      const data = await apiFetch(
        `/api/admin/dashboard/metricas?mes=${encodeURIComponent(mes)}`,
      );
      setDashboard(data);
    } catch (error) {
      notify(`Erro ao carregar métricas: ${error.message}`, "error");
    }
  }

  async function recalcularDashboard() {
    setLoading(true);
    try {
      await apiFetch("/api/admin/dashboard/metricas/recalcular", {
        method: "POST",
        body: { mes: mesDashboard },
      });
      await carregarDashboard(mesDashboard);
      notify(`Métricas de ${formatMonth(mesDashboard)} recalculadas.`, "success");
    } catch (error) {
      notify(`Erro: ${error.message}`, "error");
    } finally {
      setLoading(false);
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

  async function carregarAmbienteTestes() {
    const [previewData, backupsData] = await Promise.all([
      apiFetch("/api/admin/test-environment/preview"),
      apiFetch("/api/admin/test-environment/backups?limit=20"),
    ]);

    setMaintenancePreview(previewData?.preview || null);
    const lista = Array.isArray(backupsData?.backups)
      ? backupsData.backups
      : [];
    setBackups(lista);
    setBackupSelecionadoId((atual) => {
      if (
        lista.some(
          (item) => item.canRestore && String(item.id) === String(atual),
        )
      ) {
        return atual;
      }
      const restauravel = lista.find((item) => item.canRestore);
      return restauravel ? String(restauravel.id) : "";
    });
  }

  function abrirMaintenanceModal(tipo) {
    setMaintenanceConfirmation("");
    setMaintenanceModal(tipo);
  }

  function fecharMaintenanceModal() {
    if (maintenanceLoading) return;
    setMaintenanceModal(null);
    setMaintenanceConfirmation("");
  }

  async function sincronizarSaldoLocal() {
    try {
      const data = await apiFetch("/usuario/saldo");
      const saldo = Number(data?.saldo || 0);
      localStorage.setItem("saldo", saldo.toFixed(2));
      const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
      if (usuario) {
        localStorage.setItem("usuario", JSON.stringify({ ...usuario, saldo }));
      }
      window.dispatchEvent(new Event("force-topbar-update"));
    } catch (error) {
      console.error("Erro ao sincronizar saldo após manutenção:", error);
    }
  }

  async function executarManutencao() {
    const isReset = maintenanceModal === "reset";
    const confirmation = isReset
      ? RESET_CONFIRMATION
      : RESTORE_CONFIRMATION;

    if (maintenanceConfirmation !== confirmation) return;
    if (!isReset && !backupSelecionado?.canRestore) {
      notify("Selecione um backup disponível para restauração.", "error");
      return;
    }

    setMaintenanceLoading(true);
    setMsg("");
    try {
      const data = await apiFetch(
        isReset
          ? "/api/admin/test-environment/reset"
          : "/api/admin/test-environment/restore",
        {
          method: "POST",
          body: isReset
            ? { confirmation }
            : { backupId: backupSelecionado.id, confirmation },
        },
      );

      setMaintenanceModal(null);
      setMaintenanceConfirmation("");
      await Promise.all([
        carregarStatus({ silent: true }),
        carregarDashboard(mesDashboard),
        carregarTemporadas(),
        carregarClubes(),
        carregarAmbienteTestes(),
        sincronizarSaldoLocal(),
      ]);

      const warning = data?.liquidity?.warning;
      notify(
        warning
          ? `${data.mensagem} ${warning}`
          : isReset
            ? `Reset concluído. Backup criado: ${data.backupId}.`
            : `Backup ${data.backupId} restaurado com sucesso.`,
        warning ? "info" : "success",
      );
    } catch (error) {
      notify(`Erro: ${error.message}`, "error");
    } finally {
      setMaintenanceLoading(false);
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
      carregarDashboard(),
      carregarTemporadas({ manterSelecao: false }),
      carregarClubes(),
      carregarAmbienteTestes(),
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
  const metricas = dashboard?.selecionado?.metricas || {};
  const metricasAnteriores = dashboard?.anterior?.metricas || {};
  const maintenanceCounts = maintenancePreview?.counts || {};
  const resetBlocked = Number(maintenancePreview?.pendingPayments || 0) > 0;

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

      <div style={{ marginBottom: 18 }}>
        <Link href="/admin-liquidez-institucional" style={styles.primaryButton}>
          Abrir liquidez institucional
        </Link>
      </div>

      <div style={styles.metricsGrid}>
        <MetricCard title="Usuários" value={counts.usuarios ?? 0} />
        <MetricCard title="Clubes" value={counts.clubes ?? 0} />
        <MetricCard title="Investimentos" value={counts.investimentos ?? 0} />
        <MetricCard title="Dividendos" value={counts.dividendos ?? 0} />
        <MetricCard title="Recargas confirmadas" value={counts.recargasRecuperacao ?? 0} />
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

      <section style={{ ...styles.card, ...styles.maintenanceCard }}>
        <div style={styles.headerWithButton}>
          <SectionHeader
            title="Ambiente de testes"
            text="Reinicie os dados econômicos da plataforma ou restaure o último estado salvo. Cadastro, login, perfil, plano e vínculos sociais são preservados no reset."
          />
          <span style={styles.dangerBadge}>Zona de manutenção</span>
        </div>

        {!maintenancePreview ? (
          <p style={styles.empty}>Carregando prévia do ambiente...</p>
        ) : (
          <>
            <div style={styles.maintenanceMetrics}>
              <MaintenanceMetric
                label="Contas humanas"
                value={maintenancePreview.humanUsers || 0}
                detail="Receberão T$ 1.000"
              />
              <MaintenanceMetric
                label="Clubes"
                value={maintenancePreview.clubs || 0}
                detail="Voltarão a 1.000 cotas"
              />
              <MaintenanceMetric
                label="Ordens existentes"
                value={maintenanceCounts.orders || 0}
                detail="Serão apagadas"
              />
              <MaintenanceMetric
                label="Pagamentos pendentes"
                value={maintenancePreview.pendingPayments || 0}
                detail={
                  resetBlocked
                    ? `${maintenancePreview.pendingRecoveryPayments || 0} recarga(s) • ${maintenancePreview.pendingFinancialTransactions || 0} transação(ões)`
                    : "Nenhum bloqueio"
                }
                danger={resetBlocked}
              />
            </div>

            <div style={styles.maintenanceGrid}>
              <div style={styles.maintenanceActionBox}>
                <div>
                  <h3 style={styles.toolTitle}>Resetar plataforma</h3>
                  <p style={styles.toolTextAuto}>
                    Esvazia carteiras e operações, zera a valorização e devolve
                    todas as contas humanas para T$ 1.000. Um backup completo é
                    criado automaticamente antes da alteração.
                  </p>
                </div>
                {resetBlocked && (
                  <p style={styles.blockedMessage}>
                    Resolva os pagamentos e as transações pendentes ou em
                    processamento antes de continuar.
                  </p>
                )}
                <button
                  type="button"
                  style={{
                    ...styles.dangerButton,
                    ...(maintenanceLoading || resetBlocked
                      ? styles.disabledButton
                      : {}),
                  }}
                  onClick={() => abrirMaintenanceModal("reset")}
                  disabled={maintenanceLoading || resetBlocked}
                >
                  Resetar ambiente
                </button>
              </div>

              <div style={styles.maintenanceActionBox}>
                <div>
                  <h3 style={styles.toolTitle}>Restaurar backup</h3>
                  <p style={styles.toolTextAuto}>
                    Retorna as coleções ao estado anterior ao reset selecionado.
                    Dados criados depois daquele reset serão substituídos.
                  </p>
                </div>
                <div>
                  <label style={styles.label}>Backup disponível</label>
                  <select
                    value={backupSelecionadoId}
                    onChange={(event) =>
                      setBackupSelecionadoId(event.target.value)
                    }
                    style={styles.select}
                    disabled={maintenanceLoading || !backups.some((item) => item.canRestore)}
                  >
                    {!backups.some((item) => item.canRestore) && (
                      <option value="">Nenhum backup restaurável</option>
                    )}
                    {backups
                      .filter((item) => item.canRestore)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {formatDate(item.createdAt)} — {backupStatusLabels[item.status] || item.status}
                        </option>
                      ))}
                  </select>
                </div>
                {backupSelecionado && (
                  <div style={styles.backupDetail}>
                    <span>ID: {backupSelecionado.id}</span>
                    <span>
                      {backupSelecionado.summary?.humanUsers || 0} contas • {backupSelecionado.summary?.clubs || 0} clubes
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  style={{
                    ...styles.warningButton,
                    ...(maintenanceLoading || !backupSelecionado?.canRestore
                      ? styles.disabledButton
                      : {}),
                  }}
                  onClick={() => abrirMaintenanceModal("restore")}
                  disabled={maintenanceLoading || !backupSelecionado?.canRestore}
                >
                  Restaurar backup
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <section style={styles.card}>
        <div style={styles.dashboardHeader}>
          <SectionHeader
            title="Indicadores administrativos"
            text="Histórico mensal consolidado, comparação com o mês anterior e detalhamento semanal. Os valores financeiros são apurados a partir do ledger e das transações confirmadas."
          />
          <div style={styles.dashboardControls}>
            <input
              type="month"
              value={mesDashboard}
              onChange={(event) => {
                const mes = event.target.value;
                setMesDashboard(mes);
                if (mes) carregarDashboard(mes);
              }}
              style={styles.input}
            />
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={recalcularDashboard}
              disabled={loading || !mesDashboard}
            >
              Recalcular
            </button>
          </div>
        </div>

        {!dashboard ? (
          <p style={styles.empty}>Carregando indicadores...</p>
        ) : (
          <>
            <div style={styles.snapshotInfo}>
              <span>{formatMonth(mesDashboard)}</span>
              <span>
                {dashboard.selecionado?.fechado
                  ? "Fechamento histórico"
                  : "Mês em andamento"}
              </span>
              <span>
                Atualizado em {formatDate(dashboard.selecionado?.calculadoEm)}
              </span>
            </div>

            <h3 style={styles.groupTitle}>Operação e mercado</h3>
            <div style={styles.metricsGrid}>
              <ComparisonMetric
                title="Ordens no mês"
                value={metricas.ordens?.criadas || 0}
                previous={metricasAnteriores.ordens?.criadas || 0}
              />
              <ComparisonMetric
                title="Ordens executadas"
                value={metricas.ordens?.executadas || 0}
                previous={metricasAnteriores.ordens?.executadas || 0}
              />
              <ComparisonMetric
                title="Média por rodada"
                value={metricas.ordens?.mediaPorRodada || 0}
                previous={metricasAnteriores.ordens?.mediaPorRodada || 0}
              />
              <ComparisonMetric
                title="Taxa de cancelamento"
                value={metricas.ordens?.taxaCancelamento || 0}
                previous={metricasAnteriores.ordens?.taxaCancelamento || 0}
                suffix="%"
                inverse
              />
              <ComparisonMetric
                title="Negócios executados"
                value={metricas.mercado?.negocios || 0}
                previous={metricasAnteriores.mercado?.negocios || 0}
              />
              <ComparisonMetric
                title="Volume negociado"
                value={metricas.mercado?.volume || 0}
                previous={metricasAnteriores.mercado?.volume || 0}
                currency
              />
              <ComparisonMetric
                title="Ticket médio"
                value={metricas.mercado?.ticketMedio || 0}
                previous={metricasAnteriores.mercado?.ticketMedio || 0}
                currency
              />
              <ComparisonMetric
                title="Usuários ativos"
                value={metricas.mercado?.usuariosAtivos || 0}
                previous={metricasAnteriores.mercado?.usuariosAtivos || 0}
              />
            </div>

            <h3 style={styles.groupTitle}>Receita, pagamentos e crescimento</h3>
            <div style={styles.metricsGrid}>
              <ComparisonMetric
                title="Taxas acumuladas"
                value={metricas.receita?.taxasTotais || 0}
                previous={metricasAnteriores.receita?.taxasTotais || 0}
                currency
              />
              <ComparisonMetric
                title="Taxas maker"
                value={metricas.receita?.taxasMaker || 0}
                previous={metricasAnteriores.receita?.taxasMaker || 0}
                currency
              />
              <ComparisonMetric
                title="Taxas taker"
                value={metricas.receita?.taxasTaker || 0}
                previous={metricasAnteriores.receita?.taxasTaker || 0}
                currency
              />
              <ComparisonMetric
                title="Dividendos pagos"
                value={metricas.dividendos?.valor || 0}
                previous={metricasAnteriores.dividendos?.valor || 0}
                currency
              />
              <ComparisonMetric
                title="Beneficiários"
                value={metricas.dividendos?.beneficiarios || 0}
                previous={metricasAnteriores.dividendos?.beneficiarios || 0}
              />
              <ComparisonMetric
                title="Novos usuários"
                value={metricas.crescimento?.novosUsuarios || 0}
                previous={metricasAnteriores.crescimento?.novosUsuarios || 0}
              />
              <ComparisonMetric
                title="Receita com recargas"
                value={metricas.recargasRecuperacao?.receita || 0}
                previous={metricasAnteriores.recargasRecuperacao?.receita || 0}
                currency
              />
              <ComparisonMetric
                title="T$ emitidos por recuperação"
                value={metricas.recargasRecuperacao?.tsEmitidos || 0}
                previous={metricasAnteriores.recargasRecuperacao?.tsEmitidos || 0}
                suffix=" T$"
              />
              <ComparisonMetric
                title="Recargas confirmadas"
                value={metricas.recargasRecuperacao?.confirmadas || 0}
                previous={metricasAnteriores.recargasRecuperacao?.confirmadas || 0}
              />
              <ComparisonMetric
                title="Usuários que recarregaram"
                value={metricas.recargasRecuperacao?.usuarios || 0}
                previous={metricasAnteriores.recargasRecuperacao?.usuarios || 0}
              />
              <ComparisonMetric
                title="Ticket médio da recarga"
                value={metricas.recargasRecuperacao?.ticketMedio || 0}
                previous={metricasAnteriores.recargasRecuperacao?.ticketMedio || 0}
                currency
              />
              <ComparisonMetric
                title="Valor reembolsado"
                value={metricas.recargasRecuperacao?.valorReembolsado || 0}
                previous={metricasAnteriores.recargasRecuperacao?.valorReembolsado || 0}
                currency
                inverse
              />
            </div>

            <h3 style={styles.groupTitle}>Semanas do mês</h3>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Período</th>
                    <th style={styles.th}>Ordens</th>
                    <th style={styles.th}>Negócios</th>
                    <th style={styles.th}>Volume</th>
                    <th style={styles.th}>Taxas</th>
                    <th style={styles.th}>Dividendos</th>
                    <th style={styles.th}>Ativos</th>
                  </tr>
                </thead>
                <tbody>
                  {(dashboard.selecionado?.semanas || []).map((semana) => (
                    <tr key={`${semana.numero}-${semana.inicio}`}>
                      <td style={styles.td}>
                        {formatShortDate(semana.inicio)}–{formatShortDate(semana.fim)}
                      </td>
                      <td style={styles.td}>{semana.metricas?.ordens?.criadas || 0}</td>
                      <td style={styles.td}>{semana.metricas?.mercado?.negocios || 0}</td>
                      <td style={styles.td}>{formatCurrency(semana.metricas?.mercado?.volume || 0)}</td>
                      <td style={styles.td}>{formatCurrency(semana.metricas?.receita?.taxasTotais || 0)}</td>
                      <td style={styles.td}>{formatCurrency(semana.metricas?.dividendos?.valor || 0)}</td>
                      <td style={styles.td}>{semana.metricas?.mercado?.usuariosAtivos || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={styles.groupTitle}>Evolução — últimos 12 meses</h3>
            <div style={styles.historyGrid}>
              {(dashboard.serie || []).map((item) => (
                <div key={item.mes} style={styles.historyCard}>
                  <strong>{formatMonth(item.mes)}</strong>
                  <span>{item.metricas?.ordens?.criadas || 0} ordens</span>
                  <span>{formatCurrency(item.metricas?.mercado?.volume || 0)} em volume</span>
                  <span>{formatCurrency(item.metricas?.receita?.taxasTotais || 0)} em taxas</span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

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

      {maintenanceModal && (
        <div style={styles.modalBackdrop} role="presentation">
          <div
            style={styles.modalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="maintenance-modal-title"
          >
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.kicker}>Confirmação obrigatória</div>
                <h2 id="maintenance-modal-title" style={styles.modalTitle}>
                  {maintenanceModal === "reset"
                    ? "Resetar o ambiente de testes?"
                    : "Restaurar o backup selecionado?"}
                </h2>
              </div>
              <button
                type="button"
                style={styles.closeButton}
                onClick={fecharMaintenanceModal}
                disabled={maintenanceLoading}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div style={styles.modalWarning}>
              {maintenanceModal === "reset" ? (
                <>
                  Todas as contas humanas ficarão com T$ 1.000 e sem cotas. Ordens,
                  transações, valorização, troféus e históricos econômicos serão
                  zerados. O backup será criado antes da alteração.
                </>
              ) : (
                <>
                  O estado salvo em <strong>{backupSelecionado?.id}</strong> será
                  restaurado. Operações e contas criadas depois desse backup serão
                  substituídas.
                </>
              )}
            </div>

            <label style={styles.label} htmlFor="maintenance-confirmation">
              Digite exatamente a frase abaixo para continuar:
            </label>
            <code style={styles.confirmationCode}>
              {maintenanceModal === "reset"
                ? RESET_CONFIRMATION
                : RESTORE_CONFIRMATION}
            </code>
            <input
              id="maintenance-confirmation"
              type="text"
              value={maintenanceConfirmation}
              onChange={(event) =>
                setMaintenanceConfirmation(event.target.value)
              }
              style={styles.input}
              autoComplete="off"
              autoFocus
              disabled={maintenanceLoading}
            />

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={fecharMaintenanceModal}
                disabled={maintenanceLoading}
              >
                Cancelar
              </button>
              <button
                type="button"
                style={{
                  ...(maintenanceModal === "reset"
                    ? styles.dangerButton
                    : styles.warningButton),
                  ...(maintenanceConfirmation !==
                    (maintenanceModal === "reset"
                      ? RESET_CONFIRMATION
                      : RESTORE_CONFIRMATION) || maintenanceLoading
                    ? styles.disabledButton
                    : {}),
                }}
                onClick={executarManutencao}
                disabled={
                  maintenanceLoading ||
                  maintenanceConfirmation !==
                    (maintenanceModal === "reset"
                      ? RESET_CONFIRMATION
                      : RESTORE_CONFIRMATION)
                }
              >
                {maintenanceLoading
                  ? "Processando..."
                  : maintenanceModal === "reset"
                    ? "Confirmar reset"
                    : "Confirmar restauração"}
              </button>
            </div>
          </div>
        </div>
      )}

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
function MaintenanceMetric({ label, value, detail, danger = false }) {
  return (
    <div
      style={{
        ...styles.maintenanceMetric,
        ...(danger ? styles.maintenanceMetricDanger : {}),
      }}
    >
      <span style={styles.metricTitle}>{label}</span>
      <strong style={styles.maintenanceMetricValue}>{value}</strong>
      <span style={styles.maintenanceMetricDetail}>{detail}</span>
    </div>
  );
}
function ComparisonMetric({
  title,
  value,
  previous,
  currency = false,
  suffix = "",
  inverse = false,
}) {
  const atual = Number(value || 0);
  const anterior = Number(previous || 0);
  const variacao = anterior === 0 ? null : ((atual - anterior) / Math.abs(anterior)) * 100;
  const positivo = variacao == null ? null : inverse ? variacao <= 0 : variacao >= 0;
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricTitle}>{title}</div>
      <div style={styles.metricValue}>
        {currency ? formatCurrency(atual) : `${formatNumber(atual)}${suffix}`}
      </div>
      <div
        style={{
          ...styles.comparison,
          color: positivo == null ? "#94a3b8" : positivo ? "#86efac" : "#fca5a5",
        }}
      >
        {variacao == null
          ? "Sem base no mês anterior"
          : `${variacao >= 0 ? "+" : ""}${variacao.toFixed(1)}% vs. mês anterior`}
      </div>
    </div>
  );
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

function formatMonth(value) {
  if (!value) return "";
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
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
  comparison: { marginTop: "8px", fontSize: ".74rem", fontWeight: 700 },
  dashboardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "18px",
    flexWrap: "wrap",
  },
  dashboardControls: { display: "flex", gap: "10px", alignItems: "center" },
  snapshotInfo: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    color: "#94a3b8",
    fontSize: ".78rem",
    marginBottom: "18px",
  },
  groupTitle: { fontSize: ".94rem", margin: "22px 0 12px", color: "#e2e8f0" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "760px" },
  th: { textAlign: "left", padding: "10px", color: "#94a3b8", fontSize: ".76rem", borderBottom: "1px solid rgba(148,163,184,.16)" },
  td: { padding: "11px 10px", fontSize: ".82rem", borderBottom: "1px solid rgba(148,163,184,.08)" },
  historyGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: "10px" },
  historyCard: { display: "flex", flexDirection: "column", gap: "5px", padding: "13px", borderRadius: "12px", background: "rgba(255,255,255,.035)", color: "#cbd5e1", fontSize: ".78rem" },
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
  maintenanceCard: {
    border: "1px solid rgba(239,68,68,.24)",
    background:
      "linear-gradient(180deg,rgba(43,16,26,.94),rgba(19,18,31,.97))",
  },
  dangerBadge: {
    display: "inline-flex",
    padding: "7px 11px",
    borderRadius: "999px",
    color: "#fecaca",
    background: "rgba(239,68,68,.12)",
    border: "1px solid rgba(239,68,68,.22)",
    fontSize: ".74rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".05em",
  },
  maintenanceMetrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
    gap: "10px",
    marginBottom: "16px",
  },
  maintenanceMetric: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    padding: "14px",
    borderRadius: "14px",
    background: "rgba(255,255,255,.035)",
    border: "1px solid rgba(148,163,184,.11)",
  },
  maintenanceMetricDanger: {
    background: "rgba(239,68,68,.1)",
    border: "1px solid rgba(239,68,68,.24)",
  },
  maintenanceMetricValue: { fontSize: "1.4rem", color: "#f8fafc" },
  maintenanceMetricDetail: { color: "#94a3b8", fontSize: ".74rem" },
  maintenanceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: "14px",
  },
  maintenanceActionBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "14px",
    padding: "18px",
    borderRadius: "16px",
    background: "rgba(0,0,0,.2)",
    border: "1px solid rgba(148,163,184,.1)",
  },
  toolTextAuto: {
    color: "#94a3b8",
    fontSize: ".84rem",
    lineHeight: 1.55,
    margin: "9px 0 0",
  },
  blockedMessage: {
    margin: 0,
    color: "#fecaca",
    fontSize: ".8rem",
    lineHeight: 1.5,
  },
  backupDetail: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    color: "#94a3b8",
    fontSize: ".75rem",
    overflowWrap: "anywhere",
  },
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
  disabledButton: {
    opacity: 0.48,
    cursor: "not-allowed",
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
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 10000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background: "rgba(2,6,23,.82)",
    backdropFilter: "blur(6px)",
  },
  modalCard: {
    width: "min(100%, 560px)",
    padding: "22px",
    borderRadius: "20px",
    background: "linear-gradient(180deg,#111c31,#0b1324)",
    border: "1px solid rgba(239,68,68,.28)",
    boxShadow: "0 30px 90px rgba(0,0,0,.55)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "16px",
  },
  modalTitle: { margin: 0, fontSize: "1.35rem", lineHeight: 1.2 },
  closeButton: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    border: "1px solid rgba(148,163,184,.16)",
    background: "rgba(255,255,255,.04)",
    color: "#cbd5e1",
    fontSize: "1.4rem",
    cursor: "pointer",
  },
  modalWarning: {
    marginBottom: "18px",
    padding: "14px",
    borderRadius: "13px",
    color: "#fecaca",
    background: "rgba(239,68,68,.09)",
    border: "1px solid rgba(239,68,68,.18)",
    fontSize: ".86rem",
    lineHeight: 1.55,
  },
  confirmationCode: {
    display: "block",
    margin: "0 0 10px",
    padding: "10px 12px",
    borderRadius: "10px",
    color: "#f8fafc",
    background: "rgba(0,0,0,.28)",
    border: "1px solid rgba(148,163,184,.12)",
    fontSize: ".8rem",
    overflowWrap: "anywhere",
    userSelect: "all",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "18px",
  },
  footerNote: { marginTop: "18px", color: "#64748b", fontSize: ".82rem" },
};
