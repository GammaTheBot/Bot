import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "development" ? `.env.dev` : ".env",
}); //Dotenv lets you get env values (for example we can do process.env.bot_token)
import("./languages/Language");
import("./bot/bot");
