import mongoose from "mongoose";

interface Guild extends mongoose.Document {
  _id: string;
  emojis: string;
  bans: string;
  messages: string;
  roles: string;
  channels: string;
  invites: string;
  nicknames: string;
  voice: string;
  useAudits: boolean;
  bypassChannels: string[];
}

export const GuildData: mongoose.Model<Guild> = mongoose.model(
  "Logging",
  new mongoose.Schema({
    _id: String,
    emojis: String,
    bans: String,
    messages: String,
    roles: String,
    channels: String,
    invites: String,
    nicknames: String,
    voice: String,
    useAudits: Boolean,
    bypassChannels: [String],
  })
);
