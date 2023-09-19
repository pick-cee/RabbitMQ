const { createUser, deleteUser } = require('../controller/user.controller')

const router = require('express').Router()

router.post('/user', createUser)
router.delete('/user', deleteUser)

module.exports = router