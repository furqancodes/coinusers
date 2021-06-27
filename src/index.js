require('dotenv').config()
const express = require('express')
const cors = require('cors')

const config = require('../config')
require('./db/mongoose')
const userRouter = require('./routers/user')

const app = express()
app.use(cors())

app.use(express.json())
app.use(userRouter)

app.listen(config.DEFAULT_PORT, () => {
  console.log(`listening on ${config.COINUSERS_URL}`)
})
