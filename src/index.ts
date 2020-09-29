import dotenv from "dotenv";
const current =
  process.env.NODE_ENV != "production" ? "." + process.env.NODE_ENV : "";
dotenv.config({
  path: ".env" + current,
}); //Dotenv lets you get env values (for example we can do process.env.bot_token)
import("./languages/Language");
import("./bot/bot");
