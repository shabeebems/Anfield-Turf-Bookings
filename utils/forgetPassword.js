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
        html: 
          `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2 style="color: #0056b3; margin-bottom: 10px;">Account Credentials</h2>
            <p style="margin: 5px 0;"><strong>Username:</strong> ${find.username}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
            <p style="margin-top: 15px; font-size: 0.9em; color: #666;">
              Please keep these credentials secure and do not share them with anyone.
            </p>
          </div>`, // html body
      });

    console.log('New password sended')
}


module.exports = sendPassword
