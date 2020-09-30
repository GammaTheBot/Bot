import mongoose from "mongoose";

interface Member extends mongoose.Document {
  _id: string;
  members: {
    [key: string]: {
      counts: Number;
      exp: Number;
      level: Number;
      stats: {
        [key: number]: number;
      };
    };
  };
  count: {
    [key: number]: number;
  };
}

export const MemberData: mongoose.Model<Member> = mongoose.model(
  "memberData",
  new mongoose.Schema({
    _id: String,
    members: {
      type: Map,
      of: {
        counts: Number,
        exp: Number,
        level: Number,
      },
    },
    count: {
      type: Map,
      of: Number,
    },
  })
);
