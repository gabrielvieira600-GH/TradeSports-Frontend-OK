import Head from 'next/head';

const BASE = 'https://tradesports.com.br';
export default function SeoTradeSports({ title, description, path = '/' }) {
  const canonical = BASE + (path === '/' ? '/' : path);
  return (
    <Head>
      <title key="title">{title}</title>
      <meta key="description" name="description" content={description} />
      <link key="canonical" rel="canonical" href={canonical} />
      <meta key="robots" name="robots" content="index,follow" />
      <meta key="og:type" property="og:type" content="website" />
      <meta key="og:site_name" property="og:site_name" content="TradeSports" />
      <meta key="og:title" property="og:title" content={title} />
      <meta key="og:description" property="og:description" content={description} />
      <meta key="og:url" property="og:url" content={canonical} />
      <meta key="twitter:card" name="twitter:card" content="summary" />
    </Head>
  );
}
