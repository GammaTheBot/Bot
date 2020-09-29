import mongoose from "mongoose";

interface Guild extends mongoose.Document {
  _id: string;
  prefix: string;
  color: string;
  premium: boolean;
  counting: {
    id: string;
    count: number;
    ping: {
      type: boolean;
      count: number;
    };
  };
  music: {
    threshold: number;
  };
}

export const GuildData: mongoose.Model<Guild> = mongoose.model(
  "Guild",
  new mongoose.Schema({
    _id: String,
    prefix: String,
    color: String,
    premium: Boolean,
    counting: {
      id: String,
      count: Number,
      ping: {
        type: Boolean,
        count: Number,
      },
    },
    music: {
      threshold: Number,
    },
  })
);
