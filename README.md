# MoneyWise - Smart Expense Tracker

[![Next.js](https://img.shields.io/badge/Next.js-15.2.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-06B6D4)](https://tailwindcss.com/)
[![Google AI](https://img.shields.io/badge/Google_AI-Gemini-orange)](https://ai.google.dev/)

A modern, AI-powered expense tracking application built with Next.js, Supabase, and Google's Gemini AI. Take control of your finances with intelligent insights, budget management, and personalized savings recommendations.

## ✨ Features

### 📊 **Expense Management**
- **Track Expenses**: Add, edit, and categorize your expenses with ease
- **Real-time Updates**: Live data synchronization across all your devices
- **Category Organization**: Organize expenses by customizable categories
- **Date Filtering**: View expenses by specific date ranges

### 💰 **Budget Management**
- **Budget Goals**: Set monthly/yearly budget goals for each category
- **Progress Tracking**: Visual progress bars showing budget utilization
- **Budget Alerts**: Get notified when approaching budget limits
- **Category-wise Budgets**: Individual budget controls for different expense categories

### 🤖 **AI-Powered Insights**
- **Smart Savings Tips**: Personalized recommendations based on your spending patterns
- **Expense Analysis**: AI-driven insights into your financial habits
- **Intelligent Categorization**: Automatic expense categorization suggestions
- **Financial Health Score**: AI assessment of your financial wellness

### 📈 **Visual Analytics**
- **Interactive Charts**: Beautiful pie charts and bar graphs using Recharts
- **Spending Trends**: Track your spending patterns over time
- **Category Breakdowns**: Visual representation of expenses by category
- **Budget vs. Actual**: Compare your planned vs. actual spending

### 🔐 **Security & Authentication**
- **Secure Authentication**: Powered by Supabase Auth
- **Row Level Security**: Your data is protected and isolated
- **Session Management**: Secure session handling with automatic refresh

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expense-tracker-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Google AI Configuration (for AI features)
   GOOGLE_API_KEY=your_google_ai_api_key_here
   ```

4. **Set up the database**
   
   Execute the provided SQL schema in your Supabase dashboard:
   ```bash
   # The schema file is located at: supabase-schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:9002](http://localhost:9002)

### Setting Up AI Features

For the complete AI experience, follow the [AI Setup Guide](AI-SETUP.md):

1. **Get Google AI API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an API key for Gemini access

2. **Test AI Configuration**
   ```bash
   npm run test:ai-config
   ```

3. **Start Genkit Development Server** (for AI features)
   ```bash
   npm run genkit:dev
   ```

## 🛠️ Technology Stack

### **Frontend**
- **[Next.js 15.2.3](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icons
- **[Recharts](https://recharts.org/)** - Data visualization library

### **Backend & Database**
- **[Supabase](https://supabase.com/)** - Backend as a Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row-level security
  - Authentication & authorization

### **AI & Machine Learning**
- **[Google AI (Gemini)](https://ai.google.dev/)** - AI-powered insights
- **[Genkit](https://firebase.google.com/docs/genkit)** - AI application framework
- **[@genkit-ai/googleai](https://www.npmjs.com/package/@genkit-ai/googleai)** - Google AI integration

### **Development Tools**
- **[ESLint](https://eslint.org/)** - Code linting
- **[TypeScript](https://www.typescriptlang.org/)** - Static type checking
- **[PostCSS](https://postcss.org/)** - CSS processing
- **[Turbopack](https://turbo.build/pack)** - Fast bundler for development

## 📱 Application Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── budgets/           # Budget management
│   ├── charts/            # Data visualization
│   ├── expenses/          # Expense tracking
│   ├── savings-ai/        # AI savings recommendations
│   └── page.tsx           # Dashboard homepage
├── components/            # Reusable UI components
│   └── ui/               # Shadcn/ui components
├── contexts/             # React contexts (Auth, etc.)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and services
│   └── supabase/         # Supabase client and services
└── types/                # TypeScript type definitions
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 9002 |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint for code quality |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run genkit:dev` | Start Genkit development server for AI features |
| `npm run genkit:watch` | Start Genkit in watch mode |
| `npm run test:ai-config` | Test AI configuration |

## 🔒 Security Features

- **Row Level Security (RLS)**: Each user can only access their own data
- **Secure Authentication**: Supabase Auth with session management
- **Environment Variables**: Sensitive data protected via environment variables
- **Type Safety**: Full TypeScript coverage for enhanced security

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

Having trouble? Check out our documentation or create an issue:

- **AI Features Not Working?** See [AI-SETUP.md](AI-SETUP.md)
- **Database Issues?** Check your Supabase configuration
- **Build Errors?** Ensure all dependencies are installed

## 🎯 Roadmap

- [ ] **Mobile App**: React Native version
- [ ] **Data Export**: CSV/PDF export functionality  
- [ ] **Receipt Scanning**: OCR-powered receipt processing
- [ ] **Multi-currency Support**: International currency handling
- [ ] **Advanced Analytics**: Machine learning predictions
- [ ] **Goal Setting**: Financial goal tracking and achievement

---

**Built with ❤️ using Next.js, Supabase, and Google AI**
