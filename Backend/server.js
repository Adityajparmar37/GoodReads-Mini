import { server } from "./app.js";
import { connectDb, PORT, RESPONSE_QUEUE_URL, STATUS_UPDATE_QUEUE_URL } from "./src/config/index.js";
import { startResponseQueueConsumer, startStatusUpdateQueueConsumer } from "./src/services/aws/sqsConsumer.js";
import { startJobProcessor } from "./src/services/postServices.js";

// Environment variable to control async services
const ENABLE_ASYNC_SERVICES = process.env.ENABLE_ASYNC_SERVICES === 'true';

connectDb()
  .then(() => {
    server.listen(PORT, (err) => {
      //print error in slack
      if (err) console.error("App error ", err);
      console.log(`App listen on ${PORT}`);
      
      // Start async services if enabled
      if (ENABLE_ASYNC_SERVICES) {
        console.log('Starting async microservices...');
        
        // Start SQS consumers
        startResponseQueueConsumer(RESPONSE_QUEUE_URL).catch(error => {
          console.error('Failed to start response queue consumer:', error);
        });
        
        startStatusUpdateQueueConsumer(STATUS_UPDATE_QUEUE_URL).catch(error => {
          console.error('Failed to start status update queue consumer:', error);
        });
        
        // Start job processor
        startJobProcessor().catch(error => {
          console.error('Failed to start job processor:', error);
        });
        
        console.log('Async microservices started successfully');
      } else {
        console.log('Async microservices disabled - using synchronous posting');
      }
    });
  })
  //print error in slack
  .catch((error) => console.error("Server Error ", error));
