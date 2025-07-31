# Azure Function HTTP - Agent Guide

## Project Overview

This is the **@nestjs/azure-func-http** package - an official NestJS adapter for Azure Functions HTTP triggers. It enables NestJS applications to run seamlessly on Azure Functions with both Express-compatible and native routing options.

## Repository Structure

```
azure-func-http/
├── lib/                        # Main source code
│   ├── adapter/               # Azure-specific HTTP adapters
│   │   ├── azure-adapter.ts   # Express compatibility adapter
│   │   ├── azure-reply.ts     # Response handling
│   │   ├── azure-request.ts   # Request handling
│   │   └── index.ts           # Adapter exports
│   ├── router/                # Native Azure routing
│   │   ├── azure-http.router.ts # Fast native router
│   │   └── index.ts           # Router exports
│   ├── azure-http.adapter.ts  # Main adapter entry point
│   └── index.ts               # Package exports
├── schematics/                # NestJS CLI integration
├── .github/                   # GitHub workflows and templates
├── package.json               # Dependencies and scripts
└── README.md                  # User documentation
```

## Key Components

### 1. AzureHttpAdapter (Main Entry Point)
- **File**: `lib/azure-http.adapter.ts`
- **Purpose**: Static adapter class that handles Azure Function HTTP requests
- **Key Method**: `handle()` - processes incoming Azure Function context and HTTP requests
- **Features**: 
  - Lazy initialization for cold starts
  - Auto-detection of native vs Express routing
  - Express compatibility layer

### 2. Native Router (AzureHttpRouter)
- **File**: `lib/router/azure-http.router.ts`
- **Purpose**: High-performance native routing without Express overhead
- **Benefits**: Faster routing, smaller bundle size
- **Usage**: `new AzureHttpRouter()` when creating NestJS app

### 3. Express Adapter
- **File**: `lib/adapter/azure-adapter.ts`
- **Purpose**: Compatibility layer for existing Express-based NestJS apps
- **Features**: Request/response transformation between Azure and Express formats

## Tech Stack

- **Framework**: NestJS (v6-11 peer dependency)
- **Platform**: Azure Functions (v1-3 support)
- **Language**: TypeScript
- **Dependencies**:
  - `@azure/functions` - Azure Functions runtime
  - `cors` - Cross-origin support
  - `trouter` - Fast routing for native mode
  - `jsonc-parser` - JSON parsing utilities

## Development Workflow

### Build Commands
```bash
npm run build          # Build both library and schematics
npm run build:lib      # Build TypeScript library
npm run build:schematics # Build CLI schematics
```

### Testing
```bash
npm test              # Run Jest tests
npm run test:dev      # Watch mode for development
```

### Code Quality
```bash
npm run lint          # ESLint with TypeScript
npm run format        # Prettier formatting
```

### Release Process
```bash
npm run release       # Automated release with release-it
npm run publish:npm   # Publish to npm registry
npm run publish:next  # Publish with 'next' tag
```

## Key Features for Agents

### 1. Dual Routing Modes
- **Express Mode**: Full compatibility with existing NestJS/Express apps
- **Native Mode**: Fast, lightweight routing optimized for Azure Functions

### 2. CLI Integration
- Includes NestJS schematics for `nest add @nestjs/azure-func-http`
- Auto-generates Azure Function configuration files
- Customizable with flags like `--rootDir`, `--rootModuleFileName`

### 3. Cold Start Optimization
- Lazy handler initialization
- Minimal startup overhead
- Efficient memory usage

### 4. TypeScript Support
- Full type safety with Azure Functions types
- Strong typing for request/response handling
- Comprehensive type definitions

## Common Use Cases

1. **Migrating NestJS apps to Azure Functions**
2. **Building serverless APIs with NestJS**
3. **Hybrid cloud deployments**
4. **Performance-critical serverless applications** (use native router)

## Configuration Files

- **host.json**: Azure Functions host configuration
- **function.json**: Function binding configuration
- **local.settings.json**: Local development settings
- **.funcignore**: Files to ignore during deployment
- **proxies.json**: Azure Functions proxy configuration

## Important Notes for Agents

1. **Version Compatibility**: Supports NestJS 6-11 and Azure Functions 1-3
2. **Peer Dependencies**: Requires `@azure/functions`, `@nestjs/common`, `@nestjs/core`
3. **Performance**: Native router is significantly faster than Express mode
4. **Deployment**: Works with Azure Functions Core Tools and VS Code extension
5. **Testing**: Uses Jest with Azure Functions mocking
6. **Maintenance**: Active project with regular updates and renovate bot

## Troubleshooting Areas

- Cold start performance optimization
- Express middleware compatibility
- Azure Functions binding configuration
- TypeScript compilation issues
- Package version conflicts

## Related Documentation

- [Azure Functions Documentation](https://docs.microsoft.com/azure/azure-functions/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Integration Tutorial](https://trilon.io/blog/deploy-nestjs-azure-functions)

This package is maintained by the NestJS team and is production-ready for Azure Functions deployments.
