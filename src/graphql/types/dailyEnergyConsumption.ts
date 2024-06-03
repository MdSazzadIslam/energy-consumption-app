import { schemaComposer } from 'graphql-compose';

export const DailyEnergyConsumptionTC = schemaComposer.createObjectTC({
  name: 'DailyEnergyConsumption',
  fields: {
    date: 'String!',
    totalEnergy: 'Float!',
  },
});
