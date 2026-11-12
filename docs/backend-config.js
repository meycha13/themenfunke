// Ausschließlich öffentliche Browser-Konfiguration. Keine Secret-/service_role-Schlüssel.
export const backendConfig = {
  url: 'https://oymkhxojvtmrimmwqxgw.supabase.co',
  publishableKey: 'sb_publishable_BQhBaa2fEV-Jwr8o2TZr5g_2Kj3cEt3',
  // Für die erste eingeladene Testrunde: Konten im Supabase-Dashboard anlegen.
  // Nach Einrichtung des E-Mail-Versands kann die Selbstregistrierung aktiviert werden.
  signupEnabled: false,
  passwordResetEnabled: false
};
