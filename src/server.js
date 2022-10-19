const express = require('express');
const bodyparser = require("body-parser");
const cors = require("cors");
const dao = require('./repository/dao.js');
const port = 5555;

const app = express();
app.use(cors());

app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());

app.post('/user/create', async (req, res, next) => {
    try {
        const name =  req.body.name;
        const email =  req.body.email;
        const passwd =  req.body.passwd;
        const userInfo =  await dao.user.createUser(name, email, passwd);
        res.json(userInfo);
    } catch (error) {
        console.error(error.message);
        next(error);
    } 
    
});

app.post('/user/update-name', (req, res) => {

});

app.post('/user/update-passwd', (req, res) => {

});

app.post('/user/login', async (req, res, next) => {
    try {
        const email =  req.body.email;
        const passwd =  req.body.passwd;
        const check = await dao.user.checkUserCredentials(email, passwd);
        res.json({login: check});
    } catch (error) {
        console.error(error.message);
        next(error);
    }
});

app.get('/user/:id', (req, res) => {

})

app.post('/crypto/update-name', (req, res) => {

})


console.log(`Server running on port ${port}`);
app.listen(port);