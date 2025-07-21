// firebase.config.ts
import * as admin from 'firebase-admin';
import * as fs from 'fs';

const firstApp = admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(fs.readFileSync('firebase-first.json', 'utf-8')),
  ),
  databaseURL: 'https://uahbduasfbasfibasdfyasdf.firebaseio.com',
}, 'firstApp');

const secondApp = admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(fs.readFileSync('firebase-second.json', 'utf-8')),
  ),
  databaseURL: 'https://aosdn854as65sa5s6as.firebaseio.com',
}, 'secondApp');

// Eksport qilamiz
export const firestoreFirst = firstApp.firestore();
export const firestoreSecond = secondApp.firestore();
