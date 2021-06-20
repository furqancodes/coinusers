const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://admin:TrtZCuSISXnkH6Ru@cluster0.lfwbr.mongodb.net/coinusers?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
