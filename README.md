This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
=======
# URL_Shorter (TinyLink)

This repository contains a small URL shortener built with Next.js and Prisma.

**Quick dev**

1. Copy `.env.example` to `.env` and update `DATABASE_URL`.
2. Install dependencies:

```bash
npm install
```

3. Generate Prisma client (this also runs automatically after `npm install` via `postinstall`):

```bash
npm run prisma:generate
```

4. Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

**Production / Deploy**

- Ensure `DATABASE_URL` is set in your production environment.
- Run database migrations on deploy (use `prisma migrate deploy` if using CI/CD):

```bash
npm run prisma:migrate:deploy
```

- Build and start:

```bash
npm run build
npm run start
```

Notes:
- The repository includes a `postinstall` script that runs `prisma generate` so the Prisma client is available after install.
- Add `NEXT_PUBLIC_SITE_URL` in the environment if you need absolute URLs.

If you plan to deploy to Vercel, follow the standard Next.js deployment flow and set the environment variables there.
