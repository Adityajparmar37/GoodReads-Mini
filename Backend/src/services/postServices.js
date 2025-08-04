import { 
  insertPostJob, 
  findPendingJobs, 
  findJobsForRetry, 
  updatePostJobStatus 
} from "../query/post.js";
import { invokeFacebookLambda, invokeInstagramLambda } from "./aws/lambdaInvoker.js";
import { publishStatusUpdate } from "./aws/sqsPublisher.js";
import { 
  RESPONSE_QUEUE_URL, 
  STATUS_UPDATE_QUEUE_URL, 
  MAX_RETRY_COUNT,
  FACEBOOK_PAGE_ACCESS_TOKEN 
} from "../config/index.js";
import { createId } from "../utils/createId.js";
import { timestamp } from "../utils/timestamp.js";

/**
 * Creates a new post job for async processing
 * @param {object} jobData - Job data
 * @returns {Promise<object>} Job creation result
 */
export const createPostJob = async (jobData) => {
  try {
    const jobId = createId();
    const job = {
      jobId,
      userId: jobData.userId,
      bookId: jobData.bookId,
      platform: jobData.platform,
      postData: jobData.postData,
      jobStatus: 'pending',
      retryCount: 0,
      createdAt: timestamp(),
      updatedAt: timestamp(),
    };

    const result = await insertPostJob(job);
    
    if (result.insertedId) {
      // Publish status update
      await publishStatusUpdate(STATUS_UPDATE_QUEUE_URL, jobId, 'pending');
      
      return {
        success: true,
        jobId,
        insertedId: result.insertedId,
      };
    }
    
    return {
      success: false,
      error: 'Failed to create job',
    };
  } catch (error) {
    console.error('Job creation failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Processes pending post jobs
 * @returns {Promise<object>} Processing result
 */
export const processPendingJobs = async () => {
  try {
    const pendingJobs = await findPendingJobs();
    
    if (pendingJobs.length === 0) {
      return {
        success: true,
        message: 'No pending jobs to process',
        jobsProcessed: 0,
      };
    }

    const results = [];
    
    for (const job of pendingJobs) {
      const result = await processJob(job);
      results.push(result);
    }
    
    return {
      success: true,
      jobsProcessed: pendingJobs.length,
      results,
    };
  } catch (error) {
    console.error('Pending jobs processing failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Processes a single job
 * @param {object} job - Job to process
 * @returns {Promise<object>} Processing result
 */
export const processJob = async (job) => {
  try {
    // Update job status to processing
    await updatePostJobStatus(job.jobId, 'processing');
    await publishStatusUpdate(STATUS_UPDATE_QUEUE_URL, job.jobId, 'processing');

    const jobData = {
      jobId: job.jobId,
      postData: job.postData,
      responseQueueUrl: RESPONSE_QUEUE_URL,
      accessToken: FACEBOOK_PAGE_ACCESS_TOKEN,
    };

    let lambdaResult;
    
    // Determine which Lambda function to invoke based on platform
    if (job.platform === 1) { // Facebook
      lambdaResult = await invokeFacebookLambda(jobData);
    } else if (job.platform === 2) { // Instagram
      lambdaResult = await invokeInstagramLambda(jobData);
    } else {
      throw new Error(`Unsupported platform: ${job.platform}`);
    }

    if (lambdaResult.success) {
      console.log(`Job ${job.jobId} sent to Lambda successfully`);
      return {
        success: true,
        jobId: job.jobId,
        platform: job.platform,
      };
    } else {
      // Update job status to failed
      await updatePostJobStatus(job.jobId, 'failed', lambdaResult.error);
      await publishStatusUpdate(STATUS_UPDATE_QUEUE_URL, job.jobId, 'failed', {
        errorMessage: lambdaResult.error,
      });
      
      return {
        success: false,
        jobId: job.jobId,
        error: lambdaResult.error,
      };
    }
  } catch (error) {
    console.error(`Job processing failed for ${job.jobId}:`, error);
    
    // Update job status to failed
    await updatePostJobStatus(job.jobId, 'failed', error.message);
    await publishStatusUpdate(STATUS_UPDATE_QUEUE_URL, job.jobId, 'failed', {
      errorMessage: error.message,
    });
    
    return {
      success: false,
      jobId: job.jobId,
      error: error.message,
    };
  }
};

/**
 * Processes failed jobs for retry
 * @returns {Promise<object>} Retry processing result
 */
export const processRetryJobs = async () => {
  try {
    const retryJobs = await findJobsForRetry(MAX_RETRY_COUNT);
    
    if (retryJobs.length === 0) {
      return {
        success: true,
        message: 'No jobs to retry',
        jobsRetried: 0,
      };
    }

    const results = [];
    
    for (const job of retryJobs) {
      console.log(`Retrying job ${job.jobId} (attempt ${job.retryCount + 1})`);
      const result = await processJob(job);
      results.push(result);
    }
    
    return {
      success: true,
      jobsRetried: retryJobs.length,
      results,
    };
  } catch (error) {
    console.error('Retry jobs processing failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Creates post jobs for multiple platforms
 * @param {object} jobsData - Array of job data for different platforms
 * @returns {Promise<object>} Batch job creation result
 */
export const createPostJobs = async (jobsData) => {
  try {
    const results = [];
    
    for (const jobData of jobsData) {
      const result = await createPostJob(jobData);
      results.push(result);
    }
    
    const successfulJobs = results.filter(r => r.success);
    const failedJobs = results.filter(r => !r.success);
    
    return {
      success: true,
      totalJobs: results.length,
      successfulJobs: successfulJobs.length,
      failedJobs: failedJobs.length,
      jobIds: successfulJobs.map(r => r.jobId),
      errors: failedJobs.map(r => r.error),
    };
  } catch (error) {
    console.error('Batch job creation failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Starts the job processing service
 * @returns {Promise<void>}
 */
export const startJobProcessor = async () => {
  console.log('Starting post job processor...');
  
  const processJobs = async () => {
    try {
      // Process pending jobs
      await processPendingJobs();
      
      // Process retry jobs
      await processRetryJobs();
    } catch (error) {
      console.error('Job processor error:', error);
    }
    
    // Process jobs every 30 seconds
    setTimeout(processJobs, 30000);
  };
  
  processJobs();
};