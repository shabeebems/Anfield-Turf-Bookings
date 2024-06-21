const basePath = '../../'
const wishlistSchema = require (basePath + 'models/wishlist')


const addWishlist = async(req, res) => {
    try {
        turfId = req.query.id
        const user = req.session.user
        const wishlist = await wishlistSchema.findOne({ userId: user._id })
        if(wishlist) {
            if(wishlist.turfs.includes(turfId)){
                await wishlistSchema.findOneAndUpdate({ userId: user._id }, { $pull: { turfs: turfId } })
                res.send({ removed: true })
            } else {
                await wishlistSchema.findOneAndUpdate({ userId: user._id }, { $push: { turfs: turfId } })
                res.send({ added: true })
            }
        } else {
            await wishlistSchema.insertMany({ userId: user._id, turfs: [turfId] })
            res.send({ added: true })
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    addWishlist
}