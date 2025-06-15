import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { PaymentController } from '../controllers/paymentController';

const router = Router();
const paymentController = new PaymentController();

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'PaymentRoutes funcionando!' });
});

router.get('/', asyncHandler(paymentController.getAll.bind(paymentController)));
router.post('/', asyncHandler(paymentController.create.bind(paymentController)));
router.put('/:id', asyncHandler(paymentController.update.bind(paymentController)));
router.delete('/:id', asyncHandler(paymentController.delete.bind(paymentController)));
router.get('/:id', asyncHandler(paymentController.getById.bind(paymentController)));

export default router;