const mongoose = require('mongoose')

const {DATABASE: {URL}} = require('../../config')

mongoose.connect(URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
})
