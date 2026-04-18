import Sidebar from './Sidebar';
import Topbar from './Topbar';
import styled from 'styled-components';

const PageShell = styled.div`
  min-height: 100vh;
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
  padding: 20px 20px 28px;

  @media (max-width: 960px) {
    padding: 14px 12px 22px;
  }

  @media (max-width: 640px) {
    padding: 10px 10px 18px;
  }
`;

export default function Layout({ children }) {
  return (
    <PageShell>
      <Topbar />
      <ContentArea>
        <Sidebar />
        <Main>{children}</Main>
      </ContentArea>
    </PageShell>
  );
}
