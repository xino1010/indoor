var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var averageSystemInfoSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  temperature: {
    type: Number,
    default: 0
  },
  avg: {
    type: Number,
    default: 0
  },
  avg5: {
    type: Number,
    default: 0
  },
  avg15: {
    type: Number,
    default: 0
  },
});

var SystemInfo = mongoose.model('SystemInfo', averageSystemInfoSchema);
module.exports = SystemInfo;