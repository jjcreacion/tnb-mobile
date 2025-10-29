
export interface Invoice {
  invoice_id: number;
  fk_user: number;
  invoice_amount: number;
  invoice_status: string; 
  public_link: string;
  invoice_number: string;
  invoice_date: string;
  created_at: string;
  updated_at: string;
}