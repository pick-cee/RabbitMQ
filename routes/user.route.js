const { createUser, deleteUser, loginUser, generateNewAccessToken } = require('../controller/user.controller')
const { verifyUser } = require('../utils/jwt')

const router = require('express').Router()

router.post('/user', createUser)
router.delete('/user', deleteUser)
router.post('/login', loginUser)
router.post('/refresh', generateNewAccessToken)

module.exports = router