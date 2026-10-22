async function cardd() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const category = params.get('category');   // yangi

    const title = document.getElementById('title');
    const price = document.getElementById('price');
    const img = document.getElementById('imagee');
    const det = document.getElementById('details');
    const comebtn = document.querySelector('.ComeBack');
    const like = document.getElementById('like');
    const AddItem = document.querySelector('.AddCard');

    if (!title || !price || !img || !det) return;

    if (!id) {
        title.innerText = 'Product not found';
        price.innerText = '';
        img.src = '';
        det.innerText = 'No product ID provided.';
        return;
    }

    // Orqaga tugmasi mahsulot topilmasa ham ishlashi kerak
    if (comebtn) {
        comebtn.addEventListener('click', function () {
            if (category) {
                window.location.href = `Category.html?category=${category}`;
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    try {
        let product = null;

        // Agar category bo‘lsa → category JSON dan qidiramiz
        if (category) {
            try {
                const catRes = await fetch(`Category/Category/${category}.json`);
                if (catRes.ok) {
                    const catData = await catRes.json();
                    product = catData.find(item => Number(item.id) === Number(id));
                }
            } catch (e) {
                console.warn('Category file could not be loaded:', e);
            }
        }

        // Category da topilmasa yoki category yo‘q bo‘lsa → products.json dan
        if (!product) {
            const response = await fetch('products.json');
            const data = await response.json();
            product = data.find(item => Number(item.id) === Number(id));
        }

        if (!product) {
            title.innerText = 'Product not found';
            price.innerText = '';
            img.src = '';
            det.innerText = 'This item is not available.';
            return;
        }

        // Like tugmasi (holati saqlanadi)
        if (like) {
            like.innerText = isLiked(product.id, category) ? '❤️' : '🤍';
            like.addEventListener('click', function () {
                like.innerText = toggleLike(product.id, category) ? '❤️' : '🤍';
                like.classList.remove('beat'); void like.offsetWidth; like.classList.add('beat');
            });
        }

        // Savatga qo‘shish
        if (AddItem) {
            AddItem.addEventListener('click', function () {
                addToCart({
                    id: product.id,
                    category: category || null,
                    name: product.name,
                    price: product.price,
                    image: product.image
                })
            });
        }

        // Ma’lumotlarni joylash
        title.innerText = product.name || 'Unnamed product';
        if (window.FX) FX.splitWords(title);
        price.innerText = product.price || 'Price not available';
        img.src = product.image || '';
        det.innerText = product.description || product.Word || 'No description available.';

    } catch (error) {
        console.error('Product load error:', error);
        title.innerText = 'Error';
        price.innerText = '';
        img.src = '';
        det.innerText = 'Could not load the product details.';
    }
}

cardd();
