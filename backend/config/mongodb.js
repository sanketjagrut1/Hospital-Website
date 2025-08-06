import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const options = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        };
        
        mongoose.connection.on('connected', () => console.log("Database Connected"));
        mongoose.connection.on('error', (err) => console.log("Database Connection Error:", err));
        mongoose.connection.on('disconnected', () => console.log("Database Disconnected"));
        
        await mongoose.connect(process.env.MONGODB_URI, options);
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
}

export default connectDB;

// Do not use '@' symbol in your databse user's password else it will show an error.