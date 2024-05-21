import fetch from 'node-fetch';

export async function fetchWithExponentialBackoff(url: string, attempts = 5, delay = 500): Promise<any> {
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return  response.json();
      }
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        if (retryAfter) {
          delay = parseInt(retryAfter) * 1000;
        }
      }
    } catch (error: any) {
      console.error(`Attempt ${i + 1} failed: ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    delay *= 2;
  }
  throw new Error(`Failed to fetch ${url} after ${attempts} attempts`);
}