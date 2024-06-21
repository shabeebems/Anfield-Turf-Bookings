const basePath = '../../'
const userSchema = require(basePath + 'models/user')


const userList = async (req, res) => {
    try {
        // ------ Filter all users -------
        const user = await userSchema.find({ is_admin: 0 }, { _id: 0, password: 0, __v: 0, is_admin: 0 })
        res.render('users-list',{ user })
        
    } catch (error) {
        console.log(error.message)
    }
}


const blockUser = async (req, res) => {
    try {
        const {email} = req.query
        // ----- Find user based on email for block/unblock -----
        const block = await userSchema.findOne({ email: email })
        // ----- Convert block/unblock -----
        block.block =! block.block
        block.save()
        res.redirect('/admin-users-list')
    } catch (error) {
        console.log(error.message)
    }
}

const addUsers = async (req, res) => {
    try {
        res.render('addUsers')
    } catch (error) {
        console.log(error.message)
    }
}

// ------ After adding users -------
const addingUser = async (req, res) => {
    try {
        res.redirect('/admin-users-list')
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    userList,
    blockUser,
    addUsers,
    addingUser
}