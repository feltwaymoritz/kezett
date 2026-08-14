import { KanjiMaster } from "@/components/KanjiMaster";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <KanjiMaster locale={locale==="ja"?"ja":"id"}/>}
