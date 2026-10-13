const fs = require('node:fs');
const cp = require('node:child_process');
const git = (...args) => cp.execFileSync('rtk', ['proxy', 'git', ...args], {encoding:'utf8'});
const conflicts = git('diff','--name-only','--diff-filter=U').trim().split('\n');
const changed = new Set(conflicts);
function write(path, text) {fs.writeFileSync(path,text); changed.add(path);}
function edit(path, fn) {const before=fs.readFileSync(path,'utf8'); const after=fn(before); if(before!==after) write(path,after);}
for(const path of conflicts) {
  if(path === 'apps/web/src/lib/tasks.ts' || path === 'apps/web/src/app/(main)/integration/page.tsx') {fs.unlinkSync(path); continue;}
  if(path.startsWith('apps/web/src/app/') || path.startsWith('apps/web/src/components/')) {
    write(path,git('show',':3:'+path));
  } else {
    edit(path, text => text.replace(/^<<<<<<<[^\n]*\n([\s\S]*?)^=======\r?\n([\s\S]*?)^>>>>>>>[^\n]*(?:\n|$)/gm, (_,ours,theirs) => path.startsWith('apps/api/') ? theirs : ours));
  }
}
edit('apps/api/package.json',text=>{
  const pkg=JSON.parse(text);
  Object.assign(pkg.dependencies, {dotenv:'^18.0.7','drizzle-orm':'^0.45.4',pg:'^8.23.1'});
  Object.assign(pkg.devDependencies, {'@types/pg':'^8.23.1','drizzle-kit':'^0.31.11'});
  return JSON.stringify(pkg,null,2)+'\n';
});
edit('apps/api/.env.example',text=>text+'DATABASE_URL=""\n');
edit('apps/api/src/env.ts',text=>text.replace('  port: number;', '  port: number;\n  databaseUrl?: string;').replace('    port: Number(source.PORT ?? 8787),','    port: Number(source.PORT ?? 8787),\n    databaseUrl: source.DATABASE_URL ?? "",'));
edit('apps/web/src/lib/identity.ts',text=>text.replaceAll('./mock/data','./mock').replaceAll('DemoUser','AppUser'));
edit('apps/web/src/lib/store.ts',text=>text.replaceAll('./mock/data','./mock').replaceAll('resolveDemoUser','resolveAppUser'));
edit('apps/web/src/lib/api.ts',text=>text.replaceAll('resetDemo','resetWorkspace').replaceAll('resolveDemoUser','resolveAppUser').replaceAll('deniedAccessDemo','deniedAccess').replace('detail: "Vai trò mô phỏng: " + user.role,','detail: `Vai trò: ${user.role}`,').replace('The only command surface screens may call.', 'The only command surface screens may call.'));
edit('apps/web/src/lib/domain/scoring.ts',text=>text.replace('Ứng viên: Đáp ứng tốt = 100;', 'Đáp ứng tốt = 100;'));
edit('apps/web/src/lib/tasks/shared.ts',text=>text.replace(/export const RESULT_QUALITY = \[[\s\S]*?\] as const;/,'export { RESULT_QUALITY } from "@/lib/domain/quality";'));
function walk(path) { return fs.readdirSync(path,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path+'/'+e.name):[path+'/'+e.name]); }
for(const path of [...walk('apps/web/src/app'),...walk('apps/web/src/components')].filter(p=>/\.tsx?$/.test(p))) {
  edit(path,text=>{
    text=text.replace(/from "@\/lib\/(tasks|evaluation|master-data|integration)"/g,'from "@/lib/api"');
    text=text.replace(/\b(taskActions|evaluationActions|masterActions)\b/g,'api');
    text=text.replace(/import \{ exportReport, scopedData \} from "@\/lib\/exports";/,'import { api } from "@/lib/api";\nimport { scopedData } from "@/lib/access";').replace(/\bexportReport\(/g,'api.exportReport(');
    text=text.replace(/from "@\/lib\/exports"/g,'from "@/lib/access"');
    text=text.replace('import { saveMappings, simulateSync, type ProfileKey } from "@/lib/api";', 'import { api, type ProfileKey } from "@/lib/api";').replace(/\bsaveMappings\(/g,'api.saveMappings(').replace(/\bsimulateSync\(/g,'api.simulateSync(');
    text=text.replace('import { USERS } from "@/lib/mock";\n','').replace(/\bUSERS\b/g,'api.accounts()');
    text=text.replace('import { resetWorkspace, useApp } from "@/lib/store";', 'import { useApp } from "@/lib/store";\nimport { api } from "@/lib/api";').replace(/(?<!\.)\bresetWorkspace\(/g,'api.resetWorkspace(');
    return text;
  });
}
fs.writeFileSync('.merge-changed.json',JSON.stringify([...changed],null,2));
console.log('Resolved conflict contents and migrated client calls in '+changed.size+' files.');
