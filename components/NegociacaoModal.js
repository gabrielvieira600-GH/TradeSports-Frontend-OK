import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import axios from 'axios';
import LivroDeOrdens from './LivroDeOrdens';
import { useToast } from '../components/ToastProvider';
import api from '../lib/api';
import PoliticaRiscoModal from "./PoliticaRiscoModal"


function verificarTokenValido(token) {
  if (!token) return false;
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return false;
    const decodedPayload = JSON.parse(atob(payloadBase64));
    return !!decodedPayload && typeof decodedPayload === 'object';
  } catch (err) {
    return false;
  }
}


export default function NegociacaoModal({ isOpen, clube, onClose, modoInicial = 'compra' }) {
  const [quantidade, setQuantidade] = useState(1);
  const [precoAtual, setPrecoAtual] = useState(0);
  const [precoInput, setPrecoInput] = useState('');
  const [preco, setPreco] = useState(0);
  const [modo, setModo] = useState(modoInicial);
  const [mensagem, setMensagem] = useState('');
  const [poderCompra, setPoderCompra] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [ordensCompra, setOrdensCompra] = useState([]);
  const [ordensVenda, setOrdensVenda] = useState([]);
  const [ipoEncerrado, setIpoEncerrado] = useState(false);
  const [cotasIPO, setCotasIPO] = useState(0);
  const { adicionarToast } = useToast();
  const [resumoBook, setResumoBook] = useState({ bestBid: null, bestAsk: null, mid: null, spreadPct: null });
  const TICK_SIZE = 0.05;
  const roundToTick = (value) => {
    const n = Number(value || 0);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Number((Math.round(n / TICK_SIZE) * TICK_SIZE).toFixed(2));
  };
  const isValidTickPrice = (value) => {
    const n = Number(value || 0);
    if (!Number.isFinite(n) || n <= 0) return false;
    const steps = n / TICK_SIZE;
    return Math.abs(steps - Math.round(steps)) < 1e-9;
  };
  const [mostrarRisco, setMostrarRisco] = useState(false)
  // handler que o Livro chama quando o usuário clica num nível
  const handleSelecionarPreco = (p) => {
    if (Number.isFinite(p)) {
      const n = Number(p);
      setPrecoAtual(n);
      setPrecoInput(n.toFixed(2));
    }
  };

  const [usuario, setUsuario] = useState(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('usuario');
      return raw && raw !== 'undefined' ? JSON.parse(raw) : null;
    }
    return null;
  });

  const meuId = usuario?.id || usuario?._id || null;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const clubeId = clube?.id;
  const precoMercado = precoAtual; // preço de mercado exibido no modal (último preço carregado)
  
  
  const registrarAceite = async (tipo, versao) => {
    try {
      const tokenLocal = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!tokenLocal) return; // sem login, apenas não registra
      await axios.post(
        'http://localhost:4001/usuario/aceites',
        { tipo, versao },
        { headers: { Authorization: `Bearer ${tokenLocal}` } }
      );
    } catch (err) {
      // não bloquear fluxo por falha de log
      console.error('Erro ao registrar aceite:', err);
    }
  };

useEffect(() => {
  const basePreco =
    clube?.precoMercado !== undefined && clube?.precoMercado !== null
      ? Number(clube.precoMercado)
      : clube?.precoAtual !== undefined && clube?.precoAtual !== null
      ? Number(clube.precoAtual)
      : clube?.preco !== undefined && clube?.preco !== null
      ? Number(clube.preco)
      : 0;

  if (Number.isFinite(basePreco) && basePreco > 0) {
    setPreco(basePreco);
    setPrecoAtual(basePreco);
    setPrecoInput(basePreco.toFixed(2));
  }
}, [clube]);

  useEffect(() => {
    if (isOpen && clube?.id) {
      if (!token || !verificarTokenValido(token)) return;
      carregarOrdens();
      verificarIPO();
    }
  }, [isOpen, clube]);

  useEffect(() => {
    setMensagem('');
    if (usuario?.saldo !== undefined) {
      setPoderCompra(Number(usuario.saldo) || 0);
    }
  }, [clube, isOpen, usuario]);

  useEffect(() => {
    setModo(modoInicial);
  }, [modoInicial]);

  const carregarOrdens = async () => {
    try {
      const clubeId = clube._id || clube?.id;
      const headers = { authorization: `Bearer ${token}` };
      const { data } = await axios.get(`http://localhost:4001/mercado/livro?clubeId=${clubeId}`, { headers });
      setOrdensCompra(data.compras || []);
      setOrdensVenda(data.vendas || []);
    } catch (err) {
      console.error('Erro ao carregar ordens:', err);
    }
  };


  const buscarClubeInfo = async (clubeId, headers) => {
    const base = 'http://localhost:4001';
    const tentativas = [
      `${base}/clube/${clubeId}`,
      `${base}/clube?id=${clubeId}`,
    ];
    for (const url of tentativas) {
      try {
        const resp = await axios.get(url, { headers });
        // alguns endpoints podem retornar { data: clube }
        return resp?.data?.data ?? resp?.data ?? null;
      } catch (e) {
        // tenta próxima rota
      }
    }
    return null;
  };

  const verificarIPO = async () => {
    try {
      if (!clubeId) return;
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const clubeInfo = await buscarClubeInfo(clubeId, headers);
      if (!clubeInfo) {
        setCotasIPO(0);
        setIpoEncerrado(true);
        return;
      }

      const cotas = Number(clubeInfo.cotasDisponiveis ?? 0);
const ipoEncerrado = cotas === 0 || Boolean(clubeInfo.ipoEncerrado);

setCotasIPO(cotas);
setIpoEncerrado(ipoEncerrado);

// 🔑 DEFINIÇÃO ÚNICA DO PREÇO BASE
let precoBase = 0;

if (!ipoEncerrado) {
  // IPO ativo → usa preço do IPO
  precoBase = Number(clubeInfo.preco ?? 0);
} else {
  // Mercado secundário → usa preçoAtual
  precoBase = Number(clubeInfo.precoAtual ?? clubeInfo.preco ?? 0);
}

// 🔑 SINCRONIZA TUDO
setPreco(precoBase);
setPrecoAtual(precoBase);
setPrecoInput(precoBase > 0 ? Number(precoBase).toFixed(2) : '');

    } catch (err) {
      console.error('Erro ao verificar IPO:', err);
      setCotasIPO(0);
      setIpoEncerrado(true);
    }
  };

  const precoTotal = (precoAtual * quantidade).toFixed(2);

  const tradeRolePreview = useMemo(() => {
    if (!ipoEncerrado) return { role: 'IPO', feePct: 0, feeValue: 0 };
    const bestBid = resumoBook?.bestBid != null ? Number(resumoBook.bestBid) : null;
    const bestAsk = resumoBook?.bestAsk != null ? Number(resumoBook.bestAsk) : null;
    const currentPrice = Number(precoAtual || 0);
    const qty = Number(quantidade || 0);
    let role = 'MAKER';

    if (modo === 'compra' && bestAsk != null && currentPrice >= bestAsk) role = 'TAKER';
    if (modo === 'venda' && bestBid != null && currentPrice <= bestBid) role = 'TAKER';

    const feePct = role === 'TAKER' ? 0.005 : 0.002;
    const feeValue = Number((currentPrice * qty * feePct).toFixed(2));
    return { role, feePct, feeValue };
  }, [ipoEncerrado, resumoBook, precoAtual, quantidade, modo]);

  const tickValidation = useMemo(() => {
    if (!ipoEncerrado) return { valid: true, suggested: null, message: '' };

    const typed = Number(precoAtual || 0);
    if (!Number.isFinite(typed) || typed <= 0) {
      const fallback = Number(preco || 0);
      return {
        valid: false,
        suggested: Number.isFinite(fallback) && fallback > 0 ? roundToTick(fallback) : null,
        message: 'Informe um preço válido.',
      };
    }

    const valid = isValidTickPrice(typed);
    const suggested = roundToTick(typed);

    return {
      valid,
      suggested,
      message: valid ? '' : `O preço deve respeitar o tick de R$ ${TICK_SIZE.toFixed(2)}. Sugestão: R$ ${suggested.toFixed(2)}.`,
    };
  }, [ipoEncerrado, precoAtual, preco]);

  const aplicarPrecoSugerido = () => {
    if (tickValidation?.suggested == null) return;
    const n = Number(tickValidation.suggested);
    setPrecoAtual(n);
    setPrecoInput(n.toFixed(2));
  };

  const melhorarPreco = () => {
    if (!ipoEncerrado) return;
    const bestBid = resumoBook?.bestBid != null ? Number(resumoBook.bestBid) : null;
    const bestAsk = resumoBook?.bestAsk != null ? Number(resumoBook.bestAsk) : null;

    if (modo === 'compra') {
      if (bestBid != null) {
        const suggested = Number((bestBid + TICK_SIZE).toFixed(2));
        const next = bestAsk != null && suggested >= bestAsk ? Number((bestAsk - TICK_SIZE).toFixed(2)) : suggested;
        if (next > 0) {
          setPrecoAtual(next);
          setPrecoInput(next.toFixed(2));
        }
      }
      return;
    }

    if (modo === 'venda' && bestAsk != null) {
      const suggested = Number((bestAsk - TICK_SIZE).toFixed(2));
      const next = bestBid != null && suggested <= bestBid ? Number((bestBid + TICK_SIZE).toFixed(2)) : Math.max(TICK_SIZE, suggested);
      if (next > 0) {
        setPrecoAtual(next);
        setPrecoInput(next.toFixed(2));
      }
    }
  };

    async function enviarOrdem() {
    setCarregando(true);
    setMensagem('');

    if (!token || !verificarTokenValido(token)) {
      setMensagem('❌ Você precisa estar logado para enviar ordens.');
      adicionarToast('❌ Efetue o login para enviar ordens.', 'erro');
      setCarregando(false);
      return;
    }
    if (!usuario || (!usuario.id && !usuario._id)) {
      setMensagem('❌ Não foi possível identificar o usuário logado.');
      adicionarToast('❌ Usuário inválido.', 'erro');
      setCarregando(false);
      return;
    }

    try {
      let response;

      // validação de quantidade disponível na venda
      if (modo === 'venda') {
        const carteira = Array.isArray(usuario?.carteira) ? usuario.carteira : [];
        const ativo =
          carteira.find((a) => String(a?.clubeId) === String(clube.id)) ||
          carteira.find((a) => String(a?.clube?.id) === String(clube.id)) ||
          carteira.find((a) => String(a?.idClube) === String(clube.id));
        const qtdDisp = Number(ativo?.quantidade || ativo?.cotas || 0);
        if (quantidade > qtdDisp) {
          setMensagem('❌ Quantidade acima do disponível na carteira.');
          adicionarToast('❌ Quantidade acima do disponível.', 'erro');
          setCarregando(false);
          return;
        }
      }

      if (modo === 'compra' && !ipoEncerrado) {
        // 🟩 COMPRA DURANTE IPO
        const res = await fetch(
          `http://localhost:4001/clube/${clube.id}/comprar`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              usuarioId: usuario.id || usuario._id,
              quantidade: Number(quantidade),
            }),
          }
        );
        response = await res.json();
        if (response.erro) throw new Error(response.erro);
      } else {
        // 🟦 MERCADO SECUNDÁRIO
        if (!isValidTickPrice(Number(precoAtual || 0))) {
          setMensagem(`❌ Preço inválido para o tick de R$ ${TICK_SIZE.toFixed(2)}.`);
          adicionarToast(`❌ Preço inválido para o tick de R$ ${TICK_SIZE.toFixed(2)}.`, 'erro');
          setCarregando(false);
          return;
        }

        const payload = {
          tipo: modo, // 'compra' ou 'venda'
          clubeId: clube.id,
          quantidade: Number(quantidade),
          preco: Number(precoAtual),
        };

        const { data } = await axios.post(
          'http://localhost:4001/mercado/ordem',
          payload,
          {
            headers: { authorization: `Bearer ${token}` },
          }
        );
        response = data;
      }

      setMensagem('✅ Ordem enviada com sucesso!');
      adicionarToast(
        `✅ ${modo === 'compra' ? 'Compra' : 'Venda'} realizada!`,
        'sucesso'
      );

      // recarrega livro / IPO / último preço
      await carregarOrdens();
      await verificarIPO();

      // 🔄 BUSCA SALDO ATUALIZADO NO BACKEND E ATUALIZA LOCALSTORAGE + ESTADOS
      try {
        const respSaldo = await api.get('/usuario/saldo'); // usa seu axios com baseURL
        const novoSaldo = Number(respSaldo?.data?.saldo ?? 0);

        setUsuario((prev) => {
          if (!prev) {
            // se por algum motivo não tiver usuário, ainda assim grava o saldo isolado
            localStorage.setItem('saldo', novoSaldo.toFixed(2));
            return prev;
          }

          const atualizado = { ...prev, saldo: novoSaldo };

          localStorage.setItem('usuario', JSON.stringify(atualizado));
          localStorage.setItem('saldo', novoSaldo.toFixed(2));

          return atualizado;
        });

        setPoderCompra(novoSaldo); // atualiza "Poder de Compra" no modal

        // avisa o Topbar para se atualizar
        window.dispatchEvent(new Event('force-topbar-update'));
      } catch (e) {
        console.error('Erro ao atualizar saldo após ordem:', e);
      }
    } catch (error) {
      let erroMsg = 'Erro desconhecido';
      if (error.response) {
        erroMsg =
          error.response.data?.erro ||
          error.response.data?.message ||
          'Erro no servidor';
      } else if (error.request) {
        erroMsg = 'Sem resposta do servidor';
      } else {
        erroMsg = error.message;
      }
      setMensagem(`❌ ${erroMsg}`);
      adicionarToast(`❌ Erro: ${erroMsg}`, 'erro');
      console.error('❌ [ERRO AO ENVIAR ORDEM]', erroMsg);
    } finally {
      setCarregando(false);
    }
  }

  // cancelar ordem do usuário logado
  async function cancelarMinhaOrdem(ordemOuId) {
    try {
      if (!token || !verificarTokenValido(token)) {
        adicionarToast('❌ Você precisa estar logado para cancelar ordens.', 'erro');
        return;
      }

      const ordemId =
        typeof ordemOuId === 'string' || typeof ordemOuId === 'number'
          ? ordemOuId
          : ordemOuId?.id;

      if (!ordemId) {
        console.error('ID de ordem inválido ao tentar cancelar:', ordemOuId);
        adicionarToast('❌ Não foi possível identificar a ordem para cancelar.', 'erro');
        return;
      }

      await axios.post(
        'http://localhost:4001/mercado/ordem/cancelar',
        { ordemId },
        {
          headers: {
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      adicionarToast('✅ Ordem cancelada com sucesso!', 'sucesso');

      await carregarOrdens();
      await verificarIPO();
    } catch (error) {
      console.error('Erro ao cancelar ordem:', error);

      const msg =
        error?.response?.data?.erro ||
        error?.response?.data?.message ||
        'Não foi possível cancelar a ordem. Tente novamente.';

      adicionarToast(`❌ ${msg}`, 'erro');
    }
  }

  if (!isOpen || !clube) return null;

  return (
    
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <FecharX onClick={onClose}>×</FecharX>
        <ModalContentInner>
          <Header>
            <Image src={clube.escudo} alt={clube.nome} width={40} height={40}/>
            <div>
              <h2>{clube.nome}</h2>
              <PrecoAtual />
            </div>
          </Header>
{mostrarRisco && (
  <PoliticaRiscoModal
    exigirAceite
    onAceitar={async () => {
      localStorage.setItem("leuPoliticaRisco", "true");
      setMostrarRisco(false);
      setMostrarModal(true);
    }}
  />
)}

          {!usuario && (
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <BotaoLogin onClick={() => window.location.href = '/login'}>
                Ir para Login
              </BotaoLogin>
            </div>
          )}

          <Acoes>
            <Aba $ativa={modo === 'compra'} onClick={() => setModo('compra')}>Compra</Aba>
            <Aba $ativa={modo === 'venda'} onClick={() => setModo('venda')}>Venda</Aba>
          </Acoes>

          <Bloco>
            <label>Preço (R$)</label>
            <InputNumero
              type="text"
              inputMode="decimal"
              value={ipoEncerrado ? precoInput : Number(precoAtual || 0).toFixed(2)}
              readOnly={!ipoEncerrado}
              onChange={(e) => {
                if (!ipoEncerrado) return;
                const raw = e.target.value.replace(',', '.');
                if (!/^\d*(\.\d{0,2})?$/.test(raw)) return;
                setPrecoInput(raw);
                if (raw === '') {
                  setPrecoAtual(0);
                  return;
                }
                const v = Number(raw);
                setPrecoAtual(Number.isFinite(v) ? v : 0);
              }}
              onBlur={() => {
                if (!ipoEncerrado) return;
                if (precoInput === '') return;
                const v = Number(precoInput || 0);
                setPrecoAtual(Number.isFinite(v) ? v : 0);
              }}
            />

            {ipoEncerrado && (
              <>
                <TickMeta>
                  <span>Tick mínimo</span>
                  <strong>R$ {TICK_SIZE.toFixed(2)}</strong>
                </TickMeta>

                {!tickValidation.valid && (
                  <TickAlert>
                    <div>
                      <strong>Preço inválido para o mercado</strong>
                      <span>{tickValidation.message}</span>
                    </div>
                    {tickValidation.suggested != null && (
                      <BotaoCorrigirTick type="button" onClick={aplicarPrecoSugerido}>
                        Corrigir para R$ {Number(tickValidation.suggested).toFixed(2)}
                      </BotaoCorrigirTick>
                    )}
                  </TickAlert>
                )}

                {tickValidation.valid && Number(precoAtual || 0) > 0 && (
                  <TickOk>Preço válido para o tick do mercado.</TickOk>
                )}
              </>
            )}
          </Bloco>

          <Bloco>
            <label>Quantidade</label>
            <InputNumero
              type="number"
              min="0"
              value={quantidade || ''}
              onChange={(e) => {
                const valor = parseInt(e.target.value);
                setQuantidade(isNaN(valor) ? 0 : valor);
              }}
            />
          </Bloco>

          <Bloco>
            <LinhaInfo><span>Valor da Ordem</span><strong>R$ {precoTotal}</strong></LinhaInfo>
            <PrecoAtual />
            <LinhaInfo><span>Preço de Mercado</span><span>R$ {Number(precoMercado).toFixed(2)}</span></LinhaInfo>
            {ipoEncerrado && (
              <>
                <LinhaInfo><span>Melhor compra</span><span>{resumoBook?.bestBid != null ? `R$ ${Number(resumoBook.bestBid).toFixed(2)}` : '-'}</span></LinhaInfo>
                <LinhaInfo><span>Melhor venda</span><span>{resumoBook?.bestAsk != null ? `R$ ${Number(resumoBook.bestAsk).toFixed(2)}` : '-'}</span></LinhaInfo>
                <LinhaInfo>
                  <span>Você será</span>
                  <span>{tradeRolePreview.role} — taxa {(tradeRolePreview.feePct * 100).toFixed(2)}%</span>
                </LinhaInfo>
                <LinhaInfo>
                  <span>Taxa estimada</span>
                  <span>R$ {tradeRolePreview.feeValue.toFixed(2)}</span>
                </LinhaInfo>
                <BotaoMelhorarPreco type="button" onClick={melhorarPreco}>
                  Melhorar preço em R$ {TICK_SIZE.toFixed(2)}
                </BotaoMelhorarPreco>
              </>
            )}

            {modo === 'compra' ? (
              <LinhaInfo>
                <span>Poder de Compra</span>
                <span>{usuario ? `R$ ${poderCompra || '0.00'}` : 'Faça login para visualizar'}</span>
              </LinhaInfo>
            ) : (
              <LinhaInfo>
                <span>Cotas disponíveis</span>
                <span>
                  {(() => {
                    const ativo = usuario?.carteira?.find(a => String(a.clubeId) === String(clube.id));
                    return ativo?.quantidade || 0;
                  })()}
                </span>
              </LinhaInfo>
            )}

            {!ipoEncerrado && (
              <LinhaInfo>
                <span>Cotas no IPO</span>
                <span>{cotasIPO}</span>
              </LinhaInfo>
            )}
          </Bloco>

          {mensagem && <Mensagem>{mensagem}</Mensagem>}

          <BotaoComprar
            onClick={enviarOrdem}
            disabled={
              (ipoEncerrado && !tickValidation.valid) ||
              carregando ||
              precoAtual <= 0 ||
              quantidade < 1 ||
              !usuario ||
              (modo === 'venda' && (() => {
                const carteira = Array.isArray(usuario?.carteira) ? usuario.carteira : [];
                const ativo =
                  carteira.find(a => String(a?.clubeId) === String(clube.id)) ||
                  carteira.find(a => String(a?.clube?.id) === String(clube.id)) ||
                  carteira.find(a => String(a?.idClube) === String(clube.id));
                const qtdDisp = Number(ativo?.quantidade || ativo?.cotas || 0);
                return quantidade > qtdDisp;
              })())
            }
          >
            {!usuario
              ? 'Faça login para negociar'
              : carregando
              ? 'Enviando...'
              : modo === 'compra'
              ? 'Comprar'
              : 'Vender'}
          </BotaoComprar>

          <LivroDeOrdens
            clubeId={clube.id}
            lado={modo}
            onSelecionarPreco={handleSelecionarPreco}
            onResumoChange={setResumoBook}
            ordensCompra={ordensCompra}
            ordensVenda={ordensVenda}
            meuId={meuId}
            onCancelar={cancelarMinhaOrdem}
          />

        </ModalContentInner>
      </ModalContainer>
    </Overlay>
  );
}

// Styled Components (iguais ao seu arquivo atual)

const TickMeta = styled.div`
  margin-top: 0.55rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #94a3b8;
  font-size: 0.8rem;
  padding: 0.55rem 0.7rem;
  border-radius: 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(148,163,184,0.10);

  strong {
    color: #e5e7eb;
    font-weight: 800;
  }
`;

const TickAlert = styled.div`
  margin-top: 0.6rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  border-radius: 12px;
  padding: 0.75rem;
  background: linear-gradient(180deg, rgba(239,68,68,0.16), rgba(239,68,68,0.08));
  border: 1px solid rgba(239,68,68,0.28);

  div {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  strong {
    color: #fecaca;
    font-size: 0.84rem;
  }

  span {
    color: #fca5a5;
    font-size: 0.78rem;
    line-height: 1.35;
  }
`;

const TickOk = styled.div`
  margin-top: 0.6rem;
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  background: linear-gradient(180deg, rgba(22,163,74,0.14), rgba(22,163,74,0.06));
  border: 1px solid rgba(22,163,74,0.24);
  color: #bbf7d0;
  font-size: 0.8rem;
  font-weight: 700;
`;

const BotaoCorrigirTick = styled.button`
  border: none;
  border-radius: 10px;
  padding: 0.65rem 0.8rem;
  cursor: pointer;
  background: linear-gradient(180deg, #2563eb, #1d4ed8);
  color: white;
  font-weight: 800;
  white-space: nowrap;

  &:hover {
    filter: brightness(1.05);
  }
`;

const BotaoMelhorarPreco = styled.button`
  margin-top: 0.75rem;
  width: 100%;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.35);
  background: rgba(59, 130, 246, 0.08);
  color: #e5e7eb;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: rgba(59, 130, 246, 0.16);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
  display: flex;
  justify-content: flex-end;
`;
const MensagemErro = styled.p`
  color: #ef4444;
  background-color: #fee2e2;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

const BotaoLogin = styled.button`
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #2563eb;
  }
`;

const ModalContainer = styled.div`
  background-color: #0f172a;
  padding: 1.5rem;
  width: 380px;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const ModalContentInner = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #1e293b;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #475569;
    border-radius: 8px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #64748b;
  }
`;

const FecharX = styled.button`
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 1.5rem;
  color: #94a3b8;
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    color: white;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  h2 {
    font-size: 1.2rem;
    color: white;
    margin: 0;
  }
`;

const PrecoAtual = styled.div`
  font-weight: bold;
  color: #ffffff;

  span {
    color: #f87171;
    font-weight: normal;
    margin-left: 8px;
  }
`;

const Acoes = styled.div`
  display: flex;
  margin-top: 1.5rem;
`;

const Aba = styled.div`
  flex: 1;
  text-align: center;
  padding: 0.75rem;
  background-color: ${({ $ativa }) => ($ativa ? '#1d4ed8' : '#1e293b')};
  color: white;
  font-weight: 500;
  cursor: pointer;

  &:first-child {
    border-right: 1px solid #334155;
  }
`;

const Bloco = styled.div`
  margin-top: 1.5rem;

  label {
    color: #cbd5e1;
    display: block;
    margin-bottom: 0.25rem;
  }
`;

const InputNumero = styled.input`
  width: 100%;
  padding: 0.6rem;
  background-color: #1e293b;
  border: none;
  color: white;
  font-size: 1rem;
  border-radius: 4px;
`;

const LinhaInfo = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0;
  color: #cbd5e1;
`;

const Mensagem = styled.p`
  color: #22c55e;
  margin-top: 1rem;
  font-weight: 500;
`;

const BotaoComprar = styled.button`
  margin-top: 1.5rem;
  width: 100%;
  background-color: #16a34a;
  color: white;
  border: none;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: #15803d;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;