import { DrillingHub } from "@/components/DrillingHub";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <DrillingHub locale={locale==="ja"?"ja":"id"}/>}
