# Publicidade Google na TradeSports

## O que foi implementado

- Banners responsivos do Google AdSense no feed, inseridos por padrão depois de
  cada 5 eventos, com limite de 2 anúncios por carregamento.
- Elegibilidade fechada por padrão: o navegador só carrega o script do AdSense
  depois que `/usuario/plano` confirma que a conta é Lite.
- Contas Premium não renderizam bloco, rótulo, espaço vazio nem fazem requisição
  ao script de publicidade.
- Blocos sem inventário são ocultados automaticamente.
- Base de integração para rewarded ads em futuro aplicativo nativo com AdMob,
  desativada até que os recursos sejam definidos e validados pelo servidor.

## Ativação do AdSense no feed web

1. Aprove o domínio da TradeSports no Google AdSense.
2. Crie um bloco de anúncio de display responsivo.
3. Cadastre no ambiente de produção da Vercel:

   - `NEXT_PUBLIC_ADS_ENABLED=true`
   - `NEXT_PUBLIC_ADS_PREVIEW=false`
   - `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-...`
   - `NEXT_PUBLIC_ADSENSE_FEED_SLOT_ID=...`
   - `NEXT_PUBLIC_FEED_AD_INTERVAL=5`
   - `NEXT_PUBLIC_FEED_AD_MAX=2`

4. Faça um novo deploy do frontend.
5. Publique o `ads.txt` recomendado pelo AdSense na raiz do domínio.
6. Configure a gestão de consentimento em **Privacidade e mensagens** do Google,
   conforme os territórios atendidos pela plataforma.

Para preservar a promessa de zero anúncios no Premium, mantenha desativados no
painel do AdSense os **Anúncios automáticos do site**, incluindo âncoras e
vinhetas. A automação desta implementação acontece no preenchimento dos blocos
manuais do feed, sem permitir que o Google injete publicidade em outras páginas.

## Teste visual sem chamar o Google

Use temporariamente:

```env
NEXT_PUBLIC_ADS_ENABLED=true
NEXT_PUBLIC_ADS_PREVIEW=true
```

Com IDs ausentes ou de exemplo, o feed Lite mostrará apenas um placeholder de
pré-visualização. O Premium continuará totalmente sem anúncios.

## Rewarded ads

O AdMob é destinado ao futuro aplicativo nativo. O arquivo
`lib/advertising/rewardedAds.js` aceita somente uma bridge nativa explicitamente
configurada e uma lista fechada de recursos. Nenhuma recompensa é concedida no
cliente.

Antes de ativar:

1. Defina quais recursos podem ser liberados e seus limites.
2. Implemente o SDK do AdMob no aplicativo Android/iOS.
3. Implemente verificação server-side (SSV), idempotência e auditoria no backend.
4. Cadastre apenas as chaves permitidas em
   `NEXT_PUBLIC_REWARDED_FEATURE_KEYS`.
5. Só então altere `NEXT_PUBLIC_REWARDED_ADS_ENABLED=true`.

Enquanto esses itens não existirem, o rewarded permanece indisponível para não
criar uma brecha na economia da plataforma.
