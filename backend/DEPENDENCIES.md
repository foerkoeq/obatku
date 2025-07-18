# API Foundation Dependencies

The following packages are required for the API Foundation and are already included in the project:

## Required Dependencies (Already Installed)

### Core Dependencies
- `express`: ^4.21.2 - Web framework
- `express-rate-limit`: ^7.5.1 - Rate limiting middleware
- `helmet`: ^7.2.0 - Security headers middleware
- `cors`: ^2.8.5 - CORS middleware
- `uuid`: ^9.0.1 - UUID generation for request IDs
- `compression`: ^1.8.0 - Response compression

### Development Dependencies
- `@types/express`: ^4.17.23
- `@types/cors`: ^2.8.19
- `@types/uuid`: ^9.0.8

## Optional Dependencies for Enhanced Features

If you want to add OpenAPI documentation export to YAML:

```bash
npm install yaml
npm install --save-dev @types/yaml
```

If you want to add request validation with Joi (alternative to Zod):

```bash
npm install joi
npm install --save-dev @types/joi
```

## All Required Dependencies Are Already Available

The current package.json already includes all necessary dependencies for the API Foundation implementation. No additional installations are required.

## Usage

Simply import and use the utilities:

```typescript
import {
  ApiResponseUtil,
  ApiPaginationUtil,
  ApiSortingUtil,
  ApiFilteringUtil,
  ApiSecurityUtil
} from '@/shared/utils';

import { BaseApiController } from '@/shared/controllers';
```
