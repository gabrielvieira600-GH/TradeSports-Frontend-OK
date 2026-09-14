import InstitutionalLayout, { Card, Lead, Note, PageTitle } from '../components/InstitutionalLayout';

export default function Termos() {
  return (
    <InstitutionalLayout
      title="Termos de Uso"
      description="Termos de Uso do ambiente público de simulação da TradeSports."
      canonicalPath="/termos"
    >
      <PageTitle>Termos de Uso</PageTitle>
      <Lead>
        Versão 1.1. Estes Termos regulam o ambiente público atual da TradeSports,
        que funciona como plataforma de simulação econômica esportiva.
      </Lead>

      <Note>
        T$ é uma unidade exclusivamente virtual. No ambiente público atual, T$ não
        pode ser comprado com dinheiro real, sacado, convertido ou resgatado em
        moeda.
      </Note>

      <Card>
        <h2>1. Serviço</h2>
        <p>
          A TradeSports permite acompanhar mercados simulados ligados ao desempenho
          esportivo, negociar cotas virtuais, montar carteira, consultar rankings e
          utilizar recursos sociais e analíticos disponíveis.
        </p>
        <p>
          Cotas virtuais não conferem participação societária, propriedade, voto,
          crédito ou direito perante clubes, atletas, ligas ou federações.
        </p>
      </Card>

      <Card>
        <h2>2. Cadastro</h2>
        <p>
          O cadastro é destinado a pessoas com 18 anos ou mais. O usuário deve
          fornecer informações verdadeiras, proteger suas credenciais e utilizar
          somente sua própria conta.
        </p>
      </Card>

      <Card>
        <h2>3. Ordens e preços virtuais</h2>
        <p>
          Ordens podem ser executadas integralmente, parcialmente ou permanecer sem
          execução. Preços virtuais podem variar de acordo com regras da competição,
          oferta e demanda simuladas e eventos esportivos.
        </p>
        <p>
          Expressões como mercado, cota, carteira, IPO, ordem, liquidação e
          dividendos descrevem mecânicas da simulação e não caracterizam, por si,
          investimento, produto bancário, aposta, criptoativo ou valor mobiliário.
        </p>
      </Card>

      <Card>
        <h2>4. Conduta e comunidade</h2>
        <p>
          Não é permitido utilizar a plataforma para fraude, automação abusiva,
          manipulação, assédio, spam, violação de direitos de terceiros ou qualquer
          atividade ilegal. Conteúdo patrocinado deve ser identificado claramente.
        </p>
      </Card>

      <Card>
        <h2>5. Disponibilidade</h2>
        <p>
          A TradeSports pode realizar manutenção, corrigir dados, suspender mercados
          ou funcionalidades e atualizar regras para preservar segurança, integridade
          ou cumprimento legal. Não é garantido funcionamento ininterrupto.
        </p>
      </Card>

      <Card>
        <h2>6. Publicidade e planos</h2>
        <p>
          Visitantes e usuários Lite podem visualizar publicidade. Usuários Premium
          podem ter experiência sem anúncios conforme as condições do plano.
          Recursos de anúncio premiado, quando disponíveis, são opcionais.
        </p>
      </Card>

      <Card>
        <h2>7. Privacidade e contato</h2>
        <p>
          O tratamento de dados pessoais é explicado na{' '}
          <a href="/privacidade">Política de Privacidade</a> e o uso de cookies na{' '}
          <a href="/cookies">Política de Cookies</a>.
        </p>
        <p>
          Canais de atendimento estão disponíveis em <a href="/contato">Contato</a>.
        </p>
      </Card>
    </InstitutionalLayout>
  );
}
