# Atualização do backend (backendmusiclovelyhotmart)

Esta pasta contém os arquivos para integrar o **worker de jobs automáticos** ao backend, para que aprovação de letras (a cada 8s) e envio de releases (a cada 4s) rodem no mesmo processo do servidor (Railway).

## O que foi adicionado

1. **`src/autoJobsWorker.ts`** – inicia dois `setInterval` que chamam as Edge Functions:
   - `run-one-auto-approve-lyrics` a cada 8s
   - `run-one-auto-release` a cada 4s  
   Usa `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (ou `SUPABASE_SERVICE_KEY`).

2. **`src/index.new.ts`** – versão atualizada de `src/index.ts` que, após o servidor subir, chama `startAutoJobsWorker()`.

## Como aplicar no repositório do backend

1. Clone o backend (se ainda não tiver):
   ```bash
   git clone https://github.com/Janssemsan72/backendmusiclovelyhotmart.git
   cd backendmusiclovelyhotmart
   ```

2. Copie os arquivos desta pasta para o backend:
   - Copie `backend-update/src/autoJobsWorker.ts` para `src/autoJobsWorker.ts`
   - Substitua o conteúdo de `src/index.ts` pelo conteúdo de `backend-update/src/index.new.ts` (ou adicione manualmente a chamada `startAutoJobsWorker()` após `app.listen`)

3. Variáveis de ambiente no Railway (já devem existir):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (ou `SUPABASE_SERVICE_KEY`)

4. Pré-requisito no Supabase:
   - Edge Functions publicadas: `run-one-auto-approve-lyrics` e `run-one-auto-release` (projeto frontend musiclovely-cakto, pasta `supabase/functions/`).

5. Build e deploy:
   ```bash
   npm run build
   ```
   No Railway, o deploy segue igual; o worker sobe junto com o servidor.

## Comportamento

- Ao subir o backend no Railway, o worker inicia no mesmo processo e fica chamando as duas Edge Functions nos intervalos acima.
- As Edge Functions leem a tabela `admin_auto_jobs` no Supabase; só executam aprovação/release se o flag correspondente estiver `enabled` (ativado pelo admin no frontend).
- Nenhuma rota HTTP nova é exposta; é apenas um loop em background.
