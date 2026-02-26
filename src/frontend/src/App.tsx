import { useState, useEffect, useCallback } from "react";
import { Book, BookId } from "./backend.d";
import { useActor } from "./hooks/useActor";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import LibraryView from "./components/LibraryView";
import BookForm from "./components/BookForm";
import BookDetail from "./components/BookDetail";

export type View =
  | { name: "library" }
  | { name: "add" }
  | { name: "edit"; id: BookId; book: Book }
  | { name: "detail"; id: BookId; book: Book };

export type BookEntry = [BookId, Book];

export default function App() {
  const { actor, isFetching: isActorFetching } = useActor();
  const [view, setView] = useState<View>({ name: "library" });
  const [books, setBooks] = useState<BookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBooks = useCallback(async () => {
    if (!actor) return;
    try {
      const all = await actor.getAllBooks();
      // Sort by dateAdded descending
      const sorted = [...all].sort((a, b) =>
        Number(b[1].dateAdded - a[1].dateAdded)
      );
      setBooks(sorted);
    } catch (err) {
      console.error("Failed to load books:", err);
      toast.error("Failed to load your library");
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (actor && !isActorFetching) {
      loadBooks();
    }
  }, [actor, isActorFetching, loadBooks]);

  const handleAddBook = async (bookData: Omit<Book, "dateAdded">) => {
    if (!actor) throw new Error("Not connected");
    try {
      const book: Book = {
        ...bookData,
        dateAdded: BigInt(Date.now()),
      };
      await actor.addBook(book);
      await loadBooks();
      setView({ name: "library" });
      toast.success("Book added to your library");
    } catch (err) {
      console.error("Failed to add book:", err);
      toast.error("Failed to add book");
      throw err;
    }
  };

  const handleUpdateBook = async (id: BookId, bookData: Omit<Book, "dateAdded">) => {
    if (!actor) throw new Error("Not connected");
    try {
      const existing = books.find(([bid]) => bid === id);
      const book: Book = {
        ...bookData,
        dateAdded: existing ? existing[1].dateAdded : BigInt(Date.now()),
      };
      await actor.updateBook(id, book);
      await loadBooks();
      setView({ name: "library" });
      toast.success("Book updated");
    } catch (err) {
      console.error("Failed to update book:", err);
      toast.error("Failed to update book");
      throw err;
    }
  };

  const handleDeleteBook = async (id: BookId) => {
    if (!actor) throw new Error("Not connected");
    try {
      await actor.deleteBook(id);
      await loadBooks();
      setView({ name: "library" });
      toast.success("Book removed from library");
    } catch (err) {
      console.error("Failed to delete book:", err);
      toast.error("Failed to delete book");
      throw err;
    }
  };

  const handleNavigateToEdit = (id: BookId, book: Book) => {
    setView({ name: "edit", id, book });
  };

  const handleNavigateToDetail = (id: BookId, book: Book) => {
    setView({ name: "detail", id, book });
  };

  const showLoading = isLoading && isActorFetching;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {view.name === "library" && (
        <LibraryView
          books={books}
          isLoading={showLoading}
          onAddBook={() => setView({ name: "add" })}
          onViewDetail={handleNavigateToDetail}
        />
      )}

      {view.name === "add" && (
        <BookForm
          mode="add"
          onSave={handleAddBook}
          onCancel={() => setView({ name: "library" })}
        />
      )}

      {view.name === "edit" && (
        <BookForm
          mode="edit"
          initialBook={view.book}
          onSave={(data) => handleUpdateBook(view.id, data)}
          onCancel={() => setView({ name: "library" })}
        />
      )}

      {view.name === "detail" && (
        <BookDetail
          id={view.id}
          book={view.book}
          onBack={() => setView({ name: "library" })}
          onEdit={() => handleNavigateToEdit(view.id, view.book)}
          onDelete={() => handleDeleteBook(view.id)}
        />
      )}

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.2 0.03 265)",
            border: "1px solid oklch(0.32 0.025 265)",
            color: "oklch(0.96 0.005 265)",
          },
        }}
      />
    </div>
  );
}
