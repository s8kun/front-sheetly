<div align="center">
  <h1>📚 Sheetly (Frontend)</h1>
  <p><strong>The modern student resource platform for University of Benghazi</strong></p>

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)

</div>

---

## 📖 Introduction

This is the **Next.js frontend** for **Sheetly**, a high-performance resource-sharing platform designed specifically for students at the University of Benghazi. It connects to the [Sheetly Laravel Backend](https://github.com/s8kun/Sheetly) to browse, download, and upload academic materials.

## ✨ Core Features

- 🚀 **Next.js App Router**: Modern, fast Server Components and Client Components.
- 🎨 **Tailwind CSS & Framer Motion**: Beautiful, responsive, and animated user interface in Arabic (RTL).
- 🛡️ **Authentication**: Tightly integrated with Laravel Sanctum for secure login, registration, and password recovery.
- 📄 **File Uploads**: Direct `multipart/form-data` uploads for PDFs and DOCX files.
- ⚡ **Optimized Data Fetching**: Custom fetch wrappers with caching and retry logic for high reliability.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Fonts**: `next/font/google` (Cairo & Tajawal)

## ⚙️ Quick Start

### 1. Requirements

- Node.js 18+
- npm, yarn, pnpm, or bun

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/s8kun/sheetly.git
cd sheetly

# Install dependencies
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

_(Ensure your Laravel backend is running at this URL or update the URL to point to your live backend)_

### 4. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Key File Structure

- `app/`: Next.js App Router pages (Home, Subjects, Auth, Admin).
- `components/`: Reusable React components (Admin Sidebar, Loading states).
- `lib/`: Utility functions (Network helpers, Error formatting).
- `public/`: Static assets.

## 🤝 Contributing

Contributions are welcome! Please ensure you test changes locally with the backend API before submitting a PR.
