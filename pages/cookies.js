import InstitutionalLayout, { Card, Lead, PageTitle } from '../components/InstitutionalLayout';

export default function Cookies() {
  return (
    <InstitutionalLayout
      title="Política de Cookies"
      description="Entenda como a TradeSports utiliza cookies e tecnologias semelhantes."
      canonicalPath="/cookies"
    >
      <PageTitle>Política de Cookies</PageTitle>
      <Lead>
        Esta página explica, em linguagem simples, o uso de cookies e tecnologias
        semelhantes na TradeSports.
      </Lead>

      <Card>
        <h2>Cookies necessários</h2>
        <p>
          Podem ser utilizados para autenticação, proteção de sessão, segurança,
          prevenção de fraude, preferências essenciais e funcionamento técnico do
          site.
        </p>
      </Card>

      <Card>
        <h2>Medição e desempenho</h2>
        <p>
          Quando habilitados, cookies e tecnologias de medição podem ajudar a
          entender desempenho, erros, navegação agregada e uso de funcionalidades.
        </p>
      </Card>

      <Card>
        <h2>Publicidade do Google</h2>
        <p>
          A TradeSports pode utilizar Google AdSense e Google Ad Manager. Terceiros,
          incluindo o Google, podem usar cookies para veicular e medir anúncios,
          inclusive com base em visitas anteriores do usuário a este ou a outros
          sites.
        </p>
        <p>
          O usuário pode gerenciar a personalização de anúncios em{' '}
          <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer">
            adssettings.google.com
          </a>.
        </p>
      </Card>

      <Card>
        <h2>Gerenciamento</h2>
        <p>
          O navegador permite excluir, bloquear ou restringir cookies. A desativação
          de cookies estritamente necessários pode impedir o funcionamento de partes
          da plataforma.
        </p>
        <p>
          Informações adicionais sobre tratamento de dados estão na{' '}
          <a href="/privacidade">Política de Privacidade</a>.
        </p>
      </Card>
    </InstitutionalLayout>
  );
}
