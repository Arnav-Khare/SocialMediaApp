const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const connection = require('./db');
const User = connection.models.User;
const validPassword = require('../controllers/passwordUtils').validPassword


const verifyCallback = async (username,password,done)=>{
    User.findOne({ username: username })
    .then((user) => {

        if (!user) { return done(null, false) }
        
        const isValid = validPassword(password, user.hash, user.salt);
        
        if (isValid) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    })
    .catch((err) => {   
        done(err);
    });
}

const strategy = new LocalStrategy(verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
    console.log('Serialaize User')
    done(null, user.id);
});

passport.deserializeUser((userId, done) => {
    User.findById(userId)
        .then((user) => {
            done(null, user);
        })
        .catch(err => done(err))
});