import { StatsView } from "@/components/StatsView";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <StatsView locale={locale==="ja"?"ja":"id"}/>}
