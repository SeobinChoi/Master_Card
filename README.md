# Card Marketplace MVP

A curated knowledge card marketplace inspired by Kickstarter/Wadiz project detail pages. This is NOT a crowdfunding platform, but a marketplace for versioned digital knowledge products.

## Features

### Core Functionality
- **Card Management**: Create, update, and publish knowledge cards with markdown content
- **Mandatory Structure**: Enforced card structure with required sections
- **User Roles**: Guest, Buyer, Seller (admin-approved), Admin
- **Reviews**: Buyers can leave ratings and reviews
- **Certifications**: Proof of usage system with admin verification
- **License Types**: Personal, Commercial, Team/Internal, Full Use (no redistribution)
- **Preview Policy**: Only table of contents shown before purchase
- **Free MVP**: All cards are free to access

### Tech Stack
- **Frontend**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **Auth**: NextAuth.js (email + OAuth)
- **Database**: PostgreSQL + Prisma ORM
- **Markdown**: react-markdown with GitHub Flavored Markdown

## Getting Started

### Prerequisites
- **Node.js 20.19+ or 22.12+** (Prisma CLI requires these versions; 22.11.0 and earlier 22.x releases will fail installs.)
- npm
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Master_Card
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Set `DATABASE_URL` to your PostgreSQL connection string
- Generate a secure `NEXTAUTH_SECRET` (run `openssl rand -base64 32`)
- Configure OAuth providers (Google, GitHub) if desired

4. Set up the database:
```bash
 npx prisma migrate dev
 npx prisma generate
```

> **Tip:** Run `npm install` **before** Prisma commands so `dotenv` and other dependencies are available. If you see `Cannot find module 'dotenv/config'`, reinstall dependencies after upgrading Node to a supported version.

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Database Setup

The application uses Prisma with PostgreSQL. To initialize:

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

## User Roles and Access

### Guest
- Browse cards
- View card previews (table of contents only)

### Buyer (Default)
- All guest permissions
- Access purchased cards (free in MVP)
- Leave reviews
- Submit certifications

### Seller (Requires Admin Approval)
- All buyer permissions
- Create and update cards
- Publish cards (must pass structure validation)
- Upload attachments

### Admin
- All permissions
- Approve/reject sellers
- Verify certifications
- Moderate content

## Card Structure Requirements

Each card must contain these mandatory sections:
1. Problem Definition
2. Target Audience
3. Solution Overview
4. Contents / Steps
5. Usage Notes & Limitations

Cards missing these sections cannot be published.

## Available Routes

### Public
- `/` - Home page
- `/cards` - Browse all cards
- `/cards/[id]` - Card detail page
- `/login` - Authentication

### Authenticated
- `/library` - User's purchased cards
- `/library/[cardId]` - Card viewer
- `/library/[cardId]/review` - Write review
- `/library/[cardId]/certify` - Submit certification

### Seller
- `/seller/dashboard` - Manage cards
- `/seller/cards/new` - Create card
- `/seller/cards/[id]/edit` - Edit card

### Admin
- `/admin` - Admin dashboard
- `/admin/sellers` - Approve sellers
- `/admin/certifications` - Verify certifications

## Development Scripts

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Prisma Studio
npx prisma studio
```

## Environment Variables

See `.env.example` for all available configuration options.

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Random secret for NextAuth

Optional:
- Email provider settings
- OAuth provider credentials (Google, GitHub)

## Deployment

This application is Vercel-compatible and can be deployed with:

1. Push to GitHub
2. Import project to Vercel
3. Configure environment variables
4. Deploy

## License

ISC
