import type { Request, Response } from 'express';
import { TabModel } from '../models';
import type { CreateTabData, UpdateTabData } from '../models/types/tabTypes';

export class TabController {
    async getAll(req: Request, res: Response) {
        try {
            const tabs = await TabModel.findAll();
            res.status(200).json({
                success: true,
                data: tabs,
                count: tabs.length
            });
        } catch (error) {
            console.error('Error fetching tabs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch tabs'
            });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { client_id, description, value, status, created_by } = req.body;
            if (!client_id || !description || !value || !status || !created_by) {
                return res.status(400).json({ success: false, message: 'All fields are required' });
            }
            const tab = new TabModel({ client_id, description, value, status, created_by });
            const created = await tab.create();
            res.status(201).json({ success: true, data: created });
        } catch (error) {
            console.error('Error creating tab:', error);
            res.status(500).json({ success: false, message: 'Failed to create tab' });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID is required' });
            }
            const tab = await TabModel.findById(id);
            if (!tab) {
                return res.status(404).json({ success: false, message: 'Tab not found' });
            }
            res.status(200).json({ success: true, data: tab });
        } catch (error) {
            console.error('Error fetching tab:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch tab' });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { client_id, description, value, status, created_by } = req.body;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID is required' });
            }
            const tabData = await TabModel.findById(id);
            if (!tabData) {
                return res.status(404).json({ success: false, message: 'Tab not found' });
            }
            const tab = new TabModel(tabData);
            const updated = await tab.update({ id, client_id, description, value, status, created_by });
            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            console.error('Error updating tab:', error);
            res.status(500).json({ success: false, message: 'Failed to update tab' });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID is required' });
            }
            const deleted = await TabModel.delete(id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Tab not found' });
            }
            res.status(200).json({ success: true, message: 'Tab deleted' });
        } catch (error) {
            console.error('Error deleting tab:', error);
            res.status(500).json({ success: false, message: 'Failed to delete tab' });
        }
    }
}