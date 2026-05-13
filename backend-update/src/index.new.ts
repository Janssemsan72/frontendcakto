import { createApp } from './app.js';
import { startAutoJobsWorker } from './autoJobsWorker.js';

// Criar e iniciar servidor (para Railway/local)
async function startServer() {
  try {
    console.log('[Server] Inicializando aplicação...');
    const app = await createApp();

    await app.ready();
    console.log('[Server] ✅ Aplicação pronta para receber requisições');

    if (!process.env.VERCEL) {
      const port = Number(process.env.PORT) || 3000;
      console.log(`[Server] Tentando iniciar servidor na porta ${port}...`);
      console.log(`[Server] PORT environment variable: ${process.env.PORT || 'não definida (usando 3000)'}`);

      await app.listen({ port, host: '0.0.0.0' });

      console.log(`[Server] ✅ Servidor rodando na porta ${port}`);
      console.log(`[Server] ✅ Health check disponível em http://0.0.0.0:${port}/health`);
      console.log(`[Server] ✅ Servidor pronto para receber requisições`);

      // Iniciar worker de jobs automáticos (letras 8s, releases 4s) no mesmo processo
      startAutoJobsWorker();
    } else {
      console.log('[Server] Ambiente Vercel detectado - servidor não será iniciado');
    }
  } catch (error) {
    console.error('[Server] ❌ Erro ao iniciar servidor:', error);
    if (error instanceof Error) {
      console.error('[Server] ❌ Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

startServer();
