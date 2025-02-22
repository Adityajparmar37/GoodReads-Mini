import { MongoClient } from "mongodb";

const mongoUrl = process.env.MONGO_URL;
export const client = new MongoClient(mongoUrl);

export const connectDb = async () => {
  try {
    await client.connect();
    //print error in slack
    console.log("Connected to Database");
  } catch (error) {
    //print error in slack
    throw new Error("Database connection failed");
  }
};
