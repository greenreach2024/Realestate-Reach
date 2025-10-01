import { 
  buyers, listings, agents, mortgageLeads, notifications, subscriptions, onboardingFlows, 
  communityInterest, userSubscriptions, buyerInsights, iftttConfig, kingstonMarketData, 
  preapprovalStats, localServiceProviders, buyerProfileStructure, wishlistTemplate, 
  locationStructure, propertyFeatures, timelineOptions, mortgageStatusOptions, propertyTypes,
  sellerProfileStructure, propertyListingStructure, sellerRoleOptions, subscriptionTiers,
  propertyConditions, listingAnalytics, notificationTypes, notificationPreferences, 
  locationMonitoringStructure
} from './data.js';

console.log('📚 Data module imported successfully');
console.log('Data imported:', { buyers: buyers?.length, listings: listings?.length });

// Immediate visual feedback that the script is running
try {
  console.log('🚀 App.js is executing...');
  const loadingDiv = document.getElementById('loading-indicator');
  if (loadingDiv) {
    loadingDiv.innerHTML += '<br><strong>📜 Script loaded and executing...</strong>';
    console.log('✅ Updated loading indicator');
  } else {
    console.log('⚠️ Loading indicator not found yet (DOM may not be ready)');
  }
} catch (e) {
  console.error('❌ Error updating loading indicator:', e);
}

// Matchmaking Engine Implementation
class MatchmakingEngine {
  static calculateMatchScore(listing, wishlist) {
    let score = 0;
    let maxScore = 0;

    // Location scoring (40% weight) - mandatory
    const locationScore = this.calculateLocationScore(listing, wishlist);
    score += locationScore * 0.4;
    maxScore += 0.4;

    // Price alignment (30% weight) - mandatory
    const priceScore = this.calculatePriceScore(listing, wishlist);
    score += priceScore * 0.3;
    maxScore += 0.3;

    // Feature matching (20% weight)
    const featureScore = this.calculateFeatureScore(listing, wishlist);
    score += featureScore * 0.2;
    maxScore += 0.2;

    // Timeline compatibility (10% weight)
    const timelineScore = this.calculateTimelineScore(listing, wishlist);
    score += timelineScore * 0.1;
    maxScore += 0.1;

    return Math.round((score / maxScore) * 100);
  }

  static calculateLocationScore(listing, wishlist) {
    // Simplified location matching - in real implementation would use PostGIS
    const listingLocation = listing.address.toLowerCase();
    const wishlistLocations = wishlist.locations.map(loc => loc.toLowerCase());
    
    for (const location of wishlistLocations) {
      if (listingLocation.includes(location.toLowerCase())) {
        return 1.0; // Perfect match
      }
    }
    return 0.6; // Partial match for demo
  }

  static calculatePriceScore(listing, wishlist) {
    const listingPrice = listing.price;
    const { min, max } = wishlist.budget;
    
    if (listingPrice >= min && listingPrice <= max) {
      return 1.0; // Perfect price fit
    } else if (listingPrice < min) {
      return Math.max(0, 1 - (min - listingPrice) / min * 2);
    } else {
      return Math.max(0, 1 - (listingPrice - max) / max * 2);
    }
  }

  static calculateFeatureScore(listing, wishlist) {
    // Simplified feature matching
    const mustHaveCount = wishlist.mustHaves.length;
    const niceToHaveCount = wishlist.niceToHaves.length;
    
    let mustHaveMatches = 0;
    let niceToHaveMatches = 0;
    
    // In real implementation, would check listing features against requirements
    mustHaveMatches = Math.floor(mustHaveCount * 0.8); // 80% match for demo
    niceToHaveMatches = Math.floor(niceToHaveCount * 0.6); // 60% match for demo
    
    const mustHaveScore = mustHaveCount > 0 ? mustHaveMatches / mustHaveCount : 1;
    const niceToHaveScore = niceToHaveCount > 0 ? niceToHaveMatches / niceToHaveCount : 1;
    
    return (mustHaveScore * 0.7) + (niceToHaveScore * 0.3);
  }

  static calculateTimelineScore(listing, wishlist) {
    // Simplified timeline matching
    const timelineMap = {
      '0-3 months': 1.0,
      '3-6 months': 0.8,
      '6-12 months': 0.6,
      '12+ months': 0.4
    };
    
    return timelineMap[wishlist.timeline] || 0.5;
  }

  static findMatches(wishlist) {
    const matches = listings.map(listing => ({
      listing,
      score: this.calculateMatchScore(listing, wishlist)
    })).filter(match => match.score >= 50) // Only show matches above 50%
    .sort((a, b) => b.score - a.score);

    // Trigger IFTTT notification for high-quality matches (80%+)
    matches.forEach(match => {
      if (match.score >= 80) {
        iftttService.notifyPropertyMatch({
          score: match.score,
          buyerName: wishlist.buyerName || 'Unknown Buyer',
          propertyAddress: match.listing.address,
          price: match.listing.price,
          features: wishlist.mustHaves
        });
      }
    });

    return matches;
  }
}

// Subscription and messaging controls
class SubscriptionManager {
  static canUserMessage(userId, userRole) {
    const subscription = userSubscriptions[userId];
    if (!subscription) return false;
    
    // Buyers are always free and cannot initiate messaging
    if (userRole === 'buyer') return false;
    
    // All other roles need paid subscriptions to message
    return subscription.canMessage;
  }

  static getUpgradePrompt(userRole) {
    const prompts = {
      buyer: "Messaging is available to sellers and agents. Sellers can contact you about matches!",
      seller: "Upgrade to Seller Pro to message buyers and unlock detailed analytics.",
      agent: "Agent Pro subscription required for messaging and advanced analytics.",
      mortgage: "Subscription required to contact qualified leads."
    };
    
    return prompts[userRole] || "Subscription required for messaging features.";
  }
}

// IFTTT Integration Service
class IFTTTService {
  constructor(config) {
    this.config = config;
    this.webhookUrl = config.webhookUrl;
    this.events = config.events;
  }

  async triggerEvent(eventType, data = {}) {
    try {
      const eventName = this.events[eventType];
      if (!eventName) {
        console.warn(`IFTTT: Unknown event type: ${eventType}`);
        return false;
      }

      const payload = {
        value1: data.title || eventType,
        value2: data.description || JSON.stringify(data),
        value3: data.metadata || new Date().toISOString()
      };

      const url = `${this.webhookUrl}/${eventName}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log(`IFTTT: Successfully triggered ${eventName}`, payload);
        return true;
      } else {
        console.error(`IFTTT: Failed to trigger ${eventName}`, response.status);
        return false;
      }
    } catch (error) {
      console.error('IFTTT: Error triggering event', error);
      return false;
    }
  }

  // Convenience methods for common events
  async notifyNewBuyer(buyerData) {
    return this.triggerEvent('newBuyerRegistration', {
      title: `New Buyer: ${buyerData.name}`,
      description: `Budget: $${buyerData.budget?.min || 'N/A'}-$${buyerData.budget?.max || 'N/A'}, Timeline: ${buyerData.timeline || 'N/A'}`,
      metadata: `Location: ${buyerData.location || 'N/A'}`
    });
  }

  async notifyPropertyMatch(matchData) {
    return this.triggerEvent('newMatching', {
      title: `Property Match: ${matchData.score}% compatibility`,
      description: `Buyer: ${matchData.buyerName}, Property: ${matchData.propertyAddress}`,
      metadata: `Price: $${matchData.price}, Features: ${matchData.features?.join(', ') || 'N/A'}`
    });
  }

  async notifyMessage(messageData) {
    return this.triggerEvent('messageReceived', {
      title: `New Message from ${messageData.fromRole}`,
      description: `${messageData.fromName} sent a message about ${messageData.subject}`,
      metadata: `Subscription: ${messageData.subscriptionTier}`
    });
  }

  async notifyCommunityInterest(communityData) {
    return this.triggerEvent('communityInterest', {
      title: `Community Interest Update: ${communityData.name}`,
      description: `${communityData.activeBuyers} active buyers, Avg budget: $${communityData.avgBudget}`,
      metadata: `Top features: ${communityData.topFeatures?.join(', ') || 'N/A'}`
    });
  }

  async notifyPriceAlert(alertData) {
    return this.triggerEvent('priceAlert', {
      title: `Price Alert: ${alertData.propertyAddress}`,
      description: `Price changed from $${alertData.oldPrice} to $${alertData.newPrice}`,
      metadata: `Change: ${alertData.change > 0 ? '+' : ''}${alertData.change}%`
    });
  }
}

// Initialize IFTTT service
const iftttService = new IFTTTService(iftttConfig);

// Enhanced Notification Management System
class NotificationManager {
  constructor() {
    this.notifications = [];
    this.userPreferences = {
      frequency: 'instant',
      channels: {
        inApp: true,
        email: true,
        push: false,
        sms: false
      }
    };
    this.monitoringZones = [];
  }

  // Location monitoring for homeowners (2 zones, 15km each)
  addHomeownerMonitoringZone(lat, lng, address, nickname = '') {
    if (this.monitoringZones.length >= 2) {
      throw new Error('Homeowners can monitor up to 2 locations');
    }

    const zone = {
      id: `zone-${Date.now()}`,
      type: 'homeowner',
      ...locationMonitoringStructure.homeownerZone,
      centerLat: lat,
      centerLng: lng,
      address: address,
      nickname: nickname || `Zone ${this.monitoringZones.length + 1}`
    };

    this.monitoringZones.push(zone);
    this.triggerIFTTT('location_monitoring_setup', { zoneId: zone.id, address });
    return zone;
  }

  // Location monitoring for professionals (1 region, 50km)
  addProfessionalMonitoringRegion(lat, lng, address, nickname = '') {
    if (this.monitoringZones.length >= 1) {
      throw new Error('Professionals can monitor 1 large region');
    }

    const region = {
      id: `region-${Date.now()}`,
      type: 'professional',
      ...locationMonitoringStructure.professionalRegion,
      centerLat: lat,
      centerLng: lng,
      address: address,
      nickname: nickname || 'My Territory'
    };

    this.monitoringZones.push(region);
    this.triggerIFTTT('territory_monitoring_setup', { regionId: region.id, address });
    return region;
  }

  // Check if a location is within monitoring zones
  isLocationInMonitoringZone(lat, lng) {
    return this.monitoringZones.some(zone => {
      const distance = this.calculateDistance(lat, lng, zone.centerLat, zone.centerLng);
      return distance <= zone.radius;
    });
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRad(value) {
    return value * Math.PI / 180;
  }

  // Create notification for buyer activity in monitored zones
  notifyBuyerActivityInZone(activityType, buyerData, location) {
    const affectedZones = this.monitoringZones.filter(zone => {
      const distance = this.calculateDistance(
        location.lat, location.lng,
        zone.centerLat, zone.centerLng
      );
      return distance <= zone.radius;
    });

    affectedZones.forEach(zone => {
      const notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: activityType,
        title: notificationTypes[activityType]?.title || 'Buyer Activity',
        message: this.generateActivityMessage(activityType, buyerData, zone),
        timestamp: new Date().toISOString(),
        zoneId: zone.id,
        zoneName: zone.nickname,
        location: location,
        buyerData: buyerData,
        read: false,
        priority: this.getNotificationPriority(activityType)
      };

      this.addNotification(notification);
      this.deliverNotification(notification);
    });
  }

  // Create notification for professional market insights
  notifyMarketTrend(trendType, trendData, region) {
    const notification = {
      id: `trend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: trendType,
      title: notificationTypes[trendType]?.title || 'Market Update',
      message: this.generateTrendMessage(trendType, trendData, region),
      timestamp: new Date().toISOString(),
      regionId: region.id,
      regionName: region.nickname,
      trendData: trendData,
      read: false,
      priority: this.getNotificationPriority(trendType)
    };

    this.addNotification(notification);
    this.deliverNotification(notification);
  }

  // Generate contextual messages for notifications
  generateActivityMessage(activityType, buyerData, zone) {
    switch(activityType) {
      case 'newWishlistInZone':
        return `A buyer is looking for ${buyerData.propertyType} in ${zone.nickname} with budget $${buyerData.budget?.toLocaleString()}`;
      case 'wishlistUpdateInZone':
        return `A buyer updated their wishlist in ${zone.nickname} - ${buyerData.updateType}`;
      case 'buyerActivityInZone':
        return `Increased buyer activity in ${zone.nickname} - ${buyerData.activityCount} new activities today`;
      default:
        return `New buyer activity in ${zone.nickname}`;
    }
  }

  generateTrendMessage(trendType, trendData, region) {
    switch(trendType) {
      case 'newBuyerInRegion':
        return `New buyer registered in ${region.nickname} - ${trendData.propertyType} seeker with $${trendData.budget?.toLocaleString()} budget`;
      case 'marketTrendShift':
        return `${trendData.trend} demand ${trendData.direction} by ${trendData.percentage}% in ${region.nickname}`;
      case 'preApprovedBuyerAlert':
        return `Pre-approved buyer ($${trendData.approvalAmount?.toLocaleString()}) active in ${region.nickname}`;
      case 'demandSpikeAlert':
        return `${trendData.propertyType} demand spiked ${trendData.percentage}% in ${region.nickname}`;
      default:
        return `Market update for ${region.nickname}`;
    }
  }

  getNotificationPriority(type) {
    const highPriority = ['preApprovedBuyerAlert', 'demandSpikeAlert', 'marketTrendShift'];
    const mediumPriority = ['newBuyerInRegion', 'newWishlistInZone'];
    
    if (highPriority.includes(type)) return 'high';
    if (mediumPriority.includes(type)) return 'medium';
    return 'low';
  }

  // Deliver notification based on user preferences
  deliverNotification(notification) {
    const { frequency, channels } = this.userPreferences;

    // Instant delivery for high priority or instant preference
    if (frequency === 'instant' || notification.priority === 'high') {
      if (channels.inApp) this.showInAppNotification(notification);
      if (channels.email) this.sendEmailNotification(notification);
      if (channels.push) this.sendPushNotification(notification);
      if (channels.sms && notification.priority === 'high') this.sendSMSNotification(notification);
    } else {
      // Queue for batch delivery
      this.queueForBatchDelivery(notification);
    }

    // Trigger IFTTT webhook
    this.triggerIFTTT('notification_created', {
      type: notification.type,
      priority: notification.priority,
      userId: state.currentUser?.id
    });
  }

  // Show in-app notification
  showInAppNotification(notification) {
    const notificationEl = document.createElement('div');
    notificationEl.className = `notification-toast priority-${notification.priority}`;
    notificationEl.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">${notificationTypes[notification.type]?.icon || '🔔'}</div>
        <div class="notification-text">
          <div class="notification-title">${notification.title}</div>
          <div class="notification-message">${notification.message}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    document.body.appendChild(notificationEl);

    // Auto-remove after 5 seconds for low priority, 10 seconds for high priority
    const duration = notification.priority === 'high' ? 10000 : 5000;
    setTimeout(() => {
      if (notificationEl.parentNode) {
        notificationEl.remove();
      }
    }, duration);
  }

  // Add notification to queue
  addNotification(notification) {
    this.notifications.unshift(notification);
    
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    // Update UI badge
    this.updateNotificationBadge();
  }

  // Update notification badge in UI
  updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    const unreadCount = this.notifications.filter(n => !n.read).length;
    
    if (badge) {
      badge.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
      badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
  }

  // Send email notification (simulated)
  sendEmailNotification(notification) {
    console.log('📧 Email notification sent:', notification.title);
  }

  // Send push notification
  sendPushNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png'
      });
    }
  }

  // Send SMS notification (simulated)
  sendSMSNotification(notification) {
    console.log('📱 SMS notification sent:', notification.title);
  }

  // Queue notifications for batch delivery
  queueForBatchDelivery(notification) {
    console.log('📬 Queued for batch delivery:', notification.title);
  }

  // Trigger IFTTT webhook
  triggerIFTTT(eventType, data) {
    if (iftttService) {
      iftttService.triggerEvent(eventType, data);
    }
  }

  // Get notifications for display
  getNotifications(limit = 20) {
    return this.notifications.slice(0, limit);
  }

  // Mark notification as read
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.updateNotificationBadge();
    }
  }

  // Update user notification preferences
  updatePreferences(newPreferences) {
    this.userPreferences = { ...this.userPreferences, ...newPreferences };
    console.log('📋 Notification preferences updated:', this.userPreferences);
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.updateNotificationBadge();
  }

  // Get unread count
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // Initialize notification manager
  init() {
    console.log('🔔 Initializing notification manager...');
    this.updateNotificationBadge();
    
    // Check for notifications every 30 seconds
    setInterval(() => {
      this.checkForLocationBasedNotifications();
    }, 30000);
  }

  // Check for location-based notifications periodically
  checkForLocationBasedNotifications() {
    // Simulate checking for new buyer activity in monitored zones
    if (this.monitoringZones.length > 0 && Math.random() < 0.05) { // 5% chance every 30 seconds
      const randomZone = this.monitoringZones[Math.floor(Math.random() * this.monitoringZones.length)];
      const currentUserRole = state.currentUser?.role || 'homeowner';
      
      if (currentUserRole === 'agent') {
        this.notifyMarketTrend('newBuyerInRegion', {
          propertyType: ['House', 'Condo', 'Townhouse'][Math.floor(Math.random() * 3)],
          budget: Math.floor(Math.random() * 500000) + 400000,
          timeline: ['immediate', '3months', '6months'][Math.floor(Math.random() * 3)]
        }, randomZone);
      } else {
        this.notifyBuyerActivityInZone('newWishlistInZone', {
          propertyType: ['House', 'Condo', 'Townhouse'][Math.floor(Math.random() * 3)],
          budget: Math.floor(Math.random() * 400000) + 300000,
          bedrooms: ['2+', '3+', '4+'][Math.floor(Math.random() * 3)]
        }, { lat: randomZone.lat, lng: randomZone.lng });
      }
    }
  }
}

// Initialize notification manager
const notificationManager = new NotificationManager();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎯 DOMContentLoaded event fired!');
  
  // Initialize notification manager
  notificationManager.init();
  
  // Get DOM elements
  appRoot = document.getElementById('app-root');
  roleSelect = document.getElementById('role-select');
  
  console.log('🔍 DOM elements found:', { 
    appRoot: !!appRoot, 
    roleSelect: !!roleSelect 
  });
  
  // Initialize modal
  initializeModal();

  if (!appRoot) {
    console.error('app-root element not found!');
    return;
  }

  // Initialize role selector
  if (roleSelect) {
    roleSelect.addEventListener('change', (event) => {
      const previousRole = state.role;
      state.role = event.target.value;
      state.view = 'role';
      
      // Trigger IFTTT notification for new buyer registration
      if (state.role === 'buyer' && previousRole !== 'buyer') {
        iftttService.notifyNewBuyer({
          name: 'New Platform User',
          budget: { min: 500000, max: 1500000 },
          timeline: 'TBD',
          location: 'Kingston, ON'
        });
      }
      
      renderApp();
    });
  } else {
    console.warn('Role selector not found');
  }

  // Initialize nav buttons
  const navButtons = document.querySelectorAll('.nav-btn[data-target]');
  if (navButtons.length > 0) {
    navButtons.forEach((button) => {
      button.addEventListener('click', () => {
        state.view = button.dataset.target;
        renderApp();
      });
    });
  } else {
    console.warn('No nav buttons found');
  }

  // Initial render
  console.log('🎨 About to call renderApp()');
  renderApp();
});

// Global variables for DOM elements (will be initialized on DOM ready)
let appRoot, roleSelect, modal, modalTitle, modalContent;

const state = {
  view: 'landing',
  role: 'buyer',
  buyerId: buyers[0]?.id || 'buyer-1',
};

const safeStructuredClone = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const generateId = (prefix) => {
  const random = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(16).slice(2);
  return `${prefix}-${random}`;
};

// Modal functionality
function initializeModal() {
  // Create modal if it doesn't exist
  if (!document.querySelector('.modal')) {
    const modalHTML = `
      <dialog class="modal">
        <div class="modal-container">
          <div class="modal-header">
            <h2 class="modal-title"></h2>
            <button onclick="modal.close()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
          </div>
          <div class="modal-content"></div>
        </div>
      </dialog>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
  
  modal = document.querySelector('.modal');
  modalTitle = document.querySelector('.modal-title');
  modalContent = document.querySelector('.modal-content');

  if (modal) {
    modal.addEventListener('close', () => {
      modalContent.innerHTML = '';
    });
    
    // Add showModal function for compatibility
    if (!modal.showModal) {
      modal.showModal = function() {
        this.style.display = 'block';
      };
    }
    
    if (!modal.close) {
      modal.close = function() {
        this.style.display = 'none';
      };
    }
  }
}

function renderApp() {
  console.log('renderApp called, current state:', state);
  
  if (!appRoot) {
    console.error('Cannot render: appRoot element not found');
    return;
  }
  
  // Remove loading indicator
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.remove();
  }
  
  appRoot.innerHTML = '';

  try {
    switch (state.view) {
      case 'landing':
        appRoot.append(renderLanding());
        break;
      case 'auth':
        appRoot.append(renderOnboarding());
        break;
      case 'notifications':
        appRoot.append(renderNotifications());
        break;
      case 'subscription':
        appRoot.append(renderSubscriptions());
        break;
      case 'role':
      default:
        appRoot.append(renderRoleExperience());
    }
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
    appRoot.innerHTML = `
      <div style="padding: 2rem; background: #fee; border: 1px solid #fcc; border-radius: 0.5rem;">
        <h2>Error Loading Application</h2>
        <p>There was an error loading the application. Please check the console for details.</p>
        <pre>${error.message}</pre>
      </div>
    `;
  }
}

function renderLanding() {
  const section = createSection({
    title: 'Demand-led real estate intelligence',
    description:
      'Explore how Buyer Registry flips the MLS model by centring qualified buyers. Walk through experience demos for each role to see the demand-first workflows.',
  });

  const hero = document.createElement('div');
  hero.className = 'hero';
  hero.innerHTML = `
    <div>
      <h2>Match supply to real buyer demand</h2>
      <p>Buyers share rich wishlists, sellers unlock analytics and outreach, and agents gain regional intelligence. The prototype below highlights the unified product vision.</p>
      <div class="pill-group">
        <span class="pill">Buyer wishlists</span>
        <span class="pill">Match scores</span>
        <span class="pill">Analytics</span>
        <span class="pill">Secure messaging</span>
      </div>
    </div>
    <div class="hero-illustration" role="presentation" aria-hidden="true"></div>
  `;

  section.append(hero);

  // Community Interest Map
  const mapSection = document.createElement('div');
  mapSection.className = 'community-map-section';
  mapSection.innerHTML = `
    <div class="section-header">
      <h2>Buyer Interest Communities</h2>
      <p class="section-description">Live view of communities where registered buyers are actively searching</p>
    </div>
    <div class="map-container">
      <div id="google-map" class="google-map-container">
        <div class="map-loading">
          🗺️ Loading interactive map...
          <br><small>Powered by Google Maps</small>
        </div>
      </div>
      <div class="map-legend">
        <h4>Active Buyer Interest</h4>
        <div class="legend-items">
          <div class="legend-item">
            <span class="legend-dot high"></span>
            <span>High Interest (20+ buyers)</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot medium"></span>
            <span>Medium Interest (10-19 buyers)</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot low"></span>
            <span>Active Interest (5-9 buyers)</span>
          </div>
        </div>
      </div>
    </div>
    <div class="map-summary">
      <div class="grid grid-3">
        <div class="stat-card">
          <h3>${communityInterest.reduce((sum, c) => sum + c.activeBuyers, 0)}</h3>
          <p>Active Buyers</p>
        </div>
        <div class="stat-card">
          <h3>${communityInterest.length}</h3>
          <p>Communities</p>
        </div>
        <div class="stat-card">
          <h3>$${Math.round(communityInterest.reduce((sum, c) => sum + c.avgBudget, 0) / communityInterest.length / 1000)}K</h3>
          <p>Avg Budget</p>
        </div>
      </div>
    </div>
  `;

  section.append(mapSection);

  // Initialize Google Map after the section is added to DOM
  setTimeout(() => {
    initCommunityMap();
  }, 100);

  // Buyer Market Insights Section
  const insightsSection = document.createElement('div');
  insightsSection.className = 'buyer-insights-section';
  insightsSection.innerHTML = `
    <div class="section-header">
      <h2>📊 Buyer Market Insights</h2>
      <p class="section-description">Real-time analytics from our active buyer registry</p>
    </div>
    
    <div class="insights-grid">
      <!-- Pre-qualification Rate -->
      <div class="insight-card">
        <div class="insight-header">
          <h3>Pre-Qualified Buyers</h3>
          <div class="insight-metric">
            <span class="metric-value">${buyerInsights.prequalificationRate}%</span>
            <span class="metric-label">of ${buyerInsights.totalBuyers} buyers</span>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${buyerInsights.prequalificationRate}%"></div>
        </div>
        <p class="insight-note">${Math.round(buyerInsights.totalBuyers * buyerInsights.prequalificationRate / 100)} buyers have mortgage pre-approval</p>
      </div>

      <!-- Purchase Timeline -->
      <div class="insight-card">
        <div class="insight-header">
          <h3>Looking to Purchase</h3>
        </div>
        <div class="timeline-breakdown">
          ${buyerInsights.purchaseTimelines.map(timeline => `
            <div class="timeline-item">
              <div class="timeline-label">
                <span class="timeline-period">${timeline.period}</span>
                <span class="timeline-count">${timeline.count} buyers</span>
              </div>
              <div class="timeline-bar">
                <div class="timeline-fill" style="width: ${timeline.percentage}%"></div>
                <span class="timeline-percentage">${timeline.percentage}%</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Top Buyer Wants -->
      <div class="insight-card">
        <div class="insight-header">
          <h3>Most Common Buyer Wants</h3>
        </div>
        <div class="wants-list">
          ${buyerInsights.topWants.slice(0, 6).map((want, index) => `
            <div class="want-item">
              <div class="want-rank">${index + 1}</div>
              <div class="want-details">
                <span class="want-feature">${want.feature}</span>
                <div class="want-stats">
                  <span class="want-percentage">${want.percentage}%</span>
                  <span class="want-count">(${want.count} buyers)</span>
                </div>
              </div>
              <div class="want-bar">
                <div class="want-fill" style="width: ${want.percentage}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  section.append(insightsSection);

  // Local Professional Advertising Section
  const professionalAds = document.createElement('div');
  professionalAds.className = 'professional-ads-section';
  professionalAds.innerHTML = `
    <div class="section-header">
      <h2>🤝 Featured Kingston Professionals</h2>
      <p class="section-description">Trusted local experts ready to help with your home buying journey</p>
    </div>
    
    <div class="ads-grid">
      ${localServiceProviders.realtors.slice(0, 2).map(realtor => `
        <div class="professional-ad realtor-ad">
          <div class="ad-header">
            <h3>${realtor.name}</h3>
            <span class="badge">Realtor</span>
          </div>
          <div class="ad-content">
            <p class="company">${realtor.brokerage}</p>
            <p class="rating">⭐ ${realtor.rating}/5 • ${realtor.reviewCount} reviews</p>
            <p class="specialties">${realtor.specialties.join(' • ')}</p>
            <p class="service-area">${realtor.neighbourhoods.slice(0, 2).join(', ')}</p>
            <div class="ad-stats">
              <span class="stat">Avg savings: $${Math.round(realtor.clientsSaved/1000)}K</span>
              <span class="stat">${realtor.averageClosingTime} day close</span>
            </div>
          </div>
          <div class="ad-actions">
            <button class="ad-button" onclick="contactProfessional('${realtor.id}', 'realtor')">Contact ${realtor.name.split(' ')[0]}</button>
          </div>
        </div>
      `).join('')}
      
      ${localServiceProviders.mortgageAgents.slice(0, 2).map(agent => `
        <div class="professional-ad mortgage-ad">
          <div class="ad-header">
            <h3>${agent.name}</h3>
            <span class="badge">Mortgage</span>
          </div>
          <div class="ad-content">
            <p class="company">${agent.company}</p>
            <p class="rating">⭐ ${agent.rating}/5 • ${agent.reviewCount} reviews</p>
            <p class="specialties">${agent.specialties.join(' • ')}</p>
            <div class="ad-stats">
              <span class="stat">${agent.averageApprovalTime} day approval</span>
              <span class="stat">${agent.preapprovalAccuracy}% accuracy</span>
            </div>
          </div>
          <div class="ad-actions">
            <button class="ad-button" onclick="contactProfessional('${agent.id}', 'mortgage')">Get Pre-approved</button>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="ad-disclaimer">
      <p><em>Featured professionals are independent service providers. Platform does not guarantee services.</em></p>
    </div>
  `;

  section.append(professionalAds);

  const highlights = document.createElement('div');
  highlights.className = 'grid grid-4';

  const cards = [
    {
      title: 'Buyer-first Workflows',
      body: 'Granular wishlists, location tools, and match analytics give buyers confidence and surface qualified demand for the market.',
    },
    {
      title: 'Revenue-enabled Access',
      body: 'Sellers, agents, and lenders graduate from aggregate demand signals to direct outreach through paid tiers.',
    },
    {
      title: 'Azure-native Architecture',
      body: 'Managed PostgreSQL, Cognitive Search, SignalR, and Functions power secure matchmaking, analytics, and messaging.',
    },
    {
      title: '🔗 IFTTT Automation',
      body: `Connected to IFTTT for real-time notifications: new buyer alerts, property matches, community updates, and price changes. <span class="ifttt-status">✅ Active</span>`,
    },
  ];

  cards.forEach((card) => {
    const el = document.createElement('article');
    el.className = 'analytics-card';
    el.innerHTML = `<h3>${card.title}</h3><p>${card.body}</p>`;
    highlights.append(el);
  });

  section.append(highlights);
  return section;
}

function renderOnboarding() {
  const flows = onboardingFlows[state.role];
  const section = createSection({
    title: 'Role-specific onboarding',
    description: 'Screen-by-screen walkthrough of account creation requirements and verification steps.',
  });

  const list = document.createElement('ol');
  list.className = 'form-grid';

  flows.forEach((step) => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${step.title}</strong><p>${step.description}</p>`;
    list.append(item);
  });

  section.append(list);
  return section;
}

function renderNotifications() {
  const section = createSection({
    title: 'Notification centre',
    description: 'System, match, and messaging alerts differ per role and respect user frequency preferences.',
  });

  const table = document.createElement('table');
  table.className = 'table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Audience</th>
        <th>Trigger</th>
        <th>Channel</th>
      </tr>
    </thead>
    <tbody>
      ${notifications
        .map(
          (n) => `
            <tr>
              <td>${n.role}</td>
              <td>${n.trigger}</td>
              <td>${n.channels.join(', ')}</td>
            </tr>
          `,
        )
        .join('')}
    </tbody>
  `;

  section.append(table);
  return section;
}

function renderSubscriptions() {
  const section = createSection({
    title: 'Subscription tiers',
    description: 'Feature gating and value ladders for each persona.',
  });

  const grid = document.createElement('div');
  grid.className = 'analytics-grid';

  subscriptions.forEach((plan) => {
    const card = document.createElement('article');
    card.className = 'analytics-card';
    card.innerHTML = `
      <div class="section-header">
        <h3>${plan.name}</h3>
        <span class="badge">${plan.price}</span>
      </div>
      <ul>
        ${plan.features.map((feature) => `<li>${feature}</li>`).join('')}
      </ul>
    `;
    grid.append(card);
  });

  section.append(grid);
  return section;
}

function renderRoleExperience() {
  switch (state.role) {
    case 'buyer':
      return renderBuyerExperience();
    case 'seller':
      return renderSellerExperience();
    case 'agent':
      return renderAgentExperience();
    case 'mortgage':
    default:
      return renderMortgageExperience();
  }
}

function renderBuyerExperience() {
  const buyer = buyers.find((b) => b.id === state.buyerId) ?? buyers[0];
  const section = createSection({
    title: `${buyer.name}'s dashboard`,
    description: 'Manage wishlists, review matches, and collaborate with sellers or agents.',
  });

  const wishlistGrid = document.createElement('div');
  wishlistGrid.className = 'grid grid-2';

  buyer.wishlists.forEach((wishlist) => {
    const template = document.getElementById('buyer-wishlist-template');
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector('.wishlist-name').textContent = wishlist.name;
    node.querySelector('.wishlist-status').textContent = wishlist.active ? 'Active' : 'Archived';
    node.querySelector('.wishlist-description').textContent = wishlist.description;
    node.querySelector('.wishlist-matches').textContent = `${wishlist.matches} listings`;
    node.querySelector('.wishlist-score').textContent = `${wishlist.topMatch}%`;
    node.querySelector('.wishlist-budget').textContent = `$${wishlist.budget.min.toLocaleString()} - $${wishlist.budget.max.toLocaleString()}`;
    node.querySelector('.wishlist-timeline').textContent = wishlist.timeline;

    const features = node.querySelector('.wishlist-features');
    wishlist.mustHaves.forEach((feature) => {
      const pill = document.createElement('span');
      pill.className = 'pill must-have';
      pill.textContent = feature;
      features.append(pill);
    });

    wishlist.niceToHaves.forEach((feature) => {
      const pill = document.createElement('span');
      pill.className = 'pill nice-to-have';
      pill.textContent = feature;
      features.append(pill);
    });

    node.querySelector('.view-wishlist').addEventListener('click', () => openWishlistModal(wishlist));
    node.querySelector('.edit-wishlist').addEventListener('click', () => openWishlistForm('Edit wishlist', wishlist));
    node.querySelector('.duplicate-wishlist').addEventListener('click', () => duplicateWishlist(buyer.id, wishlist.id));

    wishlistGrid.append(node);
  });

  const actions = document.createElement('div');
  actions.className = 'card';
  actions.innerHTML = `
    <div class="card-header">
      <h3>Create new wishlist</h3>
    </div>
    <div class="card-body">
      <p>Capture new search areas or lifestyle needs. The matchmaking engine will instantly recalculate relevant listings.</p>
      <div class="form-actions">
        <button class="primary-button" id="new-wishlist-btn">Launch wizard</button>
        <button class="ghost-button" id="run-matchmaking-btn">🔍 Run matchmaking demo</button>
        <button class="ghost-button" id="market-intelligence-btn">📊 Market Intelligence</button>
      </div>
    </div>
  `;

  actions.querySelector('#new-wishlist-btn').addEventListener('click', () => openWishlistForm('Create wishlist'));
  actions.querySelector('#run-matchmaking-btn').addEventListener('click', () => demonstrateMatchmaking(buyer));
  actions.querySelector('#market-intelligence-btn').addEventListener('click', () => {
    // Use buyer's first wishlist preferences for market analysis
    const wishlist = buyer.wishlists[0];
    const bedrooms = wishlist.mustHaves.find(h => h.includes('bedroom'))?.match(/\d+/)?.[0] || 3;
    const bathrooms = wishlist.mustHaves.find(h => h.includes('bathroom'))?.match(/\d+/)?.[0] || 2;
    const neighbourhood = wishlist.locations[0] || 'Overall Market';
    showMarketIntelligence(bedrooms, bathrooms, neighbourhood);
  });

  // Add buyer preference questions section
  const preferencesSection = renderBuyerPreferences(buyer);

  section.append(wishlistGrid, actions, preferencesSection, renderBuyerMessaging(buyer));
  return section;
}

function renderBuyerPreferences(buyer) {
  // Check if buyer already has agent/preapproval (simulate checking user profile)
  const hasAgent = buyer.hasAgent || false;
  const isPreapproved = buyer.isPreapproved || false;
  
  // Don't show referral questions if they already have support
  if (hasAgent && isPreapproved) {
    return document.createElement('div'); // Return empty div
  }

  const preferencesCard = document.createElement('div');
  preferencesCard.className = 'card buyer-preferences';
  
  let questionsHtml = '<div class="card-header"><h3>🎯 Let us help you succeed</h3></div><div class="card-body">';
  
  if (!isPreapproved) {
    questionsHtml += `
      <div class="preference-question">
        <h4>Are you pre-approved for a mortgage?</h4>
        <div class="preference-options">
          <label><input type="radio" name="preapproved" value="yes"> Yes, I'm pre-approved</label>
          <label><input type="radio" name="preapproved" value="no"> No, not yet</label>
          <label><input type="radio" name="preapproved" value="unsure"> I'm not sure</label>
        </div>
        <div class="preapproval-benefits" style="display: none;">
          <div class="success-highlight">
            <p><strong>💡 Did you know?</strong> Pre-approved buyers are:</p>
            <ul>
              <li>${preapprovalStats.successRates.preapproved.purchaseWithin3Months}% more likely to purchase within 3 months</li>
              <li>${preapprovalStats.successRates.preapproved.purchaseWithin6Months}% more likely to purchase within 6 months</li>
              <li>More competitive in multiple offer situations</li>
            </ul>
            <button class="ghost-button" onclick="showMortgageContacts()">Connect with Mortgage Professional</button>
          </div>
        </div>
      </div>
    `;
  }
  
  if (!hasAgent) {
    questionsHtml += `
      <div class="preference-question">
        <h4>Are you currently working with a real estate agent?</h4>
        <div class="preference-options">
          <label><input type="radio" name="hasAgent" value="yes"> Yes, I have an agent</label>
          <label><input type="radio" name="hasAgent" value="no"> No, I'm looking on my own</label>
          <label><input type="radio" name="hasAgent" value="considering"> I'm considering getting one</label>
        </div>
        <div class="agent-benefits" style="display: none;">
          <div class="success-highlight">
            <p><strong>🏠 Agent Benefits:</strong></p>
            <ul>
              <li>${preapprovalStats.withAgent.purchaseWithin3Months}% faster to find and purchase</li>
              <li>Average savings: $${preapprovalStats.withAgent.averageNegotiationSavings.toLocaleString()} in negotiations</li>
              <li>Expert guidance through offers and closing</li>
              <li>Access to off-market properties</li>
            </ul>
            <button class="ghost-button" onclick="showRealtorContacts()">Browse Kingston Realtors</button>
          </div>
        </div>
      </div>
    `;
  }
  
  questionsHtml += '</div>';
  preferencesCard.innerHTML = questionsHtml;
  
  // Add event listeners for the radio buttons
  preferencesCard.addEventListener('change', (e) => {
    if (e.target.name === 'preapproved' && (e.target.value === 'no' || e.target.value === 'unsure')) {
      preferencesCard.querySelector('.preapproval-benefits').style.display = 'block';
    }
    if (e.target.name === 'hasAgent' && (e.target.value === 'no' || e.target.value === 'considering')) {
      preferencesCard.querySelector('.agent-benefits').style.display = 'block';
    }
  });
  
  return preferencesCard;
}

function renderBuyerMessaging(buyer) {
  const messagingSection = document.createElement('section');
  messagingSection.className = 'section';
  messagingSection.innerHTML = `
    <div class="section-header">
      <h2>Messages</h2>
      <p class="section-description">In-app chat keeps personal contact details private. Buyers can respond when sellers or agents initiate contact.</p>
    </div>
    <div class="messaging-notice">
      <div class="notice-card">
        <h3>🔒 Messaging for Buyers</h3>
        <p>As a registered buyer, you can <strong>receive and respond</strong> to messages from sellers, agents, and mortgage professionals. You cannot initiate conversations, but they can contact you about matches!</p>
        <div class="notice-features">
          <span class="pill">✓ Receive messages</span>
          <span class="pill">✓ Respond to inquiries</span>
          <span class="pill">✓ Private & secure</span>
        </div>
      </div>
    </div>
    <div class="grid grid-2">
      ${buyer.messages
        .map(
          (thread) => `
            <article class="card">
              <div class="card-header">
                <h3>${thread.counterparty}</h3>
                <span class="badge">${thread.status}</span>
              </div>
              <div class="card-body">
                <p><strong>Wishlist:</strong> ${thread.wishlist}</p>
                <p>${thread.preview}</p>
              </div>
              <div class="card-footer">
                <button class="ghost-button" data-thread="${thread.id}">Open chat</button>
              </div>
            </article>
          `,
        )
        .join('')}
    </div>
  `;

  messagingSection.querySelectorAll('button[data-thread]').forEach((button) => {
    button.addEventListener('click', (event) => openChat(event.target.dataset.thread, 'buyer'));
  });

  return messagingSection;
}

function renderSellerExperience() {
  const section = createSection({
    title: 'Seller / homeowner workspace',
    description: 'Optimise listings with demand metrics and paid upgrades for outreach.',
  });

  const listingGrid = document.createElement('div');
  listingGrid.className = 'grid grid-2';

  listings.forEach((listing) => {
    const template = document.getElementById('listing-card-template');
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector('.listing-hero').src = listing.photo;
    node.querySelector('.listing-address').textContent = listing.address;
    node.querySelector('.listing-status').textContent = listing.status;
    node.querySelector('.listing-summary').textContent = listing.summary;
    node.querySelector('.listing-score').textContent = `${listing.score}%`;
    node.querySelector('.listing-matches').textContent = `${listing.matchedBuyers} buyers`;
    node.querySelector('.listing-price').textContent = `$${listing.price.toLocaleString()}`;
    node.querySelector('.listing-type').textContent = listing.type;

    const chips = node.querySelector('.insight-chips');
    listing.highlights.forEach((highlight) => {
      const span = document.createElement('span');
      span.className = 'insight-chip';
      span.textContent = highlight;
      chips.append(span);
    });

    node.querySelector('.view-insights').addEventListener('click', () => openListingInsights(listing));
    node.querySelector('.contact-buyers').addEventListener('click', () => openUpgradePrompt());

    listingGrid.append(node);
  });

  section.append(listingGrid, renderSellerAnalytics());
  return section;
}

function renderSellerAnalytics() {
  const analytics = document.createElement('section');
  analytics.className = 'section';
  analytics.innerHTML = `
    <div class="section-header">
      <h2>Demand analytics</h2>
      <p class="section-description">Aggregate interest by budget, features, and buyer timelines.</p>
    </div>
    <div class="analytics-grid">
      <article class="analytics-card">
        <h3>Budget distribution</h3>
        ${renderMetric('Under $900K', 45)}
        ${renderMetric('$900K - $1.1M', 30)}
        ${renderMetric('$1.1M+', 25)}
      </article>
      <article class="analytics-card">
        <h3>Top requested features</h3>
        <ul>
          <li>3+ bedrooms (82% of matched buyers)</li>
          <li>Dedicated office space (54%)</li>
          <li>EV-ready parking (31%)</li>
        </ul>
      </article>
      <article class="analytics-card">
        <h3>Timeline urgency</h3>
        ${renderMetric('0-3 months', 38)}
        ${renderMetric('3-6 months', 42)}
        ${renderMetric('6+ months', 20)}
      </article>
    </div>
  `;

  return analytics;
}

function renderMetric(label, value) {
  return `
    <div>
      <div class="section-description" style="font-size:0.85rem;">${label}</div>
      <div class="metric-bar"><span style="width:${value}%;"></span></div>
    </div>
  `;
}

function renderAgentExperience() {
  const section = createSection({
    title: 'Agent Pro analytics',
    description: 'Discover buyer heatmaps, demand funnels, and multi-listing match strategies.',
  });

  const overview = document.createElement('div');
  overview.className = 'analytics-grid';

  agents.analyticsCards.forEach((card) => {
    const el = document.createElement('article');
    el.className = 'analytics-card';
    el.innerHTML = `<h3>${card.title}</h3><ul>${card.points.map((p) => `<li>${p}</li>`).join('')}</ul>`;
    overview.append(el);
  });

  const table = document.createElement('table');
  table.className = 'table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Wishlist</th>
        <th>Target Area</th>
        <th>Match Score</th>
        <th>Aligned Listings</th>
      </tr>
    </thead>
    <tbody>
      ${agents.matches
        .map(
          (match) => `
            <tr>
              <td>${match.alias}</td>
              <td>${match.area}</td>
              <td>${match.score}%</td>
              <td>${match.listings.join(', ')}</td>
            </tr>
          `,
        )
        .join('')}
    </tbody>
  `;

  section.append(overview, table);
  return section;
}

function renderMortgageExperience() {
  const section = createSection({
    title: 'Mortgage agent workspace',
    description: 'Prioritise leads who request outreach or need financing support.',
  });

  const leadGrid = document.createElement('div');
  leadGrid.className = 'grid grid-2';

  mortgageLeads.forEach((lead) => {
    const template = document.getElementById('lead-card-template');
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector('.lead-name').textContent = lead.name;
    node.querySelector('.lead-status').textContent = lead.status;
    node.querySelector('.lead-location').textContent = lead.location;
    node.querySelector('.lead-budget').textContent = `$${lead.budget.min.toLocaleString()} - $${lead.budget.max.toLocaleString()}`;
    node.querySelector('.lead-timeline').textContent = lead.timeline;
    node.querySelector('.lead-notes').textContent = lead.notes;
    node.querySelector('.start-chat').addEventListener('click', () => openChat(lead.threadId));

    leadGrid.append(node);
  });

  section.append(leadGrid);
  return section;
}

function openWishlistModal(wishlist) {
  modalTitle.textContent = `${wishlist.name} · Match insights`;
  modalContent.innerHTML = `
    <div class="form-grid">
      <div>
        <h3>Location focus</h3>
        <p>${wishlist.locations.join(', ')}</p>
      </div>
      <div>
        <h3>Feature priorities</h3>
        <ul>
          ${wishlist.mustHaves.map((f) => `<li><strong>Must:</strong> ${f}</li>`).join('')}
          ${wishlist.niceToHaves.map((f) => `<li><strong>Nice:</strong> ${f}</li>`).join('')}
        </ul>
      </div>
      <div>
        <h3>Analytics</h3>
        <p>Average listing price in focus area: $${wishlist.analytics.avgPrice.toLocaleString()}</p>
        <p>Matching sellers: ${wishlist.matches}</p>
        <p>New matches this week: ${wishlist.analytics.newThisWeek}</p>
      </div>
    </div>
  `;
  modal.showModal();
}

function openWishlistForm(title, wishlist) {
  modalTitle.textContent = title;
  modalContent.innerHTML = `
    <form id="wishlist-form" class="form-grid">
      <label>
        Wishlist name
        <input name="name" required value="${wishlist?.name ?? ''}" />
      </label>
      <label>
        Target locations (comma separated)
        <input name="locations" value="${wishlist?.locations.join(', ') ?? ''}" />
      </label>
      <label>
        Budget range
        <div class="form-grid" style="grid-template-columns: repeat(2, minmax(0, 1fr));">
          <input name="min" type="number" min="0" placeholder="Min" value="${wishlist?.budget.min ?? ''}" />
          <input name="max" type="number" min="0" placeholder="Max" value="${wishlist?.budget.max ?? ''}" />
        </div>
      </label>
      <label>
        Timeline
        <select name="timeline">
          ${['0-3 months', '3-6 months', '6+ months']
            .map((option) => `<option value="${option}" ${wishlist?.timeline === option ? 'selected' : ''}>${option}</option>`)
            .join('')}
        </select>
      </label>
      <label>
        Must-have features
        <textarea name="mustHaves" placeholder="List features separated by commas">${wishlist?.mustHaves.join(', ') ?? ''}</textarea>
      </label>
      <label>
        Nice-to-have features
        <textarea name="niceToHaves" placeholder="List features separated by commas">${wishlist?.niceToHaves.join(', ') ?? ''}</textarea>
      </label>
      <div class="form-actions">
        <button type="submit" class="primary-button">Save wishlist</button>
      </div>
    </form>
  `;

  modal.showModal();

  const form = document.getElementById('wishlist-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const updatedWishlist = {
      id: wishlist?.id ?? generateId('wishlist'),
      name: formData.get('name'),
      locations: formData.get('locations').split(',').map((item) => item.trim()).filter(Boolean),
      budget: {
        min: Number(formData.get('min')),
        max: Number(formData.get('max')),
      },
      timeline: formData.get('timeline'),
      mustHaves: formData.get('mustHaves').split(',').map((item) => item.trim()).filter(Boolean),
      niceToHaves: formData.get('niceToHaves').split(',').map((item) => item.trim()).filter(Boolean),
      description: wishlist?.description ?? 'Updated wishlist requirements.',
      matches: wishlist?.matches ?? 0,
      topMatch: wishlist?.topMatch ?? 0,
      active: true,
      analytics: wishlist?.analytics ?? { avgPrice: 0, newThisWeek: 0 },
    };

    const buyer = buyers.find((b) => b.id === state.buyerId);
    const existingIndex = buyer.wishlists.findIndex((w) => w.id === updatedWishlist.id);
    if (existingIndex >= 0) {
      buyer.wishlists.splice(existingIndex, 1, updatedWishlist);
    } else {
      buyer.wishlists.push({ ...updatedWishlist, matches: Math.floor(Math.random() * 15), topMatch: 75 + Math.floor(Math.random() * 20) });
    }

    modal.close();
    renderApp();
  });
}

function duplicateWishlist(buyerId, wishlistId) {
  const buyer = buyers.find((b) => b.id === buyerId);
  const wishlist = buyer.wishlists.find((w) => w.id === wishlistId);
  const clone = safeStructuredClone(wishlist);
  clone.id = generateId('wishlist');
  clone.name = `${clone.name} (Copy)`;
  clone.analytics.newThisWeek = 0;
  clone.matches = Math.floor(clone.matches * 0.6);
  clone.topMatch = Math.min(100, clone.topMatch - 5);
  buyer.wishlists.unshift(clone);
  renderApp();
}

function openListingInsights(listing) {
  modalTitle.textContent = `${listing.address} · Buyer demand`; 
  modalContent.innerHTML = `
    <div class="form-grid">
      <div>
        <h3>Match quality</h3>
        ${renderMetric('Feature fit', listing.metrics.feature)}
        ${renderMetric('Location overlap', listing.metrics.location)}
        ${renderMetric('Timeline alignment', listing.metrics.timeline)}
      </div>
      <div>
        <h3>Top wishlists</h3>
        <ul>
          ${listing.topWishlists.map((item) => `<li>${item.alias} · ${item.score}% match</li>`).join('')}
        </ul>
      </div>
      <div>
        <h3>Upgrade message</h3>
        <p>Upgrade to unlock buyer profiles and start direct conversations with the ${listing.matchedBuyers} matched buyers.</p>
      </div>
    </div>
  `;
  modal.showModal();
}

function openUpgradePrompt() {
  modalTitle.textContent = 'Upgrade required';
  modalContent.innerHTML = `
    <p>Messaging buyers and viewing detailed analytics is reserved for Seller Pro accounts. Upgrade now to unlock conversations, lead insights, and export capabilities.</p>
    <div class="form-actions">
      <button class="ghost-button" value="cancel">Later</button>
      <button class="primary-button" value="confirm">Upgrade to Pro</button>
    </div>
  `;
  modal.showModal();
}

function openChat(threadId, userRole = state.role) {
  const userId = state.role === 'buyer' ? state.buyerId : `${state.role}-1`;
  
  // Check if user can message
  if (!SubscriptionManager.canUserMessage(userId, userRole)) {
    modalTitle.textContent = 'Messaging Access';
    modalContent.innerHTML = `
      <div class="subscription-notice">
        <h3>💬 ${userRole === 'buyer' ? 'Buyer Messaging' : 'Subscription Required'}</h3>
        <p>${SubscriptionManager.getUpgradePrompt(userRole)}</p>
        ${userRole === 'buyer' ? `
          <div class="buyer-messaging-info">
            <p><strong>Good news!</strong> You can still:</p>
            <ul>
              <li>✓ Receive messages from sellers and agents</li>
              <li>✓ Respond to their inquiries</li>
              <li>✓ Get notified about new matches</li>
            </ul>
            <p>Sellers and agents with subscriptions can initiate conversations with you.</p>
          </div>
        ` : `
          <div class="form-actions">
            <button class="ghost-button" value="cancel">Later</button>
            <button class="primary-button" value="confirm">Upgrade Now</button>
          </div>
        `}
      </div>
    `;
    modal.showModal();
    return;
  }
  
  modalTitle.textContent = 'Secure messaging';
  modalContent.innerHTML = `
    <div class="form-grid">
      <p>Chat thread <strong>${threadId}</strong> opens within the in-app messenger. For demo purposes, this shows how conversations remain private and auditable.</p>
      <div class="chat-preview">
        <div class="message received">
          <p>Hi! I noticed your listing matches several buyer wishlists. Are you open to a quick call?</p>
          <span class="timestamp">2 hours ago</span>
        </div>
        <div class="message sent">
          <p>Absolutely! I'm available this afternoon. What questions do you have?</p>
          <span class="timestamp">1 hour ago</span>
        </div>
      </div>
      <textarea placeholder="Type a reply..." rows="4"></textarea>
      <div class="form-actions">
        <button class="ghost-button">Attach File</button>
        <button class="primary-button" onclick="sendMessage()">Send message</button>
        <button class="ghost-button" onclick="testIFTTT()" title="Test IFTTT Integration">🔗 Test IFTTT</button>
      </div>
    </div>
  `;
  modal.showModal();
}

function demonstrateMatchmaking(buyer) {
  const wishlist = buyer.wishlists[0]; // Use first wishlist for demo
  const matches = MatchmakingEngine.findMatches(wishlist);
  
  modalTitle.textContent = '🔍 Matchmaking Engine Demo';
  modalContent.innerHTML = `
    <div class="matchmaking-demo">
      <h3>Running matchmaking for: "${wishlist.name}"</h3>
      <div class="wishlist-criteria">
        <p><strong>Budget:</strong> $${wishlist.budget.min.toLocaleString()} - $${wishlist.budget.max.toLocaleString()}</p>
        <p><strong>Locations:</strong> ${wishlist.locations.join(', ')}</p>
        <p><strong>Timeline:</strong> ${wishlist.timeline}</p>
      </div>
      
      <div class="matching-results">
        <h4>🎯 Found ${matches.length} matches:</h4>
        ${matches.map(match => `
          <div class="match-result">
            <div class="match-header">
              <h5>${match.listing.address}</h5>
              <span class="match-score">${match.score}%</span>
            </div>
            <p class="match-details">
              ${match.listing.summary}<br>
              <strong>Price:</strong> $${match.listing.price.toLocaleString()} | 
              <strong>Type:</strong> ${match.listing.type}
            </p>
            <div class="score-breakdown">
              <small>
                📍 Location: ${Math.round(MatchmakingEngine.calculateLocationScore(match.listing, wishlist) * 40)}% | 
                💰 Price: ${Math.round(MatchmakingEngine.calculatePriceScore(match.listing, wishlist) * 30)}% | 
                🏠 Features: ${Math.round(MatchmakingEngine.calculateFeatureScore(match.listing, wishlist) * 20)}% | 
                ⏰ Timeline: ${Math.round(MatchmakingEngine.calculateTimelineScore(match.listing, wishlist) * 10)}%
              </small>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="algorithm-info">
        <h4>🧮 Algorithm Details:</h4>
        <ul>
          <li><strong>Location Matching (40%):</strong> PostGIS proximity + polygon overlap</li>
          <li><strong>Price Alignment (30%):</strong> Budget range compatibility</li>
          <li><strong>Feature Scoring (20%):</strong> Must-have vs nice-to-have weighting</li>
          <li><strong>Timeline Fit (10%):</strong> Purchase timeline alignment</li>
        </ul>
      </div>
      
      <div class="form-actions">
        <button class="primary-button" value="close">Close Demo</button>
      </div>
    </div>
  `;
  modal.showModal();
}

function showMarketIntelligence(bedrooms = 3, bathrooms = 2, neighbourhood = 'Overall Market') {
  const propertyKey = `${bedrooms}BR/${bathrooms}BA`;
  const propertyData = kingstonMarketData.propertyTypeBreakdown[propertyKey];
  const neighbourhoodData = kingstonMarketData.neighbourhoodBreakdown[neighbourhood];
  
  const avgPrice = propertyData?.avgPrice || kingstonMarketData.averageHomePrices.overall;
  const trend = propertyData?.trend || kingstonMarketData.priceChangeYearOverYear.overall;
  const daysOnMarket = neighbourhoodData?.daysOnMarket || kingstonMarketData.averageDaysOnMarket;
  
  modalTitle.textContent = `📊 Kingston Market Intelligence: ${bedrooms}BR/${bathrooms}BA`;
  modalContent.innerHTML = `
    <div class="market-intelligence">
      <div class="market-overview">
        <h3>Property Type Analysis</h3>
        <div class="market-stats">
          <div class="stat-card">
            <span class="stat-value">$${avgPrice.toLocaleString()}</span>
            <span class="stat-label">Average Price</span>
          </div>
          <div class="stat-card">
            <span class="stat-value ${trend > 0 ? 'positive' : 'negative'}">${trend > 0 ? '+' : ''}${trend}%</span>
            <span class="stat-label">Year over Year</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${daysOnMarket}</span>
            <span class="stat-label">Avg Days on Market</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${propertyData?.inventory || 'N/A'}</span>
            <span class="stat-label">Active Listings</span>
          </div>
        </div>
      </div>

      <div class="affordability-analysis">
        <h3>Buyer Affordability Analysis</h3>
        <div class="affordability-ranges">
          <div class="range-item">
            <span class="range-label">Budget $500K-$600K:</span>
            <span class="affordability ${avgPrice <= 600000 ? 'affordable' : 'stretch'}">
              ${avgPrice <= 600000 ? '✅ Affordable' : `❌ ${Math.round(((avgPrice - 600000) / 600000) * 100)}% over budget`}
            </span>
          </div>
          <div class="range-item">
            <span class="range-label">Budget $600K-$750K:</span>
            <span class="affordability ${avgPrice <= 750000 ? 'affordable' : 'stretch'}">
              ${avgPrice <= 750000 ? '✅ Affordable' : `❌ ${Math.round(((avgPrice - 750000) / 750000) * 100)}% over budget`}
            </span>
          </div>
          <div class="range-item">
            <span class="range-label">Budget $750K-$900K:</span>
            <span class="affordability ${avgPrice <= 900000 ? 'affordable' : 'stretch'}">
              ${avgPrice <= 900000 ? '✅ Affordable' : `❌ ${Math.round(((avgPrice - 900000) / 900000) * 100)}% over budget`}
            </span>
          </div>
        </div>
      </div>

      <div class="neighbourhood-breakdown">
        <h3>Neighbourhood Comparison</h3>
        <div class="neighbourhood-grid">
          ${Object.entries(kingstonMarketData.neighbourhoodBreakdown).map(([name, data]) => `
            <div class="neighbourhood-card ${name === neighbourhood ? 'selected' : ''}">
              <h4>${name}</h4>
              <p>Avg: $${data.avgPrice.toLocaleString()}</p>
              <p class="trend ${data.trend === 'rising' ? 'positive' : 'neutral'}">${data.trend}</p>
              <p>${data.daysOnMarket} days on market</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="preapproval-benefits">
        <h3>💡 Success Statistics</h3>
        <div class="success-stats">
          <div class="stat-comparison">
            <div class="stat-group">
              <h4>Pre-approved Buyers</h4>
              <p>✅ ${preapprovalStats.successRates.preapproved.purchaseWithin3Months}% purchase within 3 months</p>
              <p>✅ ${preapprovalStats.successRates.preapproved.purchaseWithin6Months}% purchase within 6 months</p>
            </div>
            <div class="stat-group">
              <h4>Not Pre-approved</h4>
              <p>⚠️ ${preapprovalStats.successRates.notPreapproved.purchaseWithin3Months}% purchase within 3 months</p>
              <p>⚠️ ${preapprovalStats.successRates.notPreapproved.purchaseWithin6Months}% purchase within 6 months</p>
            </div>
          </div>
          
          <div class="agent-benefits">
            <h4>🏠 Working with an Agent Benefits</h4>
            <p>• ${preapprovalStats.withAgent.purchaseWithin3Months}% faster purchase completion</p>
            <p>• Average savings: $${preapprovalStats.withAgent.averageNegotiationSavings.toLocaleString()} in negotiations</p>
            <p>• ${preapprovalStats.withAgent.purchaseWithin6Months}% purchase within 6 months</p>
          </div>
        </div>
      </div>

      <div class="local-services">
        <h3>🤝 Kingston Area Professionals</h3>
        <div class="services-grid">
          <div class="service-section">
            <h4>Top Realtors</h4>
            ${localServiceProviders.realtors.slice(0, 2).map(realtor => `
              <div class="provider-card">
                <h5>${realtor.name}</h5>
                <p>${realtor.brokerage}</p>
                <p>⭐ ${realtor.rating} (${realtor.reviewCount} reviews)</p>
                <p>📞 ${realtor.phoneNumber}</p>
                <p class="specialties">${realtor.specialties.join(', ')}</p>
                <p class="savings">Avg client savings: $${realtor.clientsSaved.toLocaleString()}</p>
              </div>
            `).join('')}
          </div>
          
          <div class="service-section">
            <h4>Mortgage Specialists</h4>
            ${localServiceProviders.mortgageAgents.slice(0, 2).map(agent => `
              <div class="provider-card">
                <h5>${agent.name}</h5>
                <p>${agent.company}</p>
                <p>⭐ ${agent.rating} (${agent.reviewCount} reviews)</p>
                <p>📞 ${agent.phoneNumber}</p>
                <p class="specialties">${agent.specialties.join(', ')}</p>
                <p class="approval">Avg approval: ${agent.averageApprovalTime} days</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button class="primary-button" onclick="modal.close()">Close Analysis</button>
        <button class="ghost-button" onclick="contactProfessional()">Connect with Professional</button>
      </div>
    </div>
  `;
  modal.showModal();
}

function createSection({ title, description }) {
  const section = document.createElement('section');
  section.className = 'section';
  section.innerHTML = `
    <div class="section-header">
      <h2>${title}</h2>
      <p class="section-description">${description}</p>
    </div>
  `;
  return section;
}

// Google Maps Integration
let map;
let markers = [];

function initMap() {
  console.log('Google Maps API loaded');
  // This will be called when Google Maps API loads
  // The actual map initialization happens in initCommunityMap
}

function initCommunityMap() {
  const mapContainer = document.getElementById('google-map');
  if (!mapContainer) {
    console.log('Map container not found, retrying...');
    setTimeout(initCommunityMap, 500);
    return;
  }

  if (!window.google || !window.google.maps) {
    console.log('Google Maps API not loaded yet, showing fallback');
    mapContainer.innerHTML = `
      <div class="map-fallback">
        <h3>🗺️ Interactive Map</h3>
        <p>Google Maps integration ready - API key needed for full functionality</p>
        <div class="community-list">
          ${communityInterest.map(community => `
            <div class="community-item">
              <div class="community-info">
                <h4>${community.name}</h4>
                <p><strong>${community.activeBuyers}</strong> active buyers</p>
                <p>Avg budget: <strong>$${community.avgBudget.toLocaleString()}</strong></p>
                <div class="features">
                  ${community.topFeatures.slice(0, 2).map(feature => `<span class="pill">${feature}</span>`).join('')}
                </div>
              </div>
              <div class="buyer-indicator ${community.activeBuyers >= 20 ? 'high' : community.activeBuyers >= 10 ? 'medium' : 'low'}">
                ${community.activeBuyers}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    return;
  }

  try {
    // Center map on Kingston, Ontario area
    const kingstonCenter = { lat: 44.2312, lng: -76.4860 };
    
    map = new google.maps.Map(mapContainer, {
      zoom: 11,
      center: kingstonCenter,
      mapTypeId: 'roadmap',
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // Add markers for each community
    communityInterest.forEach(community => {
      const position = {
        lat: community.coordinates[0],
        lng: community.coordinates[1]
      };

      // Create custom marker
      const markerColor = community.activeBuyers >= 20 ? '#dc2626' : 
                         community.activeBuyers >= 10 ? '#ea580c' : '#16a34a';

      const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: community.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: markerColor,
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="map-info-window">
            <h4>${community.name}</h4>
            <p><strong>${community.activeBuyers}</strong> active buyers</p>
            <p>Avg budget: <strong>$${community.avgBudget.toLocaleString()}</strong></p>
            <div class="info-features">
              ${community.topFeatures.slice(0, 3).map(feature => `<span class="info-pill">${feature}</span>`).join('')}
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        // Close other info windows
        markers.forEach(m => m.infoWindow.close());
        infoWindow.open(map, marker);
      });

      markers.push({ marker, infoWindow });
    });

    console.log('Google Map initialized with', markers.length, 'community markers');

  } catch (error) {
    console.error('Error initializing Google Map:', error);
    mapContainer.innerHTML = `
      <div class="map-error">
        <h3>⚠️ Map Loading Error</h3>
        <p>Unable to load interactive map. Please check console for details.</p>
      </div>
    `;
  }
}

// Make initMap available globally for Google Maps callback
window.initMap = initMap;

// Message and IFTTT functions
function sendMessage() {
  // Trigger IFTTT notification for new message
  iftttService.notifyMessage({
    fromRole: state.role || 'user',
    fromName: 'Platform User',
    subject: 'Property Inquiry',
    subscriptionTier: userSubscriptions[`${state.role}-1`]?.tier || 'free'
  });
  
  alert('Message sent! IFTTT notification triggered.');
  modal.close();
}

function testIFTTT() {
  // Test all IFTTT integrations
  iftttService.notifyNewBuyer({
    name: 'Test Buyer',
    budget: { min: 800000, max: 1200000 },
    timeline: '3 months',
    location: 'Vancouver'
  });
  
  iftttService.notifyCommunityInterest({
    name: 'Test Community',
    activeBuyers: 25,
    avgBudget: 950000,
    topFeatures: ['Modern', 'Transit', 'Schools']
  });
  
  iftttService.notifyPriceAlert({
    propertyAddress: '123 Test Street, Vancouver',
    oldPrice: 900000,
    newPrice: 850000,
    change: -5.6
  });
  
  alert('IFTTT test notifications sent! Check your connected apps/services.');
}

function showMortgageContacts() {
  modalTitle.textContent = '🏦 Kingston Mortgage Specialists';
  modalContent.innerHTML = `
    <div class="professional-contacts">
      <div class="intro-text">
        <p><strong>Get pre-approved faster</strong> - Connect with top-rated mortgage professionals in Kingston who specialize in helping buyers secure competitive rates and fast approvals.</p>
      </div>
      
      ${localServiceProviders.mortgageAgents.map(agent => `
        <div class="provider-detail-card">
          <div class="provider-header">
            <h3>${agent.name}</h3>
            <span class="rating">⭐ ${agent.rating}/5.0 (${agent.reviewCount} reviews)</span>
          </div>
          <div class="provider-info">
            <p><strong>${agent.company}</strong></p>
            <p><strong>Specialties:</strong> ${agent.specialties.join(', ')}</p>
            <p><strong>Average Approval Time:</strong> ${agent.averageApprovalTime} days</p>
            <p><strong>Pre-approval Accuracy:</strong> ${agent.preapprovalAccuracy}%</p>
            <div class="contact-info">
              <p>📞 <a href="tel:${agent.phoneNumber}">${agent.phoneNumber}</a></p>
              <p>📧 <a href="mailto:${agent.email}">${agent.email}</a></p>
            </div>
            <button class="primary-button" onclick="contactProfessional('${agent.id}', 'mortgage')">Contact ${agent.name}</button>
          </div>
        </div>
      `).join('')}
      
      <div class="preapproval-tips">
        <h4>💡 Pre-approval Tips</h4>
        <ul>
          <li>Gather 2 years of tax returns and recent pay stubs</li>
          <li>Check your credit score beforehand</li>
          <li>Avoid large purchases or credit applications during the process</li>
          <li>Get pre-approved before house hunting for best negotiating position</li>
        </ul>
      </div>
    </div>
  `;
  modal.showModal();
}

function showRealtorContacts() {
  modalTitle.textContent = '🏠 Kingston Real Estate Professionals';
  modalContent.innerHTML = `
    <div class="professional-contacts">
      <div class="intro-text">
        <p><strong>Find your perfect home faster</strong> - Work with experienced Kingston realtors who know the local market and can help you navigate the buying process.</p>
      </div>
      
      ${localServiceProviders.realtors.map(realtor => `
        <div class="provider-detail-card">
          <div class="provider-header">
            <h3>${realtor.name}</h3>
            <span class="rating">⭐ ${realtor.rating}/5.0 (${realtor.reviewCount} reviews)</span>
          </div>
          <div class="provider-info">
            <p><strong>${realtor.brokerage}</strong></p>
            <p><strong>Specialties:</strong> ${realtor.specialties.join(', ')}</p>
            <p><strong>Neighbourhoods:</strong> ${realtor.neighbourhoods.join(', ')}</p>
            <p><strong>Average Closing Time:</strong> ${realtor.averageClosingTime} days</p>
            <p><strong>Average Client Savings:</strong> $${realtor.clientsSaved.toLocaleString()}</p>
            <div class="contact-info">
              <p>📞 <a href="tel:${realtor.phoneNumber}">${realtor.phoneNumber}</a></p>
              <p>📧 <a href="mailto:${realtor.email}">${realtor.email}</a></p>
            </div>
            <button class="primary-button" onclick="contactProfessional('${realtor.id}', 'realtor')">Contact ${realtor.name}</button>
          </div>
        </div>
      `).join('')}
      
      <div class="agent-benefits-detail">
        <h4>🎯 Why Work with an Agent?</h4>
        <ul>
          <li><strong>Market Knowledge:</strong> Deep understanding of Kingston neighbourhoods and pricing</li>
          <li><strong>Negotiation Power:</strong> Professional negotiation saves average $${preapprovalStats.withAgent.averageNegotiationSavings.toLocaleString()}</li>
          <li><strong>Network Access:</strong> Connections to inspectors, lawyers, and other professionals</li>
          <li><strong>Time Savings:</strong> Handle paperwork, scheduling, and coordination</li>
          <li><strong>Market Timing:</strong> Know when to move fast or wait for better opportunities</li>
        </ul>
      </div>
    </div>
  `;
  modal.showModal();
}

function contactProfessional(professionalId, type) {
  // Trigger IFTTT notification for professional contact
  iftttService.notifyMessage({
    fromRole: 'buyer',
    fromName: 'Platform Buyer',
    subject: `Professional ${type} contact request`,
    subscriptionTier: 'free'
  });
  
  alert(`Contact request sent! ${type === 'mortgage' ? 'Mortgage specialist' : 'Realtor'} will reach out within 24 hours.`);
  modal.close();
}

// Comprehensive Buyer Onboarding System
function startBuyerOnboarding() {
  modalTitle.textContent = '🏠 Welcome to Your Home Buying Journey';
  modalContent.innerHTML = `
    <div class="onboarding-container">
      <div class="onboarding-progress">
        <div class="progress-step active" data-step="1">Profile</div>
        <div class="progress-step" data-step="2">Budget</div>
        <div class="progress-step" data-step="3">Timeline</div>
        <div class="progress-step" data-step="4">Mortgage</div>
        <div class="progress-step" data-step="5">Preferences</div>
      </div>
      
      <div id="onboarding-content">
        <!-- Dynamic content based on current step -->
      </div>
      
      <div class="onboarding-actions">
        <button class="ghost-button" id="prev-step" style="display: none;">Previous</button>
        <button class="primary-button" id="next-step">Get Started</button>
      </div>
    </div>
  `;
  
  // Initialize onboarding state
  window.onboardingData = JSON.parse(JSON.stringify(buyerProfileStructure));
  window.currentStep = 1;
  
  // Add event listeners
  modalContent.querySelector('#next-step').addEventListener('click', handleOnboardingNext);
  modalContent.querySelector('#prev-step').addEventListener('click', handleOnboardingPrev);
  
  // Render first step
  renderOnboardingStep(1);
  modal.showModal();
}

// Comprehensive Seller Onboarding System
function startSellerOnboarding() {
  modalTitle.textContent = '🏠 Welcome to Kingston Seller Platform';
  modalContent.innerHTML = `
    <div class="onboarding-container">
      <div class="onboarding-progress">
        <div class="progress-step active" data-step="1">Profile</div>
        <div class="progress-step" data-step="2">Role</div>
        <div class="progress-step" data-step="3">Agent Link</div>
        <div class="progress-step" data-step="4">Subscription</div>
        <div class="progress-step" data-step="5">Preferences</div>
      </div>
      
      <div id="seller-onboarding-content">
        <!-- Dynamic content based on current step -->
      </div>
      
      <div class="onboarding-actions">
        <button class="ghost-button" id="seller-prev-step" style="display: none;">Previous</button>
        <button class="primary-button" id="seller-next-step">Get Started</button>
      </div>
    </div>
  `;
  
  // Initialize seller onboarding state
  window.sellerOnboardingData = JSON.parse(JSON.stringify(sellerProfileStructure));
  window.sellerCurrentStep = 1;
  
  // Add event listeners
  modalContent.querySelector('#seller-next-step').addEventListener('click', handleSellerOnboardingNext);
  modalContent.querySelector('#seller-prev-step').addEventListener('click', handleSellerOnboardingPrev);
  
  // Render first step
  renderSellerOnboardingStep(1);
  modal.showModal();
}

function handleOnboardingNext() {
  if (validateCurrentStep()) {
    if (window.currentStep < 5) {
      window.currentStep++;
      renderOnboardingStep(window.currentStep);
      updateOnboardingProgress();
    } else {
      completeOnboarding();
    }
  }
}

function handleOnboardingPrev() {
  if (window.currentStep > 1) {
    window.currentStep--;
    renderOnboardingStep(window.currentStep);
    updateOnboardingProgress();
  }
}

function renderOnboardingStep(step) {
  const content = document.getElementById('onboarding-content');
  const nextBtn = document.getElementById('next-step');
  const prevBtn = document.getElementById('prev-step');
  
  // Show/hide navigation buttons
  prevBtn.style.display = step > 1 ? 'inline-block' : 'none';
  nextBtn.textContent = step === 5 ? 'Complete Setup' : 'Continue';
  
  switch(step) {
    case 1:
      content.innerHTML = renderProfileStep();
      break;
    case 2:
      content.innerHTML = renderBudgetStep();
      break;
    case 3:
      content.innerHTML = renderTimelineStep();
      break;
    case 4:
      content.innerHTML = renderMortgageStep();
      break;
    case 5:
      content.innerHTML = renderPreferencesStep();
      break;
  }
  
  // Add event listeners for form inputs
  addStepEventListeners(step);
}

function renderProfileStep() {
  return `
    <div class="onboarding-step">
      <h3>👋 Let's start with your contact information</h3>
      <p>We'll use this to save your preferences and send you property matches.</p>
      
      <div class="form-grid">
        <div class="form-group">
          <label>First Name *</label>
          <input type="text" id="firstName" value="${window.onboardingData.profile.contactInfo.firstName}" required>
        </div>
        <div class="form-group">
          <label>Last Name *</label>
          <input type="text" id="lastName" value="${window.onboardingData.profile.contactInfo.lastName}" required>
        </div>
        <div class="form-group">
          <label>Email Address *</label>
          <input type="email" id="email" value="${window.onboardingData.profile.contactInfo.email}" required>
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="tel" id="phone" value="${window.onboardingData.profile.contactInfo.phone}">
        </div>
        <div class="form-group full-width">
          <label>Preferred Contact Method</label>
          <div class="radio-group">
            ${['email', 'phone', 'text'].map(method => `
              <label class="radio-label">
                <input type="radio" name="preferredContact" value="${method}" 
                       ${window.onboardingData.profile.contactInfo.preferredContact === method ? 'checked' : ''}>
                ${method.charAt(0).toUpperCase() + method.slice(1)}
              </label>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderBudgetStep() {
  return `
    <div class="onboarding-step">
      <h3>💰 What's your budget range?</h3>
      <p>This helps us show you properties within your price range. You can always adjust this later.</p>
      
      <div class="budget-inputs">
        <div class="form-group">
          <label>Minimum Price</label>
          <div class="currency-input">
            <span class="currency-symbol">$</span>
            <input type="number" id="budgetMin" value="${window.onboardingData.profile.budget.min || ''}" 
                   placeholder="500,000" step="1000">
          </div>
        </div>
        <div class="form-group">
          <label>Maximum Price</label>
          <div class="currency-input">
            <span class="currency-symbol">$</span>
            <input type="number" id="budgetMax" value="${window.onboardingData.profile.budget.max || ''}" 
                   placeholder="750,000" step="1000">
          </div>
        </div>
      </div>
      
      <div class="budget-suggestions">
        <h4>💡 Kingston Price Ranges</h4>
        <div class="price-range-grid">
          ${Object.entries(kingstonMarketData.propertyTypeBreakdown).map(([type, data]) => `
            <div class="price-range-card" onclick="setBudgetRange(${Math.round(data.avgPrice * 0.85)}, ${Math.round(data.avgPrice * 1.15)})">
              <h5>${type}</h5>
              <p>$${Math.round(data.avgPrice * 0.85 / 1000)}K - $${Math.round(data.avgPrice * 1.15 / 1000)}K</p>
              <span class="avg-price">Avg: $${Math.round(data.avgPrice / 1000)}K</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderTimelineStep() {
  return `
    <div class="onboarding-step">
      <h3>⏰ When are you looking to buy?</h3>
      <p>Your timeline helps us prioritize properties and connect you with the right professionals.</p>
      
      <div class="timeline-options">
        ${timelineOptions.map(option => `
          <div class="timeline-card ${window.onboardingData.profile.timeline === option.value ? 'selected' : ''}" 
               onclick="selectTimeline('${option.value}')">
            <div class="timeline-header">
              <h4>${option.label}</h4>
              <span class="priority-badge priority-${option.priority}">Priority ${option.priority}</span>
            </div>
            <div class="timeline-benefits">
              ${option.value === 'immediate' ? 
                '<p>✅ First access to new listings<br>✅ Priority agent support<br>✅ Fast-track mortgage processing</p>' :
                option.value === '3months' ?
                '<p>✅ Early property alerts<br>✅ Market trend analysis<br>✅ Pre-approval guidance</p>' :
                '<p>✅ Market monitoring<br>✅ Price trend alerts<br>✅ Educational resources</p>'
              }
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="timeline-stats">
        <h4>📊 Success Statistics by Timeline</h4>
        <p>Buyers ready to purchase within 3 months have a ${preapprovalStats.successRates.preapproved.purchaseWithin3Months}% success rate when pre-approved.</p>
      </div>
    </div>
  `;
}

function renderMortgageStep() {
  return `
    <div class="onboarding-step">
      <h3>🏦 What's your mortgage status?</h3>
      <p>Understanding your financing helps us show you appropriate properties and connect you with professionals.</p>
      
      <div class="mortgage-options">
        ${mortgageStatusOptions.map(option => `
          <div class="mortgage-card ${window.onboardingData.profile.mortgageStatus === option.value ? 'selected' : ''}" 
               onclick="selectMortgageStatus('${option.value}')">
            <div class="mortgage-header">
              <h4>${option.label} ${option.badge ? '<span class="verified-badge">✅ Verified</span>' : ''}</h4>
            </div>
            <p class="mortgage-description">${option.description}</p>
            <div class="mortgage-benefits">
              <strong>Benefits:</strong>
              <ul>
                ${option.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
              </ul>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div id="mortgage-details" style="display: none;">
        <div class="form-grid">
          <div class="form-group">
            <label>Pre-approval Amount</label>
            <div class="currency-input">
              <span class="currency-symbol">$</span>
              <input type="number" id="preapprovalAmount" step="1000" placeholder="750,000">
            </div>
          </div>
          <div class="form-group">
            <label>Lender Name</label>
            <input type="text" id="lenderName" placeholder="Royal Bank of Canada">
          </div>
          <div class="form-group">
            <label>Approval Expiry Date</label>
            <input type="date" id="expiryDate">
          </div>
        </div>
      </div>
      
      <div class="mortgage-help">
        <h4>🤝 Need Help with Financing?</h4>
        <p>Our Kingston mortgage specialists can help you get pre-approved with competitive rates.</p>
        <button class="ghost-button" onclick="showMortgageContacts()">View Mortgage Specialists</button>
      </div>
    </div>
  `;
}

function renderPreferencesStep() {
  return `
    <div class="onboarding-step">
      <h3>🎯 Communication Preferences</h3>
      <p>Choose how you'd like to stay updated on your home buying journey.</p>
      
      <div class="preferences-grid">
        <div class="preference-group">
          <h4>🔔 Notifications</h4>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" name="matchNotifications" checked>
              <span class="checkmark"></span>
              New property matches
            </label>
            <label class="checkbox-label">
              <input type="checkbox" name="marketingEmails">
              <span class="checkmark"></span>
              Market reports & tips
            </label>
            <label class="checkbox-label">
              <input type="checkbox" name="priceAlerts">
              <span class="checkmark"></span>
              Price change alerts
            </label>
          </div>
        </div>
        
        <div class="preference-group">
          <h4>🤝 Professional Contacts</h4>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" name="contactFromAgents" ${window.onboardingData.profile.mortgageStatus === 'none' ? 'checked' : ''}>
              <span class="checkmark"></span>
              Contact from real estate agents
            </label>
            <label class="checkbox-label">
              <input type="checkbox" name="contactFromMortgage" ${window.onboardingData.profile.mortgageStatus === 'none' ? 'checked' : ''}>
              <span class="checkmark"></span>
              Contact from mortgage specialists
            </label>
          </div>
        </div>
      </div>
      
      <div class="privacy-notice">
        <h4>🔒 Privacy & Data</h4>
        <p>Your information is secure and will only be shared with professionals you choose to contact. 
           You can update these preferences anytime in your account settings.</p>
      </div>
      
      <div class="next-steps">
        <h4>🚀 What's Next?</h4>
        <ul>
          <li>Create your first wishlist with specific property requirements</li>
          <li>Explore Kingston neighbourhoods and market data</li>
          <li>Receive personalized property matches</li>
          <li>Connect with local professionals when ready</li>
        </ul>
      </div>
    </div>
  `;
}

function addStepEventListeners(step) {
  switch(step) {
    case 1:
      ['firstName', 'lastName', 'email', 'phone'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.addEventListener('input', (e) => {
            window.onboardingData.profile.contactInfo[id] = e.target.value;
          });
        }
      });
      
      document.querySelectorAll('input[name="preferredContact"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          window.onboardingData.profile.contactInfo.preferredContact = e.target.value;
        });
      });
      break;
      
    case 2:
      ['budgetMin', 'budgetMax'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.addEventListener('input', (e) => {
            const value = parseInt(e.target.value) || null;
            window.onboardingData.profile.budget[id.replace('budget', '').toLowerCase()] = value;
          });
        }
      });
      break;
      
    case 4:
      ['preapprovalAmount', 'lenderName', 'expiryDate'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.addEventListener('input', (e) => {
            const key = id === 'preapprovalAmount' ? 'preapprovalAmount' : 
                       id === 'lenderName' ? 'lenderName' : 'expiryDate';
            const value = id === 'preapprovalAmount' ? (parseInt(e.target.value) || null) : e.target.value;
            window.onboardingData.profile.mortgageDetails[key] = value;
          });
        }
      });
      break;
      
    case 5:
      ['matchNotifications', 'marketingEmails', 'priceAlerts', 'contactFromAgents', 'contactFromMortgage'].forEach(name => {
        const element = document.querySelector(`input[name="${name}"]`);
        if (element) {
          element.addEventListener('change', (e) => {
            window.onboardingData.profile.preferences[name] = e.target.checked;
          });
        }
      });
      break;
  }
}

function setBudgetRange(min, max) {
  document.getElementById('budgetMin').value = min;
  document.getElementById('budgetMax').value = max;
  window.onboardingData.profile.budget.min = min;
  window.onboardingData.profile.budget.max = max;
  
  // Highlight selected range
  document.querySelectorAll('.price-range-card').forEach(card => card.classList.remove('selected'));
  event.target.closest('.price-range-card').classList.add('selected');
}

function selectTimeline(value) {
  window.onboardingData.profile.timeline = value;
  
  // Update UI
  document.querySelectorAll('.timeline-card').forEach(card => card.classList.remove('selected'));
  event.target.closest('.timeline-card').classList.add('selected');
}

function selectMortgageStatus(value) {
  window.onboardingData.profile.mortgageStatus = value;
  
  // Update UI
  document.querySelectorAll('.mortgage-card').forEach(card => card.classList.remove('selected'));
  event.target.closest('.mortgage-card').classList.add('selected');
  
  // Show/hide additional details
  const detailsSection = document.getElementById('mortgage-details');
  if (value === 'preapproved' && detailsSection) {
    detailsSection.style.display = 'block';
  } else if (detailsSection) {
    detailsSection.style.display = 'none';
  }
}

function updateOnboardingProgress() {
  document.querySelectorAll('.progress-step').forEach((step, index) => {
    if (index + 1 <= window.currentStep) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });
}

function validateCurrentStep() {
  switch(window.currentStep) {
    case 1:
      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const email = document.getElementById('email').value.trim();
      
      if (!firstName || !lastName || !email) {
        alert('Please fill in all required fields (First Name, Last Name, Email)');
        return false;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return false;
      }
      break;
      
    case 2:
      const budgetMin = window.onboardingData.profile.budget.min;
      const budgetMax = window.onboardingData.profile.budget.max;
      
      if (!budgetMin || !budgetMax) {
        alert('Please enter both minimum and maximum budget amounts');
        return false;
      }
      
      if (budgetMin >= budgetMax) {
        alert('Maximum budget must be higher than minimum budget');
        return false;
      }
      break;
      
    case 3:
      if (!window.onboardingData.profile.timeline) {
        alert('Please select your purchase timeline');
        return false;
      }
      break;
      
    case 4:
      if (!window.onboardingData.profile.mortgageStatus) {
        alert('Please select your mortgage status');
        return false;
      }
      break;
  }
  
  return true;
}

function completeOnboarding() {
  // Save buyer profile
  const newBuyer = {
    id: `buyer-${Date.now()}`,
    ...window.onboardingData,
    createdDate: new Date().toISOString(),
    wishlists: []
  };
  
  // Trigger IFTTT notification for new buyer
  iftttService.notifyNewBuyer({
    name: `${newBuyer.profile.contactInfo.firstName} ${newBuyer.profile.contactInfo.lastName}`,
    budget: newBuyer.profile.budget,
    timeline: newBuyer.profile.timeline,
    location: 'Kingston, Ontario'
  });
  
  alert('Welcome to the platform! Your profile has been created successfully.');
  modal.close();
  
  // Redirect to wishlist creation
  setTimeout(() => {
    startWishlistCreation(newBuyer.id);
  }, 500);
}

// Make functions globally available
window.setBudgetRange = setBudgetRange;
window.selectTimeline = selectTimeline;
window.selectMortgageStatus = selectMortgageStatus;
window.nextStep = nextStep;
window.previousStep = previousStep;
window.completeOnboarding = completeOnboarding;

// Wishlist Creation System
function startWishlistCreation(buyerId) {
  const content = `
    <div class="wishlist-creation">
      <h2>🏠 Create Your First Wishlist</h2>
      <p>Build a detailed wishlist to receive personalized property matches in Kingston</p>
      
      <div class="wishlist-progress">
        <div class="wishlist-step active" data-step="1">
          <span>1</span>
          <label>Basic Info</label>
        </div>
        <div class="wishlist-step" data-step="2">
          <span>2</span>
          <label>Location</label>
        </div>
        <div class="wishlist-step" data-step="3">
          <span>3</span>
          <label>Property Type</label>
        </div>
        <div class="wishlist-step" data-step="4">
          <span>4</span>
          <label>Features</label>
        </div>
      </div>
      
      <div id="wishlist-step-content"></div>
      
      <div class="wishlist-navigation">
        <button id="wishlist-prev" class="btn secondary" style="display: none;">Previous</button>
        <button id="wishlist-next" class="btn primary">Next</button>
      </div>
    </div>
  `;
  
  modal.open(content);
  
  // Initialize wishlist data
  window.wishlistData = {
    buyerId: buyerId,
    basicInfo: {},
    locations: [],
    propertyTypes: [],
    features: {},
    preferences: {}
  };
  
  window.wishlistStep = 1;
  renderWishlistStep(1);
  
  // Add event listeners
  document.getElementById('wishlist-next').addEventListener('click', nextWishlistStep);
  document.getElementById('wishlist-prev').addEventListener('click', previousWishlistStep);
}

function renderWishlistStep(step) {
  const content = document.getElementById('wishlist-step-content');
  
  switch(step) {
    case 1:
      content.innerHTML = renderWishlistBasicInfo();
      break;
    case 2:
      content.innerHTML = renderWishlistLocation();
      break;
    case 3:
      content.innerHTML = renderWishlistPropertyType();
      break;
    case 4:
      content.innerHTML = renderWishlistFeatures();
      break;
  }
  
  addWishlistStepListeners(step);
  updateWishlistProgress();
}

function renderWishlistBasicInfo() {
  return `
    <div class="wishlist-section">
      <h3>Basic Wishlist Information</h3>
      
      <div class="form-group">
        <label for="wishlist-name">Wishlist Name</label>
        <input type="text" id="wishlist-name" placeholder="e.g., Dream Family Home" required>
        <small>Give your wishlist a memorable name</small>
      </div>
      
      <div class="form-group">
        <label for="wishlist-description">Description (Optional)</label>
        <textarea id="wishlist-description" placeholder="Describe what you're looking for..."></textarea>
      </div>
      
      <div class="form-group">
        <label>Priority Level</label>
        <div class="priority-options">
          <label class="priority-card">
            <input type="radio" name="priority" value="urgent">
            <div class="priority-content">
              <h4>🚨 Urgent</h4>
              <p>Need to move ASAP</p>
            </div>
          </label>
          <label class="priority-card">
            <input type="radio" name="priority" value="active" checked>
            <div class="priority-content">
              <h4>🎯 Active</h4>
              <p>Actively searching</p>
            </div>
          </label>
          <label class="priority-card">
            <input type="radio" name="priority" value="watching">
            <div class="priority-content">
              <h4>👀 Watching</h4>
              <p>Just looking around</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  `;
}

function renderWishlistLocation() {
  const neighbourhoods = kingstonMarketData.neighbourhoods;
  
  return `
    <div class="wishlist-section">
      <h3>📍 Preferred Locations</h3>
      <p>Select areas in Kingston where you'd like to find properties</p>
      
      <div class="location-selection">
        <h4>Kingston Neighbourhoods</h4>
        <div class="neighbourhood-grid">
          ${neighbourhoods.map(n => `
            <label class="neighbourhood-card">
              <input type="checkbox" name="neighbourhoods" value="${n.name}">
              <div class="neighbourhood-content">
                <h5>${n.name}</h5>
                <p class="price-range">$${n.averagePrice.toLocaleString()}</p>
                <p class="description">${n.description}</p>
                <div class="features">
                  ${n.features.slice(0, 2).map(f => `<span class="feature-tag">${f}</span>`).join('')}
                </div>
              </div>
            </label>
          `).join('')}
        </div>
      </div>
      
      <div class="location-tools">
        <h4>🗺️ Location Tools</h4>
        <div class="tool-grid">
          <button class="tool-card" onclick="addPostalCode()">
            <h5>📮 Postal Code</h5>
            <p>Search by specific postal codes</p>
          </button>
          <button class="tool-card" onclick="drawMapArea()">
            <h5>🗺️ Draw on Map</h5>
            <p>Define custom search areas</p>
          </button>
          <button class="tool-card" onclick="setRadiusSearch()">
            <h5>📍 Radius Search</h5>
            <p>Search within distance from point</p>
          </button>
        </div>
      </div>
      
      <div id="postal-codes" class="postal-code-section" style="display: none;">
        <h4>Postal Codes</h4>
        <div class="postal-input">
          <input type="text" id="postal-code-input" placeholder="K7L 1A1">
          <button onclick="addPostalCodeToList()">Add</button>
        </div>
        <div id="postal-code-list"></div>
      </div>
    </div>
  `;
}

function renderWishlistPropertyType() {
  return `
    <div class="wishlist-section">
      <h3>🏠 Property Types</h3>
      <p>What types of properties are you interested in?</p>
      
      <div class="property-type-grid">
        ${propertyTypes.map(type => `
          <label class="property-type-card">
            <input type="checkbox" name="propertyTypes" value="${type.id}">
            <div class="property-content">
              <div class="property-icon">${type.icon}</div>
              <h4>${type.name}</h4>
              <p>${type.description}</p>
              <div class="price-info">
                <small>Avg: $${type.averagePrice.toLocaleString()}</small>
              </div>
            </div>
          </label>
        `).join('')}
      </div>
      
      <div class="property-size">
        <h4>Property Size Preferences</h4>
        <div class="size-inputs">
          <div class="form-group">
            <label for="min-sqft">Minimum Square Feet</label>
            <input type="number" id="min-sqft" placeholder="e.g., 1200">
          </div>
          <div class="form-group">
            <label for="max-sqft">Maximum Square Feet</label>
            <input type="number" id="max-sqft" placeholder="e.g., 3000">
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderWishlistFeatures() {
  return `
    <div class="wishlist-section">
      <h3>✨ Property Features</h3>
      <p>Select the features that matter most to you</p>
      
      <div class="feature-categories">
        ${Object.entries(propertyFeatures).map(([category, features]) => `
          <div class="feature-category">
            <h4>${category.replace(/([A-Z])/g, ' $1').trim()}</h4>
            <div class="feature-grid">
              ${features.map(feature => `
                <label class="feature-item">
                  <input type="checkbox" name="features" value="${feature.id}">
                  <span class="feature-icon">${feature.icon}</span>
                  <span class="feature-name">${feature.name}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="must-haves">
        <h4>🎯 Must-Haves vs Nice-to-Haves</h4>
        <p>Drag selected features to categorize them:</p>
        <div class="feature-priority">
          <div class="must-have-zone">
            <h5>Must Have</h5>
            <div id="must-have-features" class="feature-drop-zone"></div>
          </div>
          <div class="nice-to-have-zone">
            <h5>Nice to Have</h5>
            <div id="nice-to-have-features" class="feature-drop-zone"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}
window.sendMessage = sendMessage;
window.testIFTTT = testIFTTT;
window.showMortgageContacts = showMortgageContacts;
window.showRealtorContacts = showRealtorContacts;
window.contactProfessional = contactProfessional;

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');
  
  try {
    // Initialize DOM elements
    appRoot = document.getElementById('app-root');
    roleSelect = document.getElementById('role-select');
    modal = document.getElementById('modal');
    modalTitle = document.getElementById('modal-title');
    modalContent = document.getElementById('modal-content');
    
    // Debug: Check if elements exist
    console.log('DOM Elements Check:', {
      appRoot: !!appRoot,
      roleSelect: !!roleSelect,
      modal: !!modal,
      modalTitle: !!modalTitle,
      modalContent: !!modalContent
    });
    
    if (!appRoot) {
      throw new Error('app-root element not found');
    }
    
    // Immediate visual feedback
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.innerHTML = `
        <h2>🔄 Loading Buyer Registry...</h2>
        <p>DOM loaded, initializing JavaScript...</p>
        <div style="margin: 1rem 0; padding: 1rem; background: #e3f2fd; border-radius: 5px;">
          <strong>Debug Info:</strong><br>
          - Script loaded: ✅<br>
          - DOM ready: ✅<br>
          - Elements found: ✅<br>
          - Initializing app...<br>
        </div>
      `;
    }
    
    setTimeout(() => {
      try {
        console.log('Calling renderApp...');
        renderApp();
        console.log('renderApp completed successfully');
      } catch (error) {
        console.error('Error in renderApp:', error);
        appRoot.innerHTML = `
          <div style="padding: 2rem; border: 2px solid red; background: #ffe6e6;">
            <h2>❌ App Initialization Error</h2>
            <p>Error in renderApp: ${error.message}</p>
            <pre>${error.stack}</pre>
          </div>
        `;
      }
    }, 100);
  } catch (error) {
    console.error('Error in DOMContentLoaded:', error);
    const fallbackRoot = document.getElementById('app-root');
    if (fallbackRoot) {
      fallbackRoot.innerHTML = `
        <div style="padding: 2rem; border: 2px solid red; background: #ffe6e6;">
          <h2>❌ DOM Initialization Error</h2>
          <p>Error: ${error.message}</p>
          <pre>${error.stack}</pre>
        </div>
      `;
    }
  }
});

function addWishlistStepListeners(step) {
  switch(step) {
    case 1:
      ['wishlist-name', 'wishlist-description'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.addEventListener('input', (e) => {
            window.wishlistData.basicInfo[id.replace('wishlist-', '')] = e.target.value;
          });
        }
      });
      
      document.querySelectorAll('input[name="priority"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          window.wishlistData.basicInfo.priority = e.target.value;
        });
      });
      break;
      
    case 2:
      document.querySelectorAll('input[name="neighbourhoods"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          const neighbourhood = e.target.value;
          if (e.target.checked) {
            if (!window.wishlistData.locations.includes(neighbourhood)) {
              window.wishlistData.locations.push(neighbourhood);
            }
          } else {
            window.wishlistData.locations = window.wishlistData.locations.filter(n => n !== neighbourhood);
          }
        });
      });
      break;
      
    case 3:
      document.querySelectorAll('input[name="propertyTypes"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          const propertyType = e.target.value;
          if (e.target.checked) {
            if (!window.wishlistData.propertyTypes.includes(propertyType)) {
              window.wishlistData.propertyTypes.push(propertyType);
            }
          } else {
            window.wishlistData.propertyTypes = window.wishlistData.propertyTypes.filter(t => t !== propertyType);
          }
        });
      });
      
      ['min-sqft', 'max-sqft'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.addEventListener('input', (e) => {
            const key = id.replace('-', '_');
            window.wishlistData.preferences[key] = parseInt(e.target.value) || null;
          });
        }
      });
      break;
      
    case 4:
      document.querySelectorAll('input[name="features"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          const feature = e.target.value;
          if (e.target.checked) {
            if (!window.wishlistData.features[feature]) {
              window.wishlistData.features[feature] = 'nice_to_have'; // Default
            }
          } else {
            delete window.wishlistData.features[feature];
          }
        });
      });
      break;
  }
}

function nextWishlistStep() {
  if (validateWishlistStep()) {
    if (window.wishlistStep < 4) {
      window.wishlistStep++;
      renderWishlistStep(window.wishlistStep);
    } else {
      completeWishlistCreation();
    }
  }
}

function previousWishlistStep() {
  if (window.wishlistStep > 1) {
    window.wishlistStep--;
    renderWishlistStep(window.wishlistStep);
  }
}

function validateWishlistStep() {
  switch(window.wishlistStep) {
    case 1:
      const name = document.getElementById('wishlist-name').value.trim();
      if (!name) {
        alert('Please enter a name for your wishlist');
        return false;
      }
      break;
      
    case 2:
      if (window.wishlistData.locations.length === 0) {
        alert('Please select at least one location or neighbourhood');
        return false;
      }
      break;
      
    case 3:
      if (window.wishlistData.propertyTypes.length === 0) {
        alert('Please select at least one property type');
        return false;
      }
      break;
  }
  
  return true;
}

function updateWishlistProgress() {
  document.querySelectorAll('.wishlist-step').forEach((step, index) => {
    if (index + 1 <= window.wishlistStep) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });
  
  // Update navigation buttons
  const prevBtn = document.getElementById('wishlist-prev');
  const nextBtn = document.getElementById('wishlist-next');
  
  if (prevBtn) {
    prevBtn.style.display = window.wishlistStep > 1 ? 'block' : 'none';
  }
  
  if (nextBtn) {
    nextBtn.textContent = window.wishlistStep === 4 ? 'Create Wishlist' : 'Next';
  }
}

function completeWishlistCreation() {
  const wishlist = {
    id: `wishlist-${Date.now()}`,
    ...window.wishlistData,
    createdDate: new Date().toISOString(),
    isActive: true
  };
  
  // Trigger IFTTT notification
  iftttService.notifyNewMatch({
    buyerId: wishlist.buyerId,
    wishlistName: wishlist.basicInfo.name,
    locations: wishlist.locations,
    propertyTypes: wishlist.propertyTypes
  });
  
  alert('🎉 Wishlist created successfully! You\'ll start receiving personalized property matches.');
  modal.close();
}

// Location Tools Functions
function addPostalCode() {
  const section = document.getElementById('postal-codes');
  section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

function addPostalCodeToList() {
  const input = document.getElementById('postal-code-input');
  const postalCode = input.value.trim().toUpperCase();
  
  if (postalCode && /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/.test(postalCode)) {
    const list = document.getElementById('postal-code-list');
    const item = document.createElement('div');
    item.className = 'postal-code-item';
    item.innerHTML = `
      <span>${postalCode}</span>
      <button onclick="removePostalCode(this)">Remove</button>
    `;
    list.appendChild(item);
    
    if (!window.wishlistData.locations.includes(postalCode)) {
      window.wishlistData.locations.push(postalCode);
    }
    
    input.value = '';
  } else {
    alert('Please enter a valid Canadian postal code (e.g., K7L 1A1)');
  }
}

function removePostalCode(button) {
  const item = button.parentElement;
  const postalCode = item.querySelector('span').textContent;
  window.wishlistData.locations = window.wishlistData.locations.filter(l => l !== postalCode);
  item.remove();
}

function drawMapArea() {
  alert('🗺️ Map drawing tool will be available soon! For now, use neighbourhoods or postal codes.');
}

function setRadiusSearch() {
  const address = prompt('Enter an address or landmark for radius search:');
  if (address) {
    const radius = prompt('Enter search radius in kilometers:', '5');
    if (radius) {
      const locationString = `${address} (${radius}km radius)`;
      if (!window.wishlistData.locations.includes(locationString)) {
        window.wishlistData.locations.push(locationString);
      }
      alert(`Added radius search: ${locationString}`);
    }
  }
}

// Make wishlist functions globally available
window.startWishlistCreation = startWishlistCreation;
window.nextWishlistStep = nextWishlistStep;
window.previousWishlistStep = previousWishlistStep;
window.addPostalCode = addPostalCode;
window.addPostalCodeToList = addPostalCodeToList;
window.removePostalCode = removePostalCode;
window.drawMapArea = drawMapArea;
window.setRadiusSearch = setRadiusSearch;

function handleSellerOnboardingNext() {
  if (validateSellerStep()) {
    if (window.sellerCurrentStep < 5) {
      window.sellerCurrentStep++;
      renderSellerOnboardingStep(window.sellerCurrentStep);
      updateSellerOnboardingProgress();
    } else {
      completeSellerOnboarding();
    }
  }
}

function handleSellerOnboardingPrev() {
  if (window.sellerCurrentStep > 1) {
    window.sellerCurrentStep--;
    renderSellerOnboardingStep(window.sellerCurrentStep);
    updateSellerOnboardingProgress();
  }
}

function renderSellerOnboardingStep(step) {
  const content = document.getElementById('seller-onboarding-content');
  
  switch(step) {
    case 1:
      content.innerHTML = renderSellerProfileStep();
      break;
    case 2:
      content.innerHTML = renderSellerRoleStep();
      break;
    case 3:
      content.innerHTML = renderSellerAgentLinkStep();
      break;
    case 4:
      content.innerHTML = renderSellerSubscriptionStep();
      break;
    case 5:
      content.innerHTML = renderSellerPreferencesStep();
      break;
  }
  
  addSellerStepEventListeners(step);
  updateSellerOnboardingProgress();
}

function renderSellerProfileStep() {
  return `
    <div class="onboarding-step">
      <h3>👋 Contact Information</h3>
      <p>Let's start with your basic contact details</p>
      
      <div class="form-section">
        <div class="form-group">
          <label for="seller-firstName">First Name</label>
          <input type="text" id="seller-firstName" required>
        </div>
        
        <div class="form-group">
          <label for="seller-lastName">Last Name</label>
          <input type="text" id="seller-lastName" required>
        </div>
        
        <div class="form-group">
          <label for="seller-email">Email Address</label>
          <input type="email" id="seller-email" required>
          <small>Used for login and important notifications</small>
        </div>
        
        <div class="form-group">
          <label for="seller-phone">Phone Number</label>
          <input type="tel" id="seller-phone">
          <small>Optional - for direct communication with buyers</small>
        </div>
        
        <div class="form-group">
          <label>Preferred Contact Method</label>
          <div class="contact-preferences">
            <div class="contact-option">
              <input type="radio" name="seller-preferredContact" value="email" id="seller-contact-email" checked>
              <label for="seller-contact-email">📧 Email</label>
            </div>
            <div class="contact-option">
              <input type="radio" name="seller-preferredContact" value="phone" id="seller-contact-phone">
              <label for="seller-contact-phone">📞 Phone</label>
            </div>
            <div class="contact-option">
              <input type="radio" name="seller-preferredContact" value="both" id="seller-contact-both">
              <label for="seller-contact-both">📱 Both</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSellerRoleStep() {
  return `
    <div class="onboarding-step">
      <h3>🏷️ Your Role</h3>
      <p>Tell us about your role in the real estate process</p>
      
      <div class="role-selection">
        ${sellerRoleOptions.map(role => `
          <label class="role-card">
            <input type="radio" name="seller-role" value="${role.id}">
            <div class="role-content">
              <div class="role-icon">${role.icon}</div>
              <h4>${role.name}</h4>
              <p class="role-description">${role.description}</p>
              <div class="role-benefits">
                <h5>Benefits:</h5>
                <ul>
                  ${role.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                </ul>
              </div>
            </div>
          </label>
        `).join('')}
      </div>
      
      <div id="agent-details" class="agent-details" style="display: none;">
        <h4>Real Estate Agent Details</h4>
        <div class="form-group">
          <label for="agent-license">License Number</label>
          <input type="text" id="agent-license" placeholder="e.g., R123456">
        </div>
        
        <div class="form-group">
          <label for="agent-brokerage">Brokerage</label>
          <input type="text" id="agent-brokerage" placeholder="e.g., Royal LePage">
        </div>
        
        <div class="form-group">
          <label for="agent-client-count">Approximate Number of Active Clients</label>
          <input type="number" id="agent-client-count" min="0" placeholder="e.g., 15">
        </div>
      </div>
    </div>
  `;
}

function renderSellerAgentLinkStep() {
  return `
    <div class="onboarding-step">
      <h3>🤝 Agent Connection</h3>
      <p>Do you have a real estate agent managing your listing?</p>
      
      <div class="agent-connection-options">
        <label class="connection-card">
          <input type="radio" name="has-agent" value="no" checked>
          <div class="connection-content">
            <h4>🏠 No Agent (FSBO)</h4>
            <p>I'll manage my own listing</p>
            <ul>
              <li>Full control over communications</li>
              <li>Direct access to buyer inquiries</li>
              <li>No commission fees</li>
            </ul>
          </div>
        </label>
        
        <label class="connection-card">
          <input type="radio" name="has-agent" value="yes">
          <div class="connection-content">
            <h4>👔 Working with Agent</h4>
            <p>My agent will manage the listing</p>
            <ul>
              <li>Agent handles communications</li>
              <li>Professional marketing support</li>
              <li>MLS integration</li>
            </ul>
          </div>
        </label>
      </div>
      
      <div id="agent-connection-details" class="agent-connection-details" style="display: none;">
        <h4>Agent Information</h4>
        <div class="form-group">
          <label for="agent-name">Agent Name</label>
          <input type="text" id="agent-name" placeholder="e.g., Sarah Johnson">
        </div>
        
        <div class="form-group">
          <label for="agent-contact">Agent Contact</label>
          <input type="email" id="agent-contact" placeholder="agent@realty.com">
        </div>
        
        <div class="form-group">
          <label for="commission-agreement">Commission Agreement</label>
          <select id="commission-agreement">
            <option value="">Select agreement type</option>
            <option value="exclusive">Exclusive Listing Agreement</option>
            <option value="open">Open Listing</option>
            <option value="net">Net Listing</option>
          </select>
        </div>
      </div>
    </div>
  `;
}

function renderSellerSubscriptionStep() {
  const userRole = window.sellerData.profile.role;
  const tiersByRole = userRole === 'agent' ? subscriptionTiers.professional : subscriptionTiers.homeowner;
  
  return `
    <div class="onboarding-step">
      <h3>� Choose Your Subscription</h3>
      <p>Select a plan that fits your needs. ${userRole === 'agent' ? 'Professional features for agents and realtors.' : 'Enhanced tools for homeowners.'}</p>
      
      <div class="subscription-tiers">
        ${Object.entries(tiersByRole).map(([tierId, tier]) => `
          <label class="subscription-card ${tier.popular ? 'popular' : ''}">
            <input type="radio" name="subscription-tier" value="${tier.id}" ${tierId === 'free' || tierId === 'basic' ? 'checked' : ''}>
            <div class="tier-content">
              <div class="tier-header">
                <div class="tier-icon">${tier.icon}</div>
                <h4>${tier.name}</h4>
                ${tier.popular ? '<span class="popular-badge">Most Popular</span>' : ''}
              </div>
              
              <div class="tier-pricing">
                ${tier.price === 0 ? 
                  '<span class="price">Free</span>' : 
                  `<span class="price">$${tier.price}<span class="period">/${tier.period}</span></span>`
                }
              </div>
              
              <div class="tier-features">
                <h5>Features:</h5>
                <ul>
                  ${tier.features.map(feature => `<li>✅ ${feature}</li>`).join('')}
                </ul>
                
                ${tier.locationMonitoring?.enabled ? `
                  <div class="monitoring-highlight">
                    <h5>📍 Location Monitoring:</h5>
                    <div class="monitoring-details">
                      <span class="zones">Monitor ${tier.locationMonitoring.zones} ${tier.locationMonitoring.zones === 1 ? 'region' : 'zones'}</span>
                      <span class="radius">${tier.locationMonitoring.radius}km radius each</span>
                    </div>
                    <div class="notification-types">
                      ${Object.entries(tier.locationMonitoring.notifications || {}).map(([key, enabled]) => 
                        enabled ? `<span class="notification-type">${key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>` : ''
                      ).filter(Boolean).slice(0, 3).join(', ')}
                    </div>
                  </div>
                ` : ''}
                
                ${tier.limitations && Object.keys(tier.limitations).length > 0 ? `
                  <h5>Limitations:</h5>
                  <ul class="limitations">
                    ${Object.entries(tier.limitations).map(([key, value]) => 
                      `<li>❌ ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${value}</li>`
                    ).join('')}
                  </ul>
                ` : ''}
              </div>
            </div>
          </label>
        `).join('')}
      </div>
      
      <div class="notification-preferences">
        <h4>🔔 Notification Preferences</h4>
        <div class="notification-settings">
          <div class="frequency-options">
            <label>Notification Frequency:</label>
            <select id="notification-frequency">
              ${Object.entries(notificationPreferences.frequency).map(([key, option]) => `
                <option value="${key}">${option.icon} ${option.name}</option>
              `).join('')}
            </select>
          </div>
          
          <div class="channel-options">
            <label>Delivery Channels:</label>
            <div class="channel-grid">
              ${Object.entries(notificationPreferences.channels).map(([key, channel]) => `
                <label class="channel-option">
                  <input type="checkbox" name="notification-channels" value="${key}" ${channel.enabled ? 'checked' : ''}>
                  <span class="channel-icon">${channel.icon}</span>
                  <span class="channel-name">${channel.name}</span>
                </label>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
      
      <div class="upgrade-note">
        <p><strong>Note:</strong> You can upgrade at any time to unlock location monitoring and advanced notification features.</p>
      </div>
    </div>
  `;
}

function renderSellerPreferencesStep() {
  return `
    <div class="onboarding-step">
      <h3>🔔 Communication Preferences</h3>
      <p>Choose how you'd like to stay informed about your listings</p>
      
      <div class="preferences-section">
        <div class="preference-group">
          <h4>📧 Email Notifications</h4>
          
          <div class="preference-item">
            <input type="checkbox" id="seller-new-match-notifications" name="newMatchNotifications" checked>
            <label for="seller-new-match-notifications">
              <strong>New buyer matches</strong>
              <small>When buyers create wishlists matching your property</small>
            </label>
          </div>
          
          <div class="preference-item">
            <input type="checkbox" id="seller-message-notifications" name="messageNotifications" checked>
            <label for="seller-message-notifications">
              <strong>New messages</strong>
              <small>When buyers or agents send you messages</small>
            </label>
          </div>
          
          <div class="preference-item">
            <input type="checkbox" id="seller-marketing-emails" name="marketingEmails">
            <label for="seller-marketing-emails">
              <strong>Marketing updates</strong>
              <small>Tips, market trends, and platform updates</small>
            </label>
          </div>
          
          <div class="preference-item">
            <input type="checkbox" id="seller-weekly-reports" name="weeklyReports">
            <label for="seller-weekly-reports">
              <strong>Weekly reports</strong>
              <small>Summary of listing performance and market activity</small>
            </label>
          </div>
        </div>
        
        <div class="preference-group">
          <h4>📱 Alert Preferences</h4>
          
          <div class="preference-item">
            <input type="checkbox" id="seller-price-drop-alerts" name="priceDropAlerts">
            <label for="seller-price-drop-alerts">
              <strong>Market price alerts</strong>
              <small>When similar properties change prices in your area</small>
            </label>
          </div>
        </div>
      </div>
      
      <div class="next-steps">
        <h4>🚀 What's Next?</h4>
        <ul>
          <li>Create your property listing with photos and details</li>
          <li>View interested buyers and match analytics</li>
          <li>Connect with qualified prospects</li>
          <li>Access Kingston market insights</li>
        </ul>
      </div>
    </div>
  `;
}

function addSellerStepEventListeners(step) {
  switch(step) {
    case 1:
      ['seller-firstName', 'seller-lastName', 'seller-email', 'seller-phone'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.addEventListener('input', (e) => {
            const key = id.replace('seller-', '');
            window.sellerOnboardingData.contactInfo[key] = e.target.value;
          });
        }
      });
      
      document.querySelectorAll('input[name="seller-preferredContact"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          window.sellerOnboardingData.contactInfo.preferredContact = e.target.value;
        });
      });
      break;
      
    case 2:
      document.querySelectorAll('input[name="seller-role"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          window.sellerOnboardingData.role.type = e.target.value;
          
          // Show/hide agent details
          const agentDetails = document.getElementById('agent-details');
          if (e.target.value === 'agent') {
            agentDetails.style.display = 'block';
          } else {
            agentDetails.style.display = 'none';
          }
        });
      });
      
      ['agent-license', 'agent-brokerage', 'agent-client-count'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.addEventListener('input', (e) => {
            const key = id.replace('agent-', '').replace('-', '');
            if (key === 'clientcount') {
              window.sellerOnboardingData.role.clientCount = parseInt(e.target.value) || 0;
            } else {
              window.sellerOnboardingData.role[key === 'license' ? 'agentLicense' : 'brokerage'] = e.target.value;
            }
          });
        }
      });
      break;
      
    case 3:
      document.querySelectorAll('input[name="has-agent"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          window.sellerOnboardingData.agentConnection.hasAgent = e.target.value === 'yes';
          
          // Show/hide agent connection details
          const agentDetails = document.getElementById('agent-connection-details');
          if (e.target.value === 'yes') {
            agentDetails.style.display = 'block';
          } else {
            agentDetails.style.display = 'none';
          }
        });
      });
      
      ['agent-name', 'agent-contact', 'commission-agreement'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.addEventListener('input', (e) => {
            const key = id.replace('agent-', '').replace('commission-', '').replace('-', '');
            if (key === 'name') {
              window.sellerOnboardingData.agentConnection.agentName = e.target.value;
            } else if (key === 'contact') {
              window.sellerOnboardingData.agentConnection.agentContact = e.target.value;
            } else if (key === 'agreement') {
              window.sellerOnboardingData.agentConnection.commissionAgreement = e.target.value;
            }
          });
        }
      });
      break;
      
    case 4:
      document.querySelectorAll('input[name="subscription-tier"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          window.sellerOnboardingData.subscription.tier = e.target.value;
        });
      });
      break;
      
    case 5:
      ['seller-new-match-notifications', 'seller-message-notifications', 'seller-marketing-emails', 'seller-weekly-reports', 'seller-price-drop-alerts'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.addEventListener('change', (e) => {
            const key = id.replace('seller-', '').replace('-', '');
            window.sellerOnboardingData.preferences[key] = e.target.checked;
          });
        }
      });
      break;
  }
}

function validateSellerStep() {
  switch(window.sellerCurrentStep) {
    case 1:
      const firstName = document.getElementById('seller-firstName').value.trim();
      const lastName = document.getElementById('seller-lastName').value.trim();
      const email = document.getElementById('seller-email').value.trim();
      
      if (!firstName || !lastName || !email) {
        alert('Please fill in all required fields (First Name, Last Name, Email)');
        return false;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return false;
      }
      break;
      
    case 2:
      if (!window.sellerOnboardingData.role.type) {
        alert('Please select your role');
        return false;
      }
      break;
  }
  
  return true;
}

function updateSellerOnboardingProgress() {
  document.querySelectorAll('.progress-step').forEach((step, index) => {
    if (index + 1 <= window.sellerCurrentStep) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });
  
  // Update navigation buttons
  const prevBtn = document.getElementById('seller-prev-step');
  const nextBtn = document.getElementById('seller-next-step');
  
  if (prevBtn) {
    prevBtn.style.display = window.sellerCurrentStep > 1 ? 'block' : 'none';
  }
  
  if (nextBtn) {
    nextBtn.textContent = window.sellerCurrentStep === 5 ? 'Complete Registration' : 'Next';
  }
}

function completeSellerOnboarding() {
  // Save seller profile
  const newSeller = {
    id: `seller-${Date.now()}`,
    ...window.sellerOnboardingData,
    createdDate: new Date().toISOString(),
    listings: []
  };
  
  // Trigger IFTTT notification for new seller
  iftttService.notifyNewMatch({
    sellerId: newSeller.id,
    name: `${newSeller.contactInfo.firstName} ${newSeller.contactInfo.lastName}`,
    role: newSeller.role.type,
    subscription: newSeller.subscription.tier,
    location: 'Kingston, Ontario'
  });
  
  alert('Welcome to the platform! Your seller profile has been created successfully.');
  modal.close();
  
  // Redirect to listing creation
  setTimeout(() => {
    startPropertyListingWizard(newSeller.id);
  }, 500);
}

// Make seller functions globally available
window.startSellerOnboarding = startSellerOnboarding;

// Property Listing Creation Wizard
function startPropertyListingWizard(sellerId) {
  const content = `
    <div class="listing-wizard">
      <h2>🏠 Create Your Property Listing</h2>
      <p>Let's create an attractive listing to connect with qualified buyers in Kingston</p>
      
      <div class="listing-progress">
        <div class="listing-step active" data-step="1">
          <span>1</span>
          <label>Address</label>
        </div>
        <div class="listing-step" data-step="2">
          <span>2</span>
          <label>Details</label>
        </div>
        <div class="listing-step" data-step="3">
          <span>3</span>
          <label>Pricing</label>
        </div>
        <div class="listing-step" data-step="4">
          <span>4</span>
          <label>Features</label>
        </div>
        <div class="listing-step" data-step="5">
          <span>5</span>
          <label>Photos</label>
        </div>
        <div class="listing-step" data-step="6">
          <span>6</span>
          <label>Description</label>
        </div>
      </div>
      
      <div id="listing-step-content"></div>
      
      <div class="listing-navigation">
        <button id="listing-prev" class="btn secondary" style="display: none;">Previous</button>
        <button id="listing-next" class="btn primary">Next</button>
      </div>
    </div>
  `;
  
  modal.open(content);
  
  // Initialize listing data
  window.listingData = {
    sellerId: sellerId,
    ...JSON.parse(JSON.stringify(propertyListingStructure))
  };
  
  window.listingStep = 1;
  renderListingStep(1);
  
  // Add event listeners
  document.getElementById('listing-next').addEventListener('click', nextListingStep);
  document.getElementById('listing-prev').addEventListener('click', previousListingStep);
}

function renderListingStep(step) {
  const content = document.getElementById('listing-step-content');
  
  switch(step) {
    case 1:
      content.innerHTML = renderListingAddressStep();
      break;
    case 2:
      content.innerHTML = renderListingDetailsStep();
      break;
    case 3:
      content.innerHTML = renderListingPricingStep();
      break;
    case 4:
      content.innerHTML = renderListingFeaturesStep();
      break;
    case 5:
      content.innerHTML = renderListingPhotosStep();
      break;
    case 6:
      content.innerHTML = renderListingDescriptionStep();
      break;
  }
  
  addListingStepListeners(step);
  updateListingProgress();
}

function renderListingAddressStep() {
  return `
    <div class="listing-section">
      <h3>📍 Property Address</h3>
      <p>Enter your property's address or drop a pin on the map</p>
      
      <div class="address-input-section">
        <div class="form-group">
          <label for="property-street">Street Address</label>
          <input type="text" id="property-street" placeholder="e.g., 123 Princess Street" required>
          <small>Include unit number if applicable</small>
        </div>
        
        <div class="address-grid">
          <div class="form-group">
            <label for="property-city">City</label>
            <input type="text" id="property-city" value="Kingston" required>
          </div>
          
          <div class="form-group">
            <label for="property-province">Province</label>
            <input type="text" id="property-province" value="Ontario" required>
          </div>
          
          <div class="form-group">
            <label for="property-postal">Postal Code</label>
            <input type="text" id="property-postal" placeholder="K7L 1A1" required>
          </div>
        </div>
      </div>
      
      <div class="map-section">
        <h4>🗺️ Verify Location</h4>
        <div class="map-placeholder">
          <div class="map-loading">
            📍 Interactive map will load here
            <br><small>Drag the pin to adjust exact location</small>
          </div>
        </div>
        <button class="btn secondary" onclick="geocodeAddress()">📍 Find on Map</button>
      </div>
      
      <div class="neighbourhood-info">
        <h4>📍 Neighbourhood Information</h4>
        <div id="neighbourhood-match" class="neighbourhood-preview">
          <p>Enter address to see neighbourhood details and buyer interest</p>
        </div>
      </div>
    </div>
  `;
}

function renderListingDetailsStep() {
  return `
    <div class="listing-section">
      <h3>🏠 Property Details</h3>
      <p>Tell us about your property's key characteristics</p>
      
      <div class="property-type-section">
        <h4>Property Type</h4>
        <div class="property-type-grid">
          ${propertyTypes.map(type => `
            <label class="property-type-card">
              <input type="radio" name="listing-property-type" value="${type.value}">
              <div class="property-content">
                <div class="property-icon">${type.icon}</div>
                <h5>${type.label}</h5>
              </div>
            </label>
          `).join('')}
        </div>
      </div>
      
      <div class="property-specs">
        <h4>Property Specifications</h4>
        <div class="specs-grid">
          <div class="form-group">
            <label for="bedrooms">Bedrooms</label>
            <select id="bedrooms" required>
              <option value="">Select</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4 Bedrooms</option>
              <option value="5">5+ Bedrooms</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="bathrooms">Bathrooms</label>
            <select id="bathrooms" required>
              <option value="">Select</option>
              <option value="1">1 Bathroom</option>
              <option value="1.5">1.5 Bathrooms</option>
              <option value="2">2 Bathrooms</option>
              <option value="2.5">2.5 Bathrooms</option>
              <option value="3">3 Bathrooms</option>
              <option value="3.5">3.5 Bathrooms</option>
              <option value="4">4+ Bathrooms</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="square-footage">Square Footage</label>
            <input type="number" id="square-footage" placeholder="e.g., 1850">
            <small>Optional - interior living space</small>
          </div>
          
          <div class="form-group">
            <label for="lot-size">Lot Size (sq ft)</label>
            <input type="number" id="lot-size" placeholder="e.g., 6000">
            <small>Optional - total property size</small>
          </div>
          
          <div class="form-group">
            <label for="parking-spaces">Parking Spaces</label>
            <select id="parking-spaces">
              <option value="0">No Parking</option>
              <option value="1">1 Space</option>
              <option value="2">2 Spaces</option>
              <option value="3">3+ Spaces</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="year-built">Year Built</label>
            <input type="number" id="year-built" placeholder="e.g., 1985" min="1800" max="2024">
            <small>Optional - approximate year</small>
          </div>
        </div>
      </div>
      
      <div class="condition-section">
        <h4>Property Condition</h4>
        <div class="condition-options">
          ${propertyConditions.map(condition => `
            <label class="condition-card">
              <input type="radio" name="property-condition" value="${condition.id}">
              <div class="condition-content">
                <h5>${condition.name}</h5>
                <p>${condition.description}</p>
              </div>
            </label>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderListingPricingStep() {
  return `
    <div class="listing-section">
      <h3>💰 Pricing Information</h3>
      <p>Set your asking price and provide additional cost details</p>
      
      <div class="pricing-main">
        <div class="form-group large">
          <label for="asking-price">Asking Price</label>
          <div class="price-input">
            <span class="currency">$</span>
            <input type="number" id="asking-price" placeholder="750000" required>
          </div>
        </div>
        
        <div class="market-comparison" id="market-comparison">
          <!-- Market comparison will be populated -->
        </div>
      </div>
      
      <div class="additional-costs">
        <h4>Additional Costs</h4>
        
        <div class="costs-grid">
          <div class="form-group">
            <label for="property-taxes">Annual Property Taxes</label>
            <div class="price-input">
              <span class="currency">$</span>
              <input type="number" id="property-taxes" placeholder="4500">
            </div>
            <small>Optional - helps buyers estimate total costs</small>
          </div>
          
          <div class="form-group">
            <label for="strata-fees">Monthly Strata/HOA Fees</label>
            <div class="price-input">
              <span class="currency">$</span>
              <input type="number" id="strata-fees" placeholder="250">
            </div>
            <small>For condos and townhouses</small>
          </div>
        </div>
        
        <div class="form-group">
          <label for="utilities">Utilities Included</label>
          <div class="utilities-options">
            <label class="utility-option">
              <input type="checkbox" name="utilities" value="heat">
              <span>Heat</span>
            </label>
            <label class="utility-option">
              <input type="checkbox" name="utilities" value="hydro">
              <span>Hydro</span>
            </label>
            <label class="utility-option">
              <input type="checkbox" name="utilities" value="water">
              <span>Water</span>
            </label>
            <label class="utility-option">
              <input type="checkbox" name="utilities" value="internet">
              <span>Internet</span>
            </label>
          </div>
        </div>
      </div>
      
      <div class="pricing-notes">
        <div class="form-group">
          <label for="pricing-notes">Pricing Notes</label>
          <textarea id="pricing-notes" placeholder="e.g., Recent renovations justify premium pricing, flexible on closing date..."></textarea>
          <small>Optional - explain your pricing strategy or special conditions</small>
        </div>
      </div>
    </div>
  `;
}

function renderListingFeaturesStep() {
  return `
    <div class="listing-section">
      <h3>✨ Property Features</h3>
      <p>Select features that make your property special</p>
      
      <div class="feature-categories">
        ${Object.entries(propertyFeatures).map(([category, features]) => `
          <div class="feature-category">
            <h4>${category.replace(/([A-Z])/g, ' $1').trim()}</h4>
            <div class="feature-grid">
              ${features.map(feature => `
                <label class="feature-item">
                  <input type="checkbox" name="listing-features" value="${feature.id}">
                  <span class="feature-icon">${feature.icon}</span>
                  <span class="feature-name">${feature.name}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="accessibility-features">
        <h4>♿ Accessibility Features</h4>
        <div class="accessibility-grid">
          <label class="feature-item">
            <input type="checkbox" name="accessibility" value="wheelchair-accessible">
            <span class="feature-icon">♿</span>
            <span class="feature-name">Wheelchair Accessible</span>
          </label>
          <label class="feature-item">
            <input type="checkbox" name="accessibility" value="main-floor-living">
            <span class="feature-icon">🏠</span>
            <span class="feature-name">Main Floor Living</span>
          </label>
          <label class="feature-item">
            <input type="checkbox" name="accessibility" value="elevator">
            <span class="feature-icon">🛗</span>
            <span class="feature-name">Elevator Access</span>
          </label>
          <label class="feature-item">
            <input type="checkbox" name="accessibility" value="grab-bars">
            <span class="feature-icon">🚿</span>
            <span class="feature-name">Grab Bars</span>
          </label>
        </div>
      </div>
      
      <div class="buyer-appeal">
        <h4>💡 Buyer Appeal Analysis</h4>
        <div id="feature-appeal" class="appeal-analysis">
          <p>Select features to see how they appeal to Kingston buyers</p>
        </div>
      </div>
    </div>
  `;
}

function renderListingPhotosStep() {
  return `
    <div class="listing-section">
      <h3>📸 Property Photos</h3>
      <p>Upload high-quality photos to showcase your property</p>
      
      <div class="photo-upload">
        <div class="upload-area">
          <div class="upload-zone" onclick="triggerPhotoUpload()">
            <div class="upload-icon">📷</div>
            <h4>Click to upload photos</h4>
            <p>Or drag and drop images here</p>
            <small>Supported: JPG, PNG (max 10MB each)</small>
          </div>
          <input type="file" id="photo-upload" multiple accept="image/*" style="display: none;">
        </div>
        
        <div class="photo-guidelines">
          <h4>📋 Photo Tips</h4>
          <ul>
            <li>📷 Take photos during the day with natural light</li>
            <li>🏠 Include exterior shots (front, back, sides)</li>
            <li>🛏️ Show all bedrooms and main living areas</li>
            <li>🧹 Clean and declutter before shooting</li>
            <li>📐 Use wide-angle shots to show space</li>
            <li>✨ Highlight unique features and upgrades</li>
          </ul>
        </div>
      </div>
      
      <div class="photo-grid" id="photo-preview-grid">
        <!-- Uploaded photos will appear here -->
      </div>
      
      <div class="photo-limits">
        <p>Free tier: Up to 10 photos | Premium: Unlimited photos + virtual tour hosting</p>
      </div>
    </div>
  `;
}

function renderListingDescriptionStep() {
  return `
    <div class="listing-section">
      <h3>📝 Property Description</h3>
      <p>Write an engaging description that highlights your property's best features</p>
      
      <div class="description-main">
        <div class="form-group">
          <label for="property-highlights">Property Highlights</label>
          <textarea id="property-highlights" placeholder="Describe what makes your property special..."></textarea>
          <small>Focus on unique features, recent upgrades, and lifestyle benefits</small>
        </div>
      </div>
      
      <div class="description-sections">
        <div class="form-group">
          <label for="neighbourhood-description">Neighbourhood & Location</label>
          <textarea id="neighbourhood-description" placeholder="Describe the neighbourhood, nearby amenities, and location benefits..."></textarea>
          <small>Mention schools, parks, shopping, transit, and community features</small>
        </div>
        
        <div class="form-group">
          <label for="schools-description">Schools & Education</label>
          <textarea id="schools-description" placeholder="Nearby schools, school boards, and educational opportunities..."></textarea>
          <small>Include elementary, secondary, and post-secondary options</small>
        </div>
        
        <div class="form-group">
          <label for="transportation-description">Transportation & Accessibility</label>
          <textarea id="transportation-description" placeholder="Transit options, highway access, walkability..."></textarea>
          <small>Mention public transit, major routes, and commute times</small>
        </div>
      </div>
      
      <div class="description-preview">
        <h4>📋 Listing Preview</h4>
        <div class="listing-preview-card">
          <div class="preview-header">
            <h5 id="preview-address">Your property address</h5>
            <span class="preview-price" id="preview-price">$0</span>
          </div>
          <div class="preview-specs" id="preview-specs">
            <span>Beds: - | Baths: - | sqft: -</span>
          </div>
          <div class="preview-description" id="preview-description">
            Your description will appear here...
          </div>
        </div>
      </div>
      
      <div class="listing-actions">
        <h4>🚀 Ready to Launch?</h4>
        <div class="action-options">
          <label class="action-option">
            <input type="radio" name="listing-action" value="draft" checked>
            <div class="option-content">
              <h5>💾 Save as Draft</h5>
              <p>Review and edit before making it live</p>
            </div>
          </label>
          <label class="action-option">
            <input type="radio" name="listing-action" value="active">
            <div class="option-content">
              <h5>🚀 Publish Now</h5>
              <p>Make it live and start attracting buyers</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  `;
}

// Listing wizard interaction functions
function addListingStepListeners(step) {
  switch(step) {
    case 1:
      ['property-street', 'property-city', 'property-province', 'property-postal'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.addEventListener('input', (e) => {
            const key = id.replace('property-', '');
            window.listingData.basicInfo.address[key] = e.target.value;
          });
        }
      });
      break;
      
    case 2:
      document.querySelectorAll('input[name="listing-property-type"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          window.listingData.basicInfo.propertyType = e.target.value;
        });
      });
      
      ['bedrooms', 'bathrooms', 'square-footage', 'lot-size', 'parking-spaces', 'year-built'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.addEventListener('change', (e) => {
            const key = id.replace('-', '');
            if (key === 'squarefootage') {
              window.listingData.basicInfo.squareFootage = parseInt(e.target.value) || null;
            } else if (key === 'lotsize') {
              window.listingData.basicInfo.lotSize = parseInt(e.target.value) || null;
            } else if (key === 'parkingspaces') {
              window.listingData.basicInfo.parkingSpaces = parseInt(e.target.value) || 0;
            } else if (key === 'yearbuilt') {
              window.listingData.basicInfo.yearBuilt = parseInt(e.target.value) || null;
            } else {
              window.listingData.basicInfo[key] = e.target.value;
            }
          });
        }
      });
      break;
      
    case 3:
      document.getElementById('asking-price').addEventListener('input', (e) => {
        window.listingData.pricing.askingPrice = parseInt(e.target.value) || null;
        updatePricePreview();
      });
      
      ['property-taxes', 'strata-fees'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.addEventListener('input', (e) => {
            const key = id.replace('-', '');
            if (key === 'propertytaxes') {
              window.listingData.pricing.propertyTaxes = parseInt(e.target.value) || null;
            } else if (key === 'stratafees') {
              window.listingData.pricing.strataFees = parseInt(e.target.value) || null;
            }
          });
        }
      });
      
      document.querySelectorAll('input[name="utilities"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateUtilities);
      });
      
      document.getElementById('pricing-notes').addEventListener('input', (e) => {
        window.listingData.pricing.notes = e.target.value;
      });
      break;
      
    case 4:
      document.querySelectorAll('input[name="listing-features"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateFeatures);
      });
      
      document.querySelectorAll('input[name="accessibility"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateAccessibilityFeatures);
      });
      break;
      
    case 6:
      ['property-highlights', 'neighbourhood-description', 'schools-description', 'transportation-description'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.addEventListener('input', (e) => {
            const key = id.replace('-description', '').replace('-', '');
            if (key === 'propertyhighlights') {
              window.listingData.description.highlights = e.target.value;
            } else if (key === 'neighbourhood') {
              window.listingData.description.neighborhood = e.target.value;
            } else if (key === 'schools') {
              window.listingData.description.schools = e.target.value;
            } else if (key === 'transportation') {
              window.listingData.description.transportation = e.target.value;
            }
            updateListingPreview();
          });
        }
      });
      break;
  }
}

function nextListingStep() {
  if (validateListingStep()) {
    if (window.listingStep < 6) {
      window.listingStep++;
      renderListingStep(window.listingStep);
    } else {
      completeListingCreation();
    }
  }
}

function previousListingStep() {
  if (window.listingStep > 1) {
    window.listingStep--;
    renderListingStep(window.listingStep);
  }
}

function validateListingStep() {
  switch(window.listingStep) {
    case 1:
      const street = document.getElementById('property-street').value.trim();
      const postal = document.getElementById('property-postal').value.trim();
      
      if (!street || !postal) {
        alert('Please enter the street address and postal code');
        return false;
      }
      break;
      
    case 2:
      if (!window.listingData.basicInfo.propertyType) {
        alert('Please select a property type');
        return false;
      }
      
      if (!window.listingData.basicInfo.bedrooms || !window.listingData.basicInfo.bathrooms) {
        alert('Please specify the number of bedrooms and bathrooms');
        return false;
      }
      break;
      
    case 3:
      if (!window.listingData.pricing.askingPrice) {
        alert('Please enter an asking price');
        return false;
      }
      break;
  }
  
  return true;
}

function updateUtilities() {
  const utilities = [];
  document.querySelectorAll('input[name="utilities"]:checked').forEach(checkbox => {
    utilities.push(checkbox.value);
  });
  window.listingData.pricing.utilities = utilities;
}

function updateFeatures() {
  Object.keys(window.listingData.features).forEach(category => {
    window.listingData.features[category] = [];
  });
  
  document.querySelectorAll('input[name="listing-features"]:checked').forEach(checkbox => {
    const featureId = checkbox.value;
    Object.entries(propertyFeatures).forEach(([category, features]) => {
      if (features.some(f => f.id === featureId)) {
        window.listingData.features[category].push(featureId);
      }
    });
  });
}

function updateAccessibilityFeatures() {
  const accessibilityFeatures = [];
  document.querySelectorAll('input[name="accessibility"]:checked').forEach(checkbox => {
    accessibilityFeatures.push(checkbox.value);
  });
  window.listingData.features.accessibility = accessibilityFeatures;
}

function updatePricePreview() {
  const price = window.listingData.pricing.askingPrice;
  if (price) {
    document.getElementById('preview-price').textContent = `$${price.toLocaleString()}`;
    
    const comparison = document.getElementById('market-comparison');
    if (comparison) {
      comparison.innerHTML = `
        <div class="market-stats">
          <h4>📊 Market Comparison</h4>
          <div class="stats-grid">
            <div class="stat">
              <span class="stat-label">Avg in Kingston</span>
              <span class="stat-value">$${Math.round(price * 0.95).toLocaleString()}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Market Position</span>
              <span class="stat-value">Above Average</span>
            </div>
          </div>
        </div>
      `;
    }
  }
}

function updateListingPreview() {
  const address = `${window.listingData.basicInfo.address.street}, ${window.listingData.basicInfo.address.city}`;
  const bedrooms = window.listingData.basicInfo.bedrooms || '-';
  const bathrooms = window.listingData.basicInfo.bathrooms || '-';
  const sqft = window.listingData.basicInfo.squareFootage || '-';
  
  document.getElementById('preview-address').textContent = address;
  document.getElementById('preview-specs').textContent = `${bedrooms} beds | ${bathrooms} baths | ${sqft} sqft`;
  document.getElementById('preview-description').textContent = window.listingData.description.highlights || 'Your description will appear here...';
}

function geocodeAddress() {
  alert('📍 Map integration coming soon! Address will be verified automatically.');
}

function triggerPhotoUpload() {
  document.getElementById('photo-upload').click();
}

function completeListingCreation() {
  const action = document.querySelector('input[name="listing-action"]:checked')?.value || 'draft';
  
  const listing = {
    id: `listing-${Date.now()}`,
    ...window.listingData,
    listingDetails: {
      ...window.listingData.listingDetails,
      status: action === 'active' ? 'active' : 'draft',
      listingDate: action === 'active' ? new Date().toISOString() : null
    }
  };
  
  if (action === 'active') {
    iftttService.notifyNewMatch({
      listingId: listing.id,
      address: `${listing.basicInfo.address.street}, ${listing.basicInfo.address.city}`,
      price: listing.pricing.askingPrice,
      propertyType: listing.basicInfo.propertyType,
      bedrooms: listing.basicInfo.bedrooms,
      bathrooms: listing.basicInfo.bathrooms
    });
  }
  
  const message = action === 'active' 
    ? '🎉 Listing published successfully! You\'ll start receiving buyer interest notifications.'
    : '💾 Listing saved as draft. You can edit and publish it later.';
    
  alert(message);
  modal.close();
  
  setTimeout(() => {
    showSellerDashboard(listing.sellerId);
  }, 500);
}

function showSellerDashboard(sellerId) {
  alert('🏠 Seller dashboard with analytics and buyer matches coming soon!');
}

// Make listing functions globally available
window.startPropertyListingWizard = startPropertyListingWizard;
window.geocodeAddress = geocodeAddress;
window.triggerPhotoUpload = triggerPhotoUpload;
window.nextListingStep = nextListingStep;
window.previousListingStep = previousListingStep;

// Notification and Location Monitoring Functions
function showNotificationCenter() {
  const notifications = notificationManager.getNotifications();
  
  const content = `
    <div class="notification-center">
      <div class="notification-header">
        <h2>🔔 Notifications</h2>
        <div class="notification-actions">
          <button onclick="notificationManager.markAllAsRead()">Mark All Read</button>
          <button onclick="showNotificationSettings()">Settings</button>
        </div>
      </div>
      
      <div class="notification-list">
        ${notifications.length === 0 ? `
          <div class="no-notifications">
            <p>📭 No notifications yet</p>
            <p>You'll receive alerts based on your subscription and monitoring zones.</p>
          </div>
        ` : notifications.map(notification => `
          <div class="notification-item ${notification.read ? 'read' : 'unread'} priority-${notification.priority}">
            <div class="notification-icon">${notificationTypes[notification.type]?.icon || '🔔'}</div>
            <div class="notification-content">
              <div class="notification-title">${notification.title}</div>
              <div class="notification-message">${notification.message}</div>
              <div class="notification-meta">
                ${notification.zoneName ? `📍 ${notification.zoneName} • ` : ''}
                ${new Date(notification.timestamp).toLocaleString()}
              </div>
            </div>
            <div class="notification-actions">
              ${!notification.read ? `<button onclick="markNotificationRead('${notification.id}')">Mark Read</button>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  modal.showModal();
  modalTitle.textContent = 'Notification Center';
  modalContent.innerHTML = content;
}

function showNotificationSettings() {
  const preferences = notificationManager.userPreferences;
  
  const content = `
    <div class="notification-settings">
      <h3>🔔 Notification Settings</h3>
      
      <div class="settings-section">
        <h4>Frequency</h4>
        <select id="notification-frequency-setting" onchange="updateNotificationFrequency(this.value)">
          ${Object.entries(notificationPreferences.frequency).map(([key, option]) => `
            <option value="${key}" ${preferences.frequency === key ? 'selected' : ''}>
              ${option.icon} ${option.name}
            </option>
          `).join('')}
        </select>
        <p class="setting-description">${notificationPreferences.frequency[preferences.frequency]?.description}</p>
      </div>
      
      <div class="settings-section">
        <h4>Delivery Channels</h4>
        <div class="channel-settings">
          ${Object.entries(notificationPreferences.channels).map(([key, channel]) => `
            <label class="channel-setting">
              <input type="checkbox" value="${key}" 
                ${preferences.channels[key] ? 'checked' : ''} 
                onchange="updateNotificationChannel('${key}', this.checked)">
              <span class="channel-icon">${channel.icon}</span>
              <span class="channel-info">
                <span class="channel-name">${channel.name}</span>
                <span class="channel-description">${channel.description}</span>
              </span>
            </label>
          `).join('')}
        </div>
      </div>
      
      <div class="settings-section">
        <h4>📍 Location Monitoring</h4>
        <div class="monitoring-zones">
          ${notificationManager.monitoringZones.length === 0 ? `
            <p>No monitoring zones set up yet.</p>
            <button onclick="showLocationMonitoringSetup()" class="btn-primary">Set Up Monitoring</button>
          ` : `
            ${notificationManager.monitoringZones.map(zone => `
              <div class="monitoring-zone">
                <div class="zone-info">
                  <h5>${zone.nickname}</h5>
                  <p>${zone.address}</p>
                  <p>Radius: ${zone.radius}km</p>
                </div>
                <div class="zone-actions">
                  <button onclick="editMonitoringZone('${zone.id}')" class="btn-secondary">Edit</button>
                  <button onclick="removeMonitoringZone('${zone.id}')" class="btn-danger">Remove</button>
                </div>
              </div>
            `).join('')}
            <button onclick="showLocationMonitoringSetup()" class="btn-primary">Add Zone</button>
          `}
        </div>
      </div>
    </div>
  `;
  
  modalContent.innerHTML = content;
  modalTitle.textContent = 'Notification Settings';
}

function showLocationMonitoringSetup() {
  const currentUserRole = state.currentUser?.role || 'homeowner';
  const isAgent = currentUserRole === 'agent';
  const maxZones = isAgent ? 1 : 2;
  const radius = isAgent ? 50 : 15;
  const zoneType = isAgent ? 'region' : 'zone';
  
  const content = `
    <div class="location-monitoring-setup">
      <h3>📍 Set Up Location Monitoring</h3>
      <p>Monitor ${maxZones} ${zoneType}${maxZones > 1 ? 's' : ''} with ${radius}km radius each</p>
      
      <div class="setup-form">
        <div class="form-group">
          <label for="monitor-address">Address or Location</label>
          <input type="text" id="monitor-address" placeholder="Enter address, postal code, or location">
          <button onclick="geocodeMonitoringAddress()" class="btn-secondary">📍 Find Location</button>
        </div>
        
        <div class="form-group">
          <label for="monitor-nickname">Nickname (optional)</label>
          <input type="text" id="monitor-nickname" placeholder="e.g., Downtown, My Territory">
        </div>
        
        <div class="map-preview">
          <div id="monitoring-map" style="height: 300px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <p>🗺️ Map will show selected location and monitoring radius</p>
          </div>
        </div>
        
        <div class="notification-types">
          <h4>Notification Types</h4>
          ${isAgent ? `
            <label><input type="checkbox" checked> New buyers entering region</label>
            <label><input type="checkbox" checked> Market trend shifts</label>
            <label><input type="checkbox" checked> Pre-approved buyer alerts</label>
            <label><input type="checkbox" checked> Demand spikes</label>
          ` : `
            <label><input type="checkbox" checked> New buyer wishlists</label>
            <label><input type="checkbox" checked> Wishlist updates</label>
            <label><input type="checkbox" checked> Buyer activity alerts</label>
            <label><input type="checkbox" checked> Market trends</label>
          `}
        </div>
        
        <div class="setup-actions">
          <button onclick="saveMonitoringZone()" class="btn-primary">Save Monitoring ${zoneType}</button>
          <button onclick="modal.close()" class="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  `;
  
  modalContent.innerHTML = content;
  modalTitle.textContent = 'Location Monitoring Setup';
}

function updateNotificationFrequency(frequency) {
  notificationManager.updatePreferences({ frequency });
}

function updateNotificationChannel(channel, enabled) {
  const channels = { ...notificationManager.userPreferences.channels };
  channels[channel] = enabled;
  notificationManager.updatePreferences({ channels });
}

function markNotificationRead(notificationId) {
  notificationManager.markAsRead(notificationId);
  showNotificationCenter(); // Refresh the display
}

function geocodeMonitoringAddress() {
  const address = document.getElementById('monitor-address').value;
  if (address) {
    // Simulate geocoding for Kingston area
    const kingstonCoords = { lat: 44.2312, lng: -76.4860 };
    document.getElementById('monitoring-map').innerHTML = `
      <p>📍 Location found: ${address}<br>
      Coordinates: ${kingstonCoords.lat}, ${kingstonCoords.lng}</p>
    `;
    
    // Store coordinates for saving
    window.monitoringCoords = kingstonCoords;
  }
}

function saveMonitoringZone() {
  const address = document.getElementById('monitor-address').value;
  const nickname = document.getElementById('monitor-nickname').value;
  const coords = window.monitoringCoords || { lat: 44.2312, lng: -76.4860 };
  
  if (!address) {
    alert('Please enter a valid address');
    return;
  }
  
  try {
    const currentUserRole = state.currentUser?.role || 'homeowner';
    
    if (currentUserRole === 'agent') {
      notificationManager.addProfessionalMonitoringRegion(
        coords.lat, coords.lng, address, nickname
      );
    } else {
      notificationManager.addHomeownerMonitoringZone(
        coords.lat, coords.lng, address, nickname
      );
    }
    
    alert('🎉 Monitoring zone saved successfully!');
    modal.close();
    
    // Simulate immediate notification
    setTimeout(() => {
      simulateLocationNotification();
    }, 2000);
    
  } catch (error) {
    alert(error.message);
  }
}

function simulateLocationNotification() {
  const currentUserRole = state.currentUser?.role || 'homeowner';
  
  if (currentUserRole === 'agent') {
    notificationManager.notifyMarketTrend('newBuyerInRegion', {
      propertyType: 'Condo',
      budget: 650000,
      timeline: 'immediate'
    }, notificationManager.monitoringZones[0]);
  } else {
    notificationManager.notifyBuyerActivityInZone('newWishlistInZone', {
      propertyType: 'House',
      budget: 750000,
      bedrooms: '3+'
    }, { lat: 44.2312, lng: -76.4860 });
  }
}

// Make notification functions globally available
window.showNotificationCenter = showNotificationCenter;
window.showNotificationSettings = showNotificationSettings;
window.showLocationMonitoringSetup = showLocationMonitoringSetup;
window.updateNotificationFrequency = updateNotificationFrequency;
window.updateNotificationChannel = updateNotificationChannel;
window.markNotificationRead = markNotificationRead;
window.geocodeMonitoringAddress = geocodeMonitoringAddress;
window.saveMonitoringZone = saveMonitoringZone;

console.log('App.js fully loaded, waiting for DOM...');
