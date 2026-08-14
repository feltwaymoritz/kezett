import { TryoutRunner } from "@/components/TryoutRunner";
export default async function Page({params}:{params:Promise<{locale:string,id:string}>}){const {locale,id}=await params;return <TryoutRunner locale={locale==="ja"?"ja":"id"} id={id}/>}
