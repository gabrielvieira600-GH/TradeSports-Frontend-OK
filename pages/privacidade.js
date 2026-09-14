import InstitutionalLayout, { Card, Lead, Note, PageTitle } from '../components/InstitutionalLayout';

export default function Privacidade() {
  return (
    <InstitutionalLayout
      title="Política de Privacidade"
      description="Saiba como a TradeSports trata dados pessoais, cookies e dados relacionados à publicidade do Google."
      canonicalPath="/privacidade"
    >
      <PageTitle>Política de Privacidade</PageTitle>
      <Lead>
        Esta Política descreve o tratamento de dados pessoais na TradeSports,
        incluindo dados de cadastro, segurança, uso do site, cookies e publicidade.
        Última atualização: 14 de setembro de 2026.
      </Lead>

      <Note>
        A TradeSports opera atualmente como ambiente de simulação com unidades
        virtuais T$. Não há depósito, saque ou conversão de T$ em dinheiro real no
        ambiente público atual.
      </Note>

      <Card>
        <h2>1. Dados que podemos tratar</h2>
        <p>
          Podemos tratar dados fornecidos no cadastro, como nome, sobrenome, e-mail,
          data de nascimento, CPF, gênero informado e nome de usuário, além de
          registros de aceite e dados necessários à autenticação.
        </p>
        <p>
          Também podemos tratar endereço IP, data e hora de acesso, navegador,
          sistema operacional, tipo de dispositivo, páginas visitadas, eventos de
          segurança, cookies, identificadores de sessão e dados de uso.
        </p>
      </Card>

      <Card>
        <h2>2. Finalidades e bases legais</h2>
        <p>
          Os dados podem ser utilizados para criar e proteger contas, operar a
          plataforma, registrar atividades da simulação, prestar suporte, prevenir
          fraude e abuso, cumprir obrigações legais, proteger direitos, melhorar
          desempenho e segurança e, quando permitido, exibir publicidade.
        </p>
        <p>
          As bases legais podem incluir execução de contrato, procedimentos
          preliminares, obrigação legal, exercício regular de direitos, legítimo
          interesse e consentimento, conforme a finalidade.
        </p>
      </Card>

      <Card>
        <h2>3. Google AdSense, Google Ad Manager e publicidade</h2>
        <p>
          A TradeSports pode utilizar produtos de publicidade do Google. Terceiros,
          incluindo o Google, podem usar cookies para veicular anúncios com base em
          visitas anteriores do usuário à TradeSports ou a outros sites.
        </p>
        <p>
          O Google e seus parceiros podem usar cookies, web beacons, endereços IP e
          outros identificadores para selecionar, medir, limitar ou personalizar
          publicidade e produzir relatórios.
        </p>
        <p>
          O usuário pode gerenciar a personalização em{' '}
          <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer">
            Configurações de anúncios do Google
          </a>.
        </p>
        <p>
          Saiba como o Google utiliza informações de sites e apps que usam seus
          serviços em{' '}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noreferrer"
          >
            Como o Google usa dados de sites e apps parceiros
          </a>.
        </p>
      </Card>

      <Card>
        <h2>4. Cookies</h2>
        <p>
          Cookies necessários podem ser utilizados para autenticação, segurança,
          sessão e funcionamento. Cookies de medição, preferências e publicidade
          podem ser utilizados quando aplicável. Consulte a{' '}
          <a href="/cookies">Política de Cookies</a>.
        </p>
      </Card>

      <Card>
        <h2>5. Compartilhamento e transferências</h2>
        <p>
          Dados podem ser compartilhados, no limite necessário, com fornecedores de
          hospedagem, banco de dados, e-mail, segurança, análise, publicidade,
          atendimento e outros prestadores essenciais. Também podem ser
          compartilhados para cumprir obrigação legal, ordem válida de autoridade,
          prevenir fraude ou proteger direitos.
        </p>
        <p>
          Alguns fornecedores podem processar dados fora do Brasil. Nesses casos,
          serão observadas as salvaguardas previstas na legislação aplicável.
        </p>
      </Card>

      <Card>
        <h2>6. Segurança, retenção e direitos</h2>
        <p>
          A TradeSports adota medidas técnicas e administrativas compatíveis com os
          riscos do tratamento e conserva dados pelo período necessário às
          finalidades, obrigações legais, segurança, prevenção de fraude e exercício
          de direitos.
        </p>
        <p>
          Nos termos da LGPD, o titular pode solicitar, quando aplicável,
          confirmação, acesso, correção, informações sobre compartilhamento,
          oposição, revogação de consentimento, eliminação em hipóteses legais e
          outros direitos previstos em lei.
        </p>
      </Card>

      <Card>
        <h2>7. Contato</h2>
        <p>
          Para solicitações de privacidade, utilize os canais disponíveis na página{' '}
          <a href="/contato">Contato</a>.
        </p>
      </Card>
    </InstitutionalLayout>
  );
}
