import type {Request, Response} from 'express';
import {UserModel} from '../models';
import type {CreateUserData, UserData, UpdateUserData} from '../models/types/userTypes';
import bcrypt from 'bcrypt';

export class UserController {
    async getAll(req: Request, res: Response) {
        try {
            const users = await UserModel.findAll();
            res.status(200).json({
                success: true,
                data: users,
                count: users.length
            });
        }  catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch users'
            });

        }
    }

    async create(req: Request, res: Response) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ success: false, message: 'Username and password are required' });
            }
            const user = new UserModel({ username, password });
            const created = await user.create();
            res.status(201).json({ success: true, data: created });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ success: false, message: 'Failed to create user' });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID is required' });
            }
            const user = await UserModel.findById(id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            res.status(200).json({ success: true, data: user });
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch user' });
        }
    }

   async update(req: Request, res: Response) {
       try {
           const { id } = req.params;
           const { username, password } = req.body;
           if (!id) {
               return res.status(400).json({ success: false, message: 'ID is required' });
           }
           const userData = await UserModel.findById(id);
           if (!userData) {
               return res.status(404).json({ success: false, message: 'User not found' });
           }
           const user = new UserModel(userData);
           const updated = await user.update({ id, username, password });
           res.status(200).json({ success: true, data: updated });
       } catch (error) {
           console.error('Error updating user:', error);
           res.status(500).json({ success: false, message: 'Failed to update user' });
       }
   }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID is required' });
            }
            const deleted = await UserModel.delete(id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            res.status(200).json({ success: true, message: 'User deleted' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ success: false, message: 'Failed to delete user' });
        }
    }

    async login(username: string, password: string) {
        const user = await UserModel.findByUsername(username);
        if (!user) return null;
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;
        return user;
    }
}