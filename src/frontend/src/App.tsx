import { Toaster } from "@/components/ui/sonner";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { type Book, type BookId, ReadingStatus } from "./backend.d";
import BookDetail from "./components/BookDetail";
import BookForm from "./components/BookForm";
import LibraryView from "./components/LibraryView";
import { useActor } from "./hooks/useActor";

export type View =
  | { name: "library" }
  | { name: "add" }
  | { name: "edit"; id: BookId; book: Book }
  | { name: "detail"; id: BookId; book: Book };

export type BookEntry = [BookId, Book];

// Sample books for first-load experience
const SAMPLE_BOOKS: Omit<Book, "dateAdded">[] = [
  {
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    genre: "Fantasy",
    status: ReadingStatus.read,
    rating: 5,
    coverUrl: "https://covers.openlibrary.org/b/olid/OL8765824M-L.jpg",
    notes:
      "One of the best fantasy novels I've ever read. Kvothe's story is captivating from page one.",
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    genre: "History",
    status: ReadingStatus.read,
    rating: 4,
    coverUrl: "https://covers.openlibrary.org/b/olid/OL25681614M-L.jpg",
    notes: "Changed the way I think about civilization and human nature.",
  },
  {
    title: "Piranesi",
    author: "Susanna Clarke",
    genre: "Fantasy",
    status: ReadingStatus.reading,
    rating: 5,
    coverUrl: "https://covers.openlibrary.org/b/olid/OL29479558M-L.jpg",
    notes:
      "Utterly unique — a mysterious house with infinite halls and tidal staircases.",
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Fiction",
    status: ReadingStatus.wantToRead,
    rating: 0,
    coverUrl: "https://covers.openlibrary.org/b/olid/OL29241089M-L.jpg",
    notes: "",
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    genre: "Science Fiction",
    status: ReadingStatus.wantToRead,
    rating: 0,
    coverUrl: "https://covers.openlibrary.org/b/olid/OL32298781M-L.jpg",
    notes: "Everyone says this is even better than The Martian.",
  },
];

export default function App() {
  const { actor, isFetching: isActorFetching } = useActor();
  const [view, setView] = useState<View>({ name: "library" });
  const [books, setBooks] = useState<BookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [samplesSeeded, setSamplesSeeded] = useState(false);

  const loadBooks = useCallback(async () => {
    if (!actor) return;
    try {
      const all = await actor.getAllBooks();
      // Sort by dateAdded descending
      const sorted = [...all].sort((a, b) =>
        Number(b[1].dateAdded - a[1].dateAdded),
      );
      setBooks(sorted);
      return sorted;
    } catch (err) {
      console.error("Failed to load books:", err);
      toast.error("Failed to load your library");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  // Seed sample books on first load if library is empty
  const seedSampleBooks = useCallback(async () => {
    if (!actor || samplesSeeded) return;
    setSamplesSeeded(true);
    try {
      const existing = await actor.getAllBooks();
      if (existing.length === 0) {
        const now = BigInt(Date.now()) * BigInt(1_000_000);
        await Promise.all(
          SAMPLE_BOOKS.map((s, i) =>
            actor.addBook({
              ...s,
              dateAdded: now - BigInt(i) * BigInt(1_000_000_000),
            }),
          ),
        );
        await loadBooks();
      }
    } catch (err) {
      console.error("Failed to seed sample books:", err);
    }
  }, [actor, samplesSeeded, loadBooks]);

  useEffect(() => {
    if (actor && !isActorFetching) {
      loadBooks().then((result) => {
        if (result && result.length === 0) {
          seedSampleBooks();
        }
      });
    }
  }, [actor, isActorFetching, loadBooks, seedSampleBooks]);

  const handleAddBook = async (bookData: Omit<Book, "dateAdded">) => {
    if (!actor) throw new Error("Not connected");
    try {
      const book: Book = {
        ...bookData,
        dateAdded: BigInt(Date.now()) * BigInt(1_000_000),
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

  const handleUpdateBook = async (
    id: BookId,
    bookData: Omit<Book, "dateAdded">,
  ) => {
    if (!actor) throw new Error("Not connected");
    try {
      const existing = books.find(([bid]) => bid === id);
      const book: Book = {
        ...bookData,
        dateAdded: existing
          ? existing[1].dateAdded
          : BigInt(Date.now()) * BigInt(1_000_000),
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
