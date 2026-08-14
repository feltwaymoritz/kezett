import { VocabularyMaster } from "@/components/VocabularyMaster";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <VocabularyMaster locale={locale==="ja"?"ja":"id"}/>}
