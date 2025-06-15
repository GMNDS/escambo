import type {Request, Response} from 'express';
import {PaymentModel, TabModel} from '../models';
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
            const { tab_id, value, description } = req.body;
            
            // Validação dos campos obrigatórios
            if (!tab_id || !value) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'tab_id and value are required' 
                });
            }

            // Converte o valor para número para validações
            const newPaymentValue = Number(value);
            if (isNaN(newPaymentValue) || newPaymentValue <= 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Valid payment value is required' 
                });
            }

            // Busca o fiado (tab) para validar se existe
            const tab = await TabModel.findById(tab_id);
            if (!tab) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Tab not found' 
                });
            }

            // Calcula o valor total da dívida
            const tabTotalValue = Number(tab.value);
            
            // Busca pagamentos existentes e calcula valor já pago
            const existingPayments = await PaymentModel.findByTabId(tab_id);
            const totalPaid = existingPayments.reduce((sum, payment) => sum + Number(payment.value), 0);
            
            // Calcula valor restante
            const remainingValue = tabTotalValue - totalPaid;
            
            // Verifica se o novo pagamento excede o valor restante
            if (newPaymentValue > remainingValue) {
                const excessValue = newPaymentValue - remainingValue;
                return res.status(400).json({ 
                    success: false, 
                    message: `Valor excede o saldo devedor em R$ ${excessValue.toFixed(2)}` 
                });
            }

            // Registra o novo pagamento
            const payment = new PaymentModel({ tab_id, value, description });
            const created = await payment.create();

            // Calcula novo valor restante após o pagamento
            const newRemainingValue = remainingValue - newPaymentValue;
            
            // Atualiza status do fiado
            let newStatus: "unpaid" | "paid" | "partial";
            let successMessage: string;
            
            if (newRemainingValue === 0) {
                newStatus = "paid";
                successMessage = "Pagamento registrado! Fiado quitado.";
            } else {
                newStatus = "partial";
                successMessage = `Pagamento registrado! Restam R$ ${newRemainingValue.toFixed(2)}`;
            }
            
            await TabModel.updateStatus(tab_id, newStatus);

            res.status(201).json({ 
                success: true, 
                data: created,
                message: successMessage,
                remainingValue: newRemainingValue
            });
        } catch (error) {
            console.error('Error creating payment:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to create payment' 
            });
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
            const { tab_id, value, description } = req.body;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID is required' });
            }
            const paymentData = await PaymentModel.findById(id);
            if (!paymentData) {
                return res.status(404).json({ success: false, message: 'Payment not found' });
            }
            const payment = new PaymentModel(paymentData);
            const updated = await payment.update({ id, tab_id, value, description });
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

    async getByTabId(req: Request, res: Response) {
        try {
            const { tab_id } = req.params;
            if (!tab_id) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Tab ID is required' 
                });
            }
            
            const payments = await PaymentModel.findByTabId(tab_id);
            const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.value), 0);
            
            res.status(200).json({
                success: true,
                data: payments,
                count: payments.length,
                totalPaid: totalPaid
            });
        } catch (error) {
            console.error('Error fetching payments by tab ID:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch payments by tab ID'
            });
        }
    }
}