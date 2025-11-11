document.addEventListener('DOMContentLoaded', () => {
  // Optional: Alert on button clicks
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
      alert(`You clicked: ${btn.textContent}`);
    });
  });

  const carousel = document.querySelector('.product-carousel');
  if (!carousel) return;

  const items = carousel.querySelectorAll('.carousel-item');
  const totalItems = items.length;

  // Clone all items and append them to the end for infinite scrolling
  items.forEach(item => {
    const clone = item.cloneNode(true);
    carousel.appendChild(clone);
  });

  let scrollAmount = 0;
  const scrollSpeed = 1; // pixels per frame

  function autoScroll() {
    scrollAmount += scrollSpeed;

    // When we've scrolled past the original items, reset scrollLeft
    if (scrollAmount >= carousel.scrollWidth / 2) {
      scrollAmount = 0;
    }

    carousel.scrollLeft = scrollAmount;
    requestAnimationFrame(autoScroll);
  }

  autoScroll();
});
// ================= ADD TO CART ANIMATION (like Oraimo) =================
const cartIcon = document.querySelector('.cart-icon'); // adjust if your class is different
const addButtons = document.querySelectorAll('.btn-add');

addButtons.forEach(button => {
  button.addEventListener('click', e => {
    const productCard = e.target.closest('.product-card');
    const img = productCard.querySelector('img');

    const imgRect = img.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    // Clone image for flying effect
    const flyingImg = img.cloneNode(true);
    flyingImg.style.position = 'fixed';
    flyingImg.style.left = imgRect.left + 'px';
    flyingImg.style.top = imgRect.top + 'px';
    flyingImg.style.width = imgRect.width + 'px';
    flyingImg.style.height = imgRect.height + 'px';
    flyingImg.style.borderRadius = '10px';
    flyingImg.style.transition = 'all 0.9s cubic-bezier(0.45, 0, 0.55, 1)';
    flyingImg.style.zIndex = 2000;
    flyingImg.style.pointerEvents = 'none';
    document.body.appendChild(flyingImg);

    // Animate to cart
    setTimeout(() => {
      flyingImg.style.left = cartRect.left + cartRect.width / 2 + 'px';
      flyingImg.style.top = cartRect.top + cartRect.height / 2 + 'px';
      flyingImg.style.width = '40px';
      flyingImg.style.height = '40px';
      flyingImg.style.opacity = '0';
    }, 50);

    // Remove clone after animation
    setTimeout(() => {
      flyingImg.remove();
      cartIcon.classList.add('cart-bounce'); // make cart bounce
      setTimeout(() => cartIcon.classList.remove('cart-bounce'), 400);
    }, 900);
  });
});


// ================= LEARN MORE DRAWER =================
const learnButtons = document.querySelectorAll('.btn-learn');

const drawer = document.createElement('div');
drawer.classList.add('learn-drawer');
drawer.innerHTML = `
  <div class="drawer-content">
    <button class="drawer-close">&times;</button>
    <div class="drawer-layout">
      <div class="drawer-left">
        <img class="drawer-img" src="" alt="">
      </div>
      <div class="drawer-right">
        <h2 class="drawer-title"></h2>
        <div class="drawer-rating">
          ⭐⭐⭐⭐⭐ <a href="#" class="review-link">Add your review ></a>
        </div>
        <p class="drawer-price"></p>
        <div class="drawer-desc"></div>
        <ul class="drawer-features">
          <li>All night long dryness</li>
          <li>Absorbs every single thing</li>
          <li>Clean and fresh</li>
        </ul>
        <div class="drawer-qty">
          Qty:
          <button class="qty-btn minus">−</button>
          <span class="qty-value">1</span>
          <button class="qty-btn plus">+</button>
        </div>
        <div class="drawer-safety">
          <a href="#" class="safety-link" title="Click for details">Safe Payment</a> • 
          <a href="#" class="safety-link" title="Click for details">Secure Logistics</a> • 
          <a href="#" class="safety-link" title="Click for details">Privacy Protection</a>
        </div>
        <div class="drawer-actions">
          <button class="drawer-add">Add to Cart</button>
          <button class="drawer-buy">Buy It Now</button>
        </div>
      </div>
    </div>
  </div>
`;
document.body.appendChild(drawer);

const overlay = document.createElement('div');
overlay.classList.add('overlay');
document.body.appendChild(overlay);

// Show drawer
learnButtons.forEach(button => {
  button.addEventListener('click', e => {
    const card = e.target.closest('.product-card');
    const img = card.querySelector('img').src;
    const name = card.querySelector('.product-name')?.textContent || '';
    const price = card.querySelector('.product-price')?.textContent || '';
    const desc = card.querySelector('.product-desc')?.textContent || 'No description available.';

    drawer.querySelector('.drawer-img').src = img;
    drawer.querySelector('.drawer-title').textContent = name;
    drawer.querySelector('.drawer-price').textContent = price;
    drawer.querySelector('.drawer-desc').textContent = desc;

    drawer.classList.add('open');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  });
});

// Close drawer
drawer.querySelector('.drawer-close').addEventListener('click', () => {
  drawer.classList.remove('open');
  overlay.classList.remove('show');
  document.body.style.overflow = 'auto';
});
overlay.addEventListener('click', () => {
  drawer.classList.remove('open');
  overlay.classList.remove('show');
  document.body.style.overflow = 'auto';
});
document.addEventListener('click', e => {
  if (e.target.classList.contains('qty-btn')) {
    const qtyValue = e.target.parentElement.querySelector('.qty-value');
    let current = parseInt(qtyValue.textContent);
    if (e.target.classList.contains('plus')) current++;
    if (e.target.classList.contains('minus') && current > 1) current--;
    qtyValue.textContent = current;
  }
});
