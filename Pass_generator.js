import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot,  getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBHmpHyQd_il3SMJwJVZbzAsgokTNZfzKg",
    authDomain: "password-manager-3322.firebaseapp.com",
    projectId: "password-manager-3322",
    storageBucket: "password-manager-3322.appspot.com",
    messagingSenderId: "141147368358",
    appId: "1:141147368358:web:e0642e9b5fa5c0c6107d67",
    measurementId: "G-DYJ1RYK574"
  };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Function to create table row
function createTableRow(docId, username, password, link) {
  const newRow = document.createElement('tr');
  newRow.classList.add('row');

  newRow.innerHTML = `
    <td class="table-Data">
      ${username}
      <i class="fa-solid fa-copy copy-username btn cursor-pointer" data-username="${username}"></i>
    </td>
    <td class="table-Data">
      <input type="password" class="password-input outline-none hover:bg-[#97e8c5]" value="${password}" readonly>
      <i class="fa fa-eye toggle-password cursor-pointer"></i>
      <i class="fa-solid fa-copy copy-password btn cursor-pointer" data-password="${password}"></i>
    </td>
    <td class="table-Data table-button">
      <a href="${link}" class="links" target="_blank"><i class="fa-solid fa-globe"></i></a>
    </td>
    <td class="table-Data table-button">
      <i class="delete-btn delete fa-solid fa-trash" data-doc-id="${docId}"></i>
    </td>
  `;

  newRow.querySelector('.delete-btn').addEventListener('click', async (event) => {
    const docId = event.target.getAttribute('data-doc-id');
    const user = auth.currentUser;
    if (user) {
      try {
        await deleteDoc(doc(db, 'Password-generator-3322', user.uid, 'passwords', docId));
        console.log('Password deleted successfully!');
        loadPasswords(); // Reload passwords after deletion
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  });

  return newRow;
}

// Load passwords function
const loadPasswords = () => {
  const user = auth.currentUser;
  if (user) {
    console.log('Loading passwords for user:', user.uid);
    const userCollection = collection(db, 'Password-generator-3322', user.uid, 'passwords');
    onSnapshot(userCollection, (snapshot) => {
      const tableBody = document.getElementById('table-body');
      tableBody.innerHTML = '';
      snapshot.forEach((doc) => {
        const data = doc.data();
        const newRow = createTableRow(doc.id, data.username, data.password, data.link);
        tableBody.appendChild(newRow);
        console.log('Password loaded:', data);
      });
    }, (error) => {
      console.error('Error loading passwords:', error);
    });
  }
};
const fetchUsername = async (user) => {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const userData = docSnap.data();
        document.querySelector('.sidebar-username').textContent = "@"+userData.username;
    } else {
        console.log("No such document!");
    }
};

// Redirect to login if not authenticated
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
  } else {
    console.log('User is signed in:', user);
    await fetchUsername(user);
    loadPasswords(); // Load passwords after user is authenticated
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.form');
  const tableBody = document.getElementById('table-body');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.querySelector('.username').value;
    let password = document.querySelector('.password').value;
    let link = document.querySelector('.link').value;

    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      link = 'http://' + link;
    }

    if (username && password && link) {
      password = generatePassword(password);

      const user = auth.currentUser;
      if (user) {
        try {
          await addDoc(collection(db, 'Password-generator-3322', user.uid, 'passwords'), {
            username: username,
            password: password,
            link: link
          });
        //   alert('Password saved to Firestore!');
          loadPasswords(); // Reload passwords after adding a new one
        } catch (e) {
          console.error("Error adding document: ", e);
        }
      }
    } else {
      alert('Please fill out all fields');
    }

    document.querySelector('.username').value = '';
    document.querySelector('.password').value = '';
    document.querySelector('.link').value = '';
  });

  function generatePassword(userInput) {
    const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numericChars = '0123456789';

    function getRandomChar(charSet) {
      const randomIndex = Math.floor(Math.random() * charSet.length);
      return charSet[randomIndex];
    }

    function getRandomCharacters() {
      const special = getRandomChar(specialChars);
      const upper = getRandomChar(upperChars);
      const numeric = getRandomChar(numericChars);
      return special + upper + numeric;
    }

    let result = getRandomCharacters();

    for (let i = 0; i < userInput.length; i += 3) {
      result += userInput.substr(i, 3);
      if (i + 3 < userInput.length) {
        result += getRandomCharacters();
      }
    }

    result += getRandomCharacters();

    return result;
  }

  tableBody.addEventListener('click', (event) => {
    if (event.target.classList.contains('toggle-password')) {
      const passwordInput = event.target.previousElementSibling;
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        event.target.classList.add('fa-eye-slash');
        event.target.classList.remove('fa-eye');
      } else {
        passwordInput.type = 'password';
        event.target.classList.add('fa-eye');
        event.target.classList.remove('fa-eye-slash');
      }
    } else if (event.target.classList.contains('copy-username')) {
      const username = event.target.getAttribute('data-username');
      copyToClipboard(username);
    } else if (event.target.classList.contains('copy-password')) {
      const password = event.target.getAttribute('data-password');
      copyToClipboard(password);
    }
  });

  function copyToClipboard(text) {
    const tempInput = document.createElement('input');
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
  }
});
document.getElementById('logout').addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
        console('working')
    }).catch(error => {
        console.error('Error signing out:', error);
    });
});
let open = document.getElementById("myBtn")
        open.addEventListener("click", function () {
            document.getElementById('sidebar-responsive').classList.remove("hiddens")
        });
        let close = document.getElementById('close')
        //   console.log(close)
        close.addEventListener("click", function () {
            console.log("closed");
            document.getElementById('sidebar-responsive').classList.add("hiddens");
        });