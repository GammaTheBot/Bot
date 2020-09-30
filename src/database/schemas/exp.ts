import mongoose from "mongoose";

interface Exp extends mongoose.Document {
  _id: string;
  multiplier: number;
  roles: {
    [key: number]: string;
  };
}

export const ExpData: mongoose.Model<Exp> = mongoose.model(
  "expData",
  new mongoose.Schema({
    _id: String,
    multiplier: Number,
    roles: {
      type: Map,
      of: String,
    },
  })
);
