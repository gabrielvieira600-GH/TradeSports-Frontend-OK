import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AuthContext } from './AuthContexts';
import api from '../lib/api';
import { advertisingConfig } from '../lib/advertising/config';

const ESTADO_INICIAL = Object.freeze({
  audience: 'resolving',
  plano: null,
  resolved: false,
  canShowAds: false,
});

const RESOLUCAO_INICIAL = Object.freeze({
  authKey: null,
  value: ESTADO_INICIAL,
});

export const AdvertisingContext = createContext(ESTADO_INICIAL);

function normalizarPlano(valor) {
  if (valor === 'premium') return 'premium';
  if (valor === 'lite') return 'lite';
  return null;
}

export function AdvertisingProvider({ children }) {
  const { token, usuario, loading: authLoading } = useContext(AuthContext);
  const [resolucao, setResolucao] = useState(RESOLUCAO_INICIAL);

  const planoDoContexto = normalizarPlano(
    usuario?.planoEfetivo || usuario?.plano
  );
  const authKey = authLoading ? 'loading' : token || 'anonymous';

  useEffect(() => {
    let ativo = true;

    if (authLoading) {
      setResolucao({ authKey, value: ESTADO_INICIAL });
      return () => {
        ativo = false;
      };
    }

    if (!token) {
      setResolucao({
        authKey,
        value: {
          audience: 'anonymous',
          plano: null,
          resolved: true,
          canShowAds: advertisingConfig.enabled,
        },
      });

      return () => {
        ativo = false;
      };
    }

    setResolucao({ authKey, value: ESTADO_INICIAL });

    async function resolverPlano() {
      try {
        const { data } = await api.get('/usuario/plano');
        if (!ativo) return;

        const plano = normalizarPlano(data?.planoEfetivo || data?.plano);

        if (plano === 'premium') {
          setResolucao({
            authKey,
            value: {
              audience: 'premium',
              plano,
              resolved: true,
              canShowAds: false,
            },
          });
          return;
        }

        if (plano === 'lite') {
          setResolucao({
            authKey,
            value: {
              audience: 'lite',
              plano,
              resolved: true,
              canShowAds: advertisingConfig.enabled,
            },
          });
          return;
        }

        setResolucao({
          authKey,
          value: {
            audience: 'unknown',
            plano: null,
            resolved: true,
            canShowAds: false,
          },
        });
      } catch (err) {
        if (!ativo) return;

        console.error('Erro ao confirmar elegibilidade de publicidade:', err);
        setResolucao({
          authKey,
          value: {
            audience: 'unknown',
            plano: null,
            resolved: true,
            canShowAds: false,
          },
        });
      }
    }

    resolverPlano();

    return () => {
      ativo = false;
    };
  }, [authKey, authLoading, planoDoContexto, token]);

  const valor = useMemo(
    () => (resolucao.authKey === authKey ? resolucao.value : ESTADO_INICIAL),
    [authKey, resolucao]
  );

  return (
    <AdvertisingContext.Provider value={valor}>
      {children}
    </AdvertisingContext.Provider>
  );
}

export function useAdvertising() {
  return useContext(AdvertisingContext);
}
