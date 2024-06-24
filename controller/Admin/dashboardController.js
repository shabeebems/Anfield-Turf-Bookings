const basePath = '../../'
const orderSchema = require(basePath + 'models/order')


const dashboard = async (req, res) => {
    try {
        // ---- Grouping the top booking turfs ----
        const topTurfs = await orderSchema.aggregate([
            { $unwind: '$turfDetails' },  // Unwind the turfDetails array
            { $match: { 'turfDetails.status': 'Success' } },
            { $group: {
                _id: { name: '$turfDetails.name', court: '$turfDetails.court', location: '$turfDetails.location', startingTime: '$turfDetails.startingTime', endingTime: '$turfDetails.endingTime' },
                orderCount: { $sum: 1 }
            }},
            { $sort: { orderCount: -1 } },
            { $limit: 10 },
            { $project: {
                _id: 0,
                turfName: '$_id.name',
                court: '$_id.court',
                location: '$_id.location',
                startingTime: '$_id.startingTime',
                endingTime: '$_id.endingTime',
                orderCount: 1
            }}
        ]);

        // ---- Grouping the top booking courts ----
        const topCourts = await orderSchema.aggregate([
            { $unwind: '$turfDetails' },
            { $match: { 'turfDetails.status': 'Success' } },
            { $group: {
                _id: '$turfDetails.court',
                orderCount: { $sum: 1 }
            }},
            { $sort: { orderCount: -1 } },
            { $limit: 10 },
            { $project: {
                court: '$_id',
                orderCount: 1
            }}
        ]);
        res.render('index', { topTurfs, topCourts });
    } catch (error) {
        console.log(error.message);
    }
};

const data = async (req, res) => {
    try {
        // ---- Grouping the cancelled and non-cancelled bookings with exact date ----
        const orders = await orderSchema.aggregate([
            { $unwind: '$turfDetails' },
            { $match: { 'turfDetails.status': { $ne: 'Failed' } } },
            {
                $facet: {
                    nonCanceledOrders: [
                        { $match: { 'turfDetails.status': { $eq: 'Success' } } },
                        { $group: {
                                _id: "$turfDetails.orderedDate",
                                totalOrders: { $sum: 1 }
                        } }
                    ],
                    canceledOrders: [
                        { $match: { 'turfDetails.status': { $eq: 'Canceled' } } },
                        { $group: {
                                _id: "$turfDetails.orderedDate",
                                totalOrders: { $sum: 1 }
                        } }
                    ]
                }
            }
        ]);
        
        res.json(orders[0]);
        
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    dashboard,
    data
}