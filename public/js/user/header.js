const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const closeBtn = document.getElementById('closeBtn');
const overlay = document.getElementById('overlay');

hamburger.addEventListener('click', () => {
  sidebar.classList.add('active');
  overlay.classList.add('active');
  document.body.classList.add('no-scroll'); // 🔒 Disable background scroll
});

closeBtn.addEventListener('click', () => {
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
  document.body.classList.remove('no-scroll'); // 🔓 Re-enable scroll
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
  document.body.classList.remove('no-scroll'); // 🔓 Re-enable scroll
});
