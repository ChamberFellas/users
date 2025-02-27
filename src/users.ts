import { number } from "zod";

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://shared_user:adDk4wkyBvIv5X4p@cluster.mongodb.net/myDatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const usersSchema = new mongoose.Schema({

    userID: Number,
    firstName: String,
    lastName: String,
    email: String,
    dateChecked: Date
});

const houseSchema = new mongoose.Schema({

    houseID: Number,
    ownerID: Number,
    houseName: String,
    dateCreated: Date,

})

const membersInHouseSchema = new mongoose.Schema({

    houseID: Number,
    userID: Number
})

const users = mongoose.model('Users', usersSchema);
const house = mongoose.model('House', houseSchema);
const membersInHouse = mongoose.model('membersInHouse', membersInHouseSchema);

