import firebase from 'firebase';
import {
  FIREBASE_API_KEY,
  FB_MSG_SEND_ID
} from '../keys';

firebase.initializeApp({
  apiKey: FIREBASE_API_KEY,
  authDomain: 'headflow-fde08.firebaseapp.com',
  databaseURL: 'https://headflow-fde08.firebaseio.com',
  messagingSenderId: FB_MSG_SEND_ID,
  storageBucket: 'headflow-fde08.appspot.com',
});

export const DB = firebase.database();
export const Auth = firebase.auth();
