const Wallet = require('../models/wallet.model')
const { ObjectId } = require('mongodb')

const createWallet = async (userId) => {
    await Wallet.findOne({ userId: userId }).lean(true)
        .then((w) => {
            if (w) return w
            return Wallet.create({ userId })
        })
}

const deleteWallet = async (userId) => {
    const walletExists = await Wallet.findOne({ userId: userId })
    await Wallet.findByIdAndDelete({ _id: walletExists._id })
}

module.exports = { createWallet, deleteWallet }