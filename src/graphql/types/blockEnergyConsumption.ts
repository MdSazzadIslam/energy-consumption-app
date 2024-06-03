import { schemaComposer } from 'graphql-compose';

schemaComposer.createObjectTC({
  name: 'TransactionEnergy',
  fields: {
      transactionHash: 'String!',
      energy: 'Float!',
  },
});

export const blockEnergyConsumptionTC = schemaComposer.createObjectTC({
  name: 'BlockEnergyConsumption',
  fields: {
    blockHash: 'String!',
    transactions: '[TransactionEnergy!]!',
  },
});
