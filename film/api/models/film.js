const mongoose = require("mongoose")

const filmSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    type: String
})

module.exports = mongoose.model('Film', filmSchema)