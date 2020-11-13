import mongoose from "mongoose";

interface Moderation extends mongoose.Document {
  _id: String;
  punishments: [
    {
      id: string;
      class: "ban" | "mute" | "warn";
      length: number;
      date: number;
      active: boolean;
      reason: string;
      user: string;
      moderator: string;
    }
  ];
  chat: {
    badword: "delete" | "warn" | "delete-warn";
    repeat: "delete" | "warn" | "delete-warn";
    invite: "delete" | "warn" | "delete-warn";
    link: "delete" | "warn" | "delete-warn";
    caps: {
      action: "delete" | "warn" | "delete-warn";
      percentage: number;
    };
    spam: {
      action: "delete" | "warn" | "delete-warn";
      percentage: number;
      time: number;
    };
    automod: [
      {
        count: number;
        action: "delete" | "warn" | "delete-warn";
        length: number;
      }
    ];
  };
}

export const ModerationData: mongoose.Model<Moderation> = mongoose.model(
  "moderationData",
  new mongoose.Schema({
    _id: String,
    punishments: [
      {
        id: String,
        class: {
          type: String,
          enum: ["ban", "mute", "warn"],
        },
        length: Number,
        date: Number,
        active: Boolean,
        reason: String,
        user: String,
        moderator: String,
      },
    ],
    chat: {
      badword: {
        type: String,
        enum: ["delete", "warn", "delete-warn"],
      },
      repeat: {
        type: String,
        enum: ["delete", "warn", "delete-warn"],
      },
      invite: {
        type: String,
        enum: ["delete", "warn", "delete-warn"],
      },
      link: {
        type: String,
        enum: ["delete", "warn", "delete-warn"],
      },

      caps: {
        action: {
          type: String,
          enum: ["delete", "warn", "delete-warn"],
        },
        percentage: Number,
      },
      spam: {
        action: {
          type: String,
          enum: ["delete", "warn", "delete-warn"],
        },
        percentage: Number,
        time: Number,
      },
      automod: [
        {
          count: Number,
          action: {
            type: String,
            enum: ["delete", "warn", "delete-warn"],
          },
          length: Number,
        },
      ],
    },
  })
);
