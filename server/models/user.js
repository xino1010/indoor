var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  email: {
    type: String,
    required: true
  },
  socketid: {
  	type: String,
  	default: null,
  },
  name: {
  	type: String,
  	default: null,
  },
  lastlogin: {
    type: Date,
    default: null
  },
  lastlogout: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    default: 'offline'
  }
});

var User = mongoose.model('User', userSchema);
module.exports = User;