const APMC = require('../models/APMC_login');
const bill = require('../models/bill');
const GST_details = require('../models/GST_details');

module.exports.login = function (req, res) {
    if (req.body.Username && req.body.Password) {
        try {
            APMC.findOne({ Username: req.body.Username }, function (err, user) {
                if (!user) {
                    console.log(err);
                    return res.json({
                        status: "error",
                        error: "User is not found!!!"
                    });
                }
                else {
                    if (req.body.Password == user.Password) {
                        var userobg = user.toObject();
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
        } catch (error) {
            return res.json({
                status: "error",
                error: "Something went wrong please try after some time !!!"
            });
        }
    }
    else {
        return res.json({
            error: "Some problem in required Fields!!!",
            status: "error"
        });
    }
}

module.exports.getall_traders = function(req,res)
{
    try{
      GST_details.find({},function(err,data)
      {
        if(err)
        {
            console.log(err);
            return res.json({
                status: "error",
                error: "Something went wrong"
            });
        }
        else{
            return res.json(data);
        }
      })  
    }
    catch(err)
    {
        console.log(err);
                    return res.json({
                        status: "error",
                        error: "Something went wrong"
                    });
    }
}

module.exports.bills_of_trader = function(req,res)
{
    try{
        bill.find({GST_No : req.params.GST_No , Bill_type : req.params.Bill_type},function(err,data)
        {
            if(err)
            {
                console.log(err);
                    return res.json({
                        status: "error",
                        error: "Something went wrong"
                    });
            }
            else{
                return res.json(data);
            }
        })
    }
    catch(err)
    {
        console.log(err);
                    return res.json({
                        status: "error",
                        error: "Something went wrong"
                    });
    }
}

// module.exports.dates = async function(req,res)
// {
//     let dates = await bill.distinct("Bill_date");
//     // let final =[]
//     // for(let i=0;i<dates.length;i++)
//     // {
//     //     let d = new Date(dates[i]);
//     //     final.push(d.toLocaleDateString());
//     // }
//     return res.json(dates);
// }

module.exports.day_wise_APMC = async function(req,res)
{
    try{
        let dates = await bill.distinct("Bill_date");
    
        let final_data = [];
    
        for(let i=0;i<dates.length;i++)
        {
            let databuy= await bill.find({Bill_date : dates[i] , Bill_type : "Buyer"}).sort({Rate : 1});
            let datasell= await bill.find({Bill_date : dates[i] , Bill_type : "Seller"}).sort({Rate : 1});
            let total_buy = 0;
            let total_sell = 0;
            // let total_sell =0;
            // console.log(data)
            let max_buy =databuy[databuy.length-1].Rate ;
            let min_buy = databuy[0].Rate;

            let max_buy_GST =databuy[databuy.length-1].GST_No ;
            let min_buy_GST = databuy[0].GST_No;

            let max_sell =datasell[datasell.length-1].Rate ;
            let min_sell = datasell[0].Rate;

            let max_sell_GST =datasell[datasell.length-1].GST_No ;
            let min_sell_GST = datasell[0].GST_No;
    
            for(let j=0;j<databuy.length;j++)
            {
                total_buy = databuy[i].Bags + total_buy
            }

            for(let j=0;j<datasell.length;j++)
            {
                total_sell = datasell[i].Bags + total_sell
            }
    
            let p ={
    
            }
            p["Date"] = dates[i]
            p["max_buy"] = max_buy
            p["min_buy"] = min_buy
            p["max_sell"] = max_sell
            p["min_sell"] = min_sell
            p["total_buy"] = total_buy
            p["total_sell"] = total_sell
            p["max_buy_GST"] = max_buy_GST
            p["min_buy_GST"] = min_buy_GST
            p["max_sell_GST"] = max_sell_GST
            p["min_sell_GST"] = min_sell_GST

            
            final_data.push(p);
    
        }
        return res.json(final_data);
    }
    catch(err)
    {
        console.log(err);
        return res.send({
            status: "error",
            error: "Something went wrong please try again after some time"
        });
    }
}