const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const footerFile = path.join(root, 'components', 'Footer.js');
const contactFile = path.join(root, 'pages', 'contato.js');
const modalFile = path.join(root, 'components', 'FooterLegalModal.js');
const modalSource = path.join(__dirname, 'components', 'FooterLegalModal.js');

function requireFile(file) {
  if (!fs.existsSync(file)) throw new Error(`Arquivo não encontrado: ${file}`);
  return fs.readFileSync(file, 'utf8');
}
function replaceRequired(source, pattern, replacement, label) {
  if (!pattern.test(source)) throw new Error(`Não foi encontrado: ${label}. Nenhum arquivo foi alterado.`);
  return source.replace(pattern, replacement);
}

try {
  const oldFooter = requireFile(footerFile);
  const oldContact = requireFile(contactFile);
  const modalContent = requireFile(modalSource);
  let footer = oldFooter;
  let contact = oldContact;

  if (!footer.includes("import { useState } from 'react';")) {
    footer = "import { useState } from 'react';\n" + footer;
  }
  if (!footer.includes("import FooterLegalModal from './FooterLegalModal';")) {
    footer = "import FooterLegalModal from './FooterLegalModal';\n" + footer;
  }

  if (!footer.includes('const [legalModal, setLegalModal] = useState(null);')) {
    footer = replaceRequired(footer,
      /(export\s+default\s+function\s+Footer\s*\(\s*\)\s*\{)/,
      '$1\n  const [legalModal, setLegalModal] = useState(null);', 'declaração da função Footer');
  }

  const footerLinks = [
    ['termos', '/termos', 'Termos de Uso'],
    ['privacidade', '/privacidade', 'Política de Privacidade'],
    ['cookies', '/cookies', 'Política de Cookies'],
  ];
  for (const [key, href, title] of footerLinks) {
    const button = `<LegalButton type="button" onClick={() => setLegalModal('${key}')}>${title}</LegalButton>`;
    if (!footer.includes(`setLegalModal('${key}')`)) {
      const re = new RegExp(`<FooterLink\\s+href=["']${href}["']\\s*>[\\s\\S]*?<\\/FooterLink>`, 'i');
      footer = replaceRequired(footer, re, button, `link ${title}`);
    }
  }

  footer = footer.replace(/(<FooterLink\s+href=["']\/contato["']\s*>)[\s\S]*?(<\/FooterLink>)/i,
    '$1Contato para suporte$2');

  if (!footer.includes('<FooterLegalModal documentType={legalModal}')) {
    // O Footer retorna <FooterShell> como elemento raiz. Envolvemos o JSX em fragmento.
    footer = replaceRequired(footer, /(\breturn\s*\(\s*)(<FooterShell\b)/,
      '$1<>\n      $2', 'início do JSX do Footer');
    footer = replaceRequired(footer, /(<\/FooterShell>)(\s*\);)/,
      '$1\n      {legalModal && <FooterLegalModal documentType={legalModal} onClose={() => setLegalModal(null)} />}\n    </>$2', 'fim do JSX do Footer');
  }
  if (!footer.includes('const LegalButton = styled.button`')) {
    footer += `\nconst LegalButton = styled.button\`\n  width: fit-content;\n  padding: 0;\n  border: 0;\n  background: transparent;\n  color: #cbd5e1;\n  font: inherit;\n  font-size: .83rem;\n  text-align: left;\n  cursor: pointer;\n  &:hover { color: #00ff95; }\n\`;\n`;
  }

  // O e-mail é explicitamente definido para que uma variável antiga da Vercel não o substitua.
  contact = replaceRequired(contact,
    /const\s+SUPPORT_EMAIL\s*=\s*[^;]+;/,
    "const SUPPORT_EMAIL = 'suporte@tradesports.com';", 'constante SUPPORT_EMAIL');
  if (!contact.includes('https://www.instagram.com/trade_sports_/')) {
    contact = replaceRequired(contact,
      /(<h2>Atendimento geral<\/h2>[\s\S]*?)(\s*<\/Card>)/,
      '$1\n        <p>Instagram: <a href="https://www.instagram.com/trade_sports_/" target="_blank" rel="noopener noreferrer">@trade_sports_</a></p>$2',
      'card Atendimento geral');
  }

  // Validação de todos os arquivos antes de qualquer gravação.
  for (const [name, text] of [['Footer.js', footer], ['contato.js', contact]]) {
    if (!text.trim()) throw new Error(`Resultado vazio: ${name}`);
  }
  const changes = [[footerFile, oldFooter, footer], [contactFile, oldContact, contact]];
  for (const [file, oldText, newText] of changes) {
    if (oldText !== newText) {
      const backup = file + '.bak-footer';
      if (!fs.existsSync(backup)) fs.copyFileSync(file, backup);
    }
  }
  for (const [file, oldText, newText] of changes) {
    if (oldText !== newText) fs.writeFileSync(file, newText, 'utf8');
  }
  if (!fs.existsSync(modalFile) || fs.readFileSync(modalFile, 'utf8') !== modalContent) {
    if (fs.existsSync(modalFile) && !fs.existsSync(modalFile + '.bak-footer')) fs.copyFileSync(modalFile, modalFile + '.bak-footer');
    fs.writeFileSync(modalFile, modalContent, 'utf8');
  }
  console.log('Correção aplicada com sucesso. Execute npm run build.');
} catch (error) {
  console.error('Erro:', error.message);
  process.exitCode = 1;
}
