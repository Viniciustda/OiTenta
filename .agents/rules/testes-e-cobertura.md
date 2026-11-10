# Regra: testes e cobertura

Vale sempre que criar ou alterar entidade, caso de uso, regra de validação, classe de cálculo ou controller.

- **Domínio com 100% de cobertura** (entidades, casos de uso, regras do `shared`, classes de cálculo), como nas skills do curso. Rode `npm run test --workspace @oitenta/<modulo>` e confira o relatório.
- Testes de domínio rodam **sem banco e sem servidor**: use os fakes em memória de `modules/<modulo>/test/mock/`, que implementam os mesmos contratos dos adaptadores reais.
- **Teste negativo de posse obrigatório** para todo recurso de usuário: o usuário A não lê, altera nem exclui o recurso do usuário B (no domínio e no `.integration.http` do backend).
- **Um resultado esperado por teste**. Nada de `try/catch` que aceita sucesso ou erro.
- Cubra também o caminho de erro e os casos de borda (lista vazia, não encontrado, limite exato).
- Teste quebrado não se "conserta" afrouxando a asserção: corrija o código ou discuta a regra.
