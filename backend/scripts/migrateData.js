import mongoose from "mongoose";
import dotenv from "dotenv";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

dotenv.config();

const DB_NAME = "MediLink";

const migrateData = async () => {
    try {
        // Get base URI without database name
        const baseUri = process.env.MONGODB_URI.split('/MediLink')[0];
        
        // Connect to database
        await mongoose.connect(`${baseUri}/${DB_NAME}`);
        console.log("Connected to database");

        // Fetch all data
        const users = await userModel.find({});
        const doctors = await doctorModel.find({});
        const appointments = await appointmentModel.find({});

        console.log(`Found ${users.length} users`);
        console.log(`Found ${doctors.length} doctors`);
        console.log(`Found ${appointments.length} appointments`);

        console.log("Data verification completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Operation failed:", error);
        process.exit(1);
    }
};

migrateData(); 