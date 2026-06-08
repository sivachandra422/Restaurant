# Restaurant Platform

A full-stack restaurant ordering and admin system built with Next.js, TypeScript, and MongoDB.

## Features

- **Customer ordering** — Browse menu, add to cart, place orders
- **Real-time admin dashboard** — Live order tracking, analytics, notifications
- **Menu management** — Create, update, delete menu items with images
- **Order lifecycle** — From placement through preparation to delivery
- **User authentication** — Role-based access (customer, manager, admin)
- **Database backup/restore** — Operational safety tools

## Tech Stack

- **Frontend:** Next.js 13, TypeScript, React, TailwindCSS, Shadcn/UI
- **Backend:** Next.js API routes, JWT auth, SSE for real-time updates
- **Database:** MongoDB
- **Deployment:** Render, MongoDB Atlas

## Quick Start

1. Clone the repo
2. Copy `.env.example` to `.env.local` and fill in your values
3. Install dependencies: `npm install`
4. Run locally: `npm run dev`
5. Open http://localhost:3000

## Environment Variables

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_API_URL=http://localhost:3000
```

See `.env.example` for full list.

## Testing

Default admin credentials (development only):
- Username: `admin`
- Password: `demo-password`

**⚠️ Change these in production.**

## Deployment

See deployment guides:
- [MongoDB Atlas Setup](./MONGODB_ATLAS_SETUP.md)
- [Render Deployment](./RENDER_DEPLOYMENT_GUIDE.md)

## Project Status

This is a portfolio project demonstrating full-stack Next.js development with real-time features, authentication, and operational tooling.

## License

MIT
