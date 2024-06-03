import { schemaComposer } from 'graphql-compose';
import moment from 'moment';
import Bottleneck from 'bottleneck';
import { DailyEnergyConsumptionTC } from '../../types/dailyEnergyConsumption';
import { getLatestBlock, getBlocksForDay, getBlockData } from '../../../api/blockchain';
import { calculateEnergyConsumption } from '../../../utils/energyCalculation';
import { getCachedData, setCachedData } from '../../../cache/redisClient';
import logger from '../../../utils/logger';
import { Block, TotalEnergyResponse, Transaction } from '../../../types';

export const totalEnergyConsumption = schemaComposer.createResolver({
  name: 'totalEnergyConsumption',
  kind: 'query',
  type: [DailyEnergyConsumptionTC],
  args: {
    days: 'Int!',
  },
  resolve: async ({ args }: { args: { days: number } }) => {

    try {
      const { days } = args;
      const results: TotalEnergyResponse[] = [];

      const latestBlock = await getLatestBlock();
      const latestBlockTime = moment.unix(latestBlock.time);

      for (let i = 0; i < days; i++) {
        const dayTime = latestBlockTime.clone().subtract(i, 'days');
        const dayTimestampMs = dayTime.valueOf();

        const dateString = dayTime.format('YYYY-MM-DD'); // Use date string for cache key
        const cacheKey = `day:${dateString}`;

        let totalEnergy = 0;

        //Check if data is cached
        const energyConsumptionData = await getCachedData<TotalEnergyResponse[]>(cacheKey);

        //If not found in cache, fetch from blockchain
        if (energyConsumptionData && energyConsumptionData[i]) {
          results.push(energyConsumptionData[i])
        }
        else {
          //helper function to ge energy per day
          totalEnergy = await getTotalEnergyForDay(dayTimestampMs);

          results.push({
            date: dayTime.format('YYYY-MM-DD'),
            totalEnergy: totalEnergy
          });

          //Cache the data with an expiry time (e.g., 1 hour)
          await setCachedData(cacheKey, results, 3600);

        }

      }

      return results;

    } catch (error) {
      handleResolverError('totalEnergyConsumption', error as Error);
    }

  },

});

const limiter = new Bottleneck({
  maxConcurrent: Number(process.env.CONCURRENCY_LIMIT) || 15,
});

const getTotalEnergyForDay = async (dayTimestampMs: number): Promise<number> => {
  const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 20; //Number of blocks to process in one batch
  //const CONCURRENCY_LIMIT = 10; //Number of concurrent requests

  //Fetch all blocks for the given day
  const blocks = await getBlocksForDay(dayTimestampMs);
  //let totalSize = 0;

  // Split blocks into batches
  const batches = [];
  for (let i = 0; i < blocks.length; i += BATCH_SIZE) {
    batches.push(blocks.slice(i, i + BATCH_SIZE));
  }

  // Process each batch with concurrency limit using Bottleneck
  const batchPromises = batches.map(async (batch) => {
    const batchResults = await Promise.all(
      batch.map(block => limiter.schedule(() => processBlockBatch([block])))
    );
    return batchResults.reduce((acc, size) => acc + size, 0);
  });

  // Wait for all batch processing promises to resolve
  const batchResults = await Promise.all(batchPromises);

  //Sum the results of the batch
  const totalSize = batchResults.reduce((acc, size) => acc + size, 0);

  //Calculate total energy consumption
  return calculateEnergyConsumption(totalSize);
}

//Helper function to process a batch of blocks
const processBlockBatch = async (Transactions: Transaction[]): Promise<number> => {
  const blockDetailsPromises = Transactions.map(Transaction => getBlockData(Transaction.hash));
  const results: PromiseSettledResult<Block>[] = await Promise.allSettled(blockDetailsPromises);

  //Filter out fulfilled promises and extract block details
  const blockDetailsArray = results
    .filter(result => result.status === 'fulfilled')
    .map(result => (result as PromiseFulfilledResult<Block>).value);

  //Calculate total size of transactions in the batch
  return blockDetailsArray.reduce((acc, blockDetails) => {
    return acc + blockDetails.tx.reduce((txAcc, tx) => txAcc + tx.size, 0);
  }, 0);
}

const handleResolverError = (resolverName: string, error: Error): void => {
  logger.error(`Error resolving ${resolverName}:`, error);
  throw new Error(`An error occurred while fetching energy consumption data by wallet.`);
}