const jwt = require('jsonwebtoken')
require('dotenv').config()

const generateTokens = async (user) => {
    try {
        const payload = {
            _id: user._id,
            firstName: user.firstName,
            email: user.email,
            lastName: user.lastName
        }
        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.EXPIRY_TIME_ACCESS }
        )
        const refreshToken = jwt.sign(
            payload,
            process.env.JWT_REFRESH_KEY,
            { expiresIn: process.env.EXPIRY_TIME_REFRESH }
        )

        return Promise.resolve({ accessToken, refreshToken })
    }
    catch (err) {
        return Promise.reject(err)
    }

}

const jwtVerifyAcessToken = async (token) => {
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY)
    }
    catch (err) {
        console.log("access", err.message)
    }
}

const jwtVerifyRefreshToken = async (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_KEY)
    }
    catch (err) {
        console.log("refresh", err.message)
    }
}

const verifyUser = async (request, response, next) => {
    try {
        const authHeader = request.headers.token
        let result;
        if (authHeader) {
            const token = authHeader.split(" ")[1]
            result = await jwtVerifyAcessToken(token)

            if (!result) {
                return response.status(400).json({ message: "Please login again" })
            }
            else {
                request.user = result
                return next()
            }
        }
        else {
            return response.status(400).json({ message: "An access token is required to proceed, please login to get one" })
        }
    }
    catch (err) {
        return response.status(500).json({ message: "An error occured", Error: err.message })
    }
}



module.exports = {
    generateTokens, jwtVerifyAcessToken, jwtVerifyRefreshToken, verifyUser
}