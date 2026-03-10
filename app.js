const assets = [
  { symbol: 'USDT', name: 'Tether', amount: 1530.44, usd: 1530.44 },
  { symbol: 'TON', name: 'Toncoin', amount: 840.1, usd: 1860.0 },
  { symbol: 'BTC', name: 'Bitcoin', amount: 0.015, usd: 869.71 }
];

const history = [
  { type: 'Пополнение', asset: 'USDT', amount: '+500.00', time: 'сегодня 13:05' },
  { type: 'Отправка', asset: 'TON', amount: '-32.10', time: 'сегодня 10:22' },
  { type: 'Swap BTC→USDT', asset: 'BTC', amount: '-0.002', time: 'вчера 21:18' },
  { type: 'Оплата картой', asset: 'USDT', amount: '-24.00', time: 'вчера 09:40' }
];

const tabs = document.querySelectorAll('.tabbar button');
const screens = document.querySelectorAll('.screen');
const toast = document.getElementById('toast');
const assetList = document.getElementById('assetList');
const historyList = document.getElementById('historyList');

const openScreen = (screenName) => {
  screens.forEach((screen) => screen.classList.toggle('active', screen.dataset.screen === screenName));
  tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === screenName));
};

const showToast = (text) => {
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
};

function renderAssets() {
  assetList.innerHTML = assets
    .map(
      (asset) => `
      <li class="asset-item">
        <div>
          <strong>${asset.symbol}</strong>
          <p class="label">${asset.name}</p>
        </div>
        <div>
          <strong>$${asset.usd.toFixed(2)}</strong>
          <p class="label">${asset.amount}</p>
        </div>
      </li>
    `
    )
    .join('');
}

function renderHistory() {
  historyList.innerHTML = history
    .map(
      (item) => `
      <li>
        <span>${item.type} • ${item.asset}</span>
        <span>${item.amount}<br><small>${item.time}</small></span>
      </li>
    `
    )
    .join('');
}

function fillSelects() {
  const options = assets.map((a) => `<option value="${a.symbol}">${a.symbol}</option>`).join('');
  ['sendAsset', 'swapFrom', 'swapTo'].forEach((id) => (document.getElementById(id).innerHTML = options));
  document.getElementById('swapTo').selectedIndex = 1;
}

function applySwapPreview() {
  const from = document.getElementById('swapFrom').value;
  const to = document.getElementById('swapTo').value;
  const amount = Number(document.getElementById('swapAmount').value || 0);
  const preview = document.getElementById('swapPreview');

  if (!amount || from === to) {
    preview.textContent = from === to ? 'Выбери разные валюты' : 'Введите сумму для расчёта';
    return;
  }

  const rate = (from === 'BTC' && to === 'USDT') ? 58000 : (from === 'USDT' && to === 'TON') ? 0.46 : 1.1;
  preview.textContent = `≈ ${(amount * rate).toFixed(4)} ${to}`;
}

function bootstrap() {
  renderAssets();
  renderHistory();
  fillSelects();

  tabs.forEach((tab) => tab.addEventListener('click', () => openScreen(tab.dataset.tab)));
  document.querySelectorAll('[data-open]').forEach((btn) => btn.addEventListener('click', () => openScreen(btn.dataset.open)));

  document.getElementById('sendForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Транзакция отправлена ✅');
    openScreen('history');
  });

  document.getElementById('copyAddress').addEventListener('click', async () => {
    const address = document.getElementById('walletAddress').textContent;
    try {
      await navigator.clipboard.writeText(address);
      showToast('Адрес скопирован');
    } catch {
      showToast('Скопируй вручную: ' + address);
    }
  });

  document.getElementById('swapForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Swap выполнен ⚡');
    openScreen('history');
  });

  ['swapFrom', 'swapTo', 'swapAmount'].forEach((id) => {
    document.getElementById(id).addEventListener('input', applySwapPreview);
  });

  document.getElementById('freezeCard').addEventListener('click', () => {
    showToast('Карта временно заморожена');
  });

  document.getElementById('themeToggle').addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
  });

  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.expand();
    window.Telegram.WebApp.ready();
  }
}

bootstrap();
