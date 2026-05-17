# 🎬 Khayal Alzili API (خيال الظل)

[![NestJS](https://img.shields.io/badge/Framework-NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeORM](https://img.shields.io/badge/ORM-TypeORM-fe0808?logo=typeorm&logoColor=white)](https://typeorm.io/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License-UNLICENSED-blue.svg](https://img.shields.io/badge/License-UNLICENSED-blue.svg)](LICENSE)

Backend API for **Khayal Alzili**, a premium streaming and media platform. Built with a scalable architecture using NestJS and PostgreSQL.

---

## 🌟 Features

- 🔐 **Authentication & Authorization**: Secure JWT-based authentication with Passport.js.
- 📺 **Shows Management**: Full CRUD for movies and TV series, including season and episode management.
- 📁 **Category System**: Dynamic categorization of content.
- 🖼️ **Banner System**: Manage homepage highlights and promotional banners.
- 👥 **User & Client Management**: Separate management for administrators and end-users/clients.
- ⚙️ **System Settings**: Configurable platform-wide settings.
- 📸 **Image Processing**: Optimized image handling using `Sharp`.
- 📂 **Static File Serving**: Efficient serving of uploaded assets.

---

## 🛠️ Tech Stack

- **Core**: [NestJS](https://nestjs.com/) (Node.js Framework)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Security**: [Passport.js](https://www.passportjs.org/), [JWT](https://jwt.io/), [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **Media**: [Sharp](https://sharp.pixelplumbing.com/) (Image Optimization), [Multer](https://github.com/expressjs/multer) (File Uploads)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [PostgreSQL](https://www.postgresql.org/) database
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the database:
   The current configuration is located in `src/app.module.ts`. Ensure your PostgreSQL server matches these settings or update them:
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Username**: `postgres`
   - **Password**: `root`
   - **Database**: `khayal_alzili`

### Running the App

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

---

## 📂 Project Structure

```text
src/
├── auth/           # Authentication logic & JWT strategies
├── banners/        # Homepage banner management
├── categories/     # Content categorization
├── clients/        # End-user (client) management
├── settings/       # System-wide configuration
├── shows/          # Movies and series management
├── users/          # Admin user management
├── app.module.ts   # Main application module
└── main.ts         # Application entry point
```

---

## 📜 Available Scripts

- `npm run start`: Start the application.
- `npm run start:dev`: Start in watch mode for development.
- `npm run build`: Build the project for production.
- `npm run lint`: Run ESLint to check code quality.
- `npm run format`: Format code using Prettier.
- `npm run test`: Run unit tests.

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Contact

**Khayal Alzili Team** - [Your Website/Link]

Project Link: [https://github.com/your-username/khayal-alzili](https://github.com/your-username/khayal-alzili)
