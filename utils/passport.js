const dotenv = require('dotenv').config()
const { clientID, clientSecret} = process.env
const passport = require('passport')

const dotenv = require('dotenv').config()
const { CLIENTID, CLIENTSECRET } = process.env

const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})

passport.use(new GoogleStrategy({
<<<<<<< HEAD
    clientID: '124777832788-if7u3lre02nlcvfsesjr7jmdijtmn1nk.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "http://localhost:8000/auth/google/callback",
=======
    clientID: CLIENTID,
    clientSecret: CLIENTSECRET,
    callbackURL: "https://anfieldturfbookings.online/auth/google/callback",
>>>>>>> 7ecf173b9c6ebc490a25a0def6ad548de79c5ba1
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    return done(null, profile)
  }
));






