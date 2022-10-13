const db = require('./db.js');
const models = require('./models');
const bcrypt = require('bcrypt');

const saltRounds = 10; //used by bcrypt

const  createUser = async (name, email, passwd) => {
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

const  findUser = async (email, passwd) => {
    await db.sync();
    const user = await models.User.findOne({
        where : {
            email : email
        }
    });

    if(user != null) 
        bcrypt.compare(passwd, user.hash, (err, check) => {
            if(!check) return null;
            else console.log(user.email);
        })
    else return null;
}

const createCryptoRegistry = async (ticker, value, userId) => {

}
//createUser('João Pedro', 'jps.spj@gmail.com', '1234');
findUser('jps.spj@gmail.com', '1234');