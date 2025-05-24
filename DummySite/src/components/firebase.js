import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBggdLJTp4pPl0jguKzNhO5ZlyUL0FiHIg",
  authDomain: "opt-for-demo.firebaseapp.com",
  projectId: "opt-for-demo",
  storageBucket: "opt-for-demo.firebasestorage.app",
  messagingSenderId: "837955815862",
  appId: "1:837955815862:web:8daab036a4e906cef71917"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export the auth instance
export { auth };