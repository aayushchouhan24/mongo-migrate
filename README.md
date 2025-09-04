# MongoDB Backup & Management API

A full-fledged Express.js application for MongoDB database backup and management operations.

## Features

- 🔄 **Database Copying**: Copy entire databases between MongoDB instances
- 📊 **Database Management**: List databases, collections, and get statistics
- 🔒 **Security**: Helmet for security headers, CORS support
- 📝 **Logging**: Morgan for HTTP request logging
- 🌍 **Environment**: Support for environment variables
- 🏥 **Health Checks**: Built-in health check endpoint

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Create a `.env` file in the root directory with your MongoDB connection strings:

```env
SOURCE_URI=your_source_mongodb_uri
TARGET_URI=your_target_mongodb_uri
PORT=3000
NODE_ENV=development
```

## Usage

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### Base Information
- `GET /` - API documentation and available endpoints
- `GET /health` - Health check endpoint

### Database Operations
- `POST /copy-database` - Copy entire database
- `GET /databases` - List all databases from a MongoDB URI
- `GET /collections/:dbName` - List all collections in a database
- `GET /collection-stats/:dbName/:collectionName` - Get collection statistics

## API Examples

### Copy Database
```bash
POST /copy-database
Content-Type: application/json

{
  "sourceUri": "mongodb://source:27017/",
  "targetUri": "mongodb://target:27017/",
  "sourceDbName": "mySourceDB",
  "targetDbName": "myTargetDB"
}
```

### List Databases
```bash
GET /databases?uri=mongodb://localhost:27017/
```

### List Collections
```bash
GET /collections/myDatabase?uri=mongodb://localhost:27017/
```

### Get Collection Stats
```bash
GET /collection-stats/myDatabase/myCollection?uri=mongodb://localhost:27017/
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "result": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Request Size Limits**: 50MB limit for request bodies
- **Error Handling**: Comprehensive error handling middleware

## Dependencies

- **express**: Web framework
- **mongodb**: MongoDB driver
- **cors**: CORS middleware
- **helmet**: Security middleware
- **morgan**: HTTP request logger
- **dotenv**: Environment variable loader

## Development Dependencies

- **nodemon**: Auto-restart server during development

## License

ISC
