// functions/api/[[path]].js
const ADMIN_PASSWORD = "admin12345";

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 1. Verifikasi Admin
  if (url.pathname === '/api/verify-admin' && request.method === 'POST') {
    try {
      const body = await request.json();
      const success = body.password === ADMIN_PASSWORD;
      return new Response(JSON.stringify({ success }), { 
        headers: { 'content-type': 'application/json', ...corsHeaders } 
      });
    } catch (e) { 
      return new Response(JSON.stringify({ success: false }), { status: 400, headers: corsHeaders }); 
    }
  }

  // 2. Endpoint Surat (GET)
  if (url.pathname === '/api/surat' && request.method === 'GET') {
    try {
      const result = await env.DB.prepare("SELECT value FROM kv_store WHERE key = ?").bind("surat_data").first();
      const data = result ? JSON.parse(result.value) : [];
      return new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json', ...corsHeaders } });
    } catch (e) { 
      return new Response("[]", { headers: { 'content-type': 'application/json', ...corsHeaders } }); 
    }
  }

  // 2. Endpoint Surat (POST / Simpan)
  if (url.pathname === '/api/surat' && request.method === 'POST') {
    try {
      const d = await request.json();
      await env.DB.prepare("INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)")
        .bind("surat_data", JSON.stringify(d))
        .run();
      return new Response(JSON.stringify({ success: true }), { headers: { 'content-type': 'application/json', ...corsHeaders } });
    } catch (e) { 
      return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: corsHeaders }); 
    }
  }

  // 3. Endpoint Guru (GET)
  if (url.pathname === '/api/guru' && request.method === 'GET') {
    try {
      const result = await env.DB.prepare("SELECT value FROM kv_store WHERE key = ?").bind("guru_data").first();
      const data = result ? JSON.parse(result.value) : [];
      return new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json', ...corsHeaders } });
    } catch (e) { 
      return new Response("[]", { headers: { 'content-type': 'application/json', ...corsHeaders } }); 
    }
  }

  // 3. Endpoint Guru (POST / Simpan)
  if (url.pathname === '/api/guru' && request.method === 'POST') {
    try {
      const d = await request.json();
      await env.DB.prepare("INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)")
        .bind("guru_data", JSON.stringify(d))
        .run();
      return new Response(JSON.stringify({ success: true }), { headers: { 'content-type': 'application/json', ...corsHeaders } });
    } catch (e) { 
      return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: corsHeaders }); 
    }
  }

  return new Response("Not Found", { status: 404, headers: corsHeaders });
}