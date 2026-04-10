import { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

export default function Dividendos() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');

    if (!token) {
      setDados([]);
      return;
    }

    axios
      .get(`${API}/usuario/dividendos`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setDados(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        setDados([]);
      });
  }, []);

  return (
    <Container>
      <Titulo>Meus Dividendos</Titulo>

      {dados.length === 0 ? (
        <Mensagem>Você ainda não recebeu dividendos.</Mensagem>
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
                  <td>R$ {Number(d?.valorUnitario || 0).toFixed(2)}</td>
                  <td>R$ {Number(d?.totalPago || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Tabela>
        </TabelaWrapper>
      )}
    </Container>
  );
}

const Container = styled.div`
  padding: 24px;
  color: #fff;
`;

const Titulo = styled.h1`
  margin: 0 0 20px;
  font-size: 2rem;
`;

const Mensagem = styled.p`
  color: #cbd5e1;
  font-size: 1rem;
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