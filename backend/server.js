const app = require("./app");

const connectDatabase = require("./config/database");
const cloudinary=require("cloudinary");

//handling undefine errors or uncaught exception


process.on("uncaughtException", (err) => {
  console.log(`Error:${err.message}`);
  console.log("Shutting down the server due to uncaught exception");
  process.exit(1);
});

//config
if(process.env.NODE_ENV!=='PRODUCTION'){

  require("dotenv").config({ path: "backend/config/config.env" });

}

//connecting to database

connectDatabase();

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
})

const port=process.env.PORT || 4000

const server = app.listen(port, () => {
  console.log("server is working on http://localhost:" + process.env.PORT);
});

// unhandle Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error:${err.message}`);
  console.log("Shutting down the server due to unhandle Promise Rejection");
  server.close(() => {
    process.exit(1);
  });
});
