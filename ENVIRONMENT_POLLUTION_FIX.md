# Environment Pollution Fix - Booking Application

## Problem Summary
The booking application was contaminating the global environment variables for all Node.js applications on the VPS server, causing database connection issues for other applications like the malebox chat line system.

## Root Cause Identified
The booking systemd service (`/etc/systemd/system/booking.service`) was using `dotenv/config` to load environment variables globally:

```
ExecStart=/usr/bin/node -r dotenv/config dist/index.cjs
```

This caused the booking application's `.env` file contents (including `DATABASE_URL=postgresql://certxa_user:...`) to be loaded into the global environment, affecting all subsequent Node.js processes on the server.

## Impact on Other Applications
- Malebox chat line application was connecting to the wrong database (`polish_ai` instead of `malebox_chatline`)
- API endpoints returning 500 errors due to incorrect database connections
- Environment variable conflicts between multiple applications

## Solution Applied

### 1. Fixed Systemd Service
Modified `/etc/systemd/system/booking.service` to remove global dotenv loading:

**Before:**
```
ExecStart=/usr/bin/node -r dotenv/config dist/index.cjs
```

**After:**
```
ExecStart=/usr/bin/node dist/index.cjs
```

### 2. Service Restart
- Ran `systemctl daemon-reload` to reload systemd configuration
- Restarted booking service with `systemctl restart booking`

## Prevention Measures

### For Future Setups:
1. **Never use global dotenv loading in systemd services**
2. **Use application-specific environment loading** within the application code
3. **Isolate environment variables per application**
4. **Use explicit environment variable setting in systemd services when needed**

### Recommended Systemd Service Format:
```ini
[Service]
Type=simple
User=root
WorkingDirectory=/opt/booking
ExecStart=/usr/bin/node dist/index.cjs
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=DATABASE_URL=postgresql://certxa_user:booking_secure_pass_2024@127.0.0.1/ctxa_db?sslmode=disable
```

## Verification
After the fix:
- Booking application continues to run normally
- Other applications can now use their own environment variables without interference
- Malebox chat line application can connect to its correct database

## Files Modified
- `/etc/systemd/system/booking.service` - Removed global dotenv loading

## Notes for System Administrators
- Always check for global environment pollution when multiple Node.js applications share a server
- Use `ps aux | grep node` and `cat /proc/[PID]/environ` to debug environment variable issues
- Consider using Docker containers for better application isolation in production

## Impact on Git Repository
This fix primarily involves server configuration files outside the application codebase. The booking application code itself doesn't need changes, but the setup script should be updated to prevent similar issues in future deployments.
