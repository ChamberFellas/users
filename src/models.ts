import mongoose, {Types} from "mongoose"

const usersSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    dateCreated: Date
});

const houseSchema = new mongoose.Schema({
    ownerID: {type: Types.ObjectId, ref: "Users" },
    houseName: String,
    dateCreated: Date, 
})

const membersInHouseSchema = new mongoose.Schema({
    houseID: {type: Types.ObjectId, ref: "House"},
    userID: {type: Types.ObjectId, ref: "Users"}
})

const user = mongoose.model('Users', usersSchema);
const house = mongoose.model('House', houseSchema);
const membersInHouse = mongoose.model('membersInHouse', membersInHouseSchema);

export {user, house, membersInHouse} 