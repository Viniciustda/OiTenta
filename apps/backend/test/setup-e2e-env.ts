// Os testes de integração rodam sempre com o motor de regras, sem rede (IA6), mesmo que o
// apps/backend/.env aponte para o Ollama ou outro fornecedor: o ConfigModule não sobrescreve
// variável que já está no process.env.
process.env.AI_PROVIDER = 'rules';
process.env.AI_FALLBACK = 'rules';
process.env.AI_TIMEOUT_MS = '15000';
process.env.AI_LOG_CONTENT = 'false';
