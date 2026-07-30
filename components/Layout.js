import Sidebar from './Sidebar';
import Topbar from './Topbar';
import styled from 'styled-components';

const PageShell = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  background: #0c1c2c;
  color: white;
`;

const ContentArea = styled.div`
  display: flex;
  align-items: stretch;
  min-height: calc(100vh - 73px);

  @media (max-width: 960px) {
    flex-direction: column;
    min-height: auto;
  }
`;

const Main = styled.main`
  flex: 1;
  min-width: 0;
  background-color: #0c1c2c;
  color: white;
  padding: ${({ $fullBleed }) => ($fullBleed ? '0' : '20px 20px 28px')};

  @media (max-width: 960px) {
    padding: ${({ $fullBleed }) => ($fullBleed ? '0' : '14px 12px 22px')};
    width: 100%;
  }

  @media (max-width: 640px) {
    padding: ${({ $fullBleed }) =>
      $fullBleed
        ? '0'
        : `10px
          max(10px, env(safe-area-inset-right))
          max(18px, env(safe-area-inset-bottom))
          max(10px, env(safe-area-inset-left))`};
  }
`;

export default function Layout({ children, fullBleed = false }) {
  return (
    <PageShell>
      <Topbar />
      <ContentArea>
        <Sidebar />
        <Main $fullBleed={fullBleed}>{children}</Main>
      </ContentArea>
    </PageShell>
  );
}
