import mongoose from "mongoose";

export async function connectDB() {
    mongoose.connect('mongodb+srv://shared_user:adDk4wkyBvIv5X4p@bills.jtyzd.mongodb.net/?retryWrites=true&w=majority&appName=Bills')
        .then(() => {
            console.log("Connected to db!")
        })
        .catch((error) => {
            console.log("error",error)
        });
}

export async function disconnectDB() {
    await mongoose.connection.close();
}