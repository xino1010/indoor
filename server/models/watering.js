var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var wateringSchema = new Schema({
  startdate: {
    type: Date,
    default: Date.now
  },
  enddate: {
    type: Date,
    default: Date.now
  }
});

var Watering = mongoose.model('Watering', wateringSchema);
module.exports = Watering;