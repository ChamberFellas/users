import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export async function connectDB() {

    const user = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;

    try{
        await mongoose.connect('mongodb+srv://' + user + ':' + password + '@bills.jtyzd.mongodb.net/Users?retryWrites=true&w=majority&appName=Bills')
        .then(() => {
            console.log("Connected to db!")
        })
        .catch((error) => {
            console.log("error",error)
        });

    }
    catch{
        console.log("are we here?")
        await mongoose.disconnect()
        await mongoose.connect('mongodb+srv://' + user + ':' + password + '@bills.jtyzd.mongodb.net/Users?retryWrites=true&w=majority&appName=Bills')
        .then(() => {
            console.log("Connected to db!")
        })
        .catch((error) => {
            console.log("error",error)
        });
    }
}

export async function disconnectDB() {
    await mongoose.connection.close();
}