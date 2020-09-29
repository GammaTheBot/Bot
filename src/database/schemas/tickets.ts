import { MessageEmbed } from "discord.js";
import mongoose from "mongoose";

interface Tickets extends mongoose.Document {
  _id: string;
  sections: {
    id: string;
    limit: Number;
    pin: boolean;
    creation: MessageEmbed;
    deletion: MessageEmbed;
    support: [string];
    log_actions: [string];
    commands: boolean;
    numbers: number;
    channels: [string];
    transcript: {
      auto_save: "close" | "delete" | null;
    };
    open: {
      category: string;
      user: [string];
      support: [string];
    };
    closed: {
      category: string;
      user: [string];
      support: [string];
    };
  };
}

export const TicketData: mongoose.Model<Tickets> = mongoose.model(
  "Tickets",
  new mongoose.Schema({
    _id: String,
    sections: {
      id: String,
      limit: Number,
      pin: Boolean,
      creation: Object,
      deletion: Object,
      support: [String],
      log_actions: [String],
      commands: Boolean,
      numbers: Number,
      channels: [String],
      transcript: {
        auto_save: {
          type: String,
          enum: ["close", "delete", "null"],
        },
        open: {
          category: String,
          user: [String],
          support: [String],
        },
        closed: {
          category: String,
          user: [String],
          support: [String],
        },
      },
    },
  })
);
