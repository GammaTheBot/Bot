import mongoose from "mongoose";
mongoose.connect(
  `mongodb+srv://Gamma:${process.env.mongo_password}@gamma.gkggs.mongodb.net/Gamma?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    appname: "GammaBot",
    useUnifiedTopology: true,
    compression: {
      compressors: ["snappy", "zlib"],
    },
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error: "));
db.once("open", () => {
  console.log("Connected to the database!");
});
