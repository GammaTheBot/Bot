import mongoose from "mongoose";

interface CustomCommand extends mongoose.Document {
  _id: string;
  commands: {
    [key: string]: {
      aliases: string[];
      message: string;
      roles: {
        add: string[];
        remove: string[];
      };
      delete: boolean;
      dms: boolean;
    };
  };
}

export const CustomCommandData: mongoose.Model<CustomCommand> = mongoose.model(
  "customCommandData",
  new mongoose.Schema({
    _id: String,
    commands: {
      type: Map,
      of: {
        aliases: [String],
        message: [String],
        roles: {
          add: [String],
          remove: [String],
        },
        delete: Boolean,
        dms: Boolean,
      },
    },
  })
);
