const db = require('./db.js');
const models = require('./models');
const bcrypt = require('bcrypt');

const saltRounds = 10; //used by bcrypt

const createUser = async (name, email, passwd) => {
    await db.sync();
    bcrypt.hash(passwd, saltRounds, (err, hash) => {
        const user = models.User.create({
            name: name, 
            email: email,
            hash: hash
        });
        console.log(user.id);
    });
}

const findUser = async (email) => {
    await db.sync();
    const user = await models.User.findOne({
        where : {
            email : email
        }
    });
   return user;
}

const checkUserCredentials = async (email, passwd) => {
    await db.sync();
    const user = await findUser(email);
    if(user != null) 
        bcrypt.compare(passwd, user.hash, (err, check) => {
            return check;
        })
    else return false;
}

const updateUserName = async (email, name) => {
    await db.sync();
    await models.User.update({name: name}, {
        where : {
            email : email
        }
    });
}

const updateUserPasswd = async (email, newPasswd) => {
    await db.sync();
    bcrypt.hash(newPasswd, saltRounds, (err, hash) => {
        models.User.update({hash: hash}, {
            where : {
                email : email
            }
        });
    });
}

const findCryptoRegistry = async (id, userId) => {
    await db.sync();
    const cryptoRegistry = await models.User.findOne({
        where: {
            id: id,
            userId: userId
        }
    });
   return cryptoRegistry;
}

const findCryptoRegisters = async (userId) => {
    await db.sync();
    const cryptoRegisters = await models.User.findAll({
        where: {
            userId: userId
        }
    });
   return cryptoRegisters;
}

const createCryptoRegistry = async (ticker, value, userId) => {
    await db.sync();
    const cryptoRegistry = await models.CryptoRegistry.create({
        ticker: ticker,
        value: value,
        userId: userId
    })
}


const updateCryptoRegistry = async (ticker, value, userId) => {
    await db.sync();
    await models.CryptoRegistry.update({
        ticker: ticker,
        value: value
    }, { where: {
        userId: userId
    }})
}

const deleteCryptoRegistry = async (id, userId) => {
    await db.sync();
    await models.CryptoRegistry.destroy({
        where: {
            id: id,
            userId: userId
        }
    })
}
//createUser('João Pedro', 'jps.spj@gmail.com', '1234');
deleteCryptoRegistry(1,1);
console.log(checkUserCredentials('jps.spj@gmail.com', '1234'));