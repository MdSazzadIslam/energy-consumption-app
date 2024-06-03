import { Block } from "../types";

export const calculateEnergyConsumption = (size: number) => {
  return size * 4.56;
};

export const calculateTotalEnergy = (blockData: Block[]) => {
  return blockData.reduce((sum, block) => {
    const blockEnergy = block.tx.reduce((blockSum, tx) => blockSum + calculateEnergyConsumption(tx.size), 0);
    return sum + blockEnergy;
  }, 0);
};