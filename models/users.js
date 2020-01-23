// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our database's data structure
const DataSchema = new Schema(
  {
    // User's id and pokemon they're holding, for now
    id: String,
    username: String,
    shinyRate: Number,
    currency: Number,
    items: { },
    daily: { },
    streaks: { }
  },
  { timestamps: true,
    versionKey: false
  }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Users", DataSchema);
