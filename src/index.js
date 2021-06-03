const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");

const cors = require("cors");
const app = express();
const port = process.env.PORT || 8080;

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

app.use(express.json());
app.use(userRouter);
app.use(cors());

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
