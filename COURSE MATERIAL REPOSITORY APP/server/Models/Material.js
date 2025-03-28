const mongoose = require ('mongoose')
const Schema = mongoose.Schema;

const materialSchema = new Schema({
 name: { type: String, required: false },
  email: { type: String, required: true },
  unit: { type: String },
  uploadDate: { type: Date },
  filePath: [
    {
      unitName: { type: String, required: true },
      filePath: { type: String, required: true },
    },
  ],
  date: { type: Date, default: Date.now },
});

const Material = mongoose.model('Material', materialSchema);
module.exports = Material;
