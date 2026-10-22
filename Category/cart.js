// ===== SAVAT (cart) =====

// Kredit rejalari:  oy soni : ustama foiz  (0.1 = 10%).  Xohlasangiz o'zgartiring.
const CREDIT_PLANS = { 3: 0, 6: 0.05, 12: 0.1, 24: 0.2 };
const DEFAULT_CREDIT_MONTHS = 12;

// localStorage dan xavfsiz o'qish (buzilgan ma'lumot bo'lsa ham sayt ishlayveradi)
function readJSON(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value === null || value === undefined ? fallback : value;
    } catch (e) {
        return fallback;
    }
}

function getCart() {
    const cart = readJSON('cart', []);
    return Array.isArray(cart) ? cart : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Narxni tozalash ( $ belgisini olib tashlaydi )
function cleanPrice(price) {
    if (typeof price === 'number') return price;
    return Number(String(price).replace(/[^0-9.]/g, '')) || 0;
}

// 1399 -> $1399,  93.5 -> $93.50
function money(n) {
    const r = Math.round(n * 100) / 100;
    return '$' + (Number.isInteger(r) ? r : r.toFixed(2));
}

function getCartKey(product) {
    const category = product.category || 'main';
    return category + '_' + product.id;
}

function addToCart(product) {
    let cart = getCart();

    const key = getCartKey(product);
    const existing = cart.find(item => getCartKey(item) === key);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            category: product.category || null,
            name: product.name,
            price: cleanPrice(product.price),
            image: product.image || product.img,
            quantity: 1
        });
    }

    saveCart(cart);
    updateCartCount();
    renderBasket();
    alert('Product added to basket');
}

// + / − tugmalari. Soni 0 ga tushsa mahsulot savatdan o'chadi
function changeQuantity(key, delta) {
    let cart = getCart();
    const item = cart.find(i => getCartKey(i) === key);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => getCartKey(i) !== key);
    }

    saveCart(cart);
    updateCartCount();
    renderBasket();
}

function removeFromCart(key) {
    saveCart(getCart().filter(i => getCartKey(i) !== key));
    updateCartCount();
    renderBasket();
}

function getTotals(cart) {
    let count = 0;
    let total = 0;
    cart.forEach(function (item) {
        count += item.quantity;
        total += cleanPrice(item.price) * item.quantity;
    });
    return { count: count, total: Math.round(total * 100) / 100 };
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.innerText = count;
    }
}

// ===== CREDIT =====
function getCreditMonths() {
    const months = Number(localStorage.getItem('creditMonths'));
    return months in CREDIT_PLANS ? months : DEFAULT_CREDIT_MONTHS;
}

function creditInfo(total, months) {
    const rate = CREDIT_PLANS[months] || 0;
    const grand = total * (1 + rate);
    return { months: months, rate: rate, grand: grand, monthly: grand / months };
}

// Oy tanlash menyusini to'ldiradi (3 / 6 / 12 / 24 months)
function setupCreditSelect() {
    const select = document.getElementById('credit-months');
    if (!select || select.options.length) return;

    Object.keys(CREDIT_PLANS).forEach(function (m) {
        const option = document.createElement('option');
        option.value = m;
        option.textContent = m + ' months';
        select.appendChild(option);
    });

    select.value = String(getCreditMonths());
    select.addEventListener('change', function () {
        localStorage.setItem('creditMonths', select.value);
        renderBasket();
    });
}

// ===== BASKET =====
function renderBasket() {
    const cart = getCart();
    const container = document.getElementById('basket-item');
    const totalCountEl = document.getElementById('total-count');
    const totalPriceEl = document.getElementById('total-price');
    const totalCreditEl = document.getElementById('total-credit');

    if (!container) return;

    container.innerHTML = '';

    const totals = getTotals(cart);
    if (totalCountEl) totalCountEl.innerText = totals.count;
    if (totalPriceEl) totalPriceEl.innerText = totals.total;
    if (totalCreditEl) {
        totalCreditEl.innerText = cart.length
            ? money(creditInfo(totals.total, getCreditMonths()).monthly) + ' / month'
            : 0;
    }

    if (cart.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'basket-empty';
        empty.innerText = 'Your basket is empty now';
        container.appendChild(empty);
        return;
    }

    cart.forEach(function (item) {
        const price = cleanPrice(item.price);
        const key = getCartKey(item);

        const card = document.createElement('div');
        card.className = 'basket-card';

        const img = document.createElement('img');
        img.className = 'basket-img';
        img.src = item.image || '';
        img.alt = item.name || '';

        const info = document.createElement('div');
        info.className = 'basket-info';

        const nameEl = document.createElement('h4');
        nameEl.className = 'basket-name';
        nameEl.innerText = item.name || '';

        const priceEl = document.createElement('p');
        priceEl.className = 'basket-price';
        priceEl.innerText = '$' + price;

        const qtyEl = document.createElement('p');
        qtyEl.className = 'basket-quantity';
        qtyEl.innerText = '× ' + item.quantity;

        // − / + / Remove tugmalari
        const controls = document.createElement('div');
        controls.className = 'basket-controls';

        const minus = document.createElement('button');
        minus.type = 'button';
        minus.className = 'qty-btn';
        minus.innerText = '−';
        minus.title = 'Less';
        minus.addEventListener('click', function () { changeQuantity(key, -1); });

        const plus = document.createElement('button');
        plus.type = 'button';
        plus.className = 'qty-btn';
        plus.innerText = '+';
        plus.title = 'More';
        plus.addEventListener('click', function () { changeQuantity(key, 1); });

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'remove-btn';
        remove.innerText = 'Remove';
        remove.addEventListener('click', function () { removeFromCart(key); });

        controls.appendChild(minus);
        controls.appendChild(plus);
        controls.appendChild(remove);

        info.appendChild(img);
        info.appendChild(nameEl);
        info.appendChild(priceEl);
        info.appendChild(qtyEl);
        info.appendChild(controls);

        card.appendChild(info);
        container.appendChild(card);
    });
}

// ===== VERIFICATION (buyurtmani tasdiqlash) =====
function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function onModalKey(e) {
    if (e.key === 'Escape') closeVerification();
}

function closeVerification() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) overlay.remove();
    document.removeEventListener('keydown', onModalKey);
}

function openVerification() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your basket is empty now');
        return;
    }
    if (document.querySelector('.modal-overlay')) return;

    const totals = getTotals(cart);
    const credit = creditInfo(totals.total, getCreditMonths());

    const overlay = el('div', 'modal-overlay');
    const box = el('div', 'modal-box');
    overlay.appendChild(box);

    box.appendChild(el('h3', 'modal-title', 'Verification'));

    // Mahsulotlar ro'yxati
    const list = el('ul', 'modal-items');
    cart.forEach(function (item) {
        const li = el('li');
        li.appendChild(el('span', '', item.name + ' × ' + item.quantity));
        li.appendChild(el('b', '', money(cleanPrice(item.price) * item.quantity)));
        list.appendChild(li);
    });
    box.appendChild(list);
    box.appendChild(el('p', 'modal-total', 'Total: ' + money(totals.total)));

    // To'lov turi: to'liq yoki kredit
    const fullLabel = el('label', 'pay-option');
    const fullRadio = document.createElement('input');
    fullRadio.type = 'radio';
    fullRadio.name = 'pay';
    fullRadio.value = 'full';
    fullRadio.checked = true;
    fullLabel.appendChild(fullRadio);
    fullLabel.appendChild(el('span', '', 'Full payment: ' + money(totals.total)));

    const creditLabel = el('label', 'pay-option');
    const creditRadio = document.createElement('input');
    creditRadio.type = 'radio';
    creditRadio.name = 'pay';
    creditRadio.value = 'credit';
    creditLabel.appendChild(creditRadio);
    creditLabel.appendChild(el('span', '',
        'Credit: ' + money(credit.monthly) + ' / month × ' + credit.months +
        ' months (total ' + money(credit.grand) + ')'));

    box.appendChild(fullLabel);
    box.appendChild(creditLabel);

    // Ism va telefon
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'modal-input';
    nameInput.placeholder = 'Your name';
    nameInput.autocomplete = 'name';

    const phoneInput = document.createElement('input');
    phoneInput.type = 'tel';
    phoneInput.className = 'modal-input';
    phoneInput.placeholder = 'Phone number';
    phoneInput.autocomplete = 'tel';

    const error = el('p', 'modal-error', '');

    box.appendChild(nameInput);
    box.appendChild(phoneInput);
    box.appendChild(error);

    const buttons = el('div', 'modal-buttons');
    const cancelBtn = el('button', 'modal-cancel', 'Cancel');
    cancelBtn.type = 'button';
    const confirmBtn = el('button', 'modal-confirm', 'Confirm order');
    confirmBtn.type = 'button';
    buttons.appendChild(cancelBtn);
    buttons.appendChild(confirmBtn);
    box.appendChild(buttons);

    cancelBtn.addEventListener('click', closeVerification);
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeVerification();
    });
    document.addEventListener('keydown', onModalKey);

    confirmBtn.addEventListener('click', function () {
        const name = nameInput.value.trim();
        const phoneDigits = phoneInput.value.replace(/\D/g, '');

        if (name.length < 2) {
            error.textContent = 'Please enter your name';
            nameInput.focus();
            return;
        }
        if (phoneDigits.length < 9 || phoneDigits.length > 15) {
            error.textContent = 'Please enter a valid phone number';
            phoneInput.focus();
            return;
        }

        const byCredit = creditRadio.checked;
        const order = {
            id: String(Date.now()).slice(-6),
            date: new Date().toISOString(),
            name: name,
            phone: phoneInput.value.trim(),
            items: cart,
            count: totals.count,
            total: totals.total,
            payment: byCredit ? 'credit' : 'full',
            months: byCredit ? credit.months : null,
            monthly: byCredit ? Math.round(credit.monthly * 100) / 100 : null,
            grand: byCredit ? Math.round(credit.grand * 100) / 100 : totals.total
        };

        // Buyurtmani brauzer xotirasiga saqlaymiz va savatni tozalaymiz
        const orders = readJSON('orders', []);
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        saveCart([]);
        updateCartCount();
        renderBasket();

        // Muvaffaqiyat oynasi
        box.innerHTML = '';
        box.appendChild(el('h3', 'modal-title', '✅ Order confirmed'));
        box.appendChild(el('p', '', 'Thank you, ' + name + '! Your order #' + order.id + ' is confirmed.'));
        box.appendChild(el('p', '', byCredit
            ? 'Credit: ' + money(order.monthly) + ' / month × ' + order.months + ' months.'
            : 'Full payment: ' + money(order.total) + '.'));
        box.appendChild(el('p', 'modal-note', 'We will contact you at ' + order.phone + '.'));
        const closeBtn = el('button', 'modal-confirm', 'Close');
        closeBtn.type = 'button';
        closeBtn.addEventListener('click', closeVerification);
        box.appendChild(closeBtn);
    });

    document.body.appendChild(overlay);
    nameInput.focus();
}

// ===== LIKE (yurakcha) — sahifa yangilansa ham saqlanadi =====
function likeKey(id, category) {
    return (category || 'main') + '_' + id;
}

function isLiked(id, category) {
    return readJSON('likes', []).includes(likeKey(id, category));
}

// true -> like bosildi,  false -> like olib tashlandi
function toggleLike(id, category) {
    const key = likeKey(id, category);
    let likes = readJSON('likes', []);
    const liked = likes.includes(key);
    likes = liked ? likes.filter(k => k !== key) : likes.concat(key);
    localStorage.setItem('likes', JSON.stringify(likes));
    return !liked;
}

// Sahifa yuklanganda
document.addEventListener('DOMContentLoaded', function () {
    setupCreditSelect();

    const verifyBtn = document.getElementById('Verify-btn');
    if (verifyBtn) verifyBtn.addEventListener('click', openVerification);

    updateCartCount();
    renderBasket();
});

window.addEventListener('storage', function () {
    updateCartCount();
    renderBasket();
});
