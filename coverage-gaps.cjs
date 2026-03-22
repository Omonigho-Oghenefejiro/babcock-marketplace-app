const fs = require('fs');
const path = require('path');
const root = process.cwd();
const cov = JSON.parse(fs.readFileSync(path.join(root, 'coverage', 'coverage-final.json'), 'utf8'));

function rel(p) {
  return path.relative(root, p).replace(/\\/g, '/');
}

for (const [file, data] of Object.entries(cov)) {
  const missingStatements = [];
  for (const [id, count] of Object.entries(data.s || {})) {
    if (count === 0) {
      const line = data.statementMap?.[id]?.start?.line;
      if (line) missingStatements.push(line);
    }
  }

  const missingFunctions = [];
  for (const [id, count] of Object.entries(data.f || {})) {
    if (count === 0) {
      const fn = data.fnMap?.[id];
      const name = fn?.name || '(anonymous)';
      const line = fn?.decl?.start?.line || fn?.loc?.start?.line;
      missingFunctions.push({ name, line });
    }
  }

  const missingBranches = [];
  for (const [id, arr] of Object.entries(data.b || {})) {
    const branchMap = data.branchMap?.[id];
    (arr || []).forEach((hit, idx) => {
      if (hit === 0) {
        const line = branchMap?.line || branchMap?.loc?.start?.line;
        const type = branchMap?.type || 'branch';
        missingBranches.push({ line, type, idx });
      }
    });
  }

  if (missingStatements.length || missingFunctions.length || missingBranches.length) {
    console.log(`\n${rel(file)}`);
    if (missingStatements.length) {
      const uniq = [...new Set(missingStatements)].sort((a,b)=>a-b);
      console.log(`  missing statements: ${uniq.join(', ')}`);
    }
    if (missingFunctions.length) {
      const lines = missingFunctions.map(f => `${f.name}@${f.line ?? '?'}`);
      console.log(`  missing functions: ${lines.join(', ')}`);
    }
    if (missingBranches.length) {
      const lines = missingBranches.map(b => `${b.type}:${b.idx}@${b.line ?? '?'}`);
      console.log(`  missing branches: ${lines.join(', ')}`);
    }
  }
}
