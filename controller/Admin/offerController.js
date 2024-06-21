const basePath = '../../'
const categorySchema = require(basePath + 'models/category')
const turfSchema = require(basePath + 'models/turfs')
const offerSchema = require(basePath + 'models/offer')


const today = new Date().toISOString().split('T')[0];


const { json } = require("body-parser")




// const turfOfferpage = async (req, res) => {
//     try {
//         // ------ getting query id and find specific turf for adding offer ------
//         let id = req.query._id
//         const turf = await turfSchema.findOne({ _id: id })
//         res.render('turfOffer', { id, turf })
//     } catch (error) {
//         console.log(error.message)
//     }
// }

// // ------ Check entered offer details ------
// const checkTurfOffer = async (req, res) => {
//     try {
//         let data = req.query  // -- Entered offer name, percentage, date, turfId --
//         res.send({ success: true, data })
//     } catch (error) {
//         console.log(error.message)
//     }
// }

// const turfOfferSuccess = async (req, res) => {
//     try {
//         // ------ Convert query json to object -------
//         const data = JSON.parse(req.query.data)
//         // ------ Convert percentage to mathemetical form -----
//         const p = data.percentage/100
//         // ------ Add offer details of schema -------
//         // - Adding offerDetails { name, percentage, date } & offerPrice on every slots(times) -
//         await turfSchema.updateOne(
//             { _id: data.id },
//             [
//             {
//                 $set: {
//                     "time": {
//                         $map: {
//                             input: "$time",
//                             as: "t",
//                             in: {
//                                 $mergeObjects: [
//                                     "$$t",
//                                     { 
//                                         "offerPrice": { 
//                                             $subtract: [
//                                                 { $toDouble: "$$t.cash" }, 
//                                                 { $multiply: [{ $toDouble: "$$t.cash" }, p] } 
//                                             ] 
//                                         }
//                                     }
//                                 ]
//                             }
//                         }
//                     },
//                         "offerDetails": {
//                             name: data.name,
//                             percentage: data.percentage,
//                             expiryDate: data.date
//                         }
//                     }
//                 }
//             ]
//         );
//         // ---- Redirect on turfs page ----
//         res.redirect('/admin-turf')
//     } catch (error) {
//         console.log(error.message)
//     }
// }



// const categoryOfferPage = async (req, res) => {
//     try {
//         // ------ getting query id and find specific category for adding offer ------
//         let id = req.query.id
//         const category = await categorySchema.findOne({ _id: id })
//         res.render('categoryOffer', { id, category })
//     } catch (error) {
//         console.log(error.message)
//     }
// }

// // ------ Check entered offer details ------
// const categoryOfferCheck = async (req, res) => {
//     try {
//         let data = req.query
//         res.send({ success: true, data })
//     } catch (error) {
//         console.log(error.message)
//     }
// }


// const categoryOfferSuccess = async (req, res) => {
//     try {
//         // ------ Convert query json to object -------
//         const data = JSON.parse(req.query.data)
//         // ---- adding offer details on category ----
//         const category = await categorySchema.findOneAndUpdate({ _id: data.id }, {"offerDetails": {
//             name: data.name,
//             percentage: data.percentage,
//             expiryDate: data.date
//         }})
//         // ------ Convert percentage to mathemetical form -----
//         const p = data.percentage/100
//         // ---- adding offer details on category only if category offer percentage is more than turf offer percentage ----
//         // - Adding offerDetails { name, percentage, date } & offerPrice on every slots(times) -
//         await turfSchema.updateMany(
//             { court: category.name, "offerDetails.percentage": { $lt: data.percentage } },
//             [
//             {
//                 $set: {
//                     "time": {
//                         $map: {
//                             input: "$time",
//                             as: "t",
//                             in: {
//                                 $mergeObjects: [
//                                     "$$t",
//                                     { 
//                                         "offerPrice": { 
//                                             $subtract: [
//                                                 { $toDouble: "$$t.cash" }, 
//                                                 { $multiply: [{ $toDouble: "$$t.cash" }, p] } 
//                                             ] 
//                                         }
//                                     }
//                                 ]
//                             }
//                         }
//                     },
//                         "offerDetails": {
//                             name: data.name,
//                             percentage: data.percentage,
//                             expiryDate: data.date
//                         }
//                     }
//                 }
//             ]
//         );

//         res.redirect('/admin-category')
//     } catch (error) {
//         console.log(error.message)
//     }
// }


const offerpage = async (req,res) => {
    try {
        await offerSchema.updateMany({ expiredAt: { $lte: today } }, { status: "Expired" })
        const offers = await offerSchema.find({})
        res.render('offer', { offers })
    } catch (error) {
        console.log(error.message)
    }
}

const addOfferpage = async (req,res) => {
    try {
        const categories = await categorySchema.find({})
        const turfs = await turfSchema.find({})
        res.render('addOffer', { categories, turfs })
    } catch (error) {
        console.log(error.message)
    }
}

const checkOffer = async (req,res) => {
    try {
        const data = req.query
        let message;
        const check = await offerSchema.find({ typeId: data.typeId, status: 'Valid' })

        if(data.name.length < 3 || data.name.length > 21) {
            message = 'Name length is 3 to 20'
            res.send({ message })
        } else if(data.percentage < 1 || data.percentage > 91) {
            message = 'percentage must between 1 to 90'
            res.send({ message })
        } else if(check.length > 0) {
            message = 'Offer type already added'
            res.send({ message })
        } else if(data.expiredAt <= today) {
            message = 'Enter valid date'
            res.send({ message })
        } else {
            res.send({ data, success: true })
        }

    } catch (error) {
        console.log(error.message)
    }
}

const checkOfferSuccess = async (req,res) => {
    try {
        const data = JSON.parse(req.query.data)
        data.status = 'Valid'
        await offerSchema.insertMany(data)
        res.redirect('/admin-offerPage')
    } catch (error) {
        console.log(error.message)
    }
}

const offerEditPage = async (req,res) => {
    try {
        offer = await offerSchema.findOne({ _id: req.query.id })
        const year = offer.expiredAt.getFullYear();
        const month = ("0" + (offer.expiredAt.getMonth() + 1)).slice(-2); // Adding 1 to month since it's zero-based
        const day = ("0" + offer.expiredAt.getDate()).slice(-2);
        const expiryDate = `${year}-${month}-${day}`

        res.render('editOffer', { offer, expiryDate })
    } catch (error) {
        console.log(error.message)
    }
}

const offerEditCheck = async (req,res) => {
    try {
        const data = req.query
        if(data.name.length < 3 || data.name.length > 21) {
            message = 'Name length is 3 to 20'
            res.send({ message })
        } else if(data.percentage < 1 || data.percentage > 91) {
            message = 'percentage must between 1 to 90'
            res.send({ message })
        } else if(data.expiredAt < today) {
            message = 'Enter valid date'
            res.send({ message })
        } else {
            res.send({ data, success: true })
        }
    } catch (error) {
        console.log(error.message)
    }
}

const offerEditCheckSuccess = async (req,res) => {
    try {
        const data = JSON.parse(req.query.data)
        data.status = 'Valid'
        const id = data.id
        delete data.id;
        await offerSchema.updateMany({ _id: id }, data)
        res.redirect('/admin-offerPage')
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    offerpage,
    addOfferpage,
    checkOffer,
    checkOfferSuccess,
    offerEditPage,
    offerEditCheck,
    offerEditCheckSuccess
    // turfOfferSuccess,
    // categoryOfferPage,
    // categoryOfferCheck,
    // categoryOfferSuccess
}