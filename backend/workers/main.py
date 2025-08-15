#!/usr/bin/env python3
"""
AutoApply Python Workers
Main entry point for Playwright automation workers
"""

import asyncio
import logging
import os
import sys
from pathlib import Path

# Add the workers directory to Python path
workers_dir = Path(__file__).parent
sys.path.insert(0, str(workers_dir))

from core.worker_manager import WorkerManager
from core.queue_consumer import QueueConsumer
from utils.logger import setup_logger

def main():
    """Main function to start the worker system"""
    
    # Setup logging
    logger = setup_logger('autoapply_workers')
    logger.info("🚀 Starting AutoApply Workers")
    
    try:
        # Initialize worker manager
        worker_manager = WorkerManager()
        
        # Initialize queue consumer
        queue_consumer = QueueConsumer(worker_manager)
        
        # Start the main event loop
        asyncio.run(run_workers(worker_manager, queue_consumer, logger))
        
    except KeyboardInterrupt:
        logger.info("🛑 Received shutdown signal")
    except Exception as e:
        logger.error(f"❌ Fatal error: {str(e)}", exc_info=True)
        sys.exit(1)
    finally:
        logger.info("👋 AutoApply Workers shutting down")

async def run_workers(worker_manager, queue_consumer, logger):
    """Run the worker system"""
    
    logger.info("🔄 Starting worker system components")
    
    # Start worker manager
    worker_task = asyncio.create_task(worker_manager.start())
    
    # Start queue consumer
    consumer_task = asyncio.create_task(queue_consumer.start())
    
    # Wait for both tasks
    try:
        await asyncio.gather(worker_task, consumer_task)
    except Exception as e:
        logger.error(f"Error in worker system: {str(e)}", exc_info=True)
        raise
    finally:
        # Cleanup
        await worker_manager.stop()
        await queue_consumer.stop()

if __name__ == "__main__":
    main()
