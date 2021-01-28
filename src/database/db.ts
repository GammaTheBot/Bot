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
    minPoolSize: 2,
    useFindAndModify: false,
  }
);
const dbase = mongoose.connection;
dbase.on("error", console.error.bind(console, "Connection error: "));
dbase.once("open", () => {
  console.log("Connected to the database!");
});

export function db(): mongoose.Connection {
  return dbase;
}

export type DbCollections =
  | "channelData"
  | "customCommandData"
  | "expData"
  | "guildData"
  | "expData"
  | "loggingData"
  | "memberData"
  | "moderationData"
  | "roleData"
  | "ticketData"
  | "userData";
