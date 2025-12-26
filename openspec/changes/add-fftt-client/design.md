# Design: add-fftt-client

## Context
The French Table Tennis Federation (FFTT) exposes an API allowing the retrieval of licensee information. This module must be reusable in other projects.

## Goals / Non-Goals
**Goals:**
- Standalone module without AdonisJS dependency
- Mockable interface for development
- Robust API error handling

**Non-Goals:**
- Implement all FFTT endpoints (only search by license)
- Result caching (will be managed at service level if necessary)

## Decisions

### Architecture
```
packages/fftt-client/
├── src/
│   ├── index.ts           # Public exports
│   ├── types.ts           # Interfaces and types
│   ├── fftt-client.ts     # Real client
│   └── mock-client.ts     # Mock client
├── data/
│   └── mock-players.json  # Test data
├── package.json
└── tsconfig.json
```

### Interface
```typescript
interface FFTTClientInterface {
  searchByLicence(licence: string): Promise<Player | null>;
}

interface Player {
  licence: string;
  firstName: string;
  lastName: string;
  club: string;
  points: number;
  sex: 'M' | 'F';
  category: string; // "Senior", "Junior", "Cadet", etc.
}
```

### Dependency Injection
The AdonisJS service will inject the correct client according to `NODE_ENV`:
- `development` → MockFFTTClient
- `production` → FFTTClient (with credentials)

### Mock Data
JSON file with ~50 fictitious players covering:
- Different points ranges (500-3000)
- Both genders
- Different age categories
- Several clubs

## Risks / Trade-offs
- **Unstable FFTT API** → Manual entry fallback is planned
- **API Change** → Abstract interface limits impact

## Open Questions
- Exact format of FFTT API authentication (to be documented during real implementation) : this is described in the documentation in specs/fftt-client + this repository can help https://github.com/alamirault/fftt-api