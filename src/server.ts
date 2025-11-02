import app from "./app";
import { ENV } from "./config/env.config";
import { seedDB, connectDB } from "./config/db.config"; 

const port = ENV.PORT || "8080";

async function startServer(){
    //Connect to DB
    console.log("Connecting to the DB...");
    await connectDB();

    //Seed the DB
    console.log("Seeding the DB...");
    await seedDB();

    //Start the server
    console.log("Starting the server...");
    app.listen(port, () => {
        console.log(`Server is running on ${port}`);
    });
}

startServer()
    .catch((err) => {
        console.error(err);
    });