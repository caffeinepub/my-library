import { useState } from "react";
import { Book, ReadingStatus } from "../backend.d";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Star, Loader2, BookOpen } from "lucide-react";

interface BookFormProps {
  mode: "add" | "edit";
  initialBook?: Book;
  onSave: (book: Omit<Book, "dateAdded">) => Promise<void>;
  onCancel: () => void;
}

const DEFAULT_FORM: Omit<Book, "dateAdded"> = {
  title: "",
  author: "",
  genre: "",
  status: ReadingStatus.wantToRead,
  rating: 0,
  coverUrl: "",
  notes: "",
};

const GENRES = [
  "Fiction",
  "Non-Fiction",
  "Mystery",
  "Science Fiction",
  "Fantasy",
  "Romance",
  "Thriller",
  "Biography",
  "History",
  "Self-Help",
  "Science",
  "Poetry",
  "Graphic Novel",
  "Children's",
  "Other",
];

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <fieldset className="flex gap-2 border-0 p-0 m-0" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          aria-label={`${i} star${i !== 1 ? "s" : ""}`}
          onClick={() => onChange(i === value ? 0 : i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          className="p-1 rounded-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              i <= (hovered || value)
                ? "fill-accent text-accent"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="font-mono text-xs text-muted-foreground self-center ml-1">
          {value}/5
        </span>
      )}
    </fieldset>
  );
}

export default function BookForm({
  mode,
  initialBook,
  onSave,
  onCancel,
}: BookFormProps) {
  const [form, setForm] = useState<Omit<Book, "dateAdded">>(() => {
    if (initialBook) {
      return {
        title: initialBook.title,
        author: initialBook.author,
        genre: initialBook.genre,
        status: initialBook.status,
        rating: initialBook.rating,
        coverUrl: initialBook.coverUrl ?? "",
        notes: initialBook.notes,
      };
    }
    return { ...DEFAULT_FORM };
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.author.trim()) newErrors.author = "Author is required";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsSaving(true);
    try {
      await onSave({
        ...form,
        title: form.title.trim(),
        author: form.author.trim(),
        genre: form.genre.trim(),
        notes: form.notes.trim(),
        coverUrl: form.coverUrl?.trim() || undefined,
        rating: form.rating,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <div className="flex flex-col min-h-screen animate-fade-slide">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/40 safe-top">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-9 h-9 rounded-xl bg-card border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-xl text-foreground">
              {mode === "add" ? "Add Book" : "Edit Book"}
            </h1>
            <p className="font-mono text-xs text-muted-foreground">
              {mode === "add" ? "Catalog a new read" : "Update book details"}
            </p>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6 pb-32" noValidate>
          {/* Cover preview */}
          {form.coverUrl && (
            <div className="flex justify-center">
              <div className="relative w-32 rounded-xl overflow-hidden shadow-card border border-border/40">
                <img
                  src={form.coverUrl}
                  alt="Book cover preview"
                  className="w-full aspect-[2/3] object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).parentElement!.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Title <span className="text-primary">*</span>
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Book title..."
              className={`bg-card border-border/60 font-serif text-base h-12 ${
                errors.title ? "border-destructive" : ""
              }`}
              disabled={isSaving}
            />
            {errors.title && (
              <p className="font-mono text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="author" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Author <span className="text-primary">*</span>
            </Label>
            <Input
              id="author"
              value={form.author}
              onChange={(e) => set("author", e.target.value)}
              placeholder="Author name..."
              className={`bg-card border-border/60 font-mono h-12 ${
                errors.author ? "border-destructive" : ""
              }`}
              disabled={isSaving}
            />
            {errors.author && (
              <p className="font-mono text-xs text-destructive">{errors.author}</p>
            )}
          </div>

          {/* Genre */}
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Genre
            </Label>
            <Select
              value={form.genre || "__none__"}
              onValueChange={(v) => set("genre", v === "__none__" ? "" : v)}
              disabled={isSaving}
            >
              <SelectTrigger className="bg-card border-border/60 font-mono h-12">
                <SelectValue placeholder="Select genre..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="__none__" className="font-mono text-muted-foreground">
                  No genre
                </SelectItem>
                {GENRES.map((g) => (
                  <SelectItem key={g} value={g} className="font-mono">
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Reading Status
            </Label>
            <Select
              value={form.status}
              onValueChange={(v) => set("status", v as ReadingStatus)}
              disabled={isSaving}
            >
              <SelectTrigger className="bg-card border-border/60 font-mono h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value={ReadingStatus.wantToRead} className="font-mono">
                  Want to Read
                </SelectItem>
                <SelectItem value={ReadingStatus.reading} className="font-mono">
                  Currently Reading
                </SelectItem>
                <SelectItem value={ReadingStatus.read} className="font-mono">
                  Read
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Rating
            </Label>
            <StarPicker value={form.rating} onChange={(v) => set("rating", v)} />
          </div>

          {/* Cover URL */}
          <div className="space-y-2">
            <Label htmlFor="coverUrl" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Cover Image URL
            </Label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="coverUrl"
                value={form.coverUrl ?? ""}
                onChange={(e) => set("coverUrl", e.target.value)}
                placeholder="https://..."
                className="bg-card border-border/60 font-mono text-sm h-12 pl-9"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Your thoughts, quotes, or notes about this book..."
              className="bg-card border-border/60 font-sans text-sm min-h-28 resize-none"
              disabled={isSaving}
            />
          </div>
        </form>
      </main>

      {/* Sticky actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/40 px-4 py-4 flex gap-3 safe-bottom">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1 h-12 font-mono border-border/60 bg-card"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex-1 h-12 font-mono bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : mode === "add" ? (
            "Add to Library"
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
