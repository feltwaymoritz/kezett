import { Shell } from "@/components/Shell";
export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){
  const {locale}=await params;
  return <Shell locale={locale === "ja" ? "ja" : "id"}>{children}</Shell>;
}
