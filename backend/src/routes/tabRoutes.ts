import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { TabController } from '../controllers/tabController';

const router = Router();
const tabController = new TabController();

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

router.get('/', asyncHandler(tabController.getAll.bind(tabController)));
router.post('/', asyncHandler(tabController.create.bind(tabController)));
router.get('/:id', asyncHandler(tabController.getById.bind(tabController)));
router.put('/:id', asyncHandler(tabController.update.bind(tabController)));
router.delete('/:id', asyncHandler(tabController.delete.bind(tabController)));

export default router;