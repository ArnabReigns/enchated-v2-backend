const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb://roundhouse.proxy.rlwy.net:14823",
    {
      dbName: "Chat",
      auth: {
        username: "mongo",
        password: "-fF15eA6CGFhH44Cb-BEEC61DE5BA-c2",
      },
    }
  )
  .then((res) => console.log("connected to db"))
  .catch((err) => console.log(err));
