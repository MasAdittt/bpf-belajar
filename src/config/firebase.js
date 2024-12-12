// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCW6uiwKmqbtm8zH3dmCoBYI9cmrqE8Bt0",
  authDomain: "bpet-4dfb4.firebaseapp.com",
  databaseURL: "https://bpet-4dfb4-default-rtdb.firebaseio.com",
  projectId: "bpet-4dfb4",
  storageBucket: "bpet-4dfb4.appspot.com",
  messagingSenderId: "668904938187",
  appId: "1:668904938187:web:eead2fedc37bff2908594e"
};

const app = initializeApp(firebaseConfig);
export const firebaseAuthentication = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

export default app;