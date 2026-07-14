"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const PORT = 8000;
app.get("/", (_req, res) => {
    res.send("Hello");
});
const uri = process.env.MONGO_DB_URI;
const client = uri
    ? new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
    })
    : null;
async function run() {
    if (!client) {
        console.warn("MONGO_DB_URI is missing. Server will run without MongoDB.");
        return;
    }
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    }
    catch (error) {
        console.error("MongoDB connection failed:", error);
    }
}
run().catch(console.dir);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map