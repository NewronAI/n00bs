# Pulse*

Manage all your Data related public workflows in a single place.
This project is supposed to be a Open Source replacement for [Google TaskMate](https://taskmate.google.com/).

## Features

- Create, edit and delete workflows
- Import/Connect your data
- Automatic task and workflow scheduling
- CrowdSource your data validation process
- Data validation and data quality checks
- Data transformation and data enrichment
- Data export to your preferred destination
- Workflow visualization
- Custom Rules

## Getting Started

### Installation

#### Install yarn (ignore if you already have yarn installed)
Pulse uses as yarn package manager. To install yarn, run the following command:
```bash
npm install -g yarn
```

#### Install dependencies

To install all the dependencies, run the following command:

```bash
yarn
```

### Create & local/remote DB

Pulse uses postgres for its database. You can either use a local or remote database.
Add connection string to .env

### Creating the schema
Pulse uses [Prisma](https://www.prisma.io/) to manage the database schema. To create the schema, run the following command:

```bash
prisma migrate dev
```

### Create Prisma Client
To create the Prisma Client, run the following command:

```bash
prisma generate
```

### Running the app
Start the Next.js app in development mode:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
