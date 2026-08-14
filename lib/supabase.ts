/** Minimal Supabase REST client to keep the starter dependency-light. */
export function supabaseRest(){
 const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!base||!key) return null;
 const headers={apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json"};
 return {
   async select(table:string,query="select=*"){
     const r=await fetch(`${base}/rest/v1/${table}?${query}`,{headers,cache:"no-store"});
     if(!r.ok) throw new Error(`Supabase ${r.status}`); return r.json();
   },
   async insert(table:string,row:unknown){
     const r=await fetch(`${base}/rest/v1/${table}`,{method:"POST",headers:{...headers,Prefer:"return=representation"},body:JSON.stringify(row)});
     if(!r.ok) throw new Error(`Supabase ${r.status}`); return r.json();
   }
 };
}
