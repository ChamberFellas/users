
import express from "express"
import { Request, Response} from "express";

import mongoose, {Types} from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import router from "./routes";
import * as user_module from "./users";
import {connectDB, disconnectDB} from "./database";

import axios from "axios";

export const app = express();

app.use(express.json());

app.use(router);

mongoose.connect("mongodb://localhost:27017/User_authentication")

if (process.env.NODE_ENV !== "test") {
  if (!process.env.PORT) {
    console.error("PORT is not defined");
    console.log("Setting port to default: 3000");
  }
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

connectDB();

// Define the endpoint to fetch an email by userID
app.get('/get-email/:userID', async (req: Request, res: Response) => {
  try {
      const { userID } = req.params; // Extract userID from URL
      /*
      if (!Types.ObjectId.isValid(userID)) {
          res.status(400).json({ error: "Invalid userID" });
          return;
      }
      */
      const user_details = await user_module.get_user(new Types.ObjectId(userID));
      
      if (!user_details) {
          res.status(404).json({ error: "User not found" });
          return;
      }

      res.json({ email: user_details?.email }); // Return the email
      return;
  } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
  }
});

// endpoints for recieving all people in a house

app.get('/get-all-users-in-house/:houseID', async (req: Request, res: Response) => {
  try {
      const { houseID } = req.params; // Extract houseID from URL
      if (!Types.ObjectId.isValid(houseID)) {
          res.status(400).json({ error: "Invalid houseID" });
          return;
      }
      const people = await user_module.get_all_users_in_house(new Types.ObjectId(houseID));
      
      if (!people) {
          res.status(404).json({ error: "House not found" });
          return;
      }

      res.json(people); // Return the people
      return;
  } catch (error) {
      console.error("Error fetching people:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
  }
});

// check if owner

app.get("check-if-owner/:userID/:houseID", async (req: Request, res: Response) => {

  try {
    const { userID, houseID } = req.params; // Extract userID and houseID from URL
    if (!Types.ObjectId.isValid(userID) || !Types.ObjectId.isValid(houseID)) {
        res.status(400).json({ error: "Invalid userID or houseID" });
        return;
    }
    const is_owner = await user_module.is_owner(new Types.ObjectId(userID), new Types.ObjectId(houseID));
    res.json({ is_owner }); // Return the people
    return;
  } catch (error) {
    console.error("Error fetching people:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

app.get("/remove-user-from-house/:userID/:houseID/:user_making_reqID",  async (req: Request, res: Response) => {

  const AUTH_SERVICE_URL = 'http://auth-service-url/auth/internal/validate';

  try {
      const { userID, houseID, user_making_reqID } = req.params; // Extract userID and houseID from URL
      if (!Types.ObjectId.isValid(userID) || !Types.ObjectId.isValid(houseID) || !Types.ObjectId.isValid(user_making_reqID)) {
          console.log("hello :D")
          res.status(400).json({ error: "Error parsing IDs" });
          return;
      }
      const is_owner = await user_module.is_owner(new Types.ObjectId(user_making_reqID), new Types.ObjectId(houseID));
      console.log("Passed owner check")
      if (!is_owner) {
          res.status(401).json({ error: "User is not the owner of the house" });
          return;
      }
      else if(!(await axios.post(AUTH_SERVICE_URL, {user_making_reqID} ))){ // add auth endpoint here (VERY LIKELY NEEDS FINNS MIDDLEWARE BUT IDK HOW THIS SHIT WORKS)
        res.status(401).json({ error: "User is not authenticated" });
        return;
      }
      else{
        console.log("Passed if statements")

        try{
          await user_module.remove_user_from_house(new Types.ObjectId(userID), new Types.ObjectId(houseID));
          console.log("passed house removal")
        }
        catch{
          res.status(401).json({ error: "Failed to remove user from house"})
          return;
        }

        // send notifs here
        const people = await user_module.get_all_users_in_house(new Types.ObjectId(houseID));
        console.log("Passed people check")
        // send notifs to all of these people that this user was removed.

      }
    } catch (error) {
      console.error("Error fetching people:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    console.log("made it to end")
    res.status(200).json({message: "User removed successfully"})
    return;
});

// FRONTEND ENDPOINT

app.get("create-user/:first_name/:last_name/:", async (req: Request, res: Response) => {

  try{
    const {first_name, last_name, email} = req.params;
    let status = await user_module.create_user(first_name,last_name,email)
    if (status === "Added new user"){
      res.status(401).json({error: status})
      return
    }
    res.status(200).json({message: status});
    return
  }
  catch{
    res.status(401).json({error: "Failed to create user"})
    return

  }

})

app.get("change-user-details/:userID/:param/:new_value", async (req: Request, res: Response) => {
  try{
    let status;
    const { userID, param, new_value} = req.params;
    if (param === "first_name"){
      status = await user_module.change_first_name(new Types.ObjectId(userID), new_value)
    }
    else if(param === "last_name"){
      status = await user_module.change_last_name(new Types.ObjectId(userID), new_value)
    }
    else if(param === "email"){
      status = await user_module.change_email(new Types.ObjectId(userID), new_value)
    }
    else{
      res.status(401).json({error: "Invalid parameter supplied"})
      return
    }
    if (status === "valid"){
      res.status(200).json({message: status})
    }
    else{
      res.status(401).json({error: status})
    }
    return
  }
  catch(error){
    res.status(401).json({error: error})
  }
})

app.get("add-user-to-house/:userID/:houseID", async (req: Request, res: Response) => {
  try{
    const{userID, houseID} = req.params;
    let status = await user_module.add_user_to_house(new Types.ObjectId(userID), new Types.ObjectId(houseID))
    if (status === "valid"){
      res.status(200).json({message: status})
    }
    else{
      res.status(401).json({error: status})
    }
    return;
  }
  catch(error){
    res.status(401).json({error: error})
    return
  }
})

/*

app.get("create_house",async (req: Request, res: Response) => {
  try{
    let status = user_module.create_house(ownerID)
  }
})

*/

app.listen(3000, "0.0.0.0", () =>{
  console.log('server running on port 3000')
})


// local IP address 172.26.53.145





// FRONT END ENDPOINTS

// add user to house

