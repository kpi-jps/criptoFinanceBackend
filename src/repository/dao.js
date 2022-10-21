const db = require('./db.js');
const models = require('./models');
const bcrypt = require('bcrypt');

const saltRounds = 10; //used by bcrypt

const createUser = async (name, email, passwd) => {
    try {
        await db.sync();
        const hash = bcrypt.hashSync(passwd, saltRounds);
        const user = await models.User.create({
            name: name, 
            email: email,
            hash: hash
        });
       return {userId: user.id, userName: user.name};
        
    } catch (error) {
        throw error;
    }
    
}

const getUser = async (id) => {
    try {
        await db.sync();
        const user = await models.User.findByPk(id);
        return {
            userId: user.id,
            userName: user.name
        };
    } catch (error) {
        throw error;
    }
    
}

const checkUserCredentials = async (email, passwd) => {
    try {
        await db.sync();
        const user = await findUser(email);
        return bcrypt.compareSync(passwd, user.hash)
    } catch (error) {
        throw error;
    }
}

const updateUserName = async (email, name) => {
    try {
        await db.sync();
        await models.User.update({name: name}, {
            where : {
                email : email
            }
        });
    } catch (error) {
        throw error;
    }  
}

const updateUserPasswd = async (email, newPasswd) => {
    try {
        await db.sync();
        const hash = bcrypt.hashSync(newPasswd, saltRounds);
        models.User.update({hash: hash}, {
            where : {
                email : email
            }
        });
        
    } catch (error) {
        throw error;
    }
}


const createCryptoRegistry = async (ticker, quantity, userId) => {
    try {
        await db.sync();
        const cryptoRegistry = await models.CryptoRegistry.create({
            ticker: ticker,
            quantity: quantity,
            userId: userId
        })

        return cryptoRegistry;
    } catch (error) {
        throw error;
    }
}

const findCryptoRegistry = async (id, userId) => {
    try {
        await db.sync();
        const cryptoRegistry = await models.User.findOne({
            where: {
                id:id,
                userId: userId
            }
        });
        return cryptoRegistry;
    } catch (error) {
        throw error;
    }
    
}

const findCryptoRegisters = async (userId) => {
    try {
        await db.sync();
        const cryptoRegisters = await models.User.findAll({
            where: {
                userId: userId
            }
        });
        return cryptoRegisters;
    } catch (error) {
        throw error;
    }
    
}

const updateCryptoRegistry = async (id, userId, quantity) => {
    try {
        await db.sync();
        await models.CryptoRegistry.update(
                {quantity: quantity}, 
                { where: {id: id, userId: userId}}
            );
    } catch (error) {
        throw error;
    }
   
}

const deleteCryptoRegistry = async (id, userId) => {
    try {
        await db.sync();
        await models.CryptoRegistry.destroy({
            where: {
                id: id,
                userId: userId
            }
        });
    } catch (error) {
        throw error;
    }  
}

module.exports = {
    user: {
        createUser, getUser, checkUserCredentials, updateUserName, updateUserPasswd
    },
    cryptoRegistry: {
        createCryptoRegistry, findCryptoRegistry, findCryptoRegisters, 
        updateCryptoRegistry, deleteCryptoRegistry
    }
     
}
//createUser('João Pedro', 'jps.spj@gmail.com', '1234');
//deleteCryptoRegistry(1,1);
//console.log(checkUserCredentials('jps.spj@gmail.com', '1234'));