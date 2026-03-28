# Quick Start: Embedding Booking Widget

## Get Your Store Slug
Your booking widget is accessible via a unique URL. To find your store slug:

1. Go to your dashboard
2. Check **Online Booking** settings to find your `bookingSlug`
3. Or it's based on your store's URL

## Option 1: Copy & Paste iframe (Recommended for Non-Technical Users)

```html
<iframe src="https://yourbookingapp.com/widget?slug=YOUR_STORE_SLUG" 
        width="100%" 
        height="700" 
        style="border: none; border-radius: 8px;">
</iframe>
```

Replace `yourbookingapp.com` with your actual domain and `YOUR_STORE_SLUG` with your store slug.

### Example:
```html
<iframe src="https://bookings.example.com/widget?slug=my-salon" 
        width="100%" 
        height="700" 
        style="border: none; border-radius: 8px;">
</iframe>
```

## Option 2: Custom HTML Page

Save this as an `.html` file on your website:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Book an Appointment</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      color: white;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 16px;
      opacity: 0.9;
    }
    iframe {
      width: 100%;
      height: 700px;
      border: none;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Book an Appointment</h1>
      <p>Schedule your visit today</p>
    </div>
    <iframe src="https://yourbookingapp.com/widget?slug=YOUR_STORE_SLUG"></iframe>
  </div>
</body>
</html>
```

## Option 3: WordPress/Website Page

For WordPress or website builders:

1. Create a new page
2. Add a custom HTML/embed block
3. Paste this code:

```html
<div style="max-width: 500px; margin: 30px auto;">
  <iframe src="https://yourbookingapp.com/widget?slug=YOUR_STORE_SLUG" 
          width="100%" 
          height="700" 
          style="border: none; border-radius: 8px;">
  </iframe>
</div>
```

## Customizing Appearance

### Add a Background Color
```html
<div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
  <iframe src="https://yourbookingapp.com/widget?slug=YOUR_STORE_SLUG" 
          width="100%" 
          height="700" 
          style="border: none; border-radius: 8px;">
  </iframe>
</div>
```

### Add a Title
```html
<div style="max-width: 500px; margin: 20px auto;">
  <h2 style="text-align: center; margin-bottom: 20px; color: #333;">
    📅 Schedule Your Appointment
  </h2>
  <iframe src="https://yourbookingapp.com/widget?slug=YOUR_STORE_SLUG" 
          width="100%" 
          height="700" 
          style="border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  </iframe>
</div>
```

### Make It Responsive
```html
<style>
  .booking-widget {
    max-width: 500px;
    margin: 0 auto;
  }
  
  @media (max-width: 768px) {
    .booking-widget {
      margin: 0 10px;
    }
  }
</style>

<div class="booking-widget">
  <iframe src="https://yourbookingapp.com/widget?slug=YOUR_STORE_SLUG" 
          width="100%" 
          height="700" 
          style="border: none; border-radius: 8px;">
  </iframe>
</div>
```

## Testing

1. Visit: `https://yourbookingapp.com/widget?slug=YOUR_STORE_SLUG`
2. Verify you see the booking widget
3. Test the complete booking flow:
   - Select a client type
   - Choose a service
   - Pick a date and time
   - Fill in your details
   - Confirm the booking

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Widget not loading | Check your store slug is correct |
| No services showing | Verify services are created in your system |
| No time slots | Ensure staff are scheduled for that date |
| Booking fails | Check browser console (F12) for errors |

## Next Steps

- Share the booking link with customers
- Add it to your website
- Include in email signatures
- Post on social media

Need help? Check the full [Booking Widget Guide](./BOOKING_WIDGET_GUIDE.md)
