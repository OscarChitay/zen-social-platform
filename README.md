# ZEN — Social Media Platform

<p align="center">
  <img src="public/zen-logo.svg" alt="ZEN logo" width="84" />
</p>

<p align="center">
  <strong>A responsive social-media frontend with posting, messaging, profiles, image filters, and theme-aware UI.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-149eca?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/React_Router-7-CA4245?style=flat-square&logo=reactrouter&logoColor=white" alt="React Router" />
  <img src="https://img.shields.io/badge/Socket.IO-client-010101?style=flat-square&logo=socketdotio&logoColor=white" alt="Socket.IO" />
</p>

## Overview

ZEN is an experimental social-media web client built around familiar community interactions: an image feed, profiles, search, messages, comments, reactions, saved posts, and account flows. The interface is responsive and supports light and dark themes.

The project is inspired by modern photo-sharing social products. It is an independent educational project and is not affiliated with, endorsed by, or connected to Instagram or Meta.

## Features

- Responsive feed, profile, search, and messaging views.
- Login and registration interfaces with optional Google OAuth and reCAPTCHA integration.
- Create-post and post-detail experiences with likes, comments, saves, and image previews.
- Real-time messaging integration through Socket.IO when a compatible API is available.
- Client-side image filters using the Canvas API, including intensity controls and before/after comparison.
- Theme-aware components with light and dark modes.
- Protected client-side routes and persisted session state.
- Mock content for interface development when a backend is unavailable.

## Tech stack

| Area | Technologies |
| --- | --- |
| UI | React 19, React Router 7, Tailwind CSS 3, Lucide icons |
| Build | Vite 7, PostCSS, ESLint |
| Integrations | Socket.IO client, Google OAuth, Google reCAPTCHA |
| Image processing | Browser Canvas API |

## Getting started

### Prerequisites

- Node.js 20 or later
- npm
- A compatible API service for live authentication, posts, messaging, and optional image-analysis features

### Install

```bash
git clone https://github.com/OscarChitay/zen-social-platform.git
cd zen-social-platform
npm ci
```

### Configure

Copy the sample configuration:

```bash
copy .env.example .env
```

On macOS or Linux, use `cp .env.example .env` instead.

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Base URL for the compatible API and Socket.IO service. |
| `VITE_GOOGLE_CLIENT_ID` | OAuth client ID for the browser integration. |
| `VITE_RECAPTCHA_SITE_KEY` | reCAPTCHA site key for the browser integration. |
| `VITE_ENV` | Optional client environment label. |

> Variables beginning with `VITE_` are exposed to the browser by Vite. Never put server secrets in them.

### Run

```bash
npm run dev
```

Open the URL shown by Vite, normally `http://localhost:5173`.

### Quality checks

```bash
npm run lint
npm run build
```

## Project structure

```text
src/
├── components/  # Reusable UI and social interactions
├── context/     # Authentication and theme state
├── data/        # Mock content for UI development
├── layouts/     # Shared application shells
├── pages/       # Feed, login, messages, profiles, and search
└── services/    # API, Socket.IO, filters, and image-analysis adapters
```

## Notes

- The repository includes the frontend client only. Live features require a separately configured compatible API.
- API credentials and keys are intentionally excluded; use `.env.example` as a starting point.
- Demo avatars and images load from third-party placeholder and image services.
- The optional image-analysis integration is not required to run the interface and should only be enabled with informed user consent and an appropriate privacy policy.
