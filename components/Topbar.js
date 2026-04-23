import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { FiBell, FiSearch, FiX, FiMenu } from 'react-icons/fi';
import { MdOutlineAccountCircle } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

export default function Topbar({
  title = 'TradeSports',
  subtitle,
  searchValue = '',
  onSearchChange,
  showSearch = false,
  onOpenSidebar,
}) {
  const router = useRouter();
  const { user, saldo = 0, notifications = [], markNotificationsAsRead, logout } = useAuth();

  const [openNotif, setOpenNotif] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotif(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenNotifications = () => {
    setOpenNotif((prev) => !prev);
    if (!openNotif && unreadCount > 0) markNotificationsAsRead?.();
  };

  const authButtons = user ? (
    <RightCluster>
      {showSearch && (
        <DesktopSearchWrap>
          <SearchBox>
            <FiSearch />
            <input
              type="text"
              placeholder="Pesquisar clubes..."
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </SearchBox>
        </DesktopSearchWrap>
      )}

      <NotifWrap ref={notifRef}>
        <IconButton
          type="button"
          onClick={handleOpenNotifications}
          aria-label="Notificações"
        >
          <FiBell />
          {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
        </IconButton>

        {openNotif && (
          <NotifDropdown>
            <NotifHeader>
              <strong>Notificações</strong>
              <button type="button" onClick={() => markNotificationsAsRead?.()}>
                Marcar todas como lidas
              </button>
            </NotifHeader>

            <NotifList>
              {notifications.length === 0 ? (
                <NotifEmpty>Nenhuma notificação.</NotifEmpty>
              ) : (
                notifications.map((n) => (
                  <NotifItem key={n.id} $unread={!n.read}>
                    <div>
                      <strong>{n.title}</strong>
                      <p>{n.message}</p>
                    </div>
                    {n.time && <span>{n.time}</span>}
                  </NotifItem>
                ))
              )}
            </NotifList>
          </NotifDropdown>
        )}
      </NotifWrap>

      <BankButton type="button" onClick={() => router.push('/banco')}>
        Banco
      </BankButton>

      <UserInfo>
        <MdOutlineAccountCircle />
        <div>
          <span>{user?.nome || 'Usuário'}</span>
          <strong>R$ {Number(saldo || 0).toFixed(2)}</strong>
        </div>
      </UserInfo>

      <LogoutButton type="button" onClick={logout}>
        Sair
      </LogoutButton>
    </RightCluster>
  ) : (
    <RightCluster>
      {showSearch && (
        <DesktopSearchWrap>
          <SearchBox>
            <FiSearch />
            <input
              type="text"
              placeholder="Pesquisar clubes..."
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </SearchBox>
        </DesktopSearchWrap>
      )}

      <Link href="/login" passHref legacyBehavior>
        <ActionButton as="a">Login</ActionButton>
      </Link>
      <Link href="/cadastro" passHref legacyBehavior>
        <PrimaryButton as="a">Registrar</PrimaryButton>
      </Link>
    </RightCluster>
  );

  return (
    <TopbarShell>
      <TopbarMain>
        <LeftSide>
          <MenuButton type="button" onClick={onOpenSidebar} aria-label="Abrir menu">
            <FiMenu />
          </MenuButton>

          <LogoArea href="/">
            <LogoImage
              src="/tradesports-logo.png"
              alt={title}
            />
            {(title || subtitle) && (
              <LogoTextWrap $hideText>
                <LogoText>{title}</LogoText>
                {subtitle ? <LogoSub>{subtitle}</LogoSub> : null}
              </LogoTextWrap>
            )}
          </LogoArea>
        </LeftSide>

        {authButtons}
      </TopbarMain>

      {showSearch && (
        <MobileSearchArea>
          <MobileSearchToggle
            type="button"
            onClick={() => setMobileSearchOpen((prev) => !prev)}
          >
            {mobileSearchOpen ? <FiX /> : <FiSearch />}
            {mobileSearchOpen ? 'Fechar busca' : 'Pesquisar clubes'}
          </MobileSearchToggle>

          {mobileSearchOpen && (
            <SearchBox $mobile>
              <FiSearch />
              <input
                type="text"
                placeholder="Pesquisar clubes..."
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </SearchBox>
          )}
        </MobileSearchArea>
      )}
    </TopbarShell>
  );
}

const TopbarShell = styled.header`
  position: sticky;
  top: 0;
  z-index: 30;
  width: 100%;
  background: linear-gradient(180deg, rgba(5, 10, 30, 0.98), rgba(7, 14, 35, 0.96));
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
`;

const TopbarMain = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 86px;
  padding: 14px 18px;

  @media (min-width: 1025px) {
    padding: 14px 24px 14px 18px;
    align-items: center;
  }

  @media (max-width: 1024px) {
    min-height: 76px;
    padding: 12px 14px;
  }

  @media (max-width: 640px) {
    align-items: center;
    gap: 12px;
    min-height: auto;
    padding: 10px 12px;
  }
`;

const LeftSide = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 0 0 auto;

  @media (max-width: 640px) {
    gap: 10px;
  }
`;

const MenuButton = styled.button`
  display: none;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: #ffffff;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;

  @media (max-width: 1024px) {
    display: inline-flex;
  }
`;

const LogoArea = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  text-decoration: none;
`;

const LogoImage = styled.img`
  display: block;
  height: 64px;
  width: auto;
  object-fit: contain;

  @media (max-width: 1024px) {
    height: 54px;
  }

  @media (max-width: 640px) {
    height: 42px;
  }
`;

const LogoTextWrap = styled.div`
  display: ${({ $hideText }) => ($hideText ? 'none' : 'flex')};
  flex-direction: column;
  min-width: 0;
`;

const LogoText = styled.span`
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const LogoSub = styled.span`
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.1;
  margin-top: 3px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const RightCluster = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex: 1;
  min-width: 0;

  @media (max-width: 1024px) {
    gap: 8px;
  }

  @media (max-width: 640px) {
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
`;

const DesktopSearchWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
  flex: 1;

  @media (max-width: 900px) {
    display: none;
  }
`;

const SearchBox = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: ${({ $mobile }) => ($mobile ? '100%' : '320px')};
  border-radius: 999px;
  padding: 0 14px;
  height: 44px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);

  input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    color: #ffffff;
    font-size: 0.95rem;
  }

  input::placeholder {
    color: rgba(255, 255, 255, 0.45);
  }
`;

const IconButton = styled.button`
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.09);
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const NotifWrap = styled.div`
  position: relative;
`;

const NotifDropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 340px;
  max-width: calc(100vw - 24px);
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  z-index: 50;

  @media (max-width: 640px) {
    right: -40px;
    width: min(340px, calc(100vw - 16px));
  }
`;

const NotifHeader = styled.div`
  padding: 14px 14px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  strong {
    color: #fff;
    font-size: 0.95rem;
  }

  button {
    border: none;
    background: transparent;
    color: #60a5fa;
    font-size: 0.8rem;
    cursor: pointer;
  }
`;

const NotifList = styled.div`
  max-height: 360px;
  overflow-y: auto;
`;

const NotifEmpty = styled.div`
  padding: 16px 14px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.92rem;
`;

const NotifItem = styled.div`
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: ${({ $unread }) => ($unread ? 'rgba(59, 130, 246, 0.08)' : 'transparent')};

  div strong {
    display: block;
    color: #fff;
    font-size: 0.9rem;
    margin-bottom: 4px;
  }

  div p {
    margin: 0;
    color: rgba(255, 255, 255, 0.72);
    font-size: 0.84rem;
    line-height: 1.35;
  }

  span {
    display: inline-block;
    margin-top: 6px;
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.75rem;
  }
`;

const BankButton = styled.button`
  height: 46px;
  padding: 0 18px;
  border-radius: 14px;
  border: none;
  background: #16a34a;
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;

  &:hover {
    background: #15803d;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 0 8px;
  color: #fff;

  svg {
    font-size: 1.55rem;
    flex: 0 0 auto;
  }

  div {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  span {
    font-size: 0.82rem;
    color: rgba(255, 255, 255, 0.72);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  strong {
    font-size: 0.9rem;
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    padding: 0 4px;

    div {
      display: none;
    }
  }
`;

const LogoutButton = styled.button`
  height: 46px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
`;

const ActionButton = styled.button`
  height: 46px;
  padding: 0 18px;
  border-radius: 14px;
  border: 1px solid rgba(59, 130, 246, 0.45);
  background: rgba(59, 130, 246, 0.15);
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(59, 130, 246, 0.25);
  }
`;

const PrimaryButton = styled(ActionButton)`
  border: none;
  background: #16a34a;

  &:hover {
    background: #15803d;
  }
`;

const MobileSearchArea = styled.div`
  display: none;
  padding: 0 12px 12px;

  @media (max-width: 900px) {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
`;

const MobileSearchToggle = styled.button`
  height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  cursor: pointer;
`;