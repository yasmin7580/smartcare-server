"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
exports.getDatabase = getDatabase;
exports.closeDatabaseConnection = closeDatabaseConnection;
const mongodb_1 = require("mongodb");
const env_1 = require("./env");
let client = null;
let database = null;
async function connectToDatabase() {
    if (database) {
        return database;
    }
    client = new mongodb_1.MongoClient(env_1.env.mongodbUri);
    await client.connect();
    database = client.db(env_1.env.mongodbDatabase);
    console.log(`Connected to MongoDB database: ${env_1.env.mongodbDatabase}`);
    return database;
}
function getDatabase() {
    if (!database) {
        throw new Error("Database is not connected. Call connectToDatabase() first.");
    }
    return database;
}
async function closeDatabaseConnection() {
    if (client) {
        await client.close();
        client = null;
        database = null;
    }
}
//# sourceMappingURL=database.js.map