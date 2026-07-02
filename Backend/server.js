import { server } from "./app.js";
import { connectDb, PORT } from "./src/config/index.js";
import { setupCronJob } from "./src/utils/setupCron.js";

connectDb()
  .then(() => {
    server.listen(PORT, (err) => {
      //print error in slack
      if (err) console.error("App error ", err);
      console.log(`App listen on ${PORT}`);

      // Start cron job for processing queued posts
      // setupCronJob();
    });
  })
  //print error in slack
  .catch((error) => console.error("Server Error ", error));
