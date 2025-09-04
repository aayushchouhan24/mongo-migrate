# MongoMigrate

A modern web-based MongoDB database migration and backup tool with an intuitive interface.

## Features

- 🔄 **Database Migration**: Copy entire databases between MongoDB instances
- 📊 **Collection Management**: Select specific collections to migrate
- 🎨 **Modern UI**: Clean, shadcn-inspired interface with dark theme
- 📊 **Real-time Progress**: Live progress tracking during migrations
- 🔒 **Security**: Helmet security headers, CORS support, secure sessions
- 📝 **Logging**: Comprehensive request and error logging
- 🌍 **Cloud Ready**: Optimized for Vercel deployment
- 🏥 **Health Checks**: Built-in health monitoring

## Quick Start

### Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mongo-migrate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000` in your browser

### Vercel Deployment

1. **Fork/Clone** this repository to your GitHub account

2. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables** in Vercel:
   ```env
   NODE_ENV=production
   SESSION_SECRET=your-super-secret-session-key-here
   ```

4. **Deploy**: Vercel will automatically build and deploy your app

5. **Access**: Your app will be available at `https://your-app-name.vercel.app`

## Configuration

### Environment Variables

Create a `.env` file (for local development):

```env
# Session Security (Required)
SESSION_SECRET=your-super-secret-session-key-here

# Environment
NODE_ENV=development

# Port (optional, defaults to 3000)
PORT=3000
```

### For Vercel Deployment

Set these environment variables in your Vercel project dashboard:

- `NODE_ENV`: Set to `production`
- `SESSION_SECRET`: A secure random string for session encryption

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
