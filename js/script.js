const WHATSAPP_NUMBER = '557197058440';
const CART_STORAGE_KEY = 'scentia-cart';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

document.addEventListener('DOMContentLoaded', () => {
  let cart = loadCart();

  const cartToggle = document.getElementById('cart-toggle');
  const cartClose = document.getElementById('cart-close');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartItemsEl = document.getElementById('cart-items');
  const cartEmptyEl = document.getElementById('cart-empty');
  const cartCountEl = document.getElementById('cart-count');
  const cartTotalEl = document.getElementById('cart-total');
  const cartCheckoutBtn = document.getElementById('cart-checkout');

  function openCart() {
    cartDrawer.classList.add('is-open');
    cartOverlay.classList.add('is-open');
  }

  function closeCart() {
    cartDrawer.classList.remove('is-open');
    cartOverlay.classList.remove('is-open');
  }

  function renderCart() {
    saveCart(cart);

    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountEl.textContent = count;

    const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
    cartTotalEl.textContent = formatBRL(total);
    cartCheckoutBtn.disabled = cart.length === 0;

    cartItemsEl.innerHTML = '';
    if (cart.length === 0) {
      cartEmptyEl.style.display = 'block';
      cartItemsEl.appendChild(cartEmptyEl);
      return;
    }
    cartEmptyEl.style.display = 'none';

    cart.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="cart-item__img"><img src="${item.image}" alt="${item.name}"></div>
        <div class="cart-item__info">
          <p class="cart-item__name">${item.name}</p>
          <p class="cart-item__price">${formatBRL(item.price)}</p>
          <div class="cart-item__qty">
            <button data-action="dec" aria-label="Diminuir quantidade">−</button>
            <span>${item.qty}</span>
            <button data-action="inc" aria-label="Aumentar quantidade">+</button>
          </div>
          <p class="cart-item__remove" data-action="remove">Remover</p>
        </div>
      `;
      el.querySelector('[data-action="inc"]').addEventListener('click', () => {
        item.qty += 1;
        renderCart();
      });
      el.querySelector('[data-action="dec"]').addEventListener('click', () => {
        item.qty -= 1;
        if (item.qty <= 0) {
          cart = cart.filter((i) => i.id !== item.id);
        }
        renderCart();
      });
      el.querySelector('[data-action="remove"]').addEventListener('click', () => {
        cart = cart.filter((i) => i.id !== item.id);
        renderCart();
      });
      cartItemsEl.appendChild(el);
    });
  }

  document.querySelectorAll('.btn-buy').forEach((btn) => {
    btn.addEventListener('click', () => {
      const { id, name, price, image } = btn.dataset;
      const existing = cart.find((item) => item.id === id);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ id, name, price: parseFloat(price), image, qty: 1 });
      }
      renderCart();
      openCart();

      btn.classList.add('is-added');
      btn.textContent = 'Adicionado ✓';
      setTimeout(() => {
        btn.classList.remove('is-added');
        btn.textContent = 'Comprar';
      }, 1200);
    });
  });

  cartToggle.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  cartCheckoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;

    const lines = cart.map(
      (item) => `${item.qty}x ${item.name} — ${formatBRL(item.price * item.qty)}`
    );
    const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

    const message = [
      'Olá! Gostaria de fazer o seguinte pedido na Scentia Perfumaria:',
      '',
      ...lines,
      '',
      `Total: ${formatBRL(total)}`,
    ].join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  });

  renderCart();

  const dots = document.querySelectorAll('.dot');
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      dots.forEach((d) => d.classList.remove('dot--active'));
      dot.classList.add('dot--active');
    });
  });
});
