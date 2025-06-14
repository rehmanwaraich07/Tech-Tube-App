# TechTube - Video Sharing Platform

A modern video sharing platform built with Next.js, TypeScript, and MongoDB. TechTube allows users to upload, share, and watch tech-related videos in a beautiful and responsive interface.

## Features

- 🎥 Video upload and streaming
- 🔐 User authentication and authorization
- 📱 Responsive design for all devices
- 🔍 Advanced search functionality
- 👤 User profiles and video management
- 🎨 Modern UI with dark mode support
- 📊 Video analytics and view tracking
- 🔄 Real-time video suggestions

## Tech Stack

- **Frontend:**

  - Next.js 14
  - TypeScript
  - Tailwind CSS
  - Shadcn UI Components
  - ImageKit for media handling

- **Backend:**
  - Next.js API Routes
  - MongoDB with Mongoose
  - NextAuth.js for authentication
  - ImageKit for video storage

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- ImageKit account

### Environment Variables

Create a `.env.local` file with the following variables:

```env
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_URL_ENDPOINT=your_imagekit_url_endpoint
NEXT_PUBLIC_PUBLIC_KEY=your_imagekit_public_key
```

### Installation

1. Clone the repository:

```bash
git clone https://github.com/rehmanwaraich07/tech-tube.git
cd tech-tube
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/         # React components
├── lib/               # Utility functions and configurations
├── models/            # MongoDB models
└── styles/            # Global styles
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Build by

M.Rehman Waraich

---

Made with ❤️ for the tech community
