var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var electricitySchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  irms: {
    type: Number,
    default: 0
  },
  power: {
    type: Number,
    default: 0
  },
  watts: {
    type: Number,
    default: 0
  }
});

var Electricity = mongoose.model('Electricity', electricitySchema);
module.exports = Electricity;