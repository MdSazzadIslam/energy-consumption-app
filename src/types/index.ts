export interface Transaction {
    hash: string;
    size: number;
}

export interface Block {
    hash: string;
    tx: Transaction[];
}

export interface DailyBlockSummary {
    blocks: { hash: string }[];
}

export interface LatestBlock {
    hash: string;
    height: number;
    time: number;
    block_index: number;
}

export interface AddressTransactions {
    address: string;
    txs: Transaction[];
}

export interface transactionEnergy {
    transactionHash: string,
    energy: number
}

export interface BlockEnergyResponse {
    blockHash: string,
    transactions: transactionEnergy[]
}

export interface WalletEnergyResponse {
    address: string,
    totalEnergy: number
}

export interface TotalEnergyResponse {
    date: string,
    totalEnergy: number
}
