export interface Inquiry {
  inquiry_id: number;
  name?: string | null;
  description: string | null;
  mail: string;
  municipality: string | null;
  address: string;
  status?: string | null;
  processing_deadline?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status_name?: string | null;
}
