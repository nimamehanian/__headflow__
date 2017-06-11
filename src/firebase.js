import firebase from 'firebase';
import {
  FIREBASE_API_KEY,
  FB_MSG_SEND_ID,
  FB_DOMAIN_NAME
} from '../keys';

firebase.initializeApp({
  apiKey: FIREBASE_API_KEY,
  authDomain: `${FB_DOMAIN_NAME}.firebaseapp.com`,
  databaseURL: `https://${FB_DOMAIN_NAME}.firebaseio.com`,
  messagingSenderId: FB_MSG_SEND_ID,
  storageBucket: `${FB_DOMAIN_NAME}.appspot.com`,
});

export const DB = firebase.database();
export const Auth = firebase.auth();
