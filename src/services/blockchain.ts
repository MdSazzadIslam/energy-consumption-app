import fetch from 'node-fetch';
import Bottleneck from 'bottleneck';
import { fetchWithExponentialBackoff } from '../utils/backoff';
import { fetchWithCache } from './cache';

const limiter = new Bottleneck({
  minTime: 200,
  id: 'my-limiter',
  datastore: 'redis',
  clearDatastore: false,
  clientOptions: {
    host: 'localhost',
    port: 6379,
  },
});

export async function fetchWithRateLimit(url: string) {
  return limiter.schedule(() => fetchWithExponentialBackoff(url));
}

export async function fetchBlockByHash(blockHash: string) {
  const url = `https://blockchain.info/rawblock/${blockHash}`;
  return fetchWithCache(`block:${blockHash}`, () => fetchWithRateLimit(url));
}

export async function fetchTransactionByHash(txHash: string) {
  const url = `https://blockchain.info/rawtx/${txHash}`;
  return fetchWithCache(`tx:${txHash}`, () => fetchWithRateLimit(url));
}

export async function fetchTransactionsByAddress(address: string) {
  const url = `https://blockchain.info/rawaddr/${address}`;
  return fetchWithCache(`addr:${address}`, () => fetchWithRateLimit(url));
}

 
