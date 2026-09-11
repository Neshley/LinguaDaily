import { LearningItem } from '../../types/vocabulary';
import { generateMandarinDataset } from './data';

export function getMandarinSeedItems(): LearningItem[] {
  return generateMandarinDataset();
}

export { generateMandarinDataset };
