import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../auth/authMiddleware';
import {
  searchOccupations,
  searchBySkill,
  searchByKnowledge,
  searchByJobZone,
  getOccupationByCode,
  getRequiredSkillsForOccupation,
} from '../../integrations/onet/onetService';
import { retrieveOccupationContext } from '../../integrations/onet/retrieval/context';
import { successResponse } from '../../common/response';
import { errorResponse } from '../../utils/errorResponse';

const router = Router();

// Apply authMiddleware to all routes
router.use(authMiddleware);

// GET /api/v1/acrg/onet/search?q=&skill=&knowledge=&jobZone=
router.get('/onet/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, skill, knowledge, jobZone } = req.query;

    let results: any[] = [];

    if (typeof skill === 'string' && skill.trim() !== '') {
      results = await searchBySkill(skill);
    } else if (typeof knowledge === 'string' && knowledge.trim() !== '') {
      results = await searchByKnowledge(knowledge);
    } else if (typeof jobZone === 'string' && jobZone.trim() !== '') {
      const parsedZone = parseInt(jobZone, 10);
      if (!isNaN(parsedZone)) {
        results = await searchByJobZone(parsedZone);
      }
    } else {
      const query = typeof q === 'string' ? q : '';
      results = await searchOccupations(query);
    }

    return res.status(200).json(successResponse(results));
  } catch (error) {
    return next(error);
  }
});

// GET /api/v1/acrg/onet/:occupationCode
router.get('/onet/:occupationCode', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { occupationCode } = req.params;
    const occupation = await getOccupationByCode(occupationCode);
    if (!occupation) {
      return errorResponse(res, 404, `Occupation with code ${occupationCode} not found`);
    }
    return res.status(200).json(successResponse(occupation));
  } catch (error) {
    return next(error);
  }
});

// GET /api/v1/acrg/onet/:occupationCode/skills
router.get('/onet/:occupationCode/skills', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { occupationCode } = req.params;
    const skills = await getRequiredSkillsForOccupation(occupationCode);
    return res.status(200).json(successResponse(skills));
  } catch (error) {
    return next(error);
  }
});

// GET /api/v1/acrg/onet/:occupationCode/context
router.get('/onet/:occupationCode/context', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { occupationCode } = req.params;
    const context = await retrieveOccupationContext(occupationCode);
    if (!context) {
      return errorResponse(res, 404, `Occupation context with code ${occupationCode} not found`);
    }
    return res.status(200).json(successResponse(context));
  } catch (error) {
    return next(error);
  }
});

export default router;
