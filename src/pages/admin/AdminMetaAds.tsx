import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  RefreshCw, Target, Plus, Edit, Trash2, TestTube, Eye, EyeOff,
  TrendingUp, Calendar, Filter, Activity
} from "@/utils/iconImports";

const API_URL = import.meta.env.VITE_API_URL || "";

interface MetaPixelConfig {
  id: string; name: string; pixel_id: string; access_token: string;
  is_active: boolean; test_event_code?: string | null;
  created_at: string; updated_at: string;
}
interface MetaEventRow {
  id: string; pixel_id: string; event_name: string; order_id?: string;
  event_id?: string; status: string; response_code?: number;
  response_body?: string; created_at: string;
}
interface UtmRow {
  utm_source: string | null; utm_medium: string | null;
  utm_campaign: string | null; utm_content: string | null;
  utm_term: string | null; total_orders: number; paid_orders: number;
  revenue_cents: number; first_order: string; last_order: string;
}

type Tab = "pixels" | "utm" | "events";

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    ...opts, headers: { "Content-Type": "application/json", ...opts?.headers },
  });
  if (!res.ok) {
    let msg = `API ${res.status}`;
    try { const body = await res.json(); if (body?.error) msg = body.error; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function fmtBRL(cents: number) {
  return `R$ ${(cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export default function AdminMetaAds() {
  const [tab, setTab] = useState<Tab>("pixels");
  const [pixels, setPixels] = useState<MetaPixelConfig[]>([]);
  const [events, setEvents] = useState<MetaEventRow[]>([]);
  const [utmData, setUtmData] = useState<UtmRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formPixelId, setFormPixelId] = useState("");
  const [formToken, setFormToken] = useState("");
  const [formName, setFormName] = useState("Meta Pixel");
  const [saving, setSaving] = useState(false);

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPixelId, setEditPixelId] = useState("");
  const [editToken, setEditToken] = useState("");

  // UTM filters
  const [utmStart, setUtmStart] = useState("");
  const [utmEnd, setUtmEnd] = useState("");

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadPixels = useCallback(async () => {
    try { setPixels(await apiFetch("/api/admin/meta-pixels")); }
    catch { toast.error("Erro ao carregar pixels"); }
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      const r = await apiFetch("/api/admin/meta-events?limit=50");
      setEvents(r.data || r);
    } catch { /* silent */ }
  }, []);

  const loadUtm = useCallback(async (s?: string, e?: string) => {
    try {
      const qs = new URLSearchParams();
      if (s) qs.set("start_date", s);
      if (e) qs.set("end_date", e);
      setUtmData(await apiFetch(`/api/admin/meta-utm-analytics?${qs}`));
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadPixels(), loadEvents(), loadUtm()]).finally(() => setLoading(false));
  }, [loadPixels, loadEvents, loadUtm]);

  // Auto-refresh polling
  useEffect(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (autoRefresh && tab === "events") {
      intervalRef.current = setInterval(loadEvents, 10_000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, tab, loadEvents]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formPixelId.trim()) return;
    setSaving(true);
    try {
      await apiFetch("/api/admin/meta-pixels", {
        method: "POST",
        body: JSON.stringify({ name: formName, pixel_id: formPixelId.trim(), access_token: formToken.trim() || undefined }),
      });
      toast.success("Pixel criado!");
      setShowForm(false); setFormPixelId(""); setFormToken("");
      await loadPixels();
    } catch (err: any) { toast.error(err?.message || "Erro ao criar pixel"); }
    finally { setSaving(false); }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    try {
      await apiFetch(`/api/admin/meta-pixels/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({ pixel_id: editPixelId.trim(), access_token: editToken.trim() }),
      });
      toast.success("Pixel atualizado!");
      setEditingId(null);
      await loadPixels();
    } catch { toast.error("Erro ao atualizar"); }
    finally { setSaving(false); }
  }

  async function handleToggle(p: MetaPixelConfig) {
    try {
      await apiFetch(`/api/admin/meta-pixels/${p.id}`, {
        method: "PUT", body: JSON.stringify({ is_active: !p.is_active }),
      });
      toast.success(p.is_active ? "Pixel desativado" : "Pixel ativado");
      await loadPixels();
    } catch { toast.error("Erro"); }
  }

  async function handleDelete(p: MetaPixelConfig) {
    if (!confirm(`Excluir pixel "${p.pixel_id}"?`)) return;
    try {
      await apiFetch(`/api/admin/meta-pixels/${p.id}`, { method: "DELETE" });
      toast.success("Pixel excluído"); await loadPixels();
    } catch { toast.error("Erro ao excluir"); }
  }

  async function handleTest(id: string) {
    toast.info("Enviando evento de teste...");
    try {
      const r = await apiFetch(`/api/admin/meta-pixels/${id}/test`, { method: "POST" });
      r.success ? toast.success(r.message) : toast.error(r.message);
      await loadEvents();
    } catch { toast.error("Erro no teste"); }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Hero + Tabs Card */}
      <section style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e7e5e4', background: '#fff' }}>
        <div style={{ borderBottom: '1px solid #d6d3d1', background: 'linear-gradient(135deg, #171717, #3f3f46)', padding: '24px', color: '#fff' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#93c5fd' }}>Conversions API</p>
              <h1 style={{ marginTop: '8px', fontSize: '24px', fontWeight: 600, color: '#fff' }}>Meta Ads</h1>
              <p style={{ marginTop: '8px', fontSize: '14px', color: '#d6d3d1', maxWidth: '600px' }}>
                Manage the system Meta Pixel ID and Access Token used by the public site and server-side CAPI events.
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 500 }}>
              <span style={{ borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', color: 'rgba(255,255,255,0.9)' }}>
                {pixels.length} pixel{pixels.length !== 1 ? 's' : ''} configured
              </span>
              <span style={{ borderRadius: '9999px', background: 'rgba(52,211,153,0.2)', padding: '4px 12px', color: '#a7f3d0' }}>
                {events.filter(e => e.status === 'sent').length} events sent
              </span>
              {tab === 'pixels' && (
                <button type="button" onClick={() => setShowForm(!showForm)}
                  style={{ borderRadius: '9999px', background: '#fff', padding: '6px 16px', fontSize: '12px', fontWeight: 600, color: '#1c1917', border: 'none', cursor: 'pointer' }}>
                  {showForm ? 'Cancel' : '+ Add Pixel'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs inside hero card */}
        <div style={{ display: 'flex', gap: '4px', padding: '4px 24px 0', borderBottom: '1px solid #f5f5f4' }}>
          {([
            { id: 'pixels' as Tab, label: 'Pixels & Tokens', icon: '📱' },
            { id: 'utm' as Tab, label: 'UTM Analytics', icon: '📈' },
            { id: 'events' as Tab, label: 'Event Log', icon: '📋' },
          ]).map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px',
                fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap', border: 'none', background: 'transparent', cursor: 'pointer',
                borderBottom: tab === t.id ? '2px solid #292524' : '2px solid transparent',
                color: tab === t.id ? '#292524' : '#a8a29e',
              }}>
              <span>{t.icon}</span> {t.label}
              {t.id === 'pixels' && pixels.length > 0 && (
                <span style={{ marginLeft: '4px', fontSize: '11px', borderRadius: '9999px', background: '#f5f5f4', padding: '2px 6px', color: '#78716c' }}>{pixels.length}</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ═══ PIXELS TAB ═══ */}
      {tab === "pixels" && (
        <div className="space-y-4">

          {showForm && (
            <Card>
              <CardHeader><CardTitle className="text-base">Novo Meta Pixel</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Nome</label>
                      <input value={formName} onChange={e => setFormName(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Pixel ID *</label>
                      <input value={formPixelId} onChange={e => setFormPixelId(e.target.value)}
                        placeholder="1234567890123456" required
                        className="w-full rounded-lg border px-3 py-2 text-sm font-mono" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium mb-1">Access Token (opcional)</label>
                      <input type="password" value={formToken} onChange={e => setFormToken(e.target.value)}
                        placeholder="EAAxxxxxx..." className="w-full rounded-lg border px-3 py-2 text-sm font-mono" />
                      <p className="text-xs text-muted-foreground mt-1">Sem token, apenas o Pixel browser funciona. Adicione o token para CAPI server-side.</p>
                    </div>
                  </div>
                  <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar Pixel"}</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {pixels.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center text-muted-foreground">
                <Target className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-semibold">Nenhum pixel configurado</p>
                <p className="text-sm mt-1">Adicione seu Meta Pixel ID e token de acesso.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pixels.map(p => (
                <Card key={p.id}>
                  <CardContent className="p-4">
                    {editingId === p.id ? (
                      <form onSubmit={handleSaveEdit} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium">Pixel ID</label>
                            <input value={editPixelId} onChange={e => setEditPixelId(e.target.value)}
                              required className="w-full rounded-lg border px-3 py-2 text-sm font-mono" />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Access Token</label>
                            <input type="password" value={editToken} onChange={e => setEditToken(e.target.value)}
                              className="w-full rounded-lg border px-3 py-2 text-sm font-mono" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleToggle(p)}
                            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${p.is_active ? "bg-emerald-500" : "bg-gray-300"}`}>
                            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${p.is_active ? "translate-x-[22px]" : "translate-x-[2px]"}`}
                              style={{ marginTop: "2px" }} />
                          </button>
                          <div>
                            <p className="font-semibold text-sm">{p.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{p.pixel_id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {!p.access_token && (
                            <span className="text-xs rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-amber-700">⚠ Sem Token</span>
                          )}
                          <span className={`text-xs font-medium ${p.is_active ? "text-emerald-600" : "text-gray-400"}`}>
                            {p.is_active ? "● Ativo" : "○ Inativo"}
                          </span>
                          <Button size="sm" variant="outline" className="h-7 text-xs"
                            onClick={() => { setEditingId(p.id); setEditPixelId(p.pixel_id); setEditToken(p.access_token || ""); }}>
                            <Edit className="h-3 w-3 mr-1" /> Editar
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs" disabled={!p.access_token}
                            onClick={() => handleTest(p.id)}>
                            <TestTube className="h-3 w-3 mr-1" /> Testar
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(p)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pipeline visual */}
          <section style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e7e5e4', background: '#fff' }}>
            <div style={{ borderBottom: '1px solid #f5f5f4', background: '#fafaf9', padding: '20px 24px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#78716c' }}>Events Dispatched via CAPI</p>
              <h2 style={{ marginTop: '8px', fontSize: '18px', fontWeight: 600, color: '#1c1917' }}>Server-side tracking pipeline</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px', background: '#f5f5f4' }}>
              {[
                { icon: '👁️', bg: '#dbeafe', name: 'PageView', desc: 'Fires as soon as the public page loads, with a browser Pixel event and CAPI safety event.' },
                { icon: '📄', bg: '#e0e7ff', name: 'ViewContent', desc: 'Fires immediately on the landing/order view for the personalized music product.' },
                { icon: '🛒', bg: '#ffedd5', name: 'InitiateCheckout', desc: 'Fires when the order flow opens and again server-side when the order is created.' },
                { icon: '💳', bg: '#fef3c7', name: 'AddPaymentInfo', desc: 'Fires the moment payment checkout URL is ready, before redirect.' },
                { icon: '💰', bg: '#d1fae5', name: 'Purchase', desc: 'Fires for the initial payment on the success page.' },
              ].map(ev => (
                <div key={ev.name} style={{ background: '#fff', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ display: 'flex', width: '32px', height: '32px', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: ev.bg, fontSize: '14px' }}>{ev.icon}</span>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#1c1917' }}>{ev.name}</p>
                  </div>
                  <p style={{ fontSize: '12px', color: '#78716c', lineHeight: '1.6' }}>{ev.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #f5f5f4', padding: '12px 24px', fontSize: '12px', color: '#a8a29e' }}>
              <strong style={{ color: '#78716c' }}>Match quality:</strong> em · ph · fn/ln · external_id · client_ip · user_agent · fbc · fbp · country — SHA-256 hashed
            </div>
          </section>
        </div>
      )}

      {/* ═══ UTM TAB ═══ */}
      {tab === "utm" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Performance UTM</h2>
            <div className="flex items-center gap-2">
              <input type="date" value={utmStart} onChange={e => setUtmStart(e.target.value)}
                className="rounded-lg border px-3 py-1.5 text-xs" />
              <span className="text-xs text-muted-foreground">até</span>
              <input type="date" value={utmEnd} onChange={e => setUtmEnd(e.target.value)}
                className="rounded-lg border px-3 py-1.5 text-xs" />
              <Button size="sm" variant="outline" className="h-8 text-xs"
                onClick={() => loadUtm(utmStart, utmEnd)}>
                <Filter className="h-3 w-3 mr-1" /> Filtrar
              </Button>
            </div>
          </div>

          {utmData.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center text-muted-foreground">
                <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-semibold">Sem dados UTM</p>
                <p className="text-sm mt-1">Dados aparecerão quando pedidos com tracking chegarem.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card><CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground">Total Sources</p>
                  <p className="text-2xl font-bold mt-1">{utmData.length}</p>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground">Pedidos Pagos</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{utmData.reduce((s, r) => s + r.paid_orders, 0)}</p>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold mt-1">{fmtBRL(utmData.reduce((s, r) => s + r.revenue_cents, 0))}</p>
                </CardContent></Card>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-3 text-left text-xs font-semibold">Source</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold">Medium</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold">Campaign</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold">Content</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold">Pedidos</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold">Pagos</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold">Receita</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold">Conv%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {utmData.map((row, i) => {
                          const conv = row.total_orders > 0 ? (row.paid_orders / row.total_orders * 100) : 0;
                          return (
                            <tr key={i} className="border-b hover:bg-muted/30">
                              <td className="px-4 py-2.5 font-medium">{row.utm_source || "—"}</td>
                              <td className="px-4 py-2.5 text-muted-foreground">{row.utm_medium || "—"}</td>
                              <td className="px-4 py-2.5 text-muted-foreground max-w-[180px] truncate">{row.utm_campaign || "—"}</td>
                              <td className="px-4 py-2.5 text-muted-foreground max-w-[120px] truncate">{row.utm_content || "—"}</td>
                              <td className="px-4 py-2.5 text-right">{row.total_orders}</td>
                              <td className="px-4 py-2.5 text-right font-medium text-emerald-600">{row.paid_orders}</td>
                              <td className="px-4 py-2.5 text-right font-semibold">{fmtBRL(row.revenue_cents)}</td>
                              <td className="px-4 py-2.5 text-right">
                                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  conv >= 50 ? "bg-emerald-100 text-emerald-700" :
                                  conv >= 20 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                                }`}>{conv.toFixed(1)}%</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* ═══ EVENTS TAB ═══ */}
      {tab === "events" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Log de Eventos CAPI</h2>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoRefresh ? "bg-emerald-500" : "bg-gray-300"}`}>
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${autoRefresh ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
                </div>
                <span className="text-xs">Auto-refresh {autoRefresh ? <span className="text-emerald-600 font-medium">ON</span> : <span className="text-gray-400">OFF</span>}</span>
              </label>
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={loadEvents}>
                <RefreshCw className="h-3 w-3 mr-1" /> Atualizar
              </Button>
            </div>
          </div>

          {events.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center text-muted-foreground">
                <Activity className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-semibold">Nenhum evento registrado</p>
                <p className="text-sm mt-1">Eventos aparecerão quando pixels estiverem configurados.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left text-xs font-semibold">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">Evento</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">Pixel</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">Pedido</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold">HTTP</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map(evt => (
                        <tr key={evt.id} className="border-b hover:bg-muted/30">
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              evt.status === "sent" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${evt.status === "sent" ? "bg-emerald-500" : "bg-red-500"}`} />
                              {evt.status === "sent" ? "Enviado" : "Erro"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-medium">{evt.event_name}</td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">{evt.pixel_id}</td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">
                            {evt.order_id ? evt.order_id.slice(0, 8) + "…" : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            {evt.response_code && (
                              <span className={`text-xs font-medium ${evt.response_code === 200 ? "text-emerald-600" : "text-red-600"}`}>
                                {evt.response_code}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">{fmtDate(evt.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
