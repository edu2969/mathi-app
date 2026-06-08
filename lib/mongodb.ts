import { MongoClient } from "mongodb";

export async function connectDB() {
  try {
    console.log("connecting");

    const client = new MongoClient(
      process.env.MONGODB_URI!
    );

    await client.connect();

    console.log("connected");

    return client.db(); // Devuelve la base de datos por defecto especificada en la URI
  } catch (error) {
    console.error(error);
    throw error;
  }
}