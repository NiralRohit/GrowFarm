// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyBfRVN3vW6iHDIzZlEga6IIO9OMe5ng2xQ",
  authDomain: "growfarm-7f3cb.firebaseapp.com",
  projectId: "growfarm-7f3cb",
  storageBucket: "growfarm-7f3cb.appspot.com",
  messagingSenderId: "676183267260",
  appId: "1:676183267260:web:6b2b26c50ffbba9258bdb9",
  measurementId: "G-037DYM8V9C"
};

// const firebaseConfig = {
//   apiKey: "AIzaSyCFBiknU-qze_v_BX0Q3Xp5cM9BwVWhQm8",
//   authDomain: "growfarm2forgotpin.firebaseapp.com",
//   projectId: "growfarm2forgotpin",
//   storageBucket: "growfarm2forgotpin.appspot.com",
//   messagingSenderId: "713009273496",
//   appId: "1:713009273496:web:02b1f15da0894a380d4eed",
//   measurementId: "G-KF2K303PWP"
// };



// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;