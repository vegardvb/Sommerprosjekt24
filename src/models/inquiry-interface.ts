export interface Inquiry {
  inquiry_id: number;
  name?: string;
  description: string;
  mail: string;
  municipality: string;
  adress: string;
  status?: string | null;
  processing_deadline?: string;
  start_date?: string;
  end_date?: string;
  status_name?: string;
}
