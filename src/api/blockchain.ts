import { fetchDataWithFullJitter } from './fetchData';
import { Block, LatestBlock, Transaction, AddressTransactions  } from '../types';

export const getLatestBlock = async (): Promise<LatestBlock> => {
  return fetchDataWithFullJitter<LatestBlock>('/latestblock');
};

export const getBlockData = async (blockHash: string): Promise<Block> => {
  return fetchDataWithFullJitter<Block>(`/rawblock/${blockHash}`);
};

export const getBlocksForDay = async (timestamp: number): Promise<Transaction[]> => {
  return fetchDataWithFullJitter<Transaction[]>(`/blocks/${timestamp}?format=json`);
};

export const fetchTransactionData = async (txHash: string): Promise<Transaction> => {
  return fetchDataWithFullJitter<Transaction>(`/rawtx/${txHash}`);
};

export const fetchTransactionsByAddress = async (address: string): Promise<AddressTransactions > => {
  return fetchDataWithFullJitter<AddressTransactions >(`/rawaddr/${address}`);
};
