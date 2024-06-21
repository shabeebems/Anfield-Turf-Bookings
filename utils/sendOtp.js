const nodemailer = require('nodemailer')
const otpSchema = require('../models/otp')


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
        html: `<b>otp is ${otp}</b>`, // html body
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