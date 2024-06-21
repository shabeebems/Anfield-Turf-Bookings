const basePath = '../../'
const categorySchema = require (basePath + 'models/category')
const turfSchema = require (basePath + 'models/turfs')
const wishlistSchema = require (basePath + 'models/wishlist')


    

// ------- Home page --------
const home = async (req, res) => {
    try {
        // ------ Finding all non-blocked categories & turfs ------ 
        const category = await categorySchema.find({ block: false })
        const avilableCategory = category.map(cat => cat.name)
        const turf = await turfSchema.find({ block: false, court: { $in: avilableCategory } })
        // ------ Finding all cities on filtered turfs ------
        const city = await turf.map((value) => value.city)
        // ------ Picking unique cities ------
        const uniqueCity = await [...new Set(city)]
        res.render('index', { category, turf, uniqueCity })
    } catch (error) {
        console.log(error)
    }
}

// ---- Show turfs based on categories or all turfs ----
const listTurf = async (req, res) => {
    try {
        const user = req.session.user
        const docLimit = 6
        const pageNum = req.query.page*1
        let turfs
        // ----- Storing query to a vatiable -----
        const category = req.query.court
        // ----- Switching categories ------
        switch (category) {
            // ------- Finding all turfs -------
            case 'all':
                const categories = await categorySchema.find({ block: false })
                const avilableCategory = categories.map(cat => cat.name)
                turfCount = await turfSchema.find({ block: false, court: { $in: avilableCategory } }).count()
                turfs = await turfSchema.find({ block: false, court: { $in: avilableCategory } }).skip((pageNum-1)*docLimit).limit(docLimit*1).exec()
                break;
            default:
                // ------- Finding turfs based on query category -------
                turfCount = await turfSchema.find({ $and: [{ court: category },{ block: false }]}).count()
                turfs = await turfSchema.find({ $and: [{ court: category },{ block: false }]}).skip((pageNum-1)*docLimit).limit(docLimit*1).exec()
                break;
            }
            
        let showTurfs = Math.ceil(turfCount/docLimit)
        // ---- Finding cities for searching locations ----

        const wishlist = await wishlistSchema.findOne({ userId: user._id })

        const city = await turfs.map((value) => value.city)
        const uniqueCity = await [...new Set(city)]
        res.render('courts', { turfs, uniqueCity, showTurfs, category, pageNum, wishlist })
    } catch (error) {
        console.log(error.message)
    }
}

// ---- Show selected turf details ----
const turfDetails = async (req, res) => {
    try {

        const dates = [0, 1, 2, 3, 4].map(day => new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        // ------ Finding user selected turf -----
        const turf = await turfSchema.findOne({ _id: req.query.id })

        // ------ Finding all non-blocked turfs for display -----
        const turfs = await turfSchema.find({ block: false })
        // ---- Finding cities for searching locations ----
        const city = await turfs.map((value) => value.city)
        const uniqueCity = await [...new Set(city)]
        res.render('turfDetails', { turf, turfs, uniqueCity, dates })
    } catch (error) {
        console.log(error.message)
    }
}


// ----- Searching turfs based on user entered locations -----
const searchLocation = async (req, res) => {
    try {
        const user = req.session.user

        const docLimit = 6
        const pageNum = req.query.page*1
        // ---- Find turfs user enterde city ----
        turfCount = await turfSchema.find({ city: req.query.city, block: false }).count()
        const turfs = await turfSchema.find({ city: req.query.city, block: false }).skip((pageNum-1)*docLimit).limit(docLimit*1).exec()
        let showTurfs = Math.ceil(turfCount/docLimit)

        // ---- Finding logged user wishlist ----
        const wishlist = await wishlistSchema.findOne({ userId: user._id })

        // ---- Finding cities for searching ----
        const locturfs = await turfSchema.find({ block: false })
        const city = await locturfs.map((value) => value.city)
        const uniqueCity = await [...new Set(city)]
        res.render('courts', { turfs, uniqueCity, showTurfs, pageNum, wishlist })
               
    } catch (error) {
        console.log(error.message)
    }
}



module.exports = {
    listTurf,
    turfDetails,
    home,
    searchLocation
}