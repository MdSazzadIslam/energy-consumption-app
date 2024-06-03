import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';
import logger from '../utils/logger';

const API_BASE_URL = process.env.BLOCKCHAIN_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('BLOCKCHAIN_API_BASE_URL is not defined in the environment variables.');
}

const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 1000; // 1 second
const MAX_DELAY_MS = 30000; // 30 seconds

const getRandomDelay = (maxDelay: number): number => {
  return Math.floor(Math.random() * maxDelay);
};

const getErrorMessage = async (response: Response): Promise<string> => {
  let errorMessage = `HTTP error ${response.status} (${response.statusText}) when accessing ${response.url}`;
  try {
    const errorBody = await response.text();
    if (errorBody) {
      errorMessage += `: ${errorBody}`;
    }
  } catch (error) {
    logger.error(error)
  }
  return errorMessage;
};

//To fetch data with full jitter retry mechanism
export const fetchDataWithFullJitter = async <T>(endpoint: string): Promise<any> => {
  let delay = INITIAL_DELAY_MS;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        const errorMessage = await getErrorMessage(response);
        throw new Error(`HTTP error ${response.status} (${response.statusText}) when accessing ${endpoint}: ${errorMessage}`);
      }
      return response.json();
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        logger.error("Max retries exceeded. Giving up.");
        return null;
      }
      logger.error(`Attempt ${attempt} failed:`, (error as Error).message);
      
      //Random delay between 0 and the current delay
      const jitter = getRandomDelay(Math.min(delay, MAX_DELAY_MS));
      await new Promise(resolve => setTimeout(resolve, jitter));
      
      //Increase delay for the next attempt, up to a maximum
      delay = Math.min(delay * 2, MAX_DELAY_MS);
    }
  }

  return null; //In case of unexpected termination
};
