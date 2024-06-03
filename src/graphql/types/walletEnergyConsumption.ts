import { schemaComposer } from 'graphql-compose';

export const WalletEnergyConsumptionTC = schemaComposer.createObjectTC({
  name: 'WalletEnergyConsumption',
  fields: {
    address: 'String!',
    totalEnergy: 'Float!',
  },
});
