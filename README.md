# CoverAI Landing Page

A Next.js 14 application that helps users create personalized cover letters and job application materials using AI.

## Features

- AI-powered cover letter generation
- Job description analysis
- CV/Resume optimization
- Modern, responsive UI built with Tailwind CSS
- Real-time AI interactions using Vercel AI SDK

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Vercel AI SDK
- OpenAI Integration
- Firebase Authentication and Database

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Yunusali1271/Letsgoagain.git
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```
OPENAI_API_KEY=your_openai_api_key
FIREBASE_API_KEY=your_firebase_api_key
# Add other required environment variables
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3013](http://localhost:3013) with your browser to see the result.

## Project Structure

- `/src/app` - Pages and API routes
- `/src/components` - React components
- `/src/lib` - Utility functions, hooks, and contexts