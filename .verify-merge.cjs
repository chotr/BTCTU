const fs = require('node:fs');
const cp = require('node:child_process');
const path = require('node:path');
const git = (...args) => cp.execFileSync('rtk',['proxy','git',...args],{encoding:'utf8',maxBuffer:20*1024*1024});
async function main() {
  const files = [...new Set([...JSON.parse(fs.readFileSync('.merge-changed.json','utf8')), ...git('diff','HEAD','--name-only','--diff-filter=ACMR').trim().split('\n')])].filter(f=>fs.existsSync(f)&&/\.(?:tsx?|mjs|json|ya?ml)$/.test(f)&&!f.includes('package-lock.json')&&!f.includes('pnpm-lock.yaml'));
  const prettier = require('./apps/web/node_modules/prettier');
  if(process.argv[2]==='format') {
    for(const f of files) {
      const text=fs.readFileSync(f,'utf8');
      const formatted=await prettier.format(text,{...(await prettier.resolveConfig(f)),filepath:f});
      if(text!==formatted)fs.writeFileSync(f,formatted);
    }
    fs.writeFileSync('.merge-formatted.json',JSON.stringify(files,null,2));
    console.log('Prettier formatted '+files.length+' merged source/config files.');
  } else {
    let errors=[];const escapes=[];
    for(const f of files) {
      const buffer=fs.readFileSync(f);
      const text=new TextDecoder('utf-8',{fatal:true}).decode(buffer);
      if(!await prettier.check(text,{...(await prettier.resolveConfig(f)),filepath:f}))errors.push(f+': formatting');
      if(/[\uFFFD\u200B-\u200F\u202A-\u202E\u2060\uFEFF\x00-\x08\x0B\x0C\x0E-\x1F]/.test(text))errors.push(f+': unexpected characters');
      if(/^(<<<<<<<|=======|>>>>>>>) /m.test(text))errors.push(f+': conflict markers');
      text.split('\n').forEach((line,i)=>{if(/\\[nrt]/.test(line))escapes.push(f+':'+(i+1)+': '+line.trim());});
    }
    console.log('Reopened '+files.length+' files: '+(errors.length?errors.join('\n'):'UTF-8, conflict-marker, control-character and formatting checks passed.'));
    console.log('Escaped sequences for review:\n'+escapes.join('\n'));
    if(errors.length)process.exitCode=1;
  }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
