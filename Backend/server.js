import app from "./app.js";
import { connectDb } from "./src/config/db.js";

const PORT = process.env.PORT;

connectDb()
  .then(() => {
    app.listen(PORT, (err) => {
      //print error in slack
      if (err) console.error("App error ", err);
      console.log(`App listen on ${PORT}`);
    });
  })
  //print error in slack
  .catch((error) => console.error("Server Error ", error));
