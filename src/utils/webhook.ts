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

/** Letras / fluxos `lyrics_*` → webhook legado n8n Automaeia */
const AUTOMATEIA_LETTERS_WEBHOOK =
  'https://webhook.automaeia.com.br/webhook/music-lovely-webhhoks';

/** Release de músicas (`music_released`) → fila de recebimento (distinto das letras) */
const AUTOMATEIA_RELEASE_WEBHOOK =
  'https://webhook.automaeia.com.br/webhook/recebimentos-musicas';

/**
 * Repassa o JSON ao Automaeia pelo servidor (Edge), evitando CORS.
 * Não confundir com a função `n8n-webhook`: ela só aceita `{ order_id, event_type: pending_7min|paid }` (funnel/pago).
 */
const AUTOMATEIA_RELAY_FUNCTION = 'admin-automaeia-relay';

function useAutomaeiaEdgeRelay(): boolean {
  return import.meta.env.VITE_AUTOMATEIA_USE_EDGE_RELAY !== 'false';
}

type AutomaeiaRouteKind = 'release' | 'letters';

function automaeiaRouteKind(payload: unknown): AutomaeiaRouteKind {
  const p = payload as Record<string, unknown>;
  const integ = p?.integration as { event?: string } | undefined;
  if (integ?.event === 'music_released') return 'release';
  if (Array.isArray(p?.download_links) && Array.isArray(p?.songs)) return 'release';
  return 'letters';
}

/** URL final no fetch direto (Edge relay escolhe o destino no servidor pelo mesmo critério). */
function resolveAutomaeiaUrl(payload: unknown): string {
  const kind = automaeiaRouteKind(payload);
  if (kind === 'release') {
    const o = import.meta.env.VITE_AUTOMATEIA_RELEASE_WEBHOOK_URL?.trim();
    return o || AUTOMATEIA_RELEASE_WEBHOOK;
  }
  const o = import.meta.env.VITE_AUTOMATEIA_LETTERS_WEBHOOK_URL?.trim();
  return o || AUTOMATEIA_LETTERS_WEBHOOK;
}

type AutomaeiaRelayResponse = {
  ok?: boolean;
  detail?: string;
  automaeia_status?: number;
  error?: string;
};

/** POST JSON → Automaeia (relay Edge por padrão; `VITE_AUTOMATEIA_USE_EDGE_RELAY=false` força fetch direto). */
async function postJsonToAutomaeia(payload: unknown): Promise<void> {
  if (useAutomaeiaEdgeRelay()) {
    const { data, error } = await supabase.functions.invoke(AUTOMATEIA_RELAY_FUNCTION, {
      body: payload,
    });
    if (error) {
      throw new Error(error.message || 'Falha ao chamar relay Automaeia (Edge)');
    }
    const d = (data ?? null) as AutomaeiaRelayResponse | null;
    if (d && d.ok === false) {
      throw new Error(
        [d.detail, d.error].filter(Boolean).join(' ').trim() ||
          `Automaeia retornou status ${d.automaeia_status ?? '?'}`
      );
    }
    return;
  }

  const targetUrl = resolveAutomaeiaUrl(payload);
  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Erro desconhecido');
    throw new Error(`Webhook retornou status ${response.status}: ${errorText}`);
  }
}

function quizEmbedToSummary(quiz: Record<string, unknown> | null | undefined) {
  if (!quiz || typeof quiz !== 'object') return null;
  return {
    about_who: (quiz.about_who as string) ?? '',
    relationship: (quiz.relationship as string | null) ?? null,
    style: (quiz.style as string) ?? '',
    language: (quiz.language as string | null) ?? null,
    vocal_gender: (quiz.vocal_gender as string | null) ?? null,
    occasion: (quiz.occasion as string | null) ?? null,
    desired_tone: (quiz.desired_tone as string | null) ?? null,
    message: (quiz.message as string | null) ?? null,
    qualities: quiz.qualities ?? null,
    memories: quiz.memories ?? null,
    key_moments: quiz.key_moments ?? null,
    answers: quiz.answers ?? null,
  };
}

/**
 * Payload de release: **sem** `type` no root (fluxos n8n antigos usam “tem type = letra” e quebram com `music_released`).
 * Use `integration.event === 'music_released'` no Switch novo.
 */
interface WebhookReleasePayload {
  integration: { event: 'music_released' };
  order_id: string;
  /** Todos os pedidos do grupo (ex.: mesmo email), quando aplicável */
  order_ids: string[];
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
  quiz_id: string | null;
  quiz_summary: ReturnType<typeof quizEmbedToSummary>;
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
    // Qualquer URL absoluta (Supabase, R2, CDN, etc.): usar no webhook sem passar pelo Storage API
    if (song.audio_url.trim().startsWith('http')) {
      console.log(`✅ [Webhook] Usando URL absoluta para música ${song.id}`);
      return song.audio_url.trim();
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

export type SendReleaseWebhookMeta = {
  /** IDs de todos os pedidos do card (agrupamento); default [order.id] */
  allOrderIds?: string[];
};

/**
 * Envia release para o webhook Automaeia de **recebimento de músicas** (`recebimentos-musicas`).
 * Letras continuam em `music-lovely-webhhoks` (ver `postJsonToAutomaeia` / relay Edge).
 * Inclui `integration.event`, `quiz_summary` e `order_ids` (sem `type` no root — ver interface acima).
 */
export async function sendReleaseWebhook(
  order: Order,
  songs: Song[],
  about: string,
  meta?: SendReleaseWebhookMeta
): Promise<void> {
  try {
    console.log(`📤 [Automaeia] release webhook — preparando order ${order.id}, ${songs.length} música(s)`);

    const { data: ordFull } = await supabase
      .from('orders')
      .select(
        `
        customer_email,
        customer_whatsapp,
        plan,
        magic_token,
        quiz_id,
        quizzes:quiz_id (
          about_who,
          relationship,
          style,
          language,
          vocal_gender,
          occasion,
          desired_tone,
          message,
          qualities,
          memories,
          key_moments,
          answers
        )
      `
      )
      .eq('id', order.id)
      .maybeSingle();

    const rawQuiz = ordFull?.quizzes;
    const quizOne = (Array.isArray(rawQuiz) ? rawQuiz[0] : rawQuiz) as
      | Record<string, unknown>
      | null
      | undefined;
    const quiz_summary = quizEmbedToSummary(quizOne);

    const emailResolved = (ordFull?.customer_email || order.customer_email || '').trim();
    const phoneResolved = ordFull?.customer_whatsapp ?? order.customer_whatsapp ?? null;
    const planResolved = ordFull?.plan || order.plan || 'unknown';
    const magicResolved = ordFull?.magic_token || order.magic_token || '';
    const aboutResolved =
      about && about.trim() && about !== 'N/A'
        ? about.trim()
        : (quiz_summary?.about_who?.trim() || about || 'N/A');

    const order_ids = meta?.allOrderIds?.length
      ? [...new Set(meta.allOrderIds.filter(Boolean))]
      : [order.id];

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

    const payload: WebhookReleasePayload = {
      integration: { event: 'music_released' },
      order_id: order.id,
      order_ids,
      email: emailResolved,
      phone: phoneResolved,
      download_links: validDownloadLinks,
      songs: songsWithUrls,
      about: aboutResolved || 'N/A',
      plan: planResolved,
      magic_token: magicResolved,
      quiz_id: ordFull?.quiz_id ?? null,
      quiz_summary,
    };

    console.log(`📤 [Automaeia] release webhook — enviando`, {
      via: useAutomaeiaEdgeRelay() ? AUTOMATEIA_RELAY_FUNCTION : 'fetch direto',
      integration_event: payload.integration.event,
      order_id: payload.order_id,
      order_ids_count: payload.order_ids.length,
      email: payload.email ? '(ok)' : '(vazio)',
      phone: payload.phone ? '***' : null,
      download_links_count: payload.download_links.length,
      songs_count: payload.songs.length,
      has_quiz_summary: !!payload.quiz_summary,
    });

    await postJsonToAutomaeia(payload);

    console.log(`✅ [Automaeia] release webhook enviado para order ${order.id}`);
  } catch (error: any) {
    console.error(`❌ [Automaeia] release webhook falhou (order ${order.id}):`, error);
    throw error;
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

    await postJsonToAutomaeia(payload);

    console.log(`✅ [Webhook Lyrics] Webhook enviado com sucesso para order ${order_id}`);
  } catch (error: any) {
    console.error(`❌ [Webhook Lyrics] Erro ao enviar webhook para order ${order_id}:`, error);
    throw error;
  }
}

function lyricsBodyForWebhook(lyrics: unknown): string | undefined {
  if (lyrics == null) return undefined;
  let s: string;
  if (typeof lyrics === 'string') s = lyrics;
  else {
    try {
      s = JSON.stringify(lyrics);
    } catch {
      return undefined;
    }
  }
  const max = 12000;
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

/**
 * Notifica Automaeia/n8n quando uma letra é aprovada (HTTP direto; mesma base que lyrics_pending).
 * Envia letra + contexto do pedido/quiz (plan, magic_token, about, resumo do quiz) para o n8n não depender só de `lyrics_text`.
 */
export async function sendN8nLyricsApproved(
  approvalId: string,
  orderId?: string
): Promise<void> {
  try {
    const { data: appRow } = await supabase
      .from('lyrics_approvals')
      .select('order_id, quiz_id, lyrics, lyrics_preview, voice')
      .eq('id', approvalId)
      .maybeSingle();

    let resolvedOrderId = orderId?.trim() || appRow?.order_id || undefined;
    if (!resolvedOrderId) {
      console.error(
        '❌ [Automaeia] lyrics_approved: order_id ausente (approval_id:',
        approvalId,
        ')'
      );
      return;
    }

    const { data: ordRow } = await supabase
      .from('orders')
      .select(
        `
        customer_email,
        customer_whatsapp,
        plan,
        magic_token,
        quiz_id,
        quizzes:quiz_id (
          about_who,
          relationship,
          style,
          language,
          vocal_gender,
          occasion,
          desired_tone,
          message,
          qualities,
          memories,
          key_moments,
          answers
        )
      `
      )
      .eq('id', resolvedOrderId)
      .maybeSingle();

    const rawQuiz = ordRow?.quizzes;
    const quizOne = (Array.isArray(rawQuiz) ? rawQuiz[0] : rawQuiz) as
      | Record<string, unknown>
      | null
      | undefined;

    let quiz_summary = quizEmbedToSummary(quizOne);
    if (!quiz_summary && appRow?.quiz_id) {
      const { data: qRow } = await supabase
        .from('quizzes')
        .select(
          `
          about_who,
          relationship,
          style,
          language,
          vocal_gender,
          occasion,
          desired_tone,
          message,
          qualities,
          memories,
          key_moments,
          answers
        `
        )
        .eq('id', appRow.quiz_id)
        .maybeSingle();
      quiz_summary = quizEmbedToSummary(qRow as Record<string, unknown> | undefined);
    }

    const lyricsText = lyricsBodyForWebhook(appRow?.lyrics);
    const about = (quiz_summary?.about_who || '').trim() || 'N/A';

    const payload = {
      type: 'lyrics_approved' as const,
      order_id: resolvedOrderId,
      approval_id: approvalId,
      email: ordRow?.customer_email ?? '',
      phone: ordRow?.customer_whatsapp ?? null,
      plan: ordRow?.plan ?? '',
      magic_token: ordRow?.magic_token ?? '',
      quiz_id: ordRow?.quiz_id ?? appRow?.quiz_id ?? null,
      about: about || 'N/A',
      quiz_summary,
      lyrics_preview: appRow?.lyrics_preview ?? '',
      voice: appRow?.voice ?? null,
      /** Objeto completo da coluna `lyrics` (estrutura JSON), além de `lyrics_text` plano. */
      lyrics_data: appRow?.lyrics ?? null,
      ...(lyricsText !== undefined ? { lyrics_text: lyricsText } : {}),
    };

    console.log(
      `📤 [Automaeia] lyrics_approved → order_id: ${resolvedOrderId}, approval_id: ${approvalId}, has_lyrics_text: ${!!lyricsText}, has_quiz_summary: ${!!quiz_summary}, plan: ${payload.plan ? 'yes' : 'no'}`
    );

    try {
      await postJsonToAutomaeia(payload);
    } catch (lyricsWhErr: unknown) {
      const msg =
        lyricsWhErr instanceof Error ? lyricsWhErr.message : String(lyricsWhErr);
      console.error(`❌ [Automaeia] lyrics_approved falhou`, msg);
      return;
    }

    console.log(`✅ [Automaeia] lyrics_approved enviado para approval ${approvalId}`);
  } catch (err: any) {
    console.error(`❌ [Automaeia] Exceção ao enviar lyrics_approved:`, err?.message ?? err);
  }
}

