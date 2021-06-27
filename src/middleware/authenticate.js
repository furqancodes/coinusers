const jwt = require('jsonwebtoken')

const User = require('../models/user')

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization.replace('Bearer ', '')

    const decoded = jwt.verify(token, 'superSecret')
    const user = await User.findOne({
      '_id': decoded._id,
      'tokens.token': token,
    })

    if (!user) {
      throw new Error()
    }

    req.token = token
    req.user = user
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${req.user.email}`)
    next()
  } catch (error) {
    console.log(`auth error ${error}`)
    res.status(401).send({error: 'Please authenticate.'})
  }
}

module.exports = authenticate
