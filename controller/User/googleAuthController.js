const basePath = '../../'
const userSchema = require (basePath + 'models/user')

const successGoogleLogin = async (req, res) => {
    try {
        if(!req.user) {
            // ---- If error ----
            res.redirect('/failure')
        } else {
            // ---- Search user on userSchema ----
            let user = await userSchema.findOne({ email: req.user.email })
            if(!user){
                // ---- If not insert user details ----
                userSchema.insertMany({ email: req.user.email, name: req.user.displayName, block: false })
            }
            // ---- Find user and store to session ----
            user = await userSchema.findOne({ email: req.user.email })
            const data = ({
                email: req.user.email,
                name: req.user.displayName,
                _id: user._id
            })
            // // ------ userData save to session ------
            req.session.user = data;
            console.log(req.session.user)
            res.redirect('/')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const failureGoogleLogin = (req, res) => {
    try {
        res.redirect('/')
    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {
    successGoogleLogin,
    failureGoogleLogin
}