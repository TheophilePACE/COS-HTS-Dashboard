'use strict'
// import dependency
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const PricesSchema = new Schema({
    retailerId: String,
    price: Number,
    time: String,
    quantity: Number
})
// export our module to use in server.js
module.exports = mongoose.model('Price', PricesSchema)
