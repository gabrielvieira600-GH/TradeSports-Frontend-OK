import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useRouter } from "next/router";
import { useToast } from "../components/ToastProvider";
import PoliticaPrivacidadeModal from "../components/PoliticaPrivacidadeModal";

/**
 * Cadastro (TradeSports)
 * - Mantém o layout atual (cartão central) e adiciona:
 *   - Modal de Termos (com scroll obrigatório para habilitar "Aceitar")
 *   - Modal de Política de Risco
 *   - Modal de Política de Privacidade (componente separado)
 *
 * Observação: o checkbox de aceite só habilita depois do usuário aceitar no modal de Termos.
 */

const API = process.env.NEXT_PUBLIC_API-URL;
const VERSAO_TERMOS = "1.0";
const VERSAO_POLITICA_RISCO = 'v1.0';
const VERSAO_POLITICA_PRIVACIDADE = 'v1.0';


export default function Cadastro() {
  const router = useRouter();
  const { adicionarToast } = useToast();

  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    dataNascimento: "",
    cpf: "",
    genero: "",
    nomeUsuario: "",
    senha: "",
    confirmarSenha: "",
  });

  const [erro, setErro] = useState("");

  // Aceites
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [aceitouPoliticaRisco, setAceitouPoliticaRisco] = useState(false);
  const [aceitouPoliticaPrivacidade, setAceitouPoliticaPrivacidade] = useState(false);

  const [termosLiberados, setTermosLiberados] = useState(false);

  // Modais
  const [mostrarTermos, setMostrarTermos] = useState(false);
  const [mostrarPoliticaRisco, setMostrarPoliticaRisco] = useState(false);
  const [mostrarPoliticaPrivacidade, setMostrarPoliticaPrivacidade] = useState(false);

  // Controle de scroll do Termos
  const [termosScrollNoFim, setTermosScrollNoFim] = useState(false);
  const termosScrollRef = useRef(null);

  const termosTexto = useMemo(() => {
    return `TERMOS DE USO — TRADESPORTS

Última atualização: [DATA]

⸻

1. ACEITAÇÃO DOS TERMOS

Ao acessar e utilizar a plataforma TradeSports (“Plataforma”), o usuário declara ter lido, compreendido e aceitado integralmente estes Termos de Uso, bem como a Política de Privacidade e a Política de Risco.

Caso não concorde com qualquer disposição, o usuário não deverá utilizar a Plataforma.

⸻

2. DEFINIÇÕES

Para fins destes Termos:
	•	Plataforma: sistema digital operado pela TradeSports que permite a negociação de cotas virtuais entre usuários.
	•	Usuário: pessoa física cadastrada na Plataforma.
	•	Cotas Virtuais: unidades digitais representativas de ativos simulados vinculados ao desempenho esportivo de clubes.
	•	Saldo: registro contábil interno representando os valores disponíveis do usuário na Plataforma.
	•	Ordem: instrução de compra ou venda de cotas virtuais.
	•	Mercado: ambiente de negociação entre usuários baseado em oferta e demanda.

⸻

3. NATUREZA DA PLATAFORMA

A TradeSports é:

uma plataforma digital de negociação de cotas virtuais em ambiente próprio, com dinâmica econômica interna baseada na interação entre usuários, podendo integrar terceiros para determinadas etapas operacionais e financeiras.

A TradeSports:
	•	não se apresenta como banco, instituição financeira, corretora de valores mobiliários ou operadora de apostas de quota fixa;
	•	não garante rentabilidade, lucro ou valorização;
	•	não administra investimentos ou presta consultoria financeira.

⸻

4. NATUREZA DAS COTAS VIRTUAIS

As cotas virtuais:
	•	não representam participação societária;
	•	não constituem valores mobiliários;
	•	não representam crédito contra clubes;
	•	não conferem direitos esportivos, econômicos ou federativos;
	•	não são ativos financeiros regulados.

Tratam-se exclusivamente de:

ativos digitais simulados para fins de negociação dentro da Plataforma.

⸻

5. CADASTRO E CONTA

O usuário declara que:
	•	possui capacidade civil plena;
	•	fornece informações verdadeiras e atualizadas;
	•	é titular dos meios de pagamento utilizados.

A TradeSports poderá:
	•	solicitar verificação de identidade (KYC);
	•	suspender ou encerrar contas em caso de irregularidade;
	•	recusar cadastro sem obrigação de justificativa.

⸻

6. FUNCIONAMENTO DO MERCADO

A negociação ocorre exclusivamente entre usuários.

6.1 Formação de preço

Os preços das cotas:
	•	são definidos por oferta e demanda;
	•	podem sofrer alta volatilidade;
	•	podem apresentar baixa liquidez;
	•	podem não refletir qualquer valor econômico real.

⸻

6.2 Ordens
	•	ordens podem ser executadas total ou parcialmente;
	•	ordens podem permanecer abertas sem execução;
	•	cancelamentos podem estar sujeitos a regras operacionais e antifraude.

⸻

7. TAXAS

A TradeSports poderá cobrar:
	•	taxa de negociação (maker/taker);
	•	taxa de saque;
	•	outras taxas operacionais previamente informadas.

⸻

8. DEPÓSITOS E SAQUES

8.1 Depósitos
	•	realizados por meios de pagamento integrados;
	•	podem depender de parceiros terceiros;
	•	estão sujeitos a validação e aprovação.

⸻

8.2 Saques
	•	somente para contas de mesma titularidade;
	•	sujeitos a análise de segurança e antifraude;
	•	podem sofrer retenção temporária em caso de suspeita;
	•	prazos podem variar conforme o meio de pagamento.

⸻

8.3 Restrições

A TradeSports poderá:
	•	recusar depósitos ou saques;
	•	bloquear valores temporariamente;
	•	solicitar documentação adicional.

⸻

9. RISCOS

O usuário declara ciência de que:
	•	pode perder integralmente os valores utilizados;
	•	não há garantia de liquidez;
	•	o mercado pode ser volátil;
	•	eventos esportivos influenciam preços;
	•	falhas técnicas podem ocorrer.

⸻

10. NÃO RECOMENDAÇÃO (NO SUITABILITY)

A TradeSports:
	•	não presta consultoria;
	•	não realiza recomendações;
	•	não avalia perfil de risco do usuário;
	•	não garante adequação das operações.

O usuário é o único responsável por suas decisões.

⸻

11. CONDUTAS PROIBIDAS

É vedado ao usuário:
	•	fraudar ou manipular o mercado;
	•	utilizar contas de terceiros;
	•	explorar falhas do sistema;
	•	praticar lavagem de dinheiro;
	•	realizar auto-negociação (self-trade);
	•	manipular preços artificialmente.

⸻

12. MONITORAMENTO E COMPLIANCE

A TradeSports poderá:
	•	monitorar atividades;
	•	bloquear contas preventivamente;
	•	cancelar operações suspeitas;
	•	reportar atividades a autoridades competentes.

⸻

13. SUSPENSÃO E ENCERRAMENTO

A conta poderá ser:
	•	suspensa;
	•	limitada;
	•	encerrada;

em caso de:
	•	violação destes Termos;
	•	suspeita de fraude;
	•	exigência legal ou regulatória.

⸻

14. LIMITAÇÃO DE RESPONSABILIDADE

A TradeSports não se responsabiliza por:
	•	perdas financeiras do usuário;
	•	decisões de negociação;
	•	falta de liquidez;
	•	oscilações de preço;
	•	indisponibilidade temporária;
	•	falhas de terceiros (pagamentos, APIs, etc.).

A responsabilidade da TradeSports é limitada ao funcionamento da Plataforma conforme estes Termos.

⸻

15. PROPRIEDADE INTELECTUAL

Todos os elementos da Plataforma são de propriedade da TradeSports, incluindo:
	•	marca;
	•	software;
	•	layout;
	•	funcionalidades.

É proibida reprodução sem autorização.

⸻

16. COMUNICAÇÃO

As comunicações oficiais serão realizadas por:
	•	e-mail cadastrado;
	•	notificações na Plataforma.

O usuário é responsável por manter seus dados atualizados.

⸻

17. ALTERAÇÕES DOS TERMOS

A TradeSports poderá alterar estes Termos a qualquer momento.

As alterações entrarão em vigor na data de publicação.

O uso contínuo da Plataforma implica aceitação.

⸻

18. LEGISLAÇÃO E FORO

Estes Termos são regidos pelas leis da República Federativa do Brasil.

Fica eleito o foro da comarca de [CIDADE/UF], com renúncia a qualquer outro.`;
  }, []);

  const politicaRiscoTexto = useMemo(() => {
    return `POLÍTICA DE RISCO — TRADESPORTS

Última atualização: [DATA]

⸻

1. OBJETIVO

Esta Política de Risco tem como objetivo informar os usuários da TradeSports (“Plataforma”) sobre os principais riscos envolvidos na utilização do ambiente de negociação de cotas virtuais.

Ao utilizar a Plataforma, o usuário declara ciência e aceitação integral dos riscos descritos neste documento.

⸻

2. NATUREZA DA PLATAFORMA

A TradeSports é:

uma plataforma digital de negociação de cotas virtuais em ambiente próprio, cuja dinâmica econômica depende da interação entre usuários e de fatores externos, especialmente o desempenho esportivo real.

A Plataforma:
	•	não garante lucro ou rentabilidade;
	•	não presta consultoria financeira;
	•	não assegura liquidez;
	•	não controla o comportamento do mercado.

⸻

3. RISCO DE PERDA FINANCEIRA

O usuário reconhece que:
	•	poderá perder total ou parcialmente os valores utilizados;
	•	não há garantia de recuperação de capital;
	•	decisões de compra e venda são de responsabilidade exclusiva do usuário.

⸻

4. RISCO DE MERCADO

Os preços das cotas podem:
	•	variar significativamente em curtos períodos;
	•	sofrer oscilações abruptas;
	•	refletir comportamento coletivo e especulativo dos usuários.

⸻

5. RISCO DE LIQUIDEZ

O usuário poderá enfrentar situações em que:
	•	não haja compradores ou vendedores disponíveis;
	•	ordens não sejam executadas;
	•	seja necessário negociar a preços desfavoráveis;
	•	não seja possível sair de uma posição no momento desejado.

⸻

6. RISCO OPERACIONAL

A Plataforma pode estar sujeita a:
	•	indisponibilidade temporária;
	•	falhas técnicas;
	•	atrasos na execução de ordens;
	•	erros sistêmicos ou de integração com terceiros.

⸻

7. RISCO REGULATÓRIO E JURÍDICO

A TradeSports:

não se apresenta como banco, instituição financeira, corretora de valores mobiliários ou operadora de apostas de quota fixa;

No entanto:
	•	determinadas atividades relacionadas a pagamentos, verificação de identidade, prevenção a fraudes e movimentação de recursos podem depender de terceiros regulados;
	•	o ambiente regulatório pode evoluir ou ser interpretado de forma diversa por autoridades competentes;
	•	alterações legais ou regulatórias podem impactar a operação da Plataforma.

⸻

8. RISCO DE PARCEIROS E TERCEIROS

A operação depende de terceiros, incluindo:
	•	provedores de pagamento;
	•	APIs de dados esportivos;
	•	serviços de hospedagem e infraestrutura.

Eventuais falhas nesses serviços podem impactar:
	•	depósitos e saques;
	•	atualização de dados;
	•	funcionamento da Plataforma.

⸻

9. RISCO DE DEPÓSITOS E SAQUES

Operações financeiras podem estar sujeitas a:
	•	atrasos no processamento;
	•	bloqueios temporários;
	•	necessidade de verificação adicional;
	•	cancelamentos ou estornos, especialmente em meios como cartão de crédito.

⸻

10. RISCO DE CONTRAPARTE (PLATAFORMA)

A TradeSports poderá:
	•	suspender ou bloquear contas;
	•	reter valores temporariamente;
	•	revisar ou cancelar operações;

em casos de:
	•	suspeita de fraude;
	•	exigência legal;
	•	necessidade operacional.

⸻

11. RISCO DE ABUSO DE MERCADO

A Plataforma pode ser impactada por comportamentos como:
	•	manipulação de preços;
	•	operações artificiais;
	•	uso de múltiplas contas;
	•	estratégias abusivas de negociação.

Embora existam mecanismos de controle, tais práticas podem afetar:
	•	preços;
	•	liquidez;
	•	estabilidade do mercado.

⸻

12. RISCO DE CONCENTRAÇÃO

O mercado pode apresentar:
	•	baixa diversificação de participantes;
	•	concentração de cotas em poucos usuários;
	•	influência desproporcional de determinados agentes.

⸻

13. RISCO RELACIONADO AO DESEMPENHO ESPORTIVO

Os preços das cotas são influenciados por:
	•	resultados de partidas;
	•	classificação dos clubes;
	•	eventos esportivos imprevistos.

Fatores externos podem impactar significativamente o valor das cotas.

⸻

14. RISCO DE INTERRUPÇÃO DE SERVIÇO

Eventos extraordinários podem afetar a operação, incluindo:
	•	falhas técnicas;
	•	indisponibilidade de serviços externos;
	•	eventos de força maior;
	•	mudanças estruturais no campeonato.

⸻

15. RISCO DE SEGURANÇA DA CONTA

O usuário é responsável por:
	•	manter suas credenciais seguras;
	•	não compartilhar acesso;
	•	adotar medidas de proteção.

A TradeSports não se responsabiliza por acessos indevidos decorrentes de negligência do usuário.

⸻

16. RISCO DE DECISÃO DO USUÁRIO

O usuário reconhece que:
	•	todas as decisões são de sua responsabilidade;
	•	não há orientação personalizada;
	•	a Plataforma não garante adequação das operações ao seu perfil.

⸻

17. AUSÊNCIA DE GARANTIAS

A TradeSports não garante:
	•	lucro;
	•	liquidez;
	•	estabilidade de preços;
	•	continuidade ininterrupta da operação.

⸻

18. ATUALIZAÇÕES DA POLÍTICA

Esta Política poderá ser atualizada a qualquer momento.

O uso contínuo da Plataforma implica aceitação das alterações.

⸻

19. CONTATO

Dúvidas sobre esta Política:

📧 [email@tradesports.com]`;
  }, []);

  useEffect(() => {
    // Sempre que abrir o modal de termos, reseta o controle de scroll.
    if (mostrarTermos) {
      setTermosScrollNoFim(false);
      // leva o scroll pro topo quando abrir
      setTimeout(() => {
        if (termosScrollRef.current) {
          termosScrollRef.current.scrollTop = 0;
        }
      }, 0);
    }
  }, [mostrarTermos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErro("");

    // CPF: só números
    if (name === "cpf") {
      const onlyDigits = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [name]: onlyDigits }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!aceitouTermos || !termosLiberados) {
      setErro("Você precisa aceitar os Termos de Uso para finalizar o cadastro.");
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    try {
      await axios.post("'${API}/cadastro", {
        nome: form.nome,
        sobrenome: form.sobrenome,
        email: form.email,
        dataNascimento: form.dataNascimento,
        cpf: form.cpf,
        genero: form.genero,
        nomeUsuario: form.nomeUsuario,
        senha: form.senha,
      });

      adicionarToast("Cadastro realizado com sucesso!", "success");
      router.push("/login");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.erro ||
        "Erro ao cadastrar. Tente novamente.";
      setErro(msg);
      adicionarToast(msg, "error");
    }
    const payload = {
  ...form,
  aceitouTermos: true
};
  };

  return (
    <Container>
      <Card>
        <Titulo>Cadastro</Titulo>
        <Subtitulo>Crie sua conta para começar a investir em cotas de clubes.</Subtitulo>

        <Form onSubmit={handleSubmit}>
          <Linha2colunas>
            <Campo>
              <Label>Nome</Label>
              <Input
                name="nome"
                placeholder="Nome"
                value={form.nome}
                onChange={handleChange}
                required
              />
            </Campo>

            <Campo>
              <Label>Sobrenome completo</Label>
              <Input
                name="sobrenome"
                placeholder="Sobrenome completo"
                value={form.sobrenome}
                onChange={handleChange}
                required
              />
            </Campo>
          </Linha2colunas>

          <Linha2colunas>
            <Campo>
              <Label>E-mail</Label>
              <Input
                name="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </Campo>

            <Campo>
              <Label>Data de Nascimento</Label>
              <Input
                name="dataNascimento"
                type="date"
                value={form.dataNascimento}
                onChange={handleChange}
                required
              />
            </Campo>
          </Linha2colunas>

          <Linha2colunas>
            <Campo>
              <Label>CPF</Label>
              <Input
                name="cpf"
                placeholder="Somente números"
                value={form.cpf}
                onChange={handleChange}
                required
              />
            </Campo>

            <Campo>
              <Label>Gênero</Label>
              <Select name="genero" value={form.genero} onChange={handleChange} required>
                <option value="">Selecione o gênero</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
                <option value="Prefiro não informar">Prefiro não informar</option>
              </Select>
            </Campo>
          </Linha2colunas>

          <Campo>
            <Label>Nome de Usuário</Label>
            <Input
              name="nomeUsuario"
              placeholder="Ex: gvinvest"
              value={form.nomeUsuario}
              onChange={handleChange}
              required
            />
          </Campo>

          <Linha2colunas>
            <Campo>
              <Label>Senha</Label>
              <Input
                name="senha"
                type="password"
                placeholder="Senha"
                value={form.senha}
                onChange={handleChange}
                required
              />
            </Campo>

            <Campo>
              <Label>Confirmar Senha</Label>
              <Input
                name="confirmarSenha"
                type="password"
                placeholder="Confirmar Senha"
                value={form.confirmarSenha}
                onChange={handleChange}
                required
              />
            </Campo>
          </Linha2colunas>

          {erro && <ErroMsg>{erro}</ErroMsg>}

          <AceiteLinha>
            <Checkbox
              type="checkbox"
              checked={aceitouTermos}
              disabled={!termosLiberados}
              onChange={(e) => setAceitouTermos(e.target.checked)}
              id="aceite-termos"
            />

            <AceiteTexto htmlFor="aceite-termos">
              Li e aceito os{" "}
              <LinkLike
                type="button"
                onClick={() => {
                  setMostrarTermos(true);
                  setTermosScrollNoFim(false);
                }}
              >
                Termos de Uso
              </LinkLike>{" "}
              , a{" "}
              <LinkLike type="button" onClick={() => setMostrarPoliticaRisco(true)}>
                Política de Risco
              </LinkLike>{" "}
              e a{" "}
              <LinkLike type="button" onClick={() => setMostrarPoliticaPrivacidade(true)}>
                Política de Privacidade
              </LinkLike>
              .
            </AceiteTexto>
          </AceiteLinha>

          <Botao type="submit" disabled={!aceitouTermos || !termosLiberados}>
            Cadastrar
          </Botao>

          <Nota>
            Ao criar sua conta, você declara ciência dos riscos e concorda com os Termos de Uso e as
            Políticas exibidas.
          </Nota>
        </Form>
      </Card>

      {/* MODAL TERMOS (scroll obrigatório) */}
      {mostrarTermos && (
        <Overlay onClick={() => setMostrarTermos(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Termos de Uso (TradeSports)</ModalTitle>
              <Fechar type="button" onClick={() => setMostrarTermos(false)} aria-label="Fechar">
                ✕
              </Fechar>
            </ModalHeader>

            <ModalBody
              ref={termosScrollRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
                  setTermosScrollNoFim(true);
                }
              }}
            >
              <TermosPre>{termosTexto}</TermosPre>
            </ModalBody>

            <ModalFooter>
              <ModalHint>
                {!termosScrollNoFim
                  ? 'Role até o final dos Termos para habilitar o botão “Aceitar”.'
                  : `Ao aceitar, você concorda com esta versão (${VERSAO_TERMOS}).`}
              </ModalHint>

              <ModalActions>
                <BotaoSec type="button" onClick={() => setMostrarTermos(false)}>
                  Voltar
                </BotaoSec>
                <BotaoPrim
                  type="button"
                  disabled={!termosScrollNoFim}
                  onClick={() => {
                    setAceitouTermos(true);
                    setTermosLiberados(true);
                    setMostrarTermos(false);
                  }}
                >
                  Aceitar e continuar
                </BotaoPrim>
              </ModalActions>
            </ModalFooter>
          </Modal>
        </Overlay>
      )}

      {/* MODAL POLÍTICA DE RISCO */}
      {mostrarPoliticaRisco && (
        <Overlay onClick={() => { setAceitouPoliticaRisco(true); setMostrarPoliticaRisco(false); }}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Política de Risco (TradeSports)</ModalTitle>
              <Fechar
                type="button"
                onClick={() => { setAceitouPoliticaRisco(true); setMostrarPoliticaRisco(false); }}
                aria-label="Fechar"
              >
                ✕
              </Fechar>
            </ModalHeader>

            <ModalBody>
              <TermosPre>{politicaRiscoTexto}</TermosPre>
            </ModalBody>

            <ModalFooter>
              <ModalActions>
                <BotaoPrim type="button" onClick={() => { setAceitouPoliticaRisco(true); setMostrarPoliticaRisco(false); }}>
                  Entendi
                </BotaoPrim>
              </ModalActions>
            </ModalFooter>
          </Modal>
        </Overlay>
      )}

      {/* MODAL POLÍTICA DE PRIVACIDADE (componente separado) */}
      {mostrarPoliticaPrivacidade && (
        <PoliticaPrivacidadeModal onClose={() => setMostrarPoliticaPrivacidade(false)} onAceitar={() => setAceitouPoliticaPrivacidade(true)} />
      )}
    </Container>
  );
}

/* ======= Styles (mantém padrão do layout atual) ======= */

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 60px 16px;
  background: radial-gradient(1200px 600px at 50% 0%, #0b2840 0%, #071a2b 50%, #061524 100%);
`;

const Card = styled.div`
  width: 100%;
  max-width: 620px;
  background: #f6f6f6;
  border-radius: 10px;
  padding: 28px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35);
`;

const Titulo = styled.h1`
  margin: 0 0 6px;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
`;

const Subtitulo = styled.p`
  margin: 0 0 18px;
  color: #4b5563;
  font-size: 14px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Linha2colunas = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Campo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 12px;
  color: #374151;
  font-weight: 600;
`;

const Input = styled.input`
  height: 38px;
  padding: 0 12px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  background: #fff;
  outline: none;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
  }
`;

const Select = styled.select`
  height: 38px;
  padding: 0 12px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  background: #fff;
  outline: none;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
  }
`;

const ErroMsg = styled.div`
  background: #fee2e2;
  color: #991b1b;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
`;

const AceiteLinha = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 6px;
`;

const Checkbox = styled.input`
  margin-top: 2px;
  width: 16px;
  height: 16px;
`;

const AceiteTexto = styled.label`
  font-size: 13px;
  color: #374151;
  line-height: 1.35;
`;

const LinkLike = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  color: #2563eb;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const Botao = styled.button`
  margin-top: 6px;
  height: 40px;
  background: #2563eb;
  border: 0;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const Nota = styled.p`
  margin: 6px 0 0;
  font-size: 12px;
  color: #6b7280;
`;

/* Modal */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 9999;
`;

const Modal = styled.div`
  width: 100%;
  max-width: 760px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #111827;
`;

const Fechar = styled.button`
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  color: #374151;
`;

const ModalBody = styled.div`
  padding: 16px;
  max-height: 60vh;
  overflow: auto;
`;

const TermosPre = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  color: #111827;
`;

const ModalFooter = styled.div`
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 560px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ModalHint = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const BotaoSec = styled.button`
  height: 36px;
  padding: 0 14px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #fff;
  cursor: pointer;
  font-weight: 700;
`;

const BotaoPrim = styled.button`
  height: 36px;
  padding: 0 14px;
  border-radius: 6px;
  border: 0;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
  font-weight: 700;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;
