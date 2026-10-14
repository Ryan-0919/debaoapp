import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
const secret=process.env.POLYV_AUTH_SECRET, id='8396848', ts=String(Date.now()),userid='debao_integration_probe';
const sign=createHash('md5').update(secret+id+secret+ts+secret+userid).digest('hex');
const url='https://live.polyv.cn/watch/'+id+'?'+new URLSearchParams({userid,nickname:Buffer.from('联调测试').toString('base64'),ts,sign});
const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(20000)});
const text=await r.text();writeFileSync('/etc/debao/polyv-watch-probe.html',text,{mode:0o600});
console.log(JSON.stringify({status:r.status,location:r.headers.get('location')?.split('?')[0],length:text.length,title:text.match(/<title>(.*?)<\/title>/s)?.[1]}));
