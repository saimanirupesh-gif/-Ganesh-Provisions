// Refactored Product catalog database for Ganesh Provisions (Dry Grocery & Spices Edition)
// Featuring premium Unsplash images, original pricing, discount metrics, and detailed review lists.

const GROCERY_PRODUCTS = [
  // --- Oils & Ghee ---
  {
    id: "oils-003",
    name: "Organic Cold-Pressed Coconut Oil",
    teluguName: "ఆర్గానిక్ కొబ్బరి నూనె",
    category: "oils",
    price: 260,
    originalPrice: 299,
    unit: "L",
    image: "https://images.unsplash.com/photo-1622484211148-716598e0911a?auto=format&fit=crop&q=80&w=600",
    description: "Virgin cold-pressed coconut oil extracted from fresh organic coastal coconuts. Unrefined, highly aromatic, and perfect for cooking & wellness.",
    rating: 4.8,
    reviews: 79,
    sizes: ["500ml", "1L"],
    inStock: true,
    isOrganic: true,
    tag: "Pure Virgin",
    reviewsList: [
      {
        id: "rev-oil-3",
        author: "Aditi Rao",
        rating: 4,
        date: "2026-05-17",
        tags: ["Fresh Products"],
        comment: "Excellent coconut scent. Very light and pure, standard grade organic oil.",
        image: ""
      }
    ]
  },

  // --- Biryani Spices ---
  {
    id: "spc-001",
    name: "Royal Biryani Whole Spice Combo",
    teluguName: "బిర్యానీ మసాలా కాంబో",
    category: "spices",
    price: 120,
    originalPrice: 150,
    unit: "pack",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600",
    description: "An exotic aromatic blend of whole cloves, green cardamoms, black cardamom, cinnamon sticks, mace, star anise, and bay leaves for perfect Biryanis.",
    rating: 4.9,
    reviews: 243,
    sizes: ["100g", "200g", "500g"],
    inStock: true,
    isOrganic: false,
    tag: "Chef's Choice",
    reviewsList: [
      {
        id: "rev-spc-1",
        author: "Chef Harish",
        rating: 5,
        date: "2026-05-24",
        tags: ["Fresh Products", "Good Quality"],
        comment: "Excellent combination of whole spices. The bay leaves and star anise are large and unbroken, which yields a superb fragrance in my catering orders.",
        image: ""
      }
    ]
  },
  {
    id: "spc-002",
    name: "Kashmiri Red Chili Powder",
    teluguName: "కాశ్మీరి ఎరుపు మిరపకాయ పొడి",
    category: "spices",
    price: 90,
    originalPrice: 110,
    unit: "pack",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600",
    description: "Stone-ground Kashmiri chilies offering a vibrant natural deep red color and very gentle heat. Essential for aesthetic cooking.",
    rating: 4.8,
    reviews: 172,
    sizes: ["100g", "250g", "500g"],
    inStock: true,
    isOrganic: true,
    tag: "Stone Ground",
    reviewsList: [
      {
        id: "rev-spc-2",
        author: "Meera Nair",
        rating: 5,
        date: "2026-05-11",
        tags: ["Packaging was Good"],
        comment: "Perfect deep red color and extremely mild heat. Essential for making premium gravies.",
        image: ""
      }
    ]
  },
  {
    id: "spc-003",
    name: "Premium Green Cardamoms (Elaichi)",
    teluguName: "ప్రీమియం ఆకు ఏలకులు",
    category: "spices",
    price: 240,
    originalPrice: 299,
    unit: "pack",
    image: "https://images.unsplash.com/photo-1508737804141-4c3b688e2546?auto=format&fit=crop&q=80&w=600",
    description: "Bold 8mm hand-picked green cardamom pods. Extremely fragrant, sweet-spicy aroma. Adds unmatched flavor to desserts and biryani recipes.",
    rating: 4.9,
    reviews: 156,
    sizes: ["50g", "100g", "250g"],
    inStock: true,
    isOrganic: true,
    tag: "High Grade",
    reviewsList: [
      {
        id: "rev-spc-3",
        author: "Sanjay Shah",
        rating: 5,
        date: "2026-05-20",
        tags: ["Good Quality", "Fresh Products"],
        comment: "Beautiful large green pods, and completely filled with aromatic dark seeds. Excellent aroma when opened.",
        image: ""
      }
    ]
  },

  // --- Dry Fruits & Nuts ---
  {
    id: "df-001",
    name: "Premium Cashew Nuts (Kaju W240)",
    teluguName: "ప్రీమియం జీడిపప్పు",
    category: "dryfruits",
    price: 450,
    originalPrice: 549,
    unit: "pack",
    image: "assets/cashew_nuts.png",
    description: "Jumbo sized W240 whole cashew nuts. Richly white, creamy texture, sweet nutty flavor, and packed with vitamins and minerals.",
    rating: 4.8,
    reviews: 215,
    sizes: ["250g", "500g", "1kg"],
    inStock: true,
    isOrganic: false,
    tag: "Premium Quality",
    reviewsList: [
      {
        id: "rev-df-1",
        author: "Gayatri Krishnan",
        rating: 5,
        date: "2026-05-13",
        tags: ["Good Quality", "Packaging was Good"],
        comment: "Large, crisp, sweet cashews. Delivered intact without breakage. Perfect choice for gifting or cooking.",
        image: ""
      }
    ]
  },
  {
    id: "df-002",
    name: "California Almonds (Badam)",
    teluguName: "కాలిఫోర్నియా బాదం",
    category: "dryfruits",
    price: 380,
    originalPrice: 449,
    unit: "pack",
    image: "https://images.unsplash.com/photo-1508061458087-2152ee21a149?auto=format&fit=crop&q=80&w=600",
    description: "Vibrant, high-fiber, crispy California almonds. Regular consumption promotes heart health, sharp brain, and steady energy.",
    rating: 4.7,
    reviews: 289,
    sizes: ["250g", "500g", "1kg"],
    inStock: true,
    isOrganic: false,
    tag: "Daily Health",
    reviewsList: [
      {
        id: "rev-df-2",
        author: "Amit Roy",
        rating: 4,
        date: "2026-05-21",
        tags: ["Fresh Products"],
        comment: "Nice crispy almonds. Excellent daily health snack.",
        image: ""
      }
    ]
  },
  {
    id: "df-003",
    name: "Green Raisins (Kishmish)",
    teluguName: "పచ్చ ఎండు ద్రాక్ష",
    category: "dryfruits",
    price: 150,
    originalPrice: 179,
    unit: "pack",
    image: "https://images.unsplash.com/photo-1614735241165-6756e1df61ab?auto=format&fit=crop&q=80&w=600",
    description: "Naturally sweet, long green raisins. Soft, seedless, and chewy. Excellent natural sweeteners for desserts and biryanis.",
    rating: 4.6,
    reviews: 142,
    sizes: ["250g", "500g", "1kg"],
    inStock: true,
    isOrganic: true,
    tag: "Sun Dried",
    reviewsList: [
      {
        id: "rev-df-3",
        author: "Sheela Verma",
        rating: 5,
        date: "2026-05-16",
        tags: ["Fresh Products", "Good Quality"],
        comment: "Very soft and seedless raisins. Excellent natural sweetness. Ideal addition to my homemade kheer.",
        image: ""
      }
    ]
  },

  // --- Flour & Atta ---
  {
    id: "flour-001",
    name: "Wheat Flour (Atta)",
    teluguName: "గోధుమ పిండి",
    category: "flour",
    price: 65,
    originalPrice: 75,
    unit: "kg",
    image: "https://starbazarjapan.com/wp-content/uploads/2020/01/Atta-Whole-Wheat-1-kg-Loose.jpg",
    description: "Premium quality whole wheat flour (గోధుమ పిండి), finely ground for making soft rotis, chapatis, and parathas. Rich in fiber and essential nutrients for daily cooking.",
    rating: 4.7,
    reviews: 156,
    sizes: ["1kg", "5kg", "10kg"],
    inStock: true,
    isOrganic: false,
    tag: "Daily Essential",
    reviewsList: [
      {
        id: "rev-flour-1",
        author: "Priya Devi",
        rating: 5,
        date: "2026-05-20",
        tags: ["Good Quality", "Fresh Products"],
        comment: "Makes very soft rotis every time. Great quality atta at an affordable price!",
        image: ""
      }
    ]
  },
  {
    id: "flour-002",
    name: "Refined Flour (Maida)",
    teluguName: "మైదా",
    category: "flour",
    price: 40,
    originalPrice: 45,
    unit: "kg",
    image: "https://5.imimg.com/data5/IR/BA/FR/SELLER-100367433/refined-maida-flour-500x500.jpg",
    description: "Fine quality refined wheat flour (మైదా), ideal for baking breads, cakes, pastries, and making crispy samosas, puris, and naans.",
    rating: 4.5,
    reviews: 89,
    sizes: ["1kg", "5kg"],
    inStock: true,
    isOrganic: false,
    tag: "Baking Essential",
    reviewsList: [
      {
        id: "rev-flour-2",
        author: "Kavitha R.",
        rating: 4,
        date: "2026-05-18",
        tags: ["Good Quality"],
        comment: "Good quality maida. Makes crispy samosas and soft naans perfectly.",
        image: ""
      }
    ]
  },
  {
    id: "flour-003",
    name: "Broken Wheat (Dalia)",
    teluguName: "గోధుమ రవ్వ",
    category: "flour",
    price: 40,
    originalPrice: 50,
    unit: "kg",
    image: "https://thumbs.dreamstime.com/b/broken-crushed-wheat-dalia-blue-bowl-isolated-wooden-background-closeup-isolated-photograph-broken-wheat-also-known-as-355454133.jpg",
    description: "Nutritious broken wheat grains (గోధుమ రవ్వ), rich in fiber and protein. Perfect for making healthy upma, khichdi, porridge, and diet-friendly recipes.",
    rating: 4.6,
    reviews: 72,
    sizes: ["500g", "1kg", "2kg"],
    inStock: true,
    isOrganic: false,
    tag: "High Fiber",
    reviewsList: [
      {
        id: "rev-flour-3",
        author: "Rekha Sharma",
        rating: 5,
        date: "2026-05-22",
        tags: ["Fresh Products", "Good Quality"],
        comment: "Very clean broken wheat. Makes delicious dalia porridge for breakfast.",
        image: ""
      }
    ]
  },

  // --- More Spices & Masala ---
  {
    id: "spc-004",
    name: "Mustard Seeds (Rai)",
    teluguName: "ఆవాలు",
    category: "spices",
    price: 90,
    originalPrice: 110,
    unit: "kg",
    image: "https://tse3.mm.bing.net/th/id/OIP.VznqXO5D0e_3u7XkAjJ8dQHaE7?pid=Api&P=0&h=180",
    description: "Premium quality whole mustard seeds (ఆవాలు) with strong pungent aroma. Essential for South Indian tempering, pickles, and traditional tadka preparations.",
    rating: 4.7,
    reviews: 134,
    sizes: ["250g", "500g", "1kg"],
    inStock: true,
    isOrganic: false,
    tag: "Tadka Essential",
    reviewsList: [
      {
        id: "rev-spc-4",
        author: "Lakshmi Naidu",
        rating: 5,
        date: "2026-05-16",
        tags: ["Good Quality", "Fresh Products"],
        comment: "Excellent mustard seeds. Splutters perfectly in hot oil. Very fresh and aromatic!",
        image: ""
      }
    ]
  },
  {
    id: "spc-005",
    name: "Coriander Cumin Powder (Dhana Jeera)",
    teluguName: "ధనియాల పొడి",
    category: "spices",
    price: 45,
    originalPrice: 50,
    unit: "kg",
    image: "https://5.imimg.com/data5/SELLER/Default/2023/3/293905249/YP/FQ/PY/31273036/coriander-cumin-powder-500x500.jpg",
    description: "Perfectly balanced blend of roasted coriander and cumin seeds powder (ధనియాల పొడి). Adds authentic flavor to curries, dals, and gravies.",
    rating: 4.6,
    reviews: 98,
    sizes: ["250g", "500g", "1kg"],
    inStock: true,
    isOrganic: false,
    tag: "Curry Essential",
    reviewsList: [
      {
        id: "rev-spc-5",
        author: "Bhavani Prasad",
        rating: 5,
        date: "2026-05-19",
        tags: ["Good Quality"],
        comment: "Excellent blend of dhana jeera. Gives amazing flavor to all our curries.",
        image: ""
      }
    ]
  },
  {
    id: "spc-006",
    name: "Chicken Masala (Everest)",
    teluguName: "చికెన్ మసాలా",
    category: "spices",
    price: 90,
    originalPrice: 98,
    unit: "pack",
    image: "https://m.media-amazon.com/images/I/81jj9fNclxL.jpg",
    description: "Everest Chicken Masala (చికెన్ మసాలా) – a rich and aromatic blend of premium spices crafted for making restaurant-style chicken curry, biryani, and kebabs.",
    rating: 4.8,
    reviews: 187,
    sizes: ["50g", "100g", "200g"],
    inStock: true,
    isOrganic: false,
    tag: "Brand Favorite",
    reviewsList: [
      {
        id: "rev-spc-6",
        author: "Ravi Kumar",
        rating: 5,
        date: "2026-05-25",
        tags: ["Good Quality", "Fresh Products"],
        comment: "Everest chicken masala gives perfect restaurant taste. My go-to masala for Sunday chicken curry!",
        image: ""
      }
    ]
  },
  {
    id: "spc-007",
    name: "Red Chilli Powder (Karam)",
    teluguName: "కారం",
    category: "spices",
    price: 350,
    originalPrice: 399,
    unit: "kg",
    image: "https://5.imimg.com/data5/SELLER/Default/2021/3/NC/AQ/WK/52875968/organic-kashmiri-red-chilli-powder.jpg",
    description: "Pure and fiery red chilli powder (కారం) ground from handpicked dried red chillies. Vibrant color and strong heat – a staple for all Indian cooking.",
    rating: 4.7,
    reviews: 163,
    sizes: ["250g", "500g", "1kg"],
    inStock: true,
    isOrganic: false,
    tag: "Bulk Pack",
    reviewsList: [
      {
        id: "rev-spc-7",
        author: "Suresh Reddy",
        rating: 5,
        date: "2026-05-12",
        tags: ["Good Quality", "Packaging was Good"],
        comment: "Very pure and pungent chilli powder. Authentic deep red color. Gives perfect spice to our curries.",
        image: ""
      }
    ]
  },
  {
    id: "spc-008",
    name: "Asafoetida (Hing)",
    teluguName: "ఇంగువ",
    category: "spices",
    price: 102,
    originalPrice: 120,
    unit: "box",
    image: "https://tse2.mm.bing.net/th/id/OIP._VeSJgkUu_xs02o7L6VQLQHaGR?pid=Api&P=0&h=180",
    description: "Strong and aromatic compounded asafoetida (ఇంగువ). Adds an unforgettable umami punch to dals, sambar, and vegetable curries. A little goes a long way.",
    rating: 4.8,
    reviews: 112,
    sizes: ["50g", "100g"],
    inStock: true,
    isOrganic: false,
    tag: "Kitchen Staple",
    reviewsList: [
      {
        id: "rev-spc-8",
        author: "Padma Latha",
        rating: 5,
        date: "2026-05-14",
        tags: ["Good Quality"],
        comment: "Very strong and pungent hing. Just a pinch transforms the entire dal!",
        image: ""
      }
    ]
  },
  {
    id: "spc-009",
    name: "Cumin Seeds (Jeera)",
    teluguName: "జీలకర్ర",
    category: "spices",
    price: 135,
    originalPrice: 150,
    unit: "kg",
    image: "https://cdn.britannica.com/59/219359-050-662D86EA/Cumin-Spice.jpg",
    description: "Whole cumin seeds (జీలకర్ర) with intense earthy aroma. Essential for tempering, rice preparations, raita, and adds warm depth to any curry or gravy.",
    rating: 4.8,
    reviews: 145,
    sizes: ["250g", "500g", "1kg"],
    inStock: true,
    isOrganic: false,
    tag: "Aromatic",
    reviewsList: [
      {
        id: "rev-spc-9",
        author: "Venkat Rao",
        rating: 5,
        date: "2026-05-21",
        tags: ["Fresh Products", "Good Quality"],
        comment: "Very fresh jeera with strong aroma. Perfect for tempering dals and making jeera rice.",
        image: ""
      }
    ]
  },
  {
    id: "spc-010",
    name: "Coriander Powder (Dhaniya)",
    teluguName: "కొత్తిమీర పొడి",
    category: "spices",
    price: 250,
    originalPrice: 299,
    unit: "kg",
    image: "https://tse1.mm.bing.net/th/id/OIP.7qlDuxaq__CMHfNq3LMxyQHaEK?pid=Api&P=0&h=180",
    description: "Pure stone-ground coriander powder (కొత్తిమీర పొడి) made from premium coriander seeds. Adds mild, citrusy flavor and rich aroma to curries and gravies.",
    rating: 4.6,
    reviews: 128,
    sizes: ["250g", "500g", "1kg"],
    inStock: true,
    isOrganic: false,
    tag: "Stone Ground",
    reviewsList: [
      {
        id: "rev-spc-10",
        author: "Anitha Kumari",
        rating: 5,
        date: "2026-05-17",
        tags: ["Good Quality", "Packaging was Good"],
        comment: "Very fine coriander powder with excellent aroma. Freshly ground taste in every pinch!",
        image: ""
      }
    ]
  },
  {
    id: "spc-011",
    name: "Black Pepper (Miriyalu)",
    teluguName: "మిరియాలు",
    category: "spices",
    price: 100,
    originalPrice: 120,
    unit: "pack",
    image: "https://images.tv9telugu.com/wp-content/uploads/2023/07/black-pepper5.jpg?w=1280&enlarge=true",
    description: "Premium whole black peppercorns (మిరియాలు). Bold, sharp, and pungent – the king of spices. Adds intense heat and depth to soups, curries, and marinades.",
    rating: 4.9,
    reviews: 176,
    sizes: ["50g", "100g", "250g"],
    inStock: true,
    isOrganic: false,
    tag: "King of Spices",
    reviewsList: [
      {
        id: "rev-spc-11",
        author: "Naresh Babu",
        rating: 5,
        date: "2026-05-23",
        tags: ["Good Quality", "Fresh Products"],
        comment: "Large, bold peppercorns with amazing pungency. Freshly ground pepper transforms any dish!",
        image: ""
      }
    ]
  },
  {
    id: "spc-012",
    name: "Turmeric Powder (Pasupu)",
    teluguName: "పసుపు",
    category: "spices",
    price: 30,
    originalPrice: 40,
    unit: "pack",
    image: "https://tse4.mm.bing.net/th/id/OIP.M5S9JpffAVMGwFLNzNluiAHaD4?pid=Api&P=0&h=180",
    description: "Pure golden turmeric powder (పసుపు) with high curcumin content. Adds vibrant color, earthy flavor, and powerful anti-inflammatory health benefits to every meal.",
    rating: 4.8,
    reviews: 198,
    sizes: ["100g", "250g", "500g"],
    inStock: true,
    isOrganic: true,
    tag: "Health Booster",
    reviewsList: [
      {
        id: "rev-spc-12",
        author: "Sarada Devi",
        rating: 5,
        date: "2026-05-15",
        tags: ["Fresh Products", "Good Quality"],
        comment: "Bright yellow turmeric with excellent aroma. Perfect for our daily cooking and turmeric milk.",
        image: ""
      }
    ]
  },

  // --- More Dals & Pulses ---
  {
    id: "dals-004",
    name: "Urad Dal (Whole Black Gram)",
    teluguName: "ఉద్దులు",
    category: "dals",
    price: 45,
    originalPrice: 50,
    unit: "kg",
    image: "https://5.imimg.com/data5/SELLER/Default/2024/2/383781052/CS/IQ/CG/60065930/urad-gota-1000x1000.jpeg",
    description: "Economy grade whole urad dal (ఉద్దులు). Clean, uniform black lentils ideal for daily Dal Makhani, idli batter, and traditional South Indian recipes.",
    rating: 4.5,
    reviews: 96,
    sizes: ["500g", "1kg", "2kg", "5kg"],
    inStock: true,
    isOrganic: false,
    tag: "Value Pack",
    reviewsList: [
      {
        id: "rev-dals-4",
        author: "Ramesh Yadav",
        rating: 4,
        date: "2026-05-18",
        tags: ["Good Quality"],
        comment: "Good quality urad dal at affordable price. Perfect for daily cooking and idli batter.",
        image: ""
      }
    ]
  },
  {
    id: "dals-005",
    name: "Split Urad Dal (Minapa Pappu)",
    teluguName: "మినప పప్పు",
    category: "dals",
    price: 110,
    originalPrice: 120,
    unit: "kg",
    image: "https://images.tv9telugu.com/wp-content/uploads/2024/08/urad-dal-4.jpg",
    description: "De-husked split white urad dal (మినప పప్పు). Smooth, creamy texture when cooked. Essential for making vada, papad, medu vada, and rich gravies.",
    rating: 4.7,
    reviews: 108,
    sizes: ["500g", "1kg", "2kg"],
    inStock: true,
    isOrganic: false,
    tag: "Premium Split",
    reviewsList: [
      {
        id: "rev-dals-5",
        author: "Vijaya Lakshmi",
        rating: 5,
        date: "2026-05-20",
        tags: ["Good Quality", "Fresh Products"],
        comment: "Excellent split urad dal. Makes crispy medu vadas and perfectly creamy dal every time!",
        image: ""
      }
    ]
  },
  {
    id: "dals-006",
    name: "Whole Urad Dal (Minapapulu)",
    teluguName: "మినప్పులు",
    category: "dals",
    price: 120,
    originalPrice: 130,
    unit: "kg",
    image: "https://tse2.mm.bing.net/th/id/OIP.ly07bJ9D8AuN5RlW0XU5CwHaD4?pid=Api&P=0&h=180",
    description: "Premium whole urad dal (మినప్పులు) with skin intact. High protein, rich earthy flavor. Ideal for Dal Makhani, wholesome curries, and nutritious sprouts.",
    rating: 4.6,
    reviews: 87,
    sizes: ["500g", "1kg", "2kg"],
    inStock: true,
    isOrganic: false,
    tag: "High Protein",
    reviewsList: [
      {
        id: "rev-dals-6",
        author: "Srinivas K.",
        rating: 5,
        date: "2026-05-22",
        tags: ["Good Quality"],
        comment: "Very good whole urad dal. Rich taste and cooks beautifully for Dal Makhani.",
        image: ""
      }
    ]
  },

  // --- Daily Essentials ---
  {
    id: "ess-001",
    name: "Jaggery (Bellam)",
    teluguName: "బెల్లం",
    category: "essentials",
    price: 55,
    originalPrice: 60,
    unit: "kg",
    image: "https://www.nutritionfact.in/wp-content/uploads/2022/02/jaggery.jpg",
    description: "Natural unrefined jaggery blocks (బెల్లం). Rich caramel flavor with iron and minerals intact. Healthier sweetener for sweets, tea, and traditional recipes.",
    rating: 4.7,
    reviews: 134,
    sizes: ["500g", "1kg", "1.5kg"],
    inStock: true,
    isOrganic: true,
    tag: "Natural Sweetener",
    reviewsList: [
      {
        id: "rev-ess-1",
        author: "Kamala Devi",
        rating: 5,
        date: "2026-05-14",
        tags: ["Fresh Products", "Good Quality"],
        comment: "Pure and fresh jaggery with rich golden color. Perfect sweetness for our traditional sweets!",
        image: ""
      }
    ]
  },
  {
    id: "ess-002",
    name: "Tamarind Grade 1 (Chintapandu)",
    teluguName: "చింతపండు రకం 1",
    category: "essentials",
    price: 250,
    originalPrice: 299,
    unit: "kg",
    image: "https://tiimg.tistatic.com/fp/1/007/357/a-grade-100-pure-dried-sweet-and-sour-raw-tamarind-with-seed-for-chutney-271.jpg",
    description: "Premium A-grade seedless tamarind (చింతపండు రకం 1). Deep sour flavor with natural sweetness. Perfect for sambar, rasam, chutneys, and tangy rice preparations.",
    rating: 4.9,
    reviews: 167,
    sizes: ["250g", "500g", "1kg"],
    inStock: true,
    isOrganic: true,
    tag: "Grade A Premium",
    reviewsList: [
      {
        id: "rev-ess-2",
        author: "Sulochana B.",
        rating: 5,
        date: "2026-05-16",
        tags: ["Good Quality", "Fresh Products"],
        comment: "Best quality tamarind I've ever bought. Very tangy and fresh. Makes perfect sambar!",
        image: ""
      }
    ]
  },
  {
    id: "ess-003",
    name: "Tamarind Grade 2 (Chintapandu)",
    teluguName: "చింతపండు రకం 2",
    category: "essentials",
    price: 150,
    originalPrice: 179,
    unit: "pack",
    image: "https://tse3.mm.bing.net/th/id/OIP.2nsPhJzLebYzlUXIbxHB0UwAiHaHa?pid=Api&P=0&h=180",
    description: "Standard grade tamarind (చింతపండు రకం 2) with seeds. Good sour kick for daily cooking. Ideal for everyday sambar, rasam, and pickles at budget-friendly price.",
    rating: 4.4,
    reviews: 93,
    sizes: ["250g", "500g"],
    inStock: true,
    isOrganic: false,
    tag: "Budget Pack",
    reviewsList: [
      {
        id: "rev-ess-3",
        author: "Manga Devi",
        rating: 4,
        date: "2026-05-19",
        tags: ["Good Quality"],
        comment: "Good tamarind for daily use. Value for money and decent sour taste.",
        image: ""
      }
    ]
  },
  {
    id: "ess-004",
    name: "Pepper Chips (Pappu Chips)",
    teluguName: "పప్పుల చిప్స్",
    category: "essentials",
    price: 25,
    originalPrice: 30,
    unit: "kg",
    image: "https://imgs.etvbharat.com/etvbharat/prod-images/14-09-2025/1200-675-25011286-thumbnail-16x9-rice-flour-chips.jpg",
    description: "Crunchy raw rice flour pepper chips (పప్పుల చిప్స్). Ready to deep fry for instant crispy snacks. Lightly seasoned with black pepper and salt.",
    rating: 4.5,
    reviews: 78,
    sizes: ["250g", "500g", "1kg"],
    inStock: true,
    isOrganic: false,
    tag: "Ready to Fry",
    reviewsList: [
      {
        id: "rev-ess-4",
        author: "Rajini Priya",
        rating: 5,
        date: "2026-05-21",
        tags: ["Good Quality"],
        comment: "Excellent pepper chips! Fries up super crispy and tasty. Kids love them!",
        image: ""
      }
    ]
  },
  {
    id: "ess-005",
    name: "Rock Salt (Rathi Uppu)",
    teluguName: "కల్లు ఉప్పు",
    category: "essentials",
    price: 25,
    originalPrice: 30,
    unit: "pack",
    image: "https://www.dishadaily.com/h-upload/2024/01/19/299108-web-image.jpg",
    description: "Natural pink rock salt crystals (కల్లు ఉప్పు). Unprocessed and mineral-rich alternative to table salt. Adds mild salty taste with trace minerals intact.",
    rating: 4.6,
    reviews: 64,
    sizes: ["500g", "1kg"],
    inStock: true,
    isOrganic: true,
    tag: "Natural Mineral",
    reviewsList: [
      {
        id: "rev-ess-5",
        author: "Geetha Rani",
        rating: 5,
        date: "2026-05-17",
        tags: ["Good Quality", "Fresh Products"],
        comment: "Very pure rock salt. We use it for cooking and pickling. Great natural alternative!",
        image: ""
      }
    ]
  },
  {
    id: "ess-006",
    name: "Citric Salt (Lemon Salt)",
    teluguName: "నిమ్మ ఉప్పు",
    category: "essentials",
    price: 20,
    originalPrice: 25,
    unit: "pack",
    image: "https://tse1.mm.bing.net/th/id/OIP.qSjtjSDUkUf76XAb4ntF1wHaHe?pid=Api&P=0&h=180",
    description: "Pure food-grade citric acid crystals (నిమ్మ ఉప్పు). Adds sharp tangy flavor to chaats, drinks, and preserves. Also used in cleaning and pickling recipes.",
    rating: 4.5,
    reviews: 56,
    sizes: ["100g", "250g"],
    inStock: true,
    isOrganic: false,
    tag: "Multipurpose",
    reviewsList: [
      {
        id: "rev-ess-6",
        author: "Swathi M.",
        rating: 4,
        date: "2026-05-23",
        tags: ["Good Quality"],
        comment: "Good quality citric salt. Perfect for making lemon rice and tangy chutneys.",
        image: ""
      }
    ]
  }
];

// Coupon systems database
const PROMO_COUPONS = {
  "GANESH10": {
    discountType: "percent",
    value: 10,
    minCart: 400,
    description: "Get 10% off on all orders above ₹400"
  },
  "FREESHIP": {
    discountType: "freeship",
    value: 0,
    minCart: 299,
    description: "Free delivery for orders above ₹299"
  },
  "FESTIVE50": {
    discountType: "flat",
    value: 50,
    minCart: 600,
    description: "Flat ₹50 off on orders above ₹600"
  }
};
