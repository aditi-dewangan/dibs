# Dibs 📍

**Dibs** is a real-time crowd density tracking app for university campuses. Students can instantly see how busy study spots and food locations are — powered by live GPS data and peer-reported surveys — so they can stop wandering and start studying.

---

## Features

- 🗺️ **Map & List View** — Browse campus spots in an interactive map or scrollable list
- 📊 **Live Busyness Bar** — A 1–10 scale showing real-time crowd levels (Not Busy → Somewhat Busy → Very Busy)
- 🔍 **Filters** — Filter by spot type (Study / Food) and amenities (WiFi, Quiet, Open Late, Dining $, Outdoor)
- 📍 **Location Detail Sheets** — Tap any spot to see its address, description, amenities, busyness, and links to directions or website
- 🎨 **Per-University Theming** — UI colors adapt to each university's brand

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Native (Expo) |
| Backend | Supabase (Postgres + Auth + Realtime) |
| Maps | react-native-maps |
| Navigation | React Navigation (Bottom Tabs + Native Stack) |
| Auth | Supabase Auth (Email + Google OAuth) |

---

## How Busyness is Calculated

Busyness is a composite of two signals:

- **GPS Headcount (70%)** — Number of users detected within a location's geofence, aggregated every 5 minutes
- **Survey Reports (30%)** — User-submitted busyness ratings (1–3), time-decayed so recent reports count more

The final score (1–10) maps to:
- 🟢 **1–3** — Not busy
- 🟡 **4–7** — Somewhat busy
- 🔴 **8–10** — Very busy

---

## Running Locally (Development)

### Prerequisites
- Node.js (LTS)
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on iOS **or** Xcode for the iOS Simulator

### Setup

1. Clone the repo
```bash
   git clone https://github.com/YOUR-USERNAME/dibs.git
   cd dibs
```

2. Install dependencies
```bash
   npm install
```

3. Create a `.env` file in the root:
```bash
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```
4. Start the app
```bash
   npx expo start
```

5. Scan the QR code with Expo Go on your phone, or press `i` to open the iOS Simulator

---

## Current Status

This is an early MVP focused on the University of Washington campus. Core busyness data collection via geofencing and survey prompts is in active development.

**Completed**
- ✅ Supabase schema, RLS policies, and busyness score function
- ✅ Map and list views with live location data
- ✅ Filter modal with type and amenity filters
- ✅ Location detail sheets with directions and website links
- ✅ Per-university color theming

**In Progress**
- 🔄 Geofencing + survey prompt system
- 🔄 Favorites
- 🔄 Profile screen
- 🔄 Contributor submission flow

---

## Contributing

Dibs is being built campus by campus. If you're interested in bringing Dibs to your university, reach out or open an issue.

---

## License

Private — all rights reserved.
