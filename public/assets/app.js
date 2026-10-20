(() => {
  'use strict';
  const resources = JSON.parse(document.getElementById('resources-data').textContent);
  const byId = new Map(resources.map(item => [item.id, item]));
  const cards = [...document.querySelectorAll('.resource-card')];
  const search = document.getElementById('search');
  const dialog = document.getElementById('resource-dialog');
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const read = key => {
    try { const data = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(data) ? [...new Set(data.filter(id => byId.has(id)))] : []; }
    catch { return []; }
  };
  let favorites = new Set(read('centra:favorites'));
  let recent = read('centra:recent');
  let view = 'all', category = 'all', selected = null, toastTimer;
  function notify(message) {
    const notice = document.getElementById('notice');
    notice.textContent = message; notice.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { notice.hidden = true; }, 3200);
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { notify('El navegador no permite guardar cambios. Se mantendrán durante esta visita.'); }
  }
  function render() {
    const terms = normalize(search.value).split(/\s+/).filter(Boolean);
    let count = 0;
    cards.forEach((card, index) => {
      const item = byId.get(card.dataset.id);
      const haystack = normalize([item.title,item.category,item.description,item.service,item.keywords].join(' '));
      const visible = (category === 'all' || item.category === category) &&
        (view === 'all' || (view === 'favorites' ? favorites.has(item.id) : recent.includes(item.id))) && terms.every(term => haystack.includes(term));
      card.hidden = !visible;
      card.style.order = view === 'recent' ? recent.indexOf(item.id) : index;
      if (visible) count++;
      const button = card.querySelector('[data-favorite]');
      const saved = favorites.has(item.id);
      button.setAttribute('aria-pressed', String(saved));
      button.setAttribute('aria-label', `${saved ? 'Quitar' : 'Añadir'} ${item.title} ${saved ? 'de' : 'a'} favoritos`);
      button.firstElementChild.className = `bi bi-star${saved ? '-fill' : ''}`;
    });
    document.getElementById('favorite-count').textContent = favorites.size;
    document.getElementById('result-count').textContent = `${count} ${count === 1 ? 'recurso' : 'recursos'}`;
    document.getElementById('section-title').textContent = {all:'Todos los accesos',favorites:'Tus favoritos',recent:'Abiertos recientemente'}[view];
    document.getElementById('clear-search').hidden = !search.value;
    document.getElementById('empty-state').hidden = count !== 0;
    const initialEmpty = !terms.length && category === 'all';
    document.getElementById('empty-title').textContent = initialEmpty && view === 'favorites' ? 'Tus favoritos empiezan aquí' : initialEmpty && view === 'recent' ? 'Aún no hay accesos recientes' : 'No encontramos coincidencias';
    document.getElementById('empty-description').textContent = initialEmpty && view === 'favorites' ? 'Pulsa la estrella de un recurso para tenerlo siempre a mano.' : initialEmpty && view === 'recent' ? 'Los recursos que abras aparecerán aquí, del más reciente al más antiguo.' : 'Prueba otra palabra o cambia el área seleccionada.';
    document.querySelectorAll('[data-view]').forEach(button => { const active = button.dataset.view === view; button.classList.toggle('active',active); button.setAttribute('aria-pressed',String(active)); });
    document.querySelectorAll('[data-category]').forEach(button => { const active = button.dataset.category === category; button.classList.toggle('active',active); button.setAttribute('aria-pressed',String(active)); });
  }
  function recordOpen(id) {
    if (!byId.has(id)) return;
    recent = [id, ...recent.filter(other => other !== id)].slice(0,resources.length);
    save('centra:recent',recent);
    if (view === 'recent') render();
  }
  document.addEventListener('click', event => {
    const favorite = event.target.closest('[data-favorite]');
    if (favorite) { const id = favorite.dataset.favorite; favorites.has(id) ? favorites.delete(id) : favorites.add(id); save('centra:favorites',[...favorites]); render(); }
    const navigation = event.target.closest('[data-view]');
    if (navigation) { view = navigation.dataset.view; category = 'all'; search.value = ''; render(); }
    const filter = event.target.closest('[data-category]');
    if (filter) { category = filter.dataset.category; render(); }
    const detail = event.target.closest('[data-detail]');
    if (detail) {
      selected = byId.get(detail.dataset.detail);
      document.getElementById('dialog-category').textContent = selected.category;
      document.getElementById('dialog-title').textContent = selected.title;
      document.getElementById('dialog-description').textContent = selected.description;
      document.getElementById('dialog-service').textContent = selected.service;
      document.getElementById('dialog-url').value = selected.url;
      const open = document.getElementById('dialog-open');
      open.href = selected.url; open.dataset.openId = selected.id;
      document.getElementById('copy-link').innerHTML = '<i class="bi bi-copy" aria-hidden="true"></i> Copiar enlace';
      dialog.showModal();
    }
    const external = event.target.closest('[data-open-id]');
    if (external) recordOpen(external.dataset.openId);
  });
  document.addEventListener('auxclick', event => { const link = event.target.closest('[data-open-id]'); if (event.button === 1 && link) recordOpen(link.dataset.openId); });
  search.addEventListener('input',render);
  document.getElementById('clear-search').addEventListener('click',() => { search.value = ''; render(); search.focus(); });
  document.getElementById('reset-filters').addEventListener('click',() => { search.value = ''; category = 'all'; view = 'all'; render(); });
  document.getElementById('close-dialog').addEventListener('click',() => dialog.close());
  dialog.addEventListener('click',event => { if (event.target === dialog) { const rect=dialog.getBoundingClientRect(); if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom) dialog.close(); } });
  document.getElementById('copy-link').addEventListener('click',async () => {
    if (!selected) return;
    const button = document.getElementById('copy-link');
    try { await navigator.clipboard.writeText(selected.url); button.innerHTML = '<i class="bi bi-check2" aria-hidden="true"></i> Enlace copiado'; }
    catch { const input=document.getElementById('dialog-url'); input.focus(); input.select(); button.textContent = 'Seleccionado: usa Ctrl+C o Copiar'; }
  });
  document.addEventListener('keydown', event => {
    if(event.key==='/' && !event.ctrlKey && !event.metaKey && !event.altKey && !dialog.open && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) { event.preventDefault(); search.focus(); }
    if(event.key==='Escape' && document.activeElement===search) { search.value=''; render(); }
  });
  window.addEventListener('storage',event => { if(event.key===null || ['centra:favorites','centra:recent'].includes(event.key)) { favorites=new Set(read('centra:favorites')); recent=read('centra:recent'); render(); } });
  render();
})();
