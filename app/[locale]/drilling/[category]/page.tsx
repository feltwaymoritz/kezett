import { DrillingRunner } from "@/components/DrillingRunner";
import type { DrillCategory } from "@/types";
const allowed = new Set(["mixed","vocabulary","grammar","listening","reading"]);
export default async function Page({params,searchParams}:{params:Promise<{locale:string,category:string}>;searchParams:Promise<{count?:string}>}){
 const {locale,category}=await params; const query=await searchParams; const n=Number(query.count||20); const count=[10,20,50].includes(n)?n:20; const cat=(allowed.has(category)?category:"mixed") as DrillCategory;
 return <DrillingRunner locale={locale==="ja"?"ja":"id"} category={cat} count={count}/>;
}
