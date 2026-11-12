import { createClient } from './vendor/supabase.js?v=0.3.0';
import { backendConfig } from './backend-config.js?v=0.3.0';

export const configured=Boolean(backendConfig.url&&backendConfig.publishableKey?.startsWith('sb_publishable_'));
export const client=configured?createClient(backendConfig.url,backendConfig.publishableKey,{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'themenfunke-auth'},
  global:{fetch:fetchWithTimeout}
}):null;
export const settings=backendConfig;
function fetchWithTimeout(input,options={}){
  const controller=new AbortController(),source=options.signal;
  const cancel=()=>controller.abort();
  if(source?.aborted)cancel();else source?.addEventListener('abort',cancel,{once:true});
  const timeout=setTimeout(cancel,15000);
  return fetch(input,{...options,cache:'no-store',signal:controller.signal}).finally(()=>{clearTimeout(timeout);source?.removeEventListener('abort',cancel);});
}
function errorMessage(error){
  const text=error?.message||'';
  if(/abort|timeout/i.test(error?.name+' '+text))return 'Die Serverantwort dauert zu lange. Bitte versuche es erneut; deine Eingaben bleiben erhalten.';
  if(['23514','23502'].includes(error?.code))return 'Bitte prüfe deine Eingaben und die angegebenen Längen.';
  if(error?.code==='23503')return 'Dieser Kontakt oder dieses Thema ist nicht mehr verfügbar.';
  if(/Invalid login credentials/i.test(text))return 'E-Mail-Adresse oder Passwort stimmen nicht.';
  if(/Email not confirmed/i.test(text))return 'Bitte bestätige zuerst deine E-Mail-Adresse.';
  if(/Failed to fetch|NetworkError|fetch failed/i.test(text))return 'Keine Verbindung zum Server. Deine Eingaben bleiben erhalten.';
  if(/schema cache|function public.tf_|Could not find the function/i.test(text))return 'Die Datenbank-Einrichtung ist noch nicht abgeschlossen.';
  if(/Email address not authorized|email.*rate limit/i.test(text))return 'Der E-Mail-Versand ist noch nicht eingerichtet. Wende dich an den Betreiber.';
  if(/duplicate key.*tf_request_pair/i.test(text))return 'Zwischen euch besteht bereits eine Anfrage oder ein Gespräch.';
  return text||'Die Anfrage konnte nicht abgeschlossen werden.';
}
async function result(request){const {data,error}=await request;if(error)throw new Error(errorMessage(error));return data;}
export async function signIn(email,password){return result(client.auth.signInWithPassword({email,password}));}
export async function signUp(email,password){
  if(!settings.signupEnabled)throw new Error('Die Registrierung läuft derzeit über eine Einladung.');
  return result(client.auth.signUp({email,password,options:{emailRedirectTo:new URL('./',location.href).href}}));
}
export async function resetPassword(email){
  if(!settings.passwordResetEnabled)throw new Error('Die Wiederherstellung läuft in dieser Testrunde über den Betreiber.');
  return result(client.auth.resetPasswordForEmail(email,{redirectTo:new URL('./',location.href).href}));
}
export async function updatePassword(password){return result(client.auth.updateUser({password}));}
export async function snapshot(){return result(client.rpc('tf_snapshot'));}
export async function command(action,payload={}){return result(client.rpc('tf_command',{action,payload}));}
export async function signOut(){await result(client.auth.signOut({scope:'local'}));}
