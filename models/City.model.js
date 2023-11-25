const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  name: [
    {
      required: true,
      type: String,
    },
  ],
  position: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
});

const City = mongoose.model("City", citySchema);

module.exports = City;
