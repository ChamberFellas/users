import mongoose, { Types } from "mongoose";
import {connectDB, disconnectDB} from "./database";
export const testing = false;
import * as this_module from "./users";
import { transpileModule } from "typescript";

if (!testing){
    connectDB();
}

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

async function validate_email(email: string) {
    const email_already_exists = !!(await user.findOne({ email }));
    console.log(email_already_exists)
    const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
    return !email_already_exists && emailRegex.test(email);
}

function validate_names(name: string){ // ensure name does not contain numbers or symbols
    return /^[A-Za-z]+$/.test(name);
}

async function create_user(firstName: string, lastName: string, email: string){

    const userData = {
        firstName,
        lastName,
        email,
        dateCreated: new Date() // gets today's date
    };

    if (firstName.length < 1 || firstName.length > 15 || !(await validate_names(firstName))){
        console.log("add_user function failed: Invalid firstname");
    }
    else if (lastName.length < 1 || lastName.length > 15 || !(await validate_names(lastName))){
        console.log("add_user function failed: Invalid lastName");
    }
    else if (!validate_email(email)){
        console.log("add_user function failed: Invalid email");
    }
    else{
        try{
            const new_user = await user.create(userData);
            console.log(" Added new user ", new_user);
        }
        catch(error){
            console.log("add_user function failed", error);
        }
    }   

}

// change first name

async function change_first_name(userID: Types.ObjectId, new_first_name: string){
    try{

        const user_doc = await user.findById(userID)

        if (new_first_name.length < 1 || new_first_name.length > 15 || !validate_names(new_first_name) || (user_doc && user_doc.firstName === (new_first_name) )){
            console.log("change_first_name function failed: new name is invalid")
        }
        else{
            console.log("valid name");
            const result = await user.findOneAndUpdate(
                {_id : userID},
                {$set: {firstName: new_first_name}}
            );
        }
    }
    catch(error){
        console.log("change_first_name function failed",error);

    }
}

// change last name

async function change_last_name(userID: Types.ObjectId, new_last_name: string){

    try{
        const user_doc = await user.findById(userID)
        if (new_last_name.length < 1 || new_last_name.length > 15 || !validate_names(new_last_name) || (user_doc && user_doc.lastName === new_last_name)){
            console.log("change_last_name function failed: new name is invalid")
        }
        else{
            const result = await user.findOneAndUpdate(
                {_id : userID},
                {$set: {lastName: new_last_name}}
            );
        }
    }
    catch(error){
        console.log("change_last_name function failed",error);
    }

}

// change email

async function change_email(userID: Types.ObjectId, new_email: string){
    try{
        if (!validate_email(new_email)){
            console.log("change_last_name function failed: new name is invalid")
        }
        else{
            const result = await user.findOneAndUpdate(
                {_id : userID},
                {$set: {email: new_email}}
            );
        }

    }
    catch(error){
        console.log("change_last_name function failed",error);

    }
}

/*

const delete_user = async (userID: Types.ObjectId) => {

    try{

        // ensure user is not an owner of a particular house

        let is_an_owner = false;

        // PIECE OF SHIT CODE DOESN'T WORK AND I DO NOT KNOW WHY
        // seems to be compatiblity issues with houseID and Types.ObjectID. 

        // Code is meant to ensure that the user being deleted is not an owner of a house

        

        const belongs_to_house = await membersInHouse.find(
            {userID: userID},
            {houseID: 1}
        );

        for (let i = 0; i < belongs_to_house.length; i++){

            const houseID = belongs_to_house[i].houseID;
            const house_check = await is_owner(houseID, userID);
            if (house_check){
                console.log("delete_user function failed: user to be deleted cannot be owner of house");
                is_an_owner = true;
                break;
            }
        }

        
        if (!is_an_owner){
            const result = await user.deleteOne({_id: userID});
            console.log("User successfully deleted");
        }
    }
    catch(error){
        console.log("delete_user function failed",error);
    }
}

*/

async function delete_user(user_id: Types.ObjectId){

    const house_ids = await membersInHouse.find({user_id: user_id}).select("house_id").lean()
    let is_an_owner = false;

    try{
        for (let i = 0; i < house_ids.length; i++){

            if (await is_owner(house_ids[i].houseID as any, user_id)){
                is_an_owner = true
                break;
            }
        }
    
        if (!is_an_owner){
            const result_membersinhouse = await membersInHouse.deleteMany({user_id:user_id})
            const result_user = await user.deleteOne({_id: user_id})
            console.log("User successfully deleted");
        }
        else{
            console.log("delete_user function failed: user to be deleted cannot be owner of house");
        }
    }
    catch(error){
        console.log("delete_user function failed",error);
    } 
}


export {user,validate_email, validate_names, create_user, change_first_name, change_last_name, change_email};

// HOUSE RELATED

// create house

const create_house = async (ownerID: Types.ObjectId, houseName: string) => {

    const house_data = {
        ownerID: ownerID,
        houseName: houseName,
        dateCreated: new Date() // gets today's date
    };
    try{
        if (houseName.length < 1 || houseName.length > 50){
            console.log("create house function failed: invalid houseName");
        }
        else{
            console.log("made it here :D")
            const new_house = await house.create(house_data);
            const houseID = new_house._id;
    
            const members_in_house_data = {
                userID: ownerID, // first member of house is always the owner
                houseID: houseID
            }; 
            const new_members_in_house = await membersInHouse.create(members_in_house_data);
        }
    }
    catch(error){
        console.log("create house function failed", error);
    }
}

// delete house


async function delete_house(house_id: Types.ObjectId){

    try{
        // remove all instances in memberInHouse
        // remove house

        const result_members = await membersInHouse.deleteMany(
            {house_id:house_id}
        );
        const result_house = await house.deleteMany(
            {_id: house_id}
        )
        console.log("User successfully deleted");
    }
    catch{
        console.log("delete_user function failed: user to be deleted cannot be owner of house");
    }

}

// get all users in house

async function get_all_users_in_house (houseID: Types.ObjectId){

    try{
        const users_in_house = await membersInHouse.find(
            {houseID: houseID}, 
            {userID: 1}
        ).lean()
        return Object.values(String(users_in_house));
    }
    catch(error){
        console.log("get_all_user_in_house function failed",error);
    }
}

// some function to change the property of user

async function find_owner( houseID: Types.ObjectId){

    try{
        const owner = await house.findOne(
            {_id: houseID},
            {ownerID: 1}
        )

        if (!owner || !owner.ownerID){
            console.log("find_owner function failed: No owner exists")
            return null;
        }
        else{
            return owner.ownerID as any;
        }
        
    }
    catch(error){
        console.log("find_owner function failed")
    }
}

// check if user is an owner of a specific house

async function is_owner( houseID: Types.ObjectId, userID: Types.ObjectId){

    try{
        const owner = await this_module.find_owner(houseID);
        return (owner == userID);
    }
    catch(error){
        console.log("is_owner function failed",error);
        return false;
    }
}

// check user is in house

async function is_in_house(houseID: Types.ObjectId, userID: Types.ObjectId){

    try{
        const all_members = await this_module.get_all_users_in_house(houseID);
        return all_members?.includes(String(userID));
    }
    catch(error){
        console.log("is_in_house function failed", error);
        return false;
    }
}

// transfer ownership

const change_owner = async (newOwnerID: Types.ObjectId , houseID: Types.ObjectId) => {

    try{
        const current_owner = await this_module.find_owner(houseID);

        if (! await this_module.is_in_house(houseID, newOwnerID)){
            console.log("change_owner function failed: new owner must be in house");
        }
        else if (current_owner && current_owner.equals(newOwnerID)){
            console.log("change_owner function failed: new owner cannot be the same as old owner");
        }
        else{
            house.updateOne(
                {houseID: houseID},
                { $set: {ownerID: newOwnerID}}
            );
        }
    }
    catch(error){
        console.log("change_owner function failed", error);
    }
}

// remove user from house (cannot be owner)

const remove_user_from_house = async (userID: Types.ObjectId, houseID: Types.ObjectId, ) =>{

    const current_owner = await Promise.resolve(this_module.find_owner(houseID));

    try{
        if(! await this_module.is_in_house(houseID, userID)){
            console.log("remove_user_from_house failed: user to be removed must be in house");
        }
        else if(current_owner && current_owner.equals(userID)){
            console.log("remove_user_from_house failed: user to be removed cannot be owner of house");
        }
        else{
            await membersInHouse.deleteOne(
                {houseID: houseID,userID: userID},
            );
        }
    }
    catch(error){
        console.log("remove_user_from_house failed:", error);
    }
}

export {house, membersInHouse, create_house, delete_house, get_all_users_in_house, find_owner, is_owner, is_in_house, change_owner, remove_user_from_house}