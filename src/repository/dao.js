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
    const user = await models.User.update({name: name}, {
        where : {
            email : email
        }
    });
}

const updateUserPasswd = async (email, newPasswd) => {
    await db.sync();
    bcrypt.hash(newPasswd, saltRounds, (err, hash) => {
        const user = models.User.update({hash: hash}, {
            where : {
                email : email
            }
        });
    });
}

const createCryptoRegistry = async (ticker, value, userId) => {

}
//createUser('João Pedro', 'jps.spj@gmail.com', '1234');
console.log(checkUserCredentials('jps.spj@gmail.com', '1234'));