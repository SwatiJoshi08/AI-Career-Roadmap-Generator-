import fs from 'fs';
import path from 'path';
import { mapOccupation } from './onetMapper';
import { bulkUpsertOccupations } from './onetRepository';

class JsonArrayStream {
  private buffer = '';
  private braceCount = 0;
  private inString = false;
  private isEscaped = false;

  constructor(private onObject: (obj: any) => Promise<void>) {}

  async write(chunk: string) {
    for (let i = 0; i < chunk.length; i++) {
      const char = chunk[i];

      if (this.braceCount > 0) {
        this.buffer += char;
      }

      if (this.isEscaped) {
        this.isEscaped = false;
        continue;
      }

      if (char === '\\') {
        this.isEscaped = true;
        continue;
      }

      if (char === '"') {
        this.inString = !this.inString;
        continue;
      }

      if (!this.inString) {
        if (char === '{') {
          if (this.braceCount === 0) {
            this.buffer = '{';
          }
          this.braceCount++;
        } else if (char === '}') {
          this.braceCount--;
          if (this.braceCount === 0) {
            try {
              const obj = JSON.parse(this.buffer);
              await this.onObject(obj);
            } catch (err) {
              // Ignore parse errors, continue
            }
            this.buffer = '';
          }
        }
      }
    }
  }
}

export async function importOnetData(): Promise<void> {
  const dataDir = path.join(process.cwd(), 'data/onet');
  const occupationsPath = path.join(dataDir, 'occupations.json');
  const skillsPath = path.join(dataDir, 'skills.json');
  const knowledgePath = path.join(dataDir, 'knowledge.json');

  try {
    if (!fs.existsSync(occupationsPath)) {
      console.warn(`[O*NET Import Warning]: Occupations file not found at ${occupationsPath}`);
      return;
    }

    // Load mappings for skills, knowledge (abilities & work activities can be added here too)
    const skillsMap = fs.existsSync(skillsPath)
      ? JSON.parse(await fs.promises.readFile(skillsPath, 'utf8'))
      : {};
    const knowledgeMap = fs.existsSync(knowledgePath)
      ? JSON.parse(await fs.promises.readFile(knowledgePath, 'utf8'))
      : {};

    console.log('Starting streaming O*NET occupations import...');

    let totalProcessed = 0;
    let totalInserted = 0;
    let totalUpdated = 0;
    let batch: any[] = [];

    const processBatch = async () => {
      if (batch.length === 0) return;
      const res = await bulkUpsertOccupations(batch);
      totalInserted += res.inserted;
      totalUpdated += res.updated;
      batch = [];
    };

    const stream = fs.createReadStream(occupationsPath, { encoding: 'utf8', highWaterMark: 64 * 1024 });
    const parser = new JsonArrayStream(async (rawOcc: any) => {
      const code = rawOcc.occupationCode;
      const skills = skillsMap[code] || [];
      const knowledge = knowledgeMap[code] || [];
      // Support raw files with abilities, workActivities, techSkills, toolsUsed
      const abilities = rawOcc.abilities || [];
      const workActivities = rawOcc.workActivities || [];
      const technologySkills = rawOcc.technologySkills || [];
      const toolsUsed = rawOcc.toolsUsed || [];

      const mapped = mapOccupation(rawOcc, skills, knowledge, abilities, workActivities, technologySkills, toolsUsed);
      batch.push(mapped);
      totalProcessed++;

      if (totalProcessed % 100 === 0) {
        console.log(`Processed ${totalProcessed} occupations...`);
      }

      if (batch.length >= 100) {
        await processBatch();
      }
    });

    for await (const chunk of stream) {
      await parser.write(chunk);
    }

    // Flush any remaining records
    await processBatch();

    console.log(`Import complete: ${totalProcessed} processed. ${totalInserted} inserted, ${totalUpdated} updated.`);
  } catch (error: any) {
    console.error('[O*NET Import Error]: Failed to import O*NET data:', error.message);
  }
}
