import type {Request, Response} from 'express';
import {PaymentModel} from '../models';
import type {CreatePaymentData, PaymentData, UpdatePaymentData} from '../models/types/paymentTypes'

export class PaymentController {
    async getAll(req: Request, res: Response) {
        try {
            const payments = await PaymentModel.findAll();
            res.status(200).json({
                success: true,
                data: payments,
                count: payments.length
            });
        } catch (error) {
            console.error('Error fetching payments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch payments'
            });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { tab_id, value } = req.body;
            if (!tab_id || !value) {
                return res.status(400).json({ success: false, message: 'tab_id and value are required' });
            }
            const payment = new PaymentModel({ tab_id, value });
            const created = await payment.create();
            res.status(201).json({ success: true, data: created });
        } catch (error) {
            console.error('Error creating payment:', error);
            res.status(500).json({ success: false, message: 'Failed to create payment' });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID is required' });
            }
            const payment = await PaymentModel.findById(id);
            if (!payment) {
                return res.status(404).json({ success: false, message: 'Payment not found' });
            }
            res.status(200).json({ success: true, data: payment });
        } catch (error) {
            console.error('Error fetching payment:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch payment' });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { tab_id, value } = req.body;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID is required' });
            }
            const paymentData = await PaymentModel.findById(id);
            if (!paymentData) {
                return res.status(404).json({ success: false, message: 'Payment not found' });
            }
            const payment = new PaymentModel(paymentData);
            const updated = await payment.update({ id, tab_id, value });
            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            console.error('Error updating payment:', error);
            res.status(500).json({ success: false, message: 'Failed to update payment' });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID is required' });
            }
            const deleted = await PaymentModel.delete(id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Payment not found' });
            }
            res.status(200).json({ success: true, message: 'Payment deleted' });
        } catch (error) {
            console.error('Error deleting payment:', error);
            res.status(500).json({ success: false, message: 'Failed to delete payment' });
        }
    }
}