var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var averageDht22Schema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  temperature: {
    type: Number,
    default: 0
  },
  humidity: {
    type: Number,
    default: 0
  }
});

var AverageDHT22 = mongoose.model('AverageDHT22', averageDht22Schema);
module.exports = AverageDHT22;