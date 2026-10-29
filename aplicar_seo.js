// Execute na raiz do frontend: node aplicar_seo.js
const fs = require('fs');
const path = require('path');
const root = process.cwd();
function patch(rel, transform) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) throw new Error(`Arquivo não encontrado: ${rel}`);
  const old = fs.readFileSync(p, 'utf8');
  const next = transform(old);
  if (next === old) { console.log(`Sem alterações: ${rel}`); return; }
  fs.copyFileSync(p, p + '.seo-backup');
  fs.writeFileSync(p, next);
  console.log(`Atualizado: ${rel}`);
}
const seo = "import SeoTradeSports from '../components/SeoTradeSports';\n";
patch('pages/index.js', s => {
  if (s.includes('SeoTradeSports')) return s;
  if (!s.includes('export default function Home()') || !s.includes('    <Page>')) throw Error('Estrutura da home mudou');
  return seo + s.replace('    <Page>', `    <Page>\n      <SeoTradeSports title="TradeSports — Mercado Esportivo Virtual" description="Explore classificações esportivas, preços de referência e cotas virtuais de clubes na TradeSports, plataforma de simulação de mercado esportivo." path="/" />`);
});
patch('pages/como-funciona.js', s => {
  if (s.includes('SeoTradeSports')) return s;
  if (!s.includes('    <Page>')) throw Error('Estrutura Como Funciona mudou');
  return seo + s.replace('    <Page>', `    <Page>\n      <SeoTradeSports title="Como Funciona a TradeSports — Regras e Mercado Virtual" description="Entenda como funcionam cotas virtuais, preços, IPO, ordens, taxas, carteira e liquidação na simulação esportiva TradeSports." path="/como-funciona" />`);
});
patch('pages/brasileirao-a.js', s => {
  if (s.includes('SeoTradeSports')) return s;
  if (!s.includes('    <Container>')) throw Error('Estrutura do mercado mudou');
  return seo + s.replace('    <Container>', `    <Container>\n      <SeoTradeSports title={\`${'${LIGA_NOME}'} — Classificação e Cotas Virtuais | TradeSports\`} description={\`Acompanhe a classificação da ${'${LIGA_NOME}'}, preços de referência, cotas virtuais e informações do mercado simulado na TradeSports.\`} path={mercado.rota} />`);
});
fs.mkdirSync(path.join(root, 'components'), {recursive:true});
fs.copyFileSync(path.join(__dirname,'components/SeoTradeSports.js'),path.join(root,'components/SeoTradeSports.js'));
fs.copyFileSync(path.join(__dirname,'public/sitemap.xml'),path.join(root,'public/sitemap.xml'));
console.log('Sitemap e componente SEO instalados. Confira os diffs antes do commit.');
