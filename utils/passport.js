require('dotenv').config()
const passport = require('passport')

const { CLIENTID, CLIENTSECRET, CALL_BACK_URL } = process.env

const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})

passport.use(new GoogleStrategy({
    clientID: CLIENTID,
    clientSecret: CLIENTSECRET,
    callbackURL: CALL_BACK_URL,
    passReqToCallback : true
},
  function(request, accessToken, refreshToken, profile, done) {
    return done(null, profile)
  }
));






