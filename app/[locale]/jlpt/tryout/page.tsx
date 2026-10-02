import { JlptLibrary } from "@/components/jlpt/JlptLibrary";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <JlptLibrary locale={locale==="ja"?"ja":"id"}/>}
