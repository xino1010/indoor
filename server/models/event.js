var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var eventSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  message: {
    type: String,
  },
});

var Event = mongoose.model('Event', eventSchema);
module.exports = Event;