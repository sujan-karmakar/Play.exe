const Joi = require("joi");

module.exports.userSchema = Joi.object({
    user : Joi.object({
        username: Joi.string().required(),
        email: Joi.string().required()
    }).required()
});