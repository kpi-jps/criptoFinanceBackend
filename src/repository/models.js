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
    },
    hash: {
        type: DataTypes.STRING,
        allownull: false,
    }
})

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
    value: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
})

//Relationships
User.hasMany(CryptoRegistry, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
});
CryptoRegistry.belongsTo(User, {
    foreignKey: 'userId'
});

module.exports = {User, CryptoRegistry};