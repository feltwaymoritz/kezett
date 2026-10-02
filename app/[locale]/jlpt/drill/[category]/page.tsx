import { JlptDrillRunner } from "@/components/jlpt/JlptDrillRunner";
const allowed = new Set(["vocab","grammar","reading","listening","mix"]);
export default async function Page({params,searchParams}:{params:Promise<{locale:string,category:string}>;searchParams:Promise<{count?:string;timer?:string;min?:string}>}){
 const {locale,category}=await params; const query=await searchParams;
 const n=Number(query.count||20); const count=[10,20,30,50].includes(n)?n:20;
 const m=Number(query.min||20); const minutes=[10,20,30,45].includes(m)?m:20;
 const timerOn=query.timer!=="0";
 const cat=allowed.has(category)?category:"mix";
 return <JlptDrillRunner locale={locale==="ja"?"ja":"id"} category={cat} count={count} timerOn={timerOn} minutes={minutes}/>;
}
