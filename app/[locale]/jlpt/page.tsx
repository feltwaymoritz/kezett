import { JlptHome } from "@/components/jlpt/JlptHome";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <JlptHome locale={locale==="ja"?"ja":"id"}/>}
