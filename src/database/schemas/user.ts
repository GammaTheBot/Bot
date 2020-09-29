import mongoose from "mongoose";

interface User extends mongoose.Document {
  _id: string;
  users: {
    [key: string]: {
      cooldowns: {
        [key: string]: {
          end: number;
          length: number;
        };
      };
      reminders: {
        [key: string]: {
          end: number;
          length: number;
          reason: string;
        };
      };
      trust: number;
    };
  };
}

export const UserData: mongoose.Model<User> = mongoose.model(
  "User",
  new mongoose.Schema({
    _id: String,
    users: {
      type: Map,
      of: {
        cooldowns: {
          type: Map,
          of: {
            end: Number,
            length: Number,
          },
        },
        reminders: {
          type: Map,
          of: {
            end: Number,
            length: Number,
            reason: String,
          },
        },
        trust: Number,
      },
    },
  })
);
