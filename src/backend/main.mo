import Time "mo:core/Time";
import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Principal "mo:core/Principal";

actor {
  type BookId = Nat;

  type ReadingStatus = {
    #wantToRead;
    #reading;
    #read;
  };

  type Book = {
    title : Text;
    author : Text;
    genre : Text;
    status : ReadingStatus;
    rating : Nat8; // 0-5
    notes : Text;
    coverUrl : ?Text;
    dateAdded : Time.Time;
  };

  let users = Map.empty<Principal, Map.Map<BookId, Book>>();
  var nextBookId = 0;

  func getUserBooksMap(user : Principal) : Map.Map<BookId, Book> {
    switch (users.get(user)) {
      case (null) {
        let newBooksMap = Map.empty<BookId, Book>();
        users.add(user, newBooksMap);
        newBooksMap;
      };
      case (?booksMap) { booksMap };
    };
  };

  public shared ({ caller }) func addBook(book : Book) : async BookId {
    if (book.rating > 5) { Runtime.trap("Rating must be between 0 and 5") };

    let booksMap = getUserBooksMap(caller);
    booksMap.add(nextBookId, book);
    nextBookId += 1;
    nextBookId - 1;
  };

  public shared ({ caller }) func updateBook(id : BookId, book : Book) : async () {
    let booksMap = getUserBooksMap(caller);
    if (book.rating > 5) { Runtime.trap("Rating must be between 0 and 5") };
    if (not booksMap.containsKey(id)) { Runtime.trap("Book not found") };
    booksMap.add(id, book);
  };

  public shared ({ caller }) func deleteBook(id : BookId) : async () {
    let booksMap = getUserBooksMap(caller);
    if (not booksMap.containsKey(id)) { Runtime.trap("Book not found") };
    booksMap.remove(id);
  };

  public query ({ caller }) func getBook(id : BookId) : async Book {
    let booksMap = getUserBooksMap(caller);
    switch (booksMap.get(id)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) { book };
    };
  };

  public query ({ caller }) func getAllBooks() : async [(BookId, Book)] {
    getUserBooksMap(caller).toArray();
  };
};
