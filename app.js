// Complete State Engine and Dual-Role Interactive Controller for Ganesh Provisions
// Premium Grocery Store Edition with Splash Screens, Ratings, Tracking Maps & Revenue Analytics.

class GroceryApp {
  constructor() {
    // Initial Seed Loader for Catalog Persistence
    this.initCatalogDatabase();

    // Core Reactive State
    this.state = {
      user: JSON.parse(localStorage.getItem('gp_user')) || null, // Active user profile
      userRole: null, // 'customer' | 'owner' | null
      catalog: JSON.parse(localStorage.getItem('gp_catalog')) || [],
      cart: JSON.parse(localStorage.getItem('gp_cart')) || [],
      wishlist: JSON.parse(localStorage.getItem('gp_wishlist')) || [],
      orders: JSON.parse(localStorage.getItem('gp_orders')) || [],
      activeCategory: 'all',
      searchQuery: '',
      sortMethod: 'default',
      appliedCoupon: null,
      currentCheckoutStep: 1,
      currentView: 'home', // 'home' | 'tracker' | 'owner'
      activeLoginTab: 'customer', // 'customer' | 'owner'
      selectedSizeCache: {}, // selected card weights
      activeOtp: null, // Generated random OTP for verification
      
      // Feedback system details
      selectedFeedbackStars: 5,
      selectedFeedbackChips: [],
      uploadedFeedbackImage: "",
      feedbackOrderId: null,
      
      // WhatsApp receipt delivery
      whatsappNumber: localStorage.getItem('gp_wa_number') || (JSON.parse(localStorage.getItem('gp_user'))?.phone) || '',
      
      // Temporary Checkout Form values
      checkoutForm: {
        name: '',
        phone: '',
        email: '',
        address: '',
        pincode: '',
        deliverySlot: '',
        paymentMethod: 'cod'
      },

      // Admin Dashboard View properties
      activeAdminTab: 'products',
      coupons: JSON.parse(localStorage.getItem('gp_coupons')) || {},
      pincodes: JSON.parse(localStorage.getItem('gp_pincodes')) || [],
      storeSettings: JSON.parse(localStorage.getItem('gp_settings')) || {}
    };

    // Category lists for dry grocery focus (excluding Rice & Grains since all rice products are removed)
    this.categories = [
      { id: 'all', name: 'All Essentials', emoji: '🛒' },
      { id: 'flour', name: 'Flour & Atta', emoji: '🌾' },
      { id: 'oils', name: 'Oils & Ghee', emoji: '🍯' },
      { id: 'dals', name: 'Dals & Pulses', emoji: '🧆' },
      { id: 'spices', name: 'Spices & Masala', emoji: '🌶️' },
      { id: 'dryfruits', name: 'Dry Fruits & Nuts', emoji: '🌰' },
      { id: 'essentials', name: 'Daily Essentials', emoji: '🧂' }
    ];

    // Auto hooks setup
    window.addEventListener('DOMContentLoaded', () => this.init());
  }

  // --- Persistent Catalog Seeder ---
  initCatalogDatabase() {
    let savedCatalog = localStorage.getItem('gp_catalog');
    if (!savedCatalog) {
      localStorage.setItem('gp_catalog', JSON.stringify(GROCERY_PRODUCTS));
    } else {
      try {
        let parsed = JSON.parse(savedCatalog);
        if (parsed.length === 0) {
          localStorage.setItem('gp_catalog', JSON.stringify(GROCERY_PRODUCTS));
        } else {
           // Auto-remove the deleted seed products if they exist in localStorage
           const deletedIds = JSON.parse(localStorage.getItem('gp_deleted_products')) || [];
           const removedIds = ['rice-001', 'rice-002', 'rice-003', 'dals-001', 'dals-002', 'dals-003', 'oils-001', 'oils-002', 'oils-003', 'spc-001', 'spc-002', 'spc-003'];
           const allRemovedIds = [...removedIds, ...deletedIds];
           const hasStale = parsed.some(p => allRemovedIds.includes(p.id));

          if (hasStale) {
            parsed = parsed.filter(p => !allRemovedIds.includes(p.id));
            localStorage.setItem('gp_catalog', JSON.stringify(parsed));
          }

          // Auto-add any new seed products that are in GROCERY_PRODUCTS but not in parsed catalog (excluding deleted ones)
          const parsedIds = new Set(parsed.map(p => p.id));
          const newProducts = GROCERY_PRODUCTS.filter(p => !parsedIds.has(p.id) && !deletedIds.includes(p.id));
          if (newProducts.length > 0) {
            parsed = [...parsed, ...newProducts];
            localStorage.setItem('gp_catalog', JSON.stringify(parsed));
          }
        }
      } catch (e) {
        localStorage.setItem('gp_catalog', JSON.stringify(GROCERY_PRODUCTS));
      }
    }

    let savedCoupons = localStorage.getItem('gp_coupons');
    if (!savedCoupons) {
      localStorage.setItem('gp_coupons', JSON.stringify(PROMO_COUPONS));
    }

    let savedPincodes = localStorage.getItem('gp_pincodes');
    if (!savedPincodes) {
      localStorage.setItem('gp_pincodes', JSON.stringify([
        { val: '600001', fee: 0, status: 'active' },
        { val: '600002', fee: 0, status: 'active' },
        { val: '600020', fee: 20, status: 'active' }
      ]));
    }

    let savedSettings = localStorage.getItem('gp_settings');
    if (!savedSettings) {
      localStorage.setItem('gp_settings', JSON.stringify({
        name: 'Ganesh Provisions',
        phone: '9150436455',
        minFreeShip: 299,
        shipFee: 40,
        status: 'open'
      }));
    }
  }

  // --- Initializer & Sync states ---
  init() {
    this.setupDOMReferences();
    this.setupEventListeners();
    this.syncUserRole();
    this.startDynamicTimers();
    this.renderCategoryTabs();
    this.renderProducts();
    this.syncCartBadge();
    this.syncWishlistBadge();
    
    // Play splash screen loader bar
    this.playSplashSequence();
    
    // Check if active order tracking loops are required
    this.checkActiveOrderSimulations();

    this.autoRedirectIfFileProtocol();
    this.syncWithServer();
  }

  bind3DTiltEvents() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const rotateY = ((x / rect.width) - 0.5) * 12; // -6 to +6 degrees
        const rotateX = (0.5 - (y / rect.height)) * 12; // -6 to +6 degrees
        
        card.style.transition = 'transform 0.08s ease-out, box-shadow 0.15s ease, border-color 0.15s ease';
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.025, 1.025, 1.025)`;
        card.style.boxShadow = '0 15px 30px rgba(11, 94, 63, 0.12)';
        card.style.borderColor = 'rgba(11, 94, 63, 0.22)';
        
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        card.style.backgroundImage = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255,255,255,0.12) 0%, transparent 60%)`;
        
        const img = card.querySelector('.product-visual-wrapper img');
        if (img) {
          img.style.transition = 'transform 0.08s ease-out';
          img.style.transform = `translateZ(20px) scale(1.025)`;
        }
        
        const badge = card.querySelector('.card-badge-container');
        if (badge) {
          badge.style.transition = 'transform 0.08s ease-out';
          badge.style.transform = `translateZ(10px)`;
        }
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.45s ease, border-color 0.45s ease, background-image 0.45s ease';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        card.style.boxShadow = '';
        card.style.borderColor = '';
        card.style.backgroundImage = '';
        
        const img = card.querySelector('.product-visual-wrapper img');
        if (img) {
          img.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
          img.style.transform = 'translateZ(0) scale(1)';
        }
        
        const badge = card.querySelector('.card-badge-container');
        if (badge) {
          badge.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
          badge.style.transform = 'translateZ(0)';
        }
      });
    });
  }

  triggerFlyingCartAnimation(prodId) {
    const card = document.querySelector(`.product-card[data-id="${prodId}"]`);
    if (!card) return;

    const img = card.querySelector('.product-visual-wrapper img');
    if (!img) return;

    const cartTrigger = document.getElementById('cart-trigger');
    const mobCart = document.getElementById('mob-nav-cart');
    
    const targetElement = (window.innerWidth <= 768 && mobCart) ? mobCart : cartTrigger;
    if (!targetElement) return;

    const startRect = img.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    const clone = document.createElement('div');
    clone.className = 'flying-cart-item';
    clone.style.position = 'fixed';
    clone.style.zIndex = '10000';
    clone.style.left = `${startRect.left + startRect.width/2 - 20}px`;
    clone.style.top = `${startRect.top + startRect.height/2 - 20}px`;
    clone.style.width = '40px';
    clone.style.height = '40px';
    clone.style.borderRadius = '50%';
    clone.style.backgroundImage = `url('${img.src}')`;
    clone.style.backgroundSize = 'cover';
    clone.style.backgroundPosition = 'center';
    clone.style.boxShadow = '0 6px 15px rgba(11, 94, 63, 0.25)';
    clone.style.pointerEvents = 'none';
    clone.style.border = '2px solid var(--primary-color)';
    
    document.body.appendChild(clone);

    const diffX = targetRect.left + targetRect.width/2 - (startRect.left + startRect.width/2);
    const diffY = targetRect.top + targetRect.height/2 - (startRect.top + startRect.height/2);

    clone.animate([
      {
        transform: 'translate(0, 0) scale(1) rotate(0deg)',
        opacity: 1
      },
      {
        transform: `translate(${diffX * 0.45}px, ${diffY * 0.12 - 70}px) scale(0.7) rotate(180deg)`,
        opacity: 0.9
      },
      {
        transform: `translate(${diffX}px, ${diffY}px) scale(0.2) rotate(360deg)`,
        opacity: 0.2
      }
    ], {
      duration: 650,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }).onfinish = () => {
      clone.remove();
      targetElement.classList.add('pulse-badge');
      setTimeout(() => targetElement.classList.remove('pulse-badge'), 500);
    };
  }

  escapeJsString(value) {
    return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }

  /** API base URL — must be http(s); file:// cannot call the backend. */
  getBackendUrl() {
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      return window.location.origin;
    }
    return 'http://localhost:3001';
  }

  async syncWithServer() {
    try {
      const response = await fetch(`${this.getBackendUrl()}/api/db`);
      if (response.ok) {
        const db = await response.json();
        
        // Sync catalog
        if (db.catalog && Array.isArray(db.catalog) && db.catalog.length > 0) {
          this.state.catalog = db.catalog;
          localStorage.setItem('gp_catalog', JSON.stringify(db.catalog));
        }
        
        // Sync coupons
        if (db.coupons && typeof db.coupons === 'object') {
          this.state.coupons = db.coupons;
          localStorage.setItem('gp_coupons', JSON.stringify(db.coupons));
        }
        
        // Sync pincodes
        if (db.pincodes && Array.isArray(db.pincodes)) {
          this.state.pincodes = db.pincodes;
          localStorage.setItem('gp_pincodes', JSON.stringify(db.pincodes));
        }
        
        // Sync settings
        if (db.settings && typeof db.settings === 'object') {
          this.state.storeSettings = db.settings;
          localStorage.setItem('gp_settings', JSON.stringify(db.settings));
          
          // Dynamically update brand name inside app headers
          const logoBlock = document.getElementById('brand-logo');
          if (logoBlock && db.settings.name) {
            const heading = logoBlock.querySelector('h1');
            if (heading) heading.textContent = db.settings.name;
          }
        }
        
        // Sync orders
        if (db.orders && Array.isArray(db.orders)) {
          this.state.orders = db.orders;
          localStorage.setItem('gp_orders', JSON.stringify(db.orders));
        }
        
        // Refresh rendering since data might have changed
        this.renderProducts();
        if (this.state.currentView === 'owner') {
          this.renderOwnerDashboard();
        } else if (this.state.currentView === 'tracker') {
          this.renderOrdersTracker();
          this.renderExpensesChartAndSummary();
        }
      }
    } catch (err) {
      console.warn("Could not sync database with server, using local fallback:", err);
    }
  }

  async saveToServer(key, data) {
    try {
      const response = await fetch(`${this.getBackendUrl()}/api/db/${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        console.error(`Failed to save ${key} to server.`);
      }
    } catch (err) {
      console.error(`Error saving ${key} to server:`, err);
    }
  }

  async saveOrderToServer(newOrder) {
    try {
      const response = await fetch(`${this.getBackendUrl()}/api/db/orders/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newOrder)
      });
      if (response.ok) {
        const result = await response.json();
        if (result.orders) {
          this.state.orders = result.orders;
          localStorage.setItem('gp_orders', JSON.stringify(this.state.orders));
        }
      } else {
        console.error("Failed to append order to server.");
      }
    } catch (err) {
      console.error("Error appending order to server:", err);
    }
  }

  /**
   * If the page was opened directly as a file:// URL, silently check
   * whether the backend server is running and auto-redirect to it.
   * This eliminates all file:// security-origin errors.
   */
  autoRedirectIfFileProtocol() {
    if (window.location.protocol !== 'file:') return;

    const serverUrl = 'http://localhost:3001';

    // Silently ping the health endpoint
    fetch(`${serverUrl}/api/health`, { mode: 'cors' })
      .then(r => r.json())
      .then(data => {
        if (data && data.status === 'ok') {
          // Server is running — redirect seamlessly
          window.location.href = serverUrl;
        }
      })
      .catch(() => {
        // Server not running — no error, just continue as static page
      });
  }

  setupDOMReferences() {
    this.dom = {
      timeBannerText: document.getElementById('time-banner-text'),
      timeBanner: document.getElementById('time-banner'),
      usernameDisplay: document.getElementById('username-display'),
      cartCount: document.getElementById('cart-count'),
      wishlistCount: document.getElementById('wishlist-count'),
      productsGrid: document.getElementById('products-catalog-grid'),
      categoriesContainer: document.getElementById('categories-container'),
      cartOverlay: document.getElementById('cart-overlay-mask'),
      cartItemsBody: document.getElementById('cart-drawer-items'),
      subtotalVal: document.getElementById('subtotal-val'),
      discountVal: document.getElementById('discount-val'),
      deliveryVal: document.getElementById('delivery-val'),
      totalVal: document.getElementById('total-val'),
      couponInput: document.getElementById('coupon-input'),
      activeCouponIndicator: document.getElementById('active-coupon-indicator'),
      activeCouponCode: document.getElementById('active-coupon-code'),
      activeCouponDesc: document.getElementById('active-coupon-desc'),
      checkoutModal: document.getElementById('checkout-modal-mask'),
      checkoutBody: document.getElementById('checkout-wizard-body'),
      btnWizardBack: document.getElementById('btn-wizard-back'),
      btnWizardNext: document.getElementById('btn-wizard-next'),
      detailModal: document.getElementById('detail-modal-mask'),
      detailModalBody: document.getElementById('detail-modal-body'),
      loginModal: document.getElementById('login-modal-mask'),
      loginPhone: document.getElementById('login-phone'),
      otpGroup: document.getElementById('otp-group'),
      loginOtp: document.getElementById('login-otp'),
      loginBtnSubmit: document.getElementById('login-btn-submit'),
      mainView: document.getElementById('main-view'),
      homeView: document.getElementById('home-view'),
      trackerView: document.getElementById('tracker-view'),
      ownerView: document.getElementById('owner-view'),
      orderHistoryContainer: document.getElementById('order-history-container'),
      catalogSearch: document.getElementById('catalog-search'),
      suggestionsBox: document.getElementById('search-suggestions-box'),
      navHome: document.getElementById('nav-home'),
      navShop: document.getElementById('nav-shop'),
      navTracker: document.getElementById('nav-tracker'),
      navOwner: document.getElementById('nav-owner'),
      
      // Owner specific nodes
      ownerRevenue: document.getElementById('owner-revenue'),
      ownerActiveOrders: document.getElementById('owner-active-orders'),
      ownerTotalOrders: document.getElementById('owner-total-orders'),
      ownerCatalogCount: document.getElementById('owner-catalog-count'),
      ownerOrdersContainer: document.getElementById('owner-orders-container'),
      ownerProductEditModal: document.getElementById('owner-product-edit-modal-mask'),

      // WhatsApp modal
      waModalOverlay: document.getElementById('wa-modal-overlay'),
      waPhoneInput: document.getElementById('wa-phone-input'),

      toastWrapper: document.getElementById('toast-wrapper')
    };
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (this.dom.suggestionsBox && !e.target.closest('.hero-search-wrapper')) {
        this.dom.suggestionsBox.style.display = 'none';
      }
    });
  }

  // --- Splash Screen Engine ---
  playSplashSequence() {
    const fill = document.getElementById('splash-loading-fill');
    if (fill) {
      setTimeout(() => {
        fill.style.width = "100%";
      }, 100);
    }
    
    setTimeout(() => {
      const splash = document.getElementById('gp-splash-screen');
      if (splash) {
        splash.style.opacity = "0";
        splash.style.pointerEvents = "none";
        setTimeout(() => {
          splash.style.display = "none";
          this.showToast("Ganesh Provisions is loaded! Pure dry groceries in stock.", "success");
        }, 600);
      }
    }, 2500);
  }

  // --- Dynamic Timers (Time-based Greetings) ---
  startDynamicTimers() {
    this.updateGreetingText();
    setInterval(() => this.updateGreetingText(), 60000);
  }

  updateGreetingText() {
    const hour = new Date().getHours();
    let timeText = "";
    let heroText = "";

    if (hour >= 5 && hour < 12) {
      timeText = "☀️ Good Morning! Aged Basmati & high grade spices fresh stocks are ready.";
      heroText = "Start Your Morning with <span>Aromatic & Pure</span> Dry Groceries.";
    } else if (hour >= 12 && hour < 17) {
      timeText = "🌤️ Good Afternoon! Standard slots active. Golden cow ghee & dry nuts fully stocked.";
      heroText = "Good Afternoon! Refill Your Kitchen with <span>Pure & Healthy</span> Essentials.";
    } else if (hour >= 17 && hour < 21) {
      timeText = "🌇 Good Evening! Secure slots now to receive early delivery tomorrow morning.";
      heroText = "Preparing Festive Dinners? Get <span>Premium Spices & Grains</span> Delivered.";
    } else {
      timeText = "🌙 Sweet Night! Orders are open 24/7 for lightning-fast morning deliveries.";
      heroText = "Book Overnight Orders for <span>Morning Cookings</span>.";
    }

    if (this.dom.timeBannerText) this.dom.timeBannerText.textContent = timeText;
    
    const dynamicHeroGreeting = document.getElementById('dynamic-hero-greeting');
    if (dynamicHeroGreeting && this.state.searchQuery === '') {
      // Disabled: keep static welcome greeting text
      // dynamicHeroGreeting.innerHTML = heroText;
    }
  }

  // --- Role Sync Systems ---
  syncUserRole() {
    if (this.state.user) {
      this.state.userRole = this.state.user.role || 'customer';
    } else {
      this.state.userRole = null;
    }
    this.updateRoleUI();
  }

  updateRoleUI() {
    if (!this.dom.usernameDisplay) return;

    const mobOrders = document.getElementById('mob-nav-orders');

    if (this.state.user) {
      this.dom.usernameDisplay.textContent = this.state.user.name;
      
      if (this.state.userRole === 'owner') {
        // Owner UI setup
        if (this.dom.navOwner) this.dom.navOwner.style.display = 'block';
        if (this.dom.navTracker) this.dom.navTracker.style.display = 'none';
        if (mobOrders) mobOrders.style.display = 'none';
        
        // Hide standard shopper cart & wishlist icons for owners
        const wishlistTrigger = document.getElementById('wishlist-trigger');
        const cartTrigger = document.getElementById('cart-trigger');
        if (wishlistTrigger) wishlistTrigger.style.display = 'none';
        if (cartTrigger) cartTrigger.style.display = 'none';
        
        this.dom.usernameDisplay.innerHTML = `<i class="fa-solid fa-crown" style="color:var(--accent-gold);"></i> Owner`;
      } else {
        // Customer UI setup
        if (this.dom.navOwner) this.dom.navOwner.style.display = 'none';
        if (this.dom.navTracker) this.dom.navTracker.style.display = 'block';
        if (mobOrders) mobOrders.style.display = 'block';
        
        const wishlistTrigger = document.getElementById('wishlist-trigger');
        const cartTrigger = document.getElementById('cart-trigger');
        if (wishlistTrigger) wishlistTrigger.style.display = 'flex';
        if (cartTrigger) cartTrigger.style.display = 'flex';

        // Add a logout button right inside the customer user badge for instant toggle!
        this.dom.usernameDisplay.innerHTML = `${this.state.user.name} <i class="fa-solid fa-right-from-bracket" onclick="event.stopPropagation(); app.handleLogout();" style="margin-left: 8px; color: #ef4444;" title="Sign Out"></i>`;
      }
    } else {
      this.dom.usernameDisplay.textContent = "Login";
      if (this.dom.navOwner) this.dom.navOwner.style.display = 'none';
      if (this.dom.navTracker) this.dom.navTracker.style.display = 'none';
      if (mobOrders) mobOrders.style.display = 'none';
      
      const wishlistTrigger = document.getElementById('wishlist-trigger');
      const cartTrigger = document.getElementById('cart-trigger');
      if (wishlistTrigger) wishlistTrigger.style.display = 'flex';
      if (cartTrigger) cartTrigger.style.display = 'flex';
    }
  }

  // --- Multi-view Switching engine ---
  setView(viewName) {
    if (viewName === 'tracker' && !this.state.user) {
      this.showToast("Please login to view your orders", "error");
      this.openLoginModal();
      return;
    }

    this.state.currentView = viewName;
    
    // reset navigation highlights
    if (this.dom.navHome) this.dom.navHome.classList.remove('active');
    if (this.dom.navTracker) this.dom.navTracker.classList.remove('active');
    if (this.dom.navOwner) this.dom.navOwner.classList.remove('active');
    
    const mobHome = document.getElementById('mob-nav-home');
    const mobOrders = document.getElementById('mob-nav-orders');
    const mobProfile = document.getElementById('mob-nav-profile');
    if (mobHome) mobHome.classList.remove('active');
    if (mobOrders) mobOrders.classList.remove('active');
    if (mobProfile) mobProfile.classList.remove('active');

    // Hide all containers
    if (this.dom.homeView) this.dom.homeView.style.display = 'none';
    if (this.dom.trackerView) this.dom.trackerView.style.display = 'none';
    if (this.dom.ownerView) this.dom.ownerView.style.display = 'none';

    // Clear any previous tracker polling interval
    if (this.trackerRefreshInterval) {
      clearInterval(this.trackerRefreshInterval);
      this.trackerRefreshInterval = null;
    }

    if (viewName === 'home') {
      if (this.dom.homeView) this.dom.homeView.style.display = 'block';
      if (this.dom.navHome) this.dom.navHome.classList.add('active');
      if (mobHome) mobHome.classList.add('active');
      this.renderProducts();
    } else if (viewName === 'tracker') {
      if (this.dom.trackerView) this.dom.trackerView.style.display = 'block';
      if (this.dom.navTracker) this.dom.navTracker.classList.add('active');
      if (mobOrders) mobOrders.classList.add('active');
      this.renderOrdersTracker();
       // Poll server for order state updates (when owner modifies status)
      this.trackerRefreshInterval = setInterval(async () => {
        try {
          const response = await fetch(`${this.getBackendUrl()}/api/db/orders`);
          if (response.ok) {
            const serverOrders = await response.json();
            const currentOrdersStr = JSON.stringify(serverOrders);
            const lastOrdersStr = localStorage.getItem('gp_orders');
            if (currentOrdersStr !== lastOrdersStr) {
              this.state.orders = serverOrders;
              localStorage.setItem('gp_orders', currentOrdersStr);
              this.renderOrdersTracker();
              this.renderExpensesChartAndSummary();
            }
          }
        } catch (err) {
          const currentOrdersStr = localStorage.getItem('gp_orders');
          if (currentOrdersStr !== JSON.stringify(this.state.orders)) {
            this.state.orders = JSON.parse(currentOrdersStr) || [];
            this.renderOrdersTracker();
            this.renderExpensesChartAndSummary();
          }
        }
      }, 3000);
    } else if (viewName === 'owner') {
      if (this.state.userRole !== 'owner') {
        this.showToast("Access Denied! Authorized personnel only.", "error");
        this.setView('home');
        return;
      }
      if (this.dom.ownerView) this.dom.ownerView.style.display = 'block';
      if (this.dom.navOwner) this.dom.navOwner.classList.add('active');
      this.renderOwnerDashboard();
 
      // Poll server for owner dashboard updates as well
      this.trackerRefreshInterval = setInterval(async () => {
        try {
          const response = await fetch(`${this.getBackendUrl()}/api/db/orders`);
          if (response.ok) {
            const serverOrders = await response.json();
            const currentOrdersStr = JSON.stringify(serverOrders);
            const lastOrdersStr = localStorage.getItem('gp_orders');
            if (currentOrdersStr !== lastOrdersStr) {
              this.state.orders = serverOrders;
              localStorage.setItem('gp_orders', currentOrdersStr);
              this.renderOwnerDashboard();
            }
          }
        } catch (err) {
          const currentOrdersStr = localStorage.getItem('gp_orders');
          if (currentOrdersStr !== JSON.stringify(this.state.orders)) {
            this.state.orders = JSON.parse(currentOrdersStr) || [];
            this.renderOwnerDashboard();
          }
        }
      }, 3000);
    }
  }

  // --- Rendering Catalog & Items ---
  renderCategoryTabs() {
    if (!this.dom.categoriesContainer) return;
    this.dom.categoriesContainer.innerHTML = this.categories.map(cat => `
      <li>
        <button class="tab-btn ${this.state.activeCategory === cat.id ? 'active' : ''}" 
                onclick="app.handleCategoryClick('${cat.id}')">
          <span class="tab-emoji">${cat.emoji}</span>
          ${cat.name}
        </button>
      </li>
    `).join('');
  }

  renderProducts() {
    if (!this.dom.productsGrid) return;
    
    // Refresh products catalog from local persistent store
    this.state.catalog = JSON.parse(localStorage.getItem('gp_catalog')) || [];
    
    let products = this.state.catalog;

    // Filter by Tab
    if (this.state.activeCategory !== 'all') {
      products = products.filter(p => p.category === this.state.activeCategory);
    }

    // Filter by Search Query
    if (this.state.searchQuery) {
      const q = this.state.searchQuery.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.description || '').toLowerCase().includes(q) ||
        (p.tag || '').toLowerCase().includes(q)
      );
    }

    // Sort Products
    if (this.state.sortMethod === 'price-low') {
      products = [...products].sort((a, b) => a.price - b.price);
    } else if (this.state.sortMethod === 'price-high') {
      products = [...products].sort((a, b) => b.price - a.price);
    } else if (this.state.sortMethod === 'rating') {
      products = [...products].sort((a, b) => b.rating - a.rating);
    }

    if (products.length === 0) {
      this.dom.productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 0; color: var(--text-muted);">
          <i class="fa-solid fa-face-frown" style="font-size: 3rem; color: var(--secondary-color); margin-bottom: 16px;"></i>
          <h4>No products found</h4>
          <p style="margin-top: 8px;">Try something else or check your category tags.</p>
          <button class="btn-search" onclick="app.resetFilters()" style="margin-top: 16px;">View Seed Catalog</button>
        </div>
      `;
      return;
    }

    this.dom.productsGrid.innerHTML = products.map((prod, idx) => {
      const isWishlisted = this.state.wishlist.includes(prod.id);
      const selectedSize = this.state.selectedSizeCache[prod.id] || prod.sizes[0];
      const selectedPrice = this.calculatePrice(prod.price, selectedSize, prod.sizes[0]);
      
      // Calculate active discount tag
      const discountPercent = prod.originalPrice 
        ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100) 
        : 0;

      // Check if this product+size is already in the cart
      const cartQty = this.getCardCartQty(prod.id, selectedSize);

      return `
        <div class="product-card" data-id="${prod.id}" style="--i: ${idx}">
          <div class="card-badge-container">
            ${prod.isOrganic ? '<span class="badge badge-organic"><i class="fa-solid fa-leaf"></i> Organic</span>' : ''}
            ${prod.tag ? `<span class="badge badge-tag">${prod.tag}</span>` : ''}
          </div>

          <button class="btn-wishlist ${isWishlisted ? 'active' : ''}" 
                  onclick="app.toggleWishlist('${prod.id}')" 
                  title="Save to Wishlist">
            <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
          </button>

          <div class="product-visual-wrapper" onclick="app.openProductDetailModal('${prod.id}')">
            <img src="${prod.image}" alt="${prod.name}" class="hero-image" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'">
          </div>

          <div class="product-details-box">
            <div class="product-rating">
              <span class="star-rating">
                ${'<i class="fa-solid fa-star"></i>'.repeat(Math.floor(prod.rating))}
                ${prod.rating % 1 >= 0.5 ? '<i class="fa-solid fa-star-half-stroke"></i>' : ''}
                ${'<i class="fa-regular fa-star"></i>'.repeat(5 - Math.ceil(prod.rating))}
              </span>
              <span>(${prod.reviews})</span>
            </div>

            <h4 onclick="app.openProductDetailModal('${prod.id}')">${prod.name}</h4>
            ${prod.teluguName ? `<span class="product-telugu-name">${prod.teluguName}</span>` : ''}
            <p class="product-desc-truncate">${prod.description}</p>

            <div class="product-options-row">
              <select class="size-select-card" onchange="app.handleSizeChange('${prod.id}', this)">
                ${prod.sizes.map(size => `
                  <option value="${size}" ${selectedSize === size ? 'selected' : ''}>${size}</option>
                `).join('')}
              </select>

              <div class="price-block">
                <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
                  <span class="price-val">₹${selectedPrice}</span>
                  ${prod.originalPrice ? `<span style="font-size:0.75rem; text-decoration:line-through; color:var(--text-muted);">₹${this.calculatePrice(prod.originalPrice, selectedSize, prod.sizes[0])}</span>` : ''}
                  ${discountPercent > 0 ? `<span class="card-discount-tag">${discountPercent}% OFF</span>` : ''}
                </div>
                <span class="price-unit">per ${selectedSize}</span>
              </div>
            </div>

            <div class="card-dual-buttons">
              ${prod.inStock === false ? `
                <button class="btn-card-add" disabled style="background-color: var(--border-color); color: var(--text-muted); cursor: not-allowed; grid-column: span 2; border-color: var(--border-color);">
                  <i class="fa-solid fa-ban"></i> Out of Stock
                </button>
              ` : `
                ${cartQty > 0 ? `
                  <div class="card-qty-counter">
                    <button class="qty-dec" onclick="app.cardDecrementQty('${prod.id}', '${selectedSize}')">−</button>
                    <span class="qty-display">${cartQty}</span>
                    <button class="qty-inc" onclick="app.cardIncrementQty('${prod.id}', '${selectedSize}')">+</button>
                  </div>
                ` : `
                  <button class="btn-card-add" onclick="app.addItemToCart('${prod.id}')">
                    <i class="fa-solid fa-plus"></i> Add
                  </button>
                `}
                <button class="btn-card-buy" onclick="app.buyNow('${prod.id}')">
                  <i class="fa-solid fa-bolt"></i> Buy Now
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    this.bind3DTiltEvents();
  }

  updateProductCardButtons(prodId) {
    const card = document.querySelector(`.product-card[data-id="${prodId}"]`);
    if (!card) return;

    const prod = this.state.catalog.find(p => p.id === prodId);
    if (!prod) return;

    const selectedSize = this.state.selectedSizeCache[prodId] || prod.sizes[0];
    const cartQty = this.getCardCartQty(prodId, selectedSize);
    const container = card.querySelector('.card-dual-buttons');
    if (!container) return;

    if (prod.inStock === false) {
      container.innerHTML = `
        <button class="btn-card-add" disabled style="background-color: var(--border-color); color: var(--text-muted); cursor: not-allowed; grid-column: span 2; border-color: var(--border-color);">
          <i class="fa-solid fa-ban"></i> Out of Stock
        </button>
      `;
    } else {
      container.innerHTML = `
        ${cartQty > 0 ? `
          <div class="card-qty-counter">
            <button class="qty-dec" onclick="app.cardDecrementQty('${prod.id}', '${selectedSize}')">−</button>
            <span class="qty-display">${cartQty}</span>
            <button class="qty-inc" onclick="app.cardIncrementQty('${prod.id}', '${selectedSize}')">+</button>
          </div>
        ` : `
          <button class="btn-card-add" onclick="app.addItemToCart('${prod.id}')">
            <i class="fa-solid fa-plus"></i> Add
          </button>
        `}
        <button class="btn-card-buy" onclick="app.buyNow('${prod.id}')">
          <i class="fa-solid fa-bolt"></i> Buy Now
        </button>
      `;
    }
  }

  // --- Dynamic Weights Pricing Estimator ---
  calculatePrice(basePrice, selectedSize, originalSize) {
    try {
      const getGrams = (str) => {
        const val = parseFloat(str);
        const lower = str.toLowerCase();
        if (lower.includes('ml')) return val;
        if (lower.includes('l')) return val * 1000;
        if (lower.includes('kg')) return val * 1000;
        if (lower.includes('g')) return val;
        if (lower.includes('pcs')) return val * 100;
        if (lower.includes('dozen')) return val * 1200;
        if (lower.includes('bundle')) return val * 1000;
        return 1000;
      };

      const originalGrams = getGrams(originalSize);
      const selectedGrams = getGrams(selectedSize);

      const ratio = selectedGrams / originalGrams;
      let calculated = basePrice * ratio;

      return Math.round(calculated);
    } catch(e) {
      return basePrice;
    }
  }

  handleSizeChange(prodId, selectElem) {
    this.state.selectedSizeCache[prodId] = selectElem.value;
    this.renderProducts();
  }

  handleCategoryClick(catId) {
    this.state.activeCategory = catId;
    this.renderCategoryTabs();
    this.renderProducts();
    this.scrollToCatalog();
  }

  // --- Dynamic Search Bar Utilities ---
  handleSearchInput(event) {
    const val = event.target.value;
    this.state.searchQuery = val;
    
    if (!this.dom.suggestionsBox) return;

    if (val.length < 2) {
      this.dom.suggestionsBox.style.display = 'none';
      return;
    }

    const query = val.toLowerCase();
    const suggestions = this.state.catalog.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query)
    ).slice(0, 5);

    if (suggestions.length === 0) {
      this.dom.suggestionsBox.style.display = 'none';
      return;
    }

    this.dom.suggestionsBox.innerHTML = suggestions.map(prod => `
      <div class="suggestion-item" onclick="app.selectSuggestion('${this.escapeJsString(prod.name)}')">
        <img src="${prod.image}" style="width:28px; height:28px; object-fit:cover; border-radius:4px;" onerror="this.style.display='none'">
        <div>
          <strong style="display:block; font-size:0.85rem; color:var(--text-dark);">${prod.name}</strong>
          <span style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">${prod.category} • ₹${prod.price}/${prod.unit}</span>
        </div>
      </div>
    `).join('');
    
    this.dom.suggestionsBox.style.display = 'block';
  }

  selectSuggestion(prodName) {
    if (this.dom.catalogSearch) this.dom.catalogSearch.value = prodName;
    this.state.searchQuery = prodName;
    if (this.dom.suggestionsBox) this.dom.suggestionsBox.style.display = 'none';
    this.renderProducts();
    this.scrollToCatalog();
  }

  triggerSearch() {
    this.renderProducts();
    this.scrollToCatalog();
  }

  quickFilter(term) {
    if (this.dom.catalogSearch) this.dom.catalogSearch.value = term;
    this.state.searchQuery = term;
    this.renderProducts();
    this.scrollToCatalog();
  }

  resetFilters() {
    this.state.activeCategory = 'all';
    this.state.searchQuery = '';
    this.state.sortMethod = 'default';
    if (this.dom.catalogSearch) this.dom.catalogSearch.value = '';
    
    const selectFilter = document.getElementById('sort-filter');
    if (selectFilter) selectFilter.value = 'default';

    this.renderCategoryTabs();
    this.renderProducts();
    this.setView('home');
  }

  handleSortChange(event) {
    this.state.sortMethod = event.target.value;
    this.renderProducts();
  }

  scrollToCatalog() {
    if (this.state.currentView !== 'home') {
      this.setView('home');
    }
    setTimeout(() => {
      const catalogSection = document.getElementById('catalog-section');
      if (catalogSection) {
        catalogSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  }

  // --- Dynamic Cart Drawer Actions ---
  addItemToCart(prodId, explicitSize = null) {
    // Check if customer is logged in
    if (!this.state.user || this.state.userRole !== 'customer') {
      this.showToast("Please sign in as a customer to buy or add products.", "error");
      this.openLoginModal();
      return false;
    }

    // Owners shouldn't make checkout purchases
    if (this.state.userRole === 'owner') {
      this.showToast("Store Owners cannot make purchases. Switch to customer role.", "error");
      return false;
    }

    const prod = this.state.catalog.find(p => p.id === prodId);
    if (!prod) return false;

    const size = explicitSize || this.state.selectedSizeCache[prodId] || prod.sizes[0];
    const price = this.calculatePrice(prod.price, size, prod.sizes[0]);

    const existingIndex = this.state.cart.findIndex(item => item.id === prodId && item.size === size);

    if (existingIndex !== -1) {
      this.state.cart[existingIndex].qty += 1;
    } else {
      this.state.cart.push({
        id: prodId,
        name: prod.name,
        emoji: prod.image, // URL image representing visual item
        size: size,
        price: price,
        qty: 1
      });
    }

    this.saveCart();
    this.syncCartBadge();
    this.renderCartDrawerItems();
    this.calculateCartTotals();
    
    this.showToast(`Added ${prod.name} (${size}) to basket!`, "success");
    
    this.triggerFlyingCartAnimation(prodId);

    // Update product card buttons dynamically
    this.updateProductCardButtons(prodId);
    return true;
  }

  // --- Inline Card Quantity Helpers ---
  getCardCartQty(prodId, size) {
    const item = this.state.cart.find(i => i.id === prodId && i.size === size);
    return item ? item.qty : 0;
  }

  cardIncrementQty(prodId, size) {
    this.addItemToCart(prodId, size);
  }

  cardDecrementQty(prodId, size) {
    const idx = this.state.cart.findIndex(i => i.id === prodId && i.size === size);
    if (idx === -1) return;

    this.state.cart[idx].qty -= 1;

    if (this.state.cart[idx].qty <= 0) {
      this.state.cart.splice(idx, 1);
    }

    this.saveCart();
    this.syncCartBadge();
    this.renderCartDrawerItems();
    this.calculateCartTotals();
    this.updateProductCardButtons(prodId);
  }

  // Buy Now immediate action
  buyNow(prodId) {
    if (this.addItemToCart(prodId)) {
      this.openCheckoutWizard();
    }
  }

  updateCartQty(index, offset) {
    const item = this.state.cart[index];
    if (!item) return;

    const itemId = item.id;
    item.qty += offset;
    
    if (item.qty <= 0) {
      this.state.cart.splice(index, 1);
      this.showToast("Removed item from basket", "error");
    }

    this.saveCart();
    this.syncCartBadge();
    this.renderCartDrawerItems();
    this.calculateCartTotals();
    this.updateProductCardButtons(itemId);
  }

  removeCartItem(index) {
    const item = this.state.cart[index];
    if (!item) return;
    const itemId = item.id;

    this.state.cart.splice(index, 1);
    this.saveCart();
    this.syncCartBadge();
    this.renderCartDrawerItems();
    this.calculateCartTotals();
    this.showToast("Removed item from basket", "error");
    this.updateProductCardButtons(itemId);
  }

  saveCart() {
    localStorage.setItem('gp_cart', JSON.stringify(this.state.cart));
  }

  syncCartBadge() {
    const count = this.state.cart.reduce((sum, item) => sum + item.qty, 0);
    if (this.dom.cartCount) this.dom.cartCount.textContent = count;
  }

  toggleCartDrawer(isOpen) {
    // Blocks for owners
    if (isOpen && this.state.userRole === 'owner') {
      this.showToast("Owners do not have an active shopping basket.", "error");
      return;
    }

    if (isOpen) {
      this.renderCartDrawerItems();
      this.calculateCartTotals();
      if (this.dom.cartOverlay) this.dom.cartOverlay.classList.add('open');
    } else {
      if (this.dom.cartOverlay) this.dom.cartOverlay.classList.remove('open');
    }
  }

  renderCartDrawerItems() {
    if (!this.dom.cartItemsBody) return;

    if (this.state.cart.length === 0) {
      this.dom.cartItemsBody.innerHTML = `
        <div class="empty-cart-state">
          <div class="empty-cart-icon">
            <i class="fa-solid fa-basket-shopping"></i>
          </div>
          <h4>Your Basket is Empty</h4>
          <p>Explore our pure quality dry groceries and get cooking!</p>
          <button class="btn-checkout" onclick="app.toggleCartDrawer(false)" style="background-color: var(--secondary-color); margin-top:10px;">Continue Shopping</button>
        </div>
      `;
      return;
    }

    this.dom.cartItemsBody.innerHTML = this.state.cart.map((item, idx) => `
      <div class="cart-item">
        <img src="${item.emoji}" style="width:48px; height:48px; object-fit:cover; border-radius:8px;">
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p>Size Selected: <strong>${item.size}</strong></p>
          <div class="cart-item-math">
            <div class="qty-counter">
              <button class="qty-btn" onclick="app.updateCartQty(${idx}, -1)">-</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" onclick="app.updateCartQty(${idx}, 1)">+</button>
            </div>
            <span class="cart-item-price">₹${item.price * item.qty}</span>
          </div>
        </div>
        <button class="btn-remove-item" onclick="app.removeCartItem(${idx})" title="Remove item">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    `).join('');
  }

  calculateCartTotals() {
    const subtotal = this.state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let discount = 0;

    const settings = JSON.parse(localStorage.getItem('gp_settings')) || { minFreeShip: 299, shipFee: 40 };
    const minFreeShip = settings.minFreeShip || 299;
    const shipFee = settings.shipFee || 40;

    let delivery = (subtotal > 500) ? shipFee : 0;

    const total = Math.max(0, subtotal - discount + delivery);

    if (this.dom.subtotalVal) this.dom.subtotalVal.textContent = `₹${subtotal.toFixed(2)}`;
    if (this.dom.discountVal) this.dom.discountVal.textContent = `-₹${discount.toFixed(2)}`;
    if (this.dom.deliveryVal) this.dom.deliveryVal.textContent = delivery === 0 ? "FREE" : `₹${delivery.toFixed(2)}`;
    if (this.dom.totalVal) this.dom.totalVal.textContent = `₹${total.toFixed(2)}`;
  }

  // --- Checkout Steps Wizards ---
  openCheckoutWizard() {
    if (!this.state.user || this.state.userRole !== 'customer') {
      this.showToast("Please sign in as a customer to proceed with checkout.", "error");
      this.openLoginModal();
      return;
    }

    if (this.state.cart.length === 0) {
      this.showToast("Your basket is empty", "error");
      return;
    }

    // Automatically set WhatsApp number from user profile or checkout form
    if (!this.state.whatsappNumber && this.state.user?.phone) {
      this.state.whatsappNumber = this.state.user.phone;
      localStorage.setItem('gp_wa_number', this.state.whatsappNumber);
    }
    
    if (this.state.user) {
      this.state.checkoutForm.name = this.state.user.name || '';
      this.state.checkoutForm.phone = this.state.user.phone || '';
      this.state.checkoutForm.address = this.state.user.address || '';
      this.state.checkoutForm.email = this.state.user.email || '';
      this.state.checkoutForm.pincode = this.state.user.pincode || '';
    }

    this.toggleCartDrawer(false);
    this.state.currentCheckoutStep = 1;
    this.renderCheckoutStep();
    if (this.dom.checkoutModal) this.dom.checkoutModal.classList.add('open');
  }

  // --- WhatsApp Number Collection ---
  showWhatsAppModal() {
    if (this.dom.waModalOverlay) {
      // Pre-fill if we already have a phone from login
      if (this.dom.waPhoneInput) {
        const prefill = this.state.checkoutForm.phone || this.state.user?.phone || '';
        this.dom.waPhoneInput.value = prefill.replace(/^\+?91/, '').slice(-10);
      }
      this.dom.waModalOverlay.classList.add('open');
    }
  }

  closeWhatsAppModal() {
    if (this.dom.waModalOverlay) {
      this.dom.waModalOverlay.classList.remove('open');
    }
  }

  submitWhatsAppNumber() {
    const form = document.getElementById('wa-number-form');
    if (form && !form.reportValidity()) return;

    const rawNumber = this.dom.waPhoneInput?.value?.trim();
    if (!rawNumber || rawNumber.length !== 10) {
      this.showToast('Please enter a valid 10-digit WhatsApp number', 'error');
      return;
    }

    // Save the WhatsApp number
    this.state.whatsappNumber = rawNumber;
    localStorage.setItem('gp_wa_number', rawNumber);

    this.closeWhatsAppModal();
    this.showToast('WhatsApp number saved! Receipt will be sent after order.', 'success');

    // Now open the real checkout wizard
    this.openCheckoutWizard();
  }

  closeCheckoutWizard() {
    if (this.dom.checkoutModal) this.dom.checkoutModal.classList.remove('open');
  }

  renderCheckoutStep() {
    for (let i = 1; i <= 4; i++) {
      const node = document.getElementById(`step-node-${i}`);
      if (!node) continue;
      node.className = "step-item";
      if (i === this.state.currentCheckoutStep) {
        node.classList.add('active');
      } else if (i < this.state.currentCheckoutStep) {
        node.classList.add('completed');
      }
    }

    if (!this.dom.checkoutBody) return;

    let html = "";
    if (this.state.currentCheckoutStep === 1) {
      html = `
        <h3 style="font-size:1.35rem; margin-bottom: 16px;">Delivery Address Information</h3>
        <form id="delivery-form">
          <div class="form-group">
            <label for="form-name">Recipient's Full Name</label>
            <input type="text" id="form-name" value="${this.state.checkoutForm.name}" placeholder="e.g. Mani Raman" required>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label for="form-phone">Mobile Number</label>
              <input type="tel" id="form-phone" value="${this.state.checkoutForm.phone}" placeholder="98765 43210" pattern="[0-9]{10}" required>
            </div>
            <div class="form-group">
              <label for="form-email">Email Address</label>
              <input type="email" id="form-email" value="${this.state.checkoutForm.email}" placeholder="mani@example.com">
            </div>
          </div>

          <div class="form-group">
            <label for="form-address">Street Address / House No. / Landmark</label>
            <textarea id="form-address" rows="3" placeholder="Enter complete home address for delivery..." required>${this.state.checkoutForm.address}</textarea>
          </div>

          <div class="form-group">
            <label for="form-pincode">Pincode</label>
            <input type="text" id="form-pincode" value="${this.state.checkoutForm.pincode}" placeholder="600001" pattern="[0-9]{6}" required>
          </div>
        </form>
      `;
    } else if (this.state.currentCheckoutStep === 2) {
      const slots = this.generateAvailableSlots();
      html = `
        <h3 style="font-size:1.35rem; margin-bottom: 8px;">Select Delivery Time</h3>
        <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:20px;">Choose a convenient date & time slot for shipping.</p>
        
        <div class="slots-grid">
          ${slots.map(s => `
            <div class="slot-item ${this.state.checkoutForm.deliverySlot === s.value ? 'active' : ''}" 
                 onclick="app.selectDeliverySlot('${s.value}')">
              <span class="slot-time" style="font-size:0.75rem; color:var(--text-muted);">${s.date}</span>
              <span class="slot-time">${s.time}</span>
              <span class="slot-status">${s.status}</span>
            </div>
          `).join('')}
        </div>
      `;
    } else if (this.state.currentCheckoutStep === 3) {
      const subtotal = this.state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      let discount = 0;
      let freeShip = false;
      if (this.state.appliedCoupon) {
        const details = PROMO_COUPONS[this.state.appliedCoupon];
        if (details.discountType === 'percent') discount = Math.round(subtotal * (details.value / 100));
        else if (details.discountType === 'flat') discount = details.value;
        else if (details.discountType === 'freeship') freeShip = true;
      }
      const settings = JSON.parse(localStorage.getItem('gp_settings')) || { minFreeShip: 299, shipFee: 40 };
      const minFreeShip = settings.minFreeShip || 299;
      const shipFee = settings.shipFee || 40;
      let delivery = (subtotal > 500 && !freeShip) ? shipFee : 0;
      const total = Math.max(0, subtotal - discount + delivery);

      html = `
        <h3 style="font-size:1.35rem; margin-bottom: 12px;">Payment Details</h3>
        
        <div class="payment-grid">
          <div class="pay-card ${this.state.checkoutForm.paymentMethod === 'cod' ? 'active' : ''}" onclick="app.selectPaymentMethod('cod')">
            <span class="pay-card-emoji">💵</span>
            <h5>Cash on Delivery</h5>
          </div>
          <div class="pay-card ${this.state.checkoutForm.paymentMethod === 'upi' ? 'active' : ''}" onclick="app.selectPaymentMethod('upi')">
            <span class="pay-card-emoji">📱</span>
            <h5>UPI (GPay/PhonePe)</h5>
          </div>
          <div class="pay-card ${this.state.checkoutForm.paymentMethod === 'card' ? 'active' : ''}" onclick="app.selectPaymentMethod('card')">
            <span class="pay-card-emoji">💳</span>
            <h5>Credit/Debit Card</h5>
          </div>
        </div>

        <div style="background-color: var(--accent-light-green); padding: 18px; border-radius: var(--radius-sm); border:1px solid rgba(11,94,63,0.15);">
          <h4 style="font-size:0.95rem; margin-bottom:10px;">Order Summary</h4>
          <div class="receipt-row">
            <span>Basket Size (${this.state.cart.reduce((sum, item) => sum + item.qty, 0)} items)</span>
            <strong>₹${subtotal}</strong>
          </div>
          ${discount > 0 ? `
            <div class="receipt-row" style="color: var(--secondary-color);">
              <span>Discounts applied</span>
              <strong>-₹${discount}</strong>
            </div>
          ` : ''}
          <div class="receipt-row">
            <span>Delivery Fee</span>
            <strong>${delivery === 0 ? "FREE" : `₹${delivery}`}</strong>
          </div>
          <div class="receipt-row" style="border-top: 1px solid var(--border-color); padding-top:10px; margin-top:8px; font-weight:700;">
            <span>Estimated Payable Amount</span>
            <span style="color: var(--primary-color);">₹${total}</span>
          </div>
        </div>
      `;
    }

    this.dom.checkoutBody.innerHTML = html;

    if (this.state.currentCheckoutStep === 1) {
      if (this.dom.btnWizardBack) this.dom.btnWizardBack.style.display = 'none';
      if (this.dom.btnWizardNext) {
        this.dom.btnWizardNext.textContent = "Select Time Slot";
        this.dom.btnWizardNext.className = "btn-modal btn-modal-next";
      }
    } else if (this.state.currentCheckoutStep === 2) {
      if (this.dom.btnWizardBack) this.dom.btnWizardBack.style.display = 'block';
      if (this.dom.btnWizardNext) {
        this.dom.btnWizardNext.textContent = "Proceed to Payment";
        this.dom.btnWizardNext.className = "btn-modal btn-modal-next";
      }
    } else if (this.state.currentCheckoutStep === 3) {
      if (this.dom.btnWizardBack) this.dom.btnWizardBack.style.display = 'block';
      if (this.dom.btnWizardNext) {
        this.dom.btnWizardNext.textContent = "Confirm & Place Order";
        this.dom.btnWizardNext.className = "btn-modal btn-modal-pay";
      }
    } else if (this.state.currentCheckoutStep === 4) {
      if (this.dom.btnWizardBack) this.dom.btnWizardBack.style.display = 'none';
      if (this.dom.btnWizardNext) {
        this.dom.btnWizardNext.textContent = "Close & Track Order";
        this.dom.btnWizardNext.className = "btn-modal btn-modal-next";
      }
    }
  }

  prevCheckoutStep() {
    if (this.state.currentCheckoutStep > 1) {
      this.executeCubeFlip('prev', this.state.currentCheckoutStep - 1);
    }
  }

  nextCheckoutStep() {
    if (this.state.currentCheckoutStep === 1) {
      const form = document.getElementById('delivery-form');
      if (form && !form.reportValidity()) return;

      this.state.checkoutForm.name = document.getElementById('form-name').value.trim();
      this.state.checkoutForm.phone = document.getElementById('form-phone').value.trim();
      this.state.checkoutForm.email = document.getElementById('form-email').value.trim();
      this.state.checkoutForm.address = document.getElementById('form-address').value.trim();
      this.state.checkoutForm.pincode = document.getElementById('form-pincode').value.trim();

      if (!this.state.user) {
        this.state.user = {
          name: this.state.checkoutForm.name,
          phone: this.state.checkoutForm.phone,
          email: this.state.checkoutForm.email,
          address: this.state.checkoutForm.address,
          pincode: this.state.checkoutForm.pincode,
          role: 'customer'
        };
        localStorage.setItem('gp_user', JSON.stringify(this.state.user));
        this.syncUserRole();
      }

      this.state.whatsappNumber = this.state.checkoutForm.phone;
      localStorage.setItem('gp_wa_number', this.state.whatsappNumber);

      this.executeCubeFlip('next', 2);
    } else if (this.state.currentCheckoutStep === 2) {
      if (!this.state.checkoutForm.deliverySlot) {
        this.showToast("Please choose a delivery time slot", "error");
        return;
      }
      this.executeCubeFlip('next', 3);
    } else if (this.state.currentCheckoutStep === 3) {
      this.placeOrder();
    } else if (this.state.currentCheckoutStep === 4) {
      this.closeCheckoutWizard();
      this.setView('tracker');
    }
  }

  executeCubeFlip(direction, targetStep) {
    const body = this.dom.checkoutBody;
    if (!body) {
      this.state.currentCheckoutStep = targetStep;
      this.renderCheckoutStep();
      return;
    }

    const outClass = `cube-flip-out-${direction}`;
    const inClass = `cube-flip-in-${direction}`;

    body.classList.remove('cube-flip-out-next', 'cube-flip-in-next', 'cube-flip-out-prev', 'cube-flip-in-prev');
    body.classList.add(outClass);

    setTimeout(() => {
      this.state.currentCheckoutStep = targetStep;
      this.renderCheckoutStep();
      
      const newBody = this.dom.checkoutBody;
      newBody.classList.remove(outClass);
      newBody.classList.add(inClass);

      setTimeout(() => {
        newBody.classList.remove(inClass);
      }, 400);
    }, 220);
  }

  executeCubeFlipReceipt(order) {
    const body = this.dom.checkoutBody;
    if (!body) {
      this.state.currentCheckoutStep = 4;
      this.renderReceiptScreen(order);
      return;
    }

    body.classList.remove('cube-flip-out-next', 'cube-flip-in-next', 'cube-flip-out-prev', 'cube-flip-in-prev');
    body.classList.add('cube-flip-out-next');

    setTimeout(() => {
      this.state.currentCheckoutStep = 4;
      this.renderReceiptScreen(order);
      
      const newBody = this.dom.checkoutBody;
      newBody.classList.remove('cube-flip-out-next');
      newBody.classList.add('cube-flip-in-next');

      setTimeout(() => {
        newBody.classList.remove('cube-flip-in-next');
      }, 400);
    }, 220);
  }

  generateAvailableSlots() {
    const days = ["Today", "Tomorrow"];
    const hours = [
      { time: "07:00 AM - 10:00 AM", val: "morning", status: "Fast slots" },
      { time: "11:00 AM - 02:00 PM", val: "afternoon", status: "Standard" },
      { time: "04:00 PM - 07:00 PM", val: "evening", status: "Eco slot" }
    ];

    const finalSlots = [];
    days.forEach(day => {
      hours.forEach(hr => {
        finalSlots.push({
          date: day,
          time: hr.time,
          value: `${day.toLowerCase()}_${hr.val}`,
          status: hr.status
        });
      });
    });
    return finalSlots;
  }

  selectDeliverySlot(slotVal) {
    this.state.checkoutForm.deliverySlot = slotVal;
    this.renderCheckoutStep();
  }

  selectPaymentMethod(method) {
    this.state.checkoutForm.paymentMethod = method;
    this.renderCheckoutStep();
  }

  placeOrder() {
    const subtotal = this.state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let discount = 0;
    let freeShip = false;
    if (this.state.appliedCoupon) {
      const details = PROMO_COUPONS[this.state.appliedCoupon];
      if (details.discountType === 'percent') discount = Math.round(subtotal * (details.value / 100));
      else if (details.discountType === 'flat') discount = details.value;
      else if (details.discountType === 'freeship') freeShip = true;
    }
    const settings = JSON.parse(localStorage.getItem('gp_settings')) || { minFreeShip: 299, shipFee: 40 };
    const minFreeShip = settings.minFreeShip || 299;
    const shipFee = settings.shipFee || 40;
    let delivery = (subtotal > 500 && !freeShip) ? shipFee : 0;
    const total = Math.max(0, subtotal - discount + delivery);

    const orderId = `GP-${Math.floor(100000 + Math.random() * 900000)}`;
    const dateString = new Date().toLocaleString();

    const newOrder = {
      orderId: orderId,
      timestamp: Date.now(),
      date: dateString,
      items: [...this.state.cart],
      subtotal: subtotal,
      discount: discount,
      delivery: delivery,
      total: total,
      status: "placed", // status: placed -> received -> preparing -> shipping -> delivered
      details: { ...this.state.checkoutForm }
    };

    this.state.orders.unshift(newOrder);
    localStorage.setItem('gp_orders', JSON.stringify(this.state.orders));
    this.saveOrderToServer(newOrder);

    // Clear cart values
    this.state.cart = [];
    this.state.appliedCoupon = null;
    this.saveCart();
    this.syncCartBadge();

    this.executeCubeFlipReceipt(newOrder);
    
    this.showToast("Order placed successfully!", "success");
    this.checkActiveOrderSimulations();

    // Silently send receipt to WhatsApp via backend (triggers owner alert as well)
    this.sendReceiptToWhatsApp(newOrder);
  }

  // --- WhatsApp Receipt Dispatch ---
  sendReceiptToWhatsApp(order) {
    const targetNumber = '9150436455';
    
    let message = `*Ganesh Provisions - New Order*\n`;
    message += `*Order ID:* ${order.orderId}\n`;
    message += `*Date:* ${order.date}\n`;
    message += `*Customer:* ${order.details.name}\n`;
    message += `*Phone:* ${order.details.phone}\n`;
    message += `*Address:* ${order.details.address}, ${order.details.pincode}\n`;
    message += `*Payment Method:* ${order.details.paymentMethod.toUpperCase()}\n\n`;
    message += `*Items:*\n`;
    
    order.items.forEach(item => {
      message += `- ${item.name} (${item.size}) x${item.qty}: ₹${item.price * item.qty}\n`;
    });
    
    message += `\n*Subtotal:* ₹${order.subtotal}\n`;
    if (order.discount > 0) message += `*Discount:* -₹${order.discount}\n`;
    message += `*Delivery:* ${order.delivery === 0 ? 'FREE' : '₹' + order.delivery}\n`;
    message += `*Total Amount:* ₹${order.total}\n`;
    
    const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    this.showToast('Order receipt opened in WhatsApp!', 'success');
  }

  renderReceiptScreen(order) {
    if (!this.dom.checkoutBody) return;
    
    this.dom.checkoutBody.innerHTML = `
      <div class="order-success-box">
        <i class="fa-solid fa-circle-check success-icon" style="animation: pulse 1.5s infinite;"></i>
        <h3 style="font-size:1.6rem; color:var(--primary-color);">Ganesh Provisions Order Confirmed!</h3>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-top:4px;">Receipt processed. Active status can be tracked live.</p>
        
        <div class="receipt-box">
          <div style="font-weight:700; font-size:0.95rem; border-bottom:1px solid var(--border-color); padding-bottom:8px; margin-bottom:12px; display:flex; justify-content:space-between;">
            <span>Invoice Details</span>
            <span style="color:var(--secondary-color);">${order.orderId}</span>
          </div>

          <div class="receipt-row">
            <span>Date & Time</span>
            <span>${order.date}</span>
          </div>
          <div class="receipt-row">
            <span>Delivery Slot</span>
            <span style="text-transform: capitalize;">${order.details.deliverySlot.replace('_', ' ')}</span>
          </div>
          <div class="receipt-row">
            <span>Recipient</span>
            <span>${order.details.name} (Ph: ${order.details.phone})</span>
          </div>
          <div class="receipt-row">
            <span>Payment Method</span>
            <span style="text-transform: uppercase;">${order.details.paymentMethod}</span>
          </div>

          <div style="border-top:1px dashed var(--border-color); padding-top:8px; margin-top:8px; max-height:120px; overflow-y:auto;">
            ${order.items.map(item => `
              <div class="receipt-row" style="font-size:0.8rem; color:var(--text-muted);">
                <span>${item.name} (${item.size}) x${item.qty}</span>
                <span>₹${item.price * item.qty}</span>
              </div>
            `).join('')}
          </div>

          <div class="receipt-row receipt-total" style="margin-top:12px;">
            <span>Payable Amount</span>
            <span style="color:var(--primary-color);">₹${order.total}</span>
          </div>
        </div>
      </div>
    `;
  }

  // --- Detailed Product Modal ---
  openProductDetailModal(prodId) {
    const prod = this.state.catalog.find(p => p.id === prodId);
    if (!prod) return;

    if (!this.dom.detailModal || !this.dom.detailModalBody) return;

    const isWishlisted = this.state.wishlist.includes(prod.id);
    const selectedSize = this.state.selectedSizeCache[prod.id] || prod.sizes[0];
    const selectedPrice = this.calculatePrice(prod.price, selectedSize, prod.sizes[0]);

    this.dom.detailModalBody.innerHTML = `
      <div class="detail-modal-layout">
        <div class="detail-visual">
          <img src="${prod.image}" style="width:100%; height:100%; object-fit:cover; border-radius:var(--radius-md);" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'">
        </div>
        
        <div class="detail-content">
          <div class="detail-meta">
            ${prod.isOrganic ? '<span class="badge badge-organic"><i class="fa-solid fa-leaf"></i> 100% Organic</span>' : ''}
            ${prod.tag ? `<span class="badge badge-tag">${prod.tag}</span>` : ''}
          </div>

          <h3>${prod.name}</h3>
          ${prod.teluguName ? `<span class="product-telugu-name detail-telugu">${prod.teluguName}</span>` : ''}

          <div class="product-rating" style="margin-bottom:20px;">
            <span class="star-rating">
              ${'<i class="fa-solid fa-star"></i>'.repeat(Math.floor(prod.rating))}
              ${prod.rating % 1 >= 0.5 ? '<i class="fa-solid fa-star-half-stroke"></i>' : ''}
              ${'<i class="fa-regular fa-star"></i>'.repeat(5 - Math.ceil(prod.rating))}
            </span>
            <strong style="color:var(--text-dark); margin-left:4px;">${prod.rating}</strong>
            <span>(${prod.reviews} reviews)</span>
          </div>

          <p class="detail-desc">${prod.description}</p>

          <div style="background-color: var(--bg-color); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border-color); margin-bottom:24px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span style="display:block; font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Select Custom Pack</span>
                <select class="size-select-card" onchange="app.handleDetailModalSizeChange('${prod.id}', this)" style="max-width:180px; margin-top:4px;">
                  ${prod.sizes.map(size => `
                    <option value="${size}" ${selectedSize === size ? 'selected' : ''}>${size}</option>
                  `).join('')}
                </select>
              </div>

              <div style="text-align:right;">
                <span style="display:block; font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Special Price</span>
                <strong style="font-size:1.8rem; color:var(--primary-color); font-family:var(--font-heading); display:block; line-height:1.1;">₹${selectedPrice}</strong>
              </div>
            </div>
          </div>

          <div style="display:flex; gap:12px;">
            ${prod.inStock === false ? `
              <button class="btn-checkout" disabled style="flex:1; background-color: var(--border-color); color: var(--text-muted); cursor: not-allowed;">
                <i class="fa-solid fa-ban"></i> Out of Stock
              </button>
            ` : `
              <button class="btn-checkout" onclick="app.addItemToCart('${prod.id}'); app.closeProductDetailModal();" style="flex:1;">
                <i class="fa-solid fa-basket-shopping"></i>
                Add to Basket
              </button>
            `}
            <button class="btn-action" onclick="app.toggleWishlist('${prod.id}'); app.openProductDetailModal('${prod.id}')" style="border:1px solid var(--border-color); border-radius:var(--radius-sm); width:48px; height:48px;" title="Wishlist">
              <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart" style="${isWishlisted ? 'color:#ef4444' : ''}"></i>
            </button>
          </div>

          <!-- Product Customer Reviews Feed -->
          <div class="feedback-reviews-section">
            <h4 class="feedback-reviews-header">
              <i class="fa-solid fa-comments" style="color:var(--primary-color);"></i> Customer Reviews & Verified Feedback
            </h4>
            <div id="detail-reviews-list-container">
              ${(prod.reviewsList && prod.reviewsList.length > 0) 
                ? prod.reviewsList.map(r => `
                  <div class="feedback-review-card">
                    <div class="feedback-review-meta">
                      <strong>${r.author}</strong>
                      <span>${r.date}</span>
                    </div>
                    <div class="star-rating" style="margin-bottom:6px;">
                      ${'<i class="fa-solid fa-star"></i>'.repeat(r.rating)}
                      ${'<i class="fa-regular fa-star"></i>'.repeat(5 - r.rating)}
                    </div>
                    ${r.tags && r.tags.length > 0 ? `
                      <div class="feedback-review-chips" style="margin-bottom:6px;">
                        ${r.tags.map(t => `<span class="review-mini-chip">${t}</span>`).join('')}
                      </div>
                    ` : ''}
                    <p class="feedback-review-comment">${r.comment}</p>
                    ${r.image ? `<img src="${r.image}" style="width:70px; height:70px; object-fit:cover; border-radius:4px; margin-top:8px; border:1px solid #e2e8f0;">` : ''}
                  </div>
                `).join('') 
                : '<p style="color:var(--text-muted); font-size:0.85rem; font-style:italic;">No reviews posted yet. Be the first to share your opinion!</p>'
              }
            </div>
          </div>
        </div>
      </div>
    `;

    this.dom.detailModal.classList.add('open');
  }

  handleDetailModalSizeChange(prodId, selectElem) {
    this.state.selectedSizeCache[prodId] = selectElem.value;
    this.renderProducts();
    this.openProductDetailModal(prodId);
  }

  closeProductDetailModal() {
    if (this.dom.detailModal) this.dom.detailModal.classList.remove('open');
  }

  // --- Dual-Role Dynamic Authentication Modals ---
  openLoginModal() {
    if (this.state.user && this.state.userRole === 'owner') {
      this.setView('owner');
      return;
    }
    
    // reset views and open
    this.toggleLoginTab('customer');
    if (this.dom.loginModal) this.dom.loginModal.classList.add('open');
  }

  closeLoginModal() {
    if (this.dom.loginModal) this.dom.loginModal.classList.remove('open');
  }

  toggleLoginTab(role) {
    this.state.activeLoginTab = role;
    
    const tabCustomer = document.getElementById('login-tab-customer');
    const tabOwner = document.getElementById('login-tab-owner');
    const bodyCustomer = document.getElementById('login-body-customer');
    const bodyOwner = document.getElementById('login-body-owner');

    const formView = document.getElementById('login-customer-form-view');
    const profileView = document.getElementById('login-customer-profile-view');

    if (role === 'customer') {
      if (tabCustomer) tabCustomer.classList.add('active');
      if (tabOwner) tabOwner.classList.remove('active');
      if (bodyCustomer) bodyCustomer.style.display = 'block';
      if (bodyOwner) bodyOwner.style.display = 'none';
      
      if (this.state.user && this.state.userRole === 'customer') {
        if (formView) formView.style.display = 'none';
        if (profileView) profileView.style.display = 'block';
        
        const profileName = document.getElementById('login-profile-name');
        const profilePhone = document.getElementById('login-profile-phone');
        if (profileName) profileName.textContent = this.state.user.name;
        if (profilePhone) profilePhone.textContent = `Phone: ${this.state.user.phone}`;
        
        // Prefill settings form
        this.prefillCustomerSettings();
      } else {
        if (formView) formView.style.display = 'block';
        if (profileView) profileView.style.display = 'none';
        
        if (this.dom.otpGroup) this.dom.otpGroup.style.display = 'none';
        if (this.dom.loginPhone) {
          this.dom.loginPhone.value = '';
          this.dom.loginPhone.disabled = false;
        }
        if (this.dom.loginBtnSubmit) this.dom.loginBtnSubmit.textContent = "Request OTP";
      }
    } else {
      if (tabCustomer) tabCustomer.classList.remove('active');
      if (tabOwner) tabOwner.classList.add('active');
      if (bodyCustomer) bodyCustomer.style.display = 'none';
      if (bodyOwner) bodyOwner.style.display = 'block';
      
      // Clear forms
      const userField = document.getElementById('owner-username');
      const passField = document.getElementById('owner-password');
      if (userField) userField.value = '';
      if (passField) passField.value = '';
    }
  }

  prefillCustomerSettings() {
    if (!this.state.user || this.state.userRole !== 'customer') return;
    
    const nameInput = document.getElementById('cust-settings-name');
    const phoneInput = document.getElementById('cust-settings-phone');
    const emailInput = document.getElementById('cust-settings-email');
    const addressInput = document.getElementById('cust-settings-address');
    const pincodeInput = document.getElementById('cust-settings-pincode');
    
    if (nameInput) nameInput.value = this.state.user.name || '';
    if (phoneInput) phoneInput.value = this.state.user.phone || '';
    if (emailInput) emailInput.value = this.state.user.email || '';
    if (addressInput) addressInput.value = this.state.user.address || '';
    if (pincodeInput) pincodeInput.value = this.state.user.pincode || '';
  }

  saveCustomerSettings(event) {
    event.preventDefault();
    if (!this.state.user || this.state.userRole !== 'customer') return;
    
    const name = document.getElementById('cust-settings-name').value.trim();
    const phone = document.getElementById('cust-settings-phone').value.trim();
    const email = document.getElementById('cust-settings-email').value.trim();
    const address = document.getElementById('cust-settings-address').value.trim();
    const pincode = document.getElementById('cust-settings-pincode').value.trim();
    
    if (!name || !phone || !address || !pincode) {
      this.showToast("Please fill in all required fields", "error");
      return;
    }
    
    if (phone.length !== 10) {
      this.showToast("Phone number must be exactly 10 digits", "error");
      return;
    }
    
    this.state.user.name = name;
    this.state.user.phone = phone;
    this.state.user.email = email;
    this.state.user.address = address;
    this.state.user.pincode = pincode;
    
    localStorage.setItem('gp_user', JSON.stringify(this.state.user));
    this.syncUserRole();
    this.showToast("Customer settings saved successfully!", "success");
    
    // Keep WhatsApp number synced with settings phone number
    this.state.whatsappNumber = phone;
    localStorage.setItem('gp_wa_number', phone);
    
    // Also sync the checkout form values
    this.state.checkoutForm.name = name;
    this.state.checkoutForm.phone = phone;
    this.state.checkoutForm.email = email;
    this.state.checkoutForm.address = address;
    this.state.checkoutForm.pincode = pincode;
  }

  handleCustomerLogoutInModal() {
    this.handleLogout();
    this.toggleLoginTab('customer');
  }

  handleCustomerLogin(event) {
    event.preventDefault();
    if (!this.dom.otpGroup || !this.dom.loginBtnSubmit || !this.dom.loginPhone) return;

    if (this.dom.otpGroup.style.display === 'none') {
      const phone = this.dom.loginPhone.value.trim();
      if (!phone || phone.length !== 10) {
        this.showToast("Please enter a valid 10-digit mobile number", "error");
        return;
      }
      
      // Generate a random 4-digit OTP code (between 1000 and 9999)
      const randomOtp = String(Math.floor(1000 + Math.random() * 9000));
      this.state.activeOtp = randomOtp;
      
      this.dom.loginPhone.disabled = true;
      this.dom.otpGroup.style.display = 'block';
      this.dom.loginOtp.value = '';
      this.dom.loginOtp.required = true;
      this.dom.loginBtnSubmit.textContent = "Verify & Access";
      this.showToast(`OTP sent successfully! Enter ${randomOtp} to verify.`, "success");
    } else {
      const otp = this.dom.loginOtp.value.trim();
      if (otp !== this.state.activeOtp) {
        this.showToast(`Incorrect OTP! Enter the generated code '${this.state.activeOtp}'.`, "error");
        return;
      }

      const enteredName = document.getElementById('login-name')?.value.trim() || "Valued Shopper";
      this.state.user = {
        name: enteredName,
        phone: this.dom.loginPhone.value.trim(),
        address: "12, Saffron Road, Near Ganesh Temple, Chennai",
        email: "customer@ganeshprovisions.com",
        pincode: "600001",
        role: 'customer'
      };

      localStorage.setItem('gp_user', JSON.stringify(this.state.user));
      this.syncUserRole();
      
      // Auto-set WhatsApp number from login phone number
      this.state.whatsappNumber = this.state.user.phone;
      localStorage.setItem('gp_wa_number', this.state.whatsappNumber);

      this.closeLoginModal();
      this.showToast("Logged in as Customer! Welcome.", "success");
      if (this.state.currentView === 'home') {
        this.renderProducts();
      } else {
        this.setView('tracker');
      }
    }
  }

  async handleOwnerLogin(event) {
    event.preventDefault();
    
    const userField = document.getElementById('owner-username').value.trim();
    const passField = document.getElementById('owner-password').value.trim();

    // Client-side fallback check (useful for direct file:// or offline mode)
    const localIsValid = (userField === 'ganesh' || userField === '9999999999') && passField === '9150436455';

    if (window.location.protocol !== 'file:') {
      try {
        const response = await fetch(`${this.getBackendUrl()}/api/owner-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: userField, password: passField })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          this.state.user = data.user;
          localStorage.setItem('gp_user', JSON.stringify(this.state.user));
          this.syncUserRole();
          this.closeLoginModal();
          this.showToast("Store Owner access authenticated! Welcome, Boss.", "success");
          this.setView('owner');
          return;
        } else {
          this.showToast(data.error || "Incorrect Owner Credentials!", "error");
          return;
        }
      } catch (err) {
        console.warn("Backend auth failed, falling back to local verification:", err);
      }
    }

    // Fallback authentication
    if (!localIsValid) {
      this.showToast("Incorrect Owner Credentials! Use ganesh/9150436455.", "error");
      return;
    }

    this.state.user = {
      name: "Store Manager",
      phone: "9999999999",
      email: "owner@ganeshprovisions.com",
      role: 'owner'
    };

    localStorage.setItem('gp_user', JSON.stringify(this.state.user));
    this.syncUserRole();
    this.closeLoginModal();
    this.showToast("Store Owner access authenticated! Welcome, Boss. (Offline Mode)", "success");
    this.setView('owner');
  }

  handleLogout() {
    this.state.user = null;
    this.state.userRole = null;
    this.state.cart = [];
    this.state.wishlist = [];
    
    localStorage.removeItem('gp_user');
    localStorage.removeItem('gp_cart');
    localStorage.removeItem('gp_wishlist');

    this.saveCart();
    this.syncCartBadge();
    this.syncWishlistBadge();
    this.syncUserRole();
    
    this.showToast("Logged out successfully.", "success");
    this.setView('home');
  }

  // --- Dynamic Simulator Order Trackings ---
  checkActiveOrderSimulations() {
    // Disabled: The status should be updated by the owner login only.
  }

  // --- Invoice Printing Download Engine ---
  generateAndPrintInvoice(orderId) {
    const order = this.state.orders.find(o => o.orderId === orderId);
    if (!order) return;

    const printArea = document.getElementById('gp-invoice-print-area');
    if (!printArea) return;

    printArea.innerHTML = `
      <div class="gp-invoice-header">
        <div class="gp-invoice-logo">
          <h2>Ganesh Provisions</h2>
          <span>Premium Dry Groceries & Spices</span>
        </div>
        <div class="gp-invoice-meta">
          <strong>Invoice ID:</strong> gp_inv_${order.orderId}<br>
          <strong>Date:</strong> ${order.date}<br>
          <strong>Method:</strong> ${order.details.paymentMethod.toUpperCase()}
        </div>
      </div>
      <div class="gp-invoice-bill-to">
        <h4>Bill To Recipient:</h4>
        <strong>Name:</strong> ${order.details.name}<br>
        <strong>Phone:</strong> ${order.details.phone}<br>
        <strong>Address:</strong> ${order.details.address}, ${order.details.pincode}
      </div>
      <table class="gp-invoice-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Size</th>
            <th>Unit Cost</th>
            <th>Quantity</th>
            <th>Total Cost</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.size}</td>
              <td>₹${item.price}</td>
              <td>${item.qty}</td>
              <td>₹${item.price * item.qty}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="gp-invoice-summary">
        <div class="gp-invoice-summary-row">
          <span>Subtotal</span>
          <span>₹${order.subtotal}</span>
        </div>
        <div class="gp-invoice-summary-row" style="color:var(--secondary-color);">
          <span>Promo Discount</span>
          <span>-₹${order.discount}</span>
        </div>
        <div class="gp-invoice-summary-row">
          <span>Delivery Charge</span>
          <span>₹${order.delivery}</span>
        </div>
        <div class="gp-invoice-summary-row total">
          <span>Payable Amount</span>
          <span>₹${order.total}</span>
        </div>
      </div>
      <div class="gp-invoice-footer">
        <p>Thank you for purchasing pure dry groceries from Ganesh Provisions!</p>
        <p>This document acts as valid proof of payment success.</p>
      </div>
    `;

    window.print();
  }

  // --- Rating & Post-Delivery Feedback Loop ---
  openFeedbackSheet(orderId) {
    this.state.feedbackOrderId = orderId;
    this.state.selectedFeedbackStars = 5;
    this.state.selectedFeedbackChips = [];
    this.state.uploadedFeedbackImage = "";
    
    // Clear styles
    document.getElementById('feedback-comment-text').value = "";
    const preview = document.getElementById('feedback-image-preview');
    if (preview) {
      preview.style.display = 'none';
      preview.src = '';
    }
    
    // Set active stars visual
    this.updateFeedbackStarsUI(5);
    
    // Clear chip selections
    const chips = document.querySelectorAll('.feedback-chip-btn');
    chips.forEach(c => c.classList.remove('selected'));

    const mask = document.getElementById('rating-sheet-mask');
    const container = document.getElementById('rating-sheet-container');
    if (mask && container) {
      mask.style.display = 'block';
      setTimeout(() => {
        mask.classList.add('open');
        container.classList.add('open');
      }, 50);
    }
  }

  closeFeedbackSheet() {
    const mask = document.getElementById('rating-sheet-mask');
    const container = document.getElementById('rating-sheet-container');
    if (mask && container) {
      mask.classList.remove('open');
      container.classList.remove('open');
      setTimeout(() => {
        mask.style.display = 'none';
      }, 400);
    }
  }

  handleFeedbackStar(starValue) {
    this.state.selectedFeedbackStars = starValue;
    this.updateFeedbackStarsUI(starValue);
  }

  updateFeedbackStarsUI(starsCount) {
    const starButtons = document.querySelectorAll('#feedback-stars-row button');
    starButtons.forEach((btn, idx) => {
      if (idx < starsCount) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  toggleFeedbackChip(buttonElement) {
    const chipText = buttonElement.textContent;
    const idx = this.state.selectedFeedbackChips.indexOf(chipText);
    
    if (idx !== -1) {
      this.state.selectedFeedbackChips.splice(idx, 1);
      buttonElement.classList.remove('selected');
    } else {
      this.state.selectedFeedbackChips.push(chipText);
      buttonElement.classList.add('selected');
    }
  }

  handleFeedbackImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.state.uploadedFeedbackImage = e.target.result;
      const preview = document.getElementById('feedback-image-preview');
      if (preview) {
        preview.src = e.target.result;
        preview.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  }

  submitFeedback() {
    const order = this.state.orders.find(o => o.orderId === this.state.feedbackOrderId);
    if (!order) return;

    const comment = document.getElementById('feedback-comment-text').value.trim();
    const customerName = this.state.user ? this.state.user.name : "Valued Customer";
    const stars = this.state.selectedFeedbackStars;
    const chips = [...this.state.selectedFeedbackChips];
    const image = this.state.uploadedFeedbackImage;
    const dateStr = new Date().toISOString().split('T')[0];

    // Read stored catalog
    this.state.catalog = JSON.parse(localStorage.getItem('gp_catalog')) || [];

    // Append this review to the reviewsList of EACH product in this order!
    order.items.forEach(orderedItem => {
      const dbProduct = this.state.catalog.find(p => p.id === orderedItem.id);
      if (dbProduct) {
        if (!dbProduct.reviewsList) dbProduct.reviewsList = [];
        
        const newReview = {
          id: `rev-${Date.now()}-${Math.random()}`,
          author: customerName,
          rating: stars,
          date: dateStr,
          tags: chips,
          comment: comment || "Fresh products, excellent delivery service!",
          image: image
        };

        dbProduct.reviewsList.unshift(newReview);
        dbProduct.reviews = dbProduct.reviewsList.length;
        
        // Recalculate average rating
        const totalStarsSum = dbProduct.reviewsList.reduce((sum, r) => sum + r.rating, 0);
        dbProduct.rating = parseFloat((totalStarsSum / dbProduct.reviews).toFixed(1));
      }
    });

    // Save updated catalog
    localStorage.setItem('gp_catalog', JSON.stringify(this.state.catalog));
    this.saveToServer('catalog', this.state.catalog);

    // Show beautiful success popup inside modal
    const container = document.getElementById('rating-sheet-container');
    if (container) {
      container.innerHTML = `
        <div style="text-align:center; padding: 40px 10px;">
          <i class="fa-solid fa-circle-check" style="font-size:4rem; color:var(--primary-color); animation: pulse 1.5s infinite;"></i>
          <h3 style="margin-top:20px; font-size:1.6rem; color:var(--text-dark);">Feedback Submitted!</h3>
          <p style="color:var(--text-muted); margin-top:8px; font-size:0.95rem;">
            “Thank you for your feedback! Your opinion helps us improve.”
          </p>
          <button class="btn-checkout" onclick="app.closeFeedbackSheet(); location.reload();" style="max-width:200px; margin-top:24px;">Close Panel</button>
        </div>
      `;
    }

    this.showToast("Thank you for your feedback!", "success");
    this.renderProducts();
  }

  // --- Customer Expense Tracking & Charts ---
  renderExpensesChartAndSummary() {
    const summary = document.getElementById('profile-expenses-summary');
    if (!summary) return;

    if (!this.state.user || this.state.orders.length === 0) {
      summary.style.display = 'none';
      return;
    }

    summary.style.display = 'grid';

    // Lifetime Spent sum
    const lifetimeSpent = this.state.orders.reduce((sum, o) => sum + o.total, 0);
    const lifeSpentNode = document.getElementById('profile-lifetime-spent');
    if (lifeSpentNode) lifeSpentNode.textContent = `₹${lifetimeSpent.toFixed(2)}`;
  }

  renderOrdersTracker() {
    if (!this.dom.orderHistoryContainer) return;

    const displayableOrders = this.state.orders.filter(o => o.status !== 'placed');

    if (displayableOrders.length === 0) {
      this.dom.orderHistoryContainer.innerHTML = `
        <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
          <i class="fa-solid fa-clipboard-list" style="font-size: 3rem; color: var(--border-color); margin-bottom: 12px;"></i>
          <h4>No orders yet</h4>
          <p style="font-size:0.85rem; margin-top:4px;">Add delicious dry products to basket and secure checkout!</p>
          <button class="btn-search" onclick="app.setView('home')" style="margin-top: 16px;">Browse Grains & Oils</button>
        </div>
      `;
      return;
    }

    this.dom.orderHistoryContainer.innerHTML = displayableOrders.map(order => {
      if (order.status === 'rejected') {
        return `
        <div class="order-history-card">
          <div class="order-history-header">
            <div>
              Order ID: <strong style="color:var(--primary-color);">${order.orderId} (${order.details.name})</strong>
            </div>
            <div>
              Date Placed: <span>${order.date}</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              Total Paid: <strong style="color:var(--primary-color);">₹${order.total}</strong>
            </div>
          </div>
          <div class="order-history-body">
            <div style="text-align: center; padding: 24px; border: 1px solid #fca5a5; background-color: #fee2e2; color: #ef4444; border-radius: var(--radius-sm); margin-bottom: 20px;">
              <i class="fa-solid fa-circle-xmark" style="font-size: 2.5rem; margin-bottom: 8px;"></i>
              <h4 style="font-size: 1.1rem; font-weight: 700;">Order Rejected</h4>
              <p style="font-size: 0.85rem; margin-top: 4px; color: #7f1d1d;">Unfortunately, this order was rejected by the store owner.</p>
            </div>
            <div style="background-color: var(--bg-color); padding: 14px; border-radius: var(--radius-sm);">
              <h5 style="margin-bottom:6px; font-weight:600; font-size:0.85rem;">Items Summary:</h5>
              <div style="font-size:0.8rem; color: var(--text-muted); margin-bottom: 8px;">
                ${order.items.map(i => `
                  <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span>${i.name} (${i.size}) x${i.qty}</span>
                    <span>₹${i.price * i.qty}</span>
                  </div>
                `).join('')}
              </div>
              <div style="border-top:1px dashed var(--border-color); padding-top:6px; margin-top:6px; display:flex; justify-content:space-between; font-weight:700; font-size:0.85rem;">
                <span>Shipment Destination:</span>
                <span style="font-weight:500; font-size:0.75rem; max-width:280px; text-align:right;">${order.details.name} • ${order.details.address} (Pincode: ${order.details.pincode})</span>
              </div>
            </div>
          </div>
        </div>
        `;
      }

      const isPreparing = order.status === 'preparing' || order.status === 'shipping' || order.status === 'delivered';
      const isShipping = order.status === 'shipping' || order.status === 'delivered';
      const isDelivered = order.status === 'delivered';

      // Live Vector Tracking Map Coordinate parameters based on order dynamic simulator
      let riderLeft = "10%";
      let riderTop = "50%";
      let riderStatusText = "Rider preparing dispatch";
      let estDelivery = "28 mins remaining";

      if (order.status === 'preparing') {
        riderLeft = "25%";
        riderTop = "50%";
        riderStatusText = "Partner stores loading grain bags";
        estDelivery = "18 mins remaining";
      } else if (order.status === 'shipping') {
        riderLeft = "58%";
        riderTop = "50%";
        riderStatusText = "Rider on vector road network";
        estDelivery = "7 mins remaining";
      } else if (order.status === 'delivered') {
        riderLeft = "80%";
        riderTop = "80%";
        riderStatusText = "Delivered at primary doorstep";
        estDelivery = "Arrived successfully";
      }

      return `
        <div class="order-history-card">
          <div class="order-history-header">
            <div>
              Order ID: <strong style="color:var(--primary-color);">${order.orderId} (${order.details.name})</strong>
            </div>
            <div>
              Date Placed: <span>${order.date}</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              Total Paid: <strong style="color:var(--primary-color);">₹${order.total}</strong>
              <button class="btn-invoice-download" onclick="app.generateAndPrintInvoice('${order.orderId}')">
                <i class="fa-solid fa-file-invoice-dollar"></i> Invoice
              </button>
            </div>
          </div>

          <div class="order-history-body">
            
            <!-- Live Vector Map Grid Tracking Module -->
            ${!isDelivered ? `
              <div class="vector-map-container">
                <div class="vector-map-title"><i class="fa-solid fa-compass-drafting"></i> Live Vector Tracking (Blinkit/Zepto Grid)</div>
                <div class="vector-map-grid">
                  <div class="vector-road-h"></div>
                  <div class="vector-road-v"></div>
                  <div class="vector-pin vector-store" title="Ganesh Provisions Store"><i class="fa-solid fa-store"></i></div>
                  <div class="vector-pin vector-customer" title="Recipient doorstep"><i class="fa-solid fa-house-user"></i></div>
                  <div class="vector-pin vector-rider" style="left: ${riderLeft}; top: ${riderTop};">
                    <div class="vector-rider-glow"></div>
                    🚚
                  </div>
                </div>
              </div>
              <div style="font-size:0.8rem; color:var(--text-muted); display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 14px;">
                <span>Logistics: <strong>${riderStatusText}</strong></span>
                <span>Estimate: <strong style="color:var(--primary-color);">${estDelivery}</strong></span>
              </div>
            ` : ''}

            <!-- Live Tracking Nodes -->
            <div class="order-tracking-visual">
              <div class="track-node active">
                <div class="track-icon">✓</div>
                <span class="track-lbl">Received</span>
              </div>
              <div class="track-node ${isPreparing ? 'active' : ''}">
                <div class="track-icon">${isPreparing ? '✓' : '2'}</div>
                <span class="track-lbl">Packed</span>
              </div>
              <div class="track-node ${isShipping ? 'active' : ''}">
                <div class="track-icon">${isShipping ? '🚚' : '3'}</div>
                <span class="track-lbl">Out for Delivery</span>
              </div>
              <div class="track-node ${isDelivered ? 'active' : ''}">
                <div class="track-icon">${isDelivered ? '✓' : '4'}</div>
                <span class="track-lbl">Delivered</span>
              </div>
            </div>

            <div style="background-color: var(--bg-color); padding: 14px; border-radius: var(--radius-sm);">
              <h5 style="margin-bottom:6px; font-weight:600; font-size:0.85rem;">Items Summary:</h5>
              <div style="font-size:0.8rem; color: var(--text-muted); margin-bottom: 8px;">
                ${order.items.map(i => `
                  <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span>${i.name} (${i.size}) x${i.qty}</span>
                    <span>₹${i.price * i.qty}</span>
                  </div>
                `).join('')}
              </div>
              <div style="border-top:1px dashed var(--border-color); padding-top:6px; margin-top:6px; display:flex; justify-content:space-between; font-weight:700; font-size:0.85rem;">
                <span>Shipment Destination:</span>
                <span style="font-weight:500; font-size:0.75rem; max-width:280px; text-align:right;">${order.details.name} • ${order.details.address} (Pincode: ${order.details.pincode})</span>
              </div>
            </div>

            <!-- Post Delivery Review Trigger Button -->
            ${isDelivered ? `
              <div style="margin-top:14px; text-align:right;">
                <button class="btn-checkout" onclick="app.openFeedbackSheet('${order.orderId}')" style="background-color:var(--secondary-color); padding: 8px 16px; font-size: 0.8rem; max-width: 180px;">
                  <i class="fa-solid fa-star"></i> Leave Shop Review
                </button>
              </div>
            ` : ''}

          </div>
        </div>
      `;
    }).join('');
  }

  // --- OWNER DASHBOARD VIEW CONTROLLER ---
  renderOwnerDashboard() {
    this.state.orders = JSON.parse(localStorage.getItem('gp_orders')) || [];
    this.state.catalog = JSON.parse(localStorage.getItem('gp_catalog')) || [];

    // Calculate Telemetry Values
    const totalOrdersCount = this.state.orders.length;
    const activeOrdersCount = this.state.orders.filter(o => o.status !== 'delivered').length;
    
    // Revenue: Sum of all orders totals
    const totalRev = this.state.orders.reduce((sum, o) => sum + o.total, 0);

    // Bind values to UI
    if (this.dom.ownerRevenue) this.dom.ownerRevenue.textContent = `₹${totalRev.toFixed(2)}`;
    if (this.dom.ownerActiveOrders) this.dom.ownerActiveOrders.textContent = activeOrdersCount;
    if (this.dom.ownerTotalOrders) this.dom.ownerTotalOrders.textContent = totalOrdersCount;
    if (this.dom.ownerCatalogCount) this.dom.ownerCatalogCount.textContent = `${this.state.catalog.length} Products`;

    // Render Daily Customer Orders Ledger
    this.renderOwnerOrdersLedger();
    
    // Render Analytics Chart
    this.renderOwnerAnalyticsChart(totalRev);

    // Render Customer database list
    this.renderOwnerCustomersLedger();
    
    // Render Catalog editor utility list
    this.renderOwnerCatalogManager();

    // Sync Active Inner Tab
    this.setAdminTab(this.state.activeAdminTab || 'products');
  }

  setAdminTab(tabName) {
    this.state.activeAdminTab = tabName;
    
    // Toggle active classes on tab buttons
    const navItems = document.querySelectorAll('.admin-nav-item');
    navItems.forEach(item => {
      const isMatch = item.textContent.trim().toLowerCase().includes(tabName);
      item.classList.toggle('active', isMatch);
    });

    // Toggle visibility of section divs
    const sections = document.querySelectorAll('.admin-tab-section');
    sections.forEach(sec => {
      const isMatch = sec.id === `admin-sec-${tabName}`;
      sec.style.display = isMatch ? 'block' : 'none';
    });

    // Render data for specific tabs
    if (tabName === 'offers') {
      this.renderOwnerCoupons();
    } else if (tabName === 'pincodes') {
      this.renderOwnerPincodes();
    } else if (tabName === 'settings') {
      this.renderOwnerSettings();
    }
  }

  renderOwnerCoupons() {
    const listContainer = document.getElementById('owner-coupons-list');
    if (!listContainer) return;

    this.state.coupons = JSON.parse(localStorage.getItem('gp_coupons')) || {};
    const couponKeys = Object.keys(this.state.coupons);

    if (couponKeys.length === 0) {
      listContainer.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding: 20px; color:var(--text-muted);">
            No promo coupon codes created yet.
          </td>
        </tr>
      `;
      return;
    }

    listContainer.innerHTML = couponKeys.map(code => {
      const c = this.state.coupons[code];
      const typeLabel = { percent: 'Percentage (%)', flat: 'Flat (₹)', freeship: 'Free Shipping' }[c.discountType] || c.discountType;
      const valDisplay = c.discountType === 'freeship' ? 'N/A' : (c.discountType === 'percent' ? `${c.value}%` : `₹${c.value}`);
      return `
        <tr>
          <td><strong>${code}</strong></td>
          <td>${typeLabel}</td>
          <td>${valDisplay}</td>
          <td>₹${c.minCart}</td>
          <td>${c.description}</td>
          <td>
            <button class="btn-owner-delete" onclick="app.ownerDeleteCoupon('${code}')">
              <i class="fa-solid fa-trash-can"></i> Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  ownerAddCoupon(event) {
    event.preventDefault();
    const code = document.getElementById('new-coupon-code').value.trim().toUpperCase();
    const type = document.getElementById('new-coupon-type').value;
    const value = parseInt(document.getElementById('new-coupon-value').value);
    const minCart = parseInt(document.getElementById('new-coupon-min').value);
    const desc = document.getElementById('new-coupon-desc').value.trim();

    this.state.coupons = JSON.parse(localStorage.getItem('gp_coupons')) || {};
    this.state.coupons[code] = {
      discountType: type,
      value: value,
      minCart: minCart,
      description: desc
    };

    localStorage.setItem('gp_coupons', JSON.stringify(this.state.coupons));
    this.saveToServer('coupons', this.state.coupons);
    document.getElementById('owner-add-coupon-form').reset();
    this.showToast(`Coupon ${code} added successfully!`, 'success');
    this.renderOwnerCoupons();
  }

  ownerDeleteCoupon(code) {
    if (!confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    this.state.coupons = JSON.parse(localStorage.getItem('gp_coupons')) || {};
    delete this.state.coupons[code];
    localStorage.setItem('gp_coupons', JSON.stringify(this.state.coupons));
    this.saveToServer('coupons', this.state.coupons);
    this.showToast(`Coupon ${code} deleted.`, 'error');
    this.renderOwnerCoupons();
  }

  renderOwnerPincodes() {
    const listContainer = document.getElementById('owner-pincodes-list');
    if (!listContainer) return;

    this.state.pincodes = JSON.parse(localStorage.getItem('gp_pincodes')) || [];

    if (this.state.pincodes.length === 0) {
      listContainer.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center; padding: 20px; color:var(--text-muted);">
            No serviceable pincodes configured.
          </td>
        </tr>
      `;
      return;
    }

    listContainer.innerHTML = this.state.pincodes.map((pin, idx) => `
      <tr>
        <td><strong>${pin.val}</strong></td>
        <td>₹${pin.fee}</td>
        <td>
          <span class="badge badge-organic" style="background-color: ${pin.status === 'active' ? 'var(--accent-light-green)' : '#fee2e2'}; color: ${pin.status === 'active' ? 'var(--primary-color)' : '#ef4444'}; cursor:pointer;" onclick="app.ownerTogglePincode(${idx})">
            ${pin.status.toUpperCase()}
          </span>
        </td>
        <td>
          <button class="btn-owner-delete" onclick="app.ownerDeletePincode(${idx})">
            <i class="fa-solid fa-trash-can"></i> Remove
          </button>
        </td>
      </tr>
    `).join('');
  }

  ownerAddPincode(event) {
    event.preventDefault();
    const val = document.getElementById('new-pincode-val').value.trim();
    const fee = parseInt(document.getElementById('new-pincode-fee').value);

    this.state.pincodes = JSON.parse(localStorage.getItem('gp_pincodes')) || [];
    
    if (this.state.pincodes.some(p => p.val === val)) {
      this.showToast(`Pincode ${val} already exists!`, 'error');
      return;
    }

    this.state.pincodes.push({
      val: val,
      fee: fee,
      status: 'active'
    });

    localStorage.setItem('gp_pincodes', JSON.stringify(this.state.pincodes));
    this.saveToServer('pincodes', this.state.pincodes);
    document.getElementById('owner-add-pincode-form').reset();
    this.showToast(`Serviceable area ${val} added.`, 'success');
    this.renderOwnerPincodes();
  }

  ownerDeletePincode(index) {
    this.state.pincodes = JSON.parse(localStorage.getItem('gp_pincodes')) || [];
    const removed = this.state.pincodes.splice(index, 1)[0];
    localStorage.setItem('gp_pincodes', JSON.stringify(this.state.pincodes));
    this.saveToServer('pincodes', this.state.pincodes);
    this.showToast(`Pincode ${removed.val} removed.`, 'error');
    this.renderOwnerPincodes();
  }

  ownerTogglePincode(index) {
    this.state.pincodes = JSON.parse(localStorage.getItem('gp_pincodes')) || [];
    const pin = this.state.pincodes[index];
    pin.status = pin.status === 'active' ? 'inactive' : 'active';
    localStorage.setItem('gp_pincodes', JSON.stringify(this.state.pincodes));
    this.saveToServer('pincodes', this.state.pincodes);
    this.showToast(`Pincode ${pin.val} is now ${pin.status}.`, 'success');
    this.renderOwnerPincodes();
  }

  renderOwnerSettings() {
    this.state.storeSettings = JSON.parse(localStorage.getItem('gp_settings')) || {
      name: 'Ganesh Provisions',
      phone: '9150436455',
      minFreeShip: 299,
      shipFee: 40,
      status: 'open'
    };

    const nameInput = document.getElementById('settings-store-name');
    const phoneInput = document.getElementById('settings-support-phone');
    const minInput = document.getElementById('settings-min-free-ship');
    const feeInput = document.getElementById('settings-ship-fee');
    const statusSelect = document.getElementById('settings-store-status');

    if (nameInput) nameInput.value = this.state.storeSettings.name || '';
    if (phoneInput) phoneInput.value = this.state.storeSettings.phone || '';
    if (minInput) minInput.value = this.state.storeSettings.minFreeShip || 299;
    if (feeInput) feeInput.value = this.state.storeSettings.shipFee || 40;
    if (statusSelect) statusSelect.value = this.state.storeSettings.status || 'open';
  }

  ownerSaveSettings(event) {
    event.preventDefault();
    const name = document.getElementById('settings-store-name').value.trim();
    const phone = document.getElementById('settings-support-phone').value.trim();
    const minFreeShip = parseInt(document.getElementById('settings-min-free-ship').value);
    const shipFee = parseInt(document.getElementById('settings-ship-fee').value);
    const status = document.getElementById('settings-store-status').value;

    const settingsObj = {
      name,
      phone,
      minFreeShip,
      shipFee,
      status
    };

    localStorage.setItem('gp_settings', JSON.stringify(settingsObj));
    this.state.storeSettings = settingsObj;
    this.saveToServer('settings', settingsObj);
    this.showToast('Global store settings applied successfully!', 'success');
    
    // Dynamically update brand name inside app headers
    const logoBlock = document.getElementById('brand-logo');
    if (logoBlock) {
      logoBlock.querySelector('h1').textContent = name;
    }
  }

  // Render Owner sales flex bar chart
  renderOwnerAnalyticsChart(todayRevSum) {
    const chartDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const revVals = [4500, 3200, 6800, 4100, 7800, 9500, 0]; // seeded past values
    revVals[6] = todayRevSum;

    const maxVal = Math.max(...revVals, 1000);
    const container = document.getElementById('owner-analytics-chart');
    if (container) {
      container.innerHTML = chartDays.map((day, idx) => {
        const heightPct = Math.min(100, Math.round((revVals[idx] / maxVal) * 100));
        return `
          <div class="owner-chart-col">
            <div class="owner-chart-fill" style="height: ${heightPct}%;">
              <span class="owner-chart-val">₹${revVals[idx]}</span>
            </div>
            <span class="owner-chart-lbl">${day}</span>
          </div>
        `;
      }).join('');
    }
  }

  // Compile unique customers index table
  renderOwnerCustomersLedger() {
    const listContainer = document.getElementById('owner-customers-list');
    if (!listContainer) return;

    const indexedCustomers = {};

    this.state.orders.forEach(order => {
      const phone = order.details.phone;
      if (!indexedCustomers[phone]) {
        indexedCustomers[phone] = {
          name: order.details.name,
          phone: phone,
          address: `${order.details.address} (${order.details.pincode})`,
          ordersCount: 0,
          totalSpent: 0,
          itemsPurchased: {}
        };
      }
      indexedCustomers[phone].ordersCount += 1;
      indexedCustomers[phone].totalSpent += order.total;

      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const key = `${item.name} (${item.size})`;
          if (!indexedCustomers[phone].itemsPurchased[key]) {
            indexedCustomers[phone].itemsPurchased[key] = 0;
          }
          indexedCustomers[phone].itemsPurchased[key] += item.qty;
        });
      }
    });

    const values = Object.values(indexedCustomers);

    if (values.length === 0) {
      listContainer.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding: 20px; color:var(--text-muted);">
            No customer order registrations indexed yet today.
          </td>
        </tr>
      `;
      return;
    }

    listContainer.innerHTML = values.map(c => {
      const itemsList = Object.entries(c.itemsPurchased)
        .map(([itemKey, qty]) => `<span style="display:inline-block; background-color:#f1f5f9; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; color: #475569; margin: 2px 4px 2px 0; border: 1px solid var(--border-color); font-weight: 500;">${itemKey} x${qty}</span>`)
        .join('');

      return `
        <tr>
          <td>
            <strong>${c.name}</strong>
            <div style="margin-top: 6px; display: flex; flex-wrap: wrap; gap: 4px;">
              ${itemsList}
            </div>
          </td>
          <td>${c.phone}</td>
          <td>${c.address}</td>
          <td>${c.ordersCount} orders</td>
          <td style="color:var(--primary-color); font-weight:700;">₹${c.totalSpent.toFixed(2)}</td>
        </tr>
      `;
    }).join('');
  }

  // Catalog item editing direct utility
  renderOwnerCatalogManager() {
    const managementSectionId = "owner-catalog-manager-section";
    let section = document.getElementById(managementSectionId);
    
    if (!section) {
      section = document.createElement('div');
      section.id = managementSectionId;
      section.className = "owner-chart-panel";
      section.style.marginTop = "30px";
      
      const formBox = document.querySelector('.owner-grid-panel');
      if (formBox) {
        formBox.parentNode.insertBefore(section, formBox.nextSibling);
      }
    }

    section.innerHTML = `
      <div class="owner-chart-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
        <h3><i class="fa-solid fa-cubes" style="color:var(--secondary-color);"></i> Active Store Inventory Catalog (${this.state.catalog.length})</h3>
        <span style="font-size:0.75rem; color:var(--text-muted);">Rapid Price Controls</span>
      </div>
      <div style="overflow-x: auto;">
        <table class="owner-ledger-table">
          <thead>
            <tr>
              <th>Grocery Image</th>
              <th>Product Name</th>
              <th>Pack Size</th>
              <th>Active Price</th>
              <th>Original Price</th>
              <th>Catalog Status</th>
              <th>Management Actions</th>
            </tr>
          </thead>
          <tbody>
            ${this.state.catalog.map(prod => `
              <tr>
                <td><img src="${prod.image}" style="width:36px; height:36px; object-fit:cover; border-radius:4px;"></td>
                <td><strong>${prod.name}</strong><br><span style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">${prod.category}</span></td>
                <td>${prod.sizes.join(', ')}</td>
                <td>₹${prod.price}</td>
                <td>₹${prod.originalPrice || prod.price}</td>
                <td>
                  ${prod.inStock !== false 
                    ? `<span class="badge badge-organic" style="font-size:0.65rem;">IN STOCK</span>` 
                    : `<span class="badge" style="font-size:0.65rem; background-color: #fee2e2; color: #ef4444;">OUT OF STOCK</span>`}
                </td>
                <td>
                  <div class="owner-product-row-actions">
                    <button class="btn-owner-edit" onclick="app.openOwnerProductEditModal('${prod.id}')">
                      <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button class="btn-owner-delete" onclick="app.ownerDeleteProduct('${prod.id}')">
                      <i class="fa-solid fa-trash-can"></i> Delete
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  openOwnerProductEditModal(prodId) {
    const prod = this.state.catalog.find(p => p.id === prodId);
    if (!prod) return;

    document.getElementById('edit-prod-id').value = prod.id;
    document.getElementById('edit-prod-name').value = prod.name;
    document.getElementById('edit-prod-telugu').value = prod.teluguName || '';
    document.getElementById('edit-prod-category').value = prod.category;
    document.getElementById('edit-prod-image').value = prod.image || '';
    document.getElementById('edit-prod-original-price').value = prod.originalPrice || prod.price;
    document.getElementById('edit-prod-price').value = prod.price;
    document.getElementById('edit-prod-unit').value = prod.unit || 'kg';
    document.getElementById('edit-prod-sizes').value = prod.sizes ? prod.sizes.join(', ') : '';
    document.getElementById('edit-prod-desc').value = prod.description || '';
    document.getElementById('edit-prod-tag').value = prod.tag || '';
    document.getElementById('edit-prod-status').value = prod.inStock !== false ? 'in-stock' : 'out-of-stock';
    document.getElementById('edit-prod-organic').checked = !!prod.isOrganic;

    if (this.dom.ownerProductEditModal) {
      this.dom.ownerProductEditModal.classList.add('open');
    }
  }

  closeOwnerProductEditModal() {
    if (this.dom.ownerProductEditModal) {
      this.dom.ownerProductEditModal.classList.remove('open');
    }
  }

  ownerSaveProductEdit(event) {
    event.preventDefault();

    const prodId = document.getElementById('edit-prod-id').value;
    const prod = this.state.catalog.find(p => p.id === prodId);
    if (!prod) {
      this.showToast("Product not found!", "error");
      return;
    }

    const name = document.getElementById('edit-prod-name').value.trim();
    const teluguName = document.getElementById('edit-prod-telugu').value.trim();
    const category = document.getElementById('edit-prod-category').value;
    const imageUrl = document.getElementById('edit-prod-image').value.trim();
    const originalPrice = parseInt(document.getElementById('edit-prod-original-price').value);
    const price = parseInt(document.getElementById('edit-prod-price').value);
    const unit = document.getElementById('edit-prod-unit').value.trim();
    const sizesStr = document.getElementById('edit-prod-sizes').value.trim();
    const desc = document.getElementById('edit-prod-desc').value.trim();
    const tag = document.getElementById('edit-prod-tag').value.trim();
    const status = document.getElementById('edit-prod-status').value;
    const isOrganic = document.getElementById('edit-prod-organic').checked;

    if (!name) {
      this.showToast("Product name is required!", "error");
      return;
    }

    // Split sizes array
    const sizes = sizesStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (sizes.length === 0) {
      this.showToast("Please enter at least one size value (e.g. 1kg)", "error");
      return;
    }

    // Choose beautiful random unsplash dry grocery image based on category if image is empty
    let finalImage = imageUrl;
    if (!finalImage) {
      finalImage = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600";
      if (category === 'rice') {
        finalImage = "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600";
      } else if (category === 'oils') {
        finalImage = "https://images.unsplash.com/photo-1631515223360-70972d7ee5ce?auto=format&fit=crop&q=80&w=600";
      } else if (category === 'dals') {
        finalImage = "https://images.unsplash.com/photo-1585993003615-516195b27a33?auto=format&fit=crop&q=80&w=600";
      } else if (category === 'spices') {
        finalImage = "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600";
      } else if (category === 'dryfruits') {
        finalImage = "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=600";
      }
    }

    const catObj = this.categories.find(c => c.id === category);
    const badgeEmoji = catObj ? catObj.emoji : '🛒';

    // Update product fields
    prod.name = name;
    prod.teluguName = teluguName;
    prod.category = category;
    prod.badgeEmoji = badgeEmoji;
    prod.image = finalImage;
    prod.originalPrice = originalPrice || price;
    prod.price = price;
    prod.unit = unit;
    prod.sizes = sizes;
    prod.description = desc;
    prod.tag = tag;
    prod.inStock = status === 'in-stock';
    prod.isOrganic = isOrganic;

    // Save and sync catalog
    localStorage.setItem('gp_catalog', JSON.stringify(this.state.catalog));
    this.saveToServer('catalog', this.state.catalog);

    this.showToast(`Updated ${name} successfully!`, "success");
    
    // Close modal
    this.closeOwnerProductEditModal();

    // Refresh screens
    this.renderOwnerDashboard();
    this.renderProducts();
  }

  ownerDeleteProduct(prodId) {
    const prod = this.state.catalog.find(p => p.id === prodId);
    if (!prod) return;

    if (!confirm(`Are you sure you want to delete ${prod.name} from Ganesh Provisions catalog?`)) return;

    // Track deleted product ID to prevent auto-seeding it back
    let deletedIds = JSON.parse(localStorage.getItem('gp_deleted_products')) || [];
    if (!deletedIds.includes(prodId)) {
      deletedIds.push(prodId);
      localStorage.setItem('gp_deleted_products', JSON.stringify(deletedIds));
    }

    this.state.catalog = this.state.catalog.filter(p => p.id !== prodId);
    localStorage.setItem('gp_catalog', JSON.stringify(this.state.catalog));
    this.saveToServer('catalog', this.state.catalog);

    this.showToast(`Deleted ${prod.name} from catalog.`, "error");
    
    // Refresh screens
    this.renderOwnerDashboard();
    this.renderProducts();
  }

  renderOwnerOrdersLedger() {
    if (!this.dom.ownerOrdersContainer) return;

    if (this.state.orders.length === 0) {
      this.dom.ownerOrdersContainer.innerHTML = `
        <div style="text-align:center; padding: 60px 0; color:var(--text-muted);">
          <i class="fa-solid fa-cart-flatbed" style="font-size: 3rem; color:var(--border-color); margin-bottom:12px;"></i>
          <h4>No orders received today</h4>
          <p style="font-size:0.85rem; margin-top:4px;">When customers secure checkout shopping orders, they appear here.</p>
        </div>
      `;
      return;
    }

    this.dom.ownerOrdersContainer.innerHTML = this.state.orders.map(order => {
      // Styled mini tracking route elements for owners as well!
      let riderLeft = "10%";
      let riderTop = "50%";
      if (order.status === 'preparing') { riderLeft = "25%"; }
      else if (order.status === 'shipping') { riderLeft = "58%"; }
      else if (order.status === 'delivered') { riderLeft = "80%"; riderTop = "80%"; }

      return `
        <div class="owner-order-card">
          <div class="owner-order-header">
            <div>Order ID: <strong style="color:var(--primary-color);">${order.orderId} (${order.details.name})</strong></div>
            <div>Time: <span>${order.date}</span></div>
            <div>Total: <strong style="color:var(--primary-color);">₹${order.total}</strong></div>
          </div>
          
          <div class="owner-order-body">
            <!-- Premium Status Action Control Panel -->
            <div style="background-color: #f8fafc; border: 1px solid var(--border-color); padding: 12px 14px; border-radius: var(--radius-sm); margin-bottom: 16px; box-shadow: var(--shadow-sm);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">
                <span style="font-size:0.75rem; font-weight:700; color:var(--text-dark); text-transform:uppercase; letter-spacing:0.5px;">Update Status:</span>
                <span style="background-color:${order.status === 'placed' ? '#b45309' : (order.status === 'rejected' ? '#ef4444' : 'var(--primary-color)')}; color:white; font-size:0.7rem; font-weight:700; padding: 3px 8px; border-radius:12px; text-transform:uppercase; letter-spacing:0.5px;">
                  ${order.status === 'placed' ? 'placed (pending acceptance)' : order.status}
                </span>
              </div>
              <div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:space-between; width:100%;">
                <button class="btn-status-update ${order.status === 'placed' ? 'active-received' : ''}" style="flex:1 1 auto; padding: 8px 12px; font-size: 0.75rem; font-weight: 600; cursor:pointer;" 
                        onclick="app.updateOrderStatus('${order.orderId}', 'received')">
                  <i class="fa-solid fa-check"></i> Accept
                </button>
                <button class="btn-status-update ${order.status === 'preparing' ? 'active-preparing' : ''}" style="flex:1 1 auto; padding: 8px 12px; font-size: 0.75rem; font-weight: 600; cursor:pointer;" 
                        onclick="app.updateOrderStatus('${order.orderId}', 'preparing')">
                  <i class="fa-solid fa-box"></i> Packed
                </button>
                <button class="btn-status-update ${order.status === 'shipping' ? 'active-shipping' : ''}" style="flex:1 1 auto; padding: 8px 12px; font-size: 0.75rem; font-weight: 600; cursor:pointer;" 
                        onclick="app.updateOrderStatus('${order.orderId}', 'shipping')">
                  <i class="fa-solid fa-truck"></i> Out for Delivery
                </button>
                <button class="btn-status-update ${order.status === 'delivered' ? 'active-delivered' : ''}" style="flex:1 1 auto; padding: 8px 12px; font-size: 0.75rem; font-weight: 600; cursor:pointer;" 
                        onclick="app.updateOrderStatus('${order.orderId}', 'delivered')">
                  <i class="fa-solid fa-circle-check"></i> Delivered
                </button>
                <button class="btn-status-update ${order.status === 'rejected' ? 'active-rejected' : ''}" style="flex:1 1 auto; padding: 8px 12px; font-size: 0.75rem; font-weight: 600; cursor:pointer;" 
                        onclick="app.updateOrderStatus('${order.orderId}', 'rejected')">
                  <i class="fa-solid fa-circle-xmark"></i> Reject
                </button>
              </div>
            </div>

            <div class="owner-order-items">
              ${order.items.map(item => `
                <div style="display:flex; justify-content:space-between; font-size:0.82rem; margin-bottom:2px;">
                  <span>${item.name} (${item.size}) x${item.qty}</span>
                  <strong>₹${item.price * item.qty}</strong>
                </div>
              `).join('')}
            </div>

            <div class="owner-order-delivery">
              <strong>Customer Destination:</strong> ${order.details.name} (Ph: ${order.details.phone})<br>
              <strong>Address:</strong> ${order.details.address} (Pincode: ${order.details.pincode})<br>
              <strong>Booking Slot:</strong> <span style="text-transform: capitalize;">${order.details.deliverySlot.replace('_', ' ')}</span>
            </div>

            <!-- Stylized tracking route for owners to check where active riders are -->
            ${order.status !== 'delivered' ? `
              <div class="vector-map-container" style="height:150px; margin-top:12px;">
                <div class="vector-map-title" style="font-size:0.65rem; padding: 4px 10px;"><i class="fa-solid fa-truck-ramp-box"></i> Rider Routing Spot</div>
                <div class="vector-map-grid" style="padding:10px;">
                  <div class="vector-road-h"></div>
                  <div class="vector-road-v"></div>
                  <div class="vector-pin vector-store" style="width:20px; height:20px; font-size:0.6rem; left:10%; top:50%;"><i class="fa-solid fa-store"></i></div>
                  <div class="vector-pin vector-customer" style="width:20px; height:20px; font-size:0.6rem; left:80%; top:80%;"><i class="fa-solid fa-house-user"></i></div>
                  <div class="vector-pin vector-rider" style="left: ${riderLeft}; top: ${riderTop}; width:24px; height:24px; font-size:0.75rem;">
                    <div class="vector-rider-glow"></div>
                    🚚
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  updateOrderStatus(orderId, nextStatus) {
    this.state.orders = this.state.orders.map(order => {
      if (order.orderId === orderId) {
        order.status = nextStatus;
        this.showToast(`Order ${orderId} marked as ${nextStatus.toUpperCase()}`, "success");
      }
      return order;
    });

    localStorage.setItem('gp_orders', JSON.stringify(this.state.orders));
    this.saveToServer('orders', this.state.orders);
    this.renderOwnerDashboard();
    
    // If the active view is tracker, sync tracker view immediately as well
    if (this.state.currentView === 'tracker') {
      this.renderOrdersTracker();
      this.renderExpensesChartAndSummary();
    }
  }

  // --- Store Inventory management ---
  ownerAddProduct(event) {
    event.preventDefault();

    const name = document.getElementById('new-prod-name').value.trim();
    const teluguName = document.getElementById('new-prod-telugu').value.trim();
    const category = document.getElementById('new-prod-category').value;
    const originalPrice = parseInt(document.getElementById('new-prod-original-price').value);
    const imageUrl = document.getElementById('new-prod-image').value.trim();
    
    // Choose beautiful random unsplash dry grocery image based on category
    let finalImage = imageUrl;
    if (!finalImage) {
      finalImage = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600";
      if (category === 'rice') {
        finalImage = "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600";
      } else if (category === 'oils') {
        finalImage = "https://images.unsplash.com/photo-1631515223360-70972d7ee5ce?auto=format&fit=crop&q=80&w=600";
      } else if (category === 'dals') {
        finalImage = "https://images.unsplash.com/photo-1585993003615-516195b27a33?auto=format&fit=crop&q=80&w=600";
      } else if (category === 'spices') {
        finalImage = "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600";
      } else if (category === 'dryfruits') {
        finalImage = "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=600";
      }
    }

    const price = parseInt(document.getElementById('new-prod-price').value);
    const unit = document.getElementById('new-prod-unit').value.trim();
    const sizesStr = document.getElementById('new-prod-sizes').value.trim();
    const desc = document.getElementById('new-prod-desc').value.trim();
    const tag = document.getElementById('new-prod-tag').value.trim() || "Store Premium";

    // Split sizes array
    const sizes = sizesStr.split(',').map(s => s.trim()).filter(s => s.length > 0);

    if (sizes.length === 0) {
      this.showToast("Please enter at least one size value (e.g. 1kg)", "error");
      return;
    }

    const uniqueId = `prod-${Math.floor(100000 + Math.random() * 900000)}`;

    const catObj = this.categories.find(c => c.id === category);
    const badgeEmoji = catObj ? catObj.emoji : '🛒';

    const newProduct = {
      id: uniqueId,
      name: name,
      teluguName: teluguName,
      category: category,
      badgeEmoji: badgeEmoji,
      price: price,
      originalPrice: originalPrice || price,
      unit: unit,
      image: finalImage,
      description: desc,
      rating: 4.8, // New products get solid starting reviews rating
      reviews: 1,
      sizes: sizes,
      inStock: true,
      isOrganic: tag.toLowerCase().includes('organic'),
      tag: tag,
      reviewsList: [
        {
          id: `rev-${Date.now()}`,
          author: "Owner Partner",
          rating: 5,
          date: new Date().toISOString().split('T')[0],
          tags: ["Good Quality"],
          comment: "Fresh and newly stock-loaded in store inventory. Superb fragrance!",
          image: ""
        }
      ]
    };

    // Save product
    this.state.catalog.unshift(newProduct);
    localStorage.setItem('gp_catalog', JSON.stringify(this.state.catalog));
    this.saveToServer('catalog', this.state.catalog);

    // Alert success
    this.showToast(`Saved ${name} successfully into catalogue!`, "success");
    
    // reset form
    document.getElementById('owner-add-product-form').reset();
    
    // Refresh Telemetry & Catalog
    this.renderOwnerDashboard();
    this.renderProducts();
  }

  ownerResetCatalog() {
    localStorage.removeItem('gp_deleted_products');
    localStorage.setItem('gp_catalog', JSON.stringify(GROCERY_PRODUCTS));
    this.state.catalog = [...GROCERY_PRODUCTS];
    this.saveToServer('catalog', this.state.catalog);
    this.renderOwnerDashboard();
    this.renderProducts();
    this.showToast("Restored seed grocery database", "success");
  }

  // --- Wishlist Management ---
  toggleWishlist(prodId) {
    const idx = this.state.wishlist.indexOf(prodId);
    const prod = this.state.catalog.find(p => p.id === prodId);
    
    if (idx !== -1) {
      this.state.wishlist.splice(idx, 1);
      this.showToast(`Removed ${prod ? prod.name : ''} from Wishlist`, "error");
    } else {
      this.state.wishlist.push(prodId);
      this.showToast(`Added ${prod ? prod.name : ''} to Wishlist! ❤️`, "success");
    }

    localStorage.setItem('gp_wishlist', JSON.stringify(this.state.wishlist));
    this.syncWishlistBadge();
    this.renderProducts();
  }

  syncWishlistBadge() {
    if (this.dom.wishlistCount) this.dom.wishlistCount.textContent = this.state.wishlist.length;
  }

  showWishlist() {
    if (this.state.wishlist.length === 0) {
      this.showToast("Wishlist is currently empty!", "error");
      return;
    }

    const products = this.state.catalog.filter(p => this.state.wishlist.includes(p.id));
    
    this.state.activeCategory = 'wishlist';
    this.state.searchQuery = '';
    if (this.dom.catalogSearch) this.dom.catalogSearch.value = '';
    
    const catBtns = document.querySelectorAll('.tab-btn');
    catBtns.forEach(btn => btn.classList.remove('active'));

    if (this.dom.productsGrid) {
      const catalogTitle = document.getElementById('catalog-title');
      if (catalogTitle) catalogTitle.textContent = "Your Wishlist ❤️";

      this.renderProductsGridWithList(products);
      this.scrollToCatalog();
    }
  }

  renderProductsGridWithList(products) {
    this.dom.productsGrid.innerHTML = products.map((prod, idx) => {
      const isWishlisted = this.state.wishlist.includes(prod.id);
      const selectedSize = this.state.selectedSizeCache[prod.id] || prod.sizes[0];
      const selectedPrice = this.calculatePrice(prod.price, selectedSize, prod.sizes[0]);
      const discountPercent = prod.originalPrice 
        ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100) 
        : 0;

      // Check if this product+size is already in the cart
      const cartQty = this.getCardCartQty(prod.id, selectedSize);

      return `
        <div class="product-card" data-id="${prod.id}" style="--i: ${idx}">
          <div class="card-badge-container">
            ${prod.isOrganic ? '<span class="badge badge-organic"><i class="fa-solid fa-leaf"></i> Organic</span>' : ''}
            ${prod.tag ? `<span class="badge badge-tag">${prod.tag}</span>` : ''}
          </div>

          ${discountPercent > 0 ? `<div class="card-discount-tag">${discountPercent}% OFF</div>` : ''}

          <button class="btn-wishlist ${isWishlisted ? 'active' : ''}" 
                  onclick="app.toggleWishlist('${prod.id}')">
            <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
          </button>

          <div class="product-visual-wrapper" onclick="app.openProductDetailModal('${prod.id}')">
            <img src="${prod.image}" alt="${prod.name}" class="hero-image" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'">
          </div>

          <div class="product-details-box">
            <div class="product-rating">
              <span class="star-rating">
                ${'<i class="fa-solid fa-star"></i>'.repeat(Math.floor(prod.rating))}
                ${prod.rating % 1 >= 0.5 ? '<i class="fa-solid fa-star-half-stroke"></i>' : ''}
                ${'<i class="fa-regular fa-star"></i>'.repeat(5 - Math.ceil(prod.rating))}
              </span>
              <span>(${prod.reviews})</span>
            </div>

            <h4 onclick="app.openProductDetailModal('${prod.id}')">${prod.name}</h4>
            <p class="product-desc-truncate">${prod.description}</p>

            <div class="product-options-row">
              <select class="size-select-card" onchange="app.handleSizeChange('${prod.id}', this)">
                ${prod.sizes.map(size => `
                  <option value="${size}" ${selectedSize === size ? 'selected' : ''}>${size}</option>
                `).join('')}
              </select>

              <div class="price-block">
                <div style="display:flex; align-items:baseline; gap:4px;">
                  <span class="price-val">₹${selectedPrice}</span>
                  ${prod.originalPrice ? `<span style="font-size:0.75rem; text-decoration:line-through; color:var(--text-muted);">₹${this.calculatePrice(prod.originalPrice, selectedSize, prod.sizes[0])}</span>` : ''}
                </div>
                <span class="price-unit">per ${selectedSize}</span>
              </div>
            </div>

            <div class="card-dual-buttons">
              ${prod.inStock === false ? `
                <button class="btn-card-add" disabled style="background-color: var(--border-color); color: var(--text-muted); cursor: not-allowed; grid-column: span 2; border-color: var(--border-color);">
                  <i class="fa-solid fa-ban"></i> Out of Stock
                </button>
              ` : `
                ${cartQty > 0 ? `
                  <div class="card-qty-counter">
                    <button class="qty-dec" onclick="app.cardDecrementQty('${prod.id}', '${selectedSize}')">−</button>
                    <span class="qty-display">${cartQty}</span>
                    <button class="qty-inc" onclick="app.cardIncrementQty('${prod.id}', '${selectedSize}')">+</button>
                  </div>
                ` : `
                  <button class="btn-card-add" onclick="app.addItemToCart('${prod.id}')">
                    <i class="fa-solid fa-plus"></i> Add
                  </button>
                `}
                <button class="btn-card-buy" onclick="app.buyNow('${prod.id}')">
                  <i class="fa-solid fa-bolt"></i> Buy Now
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    this.bind3DTiltEvents();
  }

  // --- Dynamic float Notification Toast alerts ---
  showToast(message, type = "success") {
    if (!this.dom.toastWrapper) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '<i class="fa-solid fa-circle-check" style="color:var(--primary-color);"></i>';
    if (type === "error") {
      icon = '<i class="fa-solid fa-circle-exclamation" style="color:#ef4444;"></i>';
    }

    toast.innerHTML = `
      ${icon}
      <span>${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    this.dom.toastWrapper.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }
}

const app = new GroceryApp();
