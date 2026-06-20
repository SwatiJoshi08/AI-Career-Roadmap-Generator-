import { importOnetData } from '../../src/integrations/onet/onetImporter';
import { bulkUpsertOccupations } from '../../src/integrations/onet/onetRepository';
import fs from 'fs';

jest.mock('../../src/integrations/onet/onetRepository');
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  promises: {
    readFile: jest.fn(),
  },
  createReadStream: jest.fn(),
}));

describe('Onet Importer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should skip import if occupations file is missing', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    await importOnetData();

    expect(bulkUpsertOccupations).not.toHaveBeenCalled();
  });
});
