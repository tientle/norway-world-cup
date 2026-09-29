(() => {
  const $ = (selector) => document.querySelector(selector);
  const pct = (value) => `${Math.round(value * 100)}%`;
  const state = { opponent: 'Brazil', friendlyWeight: 0.5, halfLife: 365 };
  const progress = $('#reading-progress');
  let scheduled = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? Math.max(0, Math.min(100, scrollY / max * 100)) : 0}%`;
    scheduled = false;
  };
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); } }, { passive: true });
  addEventListener('resize', updateProgress);
  updateProgress();
  $('#ten-matches').innerHTML = Array.from({ length: 10 }, (_, i) => `<i aria-hidden="true" title="Illustrative tile ${i + 1}"></i>`).join('');

  fetch('data.json').then(response => {
    if (!response.ok) throw new Error(`Data unavailable (${response.status})`);
    return response.json();
  }).then(data => {
    const base = data.scenarios.find(s => s.halfLife === 365 && s.friendlyWeight === 0.5);
    if (!base) throw new Error('Default scenario is missing');
    $('#qualifying-list').innerHTML = data.qualifiers.map(g =>
      `<div class="qual-row"><span>${g.date.replace(', 2025', '')}</span><span>${g.opponent}</span><b>${g.for}–${g.against}</b></div>`).join('');
    $('#result-list').innerHTML = data.results.map(g => {
      const chance = base.games[g.opponent]?.['Norway win'];
      const win = g.for > g.against;
      return `<div class="result-row"><span class="date">${g.date}</span><span class="opp">${g.opponent}</span><span class="score ${win ? 'win' : ''}">${g.for}–${g.against}</span><div class="result-meter" aria-label="Pre-tournament Norway win probability ${pct(chance)} against ${g.opponent}"><span class="track"><i style="width:${chance * 100}%"></i></span><b>${pct(chance)}</b></div></div>`;
    }).join('');

    function render() {
      const scenario = data.scenarios.find(s => s.halfLife === state.halfLife && s.friendlyWeight === state.friendlyWeight);
      const game = scenario.games[state.opponent];
      const win = game['Norway win'], draw = game.Draw, loss = game['Opponent win'];
      $('#card-opponent').textContent = state.opponent.toUpperCase();
      $('#loss-team').textContent = state.opponent.toUpperCase();
      $('#norway-prob').textContent = pct(win);
      $('#win-label').textContent = pct(win);
      $('#draw-label').textContent = pct(draw);
      $('#loss-label').textContent = pct(loss);
      $('#norway-xg').textContent = game['Norway xGoals*'].toFixed(2);
      $('#opponent-xg').textContent = game['Opponent xGoals*'].toFixed(2);
      const bar = $('#outcome-bar');
      bar.replaceChildren(...[['win',win],['tie',draw],['lose',loss]].map(([name,value]) => {
        const segment = document.createElement('div'); segment.className = name; segment.style.width = `${value * 100}%`; return segment;
      }));
      bar.setAttribute('aria-label', `Norway ${pct(win)}, draw ${pct(draw)}, ${state.opponent} ${pct(loss)}`);
      // A quoted 90-minute win price is required; outright and advancement prices are different contracts.
      const ledgers = data.marketOdds.map(q => {
        const p = scenario.games[q.opponent]['Norway win'];
        const breakEven = 1 / q.decimal;
        const edge = p - breakEven;
        const expected = 100 * (p * q.decimal - 1);
        const stake = edge > 0.05 ? 100 : 0;
        const realized = stake === 0 ? 0 : q.norwayWon90 ? stake * (q.decimal - 1) : -stake;
        return { ...q, p, breakEven, edge, expected, stake, realized };
      });
      const signed = n => `${n >= 0 ? '+' : '−'}$${Math.abs(n).toFixed(0)}`;
      $('#value-rows').innerHTML = ledgers.map(q => `<tr><td>${q.opponent}</td><td><a href="${q.url}">+${q.american}</a><small> · ${q.quoteDate}</small></td><td>${pct(q.breakEven)}</td><td>${pct(q.p)}</td><td>${q.edge >= 0 ? '+' : '−'}${pct(Math.abs(q.edge))}</td><td>${signed(q.expected)}</td><td class="${q.stake ? 'signal' : 'abstain'}">${q.stake ? '$100 signal' : 'Abstain'}</td></tr>`).join('');
      $('#settlement-rows').innerHTML = ledgers.map(q => `<div class="settlement-row"><span>${q.opponent} · ${q.regulation} after 90 minutes</span><span>${q.stake ? '$100 stake' : 'No bet'}</span><b>${q.stake ? signed(q.realized) : '$0'}</b></div>`).join('');
      const spent = ledgers.reduce((sum, q) => sum + q.stake, 0);
      const net = ledgers.reduce((sum, q) => sum + q.realized, 0);
      $('#settlement-summary').textContent = `Under these assumptions: $${spent} staked across ${spent / 100} bets; ${signed(net)} realized net (${spent ? Math.round(net / spent * 100) : 0}% return on stakes). This is a tiny retrospective illustration, not a validated edge.`;
      const range = data.scenarios.map(s => s.games[state.opponent]['Norway win']);
      const lo = Math.min(...range), hi = Math.max(...range);
      $('#change-note').textContent = `Across the nine displayed settings, Norway’s one-match chance against ${state.opponent} ranges from ${pct(lo)} to ${pct(hi)}. The current setting gives ${pct(win)}. This is sensitivity, not a confidence interval.`;
    }
    $('#opponent').addEventListener('change', event => { state.opponent = event.target.value; render(); });
    function bindButtons(container, attribute, key, convert) {
      $(container).addEventListener('click', event => {
        const button = event.target.closest(`button[${attribute}]`);
        if (!button) return;
        state[key] = convert(button.getAttribute(attribute));
        $(container).querySelectorAll('button').forEach(b => {
          const selected = b === button;
          b.classList.toggle('selected', selected);
          b.setAttribute('aria-pressed', String(selected));
        });
        render();
      });
    }
    bindButtons('#friendly-controls', 'data-weight', 'friendlyWeight', Number);
    bindButtons('#age-controls', 'data-half', 'halfLife', Number);
    render();
  }).catch(error => {
    console.error(error);
    $('#qualifying-list').textContent = 'The match data could not load. Serve this folder with a local web server or open it on GitHub Pages.';
    $('#result-list').textContent = 'The result data could not load.';
    $('#lab').querySelector('.lab-note').textContent = 'The interactive forecast data could not load. Please refresh the page.';
  });
})();
