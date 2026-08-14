import { ListeningTraining } from "@/components/ListeningTraining";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <ListeningTraining locale={locale==="ja"?"ja":"id"}/>}
