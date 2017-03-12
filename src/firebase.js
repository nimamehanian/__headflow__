import firebase from 'firebase';

firebase.initializeApp({
  apiKey: 'AIzaSyB601HaResDGLGvZDrXd-OKcvDeRfjQrNY',
  authDomain: 'headflow-fde08.firebaseapp.com',
  databaseURL: 'https://headflow-fde08.firebaseio.com',
  messagingSenderId: '385618110980',
  storageBucket: 'headflow-fde08.appspot.com',
});

const DB = firebase.database();

export default DB;
