import type {Request, Response} from 'express';
import {ClientModel} from '../models';
import type {CreateClientData, UpdateClientData} from '../models/types/clientTypes'
export class ClientController {
    async getAll(req: Request, res: Response) {
        try {
            const clients = await ClientModel.findAll();
            res.status(200).json({
                sucess: true,
                data: clients,
                count: clients.length
            });
        }  catch (error) {
            console.error('Error fetching clients:', error);
            res.status(500).json({
                sucess: false,
                message: 'Failed to fetch clients'
            });

        }
    }

    async create(req: Request, res: Response) {
        try {
            const { name, phone_number } = req.body;
            if (!name || !phone_number) {
                return res.status(400).json({ success: false, message: 'Name and phone number are required' });
            }
            const client = new ClientModel({ name, phone_number });
            const created = await client.create();
            res.status(201).json({ success: true, data: created });
        } catch (error) {
            console.error('Error creating client:', error);
            res.status(500).json({ success: false, message: 'Failed to create client' });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID is required' });
            }
            const client = await ClientModel.findById(id);
            if (!client) {
                return res.status(404).json({ success: false, message: 'Client not found' });
            }
            res.status(200).json({ success: true, data: client });
        } catch (error) {
            console.error('Error fetching client:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch client' });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, phone_number } = req.body;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID is required' });
            }
            const clientData = await ClientModel.findById(id);
            if (!clientData) {
                return res.status(404).json({ success: false, message: 'Client not found' });
            }
            const client = new ClientModel(clientData);
            const updated = await client.update({ id, name, phone_number });
            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            console.error('Error updating client:', error);
            res.status(500).json({ success: false, message: 'Failed to update client' });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID is required' });
            }
            const deleted = await ClientModel.delete(id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Client not found' });
            }
            res.status(200).json({ success: true, message: 'Client deleted' });
        } catch (error) {
            console.error('Error deleting client:', error);
            res.status(500).json({ success: false, message: 'Failed to delete client' });
        }
    }
}