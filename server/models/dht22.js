var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var dht22Schema = new Schema({
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

var DHT22 = mongoose.model('DHT22', dht22Schema);
module.exports = DHT22;