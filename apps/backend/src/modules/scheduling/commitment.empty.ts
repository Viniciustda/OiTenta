import { Commitment, CommitmentRepository } from '@oitenta/scheduling';

// P8: compromissos (aula, estágio) existem só no domínio nesta fase; não há tela, endpoint
// nem tabela. Este repositório devolve sempre lista vazia para o CommitmentBusySource poder
// ser montado (C4). Quando houver a tabela `commitments`, entra um PrismaCommitmentRepository.
export class EmptyCommitmentRepository implements CommitmentRepository {
  findAllByUser(userId: string): Promise<Commitment[]> {
    void userId;
    return Promise.resolve([]);
  }
}
