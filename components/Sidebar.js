import Link from 'next/link';
import styled from 'styled-components';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { LeagueBadge } from './ClubBadge';

const mercados = [
  {
    href: '/brasileirao-a',
    nome: 'Brasileirão Série A',
    badge: 'brasileirao-serie-a',
  },
  {
    href: '/brasileirao-b',
    nome: 'Brasileirão Série B',
    badge: 'brasileirao-serie-b',
  },
  {
    href: '/premierleague-a',
    nome: 'Premier League',
    badge: 'premier-league',
  },
  {
    href: '/laliga-a',
    nome: 'La Liga',
    badge: 'la-liga',
  },
  {
    href: '/bundesliga',
    nome: 'Bundesliga',
    badge: 'bundesliga',
  },
  {
    href: '/ligue-1',
    nome: 'Ligue 1',
    badge: 'ligue-1',
  },
  {
    href: '/eredivisie',
    nome: 'Eredivisie',
    badge: 'eredivisie',
  },
  {
    href: '/nbaoeste',
    nome: 'NBA Oeste',
    badge: 'nba',
  },
  {
    href: '/nbaleste',
    nome: 'NBA Leste',
    badge: 'nba',
  },
  {
    href: '/nfloeste',
    nome: 'NFL Oeste',
    badge: 'nfl',
  },
  {
    href: '/nflleste',
    nome: 'NFL Leste',
    badge: 'nfl',
  },
];

export default function Sidebar() {
  const router = useRouter();
  const [minimizado, setMinimizado] = useState(false);
  const [mobileAberto, setMobileAberto] = useState(false);
  const mercadoCount = useMemo(() => mercados.length, []);

  useEffect(() => {
    setMobileAberto(false);
  }, [router.asPath]);

  return (
    <SidebarShell $minimizado={minimizado}>
      <SidebarContainer $minimizado={minimizado}>
        <DesktopHeader>
          <BrandWrap>
            {!minimizado && (
              <BrandText>
                <Title>⚽ Mercados</Title>
                <Subtitle>{mercadoCount} ligas disponíveis</Subtitle>
              </BrandText>
            )}
          </BrandWrap>

          <ToggleButton
            type="button"
            onClick={() => setMinimizado((v) => !v)}
            aria-label={minimizado ? 'Expandir sidebar' : 'Minimizar sidebar'}
            title={minimizado ? 'Expandir sidebar' : 'Minimizar sidebar'}
          >
            {minimizado ? '»' : '«'}
          </ToggleButton>
        </DesktopHeader>

        <MobileHeader
          type="button"
          onClick={() => setMobileAberto((aberto) => !aberto)}
          aria-expanded={mobileAberto}
          aria-controls="menu-mercados-mobile"
        >
          <MobileHeaderText>
            <MobileHeaderIcon>⚽</MobileHeaderIcon>
            <span>
              <strong>Mercados</strong>
              <small>{mercadoCount} ligas disponíveis</small>
            </span>
          </MobileHeaderText>
          <MobileChevron $aberto={mobileAberto}>⌄</MobileChevron>
        </MobileHeader>

        {!minimizado && <SectionLabel>Todos os mercados</SectionLabel>}

        <Nav id="menu-mercados-mobile" $mobileAberto={mobileAberto}>
          {mercados.map((item) => (
            <NavItem key={item.href}>
              <StyledLink
                href={item.href}
                title={item.nome}
                aria-current={
                  router.pathname.toLowerCase() === item.href ? 'page' : undefined
                }
              >
                <LinkInner $minimizado={minimizado}>
                  <LeagueIconWrap>
                    <LeagueBadge liga={item.badge} size={28} />
                  </LeagueIconWrap>

                  <Label $minimizado={minimizado}>{item.nome}</Label>
                  <Arrow $minimizado={minimizado}>›</Arrow>
                </LinkInner>
              </StyledLink>
            </NavItem>
          ))}
        </Nav>
      </SidebarContainer>
    </SidebarShell>
  );
}

const SidebarShell = styled.div`
  position: relative;
  width: ${({ $minimizado }) => ($minimizado ? '86px' : '272px')};
  transition: width 0.22s ease;
  flex: 0 0 auto;

  @media (max-width: 960px) {
    width: 100%;
  }
`;

const SidebarContainer = styled.aside`
  width: 100%;
  min-height: calc(100vh - 73px);
  background: linear-gradient(180deg, #0f172a 0%, #0b1324 100%);
  border-right: 1px solid rgba(148, 163, 184, 0.12);
  padding: ${({ $minimizado }) => ($minimizado ? '18px 12px' : '20px 16px')};
  color: white;
  transition: padding 0.22s ease;
  box-sizing: border-box;

  @media (max-width: 960px) {
    min-height: auto;
    border-right: none;
    border-bottom: 1px solid rgba(148, 163, 184, 0.12);
    padding: 10px 10px 12px;
  }
`;

const DesktopHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;

  @media (max-width: 960px) {
    display: none;
  }
`;

const MobileHeader = styled.button`
  display: none;

  @media (max-width: 960px) {
    width: 100%;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 7px 10px;
    border: 1px solid rgba(148, 163, 184, 0.13);
    border-radius: 13px;
    background: rgba(255, 255, 255, 0.035);
    color: #f8fafc;
    text-align: left;
    cursor: pointer;
  }
`;

const MobileHeaderText = styled.span`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;

  > span:last-child {
    min-width: 0;
    display: grid;
    gap: 2px;
  }

  strong {
    font-size: 0.9rem;
  }

  small {
    color: #94a3b8;
    font-size: 0.76rem;
  }
`;

const MobileHeaderIcon = styled.span`
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 10px;
  background: rgba(34, 197, 94, 0.1);
`;

const MobileChevron = styled.span`
  color: #94a3b8;
  font-size: 1.25rem;
  line-height: 1;
  transform: rotate(${({ $aberto }) => ($aberto ? '180deg' : '0deg')});
  transition: transform 0.18s ease;
`;

const BrandWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const BrandText = styled.div`
  min-width: 0;
`;

const Title = styled.h2`
  color: #f8fafc;
  margin: 0;
  font-size: 1.02rem;
  font-weight: 800;
`;

const Subtitle = styled.div`
  margin-top: 2px;
  color: #94a3b8;
  font-size: 0.78rem;
`;

const ToggleButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.04);
  color: #e5e7eb;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 800;
  flex: 0 0 auto;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  @media (max-width: 960px) {
    display: none;
  }
`;

const SectionLabel = styled.div`
  color: #00ff95;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 10px;
  padding-left: 2px;

  @media (max-width: 960px) {
    display: none;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 2px;

  @media (max-width: 960px) {
    display: ${({ $mobileAberto }) => ($mobileAberto ? 'grid' : 'none')};
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    max-height: min(60dvh, 520px);
    margin-top: 9px;
    padding: 2px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const NavItem = styled.div`
  width: 100%;

  @media (max-width: 960px) {
    width: 100%;
  }
`;

const StyledLink = styled(Link)`
  display: block;
  text-decoration: none;

  &[aria-current='page'] > div {
    border-color: rgba(34, 197, 94, 0.28);
    background: rgba(34, 197, 94, 0.09);
  }
`;

const LinkInner = styled.div`
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: ${({ $minimizado }) =>
    $minimizado ? 'center' : 'flex-start'};
  gap: 12px;
  padding: ${({ $minimizado }) => ($minimizado ? '8px 4px' : '8px 10px')};
  border-radius: 14px;
  color: #f8fafc;
  transition: all 0.16s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  @media (max-width: 960px) {
    min-height: 48px;
    justify-content: flex-start;
    padding: 7px 10px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(148, 163, 184, 0.08);
  }
`;

const LeagueIconWrap = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.08);
  flex: 0 0 auto;

  @media (max-width: 960px) {
    width: 34px;
    height: 34px;
    border-radius: 10px;
  }
`;

const Label = styled.span`
  display: ${({ $minimizado }) => ($minimizado ? 'none' : 'inline')};
  flex: 1;
  min-width: 0;
  font-size: 0.94rem;
  font-weight: 600;
  color: #e2e8f0;

  @media (max-width: 960px) {
    display: inline;
  }
`;

const Arrow = styled.span`
  display: ${({ $minimizado }) => ($minimizado ? 'none' : 'inline')};
  color: #64748b;
  font-size: 1.15rem;
  flex: 0 0 auto;

  @media (max-width: 960px) {
    display: none;
  }
`;
