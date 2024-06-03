import { resolvers } from '../src/resolver';
import * as fetcher from '../src/blockchain';
import { RedisClient } from '../src/cache';

jest.mock('../fetcher');
jest.mock('../cache');

const mockRedisClient = new RedisClient() as jest.Mocked<RedisClient>;

describe('Resolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('energyPerTransaction', () => {
    test('should calculate energy per transaction', async () => {
      const blockHash = 'sampleBlockHash';
      const blockData = {
        tx: [
          { hash: 'tx1', size: 250 },
          { hash: 'tx2', size: 450 },
        ],
      };

      (fetcher.fetchBlockByHash as jest.Mock).mockResolvedValue(blockData);
      mockRedisClient.getCachedData.mockResolvedValueOnce(null);
      mockRedisClient.setCachedData.mockResolvedValueOnce();

      const result = await resolvers.energyPerTransaction({ blockHash });

      expect(result).toEqual([
        { txHash: 'tx1', energyConsumption: 250 * 4.56 },
        { txHash: 'tx2', energyConsumption: 450 * 4.56 },
      ]);
    });
  });

  describe('totalEnergyPerDay', () => {
    test('should calculate total energy per day', async () => {
      const days = 1;
      const timestamp = Date.now();
      const blocks = [{ hash: 'block1' }, { hash: 'block2' }];
      const blockData1 = { tx: [{ size: 250 }, { size: 450 }] };
      const blockData2 = { tx: [{ size: 350 }] };

      (fetcher.fetchBlocksInDay as jest.Mock).mockResolvedValue({ blocks });
      (fetcher.fetchBlockByHash as jest.Mock).mockImplementation((hash: string) => {
        if (hash === 'block1') return Promise.resolve(blockData1);
        if (hash === 'block2') return Promise.resolve(blockData2);
        return Promise.resolve(null);
      });

      mockRedisClient.getCachedData.mockResolvedValueOnce(null);
      mockRedisClient.setCachedData.mockResolvedValueOnce();

      const result = await resolvers.totalEnergyPerDay({ days });

      expect(result).toEqual([
        {
          date: new Date(timestamp - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalEnergy: (250 + 450 + 350) * 4.56,
        },
      ]);
    });
  });

  describe('totalEnergyForAddress', () => {
    test('should calculate total energy for address', async () => {
      const walletAddress = 'sampleAddress';
      const transactions = [
        { size: 200 },
        { size: 300 },
      ];

      (fetcher.fetchTransactionsForAddress as jest.Mock).mockResolvedValue(transactions);
      mockRedisClient.getCachedData.mockResolvedValueOnce(null);
      mockRedisClient.setCachedData.mockResolvedValueOnce();

      const result = await resolvers.totalEnergyForAddress({ walletAddress });

      expect(result).toBe((200 + 300) * 4.56);
    });
  });
});
