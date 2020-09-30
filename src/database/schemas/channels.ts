import mongoose from "mongoose";

interface Channel extends mongoose.Document {
  _id: string;
  disabledCommands: string[];
  disabledCommandMessage: string;
  text: {
    [key: string]: {
      commands: {
        enabled: string[];
        disabled: string[];
      };
      slowmode: {
        everyone: boolean;
        time: number;
      };
    };
  };
  voice: {
    [key: string]: {
      [key: number]: string;
    };
  };
}

export const ChannelData: mongoose.Model<Channel> = mongoose.model(
  "channelData",
  new mongoose.Schema(
    {
      _id: String,
      disabledCommands: [String],
      disabledCommandMessage: String,
      text: {
        type: Map,
        of: {
          commands: {
            enabled: [String],
            disabled: [String],
          },
          slowmode: {
            everyone: Boolean,
            time: Number,
          },
        },
      },
      voice: {
        type: Map,
        of: {
          Number: String,
        },
      },
    },
    { strict: false }
  )
);
