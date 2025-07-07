// API Configuration
const API_KEYS = {
  GOOGLE_CLIENT_ID: '145342056552-5aear8s7r03862qnv2fh1lgag69vo83h.apps.googleusercontent.com',
  YOUTUBE_API_KEY: 'AIzaSyChm0thF6dU-MW-2_INOGRDwcfsn0mjO7E',
  WEATHER_API_KEY: 'ed2e3845bac0441c8a9152516253003',
  AI_API_KEY: 'AIzaSyAMBF1xeNkSJgbgbFh_MG1UKIdX1zBm8y4',
  ADSTERRA_AD_KEY: '2d685b7c5c804cb416a2d6a5ff80c8b8',
  EMAIL_API_KEY: 'AIzaSyBQBOgbIJDTU189K38rJ0tU03_s3KQ3rZg',
  UNSPLASH_API_KEY: '2yu18CK_h5tnje470ULfnDR1FpWjsz__eNzXswLogT0',
  STORAGE_API_KEY: 'AIzaSyBfWMWCQM2U4GNezNZtGhC8-FiczXoPhms',
  RECIPIENT_EMAIL: 'therareperson4@gmail.com',
  PAYPAL_EMAIL: 'awaabaliali04@gmail.com',
  SHOPPING_API_KEY: 'AIzaSyCF4vQwEUpuu2o8njnmI-yPXcn1j-2LRGk',
  GOOGLE_PLAY_API_KEY: 'AIzaSyBqs28gzkLxdH1neFMWuDUzkxsXj4lMHak',
  GOOGLE_BOOKS_API_KEY: 'AIzaSyDfp0nhxxhJDqSE7gtZdTYGltouznu4IxA'
};

// Main Application Class
class EdirearApp {
  constructor() {
    this.currentUser = null;
    this.youtubeAccessToken = null;
    this.currentChannel = null;
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    this.cart = JSON.parse(localStorage.getItem('cart')) || [];
    this.subscriptions = JSON.parse(localStorage.getItem('subscriptions')) || [];
    this.searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    this.monetizationStatus = JSON.parse(localStorage.getItem('monetizationStatus')) || {
      enabled: false,
      adsenseAccount: '',
      paymentEmail: '',
      adTypes: ['display', 'overlay', 'skippable'],
      adFrequency: 5,
      earnings: 0,
      adImpressions: [],
      totalViews: 0,
      platformViews: 0,
      platformImpressions: 0,
      bankDetails: JSON.parse(localStorage.getItem('bankDetails')) || null
    };
    this.isPremiumUser = localStorage.getItem('isPremiumUser') === 'true';
    this.socket = io('https://socket.edirear.com'); // Initialize Socket.IO connection
    this.currentCallId = null;
    this.callStartTime = null;
    this.callTimerInterval = null;
    this.deferredPrompt = null;
    
    this.init();
  }

  init() {
    this.setupDarkMode();
    this.loadUserState();
    this.setupEventListeners();
    this.initializeAuth();
    this.updateCartCount();
    this.setupMobileNavigation();
    this.setupPayPal();
    this.loadAdScripts();
    this.setupCalling();
    this.setupInstallPrompt();
    this.loadSearchHistory();
    this.setupGooglePlaySearch();
    this.setupBooksSearch();
  }

  setupGooglePlaySearch() {
    const searchBtn = document.getElementById('playstore-search-btn');
    const searchInput = document.getElementById('playstore-search-input');
    
    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', () => this.searchGooglePlayApps());
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.searchGooglePlayApps();
      });
    }
  }

  setupBooksSearch() {
    const searchBtn = document.getElementById('books-search-btn');
    const searchInput = document.getElementById('books-search-input');
    
    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', () => this.searchBooks());
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.searchBooks();
      });
    }
  }

  async searchGooglePlayApps() {
    const query = document.getElementById('playstore-search-input').value.trim();
    if (!query) return;

    try {
      const container = document.getElementById('playstore-grid');
      if (!container) return;
      
      container.innerHTML = '<div class="loading">Searching apps...</div>';
      
      // Mock data since Google Play API is restricted
      const mockApps = this.generateMockApps(query);
      
      container.innerHTML = mockApps.map(app => `
        <div class="app-card">
          <img src="${app.image}" alt="${app.title}" class="app-image">
          <div class="app-info">
            <h3 class="app-title">${app.title}</h3>
            <p class="app-developer">${app.developer}</p>
            <div class="app-rating">
              ${this.generateStarRating(app.rating)}
              <span>(${app.reviews})</span>
            </div>
            <a href="https://play.google.com/store/apps/details?id=${app.package}" target="_blank" class="download-app-btn">
              <i class="fab fa-google-play"></i> Download
            </a>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error searching apps:', error);
      document.getElementById('playstore-grid').innerHTML = '<div class="error">Error searching apps. Please try again.</div>';
    }
  }

  generateMockApps(query) {
    const mockApps = [];
    const categories = ['Games', 'Social', 'Productivity', 'Education', 'Entertainment'];
    
    for (let i = 1; i <= 12; i++) {
      mockApps.push({
        name: `${query} App ${i}`,
        title: `${query} App ${i}`,
        developer: `Developer ${i}`,
        rating: (Math.random() * 2 + 3).toFixed(1),
        reviews: Math.floor(Math.random() * 100000),
        image: `https://via.placeholder.com/200?text=App+${i}`,
        package: `com.example.${query.toLowerCase()}${i}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        size: `${Math.floor(Math.random() * 50) + 10}MB`,
        downloads: `${Math.floor(Math.random() * 100)}M+`
      });
    }
    
    return mockApps;
  }

  async searchBooks() {
    const query = document.getElementById('books-search-input').value.trim();
    if (!query) return;

    try {
      const container = document.getElementById('books-grid');
      if (!container) return;
      
      container.innerHTML = '<div class="loading">Searching books...</div>';
      
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${API_KEYS.GOOGLE_BOOKS_API_KEY}&maxResults=20`);
      
      if (!response.ok) throw new Error('Failed to fetch books');
      
      const data = await response.json();
      
      if (data.items?.length > 0) {
        container.innerHTML = data.items.map(book => {
          const volumeInfo = book.volumeInfo;
          const thumbnail = volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x196?text=No+Cover';
          const authors = volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author';
          
          return `
            <div class="book-card">
              <img src="${thumbnail}" alt="${volumeInfo.title}" class="book-image">
              <div class="book-info">
                <h3 class="book-title">${volumeInfo.title}</h3>
                <p class="book-author">${authors}</p>
                <p class="book-published">${volumeInfo.publishedDate || 'Unknown year'}</p>
                <div class="book-actions">
                  ${volumeInfo.previewLink ? `
                    <button class="read-book-btn" onclick="window.edirearApp.openBookReader('${volumeInfo.previewLink}', '${volumeInfo.title}')">
                      <i class="fas fa-book-open"></i> Read
                    </button>
                  ` : ''}
                  ${volumeInfo.infoLink ? `
                    <a href="${volumeInfo.infoLink}" target="_blank" class="read-book-btn" style="background-color: var(--gray);">
                      <i class="fas fa-info-circle"></i> Details
                    </a>
                  ` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('');
      } else {
        container.innerHTML = '<div class="no-results">No books found. Try a different search.</div>';
      }
    } catch (error) {
      console.error('Error searching books:', error);
      document.getElementById('books-grid').innerHTML = '<div class="error">Error searching books. Please try again.</div>';
    }
  }

  openBookReader(previewLink, title) {
    const readerModal = document.getElementById('book-reader-modal');
    const readerFrame = document.getElementById('book-reader-content');
    const readerTitle = document.getElementById('book-reader-title');
    
    if (!readerModal || !readerFrame || !readerTitle) return;
    
    readerTitle.textContent = title;
    readerFrame.innerHTML = `
      <iframe id="book-reader-frame" src="${previewLink}" frameborder="0" style="width:100%; height:100%;"></iframe>
    `;
    readerModal.style.display = 'block';
  }

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      document.getElementById('install-btn').classList.remove('hidden');
    });

    document.getElementById('install-btn')?.addEventListener('click', async () => {
      if (!this.deferredPrompt) return;
      
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      this.deferredPrompt = null;
      document.getElementById('install-btn').classList.add('hidden');
    });
  }

  loadAdScripts() {
    if (this.isPremiumUser) {
      this.removeAllAds();
      return;
    }

    if (!document.querySelector('script[src*="adsterra"]')) {
      const adsterraScript = document.createElement('script');
      adsterraScript.src = '//www.highperformanceformat.com/2d685b7c5c804cb416a2d6a5ff80c8b8/invoke.js';
      adsterraScript.async = true;
      document.body.appendChild(adsterraScript);
    }
    
    if (typeof adsbygoogle === 'undefined' && !document.querySelector('script[src*="googlesyndication"]')) {
      const googleAdScript = document.createElement('script');
      googleAdScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6957556426963359';
      googleAdScript.crossOrigin = 'anonymous';
      googleAdScript.async = true;
      document.body.appendChild(googleAdScript);
    }
  }

  setupCalling() {
    document.getElementById('call-btn')?.addEventListener('click', () => {
      document.getElementById('call-modal').style.display = 'block';
    });

    document.getElementById('start-call-btn')?.addEventListener('click', () => {
      const number = document.getElementById('call-number').value.trim();
      if (!number) {
        document.getElementById('call-status').textContent = 'Please enter a phone number';
        document.getElementById('call-status').className = 'error';
        document.getElementById('call-status').style.display = 'block';
        return;
      }

      this.socket.emit('callRequest', {
        caller: this.currentUser?.email || 'Anonymous',
        receiver: number,
        timestamp: new Date().toISOString()
      });

      document.getElementById('call-status').textContent = 'Calling...';
      document.getElementById('call-status').className = '';
      document.getElementById('call-status').style.display = 'block';
      document.getElementById('call-modal').style.display = 'none';
    });

    document.getElementById('accept-call-btn')?.addEventListener('click', () => {
      this.socket.emit('callAccepted', { callId: this.currentCallId });
      document.getElementById('incoming-call-modal').style.display = 'none';
      this.startCallTimer();
      document.getElementById('active-call-modal').style.display = 'block';
    });

    document.getElementById('reject-call-btn')?.addEventListener('click', () => {
      this.socket.emit('callRejected', { callId: this.currentCallId });
      document.getElementById('incoming-call-modal').style.display = 'none';
    });

    document.getElementById('end-call-btn')?.addEventListener('click', () => {
      this.socket.emit('callEnded', { callId: this.currentCallId });
      document.getElementById('active-call-modal').style.display = 'none';
      this.stopCallTimer();
    });

    this.socket.on('incomingCall', (data) => {
      this.currentCallId = data.callId;
      document.getElementById('caller-number').textContent = data.caller;
      document.getElementById('incoming-call-modal').style.display = 'block';
    });

    this.socket.on('callAccepted', () => {
      document.getElementById('call-status').textContent = 'Call connected!';
      document.getElementById('call-status').className = 'success';
      document.getElementById('call-status').style.display = 'block';
      this.startCallTimer();
      document.getElementById('active-call-modal').style.display = 'block';
      document.getElementById('active-call-number').textContent = document.getElementById('call-number').value;
    });

    this.socket.on('callRejected', () => {
      document.getElementById('call-status').textContent = 'Call rejected';
      document.getElementById('call-status').className = 'error';
      document.getElementById('call-status').style.display = 'block';
    });

    this.socket.on('callEnded', () => {
      document.getElementById('active-call-modal').style.display = 'none';
      this.stopCallTimer();
    });
  }

  startCallTimer() {
    this.callStartTime = new Date();
    this.callTimerInterval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now - this.callStartTime) / 1000);
      const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
      const seconds = (diff % 60).toString().padStart(2, '0');
      document.getElementById('call-timer').textContent = `${minutes}:${seconds}`;
    }, 1000);
  }

  stopCallTimer() {
    if (this.callTimerInterval) {
      clearInterval(this.callTimerInterval);
    }
  }

  setupMobileNavigation() {
    const menuBtn = document.querySelector('.menu-btn');
    const sideNav = document.querySelector('.side-nav');
    const searchBtn = document.querySelector('#search-btn');
    const searchBar = document.querySelector('.search-bar');
    const playstoreSearchBtn = document.querySelector('#playstore-search-btn');
    const playstoreSearchBar = document.querySelector('.playstore-search');
    const booksSearchBtn = document.querySelector('#books-search-btn');
    const booksSearchBar = document.querySelector('.books-search');
    
    menuBtn?.addEventListener('click', () => sideNav.classList.toggle('visible'));
    searchBtn?.addEventListener('click', () => searchBar.classList.toggle('visible'));
    playstoreSearchBtn?.addEventListener('click', () => playstoreSearchBar.classList.toggle('visible'));
    booksSearchBtn?.addEventListener('click', () => booksSearchBar.classList.toggle('visible'));
    
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.side-nav') && !e.target.closest('.menu-btn')) {
        sideNav.classList.remove('visible');
      }
      if (!e.target.closest('.search-bar') && !e.target.closest('#search-btn')) {
        searchBar.classList.remove('visible');
      }
      if (!e.target.closest('.playstore-search') && !e.target.closest('#playstore-search-btn')) {
        playstoreSearchBar.classList.remove('visible');
      }
      if (!e.target.closest('.books-search') && !e.target.closest('#books-search-btn')) {
        booksSearchBar.classList.remove('visible');
      }
    });
  }

  setupDarkMode() {
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    document.body.classList.toggle('light-mode', !this.isDarkMode);
  }

  loadUserState() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('youtube_access_token');
    if (user) this.currentUser = JSON.parse(user);
    if (token) {
      this.youtubeAccessToken = token;
      this.fetchYouTubeChannelInfo();
    }
  }

  loadSearchHistory() {
    const searchHistoryList = document.getElementById('search-history-list');
    if (!searchHistoryList) return;
    
    searchHistoryList.innerHTML = this.searchHistory.map(item => `
      <div class="search-history-item" onclick="window.edirearApp.searchVideos('${item.replace(/'/g, "\\'")}')">${item}</div>
    `).join('');
  }

  addToSearchHistory(query) {
    if (!query.trim()) return;
    
    this.searchHistory = this.searchHistory.filter(item => item.toLowerCase() !== query.toLowerCase());
    this.searchHistory.unshift(query);
    
    if (this.searchHistory.length > 10) {
      this.searchHistory = this.searchHistory.slice(0, 10);
    }
    
    localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    this.loadSearchHistory();
  }

  setupEventListeners() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = item.getAttribute('data-page');
        this.showPage(pageId);
        document.querySelector('.side-nav')?.classList.remove('visible');
      });
    });

    document.getElementById('dark-mode')?.addEventListener('click', () => this.toggleDarkMode());
    document.getElementById('ai-assistant')?.addEventListener('click', () => this.showPage('ai'));
    
    document.querySelectorAll('.back-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const currentPage = document.querySelector('.page.active')?.id.replace('-page', '');
        if (currentPage === 'checkout') this.showPage('shop');
        else if (currentPage === 'ai') this.showPage('home');
        else if (currentPage === 'search') this.showPage('home');
        else if (currentPage === 'playstore') this.showPage('home');
        else if (currentPage === 'books') this.showPage('home');
        else this.showPage('home');
      });
    });

    document.getElementById('connect-channel')?.addEventListener('click', () => this.connectYouTubeChannel());
    document.getElementById('cart-indicator')?.addEventListener('click', () => this.showPage('checkout'));
    
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const category = btn.getAttribute('data-category');
        if (document.getElementById('shop-page')?.classList.contains('active')) {
          this.searchProducts('', category);
        } else {
          window.videoManager.fetchVideosByCategory(category);
        }
      });
    });

    document.getElementById('shop-search-btn')?.addEventListener('click', () => {
      const query = document.getElementById('shop-search-input').value.trim();
      const category = document.querySelector('.category-btn.active')?.getAttribute('data-category') || 'all';
      this.searchProducts(query, category);
    });

    document.getElementById('shop-search-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = document.getElementById('shop-search-input').value.trim();
        const category = document.querySelector('.category-btn.active')?.getAttribute('data-category') || 'all';
        this.searchProducts(query, category);
      }
    });

    document.getElementById('images-search-btn')?.addEventListener('click', () => {
      const query = document.getElementById('images-search-input').value.trim();
      if (query) this.searchImages(query);
    });

    document.getElementById('images-search-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = document.getElementById('images-search-input').value.trim();
        if (query) this.searchImages(query);
      }
    });

    document.getElementById('checkout-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitOrder();
    });

    document.querySelector('.continue-shopping-btn')?.addEventListener('click', () => {
      document.getElementById('order-confirmation-modal').style.display = 'none';
      this.showPage('shop');
    });
    
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
      });
    });
    
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
      }
    });

    document.getElementById('monetize-channel')?.addEventListener('click', () => this.showMonetizationModal());
    document.getElementById('enable-monetization-btn')?.addEventListener('click', () => this.showMonetizationModal());
    document.getElementById('submit-monetization')?.addEventListener('click', () => this.submitMonetizationRequest());
    document.getElementById('save-monetization')?.addEventListener('click', () => this.saveMonetizationSettings());
    document.getElementById('enable-monetization')?.addEventListener('change', (e) => {
      document.getElementById('monetization-details').style.display = e.target.checked ? 'block' : 'none';
    });

    document.getElementById('withdraw-earnings')?.addEventListener('click', () => this.showWithdrawalModal());
    document.getElementById('submit-withdrawal')?.addEventListener('click', () => this.submitWithdrawalRequest());
    document.getElementById('edit-bank-details')?.addEventListener('click', () => {
      document.getElementById('withdrawal-modal').style.display = 'none';
      this.showPage('you');
      document.querySelector('.tab-btn[data-tab="bank"]').click();
    });
    document.getElementById('save-bank-details')?.addEventListener('click', () => this.saveBankDetails());

    document.getElementById('subscribe-premium')?.addEventListener('click', () => this.showPremiumModal());
    document.getElementById('close-book-reader')?.addEventListener('click', () => {
      document.getElementById('book-reader-modal').style.display = 'none';
      document.getElementById('book-reader-frame').src = '';
    });
  }

  setupPayPal() {
    if (typeof paypal !== 'undefined') {
      paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              description: 'Edirear Premium Subscription',
              amount: {
                value: '2.00'
              }
            }]
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then(details => {
            this.handlePremiumPaymentSuccess(details);
          });
        },
        onError: (err) => {
          this.handlePremiumPaymentError(err);
        }
      }).render('#paypal-button-container');
    }
  }

  handlePremiumPaymentSuccess(details) {
    console.log('Payment completed:', details);
    this.isPremiumUser = true;
    localStorage.setItem('isPremiumUser', 'true');
    document.getElementById('premium-status').textContent = 'Payment successful! Your account has been upgraded to Premium.';
    document.getElementById('premium-status').className = 'success';
    document.getElementById('premium-status').style.display = 'block';
    this.updatePremiumUI();
    this.removeAllAds();
    
    const emailContent = `
      New Premium Subscription:
      User: ${this.currentUser?.name || 'Unknown'}
      Email: ${this.currentUser?.email || 'Unknown'}
      Payment ID: ${details.id}
      Amount: $2.00
      Status: ${details.status}
    `;
    console.log('Email would be sent to:', API_KEYS.RECIPIENT_EMAIL);
    console.log('Email content:', emailContent);
  }

  removeAllAds() {
    document.querySelectorAll('.ad-container').forEach(ad => ad.remove());
    document.querySelectorAll('script[src*="adsterra"], script[src*="googlesyndication"]').forEach(script => script.remove());
  }

  handlePremiumPaymentError(err) {
    console.error('Payment error:', err);
    document.getElementById('premium-status').textContent = 'Payment failed. Please try again.';
    document.getElementById('premium-status').className = 'error';
    document.getElementById('premium-status').style.display = 'block';
  }

  showPremiumModal() {
    const premiumModal = document.getElementById('premium-modal');
    if (!premiumModal) return;
    
    premiumModal.style.display = 'block';
    
    if (this.isPremiumUser) {
      document.getElementById('paypal-button-container').style.display = 'none';
      document.getElementById('premium-status').textContent = 'You already have a Premium subscription!';
      document.getElementById('premium-status').className = 'success';
      document.getElementById('premium-status').style.display = 'block';
    } else {
      document.getElementById('paypal-button-container').style.display = 'block';
      document.getElementById('premium-status').style.display = 'none';
    }
  }

  updatePremiumUI() {
    const subscribeBtn = document.getElementById('subscribe-premium');
    if (!subscribeBtn) return;
    
    if (this.isPremiumUser) {
      subscribeBtn.textContent = 'Premium Member';
      subscribeBtn.style.backgroundColor = 'var(--premium-gold)';
      subscribeBtn.disabled = true;
    } else {
      subscribeBtn.textContent = 'Subscribe Premium ($2/month)';
      subscribeBtn.style.backgroundColor = 'var(--premium-gold)';
      subscribeBtn.disabled = false;
    }
  }

  initializeAuth() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: API_KEYS.GOOGLE_CLIENT_ID,
        callback: this.handleGoogleLogin.bind(this),
        scope: 'profile email https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.channel-memberships.creator https://www.googleapis.com/auth/youtube.upload'
      });
      
      google.accounts.id.renderButton(
        document.getElementById('google-signin'), 
        { 
          theme: this.isDarkMode ? 'filled_black' : 'outline', 
          size: 'large',
          type: 'standard',
          text: 'continue_with',
          shape: 'pill'
        }
      );
    }
  }

  async handleGoogleLogin(response) {
    try {
      const authResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `code=${response.code}&client_id=${API_KEYS.GOOGLE_CLIENT_ID}&redirect_uri=postmessage&grant_type=authorization_code`
      });
      
      if (!authResponse.ok) throw new Error('Authentication failed');
      
      const tokenData = await authResponse.json();
      this.youtubeAccessToken = tokenData.access_token;
      localStorage.setItem('youtube_access_token', this.youtubeAccessToken);
      
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {'Authorization': `Bearer ${tokenData.access_token}`}
      });
      
      const userInfo = await userInfoResponse.json();
      this.currentUser = userInfo;
      localStorage.setItem('user', JSON.stringify(userInfo));
      this.updateProfileUI();
      this.fetchYouTubeChannelInfo();
      
      this.fetchUserVideos();
      this.fetchUserPlaylists();
      this.fetchUserSubscriptions();
      this.fetchUserHistory();
      this.fetchUserLikedVideos();
      this.updatePremiumUI();
    } catch (error) {
      console.error('Error during Google login:', error);
      alert('Failed to sign in. Please try again.');
    }
  }

  async fetchYouTubeChannelInfo() {
    if (!this.youtubeAccessToken) return;
    
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true&key=${API_KEYS.YOUTUBE_API_KEY}`, {
        headers: {'Authorization': `Bearer ${this.youtubeAccessToken}`}
      });
      
      if (!response.ok) throw new Error('Failed to fetch channel info');
      
      const data = await response.json();
      if (data.items?.length > 0) {
        this.currentChannel = data.items[0];
        this.displayChannelInfo(this.currentChannel);
        this.fetchUserVideos();
        this.fetchUserPlaylists();
        this.fetchUserSubscriptions();
        this.fetchUserHistory();
        this.fetchUserLikedVideos();
      }
    } catch (error) {
      console.error('Error fetching YouTube channel info:', error);
    }
  }

  async fetchUserVideos() {
    if (!this.youtubeAccessToken) return;
    
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&forMine=true&maxResults=50&key=${API_KEYS.YOUTUBE_API_KEY}`, {
        headers: {'Authorization': `Bearer ${this.youtubeAccessToken}`}
      });
      
      if (!response.ok) throw new Error('Failed to fetch user videos');
      
      const data = await response.json();
      if (data.items?.length > 0) {
        const videoIds = data.items.map(item => item.id.videoId).join(',');
        const videosResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${API_KEYS.YOUTUBE_API_KEY}`);
        const videosData = await videosResponse.json();
        
        if (videosData.items?.length > 0) {
          window.videoManager.displayVideos(videosData.items, '#user-videos');
          
          if (this.monetizationStatus.enabled) {
            const totalViews = videosData.items.reduce((sum, video) => sum + parseInt(video.statistics.viewCount), 0);
            this.monetizationStatus.totalViews = totalViews;
            localStorage.setItem('monetizationStatus', JSON.stringify(this.monetizationStatus));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user videos:', error);
    }
  }

  async fetchUserPlaylists() {
    if (!this.youtubeAccessToken) return;
    
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50&key=${API_KEYS.YOUTUBE_API_KEY}`, {
        headers: {'Authorization': `Bearer ${this.youtubeAccessToken}`}
      });
      
      if (!response.ok) throw new Error('Failed to fetch playlists');
      
      const data = await response.json();
      if (data.items?.length > 0) this.displayPlaylists(data.items);
    } catch (error) {
      console.error('Error fetching user playlists:', error);
    }
  }

  async fetchUserSubscriptions() {
    if (!this.youtubeAccessToken) return;
    
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=50&key=${API_KEYS.YOUTUBE_API_KEY}`, {
        headers: {'Authorization': `Bearer ${this.youtubeAccessToken}`}
      });
      
      if (!response.ok) throw new Error('Failed to fetch subscriptions');
      
      const data = await response.json();
      if (data.items?.length > 0) {
        this.subscriptions = data.items;
        localStorage.setItem('subscriptions', JSON.stringify(this.subscriptions));
        this.displaySubscriptions(data.items);
      }
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
    }
  }

  async fetchUserHistory() {
    if (!this.youtubeAccessToken) return;
    
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/activities?part=snippet,contentDetails&mine=true&maxResults=50&key=${API_KEYS.YOUTUBE_API_KEY}`, {
        headers: {'Authorization': `Bearer ${this.youtubeAccessToken}`}
      });
      
      if (!response.ok) throw new Error('Failed to fetch history');
      
      const data = await response.json();
      if (data.items?.length > 0) {
        const videoIds = data.items
          .filter(item => item.contentDetails.upload || item.contentDetails.like || item.contentDetails.favorite)
          .map(item => item.contentDetails.upload?.videoId || 
                      item.contentDetails.like?.resourceId?.videoId || 
                      item.contentDetails.favorite?.resourceId?.videoId)
          .filter(id => id);
        
        if (videoIds.length > 0) {
          const videosResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(',')}&key=${API_KEYS.YOUTUBE_API_KEY}`);
          const videosData = await videosResponse.json();
          window.videoManager.displayVideos(videosData.items, '#history-videos');
        }
      }
    } catch (error) {
      console.error('Error fetching user history:', error);
    }
  }

  async fetchUserLikedVideos() {
    if (!this.youtubeAccessToken) return;
    
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&myRating=like&maxResults=50&key=${API_KEYS.YOUTUBE_API_KEY}`, {
        headers: {'Authorization': `Bearer ${this.youtubeAccessToken}`}
      });
      
      if (!response.ok) throw new Error('Failed to fetch liked videos');
      
      const data = await response.json();
      if (data.items?.length > 0) window.videoManager.displayVideos(data.items, '#liked-videos');
    } catch (error) {
      console.error('Error fetching liked videos:', error);
    }
  }

  displayPlaylists(playlists) {
    const container = document.getElementById('playlists-feed');
    if (!container) return;
    
    container.innerHTML = playlists.map(playlist => `
      <div class="playlist-card">
        <img src="${playlist.snippet.thumbnails?.medium?.url || 'https://via.placeholder.com/320/180'}" alt="${playlist.snippet.title}" class="playlist-thumbnail">
        <div class="playlist-info">
          <h3 class="playlist-title">${playlist.snippet.title}</h3>
          <p class="playlist-stats">${playlist.contentDetails.itemCount} videos</p>
        </div>
      </div>
    `).join('');
  }

  displaySubscriptions(subscriptions) {
    const container = document.getElementById('channel-subscriptions');
    if (!container) return;
    
    container.innerHTML = subscriptions.map(sub => `
      <div class="channel-card" data-channel-id="${sub.snippet.resourceId.channelId}">
        <img src="${sub.snippet.thumbnails?.medium?.url || 'https://via.placeholder.com/88'}" alt="${sub.snippet.title}" class="channel-thumbnail">
        <div class="channel-info">
          <h3 class="channel-title">${sub.snippet.title}</h3>
          <p class="channel-stats">Subscribed</p>
        </div>
        <button class="subscribe-btn">Subscribed</button>
      </div>
    `).join('');
  }

  async connectYouTubeChannel() {
    const channelIdentifier = document.getElementById('channel-id').value.trim();
    if (!channelIdentifier) {
      this.showChannelStatus('Please enter a valid YouTube channel identifier', 'error');
      return;
    }

    try {
      let channelId;
      if (channelIdentifier.startsWith('@')) {
        const handle = channelIdentifier.substring(1);
        const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${handle}&key=${API_KEYS.YOUTUBE_API_KEY}`);
        const searchData = await searchResponse.json();
        if (!searchData.items?.length) throw new Error('Channel not found');
        channelId = searchData.items[0].snippet.channelId;
      } else if (channelIdentifier.includes('youtube.com')) {
        const url = new URL(channelIdentifier.startsWith('http') ? channelIdentifier : `https://${channelIdentifier}`);
        const pathParts = url.pathname.split('/');
        const handlePart = pathParts.find(part => part.startsWith('@'));
        if (handlePart) {
          const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${handlePart.substring(1)}&key=${API_KEYS.YOUTUBE_API_KEY}`);
          const searchData = await searchResponse.json();
          if (!searchData.items?.length) throw new Error('Channel not found');
          channelId = searchData.items[0].snippet.channelId;
        } else {
          const channelIdPart = pathParts.find(part => part.startsWith('UC'));
          if (channelIdPart) {
            channelId = channelIdPart;
          } else {
            throw new Error('Invalid YouTube URL');
          }
        }
      } else if (channelIdentifier.includes('@')) {
        throw new Error('Email lookup requires additional permissions');
      } else {
        channelId = channelIdentifier;
      }

      const channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${API_KEYS.YOUTUBE_API_KEY}`);
      const channelData = await channelResponse.json();
      
      if (channelData.items?.length > 0) {
        this.currentChannel = channelData.items[0];
        this.displayChannelInfo(this.currentChannel);
        localStorage.setItem('youtube_channel_id', channelId);
        
        const videosResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=50&order=date&type=video&key=${API_KEYS.YOUTUBE_API_KEY}`);
        const videosData = await videosResponse.json();
        
        if (videosData.items?.length > 0) {
          const videoIds = videosData.items.map(item => item.id.videoId).join(',');
          const videosDetailsResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${API_KEYS.YOUTUBE_API_KEY}`);
          const videosDetailsData = await videosDetailsResponse.json();
          window.videoManager.displayVideos(videosDetailsData.items, '#user-videos');
        }
        
        if (this.youtubeAccessToken) {
          this.fetchUserHistory();
          this.fetchUserLikedVideos();
        }
        
        this.showChannelStatus('Channel connected successfully!', 'success');
      } else {
        throw new Error('Channel not found');
      }
    } catch (error) {
      console.error('Error connecting YouTube channel:', error);
      this.showChannelStatus(error.message || 'Failed to connect channel', 'error');
    }
  }

  showChannelStatus(message, type) {
    const statusElement = document.getElementById('channel-status');
    if (!statusElement) return;
    
    statusElement.textContent = message;
    statusElement.className = type;
    statusElement.style.display = 'block';
  }

  updateProfileUI() {
    if (!this.currentUser) return;
    
    const profileName = document.getElementById('profile-name');
    const profilePic = document.getElementById('profile-pic');
    
    if (profileName) profileName.textContent = this.currentUser.name;
    if (profilePic) profilePic.src = this.currentUser.picture;
  }

  displayChannelInfo(channel) {
    if (!channel) return;
    
    const subscriberCount = document.getElementById('subscriber-count');
    const videoCount = document.getElementById('video-count');
    const viewCount = document.getElementById('view-count');
    const subCount = document.getElementById('sub-count');
    
    if (subscriberCount) subscriberCount.textContent = `${this.formatNumber(channel.statistics.subscriberCount)} subscribers`;
    if (videoCount) videoCount.textContent = this.formatNumber(channel.statistics.videoCount);
    if (viewCount) viewCount.textContent = this.formatNumber(channel.statistics.viewCount);
    if (subCount) subCount.textContent = this.formatNumber(channel.statistics.subscriberCount);
    
    if (document.getElementById('analytics-tab')?.classList.contains('active')) {
      const totalViews = document.getElementById('total-views');
      const analyticsSubs = document.getElementById('analytics-subs');
      
      if (totalViews) totalViews.textContent = this.formatNumber(channel.statistics.viewCount);
      if (analyticsSubs) analyticsSubs.textContent = this.formatNumber(channel.statistics.subscriberCount);
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode);
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    document.body.classList.toggle('light-mode', !this.isDarkMode);
    
    if (typeof google !== 'undefined') {
      google.accounts.id.renderButton(
        document.getElementById('google-signin'), 
        { 
          theme: this.isDarkMode ? 'filled_black' : 'outline', 
          size: 'large',
          type: 'standard',
          text: 'continue_with',
          shape: 'pill'
        }
      );
    }
  }

  showPage(pageId) {
    if (!pageId) return;
    
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(`${pageId}-page`)?.classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll(`.nav-item[data-page="${pageId}"]`).forEach(item => item.classList.add('active'));
    
    switch (pageId) {
      case 'home':
        window.videoManager.fetchTrendingVideos();
        break;
      case 'shorts':
        window.videoManager.fetchShorts();
        break;
      case 'you':
        if (this.currentUser) this.fetchYouTubeChannelInfo();
        this.updatePremiumUI();
        break;
      case 'shop':
        this.searchProducts();
        break;
      case 'images':
        document.getElementById('images-grid').innerHTML = '<div class="loading">Search for images to display results</div>';
        break;
      case 'subscriptions':
        this.fetchUserSubscriptions();
        break;
      case 'monetization':
        this.updateMonetizationUI();
        break;
      case 'analytics':
        this.initializeAnalytics();
        break;
      case 'bank':
        this.updateBankDetailsUI();
        break;
      case 'playstore':
        document.getElementById('playstore-grid').innerHTML = '<div class="loading">Search for apps to display results</div>';
        break;
      case 'books':
        document.getElementById('books-grid').innerHTML = '<div class="loading">Search for books to display results</div>';
        break;
      case 'weather':
        window.weatherApp.fetchWeatherData('New York');
        break;
      case 'ai':
        document.getElementById('chat-messages').innerHTML = '';
        break;
    }
  }

  async searchProducts(query = '', category = 'all') {
    try {
      const shopGrid = document.getElementById('shop-grid');
      if (!shopGrid) return;
      
      shopGrid.innerHTML = '<div class="loading">Loading products...</div>';
      
      try {
        const response = await fetch(`https://www.googleapis.com/shopping/search/v1/public/products?key=${API_KEYS.SHOPPING_API_KEY}&country=US&q=${encodeURIComponent(query)}&maxResults=20`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.items?.length > 0) {
            const products = data.items.map(item => ({
              id: item.product.id,
              title: item.product.title,
              price: item.product.inventories?.[0]?.price || 0,
              image: item.product.images?.[0]?.link || 'https://via.placeholder.com/200',
              rating: Math.random() * 2 + 3,
              reviews: Math.floor(Math.random() * 1000),
              category: category,
              description: item.product.description || `This is a high-quality ${item.product.title}.`
            }));
            this.displayProducts(products);
            return;
          }
        }
      } catch (error) {
        console.log('Failed to fetch from Google Shopping API, using mock data:', error);
      }
      
      const mockData = await this.generateMockData(query, category);
      this.displayProducts(mockData.products);
    } catch (error) {
      console.error('Error searching products:', error);
      document.getElementById('shop-grid').innerHTML = '<div class="error">Error loading products. Please try again.</div>';
    }
  }

  async searchImages(query) {
    try {
      const imagesGrid = document.getElementById('images-grid');
      if (!imagesGrid) return;
      
      imagesGrid.innerHTML = '<div class="loading">Searching images...</div>';
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&client_id=${API_KEYS.UNSPLASH_API_KEY}&per_page=20`);
      
      if (!response.ok) throw new Error('Failed to fetch images');
      
      const data = await response.json();
      if (data.results?.length > 0) {
        this.displayImages(data.results);
      } else {
        imagesGrid.innerHTML = '<div class="error">No images found. Try a different search term.</div>';
      }
    } catch (error) {
      console.error('Error searching images:', error);
      document.getElementById('images-grid').innerHTML = '<div class="error">Error loading images. Please try again.</div>';
    }
  }

  displayImages(images) {
    const imagesGrid = document.getElementById('images-grid');
    if (!imagesGrid) return;
    
    imagesGrid.innerHTML = images.map(image => `
      <div class="image-card">
        <img src="${image.urls.regular}" alt="${image.alt_description || 'Unsplash image'}">
        <button class="download-button" onclick="window.edirearApp.downloadImage('${image.urls.full}', '${image.id}')">Download</button>
      </div>
    `).join('');
  }

  async downloadImage(imageUrl, imageId) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to download image');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${imageId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  }

  async generateMockData(query, category) {
    const categories = {
      'all': 'All',
      'electronics': 'Electronics',
      'home': 'Home & Kitchen',
      'clothing': 'Clothing',
      'books': 'Books'
    };
    
    const categoryName = categories[category] || 'All';
    const searchTerm = query || categoryName;
    
    let apiProducts = [];
    try {
      const response = await fetch('https://fakestoreapi.com/products');
      if (response.ok) apiProducts = await response.json();
    } catch (error) {
      console.error('Error fetching product images:', error);
    }
    
    const products = [];
    const count = category === 'all' ? 20 : 12;
    
    for (let i = 1; i <= count; i++) {
      const price = (Math.random() * 100 + 10).toFixed(2);
      const rating = (Math.random() * 2 + 3).toFixed(1);
      const apiProduct = apiProducts[i % apiProducts.length] || {};
      
      products.push({
        id: i,
        title: `${searchTerm} Product ${i}`,
        price: price,
        image: apiProduct.image || `https://via.placeholder.com/200?text=${searchTerm}+${i}`,
        rating: rating,
        reviews: Math.floor(Math.random() * 1000),
        category: category,
        description: `This is a high-quality ${searchTerm.toLowerCase()} product ${i}. It has many great features.`,
      });
    }
    
    return { products };
  }

  displayProducts(products) {
    const shopGrid = document.getElementById('shop-grid');
    if (!shopGrid) return;
    
    shopGrid.innerHTML = products.length === 0 ? 
      '<div class="no-results">No products found. Try a different search.</div>' : 
      products.map(product => `
        <div class="product-card" onclick="window.edirearApp.showProductDetail(${JSON.stringify(product).replace(/"/g, '&quot;')})">
          <img src="${product.image}" alt="${product.title}" class="product-image">
          <div class="product-info">
            <div class="product-title">${product.title}</div>
            <div class="product-price">$${product.price}</div>
            <div class="product-rating">
              ${this.generateStarRating(product.rating)} (${product.reviews})
            </div>
            <button class="add-to-cart-btn" onclick="event.stopPropagation(); window.edirearApp.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">Add to Cart</button>
          </div>
        </div>
      `).join('');
  }

  showProductDetail(product) {
    const productDetail = document.getElementById('product-detail');
    if (!productDetail) return;
    
    productDetail.innerHTML = `
      <div class="product-detail-image">
        <img src="${product.image}" alt="${product.title}">
      </div>
      <div class="product-detail-info">
        <h1 class="product-detail-title">${product.title}</h1>
        <div class="product-detail-rating">
          ${this.generateStarRating(product.rating)} (${product.reviews} ratings)
        </div>
        <hr>
        <div class="product-detail-price">$${product.price}</div>
        <div class="product-detail-description">
          <p>${product.description}</p>
        </div>
        <button class="add-to-cart-detail" onclick="window.edirearApp.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">Add to Cart</button>
        <button class="buy-now-detail" onclick="window.edirearApp.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')}); document.getElementById('product-modal').style.display='none'; window.edirearApp.showPage('checkout')">Buy Now</button>
      </div>
    `;
    document.getElementById('product-modal').style.display = 'block';
  }

  addToCart(product) {
    const existingItem = this.cart.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({...product, quantity: 1});
    }
    this.updateCart();
    alert(`${product.title} added to cart`);
  }

  updateCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartCount();
    if (document.getElementById('checkout-page')?.classList.contains('active')) {
      this.updateOrderSummary();
    }
  }

  updateCartCount() {
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) cartCount.textContent = totalItems;
  }

  updateOrderSummary() {
    const orderItems = document.getElementById('order-items');
    if (!orderItems) return;
    
    orderItems.innerHTML = '';
    let total = 0;
    
    this.cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      orderItems.innerHTML += `
        <div class="order-item">
          <span>${item.title} (x${item.quantity})</span>
          <span>$${itemTotal.toFixed(2)}</span>
        </div>
      `;
    });
    
    const orderTotal = document.getElementById('order-total');
    if (orderTotal) orderTotal.textContent = total.toFixed(2);
  }

  async submitOrder() {
    const formData = {
      name: document.getElementById('full-name').value,
      email: document.getElementById('email').value,
      items: this.cart,
      total: document.getElementById('order-total').textContent
    };
    
    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const orderIdElement = document.getElementById('order-id');
    if (orderIdElement) orderIdElement.textContent = orderId;
    
    try {
      console.log('Order details:', formData);
      const emailContent = `
        New Order from Edirear Shop:
        Order ID: ${orderId}
        Customer: ${formData.name}
        Email: ${formData.email}
        Items: ${formData.items.map(item => `${item.title} (x${item.quantity}) - $${item.price}`).join('\n')}
        Total: $${formData.total}
      `;
      console.log('Email would be sent to:', API_KEYS.RECIPIENT_EMAIL);
      console.log('Email content:', emailContent);
      
      document.getElementById('order-confirmation-modal').style.display = 'block';
      this.cart = [];
      this.updateCart();
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to place order. Please try again.');
    }
  }

  generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (hasHalfStar) stars += '<i class="fas fa-star-half-alt"></i>';
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
    return stars;
  }

  formatNumber(num) {
    return num ? parseInt(num).toLocaleString() : '0';
  }

  showMonetizationModal() {
    const monetizationModal = document.getElementById('monetization-modal');
    if (!monetizationModal) return;
    
    monetizationModal.style.display = 'block';
    if (this.currentUser?.email) {
      const paymentEmail = document.getElementById('payment-email');
      if (paymentEmail) paymentEmail.value = this.currentUser.email;
    }
  }

  showWithdrawalModal() {
    const withdrawalModal = document.getElementById('withdrawal-modal');
    if (!withdrawalModal) return;
    
    if (!this.monetizationStatus.enabled) {
      alert('Please enable monetization first');
      return;
    }
    
    if (this.monetizationStatus.earnings < 10) {
      alert(`Minimum withdrawal amount is $10. Your current earnings: $${this.monetizationStatus.earnings.toFixed(2)}`);
      return;
    }
    
    withdrawalModal.style.display = 'block';
    const availableBalance = document.getElementById('available-balance');
    if (availableBalance) availableBalance.textContent = this.monetizationStatus.earnings.toFixed(2);
    
    const withdrawAmount = document.getElementById('withdraw-amount');
    if (withdrawAmount) withdrawAmount.value = this.monetizationStatus.earnings.toFixed(2);
    
    if (this.monetizationStatus.bankDetails) {
      document.getElementById('bank-name-preview').textContent = `Bank: ${this.monetizationStatus.bankDetails.bankName}`;
      document.getElementById('account-title-preview').textContent = `Account: ${this.monetizationStatus.bankDetails.accountTitle}`;
      document.getElementById('account-number-preview').textContent = `Account #: ${this.monetizationStatus.bankDetails.accountNumber}`;
      document.getElementById('iban-preview').textContent = `IBAN: ${this.monetizationStatus.bankDetails.iban}`;
    } else {
      document.getElementById('bank-name-preview').textContent = 'Not provided';
      document.getElementById('account-title-preview').textContent = 'Not provided';
      document.getElementById('account-number-preview').textContent = 'Not provided';
      document.getElementById('iban-preview').textContent = 'Not provided';
    }
  }

  async submitMonetizationRequest() {
    const paymentEmail = document.getElementById('payment-email')?.value.trim();
    if (!paymentEmail) {
      alert('Please enter a valid payment email');
      return;
    }

    try {
      this.monetizationStatus = {
        enabled: true,
        adsenseAccount: document.getElementById('adsense-account')?.value.trim() || '',
        paymentEmail: paymentEmail,
        adTypes: ['display', 'overlay', 'skippable'],
        adFrequency: 5,
        earnings: 0,
        adImpressions: [],
        totalViews: 0,
        platformViews: 0,
        platformImpressions: 0,
        bankDetails: this.monetizationStatus.bankDetails
      };
      
      localStorage.setItem('monetizationStatus', JSON.stringify(this.monetizationStatus));
      document.getElementById('monetization-modal').style.display = 'none';
      this.updateMonetizationUI();
      alert('Monetization enabled successfully! Ads will now show on your videos.');
      this.loadAdScripts();
    } catch (error) {
      console.error('Error submitting monetization request:', error);
      alert('Failed to enable monetization. Please try again.');
    }
  }

  saveMonetizationSettings() {
    const adTypes = [];
    document.querySelectorAll('input[name="ad-types"]:checked').forEach(checkbox => {
      adTypes.push(checkbox.value);
    });
    
    this.monetizationStatus.adTypes = adTypes;
    const adFrequency = document.getElementById('ad-frequency');
    this.monetizationStatus.adFrequency = adFrequency ? parseInt(adFrequency.value) || 5 : 5;
    localStorage.setItem('monetizationStatus', JSON.stringify(this.monetizationStatus));
    alert('Monetization settings saved successfully!');
  }

  saveBankDetails() {
    const bankDetails = {
      bankName: document.getElementById('bank-name')?.value.trim() || '',
      accountTitle: document.getElementById('account-title')?.value.trim() || '',
      accountNumber: document.getElementById('account-number')?.value.trim() || '',
      iban: document.getElementById('iban')?.value.trim() || ''
    };
    
    if (!bankDetails.bankName || !bankDetails.accountTitle || !bankDetails.accountNumber || !bankDetails.iban) {
      const statusElement = document.getElementById('bank-details-status');
      if (statusElement) {
        statusElement.textContent = 'Please fill all bank details';
        statusElement.className = 'error';
        statusElement.style.display = 'block';
      }
      return;
    }
    
    this.monetizationStatus.bankDetails = bankDetails;
    localStorage.setItem('monetizationStatus', JSON.stringify(this.monetizationStatus));
    localStorage.setItem('bankDetails', JSON.stringify(bankDetails));
    
    const statusElement = document.getElementById('bank-details-status');
    if (statusElement) {
      statusElement.textContent = 'Bank details saved successfully!';
      statusElement.className = 'success';
      statusElement.style.display = 'block';
    }
    
    if (document.getElementById('withdrawal-modal')?.style.display === 'block') {
      this.showWithdrawalModal();
    }
  }

  submitWithdrawalRequest() {
    const withdrawAmount = document.getElementById('withdraw-amount');
    if (!withdrawAmount) return;
    
    const amount = parseFloat(withdrawAmount.value);
    if (isNaN(amount)) {
      const statusElement = document.getElementById('withdrawal-status');
      if (statusElement) {
        statusElement.textContent = 'Please enter a valid amount';
        statusElement.className = 'error';
        statusElement.style.display = 'block';
      }
      return;
    }
    
    if (amount < 10) {
      const statusElement = document.getElementById('withdrawal-status');
      if (statusElement) {
        statusElement.textContent = 'Minimum withdrawal amount is $10';
        statusElement.className = 'error';
        statusElement.style.display = 'block';
      }
      return;
    }
    
    if (amount > this.monetizationStatus.earnings) {
      const statusElement = document.getElementById('withdrawal-status');
      if (statusElement) {
        statusElement.textContent = `Amount exceeds your available balance of $${this.monetizationStatus.earnings.toFixed(2)}`;
        statusElement.className = 'error';
        statusElement.style.display = 'block';
      }
      return;
    }
    
    if (!this.monetizationStatus.bankDetails) {
      const statusElement = document.getElementById('withdrawal-status');
      if (statusElement) {
        statusElement.textContent = 'Please provide your bank details first';
        statusElement.className = 'error';
        statusElement.style.display = 'block';
      }
      return;
    }
    
    const withdrawalDetails = {
      amount: amount,
      bankDetails: this.monetizationStatus.bankDetails,
      paymentEmail: this.monetizationStatus.paymentEmail,
      date: new Date().toISOString()
    };
    
    console.log('Withdrawal request:', withdrawalDetails);
    
    this.monetizationStatus.earnings -= amount;
    localStorage.setItem('monetizationStatus', JSON.stringify(this.monetizationStatus));
    
    const statusElement = document.getElementById('withdrawal-status');
    if (statusElement) {
      statusElement.textContent = `Withdrawal request for $${amount.toFixed(2)} submitted successfully!`;
      statusElement.className = 'success';
      statusElement.style.display = 'block';
    }
    
    this.updateMonetizationUI();
    
    const emailContent = `
      New Withdrawal Request:
      Amount: $${amount.toFixed(2)}
      Payment Email: ${this.monetizationStatus.paymentEmail}
      Bank Details:
      Bank: ${this.monetizationStatus.bankDetails.bankName}
      Account: ${this.monetizationStatus.bankDetails.accountTitle}
      Account #: ${this.monetizationStatus.bankDetails.accountNumber}
      IBAN: ${this.monetizationStatus.bankDetails.iban}
    `;
    console.log('Email would be sent to:', API_KEYS.RECIPIENT_EMAIL);
    console.log('Email content:', emailContent);
  }

  updateMonetizationUI() {
    const monetizationStatusText = document.getElementById('monetization-status-text');
    const enableMonetizationBtn = document.getElementById('enable-monetization-btn');
    const monetizationDetails = document.querySelector('.monetization-details');
    
    if (!monetizationStatusText || !enableMonetizationBtn || !monetizationDetails) return;
    
    if (this.monetizationStatus.enabled) {
      monetizationStatusText.textContent = 'Status: Monetization Enabled';
      monetizationStatusText.style.color = 'var(--monetization-green)';
      enableMonetizationBtn.style.display = 'none';
      monetizationDetails.style.display = 'block';
      
      document.querySelectorAll('input[name="ad-types"]').forEach(checkbox => {
        checkbox.checked = this.monetizationStatus.adTypes.includes(checkbox.value);
      });
      
      document.getElementById('ad-frequency').value = this.monetizationStatus.adFrequency;
    } else {
      monetizationStatusText.textContent = 'Status: Not Monetized';
      monetizationStatusText.style.color = 'var(--monetization-red)';
      enableMonetizationBtn.style.display = 'block';
      monetizationDetails.style.display = 'none';
    }
    
    const earningsCount = document.getElementById('earnings-count');
    if (earningsCount) earningsCount.textContent = `$${this.monetizationStatus.earnings.toFixed(2)}`;
  }

  updateBankDetailsUI() {
    if (!this.monetizationStatus.bankDetails) return;
    
    document.getElementById('bank-name').value = this.monetizationStatus.bankDetails.bankName;
    document.getElementById('account-title').value = this.monetizationStatus.bankDetails.accountTitle;
    document.getElementById('account-number').value = this.monetizationStatus.bankDetails.accountNumber;
    document.getElementById('iban').value = this.monetizationStatus.bankDetails.iban;
  }

  initializeAnalytics() {
    if (!this.monetizationStatus.enabled) return;
    
    if (this.currentChannel) {
      const totalViews = document.getElementById('total-views');
      const analyticsSubs = document.getElementById('analytics-subs');
      
      if (totalViews) totalViews.textContent = this.formatNumber(this.currentChannel.statistics.viewCount);
      if (analyticsSubs) analyticsSubs.textContent = this.formatNumber(this.currentChannel.statistics.subscriberCount);
    }
    
    const estimatedEarnings = document.getElementById('estimated-earnings');
    if (estimatedEarnings) estimatedEarnings.textContent = `$${this.monetizationStatus.earnings.toFixed(2)}`;
    
    const watchTime = document.getElementById('watch-time');
    if (watchTime) watchTime.textContent = `${Math.floor(Math.random() * 1000) + 100} hours`;
    
    this.generateAnalyticsCharts();
    this.generateAdPerformanceData();
  }

  generateAnalyticsCharts() {
    const viewsCtx = document.getElementById('views-chart')?.getContext('2d');
    const earningsCtx = document.getElementById('earnings-chart')?.getContext('2d');
    
    if (viewsCtx) {
      new Chart(viewsCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [{
            label: 'Platform Views',
            data: Array.from({length: 7}, () => Math.floor(Math.random() * 10000) + 1000),
            borderColor: 'rgba(255, 0, 80, 1)',
            backgroundColor: 'rgba(255, 0, 80, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Monthly Platform Views' }
          }
        }
      });
    }
    
    if (earningsCtx) {
      new Chart(earningsCtx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [{
            label: 'Earnings ($)',
            data: Array.from({length: 7}, () => Math.floor(Math.random() * 200) + 50),
            backgroundColor: 'rgba(0, 200, 83, 0.7)',
            borderColor: 'rgba(0, 200, 83, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Monthly Earnings' }
          }
        }
      });
    }
  }

  generateAdPerformanceData() {
    const adPerformanceData = document.getElementById('ad-performance-data');
    if (!adPerformanceData) return;
    
    adPerformanceData.innerHTML = '';
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const impressions = Math.floor(Math.random() * 10000) + 1000;
      const clicks = Math.floor(impressions * (Math.random() * 0.05));
      const revenue = (impressions * 0.0005).toFixed(2);
      
      const dateStr = date.toISOString().split('T')[0];
      if (!this.monetizationStatus.adImpressions.some(imp => imp.date === dateStr)) {
        this.monetizationStatus.adImpressions.push({
          date: dateStr,
          impressions: impressions,
          clicks: clicks,
          revenue: parseFloat(revenue)
        });
        this.monetizationStatus.earnings += parseFloat(revenue);
        this.monetizationStatus.platformImpressions += impressions;
      }
      
      adPerformanceData.innerHTML += `
        <tr>
          <td>${date.toLocaleDateString()}</td>
          <td>${impressions.toLocaleString()}</td>
          <td>${clicks.toLocaleString()}</td>
          <td>$${revenue}</td>
        </tr>
      `;
    }
    
    localStorage.setItem('monetizationStatus', JSON.stringify(this.monetizationStatus));
    
    const estimatedEarnings = document.getElementById('estimated-earnings');
    if (estimatedEarnings) estimatedEarnings.textContent = `$${this.monetizationStatus.earnings.toFixed(2)}`;
    
    const earningsCount = document.getElementById('earnings-count');
    if (earningsCount) earningsCount.textContent = `$${this.monetizationStatus.earnings.toFixed(2)}`;
  }

  recordAdImpression(videoId) {
    if (!this.monetizationStatus.enabled || this.isPremiumUser) return;
    
    const today = new Date().toISOString().split('T')[0];
    const existingImpression = this.monetizationStatus.adImpressions.find(imp => imp.date === today);
    const revenue = 0.5;
    
    if (existingImpression) {
      existingImpression.impressions += 1000;
      existingImpression.revenue += revenue;
    } else {
      this.monetizationStatus.adImpressions.push({
        date: today,
        impressions: 1000,
        clicks: Math.floor(Math.random() * 50),
        revenue: revenue
      });
    }
    
    this.monetizationStatus.earnings += revenue;
    this.monetizationStatus.platformImpressions += 1000;
    this.monetizationStatus.platformViews += 1000;
    localStorage.setItem('monetizationStatus', JSON.stringify(this.monetizationStatus));
    
    if (document.getElementById('analytics-tab')?.classList.contains('active')) {
      const estimatedEarnings = document.getElementById('estimated-earnings');
      if (estimatedEarnings) estimatedEarnings.textContent = `$${this.monetizationStatus.earnings.toFixed(2)}`;
    }
    
    if (this.monetizationStatus.earnings >= 100) {
      this.sendEarningsEmail();
    }
  }

  sendEarningsEmail() {
    const emailContent = `
      Earnings Notification:
      Channel: ${this.currentChannel?.snippet?.title || 'Unknown'}
      Current Earnings: $${this.monetizationStatus.earnings.toFixed(2)}
      Platform Views: ${this.monetizationStatus.platformViews.toLocaleString()}
      Platform Impressions: ${this.monetizationStatus.platformImpressions.toLocaleString()}
      Ad Performance:
      ${this.monetizationStatus.adImpressions.map(imp => `
        ${imp.date}: ${imp.impressions.toLocaleString()} impressions, $${imp.revenue.toFixed(2)} revenue
      `).join('')}
    `;
    
    console.log('Email would be sent to:', API_KEYS.RECIPIENT_EMAIL);
    console.log('Email content:', emailContent);
  }
}

// Video Manager Class
class VideoManager {
  constructor() {
    this.videos = [];
    this.shorts = [];
    this.suggestedVideos = [];
    this.currentShortIndex = 0;
    this.subscribedChannels = JSON.parse(localStorage.getItem('subscribedChannels')) || [];
    this.init();
  }

  init() {
    this.setupVideoUpload();
    this.setupModal();
    this.setupTabs();
    this.setupSearch();
    this.fetchTrendingVideos();
    this.fetchShorts();
    this.setupSubscribeButtons();
    this.setupMiniPlayer();
  }

  async fetchTrendingVideos() {
    try {
      const videoFeed = document.getElementById('video-feed');
      if (!videoFeed) return;
      
      videoFeed.innerHTML = '<div class="loading">Loading trending videos...</div>';
      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=50&key=${API_KEYS.YOUTUBE_API_KEY}`);
      
      if (!response.ok) throw new Error('Failed to fetch trending videos');
      // Continue from where it left off...

      const data = await response.json();
      this.videos = data.items;
      this.displayVideos(this.videos, '#video-feed');
    } catch (error) {
      console.error('Error fetching trending videos:', error);
      this.videos = this.generateMockVideos(50);
      this.displayVideos(this.videos, '#video-feed');
    }
  }

  async fetchShorts() {
    try {
      const shortsFeed = document.getElementById('shorts-feed');
      if (!shortsFeed) return;
      
      shortsFeed.innerHTML = '<div class="loading">Loading shorts...</div>';
      const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=short&maxResults=50&key=${API_KEYS.YOUTUBE_API_KEY}`);
      
      if (!response.ok) throw new Error('Failed to fetch shorts');
      
      const data = await response.json();
      this.shorts = data.items;
      this.displayShorts(this.shorts);
    } catch (error) {
      console.error('Error fetching shorts:', error);
      this.shorts = this.generateMockShorts(20);
      this.displayShorts(this.shorts);
    }
  }

  async fetchVideosByCategory(category) {
    try {
      const videoFeed = document.getElementById('video-feed');
      if (!videoFeed) return;
      
      videoFeed.innerHTML = '<div class="loading">Loading videos...</div>';
      
      // YouTube doesn't have direct category search, so we'll use query
      const query = category === 'all' ? '' : category;
      const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&maxResults=50&key=${API_KEYS.YOUTUBE_API_KEY}`);
      
      if (!response.ok) throw new Error('Failed to fetch videos by category');
      
      const data = await response.json();
      if (data.items?.length > 0) {
        const videoIds = data.items.map(item => item.id.videoId).join(',');
        const videosResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${API_KEYS.YOUTUBE_API_KEY}`);
        const videosData = await videosResponse.json();
        this.displayVideos(videosData.items, '#video-feed');
      } else {
        videoFeed.innerHTML = '<div class="no-results">No videos found in this category.</div>';
      }
    } catch (error) {
      console.error('Error fetching videos by category:', error);
      videoFeed.innerHTML = '<div class="error">Failed to load videos. Please try again.</div>';
    }
  }

  displayVideos(videos, containerId) {
    const container = document.querySelector(containerId);
    if (!container) return;
    
    container.innerHTML = videos.map(video => this.createVideoCard(video)).join('');
    
    // Insert ads after every 3 videos
    const videoCards = container.querySelectorAll('.video-card');
    videoCards.forEach((card, index) => {
      if ((index + 1) % 3 === 0) {
        this.insertAdAfterElement(card);
      }
      card.addEventListener('click', () => {
        const videoId = card.getAttribute('data-video-id');
        this.openVideoModal(videoId);
      });
    });
  }

  insertAdAfterElement(element) {
    if (window.edirearApp.isPremiumUser) return;
    
    const adContainer = document.createElement('div');
    adContainer.className = 'ad-container';
    
    if (window.edirearApp.monetizationStatus.enabled) {
      adContainer.innerHTML = `
        <div class="ad-content">
          <div class="ad-wrapper">
            <script type="text/javascript">
              atOptions = { 
                'key': '${API_KEYS.ADSTERRA_AD_KEY}', 
                'format': 'iframe', 
                'height': 250, 
                'width': 300, 
                'params': {} 
              };
            </script>
            <script type="text/javascript" src="//www.highperformanceformat.com/${API_KEYS.ADSTERRA_AD_KEY}/invoke.js"></script>
          </div>
        </div>
      `;
      window.edirearApp.recordAdImpression('ad-' + Date.now());
    } else {
      adContainer.innerHTML = `
        <div class="ad-content">
          <div class="ad-wrapper">
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-6957556426963359"
                 data-ad-slot="6163876640"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <script>
                 (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
          </div>
        </div>
      `;
    }
    
    element.after(adContainer);
  }

  displayShorts(shorts) {
    const container = document.querySelector('#shorts-feed');
    if (!container) return;
    
    container.innerHTML = shorts.map((short, index) => `
      <div class="short-card" data-index="${index}">
        <iframe class="short-video" src="https://www.youtube.com/embed/${short.id.videoId}?autoplay=1&mute=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        <div class="short-info">
          <h3 class="short-title">${short.snippet.title}</h3>
          <div class="short-stats">
            <span>${window.edirearApp.formatNumber(Math.floor(Math.random() * 1000000))} views</span>
          </div>
        </div>
        <div class="short-actions">
          <button class="short-action-btn">
            <i class="fas fa-heart"></i>
            <span>${window.edirearApp.formatNumber(Math.floor(Math.random() * 10000))}</span>
          </button>
          <button class="short-action-btn">
            <i class="fas fa-comment"></i>
            <span>${window.edirearApp.formatNumber(Math.floor(Math.random() * 5000))}</span>
          </button>
          <button class="short-action-btn">
            <i class="fas fa-share"></i>
            <span>Share</span>
          </button>
        </div>
      </div>
    `).join('');
    this.setupShortGestures();
  }

  setupShortGestures() {
    const shortsContainer = document.querySelector('#shorts-feed');
    if (!shortsContainer) return;
    
    let startY = 0;
    let endY = 0;
    
    shortsContainer.addEventListener('touchstart', (e) => startY = e.touches[0].clientY, { passive: true });
    shortsContainer.addEventListener('touchmove', (e) => endY = e.touches[0].clientY, { passive: true });
    shortsContainer.addEventListener('touchend', () => {
      const diff = startY - endY;
      const threshold = 50;
      if (diff > threshold) this.showNextShort();
      else if (diff < -threshold) this.showPreviousShort();
    }, { passive: true });
    
    document.addEventListener('keydown', (e) => {
      if (document.getElementById('shorts-page')?.classList.contains('active')) {
        if (e.key === 'ArrowDown') this.showNextShort();
        else if (e.key === 'ArrowUp') this.showPreviousShort();
      }
    });
  }

  showNextShort() {
    const shorts = document.querySelectorAll('.short-card');
    if (shorts.length === 0) return;
    this.currentShortIndex = (this.currentShortIndex + 1) % shorts.length;
    shorts[this.currentShortIndex].scrollIntoView({ behavior: 'smooth' });
  }

  showPreviousShort() {
    const shorts = document.querySelectorAll('.short-card');
    if (shorts.length === 0) return;
    this.currentShortIndex = (this.currentShortIndex - 1 + shorts.length) % shorts.length;
    shorts[this.currentShortIndex].scrollIntoView({ behavior: 'smooth' });
  }

  createVideoCard(video) {
    const videoId = video.id.videoId || video.id;
    const snippet = video.snippet;
    const stats = video.statistics || { viewCount: this.getRandomViews(), likeCount: this.getRandomLikes() };
    
    return `
      <div class="video-card" data-video-id="${videoId}" data-channel-id="${snippet.channelId}">
        <img src="${snippet.thumbnails.medium.url}" alt="${snippet.title}" class="video-thumbnail">
        <div class="video-info">
          <img src="https://i.pravatar.cc/36?u=${snippet.channelTitle}" alt="${snippet.channelTitle}" class="channel-icon">
          <div class="video-details">
            <h3 class="video-title">${snippet.title}</h3>
            <p class="video-channel">${snippet.channelTitle}</p>
            <p class="video-stats">${window.edirearApp.formatNumber(stats.viewCount)} views • ${this.formatTimeAgo(snippet.publishedAt)}</p>
          </div>
        </div>
      </div>
    `;
  }

  setupVideoUpload() {
    const videoUpload = document.getElementById('video-upload');
    const uploadBtn = document.getElementById('upload-btn');
    const videoTitle = document.getElementById('video-title');
    const videoDescription = document.getElementById('video-description');
    const videoCategory = document.getElementById('video-category');
    const enableMonetization = document.getElementById('enable-monetization');
    const adBreaks = document.getElementById('ad-breaks');

    if (!videoUpload || !uploadBtn) return;

    videoUpload.addEventListener('change', () => {
      if (videoUpload.files.length > 0) {
        document.querySelector('.upload-details').style.display = 'flex';
      }
    });

    uploadBtn.addEventListener('click', async () => {
      if (!videoUpload.files.length || !videoTitle.value.trim()) {
        alert('Please select a video and enter a title');
        return;
      }

      if (!window.edirearApp.youtubeAccessToken) {
        alert('Please sign in with Google to upload videos');
        return;
      }

      uploadBtn.disabled = true;
      uploadBtn.textContent = 'Uploading...';

      try {
        const metadata = {
          snippet: {
            title: videoTitle.value,
            description: videoDescription.value,
            tags: ['Edirear', 'Upload'],
            categoryId: videoCategory.value
          },
          status: {
            privacyStatus: 'public'
          }
        };

        if (enableMonetization.checked) {
          metadata.monetizationDetails = { access: { allowed: true } };
          if (adBreaks.value > 0) {
            metadata.contentDetails = {
              note: 'This video contains ad breaks',
              adBreaks: [{ offset: '00:00:30', type: 'midroll' }]
            };
          }
        }

        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('video', videoUpload.files[0]);

        const response = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status,contentDetails,monetizationDetails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${window.edirearApp.youtubeAccessToken}` },
          body: formData
        });

        if (!response.ok) throw new Error('Failed to upload video');
        const videoData = await response.json();
        alert('Video uploaded successfully!');
        videoUpload.value = '';
        videoTitle.value = '';
        videoDescription.value = '';
        document.querySelector('.upload-details').style.display = 'none';
        window.edirearApp.fetchUserVideos();
        this.storeVideoInCloud(videoData.id, videoUpload.files[0]);
      } catch (error) {
        console.error('Error uploading video:', error);
        alert('Failed to upload video. Please try again.');
      } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload to YouTube';
      }
    });
  }

  async storeVideoInCloud(videoId, videoFile) {
    try {
      console.log(`Would upload video ${videoId} to cloud storage`);
      const signedUrl = `https://storage.googleapis.com/edirear-videos/${videoId}?key=${API_KEYS.STORAGE_API_KEY}`;
      console.log('Signed URL:', signedUrl);
      console.log('File details:', { name: videoFile.name, size: videoFile.size, type: videoFile.type });
    } catch (error) {
      console.error('Error storing video in cloud:', error);
    }
  }

  setupModal() {
    const closeModal = document.querySelector('.close-modal');
    if (!closeModal) return;
    
    closeModal.addEventListener('click', () => {
      document.getElementById('video-modal').style.display = 'none';
      document.getElementById('video-player').src = '';
    });

    window.addEventListener('click', (e) => {
      if (e.target === document.getElementById('video-modal')) {
        document.getElementById('video-modal').style.display = 'none';
        document.getElementById('video-player').src = '';
      }
    });
  }

  openVideoModal(videoId) {
    const videoPlayer = document.getElementById('video-player');
    const videoModal = document.getElementById('video-modal');
    if (!videoPlayer || !videoModal) return;
    
    videoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
    videoModal.style.display = 'block';
    
    this.showVideoAd('video-ad-container');
    
    if (window.edirearApp.monetizationStatus.enabled && !window.edirearApp.isPremiumUser) {
      window.edirearApp.recordAdImpression(videoId);
    }
    
    this.fetchVideoDetails(videoId);
    this.fetchSuggestedVideos();
  }

  showVideoAd(containerId) {
    if (window.edirearApp.isPremiumUser) return;
    
    const adContainer = document.getElementById(containerId);
    if (!adContainer) return;
    
    if (window.edirearApp.monetizationStatus.enabled) {
      adContainer.innerHTML = `
        <div class="ad-content">
          <div class="ad-wrapper">
            <script type="text/javascript">
              atOptions = { 
                'key': '${API_KEYS.ADSTERRA_AD_KEY}', 
                'format': 'iframe', 
                'height': 250, 
                'width': 300, 
                'params': {} 
              };
            </script>
            <script type="text/javascript" src="//www.highperformanceformat.com/${API_KEYS.ADSTERRA_AD_KEY}/invoke.js"></script>
          </div>
        </div>
      `;
    } else {
      adContainer.innerHTML = `
        <div class="ad-content">
          <div class="ad-wrapper">
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-6957556426963359"
                 data-ad-slot="6163876640"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <script>
                 (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
          </div>
        </div>
      `;
    }
  }

  async fetchVideoDetails(videoId) {
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEYS.YOUTUBE_API_KEY}`);
      if (!response.ok) throw new Error('Failed to fetch video details');
      
      const data = await response.json();
      if (data.items?.length > 0) {
        const video = data.items[0];
        const snippet = video.snippet;
        const stats = video.statistics;
        
        document.getElementById('video-modal-title').textContent = snippet.title;
        document.getElementById('video-views').textContent = `${window.edirearApp.formatNumber(stats.viewCount)} views`;
        document.getElementById('video-date').textContent = this.formatTimeAgo(snippet.publishedAt);
        document.getElementById('video-likes').textContent = `${window.edirearApp.formatNumber(stats.likeCount)} likes`;
        document.getElementById('video-comments').textContent = `${window.edirearApp.formatNumber(stats.commentCount || 0)} comments`;
        document.getElementById('video-description').textContent = snippet.description;
        
        const channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${snippet.channelId}&key=${API_KEYS.YOUTUBE_API_KEY}`);
        const channelData = await channelResponse.json();
        
        if (channelData.items?.length > 0) {
          const channel = channelData.items[0];
          document.getElementById('channel-img').src = channel.snippet.thumbnails.default.url;
          document.getElementById('channel-name').textContent = channel.snippet.title;
          document.getElementById('channel-subs').textContent = `${window.edirearApp.formatNumber(this.getRandomSubs())} subscribers`;
          this.updateSubscribeButton(snippet.channelId);
        }
      }
    } catch (error) {
      console.error('Error fetching video details:', error);
    }
  }

  setupSubscribeButtons() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.subscribe-btn') || e.target.closest('.action-btn.subscribe')) {
        const channelId = e.target.closest('.video-card')?.getAttribute('data-channel-id') || 
                         e.target.closest('.channel-info')?.getAttribute('data-channel-id');
        if (channelId) this.toggleSubscription(channelId);
      }
    });
  }

  toggleSubscription(channelId) {
    const isSubscribed = this.subscribedChannels.includes(channelId);
    if (isSubscribed) {
      this.subscribedChannels = this.subscribedChannels.filter(id => id !== channelId);
    } else {
      this.subscribedChannels.push(channelId);
    }
    
    localStorage.setItem('subscribedChannels', JSON.stringify(this.subscribedChannels));
    this.updateSubscribeButton(channelId);
    
    if (document.getElementById('subscriptions-page')?.classList.contains('active')) {
      window.edirearApp.fetchUserSubscriptions();
    }
  }

  updateSubscribeButton(channelId) {
    const subscribeButtons = document.querySelectorAll(`[data-channel-id="${channelId}"] .subscribe-btn, .subscribe`);
    const isSubscribed = this.subscribedChannels.includes(channelId);
    
    subscribeButtons.forEach(button => {
      button.textContent = isSubscribed ? 'Subscribed' : 'Subscribe';
      button.style.backgroundColor = isSubscribed ? 'var(--gray)' : 'var(--primary)';
    });
  }

  async fetchSuggestedVideos() {
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&key=${API_KEYS.YOUTUBE_API_KEY}`);
      if (!response.ok) throw new Error('Failed to fetch suggested videos');
      
      const data = await response.json();
      this.suggestedVideos = data.items;
      this.displaySuggestedVideos();
    } catch (error) {
      console.error('Error fetching suggested videos:', error);
      this.suggestedVideos = this.generateMockVideos(10);
      this.displaySuggestedVideos();
    }
  }

  displaySuggestedVideos() {
    const container = document.querySelector('#suggested-videos');
    if (!container) return;
    
    container.innerHTML = this.suggestedVideos.map(video => this.createVideoCard(video)).join('');
  }

  setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(button => button.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabId}-tab`)?.classList.add('active');
        
        switch (tabId) {
          case 'videos':
            window.edirearApp.fetchUserVideos();
            break;
          case 'history':
            window.edirearApp.fetchUserHistory();
            break;
          case 'liked':
            window.edirearApp.fetchUserLikedVideos();
            break;
          case 'playlists':
            window.edirearApp.fetchUserPlaylists();
            break;
          case 'subscriptions':
            window.edirearApp.fetchUserSubscriptions();
            break;
          case 'monetization':
            window.edirearApp.updateMonetizationUI();
            break;
          case 'analytics':
            window.edirearApp.initializeAnalytics();
            break;
        }
      });
    });
  }

  setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-btn');
    
    if (!searchInput || !searchButton) return;
    
    searchButton.addEventListener('click', () => this.handleSearch());
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSearch();
    });
  }

  async handleSearch() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;

    try {
      const videoFeed = document.getElementById('video-feed');
      if (!videoFeed) return;
      
      videoFeed.innerHTML = '<div class="loading">Searching videos...</div>';
      window.edirearApp.addToSearchHistory(query);
      
      document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
      document.getElementById('search-page').classList.add('active');
      
      const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=${encodeURIComponent(query)}&type=video&key=${API_KEYS.YOUTUBE_API_KEY}`);
      
      if (!searchResponse.ok) throw new Error('Search failed');
      
      const searchData = await searchResponse.json();
      if (!searchData.items?.length) {
        document.getElementById('search-results').innerHTML = '<div class="error">No videos found. Try a different search.</div>';
        return;
      }
      
      const videoIds = searchData.items.map(item => item.id.videoId).join(',');
      const videosResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${API_KEYS.YOUTUBE_API_KEY}`);
      const videosData = await videosResponse.json();
      this.displayVideos(videosData.items, '#search-results');
    } catch (error) {
      console.error('Search error:', error);
      document.getElementById('search-results').innerHTML = '<div class="error">Failed to search. Please try again later.</div>';
      this.displayVideos(this.generateMockVideos(20), '#search-results');
    }
  }

  searchVideos(query) {
    document.getElementById('search-input').value = query;
    this.handleSearch();
  }

  setupMiniPlayer() {
    const miniPlayerBtn = document.getElementById('mini-player-btn');
    const closeMiniPlayerBtn = document.getElementById('close-mini-player');
    const expandMiniPlayerBtn = document.getElementById('expand-mini-player');
    
    if (!miniPlayerBtn || !closeMiniPlayerBtn || !expandMiniPlayerBtn) return;
    
    miniPlayerBtn.addEventListener('click', () => {
      const videoSrc = document.getElementById('video-player').src;
      document.getElementById('mini-player-iframe').src = videoSrc;
      document.getElementById('mini-player').classList.add('active');
      document.getElementById('video-modal').style.display = 'none';
    });
    
    closeMiniPlayerBtn.addEventListener('click', () => {
      document.getElementById('mini-player').classList.remove('active');
      document.getElementById('mini-player-iframe').src = '';
    });
    
    expandMiniPlayerBtn.addEventListener('click', () => {
      document.getElementById('mini-player').classList.remove('active');
      document.getElementById('mini-player-iframe').src = '';
      document.getElementById('video-modal').style.display = 'block';
    });
  }

  // Helper methods
  formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + 'm ago';
    if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + 'h ago';
    if (diffInSeconds < 2592000) return Math.floor(diffInSeconds / 86400) + 'd ago';
    if (diffInSeconds < 31536000) return Math.floor(diffInSeconds / 2592000) + 'mo ago';
    return Math.floor(diffInSeconds / 31536000) + 'yr ago';
  }

  getRandomViews() { return Math.floor(Math.random() * 10000000) + 1000; }
  getRandomLikes() { return Math.floor(Math.random() * 100000) + 100; }
  getRandomSubs() { return Math.floor(Math.random() * 1000000) + 1000; }

  generateMockVideos(count) {
    const titles = [
      "Amazing tricks you didn't know about", "How to master this technique", "The secret behind successful people",
      "10 things you should try today", "Incredible results with this method", "Step-by-step guide to perfection",
      "The truth about this phenomenon", "Why this works better than anything else", "You won't believe what happened next",
      "The ultimate tutorial for beginners"
    ];
    
    const channels = [
      "TechMaster", "CreativeMinds", "AwesomeChannel", "LearnWithMe", "SkillBuilders",
      "KnowledgeHub", "ProTips", "ExpertGuide", "TutorialKing", "HowToDoEverything"
    ];
    
    return Array.from({ length: count }, (_, i) => ({
      id: 'mock' + i,
      snippet: {
        title: titles[Math.floor(Math.random() * titles.length)],
        channelTitle: channels[Math.floor(Math.random() * channels.length)],
        publishedAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        thumbnails: { medium: { url: `https://picsum.photos/320/180?random=${i}` } },
        channelId: 'channel' + Math.floor(Math.random() * 100)
      },
      statistics: {
        viewCount: this.getRandomViews(),
        likeCount: this.getRandomLikes(),
        commentCount: Math.floor(Math.random() * 1000)
      }
    }));
  }

  generateMockShorts(count) {
    return this.generateMockVideos(count).map(video => ({
      ...video,
      id: { videoId: video.id }
    }));
  }
}

// Weather App Class
class WeatherApp {
  constructor() {
    this.BASE_URL = 'https://api.weatherapi.com/v1';
    this.weatherIcons = {
      'Sunny': 'fa-sun', 'Clear': 'fa-moon', 'Partly cloudy': 'fa-cloud-sun',
      'Cloudy': 'fa-cloud', 'Overcast': 'fa-cloud', 'Mist': 'fa-smog',
      'Fog': 'fa-smog', 'Patchy rain': 'fa-cloud-rain', 'Light rain': 'fa-cloud-rain',
      'Moderate rain': 'fa-cloud-showers-heavy', 'Heavy rain': 'fa-cloud-showers-heavy',
      'Thunderstorm': 'fa-bolt', 'Snow': 'fa-snowflake', 'Sleet': 'fa-cloud-meatball'
    };
    this.init();
  }

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.fetchWeatherData('New York');
  }

  cacheDOM() {
    this.weatherLocationInput = document.getElementById('weather-location');
    this.weatherSearchBtn = document.getElementById('weather-search-btn');
    this.currentWeatherContainer = document.getElementById('current-weather');
    this.forecastContainer = document.getElementById('forecast-container');
    this.hourlyContainer = document.getElementById('hourly-container');
  }

  bindEvents() {
    if (!this.weatherLocationInput || !this.weatherSearchBtn) return;
    
    this.weatherSearchBtn.addEventListener('click', () => this.handleSearch());
    this.weatherLocationInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSearch();
    });
  }

  async handleSearch() {
    const location = this.weatherLocationInput.value.trim();
    if (location) this.fetchWeatherData(location);
  }

  async fetchWeatherData(location) {
    try {
      this.showLoading();
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(`${this.BASE_URL}/current.json?key=${API_KEYS.WEATHER_API_KEY}&q=${location}`),
        fetch(`${this.BASE_URL}/forecast.json?key=${API_KEYS.WEATHER_API_KEY}&q=${location}&days=5`)
      ]);
      
      if (!currentResponse.ok || !forecastResponse.ok) throw new Error('Location not found');
      
      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();
      this.displayCurrentWeather(currentData);
      this.displayForecast(forecastData);
      this.displayHourlyForecast(forecastData);
    } catch (error) {
      this.showError(error.message);
    }
  }

  showLoading() {
    if (!this.currentWeatherContainer) return;
    
    this.currentWeatherContainer.innerHTML = '<div class="loading">Loading weather data...</div>';
    if (this.forecastContainer) this.forecastContainer.innerHTML = '';
    if (this.hourlyContainer) this.hourlyContainer.innerHTML = '';
  }

  showError(message) {
    if (!this.currentWeatherContainer) return;
    
    this.currentWeatherContainer.innerHTML = `<div class="error">${message}. Please try another location.</div>`;
  }

  displayCurrentWeather(data) {
    if (!this.currentWeatherContainer) return;
    
    const { location, current } = data;
    const iconClass = this.weatherIcons[current.condition.text] || 'fa-cloud';
    
    this.currentWeatherContainer.innerHTML = `
      <div class="weather-main">
        <i class="fas ${iconClass} weather-icon"></i>
        <div class="weather-info">
          <h2>${location.name}, ${location.country}</h2>
          <p>${current.condition.text}</p>
          <div class="weather-temp">${current.temp_c}°C</div>
        </div>
      </div>
      <div class="weather-details">
        <div class="detail-item">
          <i class="fas fa-temperature-high"></i>
          <span>Feels like: ${current.feelslike_c}°C</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-tint"></i>
          <span>Humidity: ${current.humidity}%</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-wind"></i>
          <span>Wind: ${current.wind_kph} km/h</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-eye"></i>
          <span>Visibility: ${current.vis_km} km</span>
        </div>
      </div>
    `;
  }

  displayForecast(data) {
    if (!this.forecastContainer) return;
    
    this.forecastContainer.innerHTML = data.forecast.forecastday.map(day => {
      const date = new Date(day.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const iconClass = this.weatherIcons[day.day.condition.text] || 'fa-cloud';
      
      return `
        <div class="forecast-card">
          <h3 class="forecast-day">${dayName}</h3>
          <i class="fas ${iconClass} forecast-icon"></i>
          <p>${day.day.condition.text}</p>
          <div class="forecast-temp">
            <span class="high-temp">${day.day.maxtemp_c}°</span>
            <span class="low-temp">${day.day.mintemp_c}°</span>
          </div>
        </div>
      `;
    }).join('');
  }

  displayHourlyForecast(data) {
    if (!this.hourlyContainer) return;
    
    const todayHours = data.forecast.forecastday[0].hour;
    const now = new Date().getHours();
    const upcomingHours = todayHours.slice(now, now + 12);
    
    this.hourlyContainer.innerHTML = upcomingHours.map(hour => {
      const time = new Date(hour.time);
      const hourStr = time.getHours() + ':00';
      const iconClass = this.weatherIcons[hour.condition.text] || 'fa-cloud';
      
      return `
        <div class="hourly-card">
          <p class="hourly-time">${hourStr}</p>
          <i class="fas ${iconClass} hourly-icon"></i>
          <p class="hourly-temp">${hour.temp_c}°C</p>
          <p>${hour.chance_of_rain}%</p>
        </div>
      `;
    }).join('');
  }
}

// AI Assistant Class
class AIAssistant {
  constructor() {
    this.API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    this.init();
  }

  init() {
    this.cacheDOM();
    this.bindEvents();
  }

  cacheDOM() {
    this.userMessageInput = document.getElementById('user-message');
    this.sendMessageBtn = document.getElementById('send-message');
    this.chatMessages = document.getElementById('chat-messages');
  }

  bindEvents() {
    if (!this.userMessageInput || !this.sendMessageBtn || !this.chatMessages) return;
    
    this.sendMessageBtn.addEventListener('click', () => this.sendMessage());
    this.userMessageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  sendMessage() {
    const message = this.userMessageInput.value.trim();
    if (!message) return;

    this.appendMessage('user', message);
    this.userMessageInput.value = '';
    const loadingMessage = this.appendMessage('bot', 'Edirear Assistant is thinking...');
    
    fetch(`${this.API_URL}?key=${API_KEYS.AI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] }),
    })
      .then((response) => response.json())
      .then((data) => {
        this.chatMessages.removeChild(loadingMessage);
        const botMessage = data.candidates[0].content.parts[0].text;
        this.appendMessage('bot', botMessage);
      })
      .catch((error) => {
        this.chatMessages.removeChild(loadingMessage);
        console.error("Error:", error);
        this.appendMessage('bot', "Sorry, something went wrong. Please try again.");
      });
  }

  appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.innerHTML = `<p>${message}</p>`;
    this.chatMessages.appendChild(messageElement);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    return messageElement;
  }
}

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.edirearApp = new EdirearApp();
  window.videoManager = new VideoManager();
  window.weatherApp = new WeatherApp();
  window.aiAssistant = new AIAssistant();
});