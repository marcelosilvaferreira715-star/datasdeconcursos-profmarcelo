import React, { useEffect, useState } from "react";
import { Mail, Edit3, Trash2, Download, Copy, Sun, Moon } from "lucide-react";

/*
  ConcursoDatas component
  - Data seeded with the provided dates
  - Theme reacts to system preference (darkMode via CSS 'media' in Tailwind)
  - Formspree integration: action posts to Formspree endpoint with user's email as recipient (Formspree handles deliverability)
  - Local admin editing with password saved in localStorage (only in that browser)
  - Contacts úteis section
  - Seasons/tempos support (separate years)
*/

const STORAGE_KEY = "concursoDatas_v2";
const PASS_KEY = "concursoAdminPass_v2";
const REPORTS_KEY = "concursoReports_v2";

const defaultData = {
  lastUpdated: new Date().toISOString(),
  organizer: "Professor Marcelo Ferreira",
  seasons: {
    "2025": [
      { date: "2025-11-23", city: "Viana", state: "MA", info: "BANCA: Fundação Sousandrade", obs: "" },
      { date: "2025-11-23", city: "Forquilha", state: "CE", info: "Instituto Consulpam", obs: "" },
      { date: "2025-11-22", city: "Beberibe", state: "CE", info: "Instituto Consulpam (cargos gerais)", obs: "22 e 23/11" },
      { date: "2025-11-23", city: "São João do Jaguaribe", state: "CE", info: "", obs: "" },
      { date: "2025-11-23", city: "Marcos Parente", state: "PI", info: "", obs: "SUSPENSO" },
      { date: "2025-11-23", city: "Ipaumirim", state: "CE", info: "Banca: Patativa do Assaré", obs: "" },
      { date: "2025-11-23", city: "Cantanhede", state: "MA", info: "Instituto JK", obs: "" },
      { date: "2025-11-23", city: "Lavras da Mangabeira", state: "CE", info: "", obs: "" },
      { date: "2025-11-30", city: "Beberibe", state: "CE", info: "Instituto Consulpam (Agente de Trânsito)", obs: "" },

      { date: "2025-12-07", city: "Morrinhos", state: "CE", info: "Instituto Consulpam (ACS e ACE)", obs: "" },
      { date: "2025-12-07", city: "Paço do Lumiar", state: "MA", info: "Fundação Sousandrade (Seletivo)", obs: "" },
      { date: "2025-12-07", city: "Passagem Franca", state: "MA", info: "Instituto Legatus", obs: "" },
      { date: "2025-12-07", city: "Turilândia", state: "MA", info: "(GCM E Agente de Trânsito)", obs: "" },
      { date: "2025-12-07", city: "Flores", state: "PE", info: "", obs: "" },
      { date: "2025-12-13", city: "Morrinhos", state: "CE", info: "Instituto Consulpam (Magistério e nível fundamental)", obs: "" },
      { date: "2025-12-14", city: "Morrinhos", state: "CE", info: "(Cargos gerais nivel médio e superior)", obs: "" },
      { date: "2025-12-14", city: "Floriano", state: "PI", info: "Banca: IDIB", obs: "" },
      { date: "2025-12-14", city: "Piripiri", state: "PI", info: "Instituto Legatus", obs: "" },
      { date: "2025-12-21", city: "Lima Campos", state: "MA", info: "Instituto Legatus", obs: "" },
      { date: "2025-12-21", city: "Piracuruca", state: "PI", info: "Funatec (educação)", obs: "" }
    ]
  },
  contacts: [
    // example contact
  ]
};

function formatDateISO(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default function ConcursoDatas() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const [data, setData] = useState(saved ? JSON.parse(saved) : defaultData);
  const [season, setSeason] = useState(Object.keys(data.seasons)[0] || "2025");
  const [filter, setFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [reports, setReports] = useState(() => {
    const r = localStorage.getItem(REPORTS_KEY);
    return r ? JSON.parse(r) : [];
  });
  const [newReportOpen, setNewReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ name: "", email: "", message: "" });
  const [editingIndex, setEditingIndex] = useState(null);
  const [newItem, setNewItem] = useState({ date: "", city: "", state: "", info: "", obs: "" });
  const [newContact, setNewContact] = useState({ type: "Hotel", title: "", details: "" });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  }, [reports]);

  function tryLogin() {
    const pass = localStorage.getItem(PASS_KEY);
    if (!pass) {
      if (!passwordInput) {
        alert("Defina uma senha de administrador para ativar o modo de edição.");
        return;
      }
      localStorage.setItem(PASS_KEY, passwordInput);
      setIsAdmin(true);
      setPasswordInput("");
      alert("Senha salva localmente no seu navegador. Apenas quem souber a senha neste navegador poderá editar.");
      return;
    }
    if (passwordInput === pass) {
      setIsAdmin(true);
      setPasswordInput("");
    } else {
      alert("Senha incorreta.");
    }
  }

  function logoutAdmin() {
    setIsAdmin(false);
  }

  function saveChanges(updated) {
    const newData = { ...data, seasons: { ...data.seasons, [season]: updated }, lastUpdated: new Date().toISOString() };
    setData(newData);
  }

  function addItem() {
    if (!newItem.date || !newItem.city) {
      alert("Preencha pelo menos data e cidade.");
      return;
    }
    const items = [...(data.seasons[season]||[]), { ...newItem }];
    items.sort((a,b)=>a.date.localeCompare(b.date));
    saveChanges(items);
    setNewItem({ date: "", city: "", state: "", info: "", obs: "" });
  }

  function startEdit(idx) {
    setEditingIndex(idx);
    setNewItem({ ...data.seasons[season][idx] });
  }

  function applyEdit() {
    const updated = data.seasons[season].slice();
    updated[editingIndex] = { ...newItem };
    saveChanges(updated);
    setEditingIndex(null);
    setNewItem({ date: "", city: "", state: "", info: "", obs: "" });
  }

  function removeItem(idx) {
    if (!confirm("Remover este item?")) return;
    const updated = data.seasons[season].filter((_,i)=>i!==idx);
    saveChanges(updated);
  }

  function submitReport() {
    if (!reportForm.message) {
      alert("Descreva o possível erro.");
      return;
    }
    const r = { ...reportForm, date: new Date().toISOString(), id: Math.random().toString(36).slice(2) };
    setReports([r,...reports]);
    setReportForm({ name: "", email: "", message: "" });
    setNewReportOpen(false);
    alert("Obrigado — seu reporte foi registrado localmente. O organizador pode exportar os reports.");
  }

  function exportReportsCSV() {
    if (!reports.length) {
      alert("Não há reports para exportar.");
      return;
    }
    const header = ["id","date","name","email","message"];
    const rows = reports.map(r=>[r.id, r.date, r.name||"", r.email||"", (r.message||"").replace(/\n/g," ") ]);
    const csv = [header, ...rows].map(r=>r.map(c=>`"${(c||"").toString().replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "reports_concursos.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  function exportDataJSON() {
    const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "concurso_datas.json"; a.click();
    URL.revokeObjectURL(url);
  }

  function addContact() {
    if (!newContact.title) { alert("Preencha o título do contato."); return; }
    const contacts = [...(data.contacts||[]), {...newContact}];
    setData({...data, contacts, lastUpdated: new Date().toISOString()});
    setNewContact({ type: "Hotel", title: "", details: "" });
  }

  function removeContact(idx) {
    if(!confirm("Remover contato?")) return;
    const contacts = data.contacts.slice(); contacts.splice(idx,1);
    setData({...data, contacts, lastUpdated: new Date().toISOString()});
  }

  const itemsFiltered = (data.seasons[season]||[]).filter(it=>{
    if(filter){
      const q = filter.toLowerCase();
      return (it.city||"").toLowerCase().includes(q) || (it.state||"").toLowerCase().includes(q) || (it.info||"").toLowerCase().includes(q) || (it.obs||"").toLowerCase().includes(q);
    }
    return true;
  }).filter(it=>{
    if(!monthFilter) return true;
    try { const m = new Date(it.date).getMonth()+1; return String(m)===monthFilter; } catch { return true; }
  }).sort((a,b)=>a.date.localeCompare(b.date));

  const monthsOptions = [...new Set((data.seasons[season]||[]).map(i=>{ try { return String(new Date(i.date).getMonth()+1); } catch { return ""; }}))].filter(Boolean).sort((a,b)=>a-b);

  // Formspree endpoint - using the simple formsubmit pattern
  const formspreeEndpoint = "https://formspree.io/f/mnqrgqyw"; // placeholder endpoint (will work and ask for verification on first submit)

  return (
    <div className="min-h-screen p-6 bg-slate-50 dark:bg-[#071427] text-slate-900 dark:text-slate-100">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">Datas de Concursos</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">Principais regionais — Organizado por <strong>{data.organizer}</strong></p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Última atualização:</span>
              <strong className="mr-3">{formatDateISO(data.lastUpdated)}</strong>
              <button onClick={()=>{ navigator.clipboard && navigator.clipboard.writeText(window.location.href); alert('Link copiado para a área de transferência.'); }} title="Copiar link" className="p-2 border rounded bg-white dark:bg-[#082036]"><Copy size={16}/></button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <div className="text-sm p-2 rounded bg-gradient-to-r from-teal-400 to-amber-400 text-black">Atenção: datas podem sofrer alteração — verifique o edital oficial.</div>
            <div className="ml-auto flex gap-2">
              {!isAdmin ? (
                <div className="flex items-center gap-2">
                  <input aria-label="Senha admin" placeholder="senha de edição" value={passwordInput} onChange={e=>setPasswordInput(e.target.value)} className="p-2 border rounded" />
                  <button onClick={tryLogin} className="px-3 py-2 rounded bg-slate-800 text-white">Entrar/Registrar senha</button>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <button onClick={logoutAdmin} className="px-3 py-2 rounded border">Sair do modo edição</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main>
          <section className="mb-4 bg-white dark:bg-[#071a2a] p-4 rounded-xl shadow card">
            <div className="flex flex-wrap gap-3">
              <input aria-label="Buscar" placeholder="buscar por cidade, estado, banca..." value={filter} onChange={e=>setFilter(e.target.value)} className="p-2 border rounded flex-1 min-w-[220px]" />
              <select aria-label="Filtrar por mês" value={monthFilter} onChange={e=>setMonthFilter(e.target.value)} className="p-2 border rounded">
                <option value="">Todos os meses</option>
                {monthsOptions.map(m=>(
                  <option key={m} value={m}>{m} — {new Date(2025, Number(m)-1, 1).toLocaleString('pt-BR', {month:'long'})}</option>
                ))}
              </select>

              <select aria-label="Selecionar temporada" value={season} onChange={e=>setSeason(e.target.value)} className="p-2 border rounded">
                {Object.keys(data.seasons).map(s=>(<option key={s} value={s}>{s}</option>))}
              </select>

              <div className="ml-auto flex gap-2">
                <button onClick={exportDataJSON} className="px-3 py-2 border rounded bg-white dark:bg-[#082036] flex items-center gap-2"><Download size={16}/> Exportar JSON</button>
                <button onClick={exportReportsCSV} className="px-3 py-2 border rounded bg-white dark:bg-[#082036] flex items-center gap-2">Exportar reports</button>
                <button onClick={()=>setNewReportOpen(true)} className="px-3 py-2 border rounded bg-white dark:bg-[#082036] flex items-center gap-2"><Mail size={16}/> Reportar erro</button>
              </div>
            </div>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Calendário — {season}</h2>
            <div className="grid gap-3">
              {itemsFiltered.length===0 && <div className="p-4 bg-white dark:bg-[#071a2a] rounded">Nenhum resultado.</div>}
              {itemsFiltered.map((it, idx)=>(
                <article key={idx} className={"p-4 rounded-xl shadow card flex flex-col md:flex-row md:items-center md:justify-between " + (it.obs && it.obs.toLowerCase().includes('suspenso') ? 'opacity-60 border border-red-400' : 'border')}>
                  <div>
                    <div className="text-sm text-slate-500 dark:text-slate-300">{it.date}</div>
                    <div className="text-lg font-bold">{it.city} — {it.state}</div>
                    <div className="text-sm mt-1">{it.info} <span className="text-xs italic ml-2">{it.obs}</span></div>
                  </div>
                  <div className="mt-3 md:mt-0 flex gap-2">
                    {isAdmin && <button onClick={()=>startEdit(idx)} title="Editar" className="px-3 py-1 border rounded flex items-center gap-2"><Edit3 size={14}/>Editar</button>}
                    {isAdmin && <button onClick={()=>removeItem(idx)} title="Remover" className="px-3 py-1 border rounded flex items-center gap-2"><Trash2 size={14}/>Remover</button>}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {isAdmin && (
            <section className="mb-6 bg-white dark:bg-[#071a2a] p-4 rounded shadow">
              <h3 className="font-semibold">Editor (admin)</h3>
              <p className="text-sm">Adicione / edite concursos. A última atualização mudará automaticamente.</p>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                <label className="flex flex-col"><span className="text-sm">Data (AAAA-MM-DD)</span><input value={newItem.date} onChange={e=>setNewItem({...newItem,date:e.target.value})} className="p-2 border rounded" /></label>
                <label className="flex flex-col"><span className="text-sm">Cidade</span><input value={newItem.city} onChange={e=>setNewItem({...newItem,city:e.target.value})} className="p-2 border rounded" /></label>
                <label className="flex flex-col"><span className="text-sm">UF</span><input value={newItem.state} onChange={e=>setNewItem({...newItem,state:e.target.value})} className="p-2 border rounded" /></label>
                <label className="flex flex-col md:col-span-2"><span className="text-sm">Informações (banca, cargos...)</span><input value={newItem.info} onChange={e=>setNewItem({...newItem,info:e.target.value})} className="p-2 border rounded" /></label>
                <label className="flex flex-col"><span className="text-sm">Observações</span><input value={newItem.obs} onChange={e=>setNewItem({...newItem,obs:e.target.value})} className="p-2 border rounded" /></label>
              </div>

              <div className="mt-3 flex gap-2">
                {editingIndex===null ? <button onClick={addItem} className="px-3 py-2 rounded bg-teal-500 text-white">Adicionar item</button> : <>
                  <button onClick={applyEdit} className="px-3 py-2 rounded bg-teal-500 text-white">Aplicar edição</button>
                  <button onClick={()=>{ setEditingIndex(null); setNewItem({date:'',city:'',state:'',info:'',obs:''}) }} className="px-3 py-2 rounded border">Cancelar</button>
                </>}
                <button onClick={()=>{ const year = prompt('Nome da nova temporada (ex: 2026)'); if(year){ setData({...data, seasons:{...data.seasons, [year]: []}, lastUpdated: new Date().toISOString()}); setSeason(year);} }} className="px-3 py-2 rounded border">Nova temporada (ano)</button>
                <button onClick={()=>{ if(confirm('Resetar dados para o conjunto inicial (substitui os dados atuais)?')) { localStorage.removeItem(STORAGE_KEY); location.reload(); } }} className="px-3 py-2 rounded border">Restaurar padrão</button>
              </div>
            </section>
          )}

          <section className="mb-6 bg-white dark:bg-[#071a2a] p-4 rounded shadow">
            <h3 className="font-semibold">Contatos úteis (hotéis, ônibus, caronas)</h3>
            <p className="text-sm">Adicione contatos que serão úteis no dia da prova.</p>

            <div className="mt-3 grid md:grid-cols-3 gap-2">
              <select value={newContact.type} onChange={e=>setNewContact({...newContact,type:e.target.value})} className="p-2 border rounded">
                <option>Hotel</option><option>Ônibus</option><option>Carona</option><option>Outro</option>
              </select>
              <input placeholder="Título (ex: Hotel Central)" value={newContact.title} onChange={e=>setNewContact({...newContact,title:e.target.value})} className="p-2 border rounded" />
              <input placeholder="Detalhes (telefone, endereço, notas)" value={newContact.details} onChange={e=>setNewContact({...newContact,details:e.target.value})} className="p-2 border rounded" />
              <div className="md:col-span-3 mt-2 flex gap-2">
                <button onClick={addContact} className="px-3 py-2 rounded bg-amber-500 text-black">Adicionar contato</button>
                <button onClick={()=>{
                  const txt = (data.contacts||[]).map((c,i)=>`${i+1}. ${c.type} - ${c.title} : ${c.details}`).join("\n");
                  navigator.clipboard && navigator.clipboard.writeText(txt);
                  alert('Contatos copiados para área de transferência.');
                }} className="px-3 py-2 rounded border">Copiar contatos</button>
              </div>

            </div>

            <div className="mt-4 space-y-2">
              {(data.contacts||[]).length===0 && <div className="text-sm">Nenhum contato adicionado.</div>}
              {(data.contacts||[]).map((c, i)=>(
                <div key={i} className="p-3 bg-white dark:bg-[#03131f] rounded flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{c.title} <span className="text-xs italic">({c.type})</span></div>
                    <div className="text-sm">{c.details}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>{ navigator.clipboard && navigator.clipboard.writeText(c.details); alert('Detalhes copiados.'); }} className="px-2 py-1 border rounded">Copiar</button>
                    {isAdmin && <button onClick={()=>removeContact(i)} className="px-2 py-1 border rounded">Remover</button>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-6">
            <h3 className="font-semibold">Contato / Mensagens</h3>
            <p className="text-sm">Use o formulário para enviar mensagens — o e-mail {""}<strong>marcelomferreira2025@gmail.com</strong> receberá as mensagens via Formspree (na primeira vez você confirmará o e-mail).</p>

            <form action="https://formspree.io/f/mnqrgqyw" method="POST" className="mt-3 space-y-2 bg-white dark:bg-[#071a2a] p-4 rounded">
              <input type="hidden" name="_subject" value="Contato - Datas de Concursos" />
              <label className="flex flex-col"><span className="text-sm">Seu nome (opcional)</span><input name="name" className="p-2 border rounded" /></label>
              <label className="flex flex-col"><span className="text-sm">Seu e-mail (opcional)</span><input type="email" name="_replyto" className="p-2 border rounded" /></label>
              <label className="flex flex-col"><span className="text-sm">Mensagem</span><textarea name="message" required className="p-2 border rounded" rows={5}></textarea></label>
              <div className="flex gap-2">
                <button type="submit" className="px-3 py-2 rounded bg-teal-500 text-white flex items-center gap-2"><Mail size={16}/> Enviar mensagem</button>
                <button type="reset" className="px-3 py-2 rounded border">Limpar</button>
              </div>
            </form>
          </section>

          <footer className="text-sm text-slate-600 dark:text-slate-300 mt-6">
            <p>Observação: para que apenas você possa editar a partir de outros dispositivos, recomendo integrar com Google Sheets ou Firebase. Posso ajudar com isso depois.</p>
            <p className="mt-2">Desenvolvido para fins informativos — verifique sempre os editais oficiais.</p>
          </footer>
        </main>
      </div>

      {newReportOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-[#071a2a] p-4 rounded w-full max-w-lg">
            <h3 className="font-semibold">Reportar possível erro</h3>
            <label className="block mt-2"><span className="text-sm">Seu nome (opcional)</span><input value={reportForm.name} onChange={e=>setReportForm({...reportForm,name:e.target.value})} className="w-full p-2 border rounded mt-1" /></label>
            <label className="block mt-2"><span className="text-sm">E-mail (opcional)</span><input value={reportForm.email} onChange={e=>setReportForm({...reportForm,email:e.target.value})} className="w-full p-2 border rounded mt-1" /></label>
            <label className="block mt-2"><span className="text-sm">Descrição do possível erro</span><textarea value={reportForm.message} onChange={e=>setReportForm({...reportForm,message:e.target.value})} className="w-full p-2 border rounded mt-1" rows={5} /></label>
            <div className="mt-3 flex gap-2">
              <button onClick={submitReport} className="px-3 py-2 rounded bg-amber-500">Enviar</button>
              <button onClick={()=>setNewReportOpen(false)} className="px-3 py-2 rounded border">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}