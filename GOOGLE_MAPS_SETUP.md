# Google Maps API Setup Guide

This guide explains how to set up Google Maps for the Yalla Bali Astro project.

## Features Added

The following components have been added to enhance area pages with Google Maps integration:

1. **MapEmbed** (`src/components/MapEmbed.astro`) - Embedded Google Map showing the area location
2. **StreetViewEmbed** (`src/components/StreetViewEmbed.astro`) - Street View imagery of the area

These are automatically included on all area detail pages (`/areas/[slug]`).

## Setup Steps

### 1. Create a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps Embed API
   - Street View Static API
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

### 2. Configure Your .env File

Add your API key to your `.env` file:

```bash
GOOGLE_MAPS_API_KEY=your-actual-api-key-here
```

### 3. Restrict Your API Key (Recommended)

For security, restrict your API key to:

- **HTTP referrers**: Add your domain (e.g., `https://ibalibali.com/*`)
- **APIs**: Restrict to only Maps Embed API and Street View Static API

This prevents your key from being used on other websites.

## Component Usage

### MapEmbed

Used in `areas/[slug].astro`:

```astro
<MapEmbed 
  areaName={area.name_he}
  areaNameEn={area.name_en}
  zoom={13}
  height="450px"
/>
```

**Props:**
- `areaName` (string, required) - Hebrew area name
- `areaNameEn` (string, optional) - English area name (used for better accuracy)
- `zoom` (number, default: 14) - Map zoom level (1-21)
- `height` (string, default: "400px") - Iframe height

### StreetViewEmbed

Used in `areas/[slug].astro`:

```astro
<StreetViewEmbed 
  areaName={area.name_he}
  areaNameEn={area.name_en}
  heading={0}
  pitch={0}
/>
```

**Props:**
- `areaName` (string, required) - Hebrew area name
- `areaNameEn` (string, optional) - English area name
- `height` (string, default: "400px") - Image height
- `heading` (number, default: 0) - Camera heading in degrees (0-360)
- `pitch` (number, default: 0) - Camera pitch in degrees (-90 to 90)

## API Costs

Google Maps Embed API and Street View Static API have generous free tiers:

- **Maps Embed API**: Free (unlimited usage)
- **Street View Static API**: $7 per 1,000 requests (first 25,000/month free)

## Troubleshooting

### Maps not showing
- Verify `GOOGLE_MAPS_API_KEY` is set in `.env`
- Check that the Maps Embed API is enabled in Google Cloud Console
- Verify your API key is not restricted to other referrers

### Street View images not loading
- Ensure Street View Static API is enabled
- Check that your API key quota hasn't been exceeded
- Verify the area name is valid (Street View may not be available in remote areas)

### Styling issues
- Both components are styled with Tailwind CSS classes matching the site's dark theme
- Rounded corners (`rounded-2xl`) and borders (`border-teal-500/20`) are applied

## Future Enhancements

Possible improvements:
- Add coordinates to `areas` table in Supabase for more precise map placement
- Create a map with multiple markers for attractions in each area
- Add directions from airport to each area
- Add custom map styling with teal color scheme

## Files Modified

- `.env.example` - Added `GOOGLE_MAPS_API_KEY`
- `src/components/MapEmbed.astro` - New component
- `src/components/StreetViewEmbed.astro` - New component
- `src/pages/areas/[slug].astro` - Integrated both components

---

For more information, see [Google Maps API Documentation](https://developers.google.com/maps/documentation)
