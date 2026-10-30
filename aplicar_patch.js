const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const packageDir = __dirname;
const footer = path.join(root, 'components', 'Footer.js');
const contact = path.join(root, 'pages', 'contato.js');
const modalSource = path.join(packageDir, 'components', 'FooterLegalModal.js');
const modalDest = path.join(root, 'components', 'FooterLegalModal.js');

function assert(condition, message) { if (!condition) throw new Error(message); }
function replaceOnce(content, from, to, label) {
  assert(content.includes(from), `Não foi encontrado o trecho esperado: ${label}. Nenhum arquivo foi alterado.`);
  return content.replace(from, to);
}
function backup(file) {
  const dest = `${file}.bak-footer`;
  if (!fs.existsSync(dest)) fs.copyFileSync(file, dest);
}

try {
  assert(fs.existsSync(footer) && fs.existsSync(contact), 'Execute node aplicar_patch.js na raiz do frontend, onde existem components/Footer.js e pages/contato.js.');
  assert(fs.existsSync(modalSource), 'O arquivo components/FooterLegalModal.js não está junto ao script. Extraia o ZIP inteiro.');
  let s = fs.readFileSync(footer, 'utf8');
  let c = fs.readFileSync(contact, 'utf8');
  const alreadyApplied = s.includes('const [legalModal, setLegalModal] = useState(null);');
  if (!alreadyApplied) {
    s = replaceOnce(s, 'export default function Footer() {\n  return (', 'export default function Footer() {\n  const [legalModal, setLegalModal] = useState(null);\n  return (\n    <>', 'início do Footer');
    s = replaceOnce(s, '    </FooterShell>\n  );', '    </FooterShell>\n    {legalModal && <FooterLegalModal documentType={legalModal} onClose={() => setLegalModal(null)} />}\n    </>\n  );', 'fim do Footer');
    s = replaceOnce(s, '<FooterLink href="/termos">Termos de Uso</FooterLink>', '<LegalButton type="button" onClick={() => setLegalModal(\'termos\')}>Termos de Uso</LegalButton>', 'Termos de Uso');
    s = replaceOnce(s, '<FooterLink href="/privacidade">Política de Privacidade</FooterLink>', '<LegalButton type="button" onClick={() => setLegalModal(\'privacidade\')}>Política de Privacidade</LegalButton>', 'Privacidade');
    s = replaceOnce(s, '<FooterLink href="/cookies">Política de Cookies</FooterLink>', '<LegalButton type="button" onClick={() => setLegalModal(\'cookies\')}>Política de Cookies</LegalButton>', 'Cookies');
    s = "import { useState } from 'react';\nimport FooterLegalModal from './FooterLegalModal';\n" + s;
    s += '\nconst LegalButton = styled.button`\n  width: fit-content; padding: 0; border: 0; background: transparent;\n  color: #cbd5e1; font-size: .83rem; font-family: inherit;\n  text-align: left; cursor: pointer; &:hover { color: #00ff95; }\n`;\n';
  }
  s = s.replace('<FooterLink href="/contato">Contato</FooterLink>', '<FooterLink href="/contato">Contato para suporte</FooterLink>');
  c = c.replace("const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || '';", "const SUPPORT_EMAIL = 'suporte@tradesports.com';");
  if (!c.includes('https://www.instagram.com/trade_sports_/')) {
    c = replaceOnce(c, '        )}\n      </Card>\n\n      <Card>\n        <h2>Privacidade e dados pessoais</h2>', '        )}\n        <p>\n          Instagram: <a href="https://www.instagram.com/trade_sports_/" target="_blank" rel="noopener noreferrer">@trade_sports_</a>\n        </p>\n      </Card>\n\n      <Card>\n        <h2>Privacidade e dados pessoais</h2>', 'card Atendimento geral');
  }
  backup(footer);
  backup(contact);
  fs.writeFileSync(footer, s, 'utf8');
  fs.writeFileSync(contact, c, 'utf8');
  fs.copyFileSync(modalSource, modalDest);
  console.log('Patch aplicado com sucesso. Backups: Footer.js.bak-footer e contato.js.bak-footer');
} catch (error) {
  console.error('Erro:', error.message);
  process.exitCode = 1;
}
