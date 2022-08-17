const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser=require("body-parser");
const expressFileUpload=require("express-fileupload")
const dotenv = require("dotenv");
const path=require('path')


dotenv.config({ path: "backend/config/config.env" });



app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json({limit:"50mb"}));
app.use(expressFileUpload({useTempFiles:true}))
//Route Imports
const productRoutes = require("./routes/productRoute");
const userRoutes = require("./routes/userRoute");
const orderRoutes = require("./routes/orderRoute");
const payment=require("./routes/paymentRoute");
//middle ware for errors

app.use(cookieParser());
const corsOptions = {
    origin: true, //included origin as true
    credentials: true, //included credentials as true
};

app.use(cors(corsOptions));
app.use("/api/v1", productRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", orderRoutes);
app.use('/api/v1',payment);

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
});


module.exports = app;
