import { schemaComposer } from 'graphql-compose';
import { WalletEnergyConsumptionTC } from '../../types/walletEnergyConsumption';
import { fetchTransactionsByAddress } from '../../../api/blockchain';
import { getCachedData, setCachedData } from '../../../cache/redisClient';
import { Transaction, WalletEnergyResponse } from '../../../types';
import { calculateEnergyConsumption } from '../../../utils/energyCalculation';
import logger from '../../../utils/logger';

export const energyConsumptionByWallet = schemaComposer.createResolver({
  name: 'energyConsumptionByWallet',
  kind: 'query',
  type: WalletEnergyConsumptionTC,
  args: {
    address: 'String!',
  },
  resolve: async ({ args }: { args: { address: string } }) => {
    try {

      const { address } = args;
      const cacheKey = `transactions:${address}`;

      //Check if data is cached
      let walletData = await getCachedData<WalletEnergyResponse>(cacheKey);

      //If not found in cache, fetch from blockchain
      if (!walletData) {
        const transactions = await fetchAddressDataFromBlockchain(address);

        //Cache the block data with an expiry time (e.g., 1 hour)
        await setCachedData(cacheKey, transactions, 3600);
      }

      return walletData;
    }
    catch (error) {
      handleResolverError('energyConsumptionByWallet', error as Error);
    }
  }

});


const fetchAddressDataFromBlockchain = async (address: string): Promise<WalletEnergyResponse> => {
  const addressTransactions = await fetchTransactionsByAddress(address);
  if (!addressTransactions) {
    throw new Error('Address data not found');
  }


  const totalEnergy = addressTransactions.txs.reduce(
    (sum: number, tx: Transaction) => sum + calculateEnergyConsumption(tx.size),
    0
  );


  return {
    address: address,
    totalEnergy,
  };
}

const handleResolverError = (resolverName: string, error: Error): void => {
  logger.error(`Error resolving ${resolverName}:`, error);
  throw new Error(`An error occurred while fetching energy consumption data by wallet.`);
}