import { notFound } from "next/navigation";
import { ChapterStudy } from "@/components/ChapterStudy";
import { getBook, getChapter } from "@/data/bookLibrary";
export default async function Page({params}:{params:Promise<{locale:string;bookId:string;chapterId:string}>}){const {locale,bookId,chapterId}=await params;const book=getBook(bookId);const chapter=getChapter(bookId,chapterId);if(!book||!chapter)notFound();return <ChapterStudy locale={locale==="ja"?"ja":"id"} book={book} chapter={chapter}/>}
