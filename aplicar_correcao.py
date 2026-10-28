#!/usr/bin/env python3
# TradeSports - patch seguro, aplicado sobre os arquivos completos do GitHub.
from pathlib import Path
import shutil

files = [Path('components/NegociacaoModal.js'), Path('contexts/AuthContexts.js'), Path('components/Topbar.js')]
for p in files:
    if not p.exists(): raise SystemExit(f'Arquivo ausente: {p}. Execute na raiz do frontend.')
original = {p:p.read_text(encoding='utf-8') for p in files}

def swap(s,a,b,label):
    if s.count(a)!=1: raise RuntimeError(f'Versão incompatível em {label}: esperado 1 trecho, encontrado {s.count(a)}')
    return s.replace(a,b,1)

modal, auth, topbar = files
m=original[modal]
m=swap(m,"import { useEffect, useMemo, useRef, useState } from 'react';",
       "import { useContext, useEffect, useMemo, useRef, useState } from 'react';\nimport { AuthContext } from '../contexts/AuthContexts';",'modal import')
m=swap(m,"  const { adicionarToast } = useToast();",
       "  const { adicionarToast } = useToast();\n  const { refreshSaldo, refreshUsuario } = useContext(AuthContext);\n  const syncCounterRef = useRef(0);",'modal context')
start=m.index(' async function atualizarSaldoDoUsuario() {')
end=m.index('\n  async function enviarOrdem()',start)
m=m[:start]+''' async function atualizarSaldoDoUsuario() {
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
    // O contexto global também alimenta telas fora do modal.
    if (refreshUsuario) await refreshUsuario();
    if (refreshSaldo) await refreshSaldo();
    return completo;
  } catch (e) {
    console.error('Erro ao sincronizar saldo e cotas:', e);
    return null;
  }
}
''' +m[end:]
m=swap(m,"<Aba $ativa={modo === 'venda'} onClick={() => setModo('venda')}>",
       "<Aba $ativa={modo === 'venda'} onClick={() => { setModo('venda'); atualizarSaldoDoUsuario(); }}>","aba venda")
m=swap(m,"  const usuarioAtualizado = await atualizarUsuarioCompleto();",
       "  const usuarioAtualizado = await atualizarSaldoDoUsuario();","validação venda")
m=swap(m,"  const qtdDisp = Number(ativo?.quantidade || ativo?.cotas || 0);",
       "  const qtdDisp = Number(ativo?.quantidade ?? ativo?.cotas ?? 0);","quantidade")
# Atualização enquanto o modal estiver visível: ordens de terceiros podem executar ordens pendentes.
m=swap(m,"  const carregarOrdens = async () => {",
'''  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return undefined;
    const refresh = () => {
      if (document.visibilityState === 'visible') atualizarSaldoDoUsuario();
    };
    document.addEventListener('visibilitychange', refresh);
    return () => document.removeEventListener('visibilitychange', refresh);
  }, [isOpen]);

  const carregarOrdens = async () => {''',"visibilidade")
# Atualização periódica de posições e saldo quando o modal estiver aberto,
# pois execução de ordem pendente por terceiros não depende de clique local.
m=swap(m,"  const carregarOrdens = async () => {",
'''  useEffect(() => {
    if (!isOpen || !token) return undefined;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible' && !carregando) atualizarSaldoDoUsuario();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isOpen, token, carregando]);

  const carregarOrdens = async () => {''',"execução assíncrona")
a=original[auth]
a=swap(a,"      setUsuario((anterior) => {\n        if (!anterior) return anterior;",
       "      localStorage.setItem('saldo', novoSaldo.toFixed(2));\n      setUsuario((anterior) => {\n        if (!anterior) return anterior;","contexto saldo")
t=original[topbar]
t=swap(t,"      if (saldoSalvo) {\n        setSaldo(saldoSalvo);\n      } else if (parsed?.saldo !== undefined) {\n        setSaldo(String(parsed.saldo));\n      }",
       "      const saldoNumerico = saldoSalvo !== null ? Number(saldoSalvo) : Number(parsed?.saldo);\n      if (Number.isFinite(saldoNumerico)) setSaldo(saldoNumerico.toFixed(2));","topbar")
updated={modal:m,auth:a,topbar:t}
for p,s in updated.items():
    shutil.copy2(p,p.with_suffix(p.suffix+'.bak'))
    p.write_text(s,encoding='utf-8')
    print('Atualizado:',p)
print('Backups .bak criados. Teste em homologação antes do deploy.')
