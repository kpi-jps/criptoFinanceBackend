const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bodyparser = require('body-parser');
const cors = require("cors");
const dao = require('./repository/dao.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const port = 5555;
const tokenExpiresTime = 3600; //seconds


const updatePasswdMsg = 'User\'s password update successfully!';
const updateUserNameMsg = 'User\'s name update successfully!';
const updateCryptoRegistryMsg = 'CryptoRegistry\'s update successfully!';
const unauthorizedLoginMsg = 'User not autenticated!'

const app = express();
app.use(cors());

app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());

const tokenGen = (userId) => {
    const privateKey = fs.readFileSync('keys/private-key.key', 'utf-8');
    const token = jwt.sign({userId: userId}, privateKey, {
        algorithm: "RS256",
        expiresIn: tokenExpiresTime
    })
}

const checkToken = (req, res, next) => {
    const token = req.headers["x-access-token"];
    if(token) {
        try {
            const publicKey = fs.readFileSync('keys/public-key.key', 'utf-8');
            jwt.verify(token, publicKey, {algorithm: ["RS256"]}, async (err, decoded) => {
                if(err) {
                    console.log(err);
                    res.status(401).json({msg: unauthorizedLoginMsg});
                }
                const check = await dao.authenticate.isInactiveToken(token, decoded.userId);
                if(!check) res.status(401).json({msg: unauthorizedLoginMsg});
                next();
            });
        } catch (error) {
            res.status(500);
            console.error(error.message);
            console.error(error.stack);
            res.json(error);
            
        }
    }
}

app.post('/user/create', async (req, res) => {
    try {
        const name =  req.body.name;
        const email =  req.body.email;
        const passwd =  req.body.passwd;
        const userInfo =  await dao.user.createUser(name, email, passwd);
        res.json(userInfo);
    } catch (error) {
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
    } 
    
});

app.post('/user/update-name', checkToken, async (req, res) => {
    try {
        const newName =  req.body.name;
        const email =  req.body.email;
        const userInfo =  await dao.user.updateUserName(email, newName);
        res.json({msg: updateUserNameMsg});
    } catch (error) {
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
    } 
});

app.post('/user/update-passwd', checkToken, async (req, res) => {
    try {
        const newPasswd =  req.body.passwd;
        const email =  req.body.email;
        await dao.user.updateUserName(email, newPasswd);
        res.json({msg: updatePasswdMsg});
    } catch (error) {
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
    } 
});

app.post('/user/login', checkToken, async (req, res) => {
    try {
        const email =  req.body.email;
        const passwd =  req.body.passwd;
        const result = await dao.user.checkUserCredentials(email, passwd);
        if(result.check) {
            const token = tokenGen(result.userId)
            res.json({login: check, token: token});
        }
        res.status(401).json({login: check, msg: unauthorizedLoginMsg});
    } catch (error) {
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
    }
});

app.get('/user/:id', checkToken, async (req, res) => {
    try {
        const userInfo = await dao.user.getUser(req.params.id);
        res.json(userInfo);
    } catch (error) {
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
    }
})

app.get('/crypto/search/:ticker', async (req, res) => {
    try {
        const url = `https://data.messari.io/api/v1/assets/${req.params.ticker.toLowerCase()}/metrics`;
        const response = await fetch(url);
        const json = await response.json();
        res.json(json);
    } catch (error) {
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
    }
});

app.post('/crypto/create', checkToken, async (req, res) => {
    try {
        const ticker = req.body.ticker;
        const quantity = req.body.quantity;
        const userId = req.body.userId;
        const cryptoRegistry = await dao.cryptoRegistry.createCryptoRegistry(ticker, quantity, userId);
        res.json(cryptoRegistry);
    } catch (error) {
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
    }
})

app.post('/crypto/update', checkToken, async (req, res) => {
    try {
        const id = req.body.id;
        const userId = req.body.userId;
        await dao.cryptoRegistry.updateCryptoRegistry(id, userId);
        res.json({msg: updateCryptoRegistryMsg});
    } catch (error) {
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
    }
})


app.get('/crypto/delete/:userId/:id', checkToken, async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.params.userId;
        await dao.cryptoRegistry.deleteCryptoRegistry(id, userId);
        res.json({msg: updateCryptoRegistryMsg});
    } catch (error) {
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
    }
})

app.get('/crypto/get/:userId/:id', checkToken, async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.params.userId;
        const cryptoRegistry = await dao.cryptoRegistry.getCryptoRegistry(id, userId);
        res.json(cryptoRegistry);
    } catch (error) {
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
    }
})

app.get('/crypto/getAll/:userId', checkToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const cryptoRegisters = await dao.cryptoRegistry.getCryptoRegisters(userId);
        res.json(cryptoRegisters);
    } catch (error) {
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
    }
})


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});