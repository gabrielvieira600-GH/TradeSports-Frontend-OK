'use strict';
// Execute na raiz do frontend: node aplicar_correcao.js
const fs = require('node:fs');
const paths = ['components/NegociacaoModal.js', 'contexts/AuthContexts.js', 'components/Topbar.js'];
function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first < 0 || source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Trecho não encontrado ou duplicado: ${label}. Nenhum arquivo foi modificado.`);
  }
  return source.slice(0, first) + after + source.slice(first + before.length);
}
function patchModal(source) {
  let s = replaceOnce(source,
    "import { useEffect, useMemo, useRef, useState } from 'react';",
    "import { useContext, useEffect, useMemo, useRef, useState } from 'react';\nimport { AuthContext } from '../contexts/AuthContexts';",
    'import modal');
  s = replaceOnce(s, '  const { adicionarToast } = useToast();',
    '  const { adicionarToast } = useToast();\n  const { refreshSaldo, refreshUsuario } = useContext(AuthContext);\n  const syncCounterRef = useRef(0);',
    'contexto modal');
  const start = s.indexOf(' async function atualizarSaldoDoUsuario() {');
  const end = s.indexOf('\n  async function enviarOrdem()', start);
  if (start < 0 || end < 0) throw new Error('Função de saldo original não encontrada. Nenhum arquivo foi modificado.');
  const replacement = ` async function atualizarSaldoDoUsuario() {
    const syncId = ++syncCounterRef.current;
    try {
      const [resUsuario, resSaldo] = await Promise.all([
        api.get('/usuario', { headers: getAuthHeaders() }),
        api.get('/usuario/saldo', { headers: getAuthHeaders() }),
      ]);
      const usuarioAtualizado = resUsuario?.data?.usuario || resUsuario?.data;
      const novoSaldo = Number(resSaldo?.data?.saldo);
      if (!usuarioAtualizado || !Number.isFinite(novoSaldo) || syncId !== syncCounterRef.current) return null;
      const completo = { ...usuarioAtualizado, saldo: novoSaldo };
      setUsuario(completo);
      setPoderCompra(novoSaldo);
      localStorage.setItem('usuario', JSON.stringify(completo));
      localStorage.setItem('saldo', novoSaldo.toFixed(2));
      window.dispatchEvent(new Event('force-topbar-update'));
      // Contexto global alimenta outras telas e mantém o saldo da Topbar consistente.
      if (refreshUsuario) await refreshUsuario();
      if (refreshSaldo) await refreshSaldo();
      return completo;
    } catch (error) {
      console.error('Erro ao sincronizar saldo e cotas:', error);
      return null;
    }
  }
`;
  s = s.slice(0, start) + replacement + s.slice(end);
  s = replaceOnce(s,
    "<Aba $ativa={modo === 'venda'} onClick={() => setModo('venda')}>",
    "<Aba $ativa={modo === 'venda'} onClick={() => { setModo('venda'); atualizarSaldoDoUsuario(); }}>",
    'aba venda');
  s = replaceOnce(s, '  const usuarioAtualizado = await atualizarUsuarioCompleto();',
    '  const usuarioAtualizado = await atualizarSaldoDoUsuario();', 'validação de venda');
  s = replaceOnce(s, '  const qtdDisp = Number(ativo?.quantidade || ativo?.cotas || 0);',
    '  const qtdDisp = Number(ativo?.quantidade ?? ativo?.cotas ?? 0);', 'quantidade venda');
  s = replaceOnce(s, '  const carregarOrdens = async () => {', `  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return undefined;
    const onVisible = () => {
      if (document.visibilityState === 'visible') atualizarSaldoDoUsuario();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !token) return undefined;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible' && !carregando) atualizarSaldoDoUsuario();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isOpen, token, carregando]);

  const carregarOrdens = async () => {`, 'atualização automática');
  return s;
}
function patchAuth(s) {
  return replaceOnce(s, '      setUsuario((anterior) => {\n        if (!anterior) return anterior;',
    "      localStorage.setItem('saldo', novoSaldo.toFixed(2));\n      setUsuario((anterior) => {\n        if (!anterior) return anterior;",
    'contexto de saldo');
}
function patchTopbar(s) {
  return replaceOnce(s,
    '      if (saldoSalvo) {\n        setSaldo(saldoSalvo);\n      } else if (parsed?.saldo !== undefined) {\n        setSaldo(String(parsed.saldo));\n      }',
    '      const saldoNumerico = saldoSalvo !== null ? Number(saldoSalvo) : Number(parsed?.saldo);\n      if (Number.isFinite(saldoNumerico)) setSaldo(saldoNumerico.toFixed(2));',
    'saldo Topbar');
}
try {
  const originals = paths.map(path => {
    if (!fs.existsSync(path)) throw new Error(`Arquivo ausente: ${path}. Abra o terminal na raiz do frontend.`);
    return fs.readFileSync(path, 'utf8');
  });
  const outputs = [patchModal(originals[0]), patchAuth(originals[1]), patchTopbar(originals[2])];
  // Só gravar depois que todas as verificações passaram.
  paths.forEach((path, i) => fs.writeFileSync(path + '.bak', originals[i], 'utf8'));
  paths.forEach((path, i) => { fs.writeFileSync(path, outputs[i], 'utf8'); console.log('Atualizado:', path); });
  console.log('Concluído. Backups .bak criados. Teste em homologação.');
} catch (error) {
  console.error('Correção não aplicada:', error.message);
  process.exitCode = 1;
}
