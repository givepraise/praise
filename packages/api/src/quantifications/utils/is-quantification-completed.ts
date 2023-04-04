import { Quantification } from '../schemas/quantifications.schema';

/**
 * Check if Quantification was completed
 *
 * @param {Quantification} quantification
 * @returns {boolean}
 */
export function isQuantificationCompleted(
  quantification: Quantification,
): boolean {
  return (
    quantification.dismissed ||
    quantification.duplicatePraise !== undefined ||
    quantification.score > 0
  );
}
