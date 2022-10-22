const express = require('express');
const jwt = require('jsonwebtoken');
const i18n = require('i18n');
const fs = require('fs');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser')
const cors = require("cors");
const dao = require('./repository/dao.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


//Constants
const port = 5555;
const tokenExpiresTime = 120; //seconds
const publicKey = fs.readFileSync('keys/public-key.key', 'utf-8');
const privateKey = fs.readFileSync('keys/private-key.key', 'utf-8');
const validator = require('./utils/validator');


//Configurations
i18n.configure({
    defaultLocale: 'pt-BR',
    locales: ['pt-BR', 'pt', 'en'],
    directory: './locales',
    extension: '.json',
    cookie: 'lang',
  
  });

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(i18n.init)
app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());

app.use((req, res, next) => {
    console.log(req.acceptsLanguages());
    let lang = req.acceptsLanguages()[0];
    console.log(lang);
    res.setLocale(lang);
    req.setLocale(lang);
    next();
  });

const tokenGen = (userId) => {
    const token = jwt.sign({userId: userId}, privateKey, {
        algorithm: "RS256",
        expiresIn: tokenExpiresTime
    })
    return token;
}
/*
const checkToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        console.log(token);
        if(token == undefined || token == null) {
            res.status(401).json({msg: '1: '+unauthorizedLoginMsg});
            return;
        }
        const decoded = jwt.verify(token, publicKey, {algorithm: ["RS256"]});
        const check = await dao.authenticate.isInactiveToken(token, decoded.userId);
        if(check) {
            res.status(401).json({msg: '1: '+unauthorizedLoginMsg});
            return;
        }
        next();
    } catch (error) {
       
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
        
        
    }
}
*/

const checkToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        console.log(token);
        const decoded = jwt.verify(token, publicKey, {algorithm: ["RS256"]});
        next();
    } catch (error) {
        res.status(401).json({msg: res.__("unauthorizedLoginMsg")});
    }
}

app.post('/user/create', async (req, res) => {
    try {
        const name =  req.body.name;
        const email =  req.body.email;
        const passwd =  req.body.passwd;
        validator.emailValidator(email, res.__("invalidEmailMsg"));
        const userInfo =  await dao.user.createUser(name, email, passwd);
        res.json(userInfo);
    } catch (error) {
        if(error instanceof validator.InvalidEmailError) {
            res.status(500).json({msg: error.message});
            return;
        }
        if(error instanceof validator.InvalidPasswdError) {
            res.status(500).json({msg: error.message});
            return;
        }
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
    } 
    
});

app.post('/user/update-name', checkToken, async (req, res) => {
    try {
        const newName =  req.body.newName;
        const email =  req.body.email;
        validator.emailValidator(email, res.__("invalidEmailMsg"));
        const userInfo =  await dao.user.updateUserName(email, newName);
        res.json({msg: res.__("updateUserNameMsg")});
    } catch (error) {
        if(error instanceof validator.InvalidEmailError) {
            res.status(500).json({msg: error.message});
            return;
        }
        if(error instanceof validator.InvalidPasswdError) {
            res.status(500).json({msg: error.message});
            return;
        }
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
    } 
});

app.post('/user/update-passwd', checkToken, async (req, res) => {
    try {
        const newPasswd =  req.body.newPasswd;
        const email =  req.body.email;
        await dao.user.updateUserPasswd(email, newPasswd);
        res.json({msg: res.__("updatePasswdMsg")});
    } catch (error) {
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
    } 
});

app.post('/user/login', async (req, res) => {
    try {
        const email =  req.body.email;
        const passwd =  req.body.passwd;
        validator.emailValidator(email, res.__("invalidEmailMsg"));
        const result = await dao.user.checkUserCredentials(email, passwd);
        if(result.check) {
            const token = tokenGen(result.userId)
            res.cookie("token", token)
            res.json({login: result.check, msg: res.__("loginMsg"), userId: result.userId});
        } else {
            res.status(401).json({login: result.check, msg: res.__("unauthorizedLoginMsg")});
        }
        
    } catch (error) {
        if(error instanceof validator.InvalidEmailError) {
            res.status(500).json({msg: error.message});
            return;
        }
        if(error instanceof validator.InvalidPasswdError) {
            res.status(500).json({msg: error.message});
            return;
        }
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
    }
});

/*
app.get('/user/logout', async (req, res) => {
    try {
        const token = req.cookies.token;
        const decoded = jwt.verify(token, publicKey, {algorithm: ["RS256"]});
        await dao.authenticate.saveToken(token, decoded.userId);
        res.json({msg: logoutMsg});
    } catch (error) {
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
    }
})
*/

app.get('/user/logout', (req, res) => {
    try {
        //const token = req.cookies.token;
        //const decoded = jwt.verify(token, publicKey, {algorithm: ["RS256"]});
        const newToken = jwt.sign({}, privateKey, {
            algorithm: "RS256",
            expiresIn: 1
        })
        res.cookie("token", newToken);
        res.json({msg: res.__("logoutMsg")});
    } catch (error) {
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
    }
})

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
        const quantity = req.body.quantity;
        await dao.cryptoRegistry.updateCryptoRegistry(id, userId, quantity);
        res.json({msg: res.__("updateCryptoRegistryMsg")});
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
        res.json({msg: res.__("deleteCryptoRegistryMsg")});
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