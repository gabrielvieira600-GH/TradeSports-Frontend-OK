'use strict';
const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'pages', 'cadastro.js');
if (!fs.existsSync(file)) {
  console.error('Execute este script na raiz do FRONTEND, onde existe pages/cadastro.js.');
  process.exit(1);
}
const before = fs.readFileSync(file, 'utf8');
const vars = ['VERSAO_TERMOS','VERSAO_POLITICA_RISCO','VERSAO_POLITICA_PRIVACIDADE','VERSAO_POLITICA_COMUNIDADE'];
let after = before;
for (const name of vars) {
  const pattern = new RegExp(`(const\\s+${name}\\s*=\\s*)['\"]([^'\"]+)['\"](\\s*;)`);
  const match = after.match(pattern);
  if (!match) throw new Error('Constante não encontrada: '+name+'. Nenhum arquivo alterado.');
  after = after.replace(pattern, (_,a,v,b)=>`${a}'1.0'${b}`);
}
if (after === before) {
  console.log('Cadastro já utiliza as versões 1.0 exigidas pelo backend. Nenhuma alteração necessária.');
  process.exit(0);
}
const backup = file + '.bak-aceites-' + Date.now();
fs.copyFileSync(file, backup);
fs.writeFileSync(file, after, 'utf8');
console.log('Corrigido:',file);
console.log('Backup:',backup);
console.log('Versões jurídicas agora alinhadas ao backend: 1.0.');
console.log('Execute npm run build e publique o frontend.');
