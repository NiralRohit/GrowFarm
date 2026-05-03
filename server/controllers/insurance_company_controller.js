const insurance = require('../models/insurance_company');

module.exports.insurance_company_login = function (req, res) {
    try {
        insurance.findOne({ Username: req.body.Username }, function (err, data) {
            if (!data) {
                console.log(err);
                return res.json({
                    error: "User not found",
                    status: "error"
                });
            }
            else {
                if (data.Password == req.body.Password) {
                    var userobg = data.toObject();
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
        })
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: "User not found",
            status: "error"
        });
    }
}