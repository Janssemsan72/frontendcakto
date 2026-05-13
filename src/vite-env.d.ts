/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** `cakto` força checkout Cakto; omitir ou `hotmart` = Hotmart (padrão do build). */
  readonly VITE_PAYMENT_GATEWAY?: string;
  /** URL base do checkout Cakto (sem query); sobrescreve o default em código. */
  readonly VITE_CAKTO_PAYMENT_URL?: string;
  /** URL base do checkout Hotmart (sem query); sobrescreve o default em código. */
  readonly VITE_HOTMART_PAYMENT_URL?: string;
  /** Meta Pixel ID único (fallback se Supabase não devolver pixels). */
  readonly VITE_META_PIXEL_ID?: string;
  /** Vários pixels separados por vírgula (fallback + merge com Supabase). */
  readonly VITE_META_PIXEL_IDS?: string;
  /** `1` / `true`: desativa pushes ao dataLayer (GTM). */
  readonly VITE_GTM_DISABLE?: string;
  /** `1` / `true`: permite GTM em localhost (por defeito desligado). */
  readonly VITE_GTM_ENABLE_ON_LOCALHOST?: string;
}
