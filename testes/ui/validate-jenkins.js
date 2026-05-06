/**
 * validate-jenkins.js
 * Valida consistência entre cypress.config.js, Jenkinsfile_qa, package.json e currents.config.js
 * Uso: node validate-jenkins.js
 */

const fs   = require('fs');
const path = require('path');

const PASS = '\x1b[32m✅ PASSOU\x1b[0m';
const FAIL = '\x1b[31m❌ FALHOU\x1b[0m';
const WARN = '\x1b[33m⚠️  AVISO\x1b[0m';

const results = [];

function check(label, fn) {
  try {
    const { status, detail } = fn();
    results.push({ label, status, detail });
  } catch (e) {
    results.push({ label, status: FAIL, detail: e.message });
  }
}

// ─── Leitura de arquivos ───────────────────────────────────────────────────────

const pkg          = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const jenkinsRaw   = fs.readFileSync('./Jenkinsfile_qa', 'utf8');
const allDeps      = { ...pkg.dependencies, ...pkg.devDependencies };

// ─── CHECK 1: Sintaxe cypress.config.js ───────────────────────────────────────
check('Sintaxe cypress.config.js', () => {
  // apaga cache para forçar reload
  delete require.cache[require.resolve('./cypress.config.js')];
  require('./cypress.config.js');
  return { status: PASS, detail: 'Sem erros de sintaxe/importação' };
});

// ─── CHECK 2: Carregamento com CI=true (simula Docker) ────────────────────────
check('Carregamento com CI=true (simula Docker)', () => {
  const prev = process.env.CI;
  process.env.CI = 'true';
  delete require.cache[require.resolve('./cypress.config.js')];
  const cfg = require('./cypress.config.js');
  process.env.CI = prev;
  if (!cfg || !cfg.e2e) throw new Error('cypress.config.js não retornou objeto válido');
  return { status: PASS, detail: 'Carregou com CI=true sem exceção' };
});

// ─── CHECK 3: cypress-cloud versão Jenkinsfile vs package.json ────────────────
check('cypress-cloud: versão pinada no Jenkinsfile', () => {
  const match = jenkinsRaw.match(/cypress-cloud@([\w.\-]+)/);
  if (!match) throw new Error('cypress-cloud não encontrado no Jenkinsfile_qa');
  const jVer = match[1];
  const isPin = /^\d+\.\d+\.\d+(-[\w.]+)?$/.test(jVer);  // ex: 2.0.0-beta.1
  const isFloating = ['beta','latest','alpha','next'].includes(jVer);
  if (isFloating) return { status: FAIL, detail: `Jenkinsfile usa tag flutuante @${jVer} — use versão exata` };
  if (!isPin)     return { status: WARN, detail: `Versão '${jVer}' pode não ser exata` };
  const pkgVer = (allDeps['cypress-cloud'] || '').replace(/[\^~]/,'');
  return {
    status: PASS,
    detail: `Jenkinsfile: ${jVer} (pinada) | package.json: ${pkgVer} (base local)`
  };
});

// ─── CHECK 4: cypress versão Jenkinsfile vs package.json ──────────────────────
check('cypress: versão pinada no Jenkinsfile', () => {
  const match = jenkinsRaw.match(/cypress@(\d[\w.\-]+)/);
  if (!match) throw new Error('cypress@<versão> não encontrado no Jenkinsfile_qa');
  const jVer = match[1];
  const isPin = /^\d+\.\d+\.\d+$/.test(jVer);
  if (!isPin) return { status: FAIL, detail: `Versão '${jVer}' não é pinada` };
  const pkgVer = (allDeps['cypress'] || '').replace(/[\^~]/,'');
  return {
    status: PASS,
    detail: `Jenkinsfile: ${jVer} (pinada) | package.json: ${pkgVer} (base local)`
  };
});

// ─── CHECK 5: currents.config.js ──────────────────────────────────────────────
check('currents.config.js (projectId, recordKey, cloudServiceUrl)', () => {
  const c = require('./currents.config.js');
  const required = ['projectId', 'recordKey', 'cloudServiceUrl'];
  const missing  = required.filter(k => !c[k]);
  if (missing.length) throw new Error('Faltando: ' + missing.join(', '));
  return {
    status: PASS,
    detail: `projectId=${c.projectId} | cloudServiceUrl=${c.cloudServiceUrl}`
  };
});

// ─── CHECK 6: allure-mocha versão pinada no Jenkinsfile ───────────────────────
check('allure-mocha: versão pinada no Jenkinsfile', () => {
  const match = jenkinsRaw.match(/allure-mocha@?([\w.\-]+)?/);
  if (!match) throw new Error('allure-mocha não encontrado no Jenkinsfile_qa');
  const ver = match[1];
  if (!ver || ver === ' ' || !ver.trim()) {
    return { status: WARN, detail: 'allure-mocha sem versão fixada — pode instalar versão inesperada em CI' };
  }
  const isPin = /^\d+\.\d+\.\d+$/.test(ver.trim());
  if (!isPin) return { status: WARN, detail: `allure-mocha@${ver} pode não ser versão exata` };
  return { status: PASS, detail: `allure-mocha@${ver} pinada` };
});

// ─── CHECK 7: crypto-js presente no package.json ──────────────────────────────
check('crypto-js: declarado no package.json', () => {
  const inJenkins = /crypto-js@[\w.\-]+/.test(jenkinsRaw);
  const inPkg     = !!allDeps['crypto-js'];
  if (inJenkins && !inPkg) {
    return {
      status: WARN,
      detail: 'crypto-js está no Jenkinsfile mas não no package.json devDependencies — em falha de npm install no Jenkins pode não ser instalado'
    };
  }
  if (!inJenkins && !inPkg) return { status: WARN, detail: 'crypto-js não encontrado em nenhum lugar' };
  return { status: PASS, detail: 'crypto-js declarado em package.json' };
});

// ─── Exibe resultado ───────────────────────────────────────────────────────────

const COL_W = 52;
console.log('\n' + '═'.repeat(80));
console.log(' VALIDAÇÃO CI — SIGNA');
console.log('═'.repeat(80));
console.log(' Check'.padEnd(COL_W) + ' Resultado');
console.log('─'.repeat(80));
results.forEach(r => {
  const label = (' ' + r.label).padEnd(COL_W);
  console.log(label + ' ' + r.status);
  if (r.detail) console.log('   \x1b[2m→ ' + r.detail + '\x1b[0m');
});
console.log('═'.repeat(80));

const failed = results.filter(r => r.status.includes('FALHOU')).length;
const warned = results.filter(r => r.status.includes('AVISO')).length;
console.log(` Total: ${results.length} checks | ❌ ${failed} falhas | ⚠️  ${warned} avisos\n`);
process.exit(failed > 0 ? 1 : 0);
