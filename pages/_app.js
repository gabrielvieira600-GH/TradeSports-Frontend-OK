// pages/_app.js
import '../styles/globals.css';

import Layout from '../components/Layout';
import Footer from '../components/Footer';
import { ToastProvider } from '../components/ToastProvider';
import { AuthProvider } from '../contexts/AuthContexts';
import { AdvertisingProvider } from '../contexts/AdvertisingContext';

export default function MyApp({ Component, pageProps, router }) {
  // Se alguma página usar getLayout custom, respeita.
  // Senão, envolve tudo no Layout padrão (Topbar + Sidebar, etc).
  const getLayout =
    Component.getLayout || ((page) => (
      <Layout fullBleed={['/login', '/cadastro', '/editarperfil'].includes(router.pathname)}>{page}</Layout>
    ));

  return (
    <AuthProvider>
      <AdvertisingProvider>
        <ToastProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: '1 0 auto' }}>
              {getLayout(<Component {...pageProps} />)}
            </div>

            <div style={{ flexShrink: 0 }}>
              <Footer />
            </div>
          </div>
        </ToastProvider>
      </AdvertisingProvider>
    </AuthProvider>
  );
}





