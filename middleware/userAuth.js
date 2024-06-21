const userSchema = require ('../models/user')

const isLogin = async (req,res,next)=>{
    try {
        if(req.session.user){
            const id = req.session.user._id
            const user = await userSchema.findOne({ _id: id })
            if(user.block == 0){
                next()
            }else{
                req.session.user = null
                res.redirect('/')
            }
        }else{
            res.redirect('/')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const isLogout = async (req,res,next)=>{
    try {
        if(!req.session.user){
            next()
        }else{
            res.redirect('/home')
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    isLogin,
    isLogout
}