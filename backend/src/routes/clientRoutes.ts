import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { ClientController } from '../controllers';

const router = Router();
const clientController = new ClientController();

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

router.get('/', asyncHandler(clientController.getAll.bind(clientController)));
router.post('/', asyncHandler(clientController.create.bind(clientController)));
router.get('/:id', asyncHandler(clientController.getById.bind(clientController)));
router.put('/:id', asyncHandler(clientController.update.bind(clientController)));
router.delete('/:id', asyncHandler(clientController.delete.bind(clientController)));

export default router;