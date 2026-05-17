import type { Database } from './types';

export type OrderStatus = Database['public']['Enums']['order_status'];
export type PlanType = Database['public']['Enums']['plan_type'];
export type PaymentProvider = Database['public']['Enums']['payment_provider'];

export const asOrderStatus = (value: string): OrderStatus => value as OrderStatus;
export const asPlanType = (value: string): PlanType => value as PlanType;
export const asPaymentProvider = (value: string): PaymentProvider => value as PaymentProvider;

export type SongStatus = Database["public"]["Enums"]["song_status"];
export const asSongStatus = (value: string): SongStatus => value as SongStatus;
