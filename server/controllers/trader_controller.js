const trader_details = require('../models/trader_details');
const GST_details = require('../models/GST_details')
const bill = require('../models/bill');

module.exports.trader_registration = async function (req, res) {
    try {
        trader_details.findOne({ GST_No: req.body.GST_No }, function (err, present) {
            if (err) {
                console.log(err);
                return res.json({
                    error: "Something went wrong",
                    status: "error"
                })
            }
            else {
                if (present) {
                    return res.json({
                        error: "Trader allready registered",
                        status: "error"
                    })
                }
                else {
                    trader_details.create(req.body);
                    return res.json({
                        status: "ok"
                    })
                }
            }
        })

    }
    catch (err) {
        console.log(err);
        return res.json({
            error: "Something went wrong",
            status: "error"
        })
    }
}

module.exports.get_trader_details = function (req, res) {
    try {

        GST_details.findOne({ GST_No: req.params.GST_No }, function (err, email) {
            if (err) {
                console.log(err);
                return res.json({
                    error: "Something went wrong",
                    status: "error"
                })
            }
            else {
                return res.json(email)
            }
        })
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: "Something went wrong",
            status: "error"
        })
    }
}

module.exports.trader_login = function (req, res) {
    try {
        if (req.body.GST_No && req.body.Password) {
            trader_details.findOne({ GST_No: req.body.GST_No }, function (err, trader) {
                if (!trader) {
                    return res.json({
                        status: "error",
                        error: "User is not found!!!"
                    });
                }
                else {
                    if (req.body.Password == trader.Password) {
                        var userobg = trader.toObject();
                        delete userobg.Password;
                        return res.status(200).json(userobg);
                    }
                    else {
                        return res.json({
                            error: "Password is incorrect!!!",
                            status: "error"
                        });
                    }
                }
            });
        }
        else {
            return res.json({
                error: "Some problem in required Fields!!!",
                status: "error"
            });
        }
    }
    catch (err) {
        console.log(err);
        return res.json({
            status: "error",
            error: "Something went wrong"
        })
    }
}

module.exports.create_bill = async function (req, res) {
    try {
        console.log(req.body);
        const newdata = await bill.create(req.body);
        return res.json({
            status: "ok",
            data: newdata
        })
    }
    catch (err) {
        console.log(err);
        return res.json({
            status: "error",
            error: "Something went wrong"
        })
    }

}

module.exports.listofbill_trader = function (req, res) {    
    try {

        bill.find({ GST_No: req.params.GST_No, Bill_type : req.params.Bill_type }, function (err, data) {
            if (err) {
                console.log(err);
                return res.json({
                    status: "error",
                    error: "Something went wrong"
                })
            }
            else {
                return res.json(data);
            }
        })
    }
    catch (err) {
        console.log(err);
        return res.json({
            status: "error",
            error: "Something went wrong"
        })
    }
}