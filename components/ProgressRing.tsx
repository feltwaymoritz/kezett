export function ProgressRing({value,label}:{value:number;label:string}){
 const r=42,c=2*Math.PI*r,d=c*(1-value/100);
 return <div className="relative grid h-28 w-28 place-items-center"><svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-slate-800"/><circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={d} className="text-emerald-500"/></svg><div className="text-center"><div className="text-2xl font-black">{value}%</div><div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div></div></div>
}
