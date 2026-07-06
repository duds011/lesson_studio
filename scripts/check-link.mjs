import { readFileSync } from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { createClient } from '@supabase/supabase-js'
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
for (const l of readFileSync(path.join(root,'.env.local'),'utf-8').split('\n')){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m)process.env[m[1]]??=m[2].replace(/^["']|["']$/g,'')}
const URL=process.env.NEXT_PUBLIC_SUPABASE_URL.trim(), ANON=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()
const STUDENT='e7c0651a-3860-4374-ba87-96854de4e13a', EVENT='evt_link_check'
let pass=0,fail=0; const ok=(c,m)=>{c?(pass++,console.log('  ✓',m)):(fail++,console.log('  ✗',m))}
const t=createClient(URL,ANON,{auth:{persistSession:false}}); await t.auth.signInWithPassword({email:'noanoayo46@gmail.com',password:'genoa12345'})
const {data:{user}}=await t.auth.getUser()
const {error:ue}=await t.from('lesson_event_links').upsert({event_id:EVENT,teacher_id:user.id,student_id:STUDENT},{onConflict:'event_id'})
ok(!ue,'teacher links event→student'+(ue?' — '+ue.message:''))
const {data:rd}=await t.from('lesson_event_links').select('student_id').eq('event_id',EVENT).maybeSingle()
ok(rd?.student_id===STUDENT,'link reads back')
// student cannot see the link
const s=createClient(URL,ANON,{auth:{persistSession:false}}); await s.auth.signInWithPassword({email:'jeffganly@gmail.com',password:'JeffLesson26!'})
const {data:leak}=await s.from('lesson_event_links').select('student_id').eq('event_id',EVENT).maybeSingle()
ok(!leak,'student cannot read links table (RLS)')
await t.from('lesson_event_links').delete().eq('event_id',EVENT)
console.log('\n'+(fail===0?'✅ ALL PASS':'❌ FAIL')+` — ${pass}/${pass+fail}`); process.exit(fail?1:0)
