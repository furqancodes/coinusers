require('dotenv').config()
const config = require('../config')


const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");

const cors = require("cors");
const app = express();
// app.use((req, res, next) => {
//     if (req.method === 'GET') {
//         res.send('GET requests are disabled')
//     } else {
//         next()
//     }
// })

// app.use((req, res, next) => {
//     res.status(503).send('Site is currently down. Check back soon!')
// })
app.use(cors());

app.use(express.json());
app.use(userRouter);

app.listen(config.DEFAULT_PORT, () => {
  console.log(`listening on ${config.URL}`);
});
