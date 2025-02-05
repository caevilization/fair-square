# Fair Square

Fair Square is an open-source project contribution analysis platform designed to help open-source communities better recognize and reward contributors through intelligent analysis and fair evaluation mechanisms.

## Architecture

The project adopts a microservices architecture with the following main components:

### Backend Service (`/backend`)

-   RESTful API built with Node.js + Express
-   MongoDB for data storage
-   Git repository analysis engine
-   Contribution calculation system

### Git Submodule Setup

This project uses Git Submodule to manage the Eliza service. After initial cloning, you need to initialize the submodules:

```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/your-username/fair-square.git

# Or initialize submodules after cloning
git submodule init
git submodule update
```

To update the Eliza submodule:

```bash
# Update all submodules
git submodule update --remote

# Update specific submodule
git submodule update --remote eliza
```

To modify Eliza code:

1. Fork elizaOS/eliza to your GitHub account
2. Update submodule remote URL:

```bash
git submodule set-url eliza https://github.com/your-username/eliza.git
```

### Eliza Service (`/eliza`)

-   Intelligent analysis service based on elizaOS
-   Multi-language support
-   Plugin architecture

### Frontend Service (`/frontend`)

-   Built with React + TypeScript
-   Ant Design component library
-   Data visualization

## Core Features

1. Repository Analysis

    - Automatic Git history analysis
    - Commit statistics and change analysis
    - Detailed analysis reports

2. Contribution Assessment

    - Code contribution statistics
    - Commit quality evaluation
    - Collaboration behavior analysis

3. Reward System
    - Square points system
    - Milestone rewards
    - Contributor leaderboard

## Quick Start

### Requirements

-   Node.js 18+
-   MongoDB
-   Docker & Docker Compose
-   Git

### Installation Steps

1. Clone Repository

```bash
git clone https://github.com/your-username/fair-square.git
cd fair-square
```

2. Environment Setup (Ubuntu)

```bash
# Basic environment setup
./aws-ops/env-setup.sh

# Node.js environment setup
./aws-ops/node.sh

# Docker setup
./aws-ops/docker.sh

# GitHub SSH setup (optional)
./aws-ops/github.sh
```

3. Install Dependencies

```bash
./install.sh
```

4. Configure Environment Variables

```bash
# Backend service
cp backend/.env.example backend/.env
# Edit .env file with necessary configuration

# Eliza service
cp eliza/.env.example eliza/.env
```

5. Start Services

```bash
docker-compose up -d
```

Access:

-   Frontend: http://localhost:8080
-   Backend API: http://localhost:3000
-   Eliza Service: http://localhost:3001

## Project Limitations

To ensure system stability and performance, the project has the following repository analysis limits:

-   Maximum repository size: 10MB
-   Maximum number of commits: 1,000
-   Maximum number of contributors: 300

## API Documentation

API documentation is available in REST Client format in the `backend/test/` directory:

-   `repository.http`: Repository management endpoints
-   `ping.http`: Health check endpoints

## Development Guide

### Directory Structure

```
fair-square/
├── aws-ops/          # Cloud deployment scripts
├── backend/          # Backend service
├── eliza/           # Eliza analysis service
├── frontend/        # Frontend interface
└── docker-compose.yml
```

### Debugging

-   Backend service debug configuration in `.vscode/launch.json`
-   VS Code REST Client support for API testing

### Testing

```bash
# Backend tests
cd backend && pnpm test

# Eliza tests
cd eliza && pnpm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
