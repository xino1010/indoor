var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var averageElectricitySchema = new Schema({
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

var AverageElectricity = mongoose.model('AverageElectricity', averageElectricitySchema);
module.exports = AverageElectricity;