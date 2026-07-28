import { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../lib/api';
import withAuth from '../components/withAuth';
import EstadoInterface from '../components/EstadoInterface';

function formatarTS(valor) {
  return `T$ ${Number(valor || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Dividendos() {
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = async () => {
    try {
      setCarregando(true);
      setErro('');

      const { data } = await api.get('/usuario/dividendos');
      setDados(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar pagamentos Top 4:', err);
      setDados([]);
      setErro(
        err?.response?.data?.erro ||
          'Não foi possível carregar os pagamentos Top 4.'
      );
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  return (
    <Container>
      <Titulo>Meus Dividendos</Titulo>

      {carregando ? (
        <EstadoInterface
          variante="carregando"
          titulo="Carregando pagamentos Top 4"
          descricao="Estamos consultando os créditos registrados nas rodadas elegíveis."
        />
      ) : erro ? (
        <EstadoInterface
          variante="erro"
          titulo="Não foi possível carregar os pagamentos"
          descricao={erro}
          acao="Tentar novamente"
          onAcao={carregar}
        />
      ) : dados.length === 0 ? (
        <EstadoInterface
          titulo="Nenhum pagamento Top 4 foi registrado"
          descricao="Quando uma posição atender aos critérios de permanência no Top 4, o crédito em T$ aparecerá aqui."
          acao="Ver como funciona"
          hrefAcao="/como-funciona"
          acaoSecundaria="Acompanhar ranking"
          hrefAcaoSecundaria="/ranking"
        />
      ) : (
        <TabelaWrapper>
          <Tabela>
            <thead>
              <tr>
                <th>Data</th>
                <th>Clube</th>
                <th>Cotas</th>
                <th>Valor por cota</th>
                <th>Total recebido</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((d, i) => (
                <tr key={i}>
                  <td>
                    {d?.data ? new Date(d.data).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td>{d?.clubeId?.nome || d?.clubeNome || '-'}</td>
                  <td>{d?.quantidade ?? 0}</td>
                  <td>{formatarTS(d?.valorUnitario)}</td>
                  <td>{formatarTS(d?.totalPago)}</td>
                </tr>
              ))}
            </tbody>
          </Tabela>
        </TabelaWrapper>
      )}
    </Container>
  );
}

export default withAuth(Dividendos);

const Container = styled.div`
  padding: 24px;
  color: #fff;
`;

const Titulo = styled.h1`
  margin: 0 0 20px;
  font-size: 2rem;
`;

const TabelaWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 12px;
`;

const Tabela = styled.table`
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  background: #0f172a;
  border: 1px solid #1e293b;

  thead {
    background: #111827;
  }

  th,
  td {
    padding: 14px 12px;
    text-align: left;
    border-bottom: 1px solid #1e293b;
    white-space: nowrap;
  }

  th {
    color: #93c5fd;
    font-weight: 700;
    font-size: 0.95rem;
  }

  td {
    color: #e5e7eb;
    font-size: 0.95rem;
  }

  tbody tr:hover {
    background: rgba(59, 130, 246, 0.08);
  }
`;
