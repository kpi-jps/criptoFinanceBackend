const fs = require('fs');
const Sequelize = require('sequelize');
const databaseURL = 'repository/database/database.sqlite';

const sequelize = () => {
    if (!fs.existsSync(databaseURL)) {
        console.log('Creating database');
        const fileDescriptor = fs.openSync(databaseURL,'w');
        fs.closeSync(fileDescriptor);
    }
    return new Sequelize({
        dialect: 'sqlite',
        storage: databaseURL
    });
}

const testConnection = async () => {
    try {
        console.log('Testing connection!');
        await db.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}

const db = sequelize();

testConnection();
module.exports = db;

