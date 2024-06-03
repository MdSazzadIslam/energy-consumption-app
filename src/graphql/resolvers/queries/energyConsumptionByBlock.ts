import { schemaComposer } from 'graphql-compose';
import { blockEnergyConsumptionTC } from '../../types/blockEnergyConsumption';
import { getBlockData } from '../../../api/blockchain';
import { getCachedData, setCachedData } from '../../../cache/redisClient';
import { Block, BlockEnergyResponse, Transaction, transactionEnergy } from '../../../types';
import { calculateEnergyConsumption } from '../../../utils/energyCalculation';
import logger from '../../../utils/logger';

export const energyConsumptionByBlock = schemaComposer.createResolver({
  name: 'energyConsumptionByBlock',
  kind: 'query',
  type: blockEnergyConsumptionTC,
  args: {
    blockHash: 'String!',
  },
  resolve: async ({ args }: { args: { blockHash: string } }) => {
    const { blockHash } = args;
    const cacheKey = `blockData:${blockHash}`;


    try {
      //Check if data is cached
      let blockData = await getCachedData<BlockEnergyResponse>(cacheKey);

      //If not found in cache, fetch from blockchain
      if (!blockData) {
        blockData = await fetchBlockDataFromBlockchain(blockHash);

        //Cache the data with an expiry time (e.g., 1 hour)
        await setCachedData(cacheKey, blockData, 3600);
      }

      return blockData;
    } catch (error) {
      handleResolverError('energyConsumptionByBlock', error as Error);
    }

  },
});

const fetchBlockDataFromBlockchain = async (blockHash: string): Promise<BlockEnergyResponse> => {
  const blockData = await getBlockData(blockHash);
  if (!blockData) {
    throw new Error('Block data not found');
  }

  const transactions = blockData.tx.map((tx: Transaction) => ({
    transactionHash: tx.hash,
    energy: calculateEnergyConsumption(tx.size),
  }));

  return {
    blockHash: blockData.hash,
    transactions,
  };
}

const handleResolverError = (resolverName: string, error: Error): void => {
  logger.error(`Error resolving ${resolverName}:`, error);
  throw new Error(`An error occurred while fetching energy consumption data by block`);
}
