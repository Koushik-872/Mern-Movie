/**
 * Distributed Queue System for Lazy Data Insertion
 * Handles concurrent movie data insertion with batching and rate limiting
 */

class MovieQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.batchSize = 10;
    this.processingInterval = 5000; // Process every 5 seconds
    this.maxRetries = 3;
  }

  /**
   * Add movie data to queue
   * @param {Object} movieData - Movie data to be inserted
   * @param {Function} insertFunction - Function to perform the actual insertion
   */
  enqueue(movieData, insertFunction) {
    const queueItem = {
      data: movieData,
      insertFunction,
      retries: 0,
      timestamp: Date.now()
    };
    
    this.queue.push(queueItem);
    
    // Auto-process if not already processing
    if (!this.processing) {
      this.processQueue();
    }
  }

  /**
   * Process queue items in batches
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      // Process in batches
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, this.batchSize);
        
        // Process batch concurrently
        const promises = batch.map(async (item) => {
          try {
            await item.insertFunction(item.data);
            return { success: true, item };
          } catch (error) {
            // Retry logic
            if (item.retries < this.maxRetries) {
              item.retries++;
              this.queue.push(item); // Re-queue for retry
              return { success: false, item, error };
            }
            console.error(`Failed to process queue item after ${this.maxRetries} retries:`, error);
            return { success: false, item, error };
          }
        });

        await Promise.allSettled(promises);
        
        // Small delay between batches to prevent overwhelming the database
        if (this.queue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error("Error processing queue:", error);
    } finally {
      this.processing = false;
      
      // Schedule next processing if queue has items
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), this.processingInterval);
      }
    }
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      batchSize: this.batchSize
    };
  }

  /**
   * Clear queue (useful for testing)
   */
  clear() {
    this.queue = [];
  }
}

// Export singleton instance
export const movieQueue = new MovieQueue();
