const functions = require('firebase-functions');

const admin  = require('firebase-admin');
admin.initializeApp()

const express = require("express");
const app = express();


const firebaseConfig = {
    apiKey: "AIzaSyBmuei_huch_jInfEFrO7fQDK6IweEQ4d8",
    authDomain: "social-media-app-a2249.firebaseapp.com",
    databaseURL: "https://social-media-app-a2249.firebaseio.com",
    projectId: "social-media-app-a2249",
    storageBucket: "social-media-app-a2249.appspot.com",
    messagingSenderId: "44583584118",
    appId: "1:44583584118:web:a7657b2641efba40fdfa57",
    measurementId: "G-RVBBYLF0J9"
  };

const firebase = require('firebase')
firebase.initializeApp(firebaseConfig);

app.get('/screams', (req,res)=>{
    admin
      .firestore()
      .collection("screams")
      .orderBy('createdAt', 'desc')
      .get()
      .then(data => {
        let screams = [];
        data.forEach(doc => {
          screams.push({
              screamId: doc.id,
              body: doc.data().body,
              userHandle: doc.data().userHandle,
              createdAt: doc.data().createdAt 
          });
        });
        return res.json(screams);
      })
      .catch(err => console.error(err));
})

app.post('/scream',(req, res)=>{
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };
    admin.firestore()
    .collection('screams')
    .add(newScream)
    .then(doc=>{
        res.json({message: `document ${doc.id} created successfully`})
    })
    .catch(err=>{
        res.status(500).json({error: 'something went wrong'})
        console.error(err);
    })
})
// Signup Route
app.post('/', (req, res)=>{
    const newUser = {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      handle: req.body.email,
    };
})

//TODO  Validate data
firebase.auth().createdAt(newUser.email, newUser.password)
.then(data=>{
  return res.status(201).json(message: `user ${data.user.uid} signed up successfully`);
})




exports.api = functions.https.onRequest(app);