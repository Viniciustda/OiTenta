import { Interval } from "../../common";

/**
 * Fonte de ocupação da agenda (D 4d). MVP: compromissos (`CommitmentBusySource`);
 * depois: Google Calendar (UC28).
 */
export interface BusySource {
  listBusy(userId: string, from: Date, to: Date, timezone: string): Promise<Interval[]>;
}
