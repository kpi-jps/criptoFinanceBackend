const {DataTypes} = require('sequelize');
const sequelize = require('./db.js');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allownull: false,
    },
    email: {
        type: DataTypes.STRING,
        allownull: false,
        unique: true
    },
    hash: {
        type: DataTypes.STRING,
        allownull: false,
    }
});

const CryptoRegistry = sequelize.define('CryptoRegistry', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    ticker: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
});

/*
const InactiveToken = sequelize.define('InactiveToken', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    time: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
});
*/

//Relationships
User.hasMany(CryptoRegistry, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
});
CryptoRegistry.belongsTo(User, {
    foreignKey: 'userId'
});

/*
User.hasMany(InactiveToken, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
});

InactiveToken.belongsTo(User, {
    foreignKey: 'userId'
});
*/


module.exports = {User, CryptoRegistry /*, InactiveToken*/};