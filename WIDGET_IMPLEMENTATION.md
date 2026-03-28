# Booking Widget - Implementation Summary

## 🎯 What Was Created

A **minimal, embeddable booking widget** that allows customers to book appointments directly from your website or third-party sites. The widget is based on the ClassicTheme but without the header and footer, making it perfect for seamless integration.

## 📦 New Files Created

### Core Components
- **[BookingWidget.tsx](./client/src/pages/public-booking/BookingWidget.tsx)** - The main widget component
  - Minimal design (no header/footer)
  - Full booking flow with state management
  - Success confirmation screen
  - Responsive and embed-friendly

- **[BookingWidgetPage.tsx](./client/src/pages/BookingWidgetPage.tsx)** - Page wrapper for the widget
  - Handles query parameters
  - Loads store data
  - Provides a page context for the widget

### Documentation
- **[WIDGET_QUICK_START.md](./WIDGET_QUICK_START.md)** - Quick start guide for users
  - Simple copy-paste examples
  - Multiple integration options
  - Common customizations
  
- **[BOOKING_WIDGET_GUIDE.md](./BOOKING_WIDGET_GUIDE.md)** - Comprehensive implementation guide
  - Detailed usage instructions
  - API reference
  - Troubleshooting section

- **[WIDGET_EXAMPLE.html](./WIDGET_EXAMPLE.html)** - Ready-to-use HTML template
  - Professional landing page
  - Can be downloaded and customized
  - Includes styling and examples

### Updated Files
- **[App.tsx](./client/src/App.tsx)** - Added `/widget` route to enable the widget endpoint

## 🚀 How to Use

### For Users (via iframe)
The simplest way - just copy and paste:

```html
<iframe src="https://yourdomain.com/widget?slug=STORE_SLUG" 
        width="100%" 
        height="700" 
        style="border: none; border-radius: 8px;">
</iframe>
```

### For Developers (as React component)
```tsx
import BookingWidget from '@/pages/public-booking/BookingWidget';

<BookingWidget 
  store={storeData} 
  slug="store-slug"
  onBookingComplete={(data) => console.log(data)}
/>
```

## ✨ Key Features

✅ **No Header/Footer** - Clean, minimal design  
✅ **Responsive** - Works perfectly on mobile, tablet, desktop  
✅ **Embed-Friendly** - Works in iframes and as React components  
✅ **Full Booking Flow** - Client selection → Services → Date/Time → Confirmation  
✅ **Real-time Availability** - Shows available slots based on staff schedule  
✅ **Success Confirmation** - Shows booking details after confirmation  
✅ **Easy Integration** - Single URL or component prop  

## 📋 Widget Flow

1. **Client Selection** - New or returning customer
2. **Service Selection** - Browse services by category
3. **Date & Time** - Calendar view with available time slots
4. **Confirmation** - Enter customer details (name, email, phone)
5. **Success** - Confirmation with booking details

## 🔗 Access Points

- **Direct Access**: `https://yourdomain.com/widget?slug=YOUR_STORE_SLUG`
- **As Component**: Import `BookingWidget` and pass `store` + `slug` props
- **Subdomain Access**: `https://store-slug.yourdomain.com/widget` (if subdomain-based)

## 📝 Store Slug

Each account has a unique `bookingSlug`. Users can find theirs by:
1. Going to **Online Booking** settings in the dashboard
2. Checking their store configuration
3. Or it's typically their store name in slug format (e.g., "my-salon")

## 🎨 Customization Options

The widget uses your existing:
- Tailwind CSS configuration
- UI component library
- Color scheme

Style the wrapper/container with custom CSS for additional customization:
```html
<div class="my-custom-wrapper">
  <iframe src="..."></iframe>
</div>

<style>
  .my-custom-wrapper {
    /* Your custom styles */
    border-radius: 20px;
    box-shadow: custom shadow;
  }
</style>
```

## 🔄 Booking Completion

When a booking is successful:
- Customer sees confirmation with booking details
- API creates the booking in the system
- Confirmation email is sent (if configured)
- Widget auto-resets after 3 seconds for next booking

Optional callback for developers:
```tsx
onBookingComplete={(bookingData) => {
  // Track analytics
  // Show custom message
  // Redirect to thank you page
}}
```

## 🧪 Testing

1. Visit: `https://yourdomain.com/widget?slug=your-store-slug`
2. Complete a test booking
3. Verify in your dashboard that the booking was created
4. Check email for confirmation

## 📱 Responsive Behavior

Automatically adapts to:
- **Desktop** (recommended width: 400-600px)
- **Tablet** (full responsive)
- **Mobile** (optimal height: ~600px)

## 🔐 Security

The widget:
- Uses the same authentication as PublicBooking
- Validates all API requests on the backend
- Includes CORS protection
- Sanitizes user input

## 📊 Analytics & Tracking

The widget supports custom callbacks:
```tsx
onBookingComplete={(bookingData) => {
  // Send to your analytics
  gtag('event', 'booking_complete', { price: bookingData.total });
}}
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Store not found" | Verify store slug is correct |
| No services appear | Ensure services are created in dashboard |
| No time slots | Check staff availability for that date |
| Booking fails to submit | Check browser console (F12) for errors |
| Widget not loading in iframe | Verify CORS settings and domain whitelist |

## 📚 Related Documentation

- [WIDGET_QUICK_START.md](./WIDGET_QUICK_START.md) - Quick implementation examples
- [BOOKING_WIDGET_GUIDE.md](./BOOKING_WIDGET_GUIDE.md) - Full detailed guide
- [WIDGET_EXAMPLE.html](./WIDGET_EXAMPLE.html) - Ready-to-use HTML template

## 🎓 For Your Customers

Share these resources with your customers who want to embed the widget:

1. **Quick Start**: Send them to [WIDGET_QUICK_START.md](./WIDGET_QUICK_START.md)
2. **HTML Template**: Provide [WIDGET_EXAMPLE.html](./WIDGET_EXAMPLE.html)
3. **Their Store Slug**: Help them find it in their Online Booking settings

## ✅ Next Steps

1. **Test the widget locally**
   ```bash
   npm run dev
   # Visit: http://localhost:5000/widget?slug=test-store
   ```

2. **Deploy to production**
   ```bash
   npm run build
   npm run deploy
   ```

3. **Share with customers**
   - Provide the Quick Start guide
   - Share the example HTML file
   - Include their unique widget URL

4. **Monitor usage**
   - Track bookings created via widget
   - Gather customer feedback
   - Iterate on customization as needed

---

**Created**: March 2024  
**Status**: Ready for production  
**Component**: BookingWidget.tsx  
**Route**: /widget  
