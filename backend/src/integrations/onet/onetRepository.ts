import { OnetOccupation, IOnetOccupation } from '../../database/models/OnetOccupation';

export async function bulkUpsertOccupations(
  occupations: Partial<IOnetOccupation>[]
): Promise<{ inserted: number; updated: number }> {
  if (!occupations || occupations.length === 0) {
    return { inserted: 0, updated: 0 };
  }

  const operations = occupations.map((occ) => ({
    updateOne: {
      filter: { occupationCode: occ.occupationCode },
      update: { $set: occ },
      upsert: true,
    },
  }));

  const result = await OnetOccupation.bulkWrite(operations);

  return {
    inserted: result.upsertedCount || 0,
    updated: result.modifiedCount || 0,
  };
}
