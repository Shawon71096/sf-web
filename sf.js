/* ========= Sample product data =========
   Replace img values with your local image filenames or online URLs.
*/
const products = [
  { id: 1, title: "Summer Kurti", price: 850, img: "kurti.jpeg", category: "women", desc: "Light cotton kurti, summer collection." },
  { id: 2, title: "Men's Panjabi", price: 1200, img: "panjabi.jpeg", category: "men", desc: "Traditional panjabi with modern fit." },
  { id: 3, title: "Cotton Saree", price: 1700, img: "saree.jpeg", category: "women", desc: "Handloom-inspired cotton saree." },
  { id: 4, title: "Kids T-shirt", price: 450, img: "t-shirt.jpg", category: "kids", desc: "Soft cotton t-shirt for kids." },
  { id: 5, title: "Denim Jeans", price: 950, img: "pant.jpeg", category: "men", desc: "Slim-fit denim jeans." },
  { id: 6, title: "Hijab Set", price: 600, img: "hijab.jpeg", category: "accessory", desc: "Breathable hijab set." }
];

/* ====== Elements ====== */
const productGrid = document.getElementById('productGrid');
const globalSearch = document.getElementById('globalSearch');
const categoryFilter = document.getElementById('categoryFilter');
const sortSelect = document.getElementById('sortSelect');

const quickView = document.getElementById('quickView');
const qvImg = document.getElementById('qvImg');
const qvTitle = document.getElementById('qvTitle');
const qvPrice = document.getElementById('qvPrice');
const qvDesc = document.getElementById('qvDesc');
const qvCategory = document.getElementById('qvCategory');
const closeQuick = document.getElementById('closeQuick');
const qvAddToCart = document.getElementById('qvAddToCart');
const qvClose = document.getElementById('qvClose');

const overlay = document.getElementById('overlay');
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartCount');
const clearCartBtn = document.getElementById('clearCart');
const checkoutBtn = document.getElementById('checkout');

let cart = JSON.parse(localStorage.getItem('sh_cart')) || [];
updateCartUI();

/* ====== Render Products ====== */
function renderProducts(list) {
  productGrid.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('data-id', p.id);
    card.innerHTML = `
      <div class="img" style="background-image:url('${p.img}')" aria-hidden="true"></div>
      <div class="card-body">
        <h4>${p.title}</h4>
        <div class="price">৳${p.price}</div>
      </div>
    `;
    // click -> quick view
    card.addEventListener('click', () => openQuickView(p.id));
    productGrid.appendChild(card);
  });

  // apply scroll animations
  observeCards();
}

/* ====== Quick View ====== */
function openQuickView(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  qvImg.src = p.img;
  qvTitle.textContent = p.title;
  qvPrice.textContent = '৳' + p.price;
  qvDesc.textContent = p.desc;
  qvCategory.textContent = p.category;
  qvAddToCart.dataset.id = p.id;
  showModal(quickView);
}
function closeQuickView() {
  hideModal(quickView);
}
closeQuick.addEventListener('click', closeQuickView);
qvClose.addEventListener('click', closeQuickView);
qvAddToCart.addEventListener('click', () => {
  const id = parseInt(qvAddToCart.dataset.id);
  addToCart(id);
  closeQuickView();
});

/* ====== Modal helpers ====== */
function showModal(el) {
  el.classList.add('show');
  overlay.hidden = false;
}
function hideModal(el) {
  el.classList.remove('show');
  overlay.hidden = true;
}
overlay.addEventListener('click', () => {
  hideModal(quickView);
  closeCartSidebar();
});

/* ====== Cart functions ====== */
function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: p.id, title: p.title, price: p.price, img: p.img, qty: 1 });
  }
  saveCart();
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartUI();
}

function changeQty(id, delta) {
  const item = cart.find(i=>i.id===id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  updateCartUI();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('sh_cart', JSON.stringify(cart));
}

function cartTotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function updateCartUI() {
  // badge
  const totalItems = cart.reduce((s,i)=>s+i.qty,0);
  cartCountEl.textContent = totalItems;

  // items list
  cartItemsEl.innerHTML = '';
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="muted small" style="padding:12px">Your cart is empty.</p>';
  } else {
    cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${item.img}" alt="${item.title}">
        <div class="meta">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong>${item.title}</strong>
            <button class="remove-item" data-id="${item.id}" style="background:none;border:none;color:#c33;cursor:pointer">Remove</button>
          </div>
          <div class="small muted">৳${item.price} x ${item.qty}</div>
          <div style="margin-top:8px">
            <button class="qty-btn" data-id="${item.id}" data-delta="-1">−</button>
            <span style="padding:0 8px">${item.qty}</span>
            <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
          </div>
        </div>
      `;
      cartItemsEl.appendChild(div);
    });
  }
  cartTotalEl.textContent = cartTotal();

  // attach listeners
  cartItemsEl.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.id)));
  });
  cartItemsEl.querySelectorAll('.qty-btn').forEach(btn=>{
    btn.addEventListener('click', () => changeQty(parseInt(btn.dataset.id), parseInt(btn.dataset.delta)));
  });
}

/* ====== Cart sidebar open/close ====== */
cartBtn.addEventListener('click', () => {
  openCartSidebar();
});
function openCartSidebar() {
  cartSidebar.classList.add('open');
  overlay.hidden = false;
  cartSidebar.setAttribute('aria-hidden', 'false');
}
function closeCartSidebar() {
  cartSidebar.classList.remove('open');
  overlay.hidden = true;
  cartSidebar.setAttribute('aria-hidden', 'true');
}
closeCart.addEventListener('click', closeCartSidebar);
clearCartBtn.addEventListener('click', () => { clearCart(); });

checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) { alert('Cart is empty'); return; }
  // placeholder behavior
  alert('Checkout - total: ৳' + cartTotal());
});

/* ====== Search / Filter / Sort ====== */
function applyFilters() {
  const q = globalSearch.value.trim().toLowerCase();
  const cat = categoryFilter.value;
  const sort = sortSelect.value;

  let result = products.filter(p => {
    const mQ = p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
    const mCat = cat ? p.category === cat : true;
    return mQ && mCat;
  });

  if (sort === 'low-high') result.sort((a,b)=>a.price-b.price);
  else if (sort === 'high-low') result.sort((a,b)=>b.price-a.price);

  renderProducts(result);
}

globalSearch.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);
sortSelect.addEventListener('change', applyFilters);

/* ====== Scroll animation (IntersectionObserver) ====== */
let observer;
function observeCards() {
  const cards = document.querySelectorAll('.card');
  if ('IntersectionObserver' in window) {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target); // animate once
        }
      });
    }, { threshold: 0.18 });
    cards.forEach(c => observer.observe(c));
  } else {
    // fallback
    cards.forEach(c=>c.classList.add('in-view'));
  }
}

/* ====== Init ====== */
renderProducts(products);
applyFilters(); // ensures initial render uses filters & sort default
