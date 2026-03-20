import { supabase } from "@/integrations/supabase/client";

interface Song {
  id: string;
  title: string;
  variant_number: number;
  audio_url?: string;
}

interface Order {
  id: string;
  customer_email: string;
  customer_whatsapp?: string | null;
  plan: string;
  magic_token: string;
}

interface WebhookPayload {
  order_id: string;
  email: string;
  phone: string | null;
  download_links: string[];
  songs: Array<{
    id: string;
    title: string;
    variant_number: number;
    download_url: string | null;
  }>;
  about: string;
  plan: string;
  magic_token: string;
}

/**
 * Extrai o path do arquivo de uma URL do Supabase Storage
 */
function extractStoragePath(audioUrl: string): string {
  if (!audioUrl || audioUrl.trim() === '') {
    throw new Error('audioUrl está vazio');
  }

  // Se já for um path relativo (sem http e sem /storage/v1/object/), retornar diretamente
  if (!audioUrl.includes('http') && !audioUrl.includes('/storage/v1/object/')) {
    // Se não começar com 'generated-songs/', adicionar
    if (!audioUrl.startsWith('generated-songs/')) {
      // Se começar com 'media/' ou 'songs/', adicionar o bucket
      if (audioUrl.startsWith('media/') || audioUrl.startsWith('songs/')) {
        return `generated-songs/${audioUrl}`;
      }
      // Se não, assumir que está no bucket generated-songs
      return `generated-songs/${audioUrl}`;
    }
    return audioUrl;
  }

  // Se for uma URL completa do Supabase Storage, extrair o path
  if (audioUrl.includes('/storage/v1/object/')) {
    const urlParts = audioUrl.split('/storage/v1/object/');
    if (urlParts.length > 1) {
      // Remover query params se houver
      const pathWithBucket = urlParts[1].split('?')[0];
      // O formato pode ser:
      // - 'public/generated-songs/media/file.mp3' -> extrair 'media/file.mp3'
      // - 'sign/generated-songs/media/file.mp3' -> extrair 'media/file.mp3'
      // - 'generated-songs/media/file.mp3' -> extrair 'media/file.mp3'
      const pathParts = pathWithBucket.split('/');
      
      // Procurar pelo índice do bucket 'generated-songs'
      const bucketIndex = pathParts.findIndex(part => part === 'generated-songs');
      
      if (bucketIndex >= 0 && pathParts.length > bucketIndex + 1) {
        // Retornar path após o bucket
        const extractedPath = pathParts.slice(bucketIndex + 1).join('/');
        console.log(`✅ [Webhook] Path extraído: ${extractedPath} de URL: ${audioUrl}`);
        return extractedPath;
      }
      
      // Se não encontrou o bucket, tentar remover os primeiros 2 elementos (public/sign + bucket)
      if (pathParts.length > 2) {
        const extractedPath = pathParts.slice(2).join('/');
        console.log(`✅ [Webhook] Path extraído (fallback): ${extractedPath} de URL: ${audioUrl}`);
        return extractedPath;
      }
      
      // Fallback: retornar o path completo
      console.warn(`⚠️ [Webhook] Usando path completo como fallback: ${pathWithBucket}`);
      return pathWithBucket;
    }
  }

  // Se for uma URL de signed URL (contém '?token='), extrair apenas o path antes do '?'
  if (audioUrl.includes('?token=') || audioUrl.includes('?t=')) {
    const pathOnly = audioUrl.split('?')[0];
    // Tentar extrair o path novamente
    return extractStoragePath(pathOnly);
  }

  // Fallback: retornar o audioUrl original
  console.warn(`⚠️ [Webhook] Não foi possível extrair path, usando audioUrl original: ${audioUrl}`);
  return audioUrl;
}

/**
 * Gera URL direta de download para uma música
 * Tenta usar signed URL primeiro (mais seguro), depois URL pública
 */
async function generateDownloadUrl(song: Song): Promise<string | null> {
  if (!song.audio_url || song.audio_url.trim() === '') {
    console.warn(`⚠️ [Webhook] Música ${song.id} não tem audio_url`);
    return null;
  }

  try {
    // Se audio_url já for uma URL completa e válida (signed URL ou URL pública), usar diretamente
    if (song.audio_url.startsWith('http') && (song.audio_url.includes('supabase.co') || song.audio_url.includes('?token='))) {
      console.log(`✅ [Webhook] Usando audio_url direto (URL completa) para música ${song.id}`);
      return song.audio_url;
    }

    // Extrair path do arquivo
    let audioPath: string;
    try {
      audioPath = extractStoragePath(song.audio_url);
      console.log(`🔍 [Webhook] Path extraído para música ${song.id}: ${audioPath}`);
    } catch (pathError) {
      console.error(`❌ [Webhook] Erro ao extrair path para música ${song.id}:`, pathError);
      // Se não conseguir extrair path, tentar usar audio_url diretamente se for URL
      if (song.audio_url.startsWith('http')) {
        console.log(`✅ [Webhook] Usando audio_url direto após erro de extração para música ${song.id}`);
        return song.audio_url;
      }
      return null;
    }

    // Tentar gerar signed URL primeiro (válida por 48h)
    // Isso funciona mesmo se o bucket for privado
    try {
      const expiresIn = 60 * 60 * 48; // 48 horas
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('generated-songs')
        .createSignedUrl(audioPath, expiresIn, {
          download: `${song.title || 'Música'}-V${song.variant_number}.mp3`
        });

      if (!signedUrlError && signedUrlData?.signedUrl) {
        console.log(`✅ [Webhook] Signed URL gerada para música ${song.id}: ${signedUrlData.signedUrl.substring(0, 100)}...`);
        return signedUrlData.signedUrl;
      } else {
        console.warn(`⚠️ [Webhook] Erro ao gerar signed URL para ${song.id}:`, signedUrlError);
      }
    } catch (signedError: any) {
      console.warn(`⚠️ [Webhook] Exceção ao gerar signed URL para ${song.id}, tentando URL pública:`, signedError?.message || signedError);
    }

    // Fallback: tentar gerar URL pública
    try {
      const { data: publicUrlData } = supabase.storage
        .from('generated-songs')
        .getPublicUrl(audioPath);

      if (publicUrlData?.publicUrl) {
        console.log(`✅ [Webhook] URL pública gerada para música ${song.id}`);
        return publicUrlData.publicUrl;
      }
    } catch (publicError) {
      console.warn(`⚠️ [Webhook] Erro ao gerar URL pública para ${song.id}:`, publicError);
    }

    // Último fallback: se audio_url já for uma URL completa, usar diretamente
    if (song.audio_url.startsWith('http')) {
      console.log(`✅ [Webhook] Usando audio_url direto (fallback final) para música ${song.id}`);
      return song.audio_url;
    }

    console.error(`❌ [Webhook] Não foi possível gerar URL de download para música ${song.id} (audio_url: ${song.audio_url.substring(0, 100)}...)`);
    return null;
  } catch (error: any) {
    console.error(`❌ [Webhook] Erro ao processar música ${song.id}:`, error?.message || error);
    // Último recurso: retornar audio_url se for URL válida
    if (song.audio_url.startsWith('http')) {
      console.log(`✅ [Webhook] Usando audio_url direto após erro geral para música ${song.id}`);
      return song.audio_url;
    }
    return null;
  }
}

/**
 * Envia dados do release para o webhook
 */
export async function sendReleaseWebhook(
  order: Order,
  songs: Song[],
  about: string
): Promise<void> {
  const WEBHOOK_URL = 'https://webhook.automaeia.com.br/webhook/music-lovely-webhhoks';

  try {
    console.log(`📤 [Webhook] Preparando dados para webhook - Order: ${order.id}, Songs: ${songs.length}`);

    // Gerar URLs de download para cada música
    const downloadUrls = await Promise.all(
      songs.map(song => generateDownloadUrl(song))
    );

    // Filtrar URLs nulas e criar array de links
    const validDownloadLinks = downloadUrls.filter((url): url is string => url !== null);

    // Criar array de músicas com informações detalhadas
    const songsWithUrls = songs.map((song, index) => ({
      id: song.id,
      title: song.title || 'Música sem título',
      variant_number: song.variant_number,
      download_url: downloadUrls[index] || null
    }));

    // Montar payload
    const payload: WebhookPayload = {
      order_id: order.id,
      email: order.customer_email,
      phone: order.customer_whatsapp || null,
      download_links: validDownloadLinks,
      songs: songsWithUrls,
      about: about || 'N/A',
      plan: order.plan || 'unknown',
      magic_token: order.magic_token || ''
    };

    console.log(`📤 [Webhook] Enviando payload para webhook:`, {
      order_id: payload.order_id,
      email: payload.email,
      phone: payload.phone ? '***' : null,
      download_links_count: payload.download_links.length,
      songs_count: payload.songs.length
    });

    // Enviar para o webhook
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Erro desconhecido');
      throw new Error(`Webhook retornou status ${response.status}: ${errorText}`);
    }

    console.log(`✅ [Webhook] Webhook enviado com sucesso para order ${order.id}`);
  } catch (error: any) {
    // Não bloquear o fluxo - apenas logar o erro
    console.error(`❌ [Webhook] Erro ao enviar webhook para order ${order.id}:`, error);
    // Não lançar o erro para não bloquear o fluxo de release
  }
}

/**
 * Envia webhook quando uma letra chega nas pendentes
 * @param order_id - ID do pedido
 * @param email - Email do cliente
 * @param phone - Telefone do cliente (opcional)
 */
export async function sendLyricsPendingWebhook(
  order_id: string,
  email: string,
  phone: string | null
): Promise<void> {
  const WEBHOOK_URL = 'https://webhook.automaeia.com.br/webhook/music-lovely-webhhoks';

  try {
    console.log(`📤 [Webhook Lyrics] Preparando dados para webhook - Order: ${order_id}, Email: ${email}`);

    // Montar payload simplificado
    const payload = {
      order_id: order_id,
      email: email,
      phone: phone || null,
      type: 'lyrics_pending' // Identificar que é uma letra pendente
    };

    console.log(`📤 [Webhook Lyrics] Enviando payload para webhook:`, {
      order_id: payload.order_id,
      email: payload.email,
      phone: payload.phone ? '***' : null,
      type: payload.type
    });

    // Enviar para o webhook
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Erro desconhecido');
      throw new Error(`Webhook retornou status ${response.status}: ${errorText}`);
    }

    console.log(`✅ [Webhook Lyrics] Webhook enviado com sucesso para order ${order_id}`);
  } catch (error: any) {
    // Não bloquear o fluxo - apenas logar o erro
    console.error(`❌ [Webhook Lyrics] Erro ao enviar webhook para order ${order_id}:`, error);
    // Não lançar o erro para não bloquear o fluxo de criação de letra
  }
}

/**
 * Invoca a Edge Function n8n-webhook para evento de letra aprovada.
 * Não bloqueia o fluxo; erros são apenas logados.
 */
export async function sendN8nLyricsApproved(
  approvalId: string,
  orderId?: string
): Promise<void> {
  try {
    const body = {
      type: 'lyrics_approved',
      approval_id: approvalId,
      order_id: orderId ?? null,
    };
    console.log(`📤 [n8n-webhook] Enviando lyrics_approved - approval_id: ${approvalId}`);
    const { error } = await supabase.functions.invoke('n8n-webhook', { body });
    if (error) {
      console.error(`❌ [n8n-webhook] Erro ao enviar lyrics_approved:`, error);
      return;
    }
    console.log(`✅ [n8n-webhook] lyrics_approved enviado para approval ${approvalId}`);
  } catch (err: any) {
    console.error(`❌ [n8n-webhook] Exceção ao enviar lyrics_approved:`, err?.message ?? err);
  }
}

/**
 * Invoca a Edge Function n8n-webhook para evento de música liberada.
 * Não bloqueia o fluxo; erros são apenas logados.
 */
export async function sendN8nMusicReleased(
  order: Order,
  songs: Song[],
  about: string
): Promise<void> {
  try {
    const downloadUrls = await Promise.all(songs.map((s) => generateDownloadUrl(s)));
    const songsWithUrls = songs.map((song, index) => ({
      id: song.id,
      title: song.title || 'Música sem título',
      variant_number: song.variant_number,
      download_url: downloadUrls[index] || null,
    }));
    const body = {
      type: 'music_released',
      order_id: order.id,
      email: order.customer_email,
      phone: order.customer_whatsapp || null,
      songs: songsWithUrls,
      about: about || 'N/A',
      plan: order.plan || 'unknown',
      magic_token: order.magic_token || '',
    };
    console.log(`📤 [n8n-webhook] Enviando music_released - order_id: ${order.id}, songs: ${songs.length}`);
    const { error } = await supabase.functions.invoke('n8n-webhook', { body });
    if (error) {
      console.error(`❌ [n8n-webhook] Erro ao enviar music_released:`, error);
      return;
    }
    console.log(`✅ [n8n-webhook] music_released enviado para order ${order.id}`);
  } catch (err: any) {
    console.error(`❌ [n8n-webhook] Exceção ao enviar music_released:`, err?.message ?? err);
  }
}

