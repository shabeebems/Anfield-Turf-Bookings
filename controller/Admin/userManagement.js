const basePath = '../../'
const userSchema = require(basePath + 'models/user')

const bcrypt = require('bcrypt')
const hashPass = async (password) => {
    const hashed = await bcrypt.hash(password, 10)
    console.log('Password bcrypted')
    return hashed
}

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

const checkuser = async (req, res) => {
    try {
        const { name, email, mobile, username, password, confirmPassword } = req.query
        // ----- Checking new user entered Email and Username -----
        const findEmail = await userSchema.findOne({ email: email })
        const findUsername = await userSchema.findOne({ username: username })
        // ----- Password strong checking function -----
        function isStrongPassword(password) {
            const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
            return strongPasswordRegex.test(password);
        }
        if (findEmail) {
            const message = 'Email already exist'
            res.json({ message })
        } else if (findUsername) {
            const message = 'Username already exist'
            res.json({ message })
        } else if (username.length < 6 || username.length > 50) {
            const message = 'Enter username length btw 6 to 50'
            res.json({ message })
        } else if (!/[A-Za-z0-9.%]+@gmail.com/.test(email)) {
            const message = 'Enter valid email'
            res.json({ message })
        } else if (!/^[0-9]+$/.test(mobile) || mobile.length < 7 || mobile.length > 15) {
            const message = 'Enter valid mobile'
            res.json({ message })
        } else if (!/^[A-Za-z ]+$/.test(name) || name.length < 3 || name.length > 30) {
            const message = 'Enter valid name'
            res.json({ message })
        } else if(!isStrongPassword(password)){
            const message = 'Enter a strong password'
            res.json({ message })
        }
        else if (password != confirmPassword) {
            const message = 'Conform password is not correct'
            res.json({ message })
        } else {
            res.json({ success: true, data: req.query })
        }
    } catch (error) {
        console.log(error.message)
    }
}

// ------ After adding users -------
const addingUser = async (req, res) => {
    try {
        const query = JSON.parse(req.query.data)
        console.log(query)
        // ------ bcrypte password -----
        const password = await hashPass(query.password)
        const data = ({
            name: query.name,
            email: query.email,
            mobile: query.mobile,
            username: query.username,
            password: password,
            refferalCode: query.username.slice(0,4) + Math.floor(1000 + Math.random() * 9000),
            is_admin: 0,
            block: false
            })
        // ------ userData save to session ------
        await userSchema.insertMany(data)
        res.redirect('/admin-users-list')
    } catch (error) {
        console.log(error.message)
    }
}

const userEdit = async (req, res) => {
    try {
        const user = await userSchema.findOne({ email: req.query.email })
        res.render('editUser', { user })
    } catch (error) {
        console.log(error.message)
    }
}

const userEditCheck = async (req, res) => {
    try {
        const { id, name, email, mobile, username } = req.query

        // ----- Finding editing user details -----
        const finduser = await userSchema.findOne({ _id: id })
        
        // ----- Checking editinf Email and Username are exists -----
        const findEmail = await userSchema.findOne({ email: email })
        const findUsername = await userSchema.findOne({ username: username })

        if (findEmail && findEmail.email !== finduser.email) {
            const message = 'Email already exist'
            res.json({ message })
        } else if (findUsername && findUsername.username !== finduser.username) {
            const message = 'Username already exist'
            res.json({ message })
        } else if (username.length < 6 || username.length > 50) {
            const message = 'Enter username length btw 6 to 50'
            res.json({ message })
        } else if (!/[A-Za-z0-9.%]+@gmail.com/.test(email)) {
            const message = 'Enter valid email'
            res.json({ message })
        } else if (!/^[0-9]+$/.test(mobile) || mobile.length < 7 || mobile.length > 15) {
            const message = 'Enter valid mobile'
            res.json({ message })
        } else if (!/^[A-Za-z ]+$/.test(name) || name.length < 3 || name.length > 30) {
            const message = 'Enter valid name'
            res.json({ message })
        }else {
            res.json({ success: true, data: req.query })
        }

    } catch (error) {
        console.log(error.message)
    }
}

const editingUser = async (req, res) => {
    try {
        const query = JSON.parse(req.query.data)
        await userSchema.findOneAndUpdate({ _id: query.id }, { name: query.name, email: query.email, mobile: query.mobile, username: query.username })
        res.redirect('/admin-users-list')
        
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    userList,
    blockUser,
    addUsers,
    checkuser,
    addingUser,
    userEdit,
    userEditCheck,
    editingUser
}