const { addToQueue } = require('../config/rabbitMq')
const User = require('../models/user.model')

const createUser = async (request, response) => {
    const createdUser = request.body
    const userExists = await User.findOne({ email: createdUser.email })
    if (userExists) {
        return response.status(400).json({ message: `User with ${createdUser.email} already exists` })
    }

    await User.create(createdUser).then(async (user) => {
        addToQueue('user-created', { userId: user._id })

        return response.status(201).json({ user })
    })
}

const deleteUser = async (request, response) => {
    const userId = request.query.userId
    const userExists = await User.findOne({ _id: userId })
    if (!userExists) {
        return response.status(400).json({ message: `User with ${userId} does not exist` })
    }

    await User.findOne({ _id: userId }).then(async (user) => {
        await addToQueue('user-deleted', { userId: user._id })

        await user.deleteOne(user._id)
        return response.status(204).json({ message: "deleted" })
    })
}

module.exports = { createUser, deleteUser }