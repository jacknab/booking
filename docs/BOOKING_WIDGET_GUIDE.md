# Booking Widget Implementation Guide

## Overview
The **BookingWidget** is a minimal, embeddable booking component that allows customers to book appointments directly from your website. It's based on the ClassicTheme but without header or footer, making it perfect for seamless integration into your own web pages.

## Features
✅ No header or footer (clean, minimal design)  
✅ Responsive and embed-friendly  
✅ Supports both iframe and direct component embedding  
✅ Full booking flow: client selection → service selection → date/time → confirmation  
✅ Real-time availability checking  
✅ Success confirmation with booking details  

## Usage Methods

### Method 1: Embed as iFrame (Easiest)
Perfect for adding the widget to an external website without any code changes.

```html
<!-- Simple iframe embed -->
<iframe src="https://yourdomain.com/widget?slug=YOUR_STORE_SLUG" 
        width="100%" 
        height="700" 
        style="border: none; border-radius: 8px;">
</iframe>
```

#### Styling the iframe container:
```html
<div style="max-width: 500px; margin: 20px auto;">
  <iframe src="https://yourdomain.com/widget?slug=YOUR_STORE_SLUG" 
          width="100%" 
          height="700" 
          style="border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  </iframe>
</div>
```

### Method 2: Embed as React Component (Advanced)
For React applications that want full control.

```tsx
import BookingWidget from '@/pages/public-booking/BookingWidget';
import type { StoreData } from '@/pages/public-booking/types';

export function MyPage() {
  const storeData: StoreData = {
    id: 1,
    name: "My Salon",
    address: "123 Main St",
    timezone: "America/New_York",
    bookingSlug: "my-salon",
    // ... other store properties
  };

  const handleBookingComplete = (bookingData) => {
    console.log('Booking complete:', bookingData);
    // You can track the booking or update your page state here
  };

  return (
    <div>
      <h1>Book With Us</h1>
      <BookingWidget 
        store={storeData} 
        slug="my-salon"
        onBookingComplete={handleBookingComplete}
      />
    </div>
  );
}
```

## Implementation Steps

### For iFrame Method:
1. Determine your store's booking slug
2. Replace `YOUR_STORE_SLUG` in the iframe URL with your actual slug
3. Paste the iframe code into your website's HTML
4. Customize width/height as needed for your layout

### For Component Method:
1. Import the BookingWidget component
2. Fetch or provide your store data
3. Pass the store data and slug to the widget
4. (Optional) Add an `onBookingComplete` callback to handle confirmation

## URL Parameters

When using the iFrame method, you can customize behavior with URL parameters:

```
/widget?slug=YOUR_STORE_SLUG&theme=widget
```

## Styling & Customization

The widget uses your application's existing Tailwind CSS and UI component library, so it will automatically match your design system.

For custom styling within an iframe, use CSS to style the parent container:

```css
.booking-widget-container {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

## Responsive Behavior

The widget is fully responsive and works great on:
- ✓ Desktop (optimal width: 400-600px)
- ✓ Tablet
- ✓ Mobile

For best mobile experience, don't constrain the width on mobile devices:

```html
<div style="max-width: 500px; margin: 20px auto;">
  <!-- widget here -->
</div>

<style>
  @media (max-width: 640px) {
    .widget-container {
      max-width: 100%;
    }
  }
</style>
```

## Booking Flow

The widget guides customers through these steps:

1. **Client Selection** - New or returning customer
2. **Service Selection** - Browse services by category
3. **Date & Time** - Calendar view with time slot selection
4. **Confirmation** - Enter details and confirm booking
5. **Success** - Confirmation message with booking details

## Callbacks & Events

### onBookingComplete
Fired when a booking is successfully created.

```tsx
<BookingWidget 
  store={storeData} 
  slug="store-slug"
  onBookingComplete={(bookingData) => {
    // bookingData contains the booking confirmation
    console.log(bookingData);
  }}
/>
```

## API Endpoints Used

The widget relies on these API endpoints:
- `GET /api/public/store/:slug/services` - Fetch services and categories
- `GET /api/public/store/:slug/availability` - Get available time slots
- `POST /api/public/store/:slug/booking` - Create a booking

These endpoints are already implemented in your backend.

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Troubleshooting

### Widget not loading
- Check that the store `slug` is correct
- Verify the store exists in your database
- Check browser console for CORS errors

### No time slots available
- Verify staff members are scheduled for that date
- Check staff availability settings
- Ensure service duration matches available slots

### Form submission fails
- Verify the `/api/public/store/:slug/booking` endpoint is working
- Check that required fields are filled (name is required)
- Review browser console for API error details

## Example: Complete HTML Page

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Book an Appointment</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 20px;
      background: #f9fafb;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
    }
    h1 {
      text-align: center;
      color: #111827;
      margin-bottom: 30px;
    }
    iframe {
      width: 100%;
      height: 700px;
      border: none;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Book an Appointment</h1>
    <iframe src="https://yourdomain.com/widget?slug=my-salon"></iframe>
  </div>
</body>
</html>
```

## Next Steps

1. **Setup the widget route** - Ensure `/widget` route is available
2. **Test locally** - Verify the widget loads and booking flow works
3. **Deploy** - Push to production
4. **Share with customers** - Embed on your website or social media
