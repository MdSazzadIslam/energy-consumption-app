import Redis from 'ioredis'

const redisClient = new Redis();

export async function fetchWithCache(key: string, fetchFunc: ()=> Promise<any>){
    const cachedData = await redisClient.get(key)
    if(cachedData){
        return JSON.parse(cachedData)
    }

    const data = await fetchFunc();

    await redisClient.set(key, JSON.stringify(data), 'EX', 3600)

    return data
}

