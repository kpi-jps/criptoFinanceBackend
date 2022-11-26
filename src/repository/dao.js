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

const findUser = async (email) => {
    try {
        await db.sync();
        const user = await models.User.findOne({
            where: {
                email: email
            }
        });
        return user;
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
            userName: user.name,
            userEmail: user.email
        };
    } catch (error) {
        throw error;
    }
    
}

const checkUserCredentials = async (email, passwd) => {
    try {
        await db.sync();
        const user = await models.User.findOne({
            where: {
                email: email
            }
        });
        const check = bcrypt.compareSync(passwd, user.hash);
        if(check) {
            return {
                check: check,
                userId: user.id,
                userName: user.name,
                userEmail: user.email
            }
        }
        return {
            check: check,
            userId: null,
            userName: null
        }
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

const getCryptoRegistry = async (id, userId) => {
    try {
        await db.sync();
        const cryptoRegistry = await models.CryptoRegistry.findOne({
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

const getCryptoRegisters = async (userId) => {
    try {
        await db.sync();
        const cryptoRegisters = await models.CryptoRegistry.findAll({
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
/*
const saveToken = async (token, userId) => {
    try {
        await db.sync();
        await models.InactiveToken.create({
            token: token, 
            time: new Date().getTime(),
            userId: userId
        });       
    } catch (error) {
        throw error;
    }
}

const isInactiveToken = async (token, userId) => {
    try {
        await db.sync();
        const result = await models.InactiveToken.findOne({
            where: {
                token:token,
                userId: userId
            }
        });
        if (result == null) return false
        return true
    } catch (error) {
        throw error;
    }
}
*/
module.exports = {
    user: {
        createUser, getUser, findUser, checkUserCredentials, updateUserName, updateUserPasswd
    },
    cryptoRegistry: {
        createCryptoRegistry, getCryptoRegistry, getCryptoRegisters, 
        updateCryptoRegistry, deleteCryptoRegistry
    },

    /*
    authenticate: {
        isInactiveToken, saveToken
    }
    */
     
}
//createUser('João Pedro', 'jps@gmail.com', '1234');
//deleteCryptoRegistry(1,1);
//console.log(checkUserCredentials('jps.spj@gmail.com', '1234'));