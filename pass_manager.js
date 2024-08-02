import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

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
            <i class="fa-solid fa-pen edit-username btn cursor-pointer" data-doc-id="${docId}" data-field="username"></i>
        </td>
        <td class="table-Data">
            <input type="password" class="password-input outline-none hover:bg-[#97e8c5]" value="${password}" readonly>
            <i class="fa fa-eye toggle-password cursor-pointer"></i>
            <i class="fa-solid fa-copy copy-password btn cursor-pointer" data-password="${password}"></i>
            <i class="fa-solid fa-pen edit-password btn cursor-pointer" data-doc-id="${docId}" data-field="password"></i>
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
                await deleteDoc(doc(db, 'Password-manager-3322', user.uid, 'passwords', docId));
                console.log('Password deleted successfully!');
                loadPasswords(); // Reload passwords after deletion
            } catch (error) {
                console.error('Error deleting document:', error);
            }
        }
    });

    newRow.querySelector('.edit-username').addEventListener('click', async (event) => {
        const docId = event.target.getAttribute('data-doc-id');
        const newUsername = prompt("Enter new username:");
        if (newUsername) {
            const user = auth.currentUser;
            if (user) {
                try {
                    await updateDoc(doc(db, 'Password-manager-3322', user.uid, 'passwords', docId), {
                        username: newUsername
                    });
                    loadPasswords(); // Reload passwords after update
                } catch (error) {
                    console.error('Error updating document:', error);
                }
            }
        }
    });

    newRow.querySelector('.edit-password').addEventListener('click', async (event) => {
        const docId = event.target.getAttribute('data-doc-id');
        const newPassword = prompt("Enter new password:");
        if (newPassword) {
            const user = auth.currentUser;
            if (user) {
                try {
                    await updateDoc(doc(db, 'Password-manager-3322', user.uid, 'passwords', docId), {
                        password: newPassword
                    });
                    loadPasswords(); // Reload passwords after update
                } catch (error) {
                    console.error('Error updating document:', error);
                }
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
        const userCollection = collection(db, 'Password-manager-3322', user.uid, 'passwords');
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
        document.querySelector('.sidebar-username').textContent = "@" + userData.username;
        document.querySelector('.sidebar-usernames').textContent = "@" + userData.username;
    } else {
        console.log("No such document!");
    }
};

// Redirect to login if not authenticated
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'index.html';
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
            const user = auth.currentUser;
            if (user) {
                try {
                    await addDoc(collection(db, 'Password-manager-3322', user.uid, 'passwords'), {
                        username: username,
                        password: password,
                        link: link
                    });
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
    }).catch(error => {
        console.error('Error signing out:', error);
    });
});

let open = document.getElementById("myBtn");
open.addEventListener("click", function () {
    document.getElementById('sidebar-responsive').classList.remove("hiddens");
});

let close = document.getElementById('close');
close.addEventListener("click", function () {
    document.getElementById('sidebar-responsive').classList.add("hiddens");
});
