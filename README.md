# ERP Aspire Frontend (Angular)

## 🔍 Project Quality Status

### 🧪 Tests & CI/CD

![CI Pipeline](https://github.com/Ozymandros/erp-frontend-ng/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/Ozymandros/erp-frontend-ng/branch/main/graph/badge.svg)](https://codecov.io/gh/Ozymandros/erp-frontend-ng)

> **Note:** The CI badge includes unit tests (Jasmine/Karma), E2E tests (Playwright), CodeQL security analysis, linting, and build verification.

### 🔐 Security

![CodeQL](https://github.com/Ozymandros/erp-frontend-ng/actions/workflows/ci.yml/badge.svg?event=push&label=CodeQL)

### 📊 Code Quality (SonarCloud)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Ozymandros_erp-frontend-ng&metric=alert_status)](https://sonarcloud.io/dashboard?id=Ozymandros_erp-frontend-ng)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Ozymandros_erp-frontend-ng&metric=coverage)](https://sonarcloud.io/summary/overall?id=Ozymandros_erp-frontend-ng)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Ozymandros_erp-frontend-ng&metric=bugs)](https://sonarcloud.io/summary/overall?id=Ozymandros_erp-frontend-ng)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=Ozymandros_erp-frontend-ng&metric=code_smells)](https://sonarcloud.io/summary/overall?id=Ozymandros_erp-frontend-ng)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Ozymandros_erp-frontend-ng&metric=security_rating)](https://sonarcloud.io/summary/overall?id=Ozymandros_erp-frontend-ng)

### 🔄 Dependencies

![Dependabot](https://img.shields.io/badge/Dependabot-enabled-brightgreen?logo=dependabot)

### 🛠️ Tech Stack

![Node](https://img.shields.io/badge/node-20.x-green)
![pnpm](https://img.shields.io/badge/pnpm-10.28.1-blue)

![Angular](https://img.shields.io/badge/Angular-21-dd0031?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)
![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?logo=rxjs)

![NG-Zorro](https://img.shields.io/badge/NG%20Zorro-21-1890ff?logo=ant-design)

![Jasmine](https://img.shields.io/badge/Jasmine-5.1-8A4182?logo=jasmine)
![Karma](https://img.shields.io/badge/Karma-6.4-48C9B0?logo=karma)
![Playwright](https://img.shields.io/badge/Playwright-1.57-blue?logo=playwright)

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---

A modern, type-safe ERP admin portal built with **Angular** and **TypeScript**. Features comprehensive authentication, user management, inventory tracking, sales, and purchasing modules.

## ✨ Features

- **🔐 Authentication & Authorization**: JWT-based auth with refresh tokens and granular permission-based routing (Guards).
- **👥 User Management**: Complete CRUD operations with role assignment and permission management.
- **📦 Inventory Management**: Products, warehouses, stock operations, and transaction tracking.
- **💰 Sales & Purchasing**: Order management, customer and supplier management.
- **🎨 Modern UI**: Responsive design with **NG-Zorro Ant Design** components.
- **🔒 Type Safety**: Full TypeScript coverage with strict mode.
- **🧪 Testing**: Comprehensive test suite with Jasmine/Karma (unit) and Playwright (E2E).
- **🚀 CI/CD**: Automated testing, code quality checks, and dependency updates via GitHub Actions.

## ⚙️ Technical Details

- **Framework**: Angular 21 (Standalone Components)
- **Language**: TypeScript 5.5
- **Styling**: SCSS, NG-Zorro (Ant Design), TailwindCSS
- **Routing**: Angular Router
- **HTTP Client**: Angular HttpClient (with Interceptors)
- **State Management**: RxJS (Services + BehaviorSubjects)
- **Validation**: Angular Reactive Forms
- **UI Components**: NG-Zorro Antd
- **Testing**: Jasmine, Karma, Playwright
- **Package Manager**: pnpm

## 📋 Prerequisites

- **Node.js**: 20.x or higher
- **pnpm**: 10.28.1 or higher ([Install pnpm](https://pnpm.io/installation))

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Ozymandros/erp-frontend-ng.git
cd erp-frontend-ng

# Install dependencies
pnpm install

# Start development server
pnpm start
```

The application will be available at `http://localhost:4200`.

### Environment Variables

The application uses standard Angular environment files (`src/environments`).

- `environment.ts`: Development configuration.

- `environment.prod.ts`: Production configuration.

Ensure `apiBaseUrl` points to your backend (default: `http://localhost:5000`).

## 📜 Available Scripts

```bash
# Development
pnpm start        # Start Angular development server

# Building
pnpm build        # Build for production (dist/erp-frontend-ng)
pnpm watch        # Build in watch mode

# Code Quality
pnpm lint         # Run ESLint (if configured)

# Testing
pnpm test         # Run unit tests (Jasmine/Karma)
pnpm exec playwright test # Run E2E tests
```

## 🧪 Testing

### Unit Tests (Jasmine/Karma)

```bash
# Run all unit tests
pnpm test

# Run code coverage
pnpm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Install browsers (first time)
pnpm exec playwright install

# Run E2E tests
pnpm run test:playwright

# Run E2E tests in UI mode
pnpm run test:playwright -- --ui
```

**Note**: E2E tests use mocked API endpoints (`e2e/mocks/api-mocks.ts`) and mock data (`e2e/mocks/fixtures.ts`), so a running backend is NOT required for standard E2E runs.

## 🏗️ Project Structure

```text
src/
├── app/
│   ├── core/
│   │   ├── guards/          # Auth and permission guards
│   │   ├── interceptors/    # HTTP interceptors (Auth, Error)
│   │   ├── services/        # Singleton services (API logic)
│   │   └── ...
│   ├── types/               # Shared API types (api.types.ts)
│   ├── features/            # Feature modules (Lazy loaded)
│   │   ├── auth/            # Login, Register
│   │   ├── dashboard/       # Dashboard widgets
│   │   ├── inventory/       # Products, Warehouses, Stocks
│   │   ├── sales/           # Customers, Orders
│   │   └── users/           # Users, Roles, Permissions
│   ├── layout/              # Main layout, Header, Sidebar
│   └── shared/              # Reusable components and pipes
├── assets/                  # Static assets (images, icons)
├── environments/            # Environment configurations
├── e2e/                     # Playwright E2E tests and mocks
└── test/                    # Global test mocks/utils
```

## 🔄 CI/CD Pipeline

The project includes automated CI/CD with GitHub Actions (`.github/workflows/ci.yml`):

- **Linting**: GitHub workflow linting (actionlint) and ESLint on `src/`
- **Type Check**: `tsc --noEmit -p tsconfig.app.json`
- **Build Verification**: `pnpm build` check
- **Security Audit**: `pnpm audit`
- **CodeQL**: Security analysis
- **SonarQube**: Code quality/coverage scan
- **Unit Tests**: `ng test` with JUnit/Coverage reporting
- **E2E Tests**: Playwright (headless)
- **Dependabot**: Automated dependency updates

## 📚 Documentation

- [E2E Testing Guide](docs/E2E_TESTING.md) (See `e2e/` folder for implementation)
- [Test Coverage](docs/TEST_COVERAGE.md) (Run coverage command to view)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Ensure all tests pass (`pnpm test` and `pnpm run test:playwright`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📝 License

MIT
