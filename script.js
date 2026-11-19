const now = new Date();
const $ = selector => document.querySelector(selector);
const setText = (selector, text) => { const el = $(selector); if (el) el.textContent = text; };
const weekdayLong = date => new Intl.DateTimeFormat('en', { weekday: 'long' }).format(date).toUpperCase();

setText('#weekday', weekdayLong(now));
setText('#day', now.getDate());
setText('#widgetWeekday', weekdayLong(now));
setText('#widgetDay', now.getDate());
setText('#dockDay', now.getDate());
setText('#dockWeekday', new Intl.DateTimeFormat('en', { weekday: 'short' }).format(now).toUpperCase());
setText('#year', now.getFullYear());
setText('#appCalDay', now.getDate());
setText('#appCalWeekday', new Intl.DateTimeFormat('en', { weekday: 'short' }).format(now).toUpperCase());

// Clock: menu-bar time is the visitor's, the analog clock is India time.
const updateClock = () => {
  setText('#systemTime', new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: '2-digit', hour: 'numeric', minute: '2-digit' }).format(new Date()));
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const part = name => Number(parts.find(item => item.type === name).value);
  const hour = part('hour') % 12, minute = part('minute'), second = part('second');
  $('#hourHand').style.transform = `translate(-50%,-100%) rotate(${hour * 30 + minute * .5}deg)`;
  $('#minuteHand').style.transform = `translate(-50%,-100%) rotate(${minute * 6 + second * .1}deg)`;
  $('#secondHand').style.transform = `translate(-50%,-100%) rotate(${second * 6}deg)`;
};
if ($('#hourHand')) { updateClock(); setInterval(updateClock, 1000); }

const grid = $('#calendarGrid');
if (grid) {
  ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(day => {
    const label = document.createElement('span'); label.textContent = day; grid.append(label);
  });
  const year = now.getFullYear(), month = now.getMonth();
  const offset = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  for (let blank = 0; blank < offset; blank++) grid.append(document.createElement('span'));
  for (let day = 1; day <= totalDays; day++) {
    const cell = document.createElement('span'); cell.textContent = day;
    if (day === now.getDate()) cell.className = 'today';
    grid.append(cell);
  }
}

// Weather: live 7-day forecast for Jaipur from Open-Meteo (free, no API key).
const ICONS = {
  sun: '<svg class="sun-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1m0-15.6-2.1 2.1M6.3 17.7l-2.1 2.1"/></svg>',
  cloud: '<svg class="cloud-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 18.5h11.2a4.1 4.1 0 0 0 .3-8.2 6 6 0 0 0-11.4 1.1 3.6 3.6 0 0 0-.1 7.1Z"/></svg>',
  rain: '<svg class="cloud-icon rain-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 14.5h11.2a4.1 4.1 0 0 0 .3-8.2 6 6 0 0 0-11.4 1.1 3.6 3.6 0 0 0-.1 7.1Z"/><path class="drops" d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/></svg>'
};
// WMO codes: 0-1 clear, 51-67 drizzle/rain, 80+ showers and storms, everything else cloudy.
const iconFor = code => code <= 1 ? 'sun' : (code >= 51 && code <= 67) || code >= 80 ? 'rain' : 'cloud';
const forecast = $('#forecast');
if (forecast) {
  fetch('https://api.open-meteo.com/v1/forecast?latitude=26.91&longitude=75.79&daily=weather_code,temperature_2m_max&timezone=Asia%2FKolkata&forecast_days=7')
    .then(response => { if (!response.ok) throw new Error(response.status); return response.json(); })
    .then(({ daily }) => {
      forecast.innerHTML = daily.time.map((day, i) => {
        const label = new Intl.DateTimeFormat('en', { weekday: 'short', timeZone: 'UTC' }).format(new Date(day)).slice(0, 2);
        return `<div class="forecast-day"><span>${label}</span>${ICONS[iconFor(daily.weather_code[i])]}<small>${Math.round(daily.temperature_2m_max[i])}°</small></div>`;
      }).join('');
    })
    .catch(() => { forecast.innerHTML = '<small class="forecast-status">Forecast unavailable</small>'; });
}

// Music: load YouTube only on first play, then toggle play/pause.
const playButton = $('#musicPlay');
const trackPlayer = $('#trackPlayer');
if (playButton && trackPlayer) {
  let playing = false;
  const send = func => trackPlayer.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), 'https://www.youtube.com');
  playButton.addEventListener('click', () => {
    playing = !playing;
    if (!trackPlayer.src) trackPlayer.src = 'https://www.youtube.com/embed/qzE9tNcUUss?enablejsapi=1&playsinline=1&autoplay=1';
    else send(playing ? 'playVideo' : 'pauseVideo');
    playButton.textContent = playing ? 'Ⅱ' : '▶';
    playButton.setAttribute('aria-pressed', String(playing));
    playButton.setAttribute('aria-label', playing ? 'Pause with the IE' : 'Play with the IE');
  });
}

// About card: video follows the pointer on desktop, plays only while hovered.
const aboutCard = $('.about');
const aboutVideo = aboutCard?.querySelector('video');
if (aboutCard && aboutVideo) {
  const play = () => { aboutVideo.muted = true; aboutVideo.play().catch(() => {}); };
  const moveVideoToPointer = event => {
    const card = aboutCard.getBoundingClientRect();
    const videoWidth = aboutVideo.offsetWidth || 220, videoHeight = aboutVideo.offsetHeight || 165;
    const x = Math.max(videoWidth / 2 + 12, Math.min(card.width - videoWidth / 2 - 12, event.clientX - card.left));
    const y = Math.max(videoHeight / 2 + 18, Math.min(card.height - videoHeight / 2 - 18, event.clientY - card.top));
    aboutCard.style.setProperty('--video-left', `${x}px`);
    aboutCard.style.setProperty('--video-top', `${y}px`);
  };
  aboutCard.addEventListener('pointerenter', event => { if (event.pointerType !== 'mouse') return; aboutCard.classList.add('is-hovering'); moveVideoToPointer(event); play(); });
  aboutCard.addEventListener('pointermove', event => { if (event.pointerType === 'mouse') moveVideoToPointer(event); });
  aboutCard.addEventListener('pointerleave', () => { aboutCard.classList.remove('is-hovering'); aboutVideo.pause(); });
  // Touch screens show the video inline, so play it when it scrolls into view.
  if (matchMedia('(hover: none)').matches && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => entry.isIntersecting ? play() : aboutVideo.pause()).observe(aboutVideo);
  }
}
