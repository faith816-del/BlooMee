document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
      alert(`You clicked: ${btn.textContent}`);
    });
  });
});