# BookLib 📚

**BookLib** is a comprehensive personal book library management application that helps you organize, track, and analyze your reading collection. Built with Nuxt 3 and Vue 3, it offers both web and desktop (Electron) versions for seamless book management across platforms.

![BookLib Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Nuxt 3](https://img.shields.io/badge/Nuxt-3-00C58E.svg)
![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC.svg)
![Electron](https://img.shields.io/badge/Electron-9FEAF9.svg)

## ✨ Features

### 📖 Book Management
- **Complete book database** with title, author, ISBN, publisher, year, pages, and more
- **Custom book covers** with image upload and management
- **Reading progress tracking** (Not Read, Reading, Paused, Finished)
- **Rating system** with 5-star ratings
- **Genre categorization** with custom tags
- **Multiple formats support** (Physical, Digital, Audiobook)
- **Reading dates tracking** (started/finished dates)
- **Google Books API integration** for book search and metadata

### 📊 Collections & Organization
- **Custom collections** for organizing books by themes, series, or preferences
- **Built-in smart collections** (Favorites, Wishlist)
- **Drag-and-drop reordering** within collections
- **Collection-based filtering** and views
- **Author management** with author-based book grouping

### 🎯 Reading Goals & Analytics
- **Flexible goal setting** (books, pages, or hours)
- **Multiple goal intervals** (daily, weekly, monthly, yearly, or total)
- **Visual progress tracking** with charts and graphs
- **Goal completion analytics** with projections
- **Reading statistics** and insights

### 📈 Data Visualization
- **Interactive charts** powered by ECharts
- **Reading progress visualization** (line charts, bar charts, pie charts)
- **Book statistics** by genre, author, publication year
- **Reading habit analytics** and trends
- **KPI tiles** for quick overview

### 🔍 Advanced Features
- **Powerful search** with full-text search across all book data
- **Advanced filtering** by status, genre, author, rating, and more
- **Table views** with sortable columns and pagination
- **Data import/export** for backup and migration
- **Library integrity checking** for data validation
- **Responsive design** for mobile and desktop

### 🖥️ Multi-Platform Support
- **Web application** for browser-based access
- **Desktop app** (Electron) for offline use
- **Cross-platform storage** with automatic data synchronization
- **Local data storage** with LowDB for privacy and speed

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Package manager: npm, pnpm, yarn, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/deadalley/booklib-app.git
   cd booklib-app
   ```

2. **Install dependencies**
   ```bash
   # Using yarn (recommended)
   yarn install
   
   # Or using npm
   npm install
   
   # Or using pnpm
   pnpm install
   
   # Or using bun
   bun install
   ```

3. **Start development server**
   ```bash
   # Web version
   yarn dev
   
   # Desktop version (Electron)
   yarn electron:test
   ```

The web application will be available at `http://localhost:3000`

## 🛠️ Development

### Available Scripts

#### Development
```bash
yarn dev              # Start web development server
yarn electron:test    # Start Electron development version
```

#### Building
```bash
yarn build           # Build for Electron (desktop app)
yarn build:web       # Build for web deployment
yarn preview         # Preview production build
```

#### Testing
```bash
yarn test            # Run unit tests
yarn test:e2e        # Run end-to-end tests
yarn test:e2e:ui     # Run e2e tests with UI
yarn coverage        # Generate test coverage report
```

#### Linting & Code Quality
```bash
yarn lint            # Run all linters
yarn lint:fix        # Fix linting issues
yarn lint:js         # ESLint JavaScript/TypeScript
yarn lint:ts         # TypeScript type checking
yarn lint:prettier   # Prettier formatting check
```

#### Storybook (Component Development)
```bash
yarn story:dev       # Start Storybook development server
yarn story:build     # Build Storybook
yarn story:preview   # Preview built Storybook
```

#### Electron Distribution
```bash
yarn electron:build        # Build for current platform
yarn electron:build:win    # Build for Windows
yarn electron:build:mac    # Build for macOS
yarn electron:build:linux  # Build for Linux
yarn electron:publish      # Build and publish
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Vue 3 + Nuxt 3 + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: ECharts with vue-echarts
- **Icons**: Tabler Icons
- **Forms**: FormKit
- **Tables**: TanStack Table
- **Testing**: Vitest + Playwright
- **Desktop**: Electron
- **Database**: LowDB (JSON-based)

### Project Structure
```
booklib-app/
├── components/         # Vue components
├── composables/        # Vue composables
├── pages/             # Nuxt pages (routing)
├── layouts/           # Nuxt layouts
├── services/          # Business logic and data management
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── assets/            # Static assets and styles
├── public/            # Public static files
├── electron/          # Electron main process files
├── tests/             # Test files
└── playwright-report/ # E2E test reports
```

### Storage Architecture
BookLib uses a flexible storage system that adapts to the environment:

- **Electron**: File-based storage in user data directory
- **Web**: LocalStorage fallback for browser compatibility

See [STORAGE_ARCHITECTURE.md](STORAGE_ARCHITECTURE.md) for detailed information.

## 📱 Usage

### Getting Started
1. **Add your first book** - Use the "+" button to manually add books or search Google Books
2. **Create collections** - Organize books into custom collections
3. **Set reading goals** - Track your reading progress with customizable goals
4. **Import your library** - Bulk import books from CSV or other formats

### Key Features Walkthrough
- **Dashboard**: Overview of your library with statistics and reading suggestions
- **Library**: Browse all books with advanced filtering and search
- **Collections**: Organize books into custom groups
- **Tracking**: Set and monitor reading goals
- **Analytics**: Visualize your reading habits and statistics

## 🧪 Testing

- **Unit tests** with Vitest
- **End-to-end tests** with Playwright
- **Visual testing** with Histoire

Run tests:
```bash
yarn test           # Unit tests
yarn test:e2e       # E2E tests
yarn lint:ts        # Type checking
```

## 🔨 Tools

- [Nuxt 3](https://nuxt.com/)
- [Vue 3](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ECharts](https://echarts.apache.org/)
- [Electron](https://www.electronjs.org/)

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Jessica Aissa** - [deadalley31@gmail.com](mailto:deadalley31@gmail.com)
