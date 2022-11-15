require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const i18n = require('i18n');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser')
const cors = require("cors");
const dao = require('./repository/dao.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));



//Constants
const port = process.env.PORT;
const tokenExpiresTime = parseInt(process.env.TOKEN_EXPERIS_TIME);
const publicKey = process.env.PUBLIC_KEY;
const privateKey = process.env.PRIVATE_KEY
const validator = require('./utils/validator');


//Configurations
i18n.configure({
    defaultLocale: 'pt-BR',
    locales: ['pt-BR', 'pt', 'en'],
    directory: './locales',
    extension: '.json',
    cookie: 'lang',
  
  });

//Cors configurations for local tests
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const app = express();
app.use(cors(corsOptions));
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

const checkToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        //console.log(token);
        const decoded = jwt.verify(token, publicKey, {algorithm: ["RS256"]});
        req.userId = decoded.userId;
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
        const user = await dao.user.findUser(email);
        if(user != null) validator.userValidator(true, res.__("userAlreadExistMsg"))
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
        if(error instanceof validator.UserAlreadyExistError) {
            res.status(500).json({msg: error.message});
            return;
        }
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
    } 
    
});

app.put('/user/update-name', checkToken, async (req, res) => {
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

app.put('/user/update-passwd', checkToken, async (req, res) => {
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
        const user = await dao.user.findUser(email);
        if(user == null) validator.userValidator(false, res.__("userNotExistMsg"))
        const result = await dao.user.checkUserCredentials(email, passwd);
        if(result.check) {
            const token = tokenGen(result.userId)
            //setting cookie to store token only for local tests (not secure)!!!
            res.cookie("token", token, {sameSite: 'None', secure: true});  
            res.json({login: result.check, msg: res.__("loginMsg"), userEmail: result.userEmail, userId: result.userId, userName: result.userName});
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
        if(error instanceof validator.UserNotExistError) {
            res.status(500).json({msg: error.message});
            return;
        }
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
    }
});

app.get('/user/logout', (req, res) => {
    try {
        const newToken = jwt.sign({}, privateKey, {
            algorithm: "RS256",
            expiresIn: 1
        });
        //setting cookie to store token only for local tests (not secure)!!!
        res.cookie("token", newToken, {sameSite: 'None', secure: true});
        res.json({msg: res.__("logoutMsg")});
    } catch (error) {
        res.status(500);
        console.error(error.message);
        console.error(error.stack);
        res.json(error);
    }
})

app.post('/user', checkToken, async (req, res) => {
    try {
        const userInfo = await dao.user.getUser(req.userId);
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

app.put('/crypto/update', checkToken, async (req, res) => {
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


app.delete('/crypto/delete', checkToken, async (req, res) => {
    try {
        const id = req.body.id;
        const userId = req.body.userId;
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