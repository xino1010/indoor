var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

// create a schema
var higrometerSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  higrometer1: {
    type: Number,
    default: 0
  },
  higrometer2: {
    type: Number,
    default: 0
  },
  higrometer3: {
    type: Number,
    default: 0
  },
  higrometer4: {
    type: Number,
    default: 0
  },
});

var Higrometer = mongoose.model('Higrometer', higrometerSchema);
module.exports = Higrometer;