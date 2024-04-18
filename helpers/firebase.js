const { initializeApp } = require("firebase/app");
const { getStorage } = require("firebase/storage");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmqN-w5O0-PyntA2qS5v7Q5KPlmN9oWIE",
  authDomain: "taffuwq-courses.firebaseapp.com",
  projectId: "taffuwq-courses",
  storageBucket: "taffuwq-courses.appspot.com",
  messagingSenderId: "373585275033",
  appId: "1:373585275033:web:2d53af0b37fd1657a1b008",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

module.exports = storage;
