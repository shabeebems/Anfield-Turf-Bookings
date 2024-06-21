const basePath = '../../'
const orderSchema = require(basePath + 'models/order')


// ----- Rendering order page -----
const orderPage = async(req, res) => {
    try {
        let users = []

        // ---- Finding all orders for show ---- 
        const findorders = await orderSchema.find({})

        // ---- Took all ordered details ----
        const orders = findorders.flatMap(order => order.turfDetails)
        // ---- Sort with order placed date(decending order) ----
        orders.sort((a, b) => new Date(b.orderedDate) - new Date(a.orderedDate))
        
        // ---- Populate sorted userId and push users names to users array ----
        for(let i = 0; i < orders.length; i++) {
            const user = await orderSchema.findOne({ "turfDetails._id": orders[i]._id }).populate("userId")
            users.push(user.userId.name)
        }
        res.render('orders', { orders, users })
    } catch (error) { 
        console.log(error.message);
    }
}

module.exports = {
    orderPage,
    // checkReport,
    // reportDownload
}