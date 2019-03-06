/// ----
/// Libs
/// ----

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

/// -----------
/// Controllers
/// -----------

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const list = require('./controllers/list');
const item = require('./controllers/item');

/// --------
/// Database
/// --------

const PORT = 3000;
const DATABASE_URL = '';

// Connect to database
const db = knex({
    client: 'mysql',
    connection: {
    //   connectionString : DATABASE_URL,
        host: '127.0.0.1',
        user:'checklist_user',
        password:'checklist',
        database: 'check_list'
    }
});

// db.select()
//     .from('list')
//     .where('user_id', 7)
//     .then(lists => {
//         console.log(lists);
//     })

/// ------------
/// App creation
/// ------------

// Create express App
const app = express();
// Makes sure transfered json data are correctly parsed
app.use(bodyParser.json());
app.use(cors());

/// ------------
/// API Requests
/// ------------

app.get('/', (req, res) => {
    res.send('It is working !');
})
// Sign-in POST request
app.post('/signin', (req, res) => {
    signin.handleSignin(req, res, db, bcrypt)
});
/// Register POST request
app.post('/register', 
    // Alternate call, equivalent to : 
    // register.handleRegister(db, bcrypt)(req, res)
    register.handleRegister(db, bcrypt)
);
/// List add POST request
app.post('/list/add', (req, res) => {
    list.handleListAdd(req, res, db)
});
/// List update PUT request
app.put('/list/update', (req, res) => {
    list.handleListUpdate(req, res, db)
});
/// List GET request
app.get('/list/:id', (req, res) => {
    list.handleListGet(req, res, db)
})
/// List DELETE request
app.delete('/list/:id', (req, res) => {
    list.handleListDelete(req, res, db)
})
/// Lists GET request
app.get('/lists/:user_id', (req, res) => {
    list.handleListsGet(req, res, db)
})
/// Add item POST request
app.post('/item/add/', (req, res) => {
    item.handleItemAdd(req, res, db)
});
/// Item list PUT request
app.put('/item/list/', (req, res) => {
    item.handleItemList(req, res, db)
});
/// Link item POST request
app.post('/item/link/', (req, res) => {
    item.handleItemLink(req, res, db)
});
/// Item DELETE request
app.delete('/item/:id', (req, res) => {
    item.handleItemDelete(req, res, db)
})
/// Unlink item POST request
app.post('/item/unlink/', (req, res) => {
    item.handleItemUnlink(req, res, db)
})
/// User Items GET request
app.get('/items/user/:user_id', (req, res) => {
    item.handleUserItems(req, res, db)
})
/// List Items GET request
app.get('/items/list/:list_id', (req, res) => {
    item.handleListItems(req, res, db)
})

/// -------------------------------------
/// Makes the App listen to the port 3000
/// -------------------------------------

app.listen(PORT, () => {
    console.log('App is running on port ' + PORT);
});