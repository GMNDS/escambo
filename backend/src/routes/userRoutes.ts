import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers';
import { authenticateJWT, generateToken } from '../middleware/auth';

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

router.post('/login', asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }
    const user = await userController.login(username, password);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }
    // Gera o token JWT
    const token = generateToken({ id: user.id, username: user.username });
    res.status(200).json({ success: true, token, user: { id: user.id, username: user.username } });
}));

// Rotas protegidas por JWT:
router.get('/', authenticateJWT as NextFunction, asyncHandler(userController.getAll.bind(userController)));
router.put('/:id', authenticateJWT as NextFunction, asyncHandler(userController.update.bind(userController)));
router.delete('/:id', authenticateJWT as NextFunction, asyncHandler(userController.delete.bind(userController)));
router.get('/:id', authenticateJWT as NextFunction, asyncHandler(userController.getById.bind(userController)));

// Cadastro de usuário não exige autenticação
router.post('/', asyncHandler(userController.create.bind(userController)));

export default router;