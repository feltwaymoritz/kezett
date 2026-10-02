import { JlptHistory } from "@/components/jlpt/JlptHistory";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <JlptHistory locale={locale==="ja"?"ja":"id"}/>}
