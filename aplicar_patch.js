const fs = require('fs');
const path = require('path');
const target = path.join(process.cwd(), 'components', 'PrecificacaoInicialAdmin.js');
if (!fs.existsSync(target)) { console.error('Execute na raiz do FRONTEND. Não foi encontrado components/PrecificacaoInicialAdmin.js'); process.exit(1); }
let src = fs.readFileSync(target, 'utf8');
const before = "<td style={{ color: c.editavel ? '#86efac' : '#fca5a5' }}>{c.editavel ? 'Disponível' : 'Com operações / cotas emitidas'}</td>";
const after = "<td style={{ color: c.editavel ? '#86efac' : '#fca5a5' }}>{c.editavel ? 'Disponível' : 'Bloqueado: há registros de operações, cotas emitidas ou IPO iniciado. Faça o reset econômico antes da precificação.'}</td>";
if (src.includes(after)) { console.log('Mensagem já atualizada.'); process.exit(0); }
if (!src.includes(before)) { console.error('Versão do componente diferente da consultada. Nenhum arquivo alterado.'); process.exit(1); }
src = src.replace(before, after);
const old = "    {!clubs.length && <p>Nenhum clube encontrado. Atualize primeiro a tabela esportiva da liga.</p>}";
const newer = "    {clubs.length > 0 && clubs.every(c => !c.editavel) && <p role=\"alert\" style={{ color: '#fbbf24', padding: 12, border: '1px solid #92400e', borderRadius: 8 }}>Todos os clubes estão bloqueados porque o banco ainda registra operações ou IPO iniciado. As 1.000 cotas exibidas não comprovam ausência de histórico. Acesse Ambiente de testes, feche todos os mercados, confira pagamentos pendentes e execute o reset com backup antes de definir os preços. Recarregue esta página depois do reset.</p>}\n" + old;
if (!src.includes(old)) { console.error('Marcador de inserção não encontrado. Nenhum arquivo alterado.'); process.exit(1); }
src = src.replace(old,newer);
fs.copyFileSync(target, target+'.bak-precificacao');
fs.writeFileSync(target,src);
console.log('Interface corrigida: diagnóstico explícito do bloqueio. Backup: '+target+'.bak-precificacao');
