document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function (event) {
      event.preventDefault();
      addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

const books = [];
const RENDER_EVENT = 'render-book';

function showFloatingMessage(message) {
  const floatingMessage = document.getElementById('floating-message');
  const messageText = document.getElementById('message-text');

  messageText.innerText = message;
  floatingMessage.classList.add('show');

  setTimeout(() => {
    floatingMessage.classList.remove('show');
  }, 3000);
}

function addBook() {
  const title = document.getElementById('inputBookTitle').value;
  const author = document.getElementById('inputBookAuthor').value;
  const year = document.getElementById('inputBookYear').value;
  const isComplete = document.getElementById('inputBookIsComplete').checked;
  const generatedID = generateId();

  const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  showFloatingMessage('Data telah disimpan.');
  saveData();

}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
      id,
      title,
      author,
      year,
      isComplete
  }
}

function makeBook(bookObject) {
  const textTitle = document.createElement('h2');
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = `Penulis: ${bookObject.author}`;

  const textYear = document.createElement('p');
  textYear.innerText = `Tahun: ${bookObject.year}`;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement('div');
  container.classList.add('item', 'shadow');
  container.append(textContainer);
  container.setAttribute('id', `book-${bookObject.id}`);

  if (bookObject.isComplete) {
      const undoButton = document.createElement('button');
      undoButton.classList.add('unComplete-button');
      undoButton.innerText = 'Belum Selesai Dibaca';

      undoButton.addEventListener('click', function () {
          undoBookFromCompleted(bookObject.id);
      });

      const trashButton = document.createElement('button');
      trashButton.classList.add('trash-button');
      trashButton.innerText = 'Hapus Buku';

      trashButton.addEventListener('click', function () {
          removeBookFromCompleted(bookObject.id);
      });

      container.append(undoButton, trashButton);
  } else {
      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add('boxButton');
      const checkButton = document.createElement('button');
      checkButton.classList.add('complete-button');
      checkButton.innerText = 'Selesai Dibaca';

      checkButton.addEventListener('click', function () {
          addBookToCompleted(bookObject.id);
      });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');
        trashButton.innerText = 'Hapus Buku';
        
        trashButton.addEventListener('click', function () {
            removeBookFromCompleted(bookObject.id);
        });

      container.append(checkButton, trashButton);
  }

  return container;
}

  document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookList = document.getElementById('unCompleteBooks');
    const completedBookList = document.getElementById('completeBooks');
    uncompletedBookList.innerHTML = '';
    completedBookList.innerHTML = '';

    if (books.length === 0) {
        const noBooksMessage = document.getElementById('noBooksMessage');
        noBooksMessage.style.display = 'block';
    } else {
        const noBooksMessage = document.getElementById('noBooksMessage');
        noBooksMessage.style.display = 'none';
    }

    for (const bookObject of books) {
        const bookElement = makeBook(bookObject);
        if (bookObject.isComplete) {
            completedBookList.append(bookElement);
        } else {
            uncompletedBookList.append(bookElement);
        }
    }
});

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  showFloatingMessage('Buku Dipindah Ke Rak Selesai.');
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  showFloatingMessage('Buku Dipindah Ke Rak Belum Selesai.');
  saveData();
}

function removeBookFromCompleted(bookId) {
  const confirmation = confirm("Apakah Anda yakin ingin menghapus buku ini?");

  if (confirmation) {
    const bookIndex = books.findIndex(book => book.id == bookId);

    if (bookIndex !== -1) {
        books.splice(bookIndex, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        showFloatingMessage('Buku telah dihapus.');
        saveData();
    }
  }
  
}

function findBook(bookId) {
  return books.find(book => book.id == bookId);
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';
 
document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
 
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
 
  document.dispatchEvent(new Event(RENDER_EVENT));
}

const searchForm = document.getElementById('searchForm');
searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    performSearch();
});

function performSearch() {
  const searchText = searchInput.value.toLowerCase();
  const uncompletedBookList = document.getElementById('unCompleteBooks');
  const completedBookList = document.getElementById('completeBooks');
  uncompletedBookList.innerHTML = '';
  completedBookList.innerHTML = '';

  const matchingBooks = books.filter(bookObject =>
    bookObject.title.toLowerCase().includes(searchText)
  );

  if (matchingBooks.length === 0) {
      const noBooksMessage = document.getElementById('noBooksMessage');
      noBooksMessage.style.display = 'block';
  } else {
      const noBooksMessage = document.getElementById('noBooksMessage');
      noBooksMessage.style.display = 'none';
  }

  for (const bookObject of books) {
      if (bookObject.title.toLowerCase().includes(searchText)) {
          const bookElement = makeBook(bookObject);
          if (bookObject.isComplete) {
              completedBookList.append(bookElement);
          } else {
              uncompletedBookList.append(bookElement);
          }
      }
  }

  const bookContainer = document.getElementById('bookContainer');
  bookContainer.scrollIntoView({ behavior: 'smooth' });
}