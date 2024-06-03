import { schemaComposer } from 'graphql-compose';
import { energyConsumptionByBlock } from './resolvers/queries/energyConsumptionByBlock';
import { totalEnergyConsumption } from './resolvers/queries/totalEnergyConsumption';
import { energyConsumptionByWallet } from './resolvers/queries/energyConsumptionByWallet';

// Add queries to the root Query type
schemaComposer.Query.addFields({
  energyConsumptionByBlock,
  totalEnergyConsumption,
  energyConsumptionByWallet,
});

// Build and export the schema
export const schema = schemaComposer.buildSchema();
