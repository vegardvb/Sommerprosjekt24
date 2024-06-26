export interface Inquiry {
  id: number;
  navn: string;
  beskrivelse: string | null;
  kunde_epost: string;
  kommune: string | null;
  gateadresse: string;
  status?: string;
  behandlingsfrist?: string;
  fra_dato?: string | null;
  til_dato?: string | null;
}
