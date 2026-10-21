async function loadCategoryProducts() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category') || 'home';

    const path = `Category/Category/${category}.json`;
    const container = document.getElementById('productContainer');

    if (!container) return;

    // Yon menyu tugmalari (fayl yuklanmay qolsa ham ishlashi uchun avval ulanadi)
    const comeBack = document.getElementById('Comeback');
    if (comeBack) {
        comeBack.addEventListener('click', function () {
            window.location.href = 'index.html';
        });
    }

    const basketBtn = document.getElementById('buyNow');
    if (basketBtn) {
        basketBtn.addEventListener('click', function () {
            window.location.href = 'index.html#basket';
        });
    }

    const shopBtn = document.getElementById('ShopOwner');
    if (shopBtn) {
        shopBtn.addEventListener('click', function () {
            window.location.href = 'index.html#Category';
        });
    }

    container.innerHTML = 'Loading...';

    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error('Failed to load category data');
        }

        const products = await response.json();
        container.innerHTML = '';

        products.forEach((product, index) => {
            const card = document.createElement('div');
            card.className = 'CateCard';
          
            const likey =document.createElement('p');
            likey.textContent = isLiked(product.id, category) ? '❤️' : '🤍';
            likey.className = 'likey';
            
            const img = document.createElement('img');
            img.src = product.image || '';
            img.alt = product.name || '';

            const title = document.createElement('h3');
            title.className = 'BigWords';
            title.textContent = product.Word || '';

            const name = document.createElement('p');
            name.className = 'name';
            name.textContent = product.name || '';

            const price = document.createElement('p');
            price.className = 'price';
            price.textContent = product.price || '';

            const buy = document.createElement('h6');
            buy.textContent = 'add to basket';
            buy.classList.add('Buy');
            
            const miniCont1 = document.createElement('div');
            miniCont1.classList.add('miniCont1');

            const miniCont2 = document.createElement('div');
            miniCont2.classList.add('miniCont2');

            //functions
            likey.addEventListener('click', function (e) {
              e.stopPropagation();
              likey.textContent = toggleLike(product.id, category) ? '❤️' : '🤍';
            });


            buy.addEventListener('click',function (e){
                e.stopPropagation();
            
                addToCart({
                    id: product.id,
                    category: category,
                    name: product.name,
                    price: product.price,
                    image: product.image            
                })
            })

            card.addEventListener('click', function () {
                window.location.href = `ProductDet.html?id=${encodeURIComponent(products[index].id)}&category=${encodeURIComponent(category)}`;
            });
            
            //addinng everthing to card
            miniCont1.appendChild(img);
            miniCont1.appendChild(likey);
            miniCont2.appendChild(price);
            miniCont2.appendChild(buy);
            card.appendChild(miniCont1);
            card.appendChild(title);
            card.appendChild(name);
            card.appendChild(miniCont2);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Category load error:', error);
        container.innerHTML = '<p>Could not load products.</p>';
    }
}

loadCategoryProducts();
