# Calendar Staff Column Width

The `/calendar` page uses a global fixed staff column width.

## Current Fixed Widths

- Time column: **72px**
- Each staff column: **180px**

## Formula

```text
Number of staff columns that fit = floor((screen width - 72) / 180)
```

## Approximate Staff Columns Before Horizontal Scrolling

| Screen width | Staff columns before bottom scroll |
|---:|---:|
| 870px preview width | 4 staff columns |
| 1024px | 5 staff columns |
| 1280px | 6 staff columns |
| 1440px | 7 staff columns |
| 1536px | 8 staff columns |
| 1920px | 10 staff columns |

## Notes

On the screenshot-sized Replit preview, about **4 staff columns** fit before horizontal scrolling if the visible preview area is around **870px** wide.

On a wider browser viewport around **1280px**, about **6 staff columns** fit before horizontal scrolling.

The staff column width should stay consistent across every account and every staff count, including when there is only one staff member on the calendar.