import { SettingsView } from "@/components/SettingsView";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <SettingsView locale={locale==="ja"?"ja":"id"}/>}
