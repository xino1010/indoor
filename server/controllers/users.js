var express = require('express');
var router = express.Router();
var User = require('../models/user');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const saltRounds = 10;

// CHECK TOKEN
router.post('/', function(req, res) {
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
            var newUser = new User({
                username: req.body.username,
                password: hash,
                email: req.body.email
            });
            newUser.save(function(error, user) {
                if (error)
                    res.send("Error creating user");
                else
                    res.send(user);
            });
        });
    });
})
.use(function (req, res, next) {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
        if (err) {
            return res.json({
                success: false,
                message: 'Failed to authenticate token.',
                error: err
            });
        }
        else {
            req.decoded = decoded;
            next();
        }
    });
});

module.exports = router;