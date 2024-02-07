import mongoose, { Schema } from "mongoose";

const tweetSchema = new mongoose.Schema(
  {
    heading:{
        type:String,
    },
    image: {
      type: String,
    //   required:true
    },
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Tweet = mongoose.model("Tweet", tweetSchema);
