const express = require('express');
const bodyparser = require('body-parser');
const cors = require("cors");
const dao = require('./repository/dao.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const port = 5555;


const updatePasswdMsg = 'User\'s password update successfully!';
//const updatePasswdErrorMsg = 'Error during user\'s password update!';
const updateUserNameMsg = 'User\'s name update successfully!';
//const updateNamedErrorMsg = 'Error during user\'s name update!'
const updateCryptoRegistryMsg = 'CryptoRegistry\'s update successfully!';
//const updateCryptoRegistryErroMsg = 'Error during CryptoRegistry\'s update!';

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
        res.json(error);
        //next(error);
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
});

app.post('/crypto/create', async (req, res, next) => {
    try {
        const ticker = req.body.ticker;
        const quantity = req.body.quantity;
        const userId = req.body.userId;
        const cryptoRegistry = await dao.cryptoRegistry.createCryptoRegistry(ticker, quantity, userId);
        res.json(cryptoRegistry);
    } catch (error) {
        console.error(error.message);
        next(error);
    }
})

app.post('/crypto/update', async (req, res, next) => {
    try {
        const id = req.body.id;
        const userId = req.body.userId;
        await dao.cryptoRegistry.updateCryptoRegistry(id, userId);
        res.json({msg: updateCryptoRegistryMsg});
    } catch (error) {
        console.error(error.message);
        next(error);
    }
})


app.get('/crypto/delete/:userId/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const userId = req.params.userId;
        await dao.cryptoRegistry.deleteCryptoRegistry(id, userId);
        res.json({msg: updateCryptoRegistryMsg});
    } catch (error) {
        console.error(error.message);
        next(error);
    }
})

app.get('/crypto/get/:userId/:id', async (req, res, next) => {
    try {
        
    } catch (error) {
        console.error(error.message);
        next(error);
    }
})

app.get('/crypto/getAll/:userId', async (req, res, next) => {
    try {
        
    } catch (error) {
        console.error(error.message);
        next(error);
    }
})


console.log(`Server running on port ${port}`);
app.listen(port);