import { JlptRunner } from "@/components/jlpt/JlptRunner";
export default async function Page({params}:{params:Promise<{locale:string,id:string}>}){const {locale,id}=await params;return <JlptRunner locale={locale==="ja"?"ja":"id"} id={id}/>}
