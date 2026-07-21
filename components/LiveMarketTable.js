import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import styled, { keyframes } from "styled-components";
import ClubBadge from "./ClubBadge";

const ATUALIZACAO_MS = 60_000;

const normalizar = (valor = "") =>
  String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();

const ALIASES = {
  gremio: "gremio",
  saopaulo: "saopaulo",
  cuiaba: "cuiaba",
  goias: "goias",
  athleticoparanaense: "atleticoparanaense",
  athletico: "atleticoparanaense",
  fortaleza: "fortalezaec",
  fortalezaec: "fortalezaec",
  americamg: "americamineiro",
  americamineiro: "americamineiro",
  atleticomg: "atleticomg",
  chapeconse: "chapecoense-sc",
};

const canon = (nome = "") => {
  const base = normalizar(nome);
  return ALIASES[base] || base;
};

const comoArray = (resposta, chaves = []) => {
  if (Array.isArray(resposta)) return resposta;
  for (const chave of chaves) {
    if (Array.isArray(resposta?.[chave])) return resposta[chave];
  }
  return [];
};

const primeiroValor = (...valores) =>
  valores.find((valor) => valor !== undefined && valor !== null && valor !== "");

const numero = (...valores) => {
  const valor = primeiroValor(...valores);
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
  if (typeof valor !== "string") return null;
  const convertido = Number(valor.replace(/\s/g, "").replace("R$", "").replace("T$", "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", "."));
  return Number.isFinite(convertido) ? convertido : null;
};

const formatarPreco = (valor) =>
  valor === null
    ? "—"
    : `T$ ${valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

const nomeTabela = (item) =>
  primeiroValor(item?.nome, item?.clube, item?.time, item?.equipe, item?.nomeClube);

const nomeCadastro = (item) =>
  primeiroValor(item?.nome, item?.nomeClube, item?.clube, item?.time, item?.equipe);

const posicaoTabela = (item) =>
  numero(item?.posicao, item?.position, item?.classificacao, item?.ranking);

const precoClube = (item) =>
  numero(
    item?.precoAtual,
    item?.preco_atual,
    item?.ultimoPreco,
    item?.ultimo_preco,
    item?.precoMercado,
    item?.preco_mercado,
    item?.preco
  );

const escudoClube = (item) =>
  primeiroValor(
    item?.escudo,
    item?.escudoUrl,
    item?.escudo_url,
    item?.logo,
    item?.logoUrl,
    item?.logo_url,
    item?.imagem,
    item?.imagemUrl,
    item?.imagem_url
  );

const siglaClube = (item, nome) =>
  primeiroValor(item?.sigla, item?.abreviacao, item?.codigo, nome?.slice(0, 3))
    ?.toString()
    .toUpperCase();

const statusClube = (item) => {
  const restantes = numero(
    item?.quantidadeDisponivel,
    item?.quantidade_disponivel,
    item?.cotasDisponiveis,
    item?.cotas_disponiveis,
    item?.unidadesDisponiveis,
    item?.unidades_disponiveis
  );
  const status = String(primeiroValor(item?.statusIpo, item?.status_ipo, item?.status, "")).toLowerCase();

  if (restantes !== null && restantes > 0) return "Unidades iniciais";
  if (status.includes("ipo") || status.includes("inicial")) return "Unidades iniciais";
  return "Mercado secundário";
};

function unirDados(tabela, clubes) {
  const clubesPorNome = new Map();
  clubes.forEach((clube) => {
    const chave = canon(nomeCadastro(clube));
    if (chave) clubesPorNome.set(chave, clube);
  });

  return tabela
    .map((linha) => {
      const nome = nomeTabela(linha);
      const cadastro = clubesPorNome.get(canon(nome));
      const posicao = posicaoTabela(linha);
      const preco = cadastro ? precoClube(cadastro) : null;

      if (!nome || !cadastro || posicao === null || preco === null) return null;

      return {
        id: primeiroValor(cadastro?._id, cadastro?.id, cadastro?.legacyId, canon(nome)),
        nome,
        sigla: siglaClube(cadastro, nome),
        posicao,
        preco,
        escudo: escudoClube(cadastro),
        status: statusClube(cadastro),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.posicao - b.posicao);
}

export default function LiveMarketTable({ variant = "home", limit = 4, className }) {
  const [clubes, setClubes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const API = process.env.NEXT_PUBLIC_API_URL;

  const carregar = useCallback(async ({ silencioso = false } = {}) => {
    if (!API) {
      setErro(true);
      setCarregando(false);
      return;
    }

    if (!silencioso) setCarregando(true);

    try {
      const [respostaTabela, respostaClubes] = await Promise.all([
        axios.get(`${API}/api/tabela-brasileirao`),
        axios.get(`${API}/clube/clubes`),
      ]);

      const tabela = comoArray(respostaTabela.data, ["data", "tabela", "classificacao", "clubes", "dados"]);
      const cadastro = comoArray(respostaClubes.data, ["clubes", "dados", "data"]);
      const unidos = unirDados(tabela, cadastro);

      if (!unidos.length) throw new Error("Nenhum clube pôde ser relacionado.");

      setClubes(unidos);
      setAtualizadoEm(new Date());
      setErro(false);
    } catch (error) {
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }, [API]);

  useEffect(() => {
    carregar();
    const intervalo = window.setInterval(() => carregar({ silencioso: true }), ATUALIZACAO_MS);
    const aoMudarVisibilidade = () => {
      if (document.visibilityState === "visible") carregar({ silencioso: true });
    };
    document.addEventListener("visibilitychange", aoMudarVisibilidade);
    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
    };
  }, [carregar]);

  const exibidos = useMemo(() => clubes.slice(0, Math.max(1, limit)), [clubes, limit]);
  const compacto = variant === "login";

  return (
    <Card className={className} $compacto={compacto} aria-live="polite">
      <Cabecalho>
        <div>
          <Rotulo>{compacto ? "VISÃO DO MERCADO" : "MERCADO AO VIVO"}</Rotulo>
          <Titulo>{compacto ? "Clubes em destaque" : "Campeonato Brasileiro"}</Titulo>
        </div>
        <AoVivo $ativo={!carregando && !erro && exibidos.length > 0}>
          <Ponto /> {!carregando && !erro && exibidos.length ? "AO VIVO" : "DADOS REAIS"}
        </AoVivo>
      </Cabecalho>

      {!compacto && !carregando && exibidos.length > 0 && (
        <Colunas aria-hidden="true">
          <span>Clube</span><span>Pos.</span><span>Último preço</span><span>Status</span>
        </Colunas>
      )}

      {carregando && !exibidos.length ? (
        <Estado><Spinner /><span>Atualizando mercado...</span></Estado>
      ) : !exibidos.length ? (
        <Estado $erro>
          <strong>Mercado temporariamente indisponível</strong>
          <span>Nenhum dado ilustrativo será exibido.</span>
          <Tentar type="button" onClick={() => carregar()}>Tentar novamente</Tentar>
        </Estado>
      ) : (
        <Lista>
          {exibidos.map((clube) => (
            <Linha key={clube.id} $compacto={compacto}>
              <Clube>
                <EscudoWrap>
                  <ClubBadge clube={clube.nome} size={30} />
                </EscudoWrap>
                <Nome>
                  <strong>{clube.nome}</strong>
                  <small>{compacto ? `${clube.posicao}º lugar` : clube.sigla}</small>
                </Nome>
              </Clube>
              {!compacto && <Posicao>{clube.posicao}º</Posicao>}
              <Preco><strong>{formatarPreco(clube.preco)}</strong>{compacto && <small>{clube.status}</small>}</Preco>
              {!compacto && <Status>{clube.status}</Status>}
            </Linha>
          ))}
        </Lista>
      )}

      {erro && exibidos.length > 0 && <Aviso>Últimos dados válidos mantidos. Reconectando…</Aviso>}
      {atualizadoEm && !erro && (
        <Atualizacao>Atualizado às {atualizadoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</Atualizacao>
      )}
    </Card>
  );
}

const girar = keyframes`to { transform: rotate(360deg); }`;
const pulsar = keyframes`0%,100% { opacity: 1; } 50% { opacity: .35; }`;

const Card = styled.section`
  width: 100%; overflow: hidden; border: 1px solid rgba(148,163,184,.14);
  border-radius: ${({ $compacto }) => ($compacto ? "16px" : "20px")};
  background: rgba(8,15,31,.88); box-shadow: 0 24px 70px rgba(0,0,0,.25);
`;
const Cabecalho = styled.div`
  display:flex; align-items:center; justify-content:space-between; gap:16px; padding:18px 20px;
`;
const Rotulo = styled.span`display:block; color:#60a5fa; font-size:.64rem; font-weight:900; letter-spacing:.13em;`;
const Titulo = styled.strong`display:block; margin-top:4px; color:#f8fafc; font-size:.94rem;`;
const AoVivo = styled.span`
  display:inline-flex; align-items:center; gap:7px; color:${({ $ativo }) => ($ativo ? "#86efac" : "#94a3b8")};
  font-size:.62rem; font-weight:900; letter-spacing:.07em; white-space:nowrap;
`;
const Ponto = styled.i`
  width:7px; height:7px; border-radius:50%; background:currentColor; box-shadow:0 0 12px currentColor;
  animation:${pulsar} 1.8s ease-in-out infinite;
`;
const Colunas = styled.div`
  display:grid; grid-template-columns:minmax(180px,1.6fr) .45fr .85fr 1fr; gap:12px; padding:9px 20px;
  border-top:1px solid rgba(148,163,184,.08); border-bottom:1px solid rgba(148,163,184,.08);
  color:#64748b; font-size:.61rem; font-weight:900; letter-spacing:.06em; text-transform:uppercase;
  span:nth-child(n+2){text-align:right;}
  @media(max-width:520px){grid-template-columns:minmax(140px,1.4fr) .42fr .8fr; span:last-child{display:none;}}
`;
const Lista = styled.div``;
const Linha = styled.div`
  display:grid; grid-template-columns:${({ $compacto }) => ($compacto ? "minmax(0,1fr) auto" : "minmax(180px,1.6fr) .45fr .85fr 1fr")};
  align-items:center; gap:12px; min-height:${({ $compacto }) => ($compacto ? "68px" : "70px")}; padding:10px 20px;
  border-bottom:1px solid rgba(148,163,184,.08); &:last-child{border-bottom:0;}
  @media(max-width:520px){grid-template-columns:${({ $compacto }) => ($compacto ? "minmax(0,1fr) auto" : "minmax(140px,1.4fr) .42fr .8fr")};}
`;
const Clube = styled.div`display:flex; align-items:center; min-width:0; gap:11px;`;
const EscudoWrap = styled.div`
  width:38px; height:38px; flex:0 0 38px; display:grid; place-items:center; border-radius:11px;
  border:1px solid rgba(148,163,184,.13); background:rgba(255,255,255,.04); overflow:hidden;
`;
const Escudo = styled.img`width:30px; height:30px; object-fit:contain;`;
const Sigla = styled.span`color:#cbd5e1; font-size:.58rem; font-weight:900;`;
const Nome = styled.div`
  min-width:0; strong{display:block; overflow:hidden; color:#f1f5f9; font-size:.79rem; text-overflow:ellipsis; white-space:nowrap;}
  small{display:block; margin-top:4px; color:#64748b; font-size:.62rem; font-weight:800;}
`;
const Posicao = styled.strong`color:#cbd5e1; font-size:.77rem; text-align:right;`;
const Preco = styled.div`
  text-align:right; strong{display:block; color:#f8fafc; font-size:.78rem; white-space:nowrap;}
  small{display:block; margin-top:4px; color:#64748b; font-size:.59rem;}
`;
const Status = styled.span`
  justify-self:end; padding:6px 8px; border-radius:999px; background:rgba(34,197,94,.08); color:#86efac;
  font-size:.6rem; font-weight:800; white-space:nowrap; @media(max-width:520px){display:none;}
`;
const Estado = styled.div`
  min-height:190px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:9px; padding:24px;
  color:${({ $erro }) => ($erro ? "#94a3b8" : "#cbd5e1")}; text-align:center;
  strong{color:#e2e8f0; font-size:.82rem;} span{font-size:.7rem;}
`;
const Spinner = styled.i`width:22px; height:22px; border:2px solid rgba(96,165,250,.2); border-top-color:#60a5fa; border-radius:50%; animation:${girar} .8s linear infinite;`;
const Tentar = styled.button`
  margin-top:5px; padding:8px 12px; border:1px solid rgba(96,165,250,.25); border-radius:9px; color:#bfdbfe;
  background:rgba(59,130,246,.08); cursor:pointer; font:inherit; font-size:.68rem; font-weight:800;
`;
const Aviso = styled.div`padding:8px 20px; border-top:1px solid rgba(245,158,11,.12); color:#fbbf24; font-size:.61rem; text-align:center;`;
const Atualizacao = styled.div`padding:7px 20px; border-top:1px solid rgba(148,163,184,.06); color:#475569; font-size:.58rem; text-align:right;`;
