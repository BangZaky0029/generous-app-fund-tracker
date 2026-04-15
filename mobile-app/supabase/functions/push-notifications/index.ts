// Supabase Edge Function: push-notifications
// Menggunakan FCM HTTP v1 API 
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.1.0"
import * as jose from "https://deno.land/x/jose@v4.11.1/index.ts"

serve(async (req) => {
  try {
    // 1. Ambil data dari Webhook Supabase
    const { record } = await req.json()
    const { user_id, title, message, data } = record

    if (!user_id) throw new Error("user_id is required")

    // 2. Inisialisasi Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Ambil fcm_token dari profil user
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('fcm_token')
      .eq('id', user_id)
      .single()

    if (profileError || !profile?.fcm_token) {
      console.log(`[Push] Skip: No token for user ${user_id}`)
      return new Response(JSON.stringify({ message: "No token found" }), { status: 200 })
    }

    // 4. Dapatkan Access Token dari Firebase Service Account
    const accessToken = await getGoogleAccessToken()

    // 5. Kirim Notifikasi ke Firebase
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/attendance-app-4245e/messages:send`
    
    const fcmResponse = await fetch(fcmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        message: {
          token: profile.fcm_token,
          notification: { title, body: message },
          data: data || {}
        }
      })
    })

    const result = await fcmResponse.json()
    console.log('[Push] Firebase Result:', result)

    return new Response(JSON.stringify(result), { 
      headers: { "Content-Type": "application/json" } 
    })

  } catch (error) {
    console.error('[Push] Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})

// Fungsi Helper untuk generate Google OAuth2 Access Token
async function getGoogleAccessToken() {
  const saJson = JSON.parse(Deno.env.get("FIREBASE_SERVICE_ACCOUNT") || "{}")
  
  const jwt = await new jose.SignJWT({
    scope: "https://www.googleapis.com/auth/cloud-platform"
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt()
    .setIssuer(saJson.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setExpirationTime("1h")
    .sign(await jose.importPKCS8(saJson.private_key, "RS256"))

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  })

  const { access_token } = await response.json()
  return access_token
}
