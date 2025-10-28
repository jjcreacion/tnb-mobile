export interface InvoicePerson {
  pkPerson: number;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  dateOfBirth?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceUser {
  pkUser: number;
  person: InvoicePerson;
  email: string;
  username: string | null;
  phone: string | null;
  roles: string[];
  validateEmail: number;
  validatePhone: number;
  status: number;
  img_profile: string | null;
  referralCode: string | null;
  balance: string; 
  createdAt: string;
  updatedAt: string;
}

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
  user: InvoiceUser;
}