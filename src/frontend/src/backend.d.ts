import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Book {
    status: ReadingStatus;
    title: string;
    author: string;
    genre: string;
    notes: string;
    rating: number;
    coverUrl?: string;
    dateAdded: Time;
}
export type BookId = bigint;
export type Time = bigint;
export enum ReadingStatus {
    reading = "reading",
    read = "read",
    wantToRead = "wantToRead"
}
export interface backendInterface {
    addBook(book: Book): Promise<BookId>;
    deleteBook(id: BookId): Promise<void>;
    getAllBooks(): Promise<Array<[BookId, Book]>>;
    getBook(id: BookId): Promise<Book>;
    updateBook(id: BookId, book: Book): Promise<void>;
}
