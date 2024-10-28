const nodemailer = require('nodemailer')
const userSchema = require('../models/user')

const dotenv = require('dotenv').config()
const { AUTHPASSWORD } = process.env

const sendPassword = async(email,password)=>{
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: "muhammedshabeeb330@gmail.com",
          pass: AUTHPASSWORD,
        },
      });
      const find = await userSchema.findOne({email:email})
      const info = await transporter.sendMail({
        from: "muhammedshabeeb330@gmail.com", // sender address
        to: email, // list of receivers
        subject: "For registration in turf booking website", // Subject line
        text: "Hello world?", // plain text body
        html: `<b>Username is : ${find.username} and Password is : ${password}</b>`, // html body
      });

    console.log('New password sended')
}


module.exports = sendPassword
