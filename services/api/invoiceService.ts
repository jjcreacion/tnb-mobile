import { apiClient } from './apiClient'
import type { Invoice } from '@/types/invoice.types'

export const invoiceService = {
  async getInvoiceById(userId: string): Promise<Invoice[]> {
    return apiClient.get<Invoice[]>(`/invoices/user/${userId}`)
  },
}