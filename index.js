
        // Import the functions you need from the SDKs you need
        import { initializeApp } from "firebase/app";
        // import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-analytics.js";
        import { getAuth , onAuthStateChanged , connectAuthEmulator, signInWithEmailAndPassword } from "firebase/auth";
        import {firestore} from 'firebase/firestore'

        const firebaseConfig = {
          apiKey: "AIzaSyBHmpHyQd_il3SMJwJVZbzAsgokTNZfzKg",
          authDomain: "password-manager-3322.firebaseapp.com",
          projectId: "password-manager-3322",
          storageBucket: "password-manager-3322.appspot.com",
          messagingSenderId: "141147368358",
          appId: "1:141147368358:web:e0642e9b5fa5c0c6107d67",
          measurementId: "G-DYJ1RYK574"
        };
      
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        // const analytics = getAnalytics(app);
        const auth = getAuth(app);
        connectAuthEmulator(auth, "http://localhost:9099");
        const loginEmaiPassword = async ()=>{
          loginEmail = document.getElementById('loginemail').value
          loginPassword = document.getElementById('loginpassword').value

          const userCradintials = await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
          console.log(userCradintials.user)
          
        }
        let login = document.getElementById('loginbutton')
        console.log('hellow')
        login.addEventListener("click" , loginEmaiPassword)
        onAuthStateChanged(auth, (user) => {
            if (user != null) {

            console.log("logged in")
            // ...
        } else {

            console.log("not logged in")
              // ...
            }
          });