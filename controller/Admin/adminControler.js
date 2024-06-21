// ---- 29 minutes past eigth
// ---- I will drive you home
// ---- We gonna let him have it
// ---- There is no rest for me on this world
// ---- Glad to hear it
// ---- Sent him in
// ---- Who on Earth is Messi?

const basePath = '../../'
const userSchema = require(basePath + 'models/user')


const login = async (req, res) => {
    try {
        res.render('login')
    } catch(error) {
        console.log(error)
    }
}

const loginCheck = async (req, res) => {
    try {
        // ---- Check is entered username is admin username ---- 
        const admin = await userSchema.findOne({ username: req.query.username })
        // ----- Checking thats admin -----
        if (admin && admin.is_admin == 1 && req.query.password == admin.password) {
            // ----- Storing admin details to session -----
            req.session.admin = {
                _id: admin._id,
                email: admin.email,
                name: admin.name
            }
            res.send({ success: true })
        } else {
            const message = 'Something went wrong'
            res.json({ message })
        }
        return res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
    }
}

const logout = async (req, res) => {
    try {
        // ------ Destroy session ------
        req.session.admin = null
        res.redirect('/admin')
        console.log('Admin logout')
    } catch (error) {
        console.log(error)
    }
}



module.exports = {
    login,
    loginCheck,
    logout
}