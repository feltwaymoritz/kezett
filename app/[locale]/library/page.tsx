import { BookLibrary } from "@/components/BookLibrary";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <BookLibrary locale={locale==="ja"?"ja":"id"}/>}
