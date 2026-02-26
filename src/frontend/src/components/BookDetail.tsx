import { useState } from "react";
import { Book, BookId, ReadingStatus } from "../backend.d";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  BookOpen,
  Star,
  Calendar,
  Tag,
  FileText,
  Loader2,
} from "lucide-react";

interface BookDetailProps {
  id: BookId;
  book: Book;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}

function StatusBadge({ status }: { status: ReadingStatus }) {
  const config = {
    [ReadingStatus.wantToRead]: {
      label: "Want to Read",
      className: "status-bg-want status-want border",
    },
    [ReadingStatus.reading]: {
      label: "Currently Reading",
      className: "status-bg-reading status-reading border",
    },
    [ReadingStatus.read]: {
      label: "Read",
      className: "status-bg-read status-read border",
    },
  };
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full font-mono text-sm ${className}`}>
      {label}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  if (rating === 0) return <span className="font-mono text-sm text-muted-foreground">Not rated</span>;
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i <= rating ? "fill-accent text-accent" : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <span className="font-mono text-sm text-muted-foreground">{rating}/5</span>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/30 last:border-0">
      <div className="mt-0.5 w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          {label}
        </p>
        <div className="font-sans text-sm text-foreground">{value}</div>
      </div>
    </div>
  );
}

export default function BookDetail({
  book,
  onBack,
  onEdit,
  onDelete,
}: BookDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const dateAdded = new Date(Number(book.dateAdded));
  const formattedDate = dateAdded.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const spineClass = {
    [ReadingStatus.wantToRead]: "spine-want",
    [ReadingStatus.reading]: "spine-reading",
    [ReadingStatus.read]: "spine-read",
  }[book.status];

  return (
    <div className="flex flex-col min-h-screen animate-fade-slide">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/40 safe-top">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-card border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="font-mono h-9 border-border/60 bg-card gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isDeleting}
                  className="font-mono h-9 border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 gap-1.5"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border max-w-xs mx-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif text-foreground">
                    Remove this book?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="font-mono text-sm text-muted-foreground">
                    "{book.title}" will be permanently removed from your library.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel className="font-mono bg-card border-border/60">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="font-mono bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-8">
        {/* Hero section */}
        <div className="relative">
          {/* Background blur */}
          {book.coverUrl && (
            <div
              className="absolute inset-0 opacity-20 blur-xl scale-110"
              style={{
                backgroundImage: `url(${book.coverUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}

          <div className="relative px-4 py-8 flex gap-5">
            {/* Cover */}
            <div className="relative w-28 shrink-0 rounded-xl overflow-hidden shadow-card border border-border/40">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${spineClass} z-10`} />
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={`Cover of ${book.title}`}
                  className="w-full aspect-[2/3] object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).parentElement!.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-muted-foreground/40" />
                </div>
              )}
            </div>

            {/* Title info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
              <h1 className="font-serif text-xl text-foreground leading-tight">
                {book.title}
              </h1>
              <p className="font-mono text-sm text-muted-foreground">
                {book.author}
              </p>
              {book.genre && (
                <span className="font-mono text-xs text-muted-foreground/70 bg-muted/50 px-2 py-0.5 rounded-md w-fit">
                  {book.genre}
                </span>
              )}
              <StatusBadge status={book.status} />
            </div>
          </div>
        </div>

        {/* Details card */}
        <div className="mx-4 rounded-xl bg-card border border-border/40 overflow-hidden shadow-card">
          <div className="px-4">
            <InfoRow
              icon={Star}
              label="Rating"
              value={<StarRating rating={book.rating} />}
            />
            <InfoRow
              icon={Calendar}
              label="Date Added"
              value={<span className="font-mono text-sm">{formattedDate}</span>}
            />
            {book.genre && (
              <InfoRow
                icon={Tag}
                label="Genre"
                value={<span className="font-mono text-sm">{book.genre}</span>}
              />
            )}
            {book.notes && (
              <InfoRow
                icon={FileText}
                label="Notes"
                value={
                  <p className="font-sans text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {book.notes}
                  </p>
                }
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
