import ObjectId = require("mongodb");
import mongodb = require("mongodb");
import type { NextFunction, Request, Response } from "express";
const dns = require('dns');

require("dotenv").config();

const cors = require("cors")
// import type { Request, Response } from "express";

dns.setServers(["8.8.8.8", "1.1.1.1"])


const express = require("express") as typeof import("express");
const { MongoClient, ServerApiVersion } = require("mongodb") as typeof import("mongodb");


const app = express();
app.use(express.json())
app.use(cors())
const PORT = 8000

app.get("/", (_req, res) => {
    console.log
    res.send('hello');
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



// const admin = require("firebase-admin");

// const firebaseKey = process.env.FIREBASE_KEY;

// if (!firebaseKey) {
//     throw new Error("FIREBASE_KEY is required to initialize Firebase Admin.");
// }

// let serviceAccount: import("firebase-admin").ServiceAccount;
// try {
//     serviceAccount = JSON.parse(Buffer.from(firebaseKey, "base64").toString("utf8"));
// }
// catch {
//     throw new Error("FIREBASE_KEY must be a base64-encoded UTF-8 Firebase service-account JSON value.");
// }

// if (!admin?.apps?.length) {
//     admin.initializeApp({
//         credential: admin?.credential?.cert(serviceAccount)
//     });
// }

// const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
//     const authHeader = req.headers.authorization
//     const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader

//     if (!token) {
//         return res.status(401).send({ message: "Unauthorized access" })
//     }

//     try {
//         const decoded = await admin.auth().verifyIdToken(token)
//             ; (req as any).decoded = decoded
//         next()
//     }
//     catch (error) {
//         res.status(403).send({ message: "Forbidden access" })
//     }
// }


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
        const appointmentCollection = db.collection('Appointments')

        // user api

        app.get("/user", async (req, res) => {
            const email = req.query
            const result = await usersCollection.findOne(email)
            res.send(result)
        })
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
        app.patch("/userUpdate", async (req, res) => {
            const email = req.query
            const data = req.body
            const query = email
            const update = {
                $set: data
            }
            // console.log(data)
            // console.log(data)
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
            type Query = {
                userEmail?: string
            }
            const { userEmail } = req.query as Record<string, string>
            const query: Query = {}
            if (userEmail) {
                query.userEmail = userEmail
            }

            const result = await clinicsCollection.findOne(query)
            res.send(result)
        })

        app.get("/clinic/:id", async (req, res) => {
            const { id } = req.params
            const query = { _id: new mongodb.ObjectId(id) }
            const result = await clinicsCollection.findOne(query)
            res.send(result)
        })
        app.get("/clinics", async (req, res) => {
            // console.log("i trigger")
            const { status, name } = req.query as Record<string, string>;

            const query: Record<string, any> = {};

            if (status) {
                query.status = status;
            }

            if (name) {
                query.name = { $regex: name, $options: "i" };
            }
            // console.log(query)

            const result = await clinicsCollection.find(query).toArray();
            res.send(result);
        });

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
        app.get("/role",  async (req, res) => { // we are searching for role. if we(client side) had role. no need to search for role
            const email = req.query
            const options = {
                projection: { _id: 0, role: 1 }
            }
            const result = await usersCollection.findOne(email, options)
            res.send(result)
        })

        app.get("/adminHome", async (req, res) => {
            const totalUsers = await usersCollection.countDocuments()
            const totalClinics = await clinicsCollection.countDocuments()
            const totalDoctors = await doctorsCollection.countDocuments()
            const totalAppointments = await appointmentCollection.countDocuments()

            const totalNormalUsers = await usersCollection.countDocuments({ role: "user" })
            const totalAuthorities = await usersCollection.countDocuments({ role: "authority" })
            const totalAdmins = await usersCollection.countDocuments({ role: "admin" })

            const verifiedClinics = await clinicsCollection.countDocuments({ status: "VERIFIED" })
            const pendingClinics = await clinicsCollection.countDocuments({ status: "pending" })

            const scheduledAppointments = await appointmentCollection.countDocuments({ status: "scheduled" })
            const cancelAppointments = await appointmentCollection.countDocuments({ status: "cancel" })

            const recentAppointments = await appointmentCollection.find().sort({ appointmentDate: 1 }).limit(5).toArray()
            const pendingClinicsData = await clinicsCollection.find({ status: "pending" }).toArray()

            const result = {
                totalUsers,
                totalClinics,
                totalDoctors,
                totalAppointments,
                totalNormalUsers,
                totalAuthorities,
                totalAdmins,
                verifiedClinics,
                pendingClinics,
                scheduledAppointments,
                cancelAppointments,
                recentAppointments,
                pendingClinicsData
            }
            res.send(result)
        })

        app.get("/homeData", async (req, res) => {
            const totalUsers = await usersCollection.countDocuments()
            const totalClinics = await clinicsCollection.countDocuments({ status: "VERIFIED" })
            const totalDoctors = await doctorsCollection.countDocuments()
            const totalAppointments = await appointmentCollection.countDocuments()

            const scheduledAppointments = await appointmentCollection.countDocuments({ status: "scheduled" })
            const cancelAppointments = await appointmentCollection.countDocuments({ status: "cancel" })
            const completeAppointments = await appointmentCollection.countDocuments({ status: "complete" })

            const clinics = await clinicsCollection.find({ status: "VERIFIED" }).limit(3).toArray()
            const doctors = await doctorsCollection.find().limit(3).toArray()

            const result = {
                totalUsers,
                totalClinics,
                totalDoctors,
                totalAppointments,
                scheduledAppointments,
                cancelAppointments,
                completeAppointments,
                clinics,
                doctors
            }
            res.send(result)
        })

        app.get("/authorityHome", async (req, res) => {
            console.log("calling")
            const { email } = req.query as Record<string, string>
            const clinic = await clinicsCollection.findOne({ userEmail: email })
            // console.log(clinic)

            if (!clinic) {
                res.send({
                    clinic: null,
                    totalDoctors: 0,
                    totalAppointments: 0,
                    scheduledAppointments: 0,
                    completeAppointments: 0,
                    cancelAppointments: 0,
                    doctors: [],
                    recentAppointments: []
                })
                return
            }

            const clinicId = clinic._id.toString()
            const totalDoctors = await doctorsCollection.countDocuments({ clinicId })
            const totalAppointments = await appointmentCollection.countDocuments({ clinicId })
            const scheduledAppointments = await appointmentCollection.countDocuments({ clinicId, status: "scheduled" })
            const completeAppointments = await appointmentCollection.countDocuments({ clinicId, status: "complete" })
            const cancelAppointments = await appointmentCollection.countDocuments({ clinicId, status: "cancel" })

            const doctors = await doctorsCollection.find({ clinicId }).limit(5).toArray()
            const recentAppointments = await appointmentCollection.find({ clinicId }).sort({ appointmentDate: 1 }).limit(5).toArray()

            const result = {
                clinic,
                totalDoctors,
                totalAppointments,
                scheduledAppointments,
                completeAppointments,
                cancelAppointments,
                doctors,
                recentAppointments
            }
            res.send(result)
        })






        // Doctors api 

        app.get("/doctor/:id", async (req, res) => {
            const { id } = req.params
            let query = { _id: new mongodb.ObjectId(id) }
            const result = await doctorsCollection.findOne(query)
            res.send(result)
        })

        app.get("/doctors", async (req, res) => {
            const { id } = req.query as Record<string, string>
            let query = {}
            if (id) {
                query = { clinicId: id }
            }
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

        // appointment apis
        app.get('/appointment', async (req, res) => {
            const { userEmail, status, clinicId } = req.query as Record<string, string>
            type Query = {
                userEmail?: string;
                status?: string
                clinicId?: string
            }
            let query: Query = {}
            if (userEmail) {
                query = { userEmail }
            }
            if (status) {
                query.status = status
            }
            if (clinicId) {
                query.clinicId = clinicId
            }
            const result = await appointmentCollection.find(query).toArray()
            res.send(result)
        })
        app.patch("/appointment", async (req, res) => {
            const { id, status } = req.query as Record<string, string>
            const query = { _id: new mongodb.ObjectId(id) }
            const update = {
                $set: { status }
            }
            const result = await appointmentCollection.updateOne(query, update)
            res.send(result)
        })
        app.post("/appointment", async (req, res) => {
            const data = req.body
            const result = await appointmentCollection.insertOne(data)
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
