const basePath = '../../'
const orderSchema = require(basePath + 'models/order')
const { name } = require('ejs')
const excelJS = require('exceljs')
const PDFDocument = require('pdfkit');

// ----- Rendering order page -----
const reportPage = async(req, res) => {
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
        res.render('reports', { orders, users })
    } catch (error) {
        console.log(error.message);
    }
}


const checkReport = async(req, res) => {
    try {
        // ---- Getting all details, the report is (monthly, weekly, yearly) ----
        const { report, startDate, endDate } = req.query
        let startingDate;
        let endingDate;
        
        if(startDate.length !== 0 && endDate !== 0){
            // ---- If admin endered starting date and ending date ----
            startingDate = startDate
            endingDate = endDate
        } else {
            switch (report) {
                case 'week':
                    startingDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
                case 'month':
                    startingDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
                case 'year':
                    startingDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];
                    break;    
                default:
                    break;
            }
            endingDate = new Date().toISOString().split('T')[0];
        }
        
        res.send({ startingDate, endingDate })

    } catch (error) {
        console.log(error.message);
    }
}

const reportDownload = async(req, res) => {
    try {
        const users = JSON.parse(req.query.users);
        const orders = JSON.parse(req.query.orders);
        const startingDate = req.query.start
        const endingDate = req.query.end

        
        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report')
        
        worksheet.columns = [
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Customer', key: 'name', width: 20 },
            { header: 'Turf', key: 'turf', width: 20 },
            { header: 'Time', key: 'time', width: 20 },
            { header: 'Offer', key: 'offer', width: 20 },
            { header: 'Coupon', key: 'coupon', width: 20 },
            { header: 'Amount', key: 'amount', width: 20 },
            { header: 'Slot date', key: 'slotDate', width: 20 }
        ]
        
        for(let i = 0; i < users.length; i++) {
            if(endingDate >= orders[i].orderedDate && startingDate <= orders[i].orderedDate && orders[i].status !== 'Canceled'){
                const order = {
                    date: orders[i].orderedDate,       
                    name: users[i],         
                    turf: orders[i].name,
                    time: orders[i].startingTime + ' to ' + orders[i].endingTime,
                    offer: orders[i].offer,
                    coupon: orders[i].couponDiscount,
                    amount: orders[i].cash,
                    slotDate: orders[i].slotBookDate   
                };
                worksheet.addRow(order);
            }
        }

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
        );
        res.setHeader("Content-Disposition", `attachment;filename=orders.xlsx`);

        return workbook.xlsx.write(res).then(() => {
            res.status(200);
        })

    } catch (error) {
        console.log(error.message)
    }
}



  
const pdfDownload = async(req, res) => {
   try {
        const users = JSON.parse(req.query.users)
        const orders = JSON.parse(req.query.orders)
        const startingDate = req.query.start
        const endingDate = req.query.end

        // ---- Creating a new PDF document
        const doc = new PDFDocument({ margin: 30 })

        // ---- Creating a file name
        res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
        res.setHeader('Content-Type', 'application/pdf');

        // ---- Pipe the PDF document to the response
        doc.pipe(res);

        // ---- Add Heading to the PDF
        doc.fontSize(20).text('Report', {
            align: 'center'
        });

        //   doc.moveDown().fontSize(18).text('');

        // Table data
        const tableData = [
            // ---- This is headings
            ['Date', 'Customer', 'Turf', 'Time', 'Offer', 'Coupon', 'Amount', 'Slot date']
        ]

        for(let i = 0; i < users.length; i++) {
            if(endingDate >= orders[i].orderedDate && startingDate <= orders[i].orderedDate && orders[i].status !== 'Canceled'){
                const order = [
                    orders[i].orderedDate,       
                    users[i],         
                    orders[i].name,
                    orders[i].startingTime + ' to ' + orders[i].endingTime,
                    orders[i].offer,
                    orders[i].couponDiscount,
                    orders[i].cash,
                    orders[i].slotBookDate 
                ];
                // ---- Pushing a row
                tableData.push(order);
            }
        }

        // ---- Helper function to draw a table
        function drawTable(doc, startX, startY, rowHeight, tableData) {
            // ---- Coloumn widths
            const colWidths = [70, 70, 70, 70, 70, 70, 70, 70];

            // Draw header
            doc.fontSize(12).font('Helvetica-Bold');
            tableData[0].forEach((header, i) => {
            doc.text(header, startX + i * colWidths[i] + 5, startY + 5, { width: colWidths[i] - 10, align: 'left' });
            });

            // Draw rows
            doc.font('Helvetica');
            for (let i = 1; i < tableData.length; i++) {
                const rowY = startY + i * rowHeight;
                tableData[i].forEach((cell, j) => {
                    doc.text(cell, startX + j * colWidths[j] + 5, rowY + 5, { width: colWidths[j] - 10, align: 'left' });
                }); 
            }

            // Draw table borders
            doc.lineWidth(1);

            // Draw header border
            doc.rect(startX, startY, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();

            // Draw row borders
            for (let i = 1; i < tableData.length; i++) {
                const rowY = startY + i * rowHeight;
                doc.rect(startX, rowY, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
            }

            // Draw column borders
            let x = startX;
            colWidths.forEach(width => {
            doc.moveTo(x, startY).lineTo(x, startY + rowHeight * tableData.length).stroke();
            x += width;
            });

            // Draw rightmost border
            doc.moveTo(x, startY).lineTo(x, startY + rowHeight * tableData.length).stroke();
        }

        // Draw the table in the PDF
        drawTable(doc, 50, 200, 30, tableData);

        // Finalize the PDF and end the stream
        doc.end();
    } catch (error) {
            console.log(error.message)
    }
}



module.exports = {
    reportPage,
    checkReport,
    reportDownload,
    pdfDownload
}