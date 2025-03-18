import express from "express";
import { Request, Response } from "express";
import mongoose, {Types} from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import router from "./routes";
import * as user_module from "./users";
import {connectDB, disconnectDB} from "./database";

export const app = express();

app.use(express.json());

app.use(router);

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
      if (!Types.ObjectId.isValid(userID)) {
          res.status(400).json({ error: "Invalid userID" });
          return;
      }
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

app.get("remove-user-from-house/:userID/:houseID/:user_making_req_ID", async (req: Request, res: Response) => {

  try {
      const { userID, houseID, user_making_reqID } = req.params; // Extract userID and houseID from URL
      if (!Types.ObjectId.isValid(userID) || !Types.ObjectId.isValid(houseID) || !Types.ObjectId.isValid(user_making_reqID)) {
          res.status(400).json({ error: "Error parsing IDs" });
          return;
      }
      const is_owner = await user_module.is_owner(new Types.ObjectId(user_making_reqID), new Types.ObjectId(houseID));
      if (!is_owner) {
          res.status(401).json({ error: "User is not the owner of the house" });
          return;
      }
      else if(false){ // add auth endpoint here
        res.status(401).json({ error: "User is not authenticated" });
        return;
      }
      else{

        try{
          await user_module.remove_user_from_house(new Types.ObjectId(userID), new Types.ObjectId(houseID));
        }
        catch{
          res.status(401).json({ error: "Faield to remove user from house"})
        }

        // send notifs here
        const people = await user_module.get_all_users_in_house(new Types.ObjectId(houseID));
        // send notifs to all of these people that this user was removed.

      }
    } catch (error) {
      console.error("Error fetching people:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
});

