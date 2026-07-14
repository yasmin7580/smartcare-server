import ObjectId = require("mongodb");
import mongodb = require("mongodb");

require("dotenv").config();
const cors = require("cors")
// import type { Request, Response } from "express";

const express = require("express") as typeof import("express");
const { MongoClient, ServerApiVersion } = require("mongodb") as typeof import("mongodb");


const app = express();
app.use(express.json())
app.use(cors())
const PORT = 8000

app.get("/", (_req, res) => {
    console.log
    res.send(process.env.MONGO_DB_URI);
});

const uri = process.env.MONGODB_URI;

const client = uri
    ? new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
    })
    : null;



// const admin = require("firebase-admin") as typeof import("firebase-admin");

// const serviceAccount = require("./serviceAccountKey.json") as import("firebase-admin").ServiceAccount;
// admin.initializeApp({

//     credential: admin.credential.cert(serviceAccount)
// });


async function run() {
    if (!client) {
        console.warn("MONGO_DB_URI is missing. Server will run without MongoDB.");
        return;
    }

    try {
        await client.connect();
        const db = client.db('SmartCare')
        const usersCollection = db.collection('Users')
        const clinicsCollection = db.collection('Clinics')
        const doctorsCollection = db.collection('Doctors')

        // user api

        app.get("/users", async (req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result)

        })

        app.patch("/user", async (req, res) => {
            const { id, status } = req.body
            const query = { _id: new mongodb.ObjectId(id) }
            const update = {
                $set: {
                    isBlock: status
                }

            }
            const result = await usersCollection.updateOne(query, update)
            res.send(result)

        })

        app.post("/user", async (req, res) => {
            const data = req.body
            const result = await usersCollection.insertOne(data)
            res.send(result)
        })


        // CLINICS API


        // make an api who returns clinic's data according to userEmail

        app.get("/clinic", async (req, res) => {
            const userEmail = req.query
            const result = await clinicsCollection.findOne(userEmail)
            res.send(result)
        })
        app.get("/clinics", async (req, res) => {
            const { status, name } = req.query as Record<string, string>
            // type Query = {
            //     status?: string;
            //     name?:string
            // }
            let query: any = {} // 
            if (status) {
                query.status = status
            }
            if (name) {
                query = { $regex: name, $options: "i" }
            }
            const result = await clinicsCollection.find(query).toArray()
            res.send(result)
        })


        //
        app.patch("/clinic", async (req, res) => {

            const { id, status } = req.body
            const update = {
                $set: { status }
            }
            const query = { _id: new mongodb.ObjectId(id) }
            const result = await clinicsCollection.updateOne(query, update)
            res.send(result)

        })

        app.post("/clinics", async (req, res) => {

            const data = req.body
            const result = await clinicsCollection.insertOne(data)
            res.send(result)

        })
        // SPECIAL API
        app.get("/role", async (req, res) => { // we are searching for role. if we(client side) had role. no need to search for role
            const email = req.query
            const options = {
                projection: { _id: 0, role: 1 }
            }
            const result = await usersCollection.findOne(email, options)
            res.send(result)
        })






        // Doctors api 

        app.get("/doctors", async (req, res) => {
            const { id } = req.query as Record<string, string>
            const query = { clinicId: id }
            const result = await doctorsCollection.find(query).toArray()
            res.send(result)
        })

        app.post("/doctor", async (req, res) => {
            const data = req.body
            const result = await doctorsCollection.insertOne(data)
            res.send(result)


        })

        app.patch("/doctor", async (req, res) => {

            const { id, formData } = req.body
            const query = { _id: new mongodb.ObjectId(id) }
            const update = {
                $set: formData

            }

            const result = await doctorsCollection.updateOne(query, update)
            res.send(result)

        })

        app.delete("/doctor/:id", async (req, res) => {
            const { id } = req.params
            const query = { _id: new mongodb.ObjectId(id) }
            const result = await doctorsCollection.deleteOne(query)
            res.send(result)


        })


































        console.log("Connected to MongoDB");
    }
    catch (error) {
        console.error("MongoDB connection failed:", error);
    }
}
run().catch(console.dir)

























app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
