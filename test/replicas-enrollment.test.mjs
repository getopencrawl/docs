import {strict as assert} from 'node:assert';
import {execFile} from 'node:child_process';
import {createServer} from 'node:http';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import test from 'node:test';
import {promisify} from 'node:util';

test('the documented enrollment sends the code and signed identity only to the supplied server', async t => {
  const requests = [];
  const server = createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    requests.push({path:req.url, method:req.method, auth:req.headers.authorization, body});
    res.end('{"ok":true}');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const dir = await mkdtemp(join(tmpdir(), 'replicas-docs-'));
  t.after(() => rm(dir, {recursive:true,force:true}));
  await writeFile(join(dir,'replicas'), '#!/bin/sh\n[ "$1 $2 $3 $4" = "identity token --audience $EXPECTED_ORIGIN" ] || exit 1\nprintf "%s" fixture-workspace-token\n', {mode:0o700});
  const guide = await readFile(new URL('../src/content/docs/agents/replicas.mdx', import.meta.url),'utf8');
  const code = 'a'.repeat(64);
  const script = guide.match(/```sh\n([\s\S]*?)\n```/)[1]
    .replace('OPENCRAWL_SERVER_FROM_PROMPT', origin).replace('ONE_TIME_CODE_FROM_PROMPT', code);
  const {stdout,stderr} = await promisify(execFile)('sh', ['-c',script], {env:{PATH:dir+':'+process.env.PATH,EXPECTED_ORIGIN:origin}});
  assert.deepEqual(requests, [{path:'/api/replicas/connect',method:'POST',auth:'Bearer fixture-workspace-token',body:JSON.stringify({code})}]);
  assert.equal(stdout,'{"ok":true}');
  assert.equal(stderr,'');
});
