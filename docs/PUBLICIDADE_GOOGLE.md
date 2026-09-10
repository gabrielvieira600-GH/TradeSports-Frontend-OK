# Publicidade Google na TradeSports

## Visão geral

A TradeSports utiliza duas integrações Google distintas na Web:

1. **Google AdSense** para banners responsivos comuns.
2. **Google Ad Manager + Google Publisher Tag (GPT)** para anúncios premiados
   (Rewarded Ads) que liberam ordens extras para usuários Lite.

Contas Premium permanecem sem publicidade e com ordens ilimitadas.

---

## Banners AdSense

### O que já existe

- Banner responsivo no feed social.
- Banner responsivo na página inicial.
- Banner responsivo no dashboard Lite.
- Banner responsivo nas páginas de mercados.
- Identificação centralizada de anônimos, Lite e Premium.
- Contas Premium não carregam blocos nem o script do AdSense.
- Blocos sem inventário são ocultados automaticamente.
- Um único carregador de script é reutilizado pelos banners.

### Variáveis da Vercel

```env
NEXT_PUBLIC_ADS_ENABLED=true
NEXT_PUBLIC_ADS_PREVIEW=false
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-...
NEXT_PUBLIC_ADSENSE_FEED_SLOT_ID=...
NEXT_PUBLIC_ADSENSE_HOME_SLOT_ID=...
NEXT_PUBLIC_ADSENSE_DASHBOARD_SLOT_ID=...
NEXT_PUBLIC_ADSENSE_MARKET_SLOT_ID=...
NEXT_PUBLIC_FEED_AD_INTERVAL=5
NEXT_PUBLIC_FEED_AD_MAX=2
```

Para preservar a promessa de zero anúncios no Premium, mantenha os **Anúncios
Automáticos** do AdSense desativados. A TradeSports controla manualmente os
posicionamentos elegíveis.

Também mantenha o `ads.txt` recomendado pelo Google publicado na raiz do domínio
e configure a gestão de consentimento em **Privacidade e mensagens**, conforme
os territórios atendidos pela plataforma.

---

# Rewarded Ads para liberar ordens Lite

## Regra comercial

- Plano Lite: **15 ordens-base por semana**.
- Cada Rewarded Ad concluído: **+2 ordens** na mesma semana.
- Máximo: **5 Rewarded Ads por semana**.
- Bônus máximo: **+10 ordens**.
- Limite máximo do Lite: **25 ordens por semana**.
- Premium: ordens ilimitadas e nenhuma oferta de Rewarded Ad.
- A semana da TradeSports continua de segunda-feira 00:00 até a segunda-feira
  seguinte, no fuso `America/Sao_Paulo`.

A recompensa é vinculada à conta autenticada, não é transferível e não concede
T$, dinheiro, saque, crédito ou qualquer item convertível em valor real. Ela
somente aumenta a quantidade de ordens que a própria conta Lite pode executar
naquela semana.

## Provedor

Na Web, a implementação usa **Google Ad Manager** com **Google Publisher Tag
(GPT)** e o formato `OutOfPageFormat.REWARDED`.

O AdSense tradicional não deve ser usado para conceder recompensa por clique ou
visualização de banner comum.

## Configuração no Google Ad Manager

1. Crie um bloco de anúncios para inventário Rewarded Web.
2. Configure o prêmio no Ad Manager de forma compatível com a experiência
   exibida pela TradeSports.
3. Garanta que a proteção **Bloquear anúncios em vídeo não in-stream** esteja
   desativada para o inventário necessário.
4. Use o caminho completo do bloco, incluindo o network code. Exemplo:

```text
/123456789/TradeSports_Rewarded_Orders
```

5. Cadastre na Vercel:

```env
NEXT_PUBLIC_REWARDED_ADS_ENABLED=true
NEXT_PUBLIC_REWARDED_AD_PROVIDER=google-ad-manager-web
NEXT_PUBLIC_GAM_REWARDED_AD_UNIT_PATH=/123456789/TradeSports_Rewarded_Orders
NEXT_PUBLIC_REWARDED_FEATURE_KEYS=lite_weekly_orders
```

6. Faça novo deploy do frontend.

O script da GPT **não é carregado globalmente**. Ele é carregado de forma lazy
somente quando um usuário Lite elegível clica afirmativamente no botão de
Rewarded Ad.

## Fluxo implementado

```text
Usuário Lite clica em "Assistir anúncio e ganhar +2 ordens"
        ↓
POST /mercado/rewarded-ad/iniciar
        ↓
Backend cria tentativa de uso único, com token aleatório e expiração curta
        ↓
Frontend carrega GPT e solicita o slot Rewarded
        ↓
rewardedSlotReady → anúncio é exibido após o opt-in já dado no botão
        ↓
rewardedSlotGranted → frontend envia a tentativa ao backend
        ↓
POST /mercado/rewarded-ad/concluir
        ↓
Backend valida tentativa, usuário, temporada, janela semanal e teto de 5
        ↓
+2 ordens são adicionadas à quota
        ↓
RewardedAdEvent fica registrado como rewarded
```

A TradeSports utiliza o evento **`rewardedSlotGranted`** como o sinal do Google
para solicitar a concessão da recompensa. Abrir, carregar ou clicar no anúncio
não concede benefício.

## Proteções implementadas

- Somente usuários autenticados Lite podem iniciar tentativa.
- Premium é bloqueado no frontend e no backend.
- A recompensa é decidida pelo backend; o navegador nunca informa quantas
  ordens deve receber.
- Cada tentativa recebe `attemptId` único.
- O token bruto só é devolvido ao navegador uma vez; o Mongo armazena apenas o
  SHA-256.
- Tentativas expiram rapidamente.
- Uma tentativa já premiada não pode ser reutilizada.
- O backend verifica novamente a temporada e a janela semanal na conclusão.
- O backend conta eventos `rewarded` para impedir mais de 5 por semana.
- O bônus é recalculado a partir da quantidade confirmada de rewarded ads.
- Há trilha de auditoria na collection `rewarded_ad_events`.
- Há tempo mínimo entre criação da tentativa e concessão da recompensa para
  bloquear chamadas imediatamente forjadas.
- Tentativas pendentes anteriores são canceladas quando uma nova tentativa é
  iniciada.

## Limitação importante da Web

O Google Ad Manager informa que **Server-Side Verification (SSV) não está
disponível para Rewarded Ads na Web**. Por isso, ao contrário do AdMob em
aplicativos nativos, o backend não consegue consultar uma assinatura do Google
que prove criptograficamente a visualização.

A implementação da TradeSports reduz o risco com desafio de uso único,
idempotência, expiração, auditoria, limite semanal e validação de sessão, mas o
sinal final `rewardedSlotGranted` ainda nasce no navegador.

Se no futuro a TradeSports lançar Android/iOS com AdMob, a versão nativa deve
usar SSV e substituir essa limitação da Web.

## Experiência e política

Antes da exibição, o usuário vê claramente:

> Assista voluntariamente a um anúncio premiado para liberar +2 ordens nesta
> semana.

O botão representa o opt-in afirmativo. Recusar, fechar ou não completar o
anúncio não remove nenhuma função já disponível na conta; apenas não concede as
+2 ordens prometidas.

Não use textos como "assista para apoiar a TradeSports" nem qualquer mensagem
que pressione o usuário a escolher assistir.

---

## Arquivos envolvidos

### Backend

```text
models/UserTradingQuota.js
models/RewardedAdEvent.js
utils/tradingQuota.js
routes/mercado.js
```

### Frontend

```text
lib/advertising/config.js
lib/advertising/rewardedAds.js
components/advertising/RewardedOrdersButton.js
components/MarketStatusCard.js
components/Layout.js
components/advertising/RewardedOrdersFloatingPrompt.js
docs/PUBLICIDADE_GOOGLE.md
```


## Visibilidade na interface

Além do bloco disponível no `MarketStatusCard`, a implementação inclui um prompt
flutuante discreto no `Layout` padrão. Ele aparece apenas para usuário Lite, com
temporada/mercado ativos, quando restam no máximo 2 ordens da franquia efetiva e
ainda existe Rewarded Ad disponível naquela semana. Assim o recurso permanece
acessível mesmo nas páginas que não renderizam o `MarketStatusCard`.
