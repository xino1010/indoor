var express = require('express');
var router = express.Router();
var User = require('../models/user');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var ExpressBrute = require('express-brute');
var MemcachedStore = require('express-brute-memcached');
var moment = require('moment');
var ExpressBrute = require('express-brute');
var MongooseStore = require('express-brute-mongoose');
var BruteForceSchema = require('express-brute-mongoose/dist/schema');
var mongoose = require('mongoose');
 
var model = mongoose.model('bruteforce', BruteForceSchema);
var store = new MongooseStore(model);

var failCallback = function (req, res, next, nextValidRequestDate) {
    log.error("You've made too many failed attempts in a short period of time, please try again " + nextValidRequestDate);
    res.send({
        code: -2,
        message: "Number attempts reached. Try at " + nextValidRequestDate
    });
};
var handleStoreError = function (error) {
    log.error(error); // log this error so we can figure out what went wrong
    // cause node to exit, hopefully restarting the process fixes the problem
    throw {
        message: error.message,
        parent: error.parent
    };
}
// Start slowing requests after 5 failed attempts to do something for the same user
var userBruteforce = new ExpressBrute(store, {
    freeRetries: 5, // número de veces que puede fallar el login por primera vez, no cuenta el primer intento
    minWait: 3000, // 3 seconds (tiempo entre petición y petición)
    maxWait: 60000, // 60 seconds (tiempo que tiene que esperar para hacer otra petición después de haber fallado el login)
    lifetime: 60 * 60, // 1 hour (tiempo que estará controlando que ha fallado el login.
    //Permitirá intentarlo una vez, a la segunda bloquerá la petición.
    // Deberá esperar 30 segundos para otra oportunidad.
    // Esto procese se repetirá a lo largo de 1h.)
    failCallback: failCallback,
    handleStoreError: handleStoreError
});

router.post('/login',
    userBruteforce.prevent,
    function(req, res) {
        if (!req.body.username) {
            res.send({
                code: 0,
                message: "Parameter username missing"
            });
            return;
        }
        if (!req.body.password) {
            res.send({
                code: 0,
                message: "Parameter password missing"
            });
            return;
        }
        User.findOne({ username: req.body.username }, function (err, user) {
            if (err) {
                res.json({
                    code: 0,
                    message: "User not found on DB",
                });
            }
            else if (user) {
                bcrypt.compare(req.body.password, user.password, function(err, result) {
                    if (err) {
                        res.send({
                            code: 0,
                            message: "Error comparing hash",
                            error: err
                        });
                    }
                    else {
                        if (result) {
                            // reset the failure counter so next time they log in they get 5 tries again before the delays kick in
                            req.brute.reset(function () {
                                user.lastlogin = new Date();
                                user.save(function(err, userUpdated) {
                                    if (err) {
                                        res.send({
                                            code: 0,
                                            message: "Error updating lastlogin of user",
                                            error: err,
                                        });
                                    }
                                    else {
                                        jwt.sign({
                                            username: userUpdated.username,
                                            }, process.env.JWT_SECRET, {
                                            expiresIn: 60 * 60
                                            }, function (errToken, token) {
                                            if (errToken) {
                                                res.send({
                                                    code: 0,
                                                    message: "Error generating token",
                                                    error: err,
                                                });
                                            }
                                            else {
                                                res.send({
                                                    code: 1,
                                                    message: "User logged successfully",
                                                    user: userUpdated,
                                                    token: token,
                                                });
                                            }
                                        });
                                    }
                                });
                            });
                        }
                        else {
                            res.send({
                                code: 0,
                                message: "Password is not correct"
                            });
                        }
                    }
                });
            }
            else {
                res.send({
                    code: 0,
                    message: "User " + req.body.username + " not found on DB"
                });
            }
        });
    }
);

module.exports = router;