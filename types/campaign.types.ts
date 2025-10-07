export interface Campaign {
  campaignsId: number
  title: string
  description: string
  imageUrl: string
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  phone?: string
  whatsapp?: string
}
