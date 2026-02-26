import { useState, useMemo } from "react";
import { Book, BookId, ReadingStatus } from "../backend.d";
import { BookEntry } from "../App";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Search,
  Plus,
  BookMarked,
  BookCheck,
  Bookmark,
  Star,
  LibraryBig,
} from "lucide-react";

interface LibraryViewProps {
  books: BookEntry[];
  isLoading: boolean;
  onAddBook: () => void;
  onViewDetail: (id: BookId, book: Book) => void;
}

type StatusFilter = "all" | ReadingStatus;

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: ReadingStatus.wantToRead, label: "Want to Read" },
  { value: ReadingStatus.reading, label: "Reading" },
  { value: ReadingStatus.read, label: "Read" },
];

function StatusBadge({ status }: { status: ReadingStatus }) {
  const config = {
    [ReadingStatus.wantToRead]: {
      label: "Want to Read",
      className: "status-bg-want status-want border text-xs font-mono",
    },
    [ReadingStatus.reading]: {
      label: "Reading",
      className: "status-bg-reading status-reading border text-xs font-mono",
    },
    [ReadingStatus.read]: {
      label: "Read",
      className: "status-bg-read status-read border text-xs font-mono",
    },
  };
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i <= rating
              ? "fill-accent text-accent"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

function BookCard({
  book,
  onClick,
}: {
  book: Book;
  onClick: () => void;
}) {
  const spineClass = {
    [ReadingStatus.wantToRead]: "spine-want",
    [ReadingStatus.reading]: "spine-reading",
    [ReadingStatus.read]: "spine-read",
  }[book.status];

  return (
    <button
      type="button"
      onClick={onClick}
      className="book-card animate-fade-slide w-full text-left rounded-xl overflow-hidden shadow-card hover:shadow-card-hover bg-card border border-border/60 flex flex-col group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Cover image area */}
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-muted">
        {/* Spine accent */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${spineClass} z-10`} />

        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/30" />
          </div>
        )}

        {/* Rating overlay */}
        {book.rating > 0 && (
          <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-1.5 py-1">
            <StarRating rating={book.rating} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="font-serif text-sm font-medium text-card-foreground line-clamp-2 leading-snug">
          {book.title}
        </p>
        <p className="font-mono text-xs text-muted-foreground truncate">
          {book.author}
        </p>
        <div className="mt-auto pt-1">
          <StatusBadge status={book.status} />
        </div>
      </div>
    </button>
  );
}

function StatsBar({ books }: { books: BookEntry[] }) {
  const stats = useMemo(() => {
    return {
      total: books.length,
      reading: books.filter(([, b]) => b.status === ReadingStatus.reading).length,
      read: books.filter(([, b]) => b.status === ReadingStatus.read).length,
      want: books.filter(([, b]) => b.status === ReadingStatus.wantToRead).length,
    };
  }, [books]);

  return (
    <div className="grid grid-cols-4 gap-2 px-4 py-3">
      {[
        { label: "Total", value: stats.total, icon: LibraryBig, color: "text-foreground" },
        { label: "Reading", value: stats.reading, icon: BookOpen, color: "status-reading" },
        { label: "Read", value: stats.read, icon: BookCheck, color: "status-read" },
        { label: "Want", value: stats.want, icon: Bookmark, color: "status-want" },
      ].map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-0.5 bg-card rounded-lg p-2 border border-border/40"
        >
          <Icon className={`w-4 h-4 ${color}`} />
          <span className={`font-mono text-base font-bold ${color}`}>{value}</span>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 animate-fade-slide">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-2xl bg-card border border-border/40 flex items-center justify-center">
          <BookMarked className="w-12 h-12 text-primary/70" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
          <span className="text-primary font-mono text-xs font-bold">
            {filtered ? "0" : "+"}
          </span>
        </div>
      </div>
      <h3 className="font-serif text-xl text-foreground mb-2">
        {filtered ? "No matches found" : "Your library awaits"}
      </h3>
      <p className="font-sans text-sm text-muted-foreground text-center max-w-xs">
        {filtered
          ? "Try a different search or filter"
          : "Start cataloging your books — tap the + button to add your first one"}
      </p>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {Array.from({ length: 6 }, (_, i) => i).map((i) => (
        <div key={`skel-${i}`} className="rounded-xl overflow-hidden bg-card border border-border/40">
          <Skeleton className="w-full aspect-[2/3]" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LibraryView({
  books,
  isLoading,
  onAddBook,
  onViewDetail,
}: LibraryViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    let result = books;
    if (statusFilter !== "all") {
      result = result.filter(([, b]) => b.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        ([, b]) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q)
      );
    }
    return result;
  }, [books, search, statusFilter]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/40 safe-top">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-serif text-2xl text-foreground leading-tight">
                My Library
              </h1>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">
                {books.length} {books.length === 1 ? "book" : "books"} cataloged
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-card border border-border/40 flex items-center justify-center">
              <BookMarked className="w-5 h-5 text-primary" />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 font-mono text-sm bg-card border-border/60 placeholder:text-muted-foreground/50 h-10"
            />
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {STATUS_TABS.map((tab) => (
            <button
              type="button"
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`shrink-0 font-mono text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${
                statusFilter === tab.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border/40 hover:border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Stats */}
      {!isLoading && books.length > 0 && <StatsBar books={books} />}

      {/* Main content */}
      <main className="flex-1 pb-24">
        {isLoading ? (
          <div className="pt-4">
            <SkeletonGrid />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState filtered={search.length > 0 || statusFilter !== "all"} />
        ) : (
          <div className="grid grid-cols-2 gap-3 px-4 pt-3 stagger">
            {filtered.map(([id, book]) => (
              <BookCard
                key={String(id)}
                book={book}
                onClick={() => onViewDetail(id, book)}
              />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        type="button"
        onClick={onAddBook}
        aria-label="Add new book"
        className="fab-pulse fixed bottom-8 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-fab flex items-center justify-center transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-sm border-t border-border/40 flex items-center justify-center safe-bottom pointer-events-none">
        <p className="font-mono text-[10px] text-muted-foreground/50">
          © 2026 · Built with{" "}
          <span className="text-primary">♥</span>{" "}
          using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 pointer-events-auto"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
