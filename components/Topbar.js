import styled from 'styled-components';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function Topbar() {
  const [saldo, setSaldo] = useState('0.00');
  const [usuario, setUsuario] = useState(null);
  const [bancoAberto, setBancoAberto] = useState(false);
  const [notifAberto, setNotifAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const bancoRef = useRef(null);
  const notifRef = useRef(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const hydrateUser = () => {
    try {
      const usuarioSalvo = localStorage.getItem('usuario');
      const saldoSalvo = localStorage.getItem('saldo');
      const parsed = usuarioSalvo && usuarioSalvo !== 'undefined' ? JSON.parse(usuarioSalvo) : null;
      setUsuario(parsed);
      if (saldoSalvo) setSaldo(saldoSalvo);
      else if (parsed?.saldo !== undefined) setSaldo(String(parsed.saldo));
    } catch (e) {
      setUsuario(null);
    }
  };

  const carregarNotificacoes = async () => {
    try {
      if (!token) return;
      const { data } = await axios.get(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificacoes(Array.isArray(data?.notifications) ? data.notifications : []);
      setUnreadCount(Number(data?.unreadCount || 0));
    } catch {}
  };

  useEffect(() => {
    hydrateUser();
    carregarNotificacoes();
  }, []);

  useEffect(() => {
    const atualizar = () => {
      hydrateUser();
      carregarNotificacoes();
    };
    window.addEventListener('storage', atualizar);
    window.addEventListener('force-topbar-update', atualizar);
    window.addEventListener('watchlist-updated', atualizar);
    window.addEventListener('notifications-updated', atualizar);
    return () => {
      window.removeEventListener('storage', atualizar);
      window.removeEventListener('force-topbar-update', atualizar);
      window.removeEventListener('watchlist-updated', atualizar);
      window.removeEventListener('notifications-updated', atualizar);
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const t = setInterval(() => carregarNotificacoes(), 30000);
    return () => clearInterval(t);
  }, [token]);

  useEffect(() => {
    const onClick = (e) => {
      if (bancoAberto && bancoRef.current && !bancoRef.current.contains(e.target)) setBancoAberto(false);
      if (notifAberto && notifRef.current && !notifRef.current.contains(e.target)) setNotifAberto(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [bancoAberto, notifAberto]);

  const marcarTodasComoLidas = async () => {
    if (!token) return;
    try {
      await axios.post(`${API_BASE}/notifications/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await carregarNotificacoes();
      window.dispatchEvent(new Event('notifications-updated'));
    } catch {}
  };

  const marcarUmaComoLida = async (id) => {
    if (!token) return;
    try {
      await axios.post(`${API_BASE}/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await carregarNotificacoes();
      window.dispatchEvent(new Event('notifications-updated'));
    } catch {}
  };

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/';
  };

  const notificationsPreview = useMemo(() => notificacoes.slice(0, 12), [notificacoes]);

  return (
    <Barra>
      <Logo><Link href="/">🏆 TradeSports</Link></Logo>
      <Menu>
        {usuario ? (
          <>
            <Info>
              <Usuario>👤 {usuario.nomeUsuario || usuario.nome}</Usuario>
              <Saldo>💰 R$ {parseFloat(saldo || 0).toFixed(2)}</Saldo>
            </Info>

            <IconWrap ref={notifRef}>
              <IconButton type="button" onClick={() => setNotifAberto(v => !v)} aria-label="Notificações">
                <Bell>🔔</Bell>
                {unreadCount > 0 && <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>}
              </IconButton>

              {notifAberto && (
                <NotifDropdown>
                  <NotifHeader>
                    <div><strong>Notificações</strong><small>{unreadCount} não lida(s)</small></div>
                    <MarkAllBtn type="button" onClick={marcarTodasComoLidas}>Marcar tudo como lido</MarkAllBtn>
                  </NotifHeader>
                  {notificationsPreview.length === 0 ? (
                    <NotifEmpty>Você ainda não recebeu notificações.</NotifEmpty>
                  ) : (
                    <NotifList>
                      {notificationsPreview.map((n) => (
                        <NotifItem key={n.id} $unread={!n.read} onClick={() => marcarUmaComoLida(n.id)}>
                          <NotifDot $unread={!n.read} />
                          <NotifBody>
                            <strong>{n.title}</strong>
                            <p>{n.body}</p>
                            <small>{new Date(n.createdAt).toLocaleString('pt-BR')}</small>
                          </NotifBody>
                        </NotifItem>
                      ))}
                    </NotifList>
                  )}
                </NotifDropdown>
              )}
            </IconWrap>

            <BancoWrap ref={bancoRef}>
              <BotaoVerde type="button" onClick={() => setBancoAberto(v => !v)}>Banco</BotaoVerde>
              {bancoAberto && (
                <Dropdown>
                  <DropLink href="/carteira">Carteira</DropLink>
                  <DropLink href="/minhas-ordens">Minhas Ordens</DropLink>
                  <DropLink href="/minhas-transacoes">Minhas Transações</DropLink>
                  <DropLink href="/extrato">Extrato</DropLink>
                  <DropLink href="/deposito">Depósito</DropLink>
                  <DropLink href="/saque">Saque</DropLink>
                </Dropdown>
              )}
            </BancoWrap>

            <Botao onClick={handleLogout}>Sair</Botao>
          </>
        ) : (
          <>
            <Link href="/login" passHref><BotaoAzul>Login</BotaoAzul></Link>
            <Link href="/cadastro" passHref><BotaoVerde>Registrar</BotaoVerde></Link>
          </>
        )}
      </Menu>
    </Barra>
  );
}

const Barra = styled.header`width:96.5%;padding:1rem 2rem;background:linear-gradient(180deg,#0f172a,#0b1324);display:flex;align-items:center;justify-content:space-between;color:white;border-bottom:1px solid rgba(148,163,184,.12);`;
const Logo = styled.h1`font-size:1.2rem;font-weight:bold;a{color:white;text-decoration:none;}`;
const Menu = styled.div`display:flex;align-items:center;gap:.75rem;`;
const Info = styled.div`display:flex;align-items:center;gap:.75rem;margin-right:.25rem;`;
const Usuario = styled.div`color:#cbd5e1;font-weight:600;`;
const Saldo = styled.div`color:#f8fafc;font-weight:800;`;
const IconWrap = styled.div`position:relative;`;
const IconButton = styled.button`position:relative;height:40px;width:40px;border-radius:12px;border:1px solid rgba(148,163,184,.16);background:rgba(255,255,255,.04);color:white;cursor:pointer;font-size:1.05rem;&:hover{background:rgba(255,255,255,.08);}`;
const Bell = styled.span`display:inline-flex;align-items:center;justify-content:center;`;
const Badge = styled.span`position:absolute;top:-6px;right:-6px;min-width:19px;height:19px;padding:0 5px;border-radius:999px;background:linear-gradient(180deg,#ef4444,#dc2626);color:#fff;font-size:11px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;`;
const NotifDropdown = styled.div`position:absolute;right:0;top:calc(100% + 10px);width:390px;background:linear-gradient(180deg,#0f172a,#111827);border:1px solid rgba(148,163,184,.14);border-radius:16px;box-shadow:0 22px 60px rgba(0,0,0,.35);overflow:hidden;z-index:50;`;
const NotifHeader = styled.div`padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid rgba(148,163,184,.1);strong{display:block;color:#f8fafc;font-size:.95rem;}small{color:#94a3b8;}`;
const MarkAllBtn = styled.button`border:0;background:transparent;color:#60a5fa;font-weight:700;cursor:pointer;`;
const NotifList = styled.div`max-height:420px;overflow:auto;`;
const NotifItem = styled.button`width:100%;display:flex;gap:12px;text-align:left;border:0;cursor:pointer;padding:14px 16px;background:${({ $unread }) => ($unread ? 'rgba(59,130,246,.08)' : 'transparent')};border-bottom:1px solid rgba(148,163,184,.08);&:hover{background:rgba(255,255,255,.05);}`;
const NotifDot = styled.span`width:10px;height:10px;margin-top:6px;border-radius:999px;background:${({ $unread }) => ($unread ? '#22c55e' : '#334155')};flex:0 0 auto;`;
const NotifBody = styled.div`strong{color:#f8fafc;display:block;margin-bottom:4px;}p{color:#cbd5e1;margin:0 0 6px;line-height:1.35;font-size:.9rem;}small{color:#64748b;}`;
const NotifEmpty = styled.div`padding:22px 16px;color:#94a3b8;text-align:center;`;
const BancoWrap = styled.div`position:relative;`;
const Dropdown = styled.div`position:absolute;right:0;top:calc(100% + 8px);min-width:220px;background:#0f172a;border:1px solid rgba(148,163,184,.12);border-radius:12px;padding:8px;display:flex;flex-direction:column;z-index:30;box-shadow:0 14px 32px rgba(0,0,0,.25);`;
const DropLink = styled(Link)`color:#e5e7eb;text-decoration:none;padding:10px 12px;border-radius:8px;&:hover{background:rgba(255,255,255,.05);}`;
const BaseButton = styled.button`border:none;padding:8px 12px;border-radius:10px;font-size:.9rem;cursor:pointer;font-weight:700;`;
const BotaoAzul = styled(BaseButton)`background:#3b82f6;color:white;&:hover{background:#2563eb;}`;
const BotaoVerde = styled(BaseButton)`background:#16a34a;color:white;&:hover{background:#15803d;}`;
const Botao = styled(BaseButton)`background:#1e293b;color:white;&:hover{background:#334155;}`;
