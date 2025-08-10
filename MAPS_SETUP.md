# Maps Setup Guide

## Overview
Your app now supports both **Yandex Maps** and **Google Maps** with automatic fallback. **Yandex Maps is recommended** due to its generous free tier (2.5M requests/year).

## Quick Setup

### Option 1: Yandex Maps (Recommended - FREE)
1. Visit: https://developer.tech.yandex.com/
2. Create account/login
3. Go to "Maps API" → "Get API Key"
4. Copy your API key
5. Update `.env` file:
   ```
   EXPO_PUBLIC_YANDEX_MAPS_API_KEY=your_actual_api_key_here
   ```

### Option 2: Google Maps (Fallback)
1. Visit: https://console.cloud.google.com/
2. Create project/select project
3. Enable "Maps JavaScript API"
4. Create credentials → API Key
5. Update `.env` file:
   ```
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   EXPO_PUBLIC_MAPS_PROVIDER=google
   ```

## Current Configuration

Your `.env` file should look like:
```env
# Maps Configuration
EXPO_PUBLIC_YANDEX_MAPS_API_KEY=your_yandex_api_key_here
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
EXPO_PUBLIC_MAPS_PROVIDER=yandex
```

## Features Implemented

### ✅ Backend
- ✅ Location fields added to seller profiles
- ✅ Seller location API endpoints
- ✅ Seller profile with product catalog API

### ✅ Frontend  
- ✅ Floating map button on home screen
- ✅ Interactive map showing seller locations
- ✅ Map/List view toggle
- ✅ Location-based filtering
- ✅ Seller profile pages with products
- ✅ Contact sellers directly from map

### 🗺️ Map Views
- **Map View**: Interactive web-based map with markers
- **List View**: Card-based list with seller details
- **Fallback**: Works without API keys (shows seller list)

## Usage

1. **For Buyers**: 
   - Tap floating map button on home screen
   - Toggle between map/list views
   - Filter by location
   - Tap markers/cards to see seller details
   - Contact sellers directly

2. **For Sellers**:
   - Update location via API (backend endpoint ready)
   - Set business hours and shop description
   - Appear on map when location is set

## API Usage Comparison

| Provider | Free Tier | Billing Required | Setup Complexity |
|----------|-----------|------------------|------------------|
| **Yandex Maps** | 2.5M requests/year | ❌ No | ⭐ Simple |
| **Google Maps** | ~28K requests/month | ✅ Yes | ⭐⭐⭐ Complex |

## Testing

Without API keys, the app shows:
- ✅ Seller locations in list format
- ✅ All seller information and filtering
- ✅ Navigation to seller profiles
- ⚠️ Map fallback message

With API keys:
- ✅ Interactive map with markers
- ✅ Zoom, pan, marker interactions
- ✅ Automatic region adjustment
- ✅ Visual location representation

## Next Steps

1. **Get Yandex API Key** (recommended)
2. **Test the map functionality** 
3. **Add seller location management** (optional)
4. **Consider upgrading to native maps** if needed

## Troubleshooting

**Map not loading?**
- Check API key in `.env` file
- Ensure key doesn't contain placeholder text
- Check console for error messages
- Verify internet connection

**No sellers showing?**
- Check if sellers have latitude/longitude in database
- Verify API endpoints are working
- Check location filters

**Need help?**
The app will work with the list view even without API keys, so you can test all functionality immediately!