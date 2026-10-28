'use strict';
/**
 * TradeSports - sincronização de saldo e carteira.
 * Execute na raiz do frontend: node aplicar_correcao.js
 * Sem dependências externas. Valida todas as alterações antes de gravar.
 */
const fs = require('node:fs');
const path = require('node:path');

const FILES = {
  modal: 'components/NegociacaoModal.js',
  auth: 'contexts/AuthContexts.js',
  topbar: 'components/Topbar.js',
};
const paths = Object.fromEntries(Object.entries(FILES).map(([k, v]) => [k, path.resolve(process.cwd(), v)]));
const sources = {};
const marker = '// TradeSports: sincronizacao de negociacoes v2';
function replaceOnce(source, needle, replacement, label) {
  const first = source.indexOf(needle);
  if (first < 0 || source.indexOf(needle, first + needle.length) >= 0) {
    throw new Error(`Trecho ausente ou duplicado (${label}). Nenhum arquivo sera modificado.`);
  }
  return source.slice(0, first) + replacement + source.slice(first + needle.length);
}
function replaceRange(source, start, end, replacement, label) {
  const a = source.indexOf(start);
  const b = a < 0 ? -1 : source.indexOf(end, a + start.length);
  if (a < 0 || b < 0 || source.indexOf(start, a + start.length) >= 0) {
    throw new Error(`Bloco nao localizado (${label}). Nenhum arquivo sera modificado.`);
  }
  return source.slice(0, a) + replacement + source.slice(b);
}
try {
  for (const [name, filename] of Object.entries(paths)) {
    if (!fs.existsSync(filename)) throw new Error(`Arquivo nao encontrado: ${FILES[name]}`);
    sources[name] = fs.readFileSync(filename, 'utf8');
  }
  if (Object.values(sources).some(s => s.includes(marker))) {
    console.log('Esta versao da correcao ja foi aplicada. Nenhuma alteracao necessaria.');
    process.exit(0);
  }
  let m = sources.modal;
  let a = sources.auth;
  let t = sources.topbar;

  // Atualizacao autoritativa do backend, sem alterar saldo/cotas por estimativa.
  // Nunca publica no localStorage dentro de setState: isso pode ocorrer depois do evento.
  const syncFunction = ` ${marker}
 async function atualizarSaldoDoUsuario() {
   const requestId = ++sincronizacaoRef.current;
   try {
     const [respUsuario, respSaldo] = await Promise.all([
       api.get('/usuario', { headers: getAuthHeaders() }),
       api.get('/usuario/saldo', { headers: getAuthHeaders() }),
     ]);
     const dadosUsuario = respUsuario?.data?.usuario || respUsuario?.data;
     const valorSaldo = respSaldo?.data?.saldo;
     const saldoAtual = Number(valorSaldo);
     if (!dadosUsuario || typeof dadosUsuario !== 'object' ||
         valorSaldo === undefined || valorSaldo === null ||
         !Number.isFinite(saldoAtual) || requestId !== sincronizacaoRef.current) return null;

     const atualizado = { ...dadosUsuario, saldo: saldoAtual };
     setUsuario(atualizado);
     setPoderCompra(saldoAtual);
     localStorage.setItem('usuario', JSON.stringify(atualizado));
     localStorage.setItem('saldo', saldoAtual.toFixed(2));
     // O AuthProvider e a Topbar escutam estes eventos na mesma aba.
     window.dispatchEvent(new Event('tradesports-usuario-atualizado'));
     window.dispatchEvent(new Event('force-topbar-update'));
     return atualizado;
   } catch (err) {
     console.error('[TradeSports] Falha ao sincronizar carteira/saldo:', err);
     return null;
   }
 }
`;
  m = replaceRange(m, ' async function atualizarSaldoDoUsuario() {', '\n  async function enviarOrdem()', syncFunction, 'sincronizacao do modal');
  m = replaceOnce(m, '  const modoInicialAplicadoRef = useRef(null);',
    '  const modoInicialAplicadoRef = useRef(null);\n  const sincronizacaoRef = useRef(0);', 'referencia de sincronizacao');
  m = replaceOnce(m, "  const usuarioAtualizado = await atualizarUsuarioCompleto();",
    "  const usuarioAtualizado = await atualizarSaldoDoUsuario();", 'validacao da venda');
  m = replaceOnce(m, "<Aba $ativa={modo === 'venda'} onClick={() => setModo('venda')}>",
    "<Aba $ativa={modo === 'venda'} onClick={() => { setModo('venda'); atualizarSaldoDoUsuario(); }}>", 'aba de venda');
  // Sincroniza apos ordem, cancelamento, abertura e retorno à aba.
  // Execucoes futuras de ordens no livro: consulta periódica de 3s.
  m = replaceOnce(m, '  const carregarOrdens = async () => {',
`  useEffect(() => {
    if (!isOpen || !token || typeof window === 'undefined') return undefined;
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') atualizarSaldoDoUsuario();
    };
    const intervalo = window.setInterval(() => {
      if (document.visibilityState === 'visible' && !carregando) {
        atualizarSaldoDoUsuario();
      }
    }, 3000);
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [isOpen, token, carregando]);

  const carregarOrdens = async () => {`, 'monitoramento de execucoes');
  // Preserva os demais recursos da negociação, incluindo IPO e livro de ordens.
  // Em caso de retorno parcial, quantidade disponível vem sempre do backend.
  m = m.replace('Number(ativo?.quantidade || ativo?.cotas || 0)',
                'Number(ativo?.quantidade ?? ativo?.cotas ?? 0)');
  m = m.replace(/ativo\.quantidade \|\|\s*ativo\.cotas \|\|\s*0/g,
                'ativo.quantidade ?? ativo.cotas ?? 0');

  // Atualiza AuthContext com o mesmo snapshot publicado pelo modal,
  // evitando chamada redundante que pode sobrescrever dados mais recentes.
  a = replaceOnce(a, '  const contextValue = useMemo(() => ({',
`  useEffect(() => {
    const sincronizarUsuario = () => {
      try {
        const armazenado = localStorage.getItem('usuario');
        if (!armazenado) return;
        const novoUsuario = JSON.parse(armazenado);
        if (novoUsuario && typeof novoUsuario === 'object') setUsuario(novoUsuario);
      } catch (err) {
        console.error('[TradeSports] Erro ao sincronizar usuario:', err);
      }
    };
    window.addEventListener('tradesports-usuario-atualizado', sincronizarUsuario);
    return () => window.removeEventListener('tradesports-usuario-atualizado', sincronizarUsuario);
  }, []);

  const contextValue = useMemo(() => ({`, 'sincronizacao do AuthContext');

  // Topbar ja escuta force-topbar-update. Apenas normaliza a leitura,
  // evitando deixar saldo antigo quando usuario/saldo mudarem.
  t = replaceOnce(t,
`      if (saldoSalvo) {
        setSaldo(saldoSalvo);
      } else if (parsed?.saldo !== undefined) {
        setSaldo(String(parsed.saldo));
      }`,
`      const valor = saldoSalvo !== null ? Number(saldoSalvo) : Number(parsed?.saldo);
      if (Number.isFinite(valor)) {
        setSaldo(valor.toFixed(2));
      } else {
        setSaldo('0.00');
      }`, 'saldo da Topbar');

  // Validação simples de integridade antes de gravar qualquer arquivo.
  if (!m.includes('await atualizarSaldoDoUsuario();') ||
      !m.includes("window.dispatchEvent(new Event('force-topbar-update'))") ||
      !a.includes('tradesports-usuario-atualizado') ||
      !t.includes('setSaldo(valor.toFixed(2))')) {
    throw new Error('Validacao interna falhou; nenhum arquivo foi modificado.');
  }
  const updated = { modal: m, auth: a, topbar: t };
  const backups = [];
  try {
    for (const [key, filename] of Object.entries(paths)) {
      const backup = filename + '.bak-sync-v2';
      if (fs.existsSync(backup)) throw new Error(`Backup ja existe: ${backup}. Preserve-o antes de executar novamente.`);
      fs.writeFileSync(backup, sources[key], { flag: 'wx' });
      backups.push([filename, backup]);
    }
    for (const [key, filename] of Object.entries(paths)) {
      fs.writeFileSync(filename, updated[key], 'utf8');
      console.log('Atualizado:', FILES[key]);
    }
  } catch (err) {
    for (const [filename, backup] of backups) {
      try { fs.copyFileSync(backup, filename); } catch (_) {}
    }
    throw err;
  }
  console.log('\nCorrecao aplicada. Backups: *.bak-sync-v2');
  console.log('Execute npm run build e teste compras, vendas e ordens parciais antes do deploy.');
  console.log('Ordens executadas por terceiros: sincronizacao por consulta a cada 3 segundos (nao WebSocket).');
} catch (err) {
  console.error('\nCorrecao NAO aplicada:', err.message);
  process.exitCode = 1;
}
