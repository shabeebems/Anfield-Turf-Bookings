const basePath = '../../'
const categorySchema = require(basePath + 'models/category')
const turfSchema = require(basePath + 'models/turfs')


const category = async (req, res) => {
    try {
        // ------ Filter all categories ------
        const categories = await categorySchema.find({})
        res.render('Category',{ categories })
    } catch (error) {
        console.log(error.message)
    }
}

const addCategory = async (req, res) => {
    try {
        res.render('addCategory')
    } catch (error) {
        console.log(error.message)
    }
}

const insertCategory = async (req, res) => {
    try {
        // ----- Store entered category to data -----
        const data = {
            name:req.body.name,
            block:false
        }
        // ----- Check entered name is exist ------
        const name = new RegExp("^" + data.name + "$", "i");
        const duplicate = await categorySchema.findOne({ name: name })
        if (duplicate) {
            // ---- If entered category is already exist ----
            res.render('addCategory', { duplicate })
        } else {
            // ---- Creating new category ----
            await categorySchema.create(data)
        }
        res.redirect('/admin-category')
    } catch (error) {
        console.log(error.message)
    }
}
const blockCategory = async (req, res) => {
    try {
        // ----- Find user category on query.id for block/unblock -----
        const category = await categorySchema.findOne({ _id: req.query.id })
        // ----- Convert block/unblock -----
        category.block =! category.block
        category.save()   
        res.redirect('/admin-category')
    } catch (error) {
        console.log(error.message)
    }
}

// ------ Filter turfs based on categories -------
const filterTurfCategory = async (req, res) => {
    try {
        // ------ Find category in query -----
        const category = await categorySchema.findOne({ _id: req.query.id })
        // ------ Filter turfs based on categories -------
        const turf = await turfSchema.find({ _id: { $in: category.childTurfs }})
        res.render('Turfs',{ turf })
    } catch (error) {
        console.log(error.message)
    }
}

const editCategory = async (req, res) => {
    try {
        // ------ Find category in query -----
        const category = await categorySchema.findOne({ _id: req.query.id })
        res.render('editCategory', { category })
    } catch (error) {
        console.log(error.message)
    }
}

const updatingCategory = async (req, res) => {
    try {
        // ------ Find category name is exist -----
        const name = new RegExp("^" + req.query.name + "$", "i");
        const check = await categorySchema.findOne({ name: name })
        if (check && check._id != req.query.id) {
            // ---- If entered category is already exist ----
            const message = 'Category already exist'
            res.json({ message })
        } else {
            // ------ Updating category ------
            const category = await categorySchema.findOneAndUpdate({ _id: req.query.id }, { name: req.query.name })
            // ------ Updating all turf's category names ------
            await turfSchema.updateMany({ _id: { $in: category.childTurfs} }, { court: req.query.name })
            res.json({ success:true })
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    category,
    addCategory,
    insertCategory,
    blockCategory,
    filterTurfCategory,
    editCategory,
    updatingCategory
}