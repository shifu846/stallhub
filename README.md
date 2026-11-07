# StallHub

StallHub is a local event and stall booking app for Papua New Guinea. Organisers publish markets, fairs and expos
and add bookable stalls. Vendors browse events, see the weather forecast, request a stall and track the answer.

- Author: Siwi Siune - Student number: 24202260
- Unit: IS323 Mobile App Development, PNG University of Technology
- Stack: React Native (Expo SDK 57), Expo Router, TypeScript, Supabase

## Features
Register, login, logout, password reset, persistent session, protected routes. Events with create, list, detail,
edit and delete. Stalls and booking requests with organiser approval. Weather forecast, poster upload,
location, reminders, saved events, offline cache, dark mode.

## Setup
1. git clone https://github.com/shifu846/stallhub.git
2. cd stallhub
3. npm install
4. copy .env.example .env and fill in the two values
5. npx expo start

## Environment variables
EXPO_PUBLIC_SUPABASE_URL = Supabase project URL
EXPO_PUBLIC_SUPABASE_KEY = Supabase publishable key (safe to ship; Row Level Security protects the data)

## APIs and services
Supabase (Auth, Postgres, Storage), Open-Meteo weather, expo-location, expo-image-picker, expo-notifications.

## Build
eas build --platform android --profile preview (signed APK)
APK build: https://expo.dev/accounts/siune/projects/stallhub/builds/d80dd659-42ff-4293-9a2b-76cb42000899

## Test accounts
organiser@example.com / Demo1234!
vendor@example.com / Demo1234!

## Known limitations
No map screen, dates are typed as text, no remote push notifications.

## AI assistance
I used Claude (Anthropic) as a tutor for explanations and step-by-step guidance. I tested every step on a real
phone and can explain the code I submitted.