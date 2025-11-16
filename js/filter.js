// js/filter.js
document.addEventListener('DOMContentLoaded', () => {
  const filterPanel = document.getElementById('filter-panel');
  const filterButton = document.querySelector('.filter-button');
  const filterClose = document.querySelector('.filter-close');
  const filterForm = document.querySelector('.filter-form');
  const eventList = document.querySelector('.event-list');

  // Inicial — garante classe consistente
  filterPanel.classList.remove('show', 'hide');
  filterPanel.classList.add('hide');

  // Toggle abrir filtro
  filterButton.addEventListener('click', (e) => {
    e.preventDefault();
    toggleFilter();
  });

  // fechar pelo botão close (link com href="#")
  filterClose.addEventListener('click', (e) => {
    e.preventDefault();
    closeFilter();
  });

  // fechar clicando fora do painel
  document.addEventListener('click', (e) => {
    if (!filterPanel.contains(e.target) && !filterButton.contains(e.target)) {
      closeFilter();
    }
  });

  function toggleFilter() {
    if (filterPanel.classList.contains('show')) closeFilter();
    else openFilter();
  }
  function openFilter() {
    filterPanel.classList.remove('hide');
    filterPanel.classList.add('show');
    // foco acessível
    const firstControl = filterPanel.querySelector('input, button, a, select');
    if (firstControl) firstControl.focus();
  }
  function closeFilter() {
    filterPanel.classList.remove('show');
    filterPanel.classList.add('hide');
  }

  // ---------- NUMERAÇÃO automática (badge) ----------
  function ensureBadges() {
    const articles = eventList.querySelectorAll('article.event-card');
    articles.forEach((article, idx) => {
      if (!article.querySelector('.order-badge')) {
        const badge = document.createElement('span');
        badge.className = 'order-badge';
        badge.setAttribute('aria-hidden', 'true');
        badge.style.cssText = 'display:inline-block;padding:0.25rem 0.5rem;border-radius:999px;background:#eee;font-weight:700;margin-right:0.5rem;';
        // inserir no início do título (se existir h3.event-name)
        const title = article.querySelector('.event-name');
        if (title) title.prepend(badge);
        else article.prepend(badge);
      }
    });
    updateBadges(); // sincroniza textos
  }

  function updateBadges() {
    const articles = Array.from(eventList.querySelectorAll('article.event-card'));
    articles.forEach((article, idx) => {
      const badge = article.querySelector('.order-badge');
      if (badge) badge.textContent = String(idx + 1);
    });
  }

  // ---------- Helpers para extrair valores ----------
  function parsePrice(article) {
    // prioridade: data-price; fallback: tenta extrair número do .price (menor valor)
    const dp = article.getAttribute('data-price');
    if (dp) return Number(dp) || Infinity;
    const pEl = article.querySelector('.price');
    if (!pEl) return Infinity;
    const txt = pEl.textContent.replace(/\s/g, '');
    // tenta achar primeiros números (ex: "100R$-500$")
    const nums = txt.match(/(\d+(\.\d+)?)/g);
    if (!nums) return Infinity;
    // usar o menor (ou primeiro)
    return Number(nums.map(n => n.replace(',', '.')).map(Number).filter(Boolean).sort((a,b)=>a-b)[0]);
  }

  function parseDistance(article) {
    // prioridade: data-distance; fallback: tenta achar "Xkm" em location ou data-dist text
    const dd = article.getAttribute('data-distance');
    if (dd) return Number(dd) || Infinity;
    const loc = article.querySelector('.location');
    if (!loc) return Infinity;
    const txt = loc.textContent;
    const match = txt.match(/(\d+(\.\d+)?)\s*(km|Km|KM)/);
    if (match) return Number(match[1]);
    return Infinity;
  }

  function parseRating(article) {
    const dr = article.getAttribute('data-rating');
    if (dr) return Number(dr) || 0;
    const rEl = article.querySelector('.rating');
    if (!rEl) return 0;
    const txt = rEl.textContent;
    // contar estrelas unicode (★)
    const stars = (txt.match(/★/g) || []).length;
    if (stars > 0) return stars;
    // fallback: procurar número
    const m = txt.match(/(\d+(\.\d+)?)/);
    return m ? Number(m[1]) : 0;
  }

  // ---------- Ordenação ----------
  function sortByPriceAsc() {
    const items = Array.from(eventList.querySelectorAll('li'));
    items.sort((a,b) => {
      const av = parsePrice(a.querySelector('article.event-card'));
      const bv = parsePrice(b.querySelector('article.event-card'));
      return av - bv;
    });
    renderSorted(items);
  }

  function sortByDistanceAsc() {
    const items = Array.from(eventList.querySelectorAll('li'));
    items.sort((a,b) => {
      const av = parseDistance(a.querySelector('article.event-card'));
      const bv = parseDistance(b.querySelector('article.event-card'));
      return av - bv;
    });
    renderSorted(items);
  }

  function sortByRatingDesc() {
    const items = Array.from(eventList.querySelectorAll('li'));
    items.sort((a,b) => {
      const av = parseRating(a.querySelector('article.event-card'));
      const bv = parseRating(b.querySelector('article.event-card'));
      return bv - av;
    });
    renderSorted(items);
  }

  function renderSorted(sortedItems) {
    // remove tudo e reappend na ordem
    eventList.innerHTML = '';
    sortedItems.forEach(li => eventList.appendChild(li));
    updateBadges();
  }

  // ---------- Manejo do submit do form de filtro ----------
  filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // prioriza a ordenação na seguinte ordem de checagem:
    // proximidade -> preco -> avaliacao (você pode ajustar)
    const form = new FormData(filterForm);
    // Se múltiplos checked, usar a primeira encontrada por ordem lógica abaixo
    if (form.get('f_proximidade')) {
      sortByDistanceAsc();
    } else if (form.get('f_preco')) {
      sortByPriceAsc();
    } else if (form.get('f_avaliacao')) {
      sortByRatingDesc();
    } else {
      // sem filtro: deixa ordem original (ou reseta para a ordem DOM inicial)
      // aqui apenas atualiza a numeração
      updateBadges();
    }
    closeFilter();
  });

  // inicializa badges e numeracao
  ensureBadges();
});
