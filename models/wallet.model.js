const mongoose = require("mongoose")

const WalletSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'user'
    },
    balance: {
        type: String,
        default: 0
    },
}, { timestamps: true, timeseries: true })

module.exports = mongoose.model("Wallet", WalletSchema)