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

const db = admin.firestore();

app.get('/screams', (req,res)=>{
    db
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
  db
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

const isEmail = (email)=>{
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(email.match(regEx)) return true;
  else false
}

const isEmpty = (string)=>{
if(string.trim()==='') return true;
else return false
}
// Signup Route
app.post('/signup', (req, res)=>{
    const newUser = {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      handle: req.body.email,
    };

  let errors = {};
  if(isEmpty(newUser.email)){
    errors.email = 'Must not be empty'
  }else if(!isEmail(newUser.email)){
    errors.email = 'Must be a valid email address'
  }
  if(isEmpty(newUser.password)) errors.password = "Must not be empty"
  if(newUser.password !==newUser.confirmPassword) errors.confirmPassword = "Passwords must match"
  if (isEmpty(newUser.password)) errors.password = "Must not be empty";

  if(Object.keys(errors).length>0) return res.status(400).json(errors);
//TODO  Validate data
let token, userId;
db.doc(`/users/${newUser.handle}`)
  .get()
  .then(doc => {
    if (doc.exist) {
      return res.status(400).json({ handle: "this handle is already taken" });
    } else {
      return firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password);
    }
  })
.then((data)=>{
  userId = data.user.uid;
return data.user.getIdToken();
})
.then((idToken)=>{
  token = idToken;
const userCredentials = {
  handle: newUser.handle,
  emai: newUser.email,
  createdAt: new Date().toISOString(),
  userId
};
return db.doc(`/users/${newUser.handle}`).set(userCredentials);
})
.then(()=>{
  return res.status(201).json({token})
})
.catch(err=>{
  console.error(err);
  if(err.code ==="auth/email-already-in-use"){

  }
  res.status(500).json({error: err.code})
})
});
// User Login
app.post('/login', (req, res)=>{
  const user = {
    email: req.body.email,
    password: req.body.password
  };
let errors  = {};
if(isEmpty(user.email)) errors.email = "Must not be empty";
if (isEmpty(user.password)) errors.password = "Must not be empty";

if(Object.keys(errors).length>0) return res.status(400).json(errors);

firebase.auth().signInWithEmailAndPassword(user.email, user.password)
.then(data=>{
  return data.user.getIdToken();
})
.then(token=>{
  return res.json({token});
})
.catch(err=>{
  console.error(err);
  if (err.code ==="auth/wrong-password"){
    return res.status(403).json({general: 'Wrong credentials, please try again'})
  }else
    return res.status(500).json({ error: err.code });
})
})



exports.api = functions.https.onRequest(app);