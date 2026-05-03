const expert = require('../models/experts_registration');
const expert_message = require('../models/expert_message')

module.exports.registration = async function (req, res) {
    try {
        expert.findOne({ Email: req.body.Email }, async function (err, expert_present) {
            if (err) {
                console.log(err);
                return res.json({
                    error: "Something went wrong",
                    status: "error"
                });
            }
            if (expert_present) {
                return res.json({
                    status: "error",
                    error: "Expert allready present"
                });
            }
            else {
                const newdata = await expert.create(req.body);
                return res.json({
                    status: "ok",
                    result: "Congratulation"
                })
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

module.exports.expertlogin = function (req, res) {
    try {

        expert.findOne({ Email: req.body.Email }, function (err, expert_data) {
            if (err) {
                console.log(err);
                return res.json({
                    error: "Something went wrong",
                    status: "error"
                });
            }
            else if (expert_data.Password == req.body.Password) {
                return res.json(expert_data);
            }
            else {
                return res.json({
                    error: "Please enter valid password",
                    status: "error"
                });
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

module.exports.list_of_experts = function (req, res) {
    try {

        expert.find({}, "Email Name", function (err, list) {
            if (err) {
                console.log(err);
                return res.json({
                    error: "Something went wrong",
                    status: "error"
                })
            }
            else {
                return res.json(list);
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

module.exports.list_of_farmers = function (req, res) {
    try {
        expert_message.distinct("Farmerid", { expert_email: req.params.Email }, function (err, data) {
            if (err) {
                console.log(err);
                return res.json({
                    error: "Something went wrong",
                    status: "error"
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
            error: "Something went wrong",
            status: "error"
        })
    }
}