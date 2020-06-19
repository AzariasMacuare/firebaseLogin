const { Router } = require('express');
const router = Router();
const admin = require('firebase-admin');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');


admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://myfirstfirebase-1.firebaseio.com"
});

const db = admin.database();

router.get('/', (req, res) => {
    res.render('index')
});

router.post('/userNew', (req, res) => {
    const userName = req.body.userName
    const giros = 10;

    bcrypt.hash(req.body.userPassword, giros, (err, hash) => {
        const newUser = {
            userName,
            userPassword: hash
        }
    db.ref('User/' + userName).push(newUser);
    res.redirect('/login');
    })
    // const newUser = {
    //     userName,
    //     userPassword
    // }
    
});

router.post('/userExist', (req, res) => {
            const userName = req.body.userName
            const userPassword = req.body.userPassword
        
            db.ref('User/' + userName).once('value', function(snap) {
                        const existUser = snap.exists();
                        if (existUser) {

                                snap.forEach(function(childSnapshot) {
                                  var childKey = childSnapshot.key;
                                  var childData = childSnapshot.val();
                                  bcrypt.compare(userPassword, childData.userPassword)
                                  .then((result) => {
                                    req.session.result = result
                                  })
                                  .then(function () {

                                  if(req.session.result == true) {
                                        req.session.userName = childData.userName;
                                        req.session.userKey = childKey;
                                        res.render('messageWell', {message: 'Hola ' + childData.userName, userName: childData.userName, userKey: childKey})  
                    
                                  } else {
                                      res.render('message', {message: 'Lo siento su contraseña es incorrecta'})
                                  }
                                })
                            })
                        } else {
                            res.render('message', {message: 'Lo siento este usuario no existe'});
                        } 
                                                                    });
});


router.post('/notes', (req, res) => {
    var nombre = req.body.nombre;
    var apellido = req.body.apellido;
    var age = req.body.age;
    const userName = req.session.userName;
    const userKey = req.session.userKey;
    console.log(req.session.userName, req.session.userKey)
    
    // req.session.userName = userPassword
            if (nombre != undefined) {

                const dbNotes = db.ref('User/' + userName + '/' + userKey + '/' + 'Notes')
                dbNotes.push({name: nombre, lastname: apellido, age: age})
                dbNotes.once('value', (snap) => {
                    const data = snap.val();
                    res.render('notes', {person: data, userName: userName, userKey: userKey});
                })
            } else {

            db.ref('User/' + userName + '/' + userKey + '/' + 'Notes').once('value', (snap) => {
                const data = snap.val();
                res.render('notes', {person: data, userName: userName, userKey: userKey});
            })
            }

});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/delete/:id', (req, res) => {
    const userName = req.session.userName
    const userKey = req.session.userKey
    const key = req.params.id

    console.log(userName, userKey, key);

    db.ref('User/' + userName + '/' + userKey + '/' + 'Notes/' + key).remove();
    const dbNotes = db.ref('User/' + userName + '/' + userKey + '/' + 'Notes')
    dbNotes.once('value', (snap) => {
        const data = snap.val()
        res.render('notes', {person: data, userName: userName, userKey: userKey})
    })
});

router.get('/edit/:id', (req, res) => {
    const userName = req.session.userName
    const userKey = req.session.userKey
    req.session.keid = req.params.id

    const key = req.session.keid
    db.ref('User/' + userName + '/' + userKey + '/' + 'Notes/' + key).once('value', (snap) =>{
        const data = snap.val()
        res.render('edit', {person: data});
    });
});

router.post('/editing', (req, res) => {
    var nombre = req.body.nombre
    var apellido = req.body.apellido
    var age = req.body.age;
    const userName = req.session.userName
    const userKey = req.session.userKey
    const key = req.session.keid

    // Aqui falta

    db.ref('User/' + userName + '/' + userKey + '/' + 'Notes/' + key).set({name: nombre, lastname: apellido, age: age});
    db.ref('User/' + userName + '/' + userKey + '/' + 'Notes').once('value', (snap) =>{
        const data = snap.val()
    res.render('notes', {person: data, userName: userName, userKey, userKey});
})
})

router.get('/closeSession', (req, res) => {
    delete req.session.userKey
    delete req.session.userName
    res.redirect('/login');
})


module.exports = router;