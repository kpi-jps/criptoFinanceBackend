const express = require('express');
const bodyparser = require('body-parser');
const cors = require("cors");
const dao = require('./repository/dao.js');
const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));
const port = 5555;


const updatePasswdMsg = 'User password update successfully!'
const updateUserNameMsg = 'User name update successfully!'

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

app.post('/user/update-name', async (req, res, next) => {
    try {
        const newName =  req.body.name;
        const email =  req.body.email;
        const userInfo =  await dao.user.updateUserName(email, newName);
        res.json({msg: updateUserNameMsg});
    } catch (error) {
        console.error(error.message);
        next(error);
    } 
});

app.post('/user/update-passwd', async (req, res, next) => {
    try {
        const newPasswd =  req.body.passwd;
        const email =  req.body.email;
        await dao.user.updateUserName(email, newPasswd);
        res.json({msg: updatePasswdMsg});
    } catch (error) {
        console.error(error.message);
        next(error);
    } 
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

app.get('/user/:id', async (req, res, next) => {
    try {
        const userInfo = await dao.user.getUser(req.params.id);
        res.json(userInfo);
    } catch (error) {
        console.error(error.message);
        next(error);
    }
})

app.get('/crypto/search/:ticker', async (req, res, next) => {
    try {
        const url = `https://data.messari.io/api/v1/assets/${req.params.ticker.toLowerCase()}/metrics`;
        const response = await fetch(url);
        const json = await response.json();
        res.json(json);
    } catch (error) {
        console.error(error.message);
        next(error);
    }
    

})


console.log(`Server running on port ${port}`);
app.listen(port);