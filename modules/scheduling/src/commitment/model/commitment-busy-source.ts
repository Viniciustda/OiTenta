import { addDays, Interval, toLocalParts } from "../../common";
import { BusySource } from "../../availability/provider/busy-source.provider";
import { CommitmentRepository } from "../provider/commitment.repository";
import { RecurrenceExpander } from "./recurrence-expander";

/** Ocupação vinda dos compromissos do usuário (único ou recorrentes). */
export class CommitmentBusySource implements BusySource {
  constructor(
    private readonly commitmentRepository: CommitmentRepository,
    private readonly expander: RecurrenceExpander = new RecurrenceExpander(),
  ) {}

  async listBusy(userId: string, from: Date, to: Date, timezone: string): Promise<Interval[]> {
    const commitments = await this.commitmentRepository.findAllByUser(userId);
    // Um dia antes para pegar a ocorrência que começou na véspera e atravessa a meia-noite.
    const fromDate = addDays(toLocalParts(from, timezone).date, -1);
    const toDate = toLocalParts(to, timezone).date;

    return commitments
      .flatMap((commitment) => this.expander.expand(commitment, fromDate, toDate, timezone))
      .filter((occurrence) => occurrence.start < to && occurrence.end > from)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }
}
