(function(){"use strict";const o=document.currentScript,a={tenantId:o?.dataset.tenantId||"jaabili-default",widgetKey:o?.dataset.widgetKey||"",apiBase:(o?.dataset.apiBase||window.location.origin).replace(/\/$/,""),title:o?.dataset.title||"Website Sales Agent",subtitle:o?.dataset.subtitle||"Ask a question. The agent can qualify your requirement and route urgent cases.",accent:o?.dataset.accent||"#10b8a6"},c=`jaabili-widget-visitor:${a.tenantId}`,g=`jaabili-widget-conversation:${a.tenantId}`,l=`jaabili-widget-messages:${a.tenantId}`,d=`jaabili-widget-lead:${a.tenantId}`,u=localStorage.getItem(c)||`visitor_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;localStorage.setItem(c,u);class h extends HTMLElement{rootNode=this.attachShadow({mode:"open"});messages=b();conversationId=localStorage.getItem(g);lead=m();isOpen=!1;isSending=!1;connectedCallback(){this.render()}render(){this.rootNode.innerHTML=`
      <style>${f(a)}</style>
      <button class="launcher" aria-label="Open Jaabili sales agent">
        <span class="launcher-dot"></span>
        <span>Ask Jaabili</span>
      </button>
      <section class="panel ${this.isOpen?"open":""}" aria-live="polite">
        <header>
          <div>
            <strong>${n(a.title)}</strong>
            <span>${n(a.subtitle)}</span>
          </div>
          <button class="close" aria-label="Close chat">×</button>
        </header>
        ${this.lead?this.renderLeadStatus():""}
        <div class="messages">
          ${this.messages.map(t=>`
                <div class="message ${t.role}">
                  ${n(t.content)}
                </div>
              `).join("")}
          ${this.isSending?'<div class="typing"><i></i><i></i><i></i></div>':""}
        </div>
        <form>
          <button type="button" class="quick" data-prompt="I need help choosing the right option.">Help me choose</button>
          <button type="button" class="quick" data-prompt="What is the price and delivery timeline?">Price and timeline</button>
          <button type="button" class="quick" data-prompt="I want to talk to sales. Please route this to your team.">Talk to sales</button>
          <div class="input-row">
            <input name="message" autocomplete="off" placeholder="Ask about products, pricing, policy..." />
            <button type="submit" ${this.isSending?"disabled":""}>Send</button>
          </div>
        </form>
      </section>
    `,this.rootNode.querySelector(".launcher")?.addEventListener("click",()=>{this.isOpen=!0,this.render()}),this.rootNode.querySelector(".close")?.addEventListener("click",()=>{this.isOpen=!1,this.render()}),this.rootNode.querySelector("form")?.addEventListener("submit",t=>{t.preventDefault();const s=t.currentTarget.elements.namedItem("message"),r=s?.value.trim()??"";r&&(s.value="",this.send(r))}),this.rootNode.querySelectorAll(".quick").forEach(t=>{t.addEventListener("click",()=>{const i=t.dataset.prompt;i&&this.send(i)})})}renderLeadStatus(){if(!this.lead)return"";const t=!!(this.lead.phone||this.lead.email),i=!!this.lead.requirement,s=!!this.lead.followUpConsent,r=this.lead.missingFields?.slice(0,2).join(", ");return`
      <div class="lead-status">
        <div>
          <span class="lead-kicker">Sales status</span>
          <strong>${n(x(this.lead))}</strong>
        </div>
        <div class="lead-pills">
          <span class="${t?"ready":""}">Contact</span>
          <span class="${i?"ready":""}">Need</span>
          <span class="${s?"ready":""}">Consent</span>
          <span class="${this.lead.qualification==="hot"?"hot":""}">
            ${n(this.lead.qualification||"qualifying")}
          </span>
        </div>
        ${this.lead.nextBestAction?`<p>${n(this.lead.nextBestAction)}</p>`:r?`<p>Share ${n(r)} so the team can respond faster.</p>`:""}
      </div>
    `}async send(t){if(!this.isSending){this.messages=[...this.messages,{role:"visitor",content:t}],p(this.messages),this.isSending=!0,this.render();try{const i=await fetch(`${a.apiBase}/api/agents/website-sales/chat`,{method:"POST",headers:{"content-type":"application/json",...a.widgetKey?{"x-jaabili-widget-key":a.widgetKey}:{}},body:JSON.stringify({client:"widget",tenantId:a.tenantId,widgetKey:a.widgetKey||void 0,visitorId:u,conversationId:this.conversationId??void 0,message:t,runtime:{model:"jaabilv-2.0",strictGrounding:!0,maxResponseWords:180,retrievalChunks:4}})}),s=await i.json();if(!i.ok)throw new Error(s.error||"Agent request failed.");this.conversationId=s.conversation?.id??this.conversationId,this.conversationId&&localStorage.setItem(g,this.conversationId),this.lead=s.lead??this.lead,this.lead&&localStorage.setItem(d,JSON.stringify(this.lead)),this.messages=[...this.messages,{role:"agent",content:s.reply||"I could not answer that yet. Please share your contact and requirement so the team can follow up."}],p(this.messages)}catch(i){this.messages=[...this.messages,{role:"agent",content:i instanceof Error?`I could not connect to the sales agent: ${i.message}`:"I could not connect to the sales agent."}],p(this.messages)}finally{this.isSending=!1,this.render()}}}}customElements.define("jaabili-website-sales-widget",h),document.querySelector("jaabili-website-sales-widget")||document.body.appendChild(document.createElement("jaabili-website-sales-widget"));function f(e){return`
    :host {
      --jaabili-accent: ${e.accent};
      color-scheme: dark;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .launcher {
      position: fixed;
      right: 22px;
      bottom: 22px;
      z-index: 2147483000;
      height: 48px;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 999px;
      padding: 0 18px;
      background: #ffffff;
      color: #0d0f12;
      font: inherit;
      font-size: 14px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 18px 48px rgba(0,0,0,0.3);
      cursor: pointer;
    }

    .launcher-dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: var(--jaabili-accent);
      box-shadow: 0 0 20px var(--jaabili-accent);
    }

    .panel {
      position: fixed;
      right: 22px;
      bottom: 82px;
      z-index: 2147483000;
      width: min(390px, calc(100vw - 28px));
      height: min(620px, calc(100vh - 112px));
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 22px;
      background: #1f1f1f;
      box-shadow: 0 28px 90px rgba(0,0,0,0.5);
      overflow: hidden;
      display: none;
    }

    .panel.open {
      display: flex;
      flex-direction: column;
      animation: jaabili-panel-in 180ms ease-out;
    }

    header {
      padding: 18px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
      background: #181818;
    }

    strong {
      display: block;
      color: #fff;
      font-size: 15px;
    }

    header span {
      display: block;
      margin-top: 4px;
      color: rgba(255,255,255,0.52);
      font-size: 12px;
      line-height: 1.5;
    }

    .close {
      width: 34px;
      height: 34px;
      border: 0;
      border-radius: 999px;
      background: rgba(255,255,255,0.08);
      color: #fff;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
    }

    .messages {
      min-height: 0;
      flex: 1;
      overflow-y: auto;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: radial-gradient(circle at 50% 20%, rgba(16,184,166,0.12), transparent 32%), #111315;
    }

    .lead-status {
      margin: 12px 14px 0;
      border: 1px solid rgba(16,184,166,0.24);
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(16,184,166,0.12), rgba(255,255,255,0.04));
      padding: 12px;
      color: #fff;
    }

    .lead-status > div:first-child {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .lead-kicker {
      display: block;
      color: rgba(255,255,255,0.48);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .lead-status strong {
      font-size: 13px;
    }

    .lead-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
    }

    .lead-pills span {
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 999px;
      padding: 5px 8px;
      color: rgba(255,255,255,0.56);
      font-size: 11px;
      font-weight: 700;
    }

    .lead-pills span.ready,
    .lead-pills span.hot {
      border-color: rgba(16,184,166,0.36);
      color: #95fff2;
      background: rgba(16,184,166,0.12);
    }

    .lead-status p {
      margin: 10px 0 0;
      color: rgba(255,255,255,0.62);
      font-size: 12px;
      line-height: 1.45;
    }

    .message {
      max-width: 86%;
      border-radius: 18px;
      padding: 11px 13px;
      color: rgba(255,255,255,0.78);
      font-size: 13px;
      line-height: 1.55;
      white-space: pre-wrap;
    }

    .message.agent {
      align-self: flex-start;
      background: #22262a;
      border: 1px solid rgba(255,255,255,0.08);
    }

    .message.visitor {
      align-self: flex-end;
      background: #f5f5f5;
      color: #111;
    }

    form {
      padding: 14px;
      background: #181818;
      border-top: 1px solid rgba(255,255,255,0.08);
    }

    .quick {
      margin: 0 6px 10px 0;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 999px;
      padding: 8px 10px;
      background: rgba(255,255,255,0.05);
      color: rgba(255,255,255,0.72);
      font: inherit;
      font-size: 12px;
      cursor: pointer;
    }

    .input-row {
      display: flex;
      gap: 8px;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 999px;
      background: #0f1011;
      padding: 6px;
    }

    input {
      min-width: 0;
      flex: 1;
      border: 0;
      background: transparent;
      color: #fff;
      font: inherit;
      font-size: 13px;
      outline: none;
      padding: 0 8px;
    }

    .input-row button[type="submit"] {
      border: 0;
      border-radius: 999px;
      background: var(--jaabili-accent);
      color: #06100e;
      font: inherit;
      font-size: 13px;
      font-weight: 800;
      padding: 10px 14px;
      cursor: pointer;
    }

    .typing {
      align-self: flex-start;
      display: flex;
      gap: 4px;
      padding: 10px 12px;
      border-radius: 999px;
      background: #22262a;
    }

    .typing i {
      width: 5px;
      height: 5px;
      border-radius: 999px;
      background: rgba(255,255,255,0.6);
      animation: jaabili-typing 900ms infinite ease-in-out;
    }

    .typing i:nth-child(2) { animation-delay: 120ms; }
    .typing i:nth-child(3) { animation-delay: 240ms; }

    @keyframes jaabili-panel-in {
      from { opacity: 0; transform: translateY(12px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes jaabili-typing {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.42; }
      40% { transform: translateY(-4px); opacity: 1; }
    }

    @media (max-width: 520px) {
      .launcher {
        right: 14px;
        bottom: 14px;
      }

      .panel {
        inset: auto 10px 72px 10px;
        width: auto;
        height: min(620px, calc(100vh - 92px));
        border-radius: 20px;
      }
    }
  `}function n(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function b(){try{const e=JSON.parse(localStorage.getItem(l)||"[]");if(Array.isArray(e)&&e.length>0)return e.slice(-16)}catch{localStorage.removeItem(l)}return[{role:"agent",content:"Hi, I am the website sales assistant. I can answer questions, help you choose the right next step, and route urgent inquiries to the team."}]}function p(e){localStorage.setItem(l,JSON.stringify(e.slice(-16)))}function m(){try{const e=localStorage.getItem(d);return e?JSON.parse(e):null}catch{return localStorage.removeItem(d),null}}function x(e){return e.grade&&typeof e.score=="number"?`${e.grade}-grade lead, ${e.score}/100`:e.qualification?`${e.qualification} lead`:"Qualifying lead"}})();
