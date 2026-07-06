import { readFileSync } from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'; import * as Y from 'yjs'
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
for (const l of readFileSync(path.join(root,'.env.local'),'utf-8').split('\n')){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m)process.env[m[1]]??=m[2].replace(/^["']|["']$/g,'')}
const URL=process.env.NEXT_PUBLIC_SUPABASE_URL.trim(), ANON=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim(), SVC=process.env.SUPABASE_SERVICE_ROLE_KEY.trim()
const STUDENT_ID='e7c0651a-3860-4374-ba87-96854de4e13a'
const admin=createClient(URL,SVC,{auth:{persistSession:false}})
let pass=0,fail=0; const ok=(c,m)=>{c?(pass++,console.log('  ✓',m)):(fail++,console.log('  ✗',m))}
const b64e=u=>Buffer.from(u).toString('base64'); const b64d=s=>new Uint8Array(Buffer.from(s,'base64'))

// 1. RLS persistence: teacher upsert, student read+update, teacher read
async function rls(){
  console.log('1. RLS persistence (teacher upsert / student edit)')
  const t=createClient(URL,ANON,{auth:{persistSession:false}}); await t.auth.signInWithPassword({email:'noanoayo46@gmail.com',password:'genoa12345'})
  const {data:{user:tu}}=await t.auth.getUser()
  const {error:ue}=await t.from('lesson_docs').upsert({teacher_id:tu.id,student_id:STUDENT_ID,active:true,state:b64e(new Uint8Array([1,2,3]))},{onConflict:'student_id'})
  ok(!ue,'teacher upsert doc'+(ue?' — '+ue.message:''))
  const s=createClient(URL,ANON,{auth:{persistSession:false}}); await s.auth.signInWithPassword({email:'jeffganly@gmail.com',password:'JeffLesson26!'})
  const {data:sr}=await s.from('lesson_docs').select('state,active').eq('student_id',STUDENT_ID).maybeSingle()
  ok(!!sr&&sr.active,'student can read the doc row')
  const {error:se}=await s.from('lesson_docs').update({state:b64e(new Uint8Array([9,9]))}).eq('student_id',STUDENT_ID)
  ok(!se,'student can update doc state'+(se?' — '+se.message:''))
}

// 2. Realtime broadcast Yjs convergence between two clients
async function realtime(){
  console.log('2. Realtime Yjs sync between two clients')
  const room='doc:'+STUDENT_ID
  const mk=()=>{const c=createClient(URL,ANON,{auth:{persistSession:false}});return c}
  const cA=mk(), cB=mk()
  const dA=new Y.Doc(), dB=new Y.Doc()
  const chA=cA.channel(room,{config:{broadcast:{self:false}}}), chB=cB.channel(room,{config:{broadcast:{self:false}}})
  dA.on('update',(u,o)=>{if(o!=='r')chA.send({type:'broadcast',event:'update',payload:{u:b64e(u)}})})
  chB.on('broadcast',{event:'update'},({payload})=>Y.applyUpdate(dB,b64d(payload.u),'r'))
  await new Promise(r=>chB.subscribe(s=>s==='SUBSCRIBED'&&r()))
  await new Promise(r=>chA.subscribe(s=>s==='SUBSCRIBED'&&r()))
  await new Promise(r=>setTimeout(r,400))
  dA.getText('t').insert(0,'こんにちは from teacher')
  await new Promise(r=>setTimeout(r,900))
  ok(dB.getText('t').toString()==='こんにちは from teacher','client B received edit: "'+dB.getText('t').toString()+'"')
  await cA.removeChannel(chA); await cB.removeChannel(chB)
}

async function main(){
  try{ await rls() }catch(e){ok(false,'RLS threw '+e.message)}
  try{ await realtime() }catch(e){ok(false,'realtime threw '+e.message)}
  // cleanup
  await admin.from('lesson_docs').delete().eq('student_id',STUDENT_ID)
  console.log('\ncleaned up. '+(fail===0?'✅ ALL PASS':'❌ FAIL')+` — ${pass} passed, ${fail} failed`)
  process.exit(fail===0?0:1)
}
main()
