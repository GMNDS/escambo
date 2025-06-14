import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers';

const router = Router();
const userController = new UserController();

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}


router.get('/test', (req: Request, res: Response) => {
    res.json({ message: 'UserRoutes funcionando!' });
});

router.get('/', asyncHandler(userController.getAll.bind(userController)));
router.post('/', asyncHandler(userController.create.bind(userController)));
router.put('/:id', asyncHandler(userController.update.bind(userController)));
router.delete('/:id', asyncHandler(userController.delete.bind(userController)));
router.get('/:id', asyncHandler(userController.getById.bind(userController)));

export default router;