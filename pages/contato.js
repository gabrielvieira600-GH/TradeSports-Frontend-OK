import InstitutionalLayout, { Card, Lead, Note, PageTitle } from '../components/InstitutionalLayout';

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || '';
const PRIVACY_EMAIL = process.env.NEXT_PUBLIC_PRIVACY_EMAIL?.trim() || SUPPORT_EMAIL;

export default function Contato() {
  return (
    <InstitutionalLayout
      title="Contato"
      description="Canais oficiais de contato, suporte e privacidade da TradeSports."
      canonicalPath="/contato"
    >
      <PageTitle>Contato</PageTitle>
      <Lead>
        Utilize somente os canais oficiais abaixo para falar com a TradeSports.
      </Lead>

      {!SUPPORT_EMAIL && (
        <Note>
          Usuários cadastrados podem abrir um chamado pela Central de Suporte. O
          e-mail público de atendimento pode ser configurado na Vercel pela variável
          NEXT_PUBLIC_SUPPORT_EMAIL.
        </Note>
      )}

      <Card>
        <h2>Atendimento geral</h2>
        {SUPPORT_EMAIL ? (
          <p>
            E-mail: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </p>
        ) : (
          <p>
            Usuários cadastrados: <a href="/suporte">abrir a Central de Suporte</a>.
          </p>
        )}
      </Card>

      <Card>
        <h2>Privacidade e dados pessoais</h2>
        {PRIVACY_EMAIL ? (
          <p>
            E-mail: <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>
          </p>
        ) : (
          <p>
            Solicitações relacionadas à LGPD podem ser encaminhadas pela Central de
            Suporte após autenticação.
          </p>
        )}
        <p>
          Consulte também a <a href="/privacidade">Política de Privacidade</a>.
        </p>
      </Card>

      <Card>
        <h2>Segurança</h2>
        <p>
          Nunca envie senha, códigos de autenticação ou credenciais completas em uma
          solicitação de suporte. A TradeSports não solicita senha completa por
          e-mail.
        </p>
      </Card>
    </InstitutionalLayout>
  );
}
