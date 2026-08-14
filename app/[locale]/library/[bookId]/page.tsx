import { notFound } from "next/navigation";
import { BookDetail } from "@/components/BookDetail";
import { getBook } from "@/data/bookLibrary";
export default async function Page({params}:{params:Promise<{locale:string;bookId:string}>}){const {locale,bookId}=await params;const book=getBook(bookId);if(!book)notFound();return <BookDetail locale={locale==="ja"?"ja":"id"} book={book}/>}
