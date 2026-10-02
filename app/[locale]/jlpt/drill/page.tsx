import { JlptDrillHub } from "@/components/jlpt/JlptDrillHub";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <JlptDrillHub locale={locale==="ja"?"ja":"id"}/>}
