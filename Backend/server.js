import { server } from "./app.js";
import { connectDb, PORT } from "./src/config/index.js";

connectDb()
  .then(() => {
    server.listen(PORT, (err) => {
      //print error in slack
      if (err) console.error("App error ", err);
      console.log(`App listen on ${PORT}`);
    });
  })
  //print error in slack
  .catch((error) => console.error("Server Error ", error));
