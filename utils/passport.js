const dotenv = require('dotenv').config()
const passport = require('passport')

const { CLIENTID, CLIENTSECRET } = process.env

const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})

passport.use(new GoogleStrategy({
    clientID: '124777832788-if7u3lre02nlcvfsesjr7jmdijtmn1nk.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "http://localhost:8000/auth/google/callback",
    passReqToCallback   : true
},
  function(request, accessToken, refreshToken, profile, done) {
    return done(null, profile)
  }
));






