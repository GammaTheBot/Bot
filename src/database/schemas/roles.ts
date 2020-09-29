import mongoose from "mongoose";

interface Role extends mongoose.Document {
  _id: string;
  react: {
    [key: string]: {
      [key: string]: string;
    };
  };
  voice: {
    [key: string]: string;
  };
  stats: {
    amount: number;
    timespan: number;
    roleid: string;
  };
  permissions: {
    id: string[];
  };
}

export const RoleData: mongoose.Model<Role> = mongoose.model(
  "Role",
  new mongoose.Schema({
    _id: String,
    react: {
      type: Map,
      of: {
        type: Map,
        of: String,
      },
    },
    voice: {
      type: Map,
      of: String,
    },
    stats: {
      amount: Number,
      timespan: Number,
      roleid: String,
    },
    permissions: {
      id: [String],
    },
  })
);
