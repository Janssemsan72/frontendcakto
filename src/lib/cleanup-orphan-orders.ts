/**
 * Limpeza de orders órfãs — DESATIVADA por política do sistema.
 * Nenhum pedido pode ser deletado. A função existe para compatibilidade;
 * se for chamada, não executa nenhum delete.
 */
export async function cleanupOrphanOrders(_email: string): Promise<void> {
  return;
}
