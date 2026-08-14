import { notFound } from "next/navigation";
import { ChapterQuiz } from "@/components/ChapterQuiz";
import { getBook, getChapter } from "@/data/bookLibrary";
export default async function Page({params}:{params:Promise<{locale:string;bookId:string;chapterId:string}>}){const {locale,bookId,chapterId}=await params;const book=getBook(bookId);const chapter=getChapter(bookId,chapterId);if(!book||!chapter)notFound();return <ChapterQuiz locale={locale==="ja"?"ja":"id"} book={book} chapter={chapter}/>}
