# MCP Server for Fibaro HC3

A **Model Context Protocol (MCP)** server that provides seamless integration between LLM applications (like Claude Desktop) and **Fibaro Home Center 3** smart home systems.

## ⚠️ Disclaimer

> This is a community-developed solution.   
> **This project is not affiliated with, endorsed by, or sponsored by Fibaro or Fibar Group S.A.**  
> "Fibaro" and all related names and trademarks are the property of their respective owners.  
> This software is provided as-is, without any warranties or guarantees.  
> **Use at your own risk.** The author takes **no responsibility** for any damage or issues caused by using this code.

## 🏠 What is this?

This MCP server enables AI assistants to directly control your Fibaro HC3 smart home devices and automation scenes. You can ask natural language questions like:

- "Turn on all lights in the living room"
- "Toggle main kitchen lamp"
- "Execute my goodnight scene"
- "Set bedroom lamp to 10%"

## ✨ Features

### 🛠️ **Tools** (Actions)

#### **Room Management**

- **`list_rooms`** - Get all rooms in your HC3 system
- **`get_room`** - Get detailed information about a specific room

#### **Device Control**

- **`list_devices`** - List devices with optional filtering
- **`get_device`** - Get comprehensive device details
- **`call_device_action`** - Execute any device action (turnOn, turnOff, toggle, setValue, etc.)

#### **Scene Management**

- **`list_scenes`** - Get all scenes in your HC3 system
- **`get_scene`** - Get detailed information about a specific scene
- **`execute_scene`** - Execute a scene (async or sync)
- **`kill_scene`** - Stop a running scene

#### **System Tools**

- **`test_connection`** - Test connectivity to your HC3 system

## 🚀 Quick Start

### 1. **Installation**

```bash
# Install dependencies
npm install

# Build the TypeScript code
npm run build
```

### 2. **Configuration**

Create a `.env` file in the project root:

```bash
# Required
HC3_HOST=192.168.1.100          # Your HC3 IP address
HC3_USERNAME=admin               # Your HC3 username
HC3_PASSWORD=your_password       # Your HC3 password

# Optional
HC3_PORT=80                      # HC3 port (default: 80)
SERVER_TIMEOUT=10000                # Request timeout in ms (default: 10000)
LOG_LEVEL=info                      # Logging level (default: info)

# MCP Transport Configuration
MCP_TRANSPORT_TYPE=stdio            # Transport type: 'stdio' or 'http' (default: stdio)
MCP_HTTP_HOST=localhost             # HTTP server host (default: localhost)
MCP_HTTP_PORT=3000                  # HTTP server port (default: 3000)
```

**⚠️ Important:** Never commit your `.env` file to version control!

### 3. **Running**

```bash
npm start
```

### 4. **Integration with MCP Clients**

#### **Claude Desktop (STDIO Transport)**

Add this to your Claude Desktop MCP configuration file:

**On macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**On Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mcp-server-hc3": {
      "command": "node",
      "args": ["/path/to/your/mcp-server-hc3/dist/index.js"],
      "env": {
        "HC3_HOST": "192.168.1.100",
        "HC3_USERNAME": "admin",
        "HC3_PASSWORD": "your_password",
        "HC3_PORT": "80",
        "MCP_TRANSPORT_TYPE": "stdio"
      }
    }
  }
}
```

#### **HTTP-based MCP Clients**

For clients that support HTTP transport, configure the server with HTTP transport:

```bash
# Configure in .env file:
MCP_TRANSPORT_TYPE=http
MCP_HTTP_HOST=localhost
MCP_HTTP_PORT=3000

# Start server
npm start
```

The server will be available at:

- **Endpoint**: `http://localhost:3000/mcp`
- **Methods**:
  - `POST /mcp` - Client-to-server requests
  - `GET /mcp` - Server-to-client notifications (SSE)
  - `DELETE /mcp` - Session termination

## 🐳 Docker Deployment

For easy deployment and containerized environments, you can run the MCP server using Docker.

### **Quick Start with Docker**

#### **Environment File Setup**

Example `.env` configuration for Docker:

```bash
# MCP Server Configuration
MCP_HTTP_HOST=0.0.0.0
MCP_HTTP_PORT=3000
MCP_TRANSPORT_TYPE=http

# Fibaro HC3 Configuration (Required)
HC3_HOST=192.168.1.100
HC3_USERNAME=admin
HC3_PASSWORD=your_secure_password
HC3_PORT=80

# Server Configuration
SERVER_TIMEOUT=10000
LOG_LEVEL=info
```

#### **Build and Run with Docker Compose**

```bash
# Build and start the container
docker-compose up -d
```

### **Integration with MCP Clients (Docker)**

#### **Claude Desktop with Docker**

Configure Claude Desktop to connect to the Docker container:

```json
{
  "mcpServers": {
    "mcp-server-hc3": {
      "command": "curl",
      "args": ["-X", "POST", "-H", "Content-Type: application/json", "http://localhost:3000/mcp"]
    }
  }
}
```

#### **Custom MCP Client Integration**

Connect to the Docker container via HTTP:

- **Endpoint**: `http://localhost:3000/mcp`
- **Transport**: HTTP-based MCP protocol
- **Headers**: `Content-Type: application/json`

## 🛠️ Development

### **Environment Variables**

#### **Fibaro HC3 Configuration**

| Variable       | Required | Default | Description                |
| -------------- | -------- | ------- | -------------------------- |
| `HC3_HOST`     | ✅       | -       | HC3 IP address or hostname |
| `HC3_USERNAME` | ✅       | -       | HC3 username               |
| `HC3_PASSWORD` | ✅       | -       | HC3 password               |
| `HC3_PORT`     | ❌       | `80`    | HC3 HTTP port              |

#### **MCP Transport Configuration**

| Variable             | Required | Default     | Description                       |
| -------------------- | -------- | ----------- | --------------------------------- |
| `MCP_TRANSPORT_TYPE` | ❌       | `stdio`     | Transport type: 'stdio' or 'http' |
| `MCP_HTTP_HOST`      | ❌       | `localhost` | HTTP server bind address          |
| `MCP_HTTP_PORT`      | ❌       | `3000`      | HTTP server port                  |

### **Available Scripts**

```bash
npm run build          # Build TypeScript code
npm run watch          # Build and watch for changes
npm start              # Start the server
npm run dev            # Development mode with MCP Inspector
```

### **MCP Inspector**

The `npm run dev` command includes the **MCP Inspector** for development and debugging. This provides an interactive web interface at `http://localhost:6274/` to test MCP tools.

### **Project Structure**

```
src/
├── index.ts            # Main entry point
├── config/
│   └── index.ts        # Configuration management
├── mcp/
│   ├── server.ts       # MCP server setup and transport
│   ├── http.ts         # HTTP transport implementation
│   └── types.ts        # MCP transport types
├── fibaro/
│   ├── client.ts       # Fibaro HC3 API client
│   ├── room.api.ts     # Room API implementation
│   ├── device.api.ts   # Device API implementation
│   ├── scene.api.ts    # Scene API implementation
│   └── types.ts        # Fibaro API types
└── tools/
    ├── index.ts        # Main tools setup
    ├── common.ts       # Shared utilities
    ├── room.tools.ts   # Room management tools
    ├── device.tools.ts # Device control tools
    ├── scene.tools.ts  # Scene management tools
    └── system.tools.ts # System tools
```

## 🏗️ API Reference

### **Fibaro HC3 REST API**

This server implements the official Fibaro HC3 REST API:

- **Rooms API**: `/api/rooms`
- **Devices API**: `/api/devices`
- **Scenes API**: `/api/scenes`

## 📝 License

MIT - see [LICENSE](LICENSE) file for details.

---

**Ready to make your smart home smarter with AI! 🎉**
