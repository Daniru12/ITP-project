const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const imgSchema = new Schema({
  Image: { // Ensure consistent naming
    type: String, // Data type
    required: true, // Validation
  },
});

module.exports = mongoose.model("ImageModel", imgSchema);
