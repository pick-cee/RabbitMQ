const { addToQueue } = require('../config/rabbitMq')
const User = require('../models/user.model')
const { hashPassword, comparePassword } = require('../utils/bcrypt')
const { generateTokens, jwtVerifyRefreshToken } = require('../utils/jwt')

const createUser = async (request, response) => {
    const createdUser = request.body
    const plainPassword = request.body.password
    const hashPass = await hashPassword(plainPassword)
    const userExists = await User.findOne({ email: createdUser.email })
    if (userExists) {
        return response.status(400).json({ message: `User with ${createdUser.email} already exists` })
    }

    await User.create({ ...createdUser, password: hashPass }).then(async (user) => {
        addToQueue('user-created', { userId: user._id })

        return response.status(201).json({ user })
    })
}

const loginUser = async (request, response) => {
    try {
        const { email, password } = request.body
        const user = await User.findOne({ email: email })
        if (!user) {
            return response.status(404).json({ message: "User not found" })
        }
        const passwordMatch = await comparePassword(password, user.password)
        if (!passwordMatch) {
            return response.status(400).json({ message: "Password does not match" })
        }
        const { accessToken, refreshToken } = await generateTokens(user)
        await addToQueue('user-logged-in', { userId: user._id })
        response.cookie('refreshToken', refreshToken, {
            httpOnly: true
        })
        return response.status(200).json({
            message: 'Logged in successfully',
            accessToken,
            refreshToken,
            success: true
        })

    }
    catch (err) {
        return response.status(500).json({ message: err })
    }
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

const updateLoginTime = async (userId) => {

    await User.findOneAndUpdate({ _id: userId }, { $set: { lastLogin: Date.now() } })
}

const getUserProfile = async (request, response) => {
    try {
        console.log("user", request)
        const userId = request.user
        console.log(request.user)
        const user = await User.findOne({ _id: userId })
        if (user === null) {
            return response.status(404).json({ message: "User details not found. Try log to in or register" })
        }

        return response.status(200).json({ user })
    }
    catch (err) {
        return response.status(500).json({ message: err.message })
    }
}

const generateNewAccessToken = async (request, response) => {
    const oldRefreshToken = request.cookies.refreshToken
    if (!oldRefreshToken) {
        return response.status(400).json({ message: "No refresh token, please login again" })
    }
    const validateOldRefresh = await jwtVerifyRefreshToken(oldRefreshToken)
    if (validateOldRefresh) {
        const user = validateOldRefresh
        const { accessToken, refreshToken } = await generateTokens(user)

        response.cookie('refreshToken', refreshToken, {
            httpOnly: true
        })
        return response.status(200).json({
            message: 'Generated successfully',
            accessToken,
            refreshToken,
            success: true
        })
    }
}

module.exports = {
    createUser, deleteUser, loginUser, updateLoginTime, getUserProfile, generateNewAccessToken

}