async function Products() {
    const response1 = await fetch("products.json")
    const data = await response1.json()
    console.log(data)
    for (let i=0; i <data.length; i++){
        const productPapka =document.querySelector(".grandCardRow");
        
        //Cards of latest
        const cards=document.createElement("div");
        cards.classList.add("cards");
        //Parents of Elements 
        const div1 =document.createElement("div");
        div1.classList.add("div1");
        const div2  =document.createElement("div");
        div2.classList.add("div2");

        //Elements
        const Prname =document.createElement("p");
        Prname.innerText = data[i].name;
        const BigWords = document.createElement("h3");
        BigWords.innerText = data[i].Word;
        BigWords.classList.add("BigWords");
        const price =document.createElement("p");
        price.innerText= data[i].price;
        price.classList.add("price")
        const image =document.createElement("img");
        image.src=data[i].image; 
        image.alt=data[i].name;
        
        
        // adding Elements to Parents
        div1.appendChild(Prname);
        div1.appendChild(BigWords);
        div1.appendChild(price);
        div2.appendChild(image);

        //adding Parents to cards
        cards.appendChild(div1);  
        cards.appendChild(div2);
        
        //functions
        cards.addEventListener("click",function () {
        window.location.href =`ProductDet.html?id=${data[i].id}`;
        })

        
        //adding cards to HTML
        productPapka.appendChild(cards);
    }
}

Products();

//Card of Category
const categoryCards = document.querySelectorAll('.Card');
categoryCards.forEach(function (Card) {
    Card.addEventListener('click', function () {
        const category = this.dataset.category;
        window.location.href = `Category.html?category=${encodeURIComponent(category)}`;
    });
});

// ===== CONTACT =====
// Faqat shu yerga o'z ma'lumotlaringizni yozing, tugmalar o'zi ishlaydi:
//   telegram / instagram / github / tiktok  ->  username (@ belgisiz),  masalan 'atik_dev'
//   whatsapp                                ->  username (masalan 'AtikDev') YOKI telefon raqam (masalan '998901234567')
const CONTACTS = {
    telegram: 'WebsitesDevoloper',
    instagram: '_at1k._',
    whatsapp: 'AtikDev',
    github: 'At1kDev',
    tiktok: 'an1meholic'
};

const CONTACT_LINKS = {
    telegram: function (u) { return 'https://t.me/' + u; },
    instagram: function (u) { return 'https://instagram.com/' + u; },
    whatsapp: function (n) { return 'https://wa.me/' + n; },
    github: function (u) { return 'https://github.com/' + u; },
    tiktok: function (u) { return 'https://www.tiktok.com/@' + u; }
};

document.querySelectorAll('.account[data-contact]').forEach(function (link) {
    const key = link.dataset.contact;
    let value = String(CONTACTS[key] || '').trim().replace(/^@/, '');
    // WhatsApp: telefon raqam bo'lsa faqat raqamlar, bo'lmasa username
    const isPhone = key === 'whatsapp' && /^[+\d\s()-]+$/.test(value);
    if (isPhone) value = value.replace(/\D/g, '');

    const sub = link.querySelector('.account-sub');

    if (!value) {
        // bo'sh bo'lsa tugma bosilmaydi
        link.addEventListener('click', function (e) { e.preventDefault(); });
        return;
    }

    link.href = CONTACT_LINKS[key](encodeURIComponent(value));
    link.classList.remove('is-empty');
    if (sub) sub.textContent = isPhone ? '+' + value : '@' + value;
});
