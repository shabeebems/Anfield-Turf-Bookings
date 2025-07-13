const nodemailer = require('nodemailer')
const otpSchema = require('../models/otp')

const dotenv = require('dotenv').config()
const { AUTHPASSWORD } = process.env

const sendOtp = async(email)=>{
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: "muhammedshabeeb330@gmail.com",
          pass: "jvkd akwp whun pwyj",
        },
      });

      const otp = Math.floor(1000 + Math.random() * 9000);

      const info = await transporter.sendMail({
        from: "muhammedshabeeb330@gmail.com", // sender address
        to: email, // list of receivers
        subject: "For registration in turf booking website", // Subject line
        text: "Hello world?", // plain text body
        html: 
        `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color: #0056b3; margin-bottom: 10px;">Your OTP Code</h2>
          <p style="margin: 5px 0;"><strong>OTP:</strong> ${otp}</p>
          <p style="margin-top: 15px; font-size: 0.9em; color: #666;">
              Please enter the OTP above to verify your account. The code will expire in 5 minutes.
          </p>
        </div>`, // html body
      });

      const storeOtp = ([{
        otp:otp,
        email:email       
    }])
    console.log('Otp sended')
    // --- Storing otp to mongodb ---
      await otpSchema.insertMany(storeOtp)

}


module.exports = sendOtp