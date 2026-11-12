import json,urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright
base=Path('/tmp/themenfunke-auth-test-url').read_text()
urllib.request.urlopen(urllib.request.Request(base+'/test-reset',data=b'{}',method='POST')).read()
errors=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 def make(email,name):
  context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,service_workers='block')
  def route_api(route):
   response=route.fetch(url=base+'/mock/'+route.request.url.split('supabase.test.invalid/',1)[1]);route.fulfill(response=response)
  context.route('**/backend-config.js*',lambda route:route.fulfill(content_type='text/javascript',body="export const backendConfig={url:'https://supabase.test.invalid',publishableKey:'sb_publishable_browser_test',signupEnabled:false,passwordResetEnabled:false};"))
  context.route('https://supabase.test.invalid/**',route_api)
  page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(base)
  page.locator('dialog [data-action="account"]').click()
  page.locator('#auth-email').fill(email);page.locator('#auth-password').fill('TestPasswort-123!');page.locator('#auth-form [type="submit"]').click()
  page.locator('.online-status').wait_for();page.wait_for_function('!document.querySelector("dialog")')
  page.locator('.mobile-nav [data-tab="profile"]').click()
  page.locator('#profile-name').fill(name);page.locator('#profile-form [type="submit"]').click()
  page.wait_for_timeout(500)
  return context,page
 def topic(page,role):
  page.locator('.mobile-nav [data-tab="topics"]').click()
  page.locator('.page-heading [data-action="catalog"]').click();page.locator('#topic-search').fill('Meerestiere');page.locator('[data-action="select-topic"][data-id="meerestiere"]').click()
  page.locator('input[name="role"][value="'+role+'"]').check();page.locator('#interest-text').fill('Ich möchte über Kraken sprechen.')
  page.locator('#interest-form [type="submit"]').click();page.wait_for_function('!document.querySelector("dialog")')
 a,pa=make('alpha@test.invalid','Waldfuchs');topic(pa,'learn')
 b,pb=make('beta@test.invalid','Tintenlicht');topic(pb,'share')
 pa.locator('.mobile-nav [data-tab="discover"]').click()
 pa.locator('.match-card').filter(has_text='Tintenlicht').wait_for(timeout=15000)
 assert 'beta@test.invalid' not in pa.locator('body').inner_text()
 pa.locator('.match-card [data-action="person"]').click();pa.locator('[data-action="send-request"]').click()
 pb.locator('.mobile-nav [data-tab="messages"]').click()
 pb.locator('[data-action="message-tab"][data-id="requests"]').click()
 pb.locator('.request-card').wait_for(timeout=15000)
 pb.locator('.request-card [data-action="accept"]').click()
 pb.locator('#message-input').wait_for()
 pb.locator('#message-input').fill('Hallo Waldfuchs! Eine echte Nachricht zwischen Konten.');pb.locator('#chat-form [type="submit"]').click()
 pb.wait_for_function('document.querySelector("#message-input")?.value === ""')
 pa.locator('[data-action="message-tab"][data-id="chats"]').click()
 pa.locator('.conversation-row').wait_for(timeout=15000);pa.locator('.conversation-row').click()
 pa.locator('.message.theirs').wait_for()
 assert 'echte Nachricht' in pa.locator('.message.theirs').inner_text()
 assert pa.locator('[data-action="demo-reply"]').count()==0
 pa.locator('#message-input').fill('Meine Antwort von Konto A.');pa.locator('#chat-form [type="submit"]').click()
 pb.locator('.message.theirs').wait_for(timeout=15000)
 assert 'Meine Antwort' in pb.locator('.message.theirs').inner_text()
 assert 'Meine Antwort' not in pa.evaluate('JSON.stringify(localStorage)')
 pa.screenshot(path='/tmp/themenfunke-online-chat.png')
 pa.reload();pa.locator('.online-status').wait_for();pa.locator('.mobile-nav [data-tab="messages"]').click();pa.locator('.conversation-row').wait_for();pa.locator('.conversation-row').click()
 assert pa.locator('.message').count()==2
 pa.locator('[data-action="person-menu"]').click();pa.locator('[data-action="block"]').click()
 pa.wait_for_function('!document.querySelector("dialog")');assert pa.locator('#chat-form').count()==0
 pb.wait_for_function('!document.querySelector("#chat-form")',timeout=15000)
 assert pb.locator('.message').count()==2
 pa.locator('.topbar [data-action="account"]').click();pa.locator('[data-action="logout"]').click()
 pa.wait_for_function('!document.querySelector(".online-status")')
 assert 'echte Nachricht' not in pa.locator('body').inner_text()
 # Kontowechsel in einem zweiten Tab muss den aktiven Benutzer korrekt ersetzen.
 pa.locator('.topbar [data-action="account"]').click()
 pa.locator('#auth-email').fill('alpha@test.invalid');pa.locator('#auth-password').fill('TestPasswort-123!');pa.locator('#auth-form [type="submit"]').click()
 pa.locator('.online-status').wait_for()
 other=a.new_page();other.goto(base);other.locator('.online-status').wait_for()
 pa.locator('.topbar [data-action="account"]').click();pa.locator('[data-action="leave-online"]').click()
 pa.locator('.topbar [data-action="account"]').click();pa.locator('#auth-email').fill('beta@test.invalid');pa.locator('#auth-password').fill('TestPasswort-123!');pa.locator('#auth-form [type="submit"]').click()
 pa.locator('.online-status').wait_for()
 other.locator('.profile-shortcut').filter(has_text='Tintenlicht').wait_for(state='attached',timeout=10000)
 other.locator('.topbar [data-action="account"]').click()
 assert 'beta@test.invalid' in other.locator('dialog').inner_text()
 other.locator('[data-action="logout"]').click()
 pa.wait_for_function('!document.querySelector(".online-status")',timeout=10000)
 assert errors==[],errors
 print('Online-Browserprüfung erfolgreich: zwei getrennte Konten, eigene Profile und Themen, private Anfragen, Annahme, beidseitiger Chat, Reload, keine Chattexte im localStorage, beidseitiges Blockieren und Abmeldung.')
 browser.close()
