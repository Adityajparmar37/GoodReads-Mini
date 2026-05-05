import { processPendingPosts } from "../services/cronJob.js";

// Run cron job every 5 minutes
export const setupCronJob = () => {
  const INTERVAL = 5 * 60 * 1000; // 5 minutes

  setInterval(async () => {
    await processPendingPosts();
  }, INTERVAL);

  console.log("Cron job scheduled to run every 5 minutes");
};
