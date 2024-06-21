const basePath = '../../'
const categorySchema = require(basePath + 'models/category')
const turfSchema = require(basePath + 'models/turfs')

const turf = async (req, res) => {
    try {
        // ------ Show all turfs ------
        const turf = await turfSchema.find({})
        res.render('Turfs', { turf })
    } catch (error) {
        console.log(error.message)
    }
}

const addTurf = async (req, res) => {
    try {
        // ------ Find all categories for entering new turf categories ------
        const court = await categorySchema.find({})
        // ---- Rendering addTurf page ----
        res.render('addTurf', { court })
    } catch (error) {
        console.log(error.message)
    }
}

// ----- Inserting turf details on mongoDb -----
const insertTurf = async (req, res) => {
    try {
        const court = await categorySchema.find({})
        const body = req.body
        if(body.name.length < 3 || body.name.length > 20){
            const message = 'Adjust name length between 3 to 20'
            res.render('addTurf', { court, message })
        } else if(body.location.length < 3 || body.location.length > 20){
            const message = 'Adjust location length between 3 to 20'
            res.render('addTurf', { court, message })
        } else if(body.city.length < 3 || body.city.length > 20){
            const message = 'Adjust city length between 3 to 20'
            res.render('addTurf', { court, message })
        } else {
            const data = {
                name: req.body.name,
                location: req.body.location,
                city: req.body.city,
                court: req.body.court,
                block: false,
                image: req.files.map(file=>file.filename)
            }
            const newTurf = await turfSchema.create(data)
            // ----- Add turfId on childTurf field on category db -----
            await categorySchema.findOneAndUpdate({ name: req.body.court }, { $push: { childTurfs: newTurf._id }})
            res.redirect('/admin-turf')
        }

        
    } catch (error) {
        console.log(error.message)
    }
}

const addTime = async (req, res ) => {
    try {
        // ------ Find editing turf ------
        const court = await turfSchema.findOne({ _id: req.query._id })
        res.render('addTime', { court })
    } catch (error) {
        console.log(error.message)
    }
}


const saveTimeSlots = async (req, res) => {
    try {
        // ----- Storing entered times on a variable -----
        const timeSlots = req.body.timeSlots
        // ------ Adding timeSlots ------
        await turfSchema.findOneAndUpdate({ _id: req.query._id }, { $set: { time: timeSlots }})
        res.sendStatus(200)
    } catch (error) {
        console.error(error.message);
        res.sendStatus(500)
    }
}

const blockTurf = async (req, res) => {
    try {
        const {id} = req.query
        // ----- Find turf for block/unblock ---
        const block = await turfSchema.findOne({ _id: id })
        // ----- Convert block/unblock -----
        block.block =! block.block
        block.save()
        res.redirect('/admin-turf')
    } catch (error) {
        console.log(error.message)
    }
}

const editTurf = async (req, res) => {
    try {
        // ----- Find turf for editing -----
        const turf = await turfSchema.findOne({ _id: req.query._id })
        // ----- Find category of turf (for set first section) -----
        const court = await categorySchema.find({ name: { $ne: turf.court }})
        res.render('editTurf', { turf, court })
    } catch (error) {
        console.log(error.message)
    }
}

const updatingTurf = async (req, res) => {
    try {
        // ----- Store edited datas -----
        const data = {
            name: req.body.name,
            location: req.body.location,
            city: req.body.city,
            court: req.body.court
        }
        // ----- Check image input -----
        if (req.files.length == 0) {
            // ----- Editing without image -----
            await turfSchema.findOneAndUpdate({ _id: req.query._id }, { $set: data })
        } else {
            // ----- Editing with images -----
            data.image = req.files.map(file=>file.filename)
            await turfSchema.findOneAndUpdate({ _id: req.query._id }, { $set: data })
        }
        res.redirect('/admin-turf')
    } catch (error) {
        console.log(error.message)
    }
}

const bookings = async (req, res) => {
    try {
        res.render('bookings')
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    turf,
    addTurf,
    insertTurf,
    addTime,
    saveTimeSlots,
    blockTurf,
    editTurf,
    updatingTurf,
    bookings
}