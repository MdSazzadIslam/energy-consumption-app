import { gql } from 'apollo-server';

const typeDefs = gql`
  type Transaction {
    hash: String
    size: Int
    energyConsumption: Float
  }

  type Block {
    hash: String
    transactions: [Transaction]
    totalEnergyConsumption: Float
  }

  type DailyEnergyConsumption {
    date: String
    totalEnergy: Float
  }

  type Query {
    energyPerTransaction(blockHash: String!): [Transaction]
    dailyEnergyConsumption(lastDays: Int!): [DailyEnergyConsumption]
    walletEnergyConsumption(address: String!): Float
  }
`;

export default typeDefs;
