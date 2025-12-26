# Tasks: add-fftt-client

## 1. Package Structure

- [x] 1.1 Create package packages/fftt-client

- [x] 1.2 Configure TypeScript

- [x] 1.3 Define FFTTClientInterface

- [x] 1.4 Define types (Player, SearchResult)



## 2. Mock Client

- [x] 2.1 Create MockFFTTClient implementing FFTTClientInterface

- [x] 2.2 Create mock data file (JSON with ~50 players)

- [x] 2.3 Implement searchByLicence(licence: string)

- [x] 2.4 Simulate realistic network delays



## 3. Real Client (for later)

- [x] 3.1 Create FFTTClient implementing FFTTClientInterface

- [x] 3.2 Configure FFTT API authentication

- [x] 3.3 Implement real calls

- [x] 3.4 Handle errors and timeouts



## 4. Backend Integration

- [x] 4.1 Create FFTTService in api/

- [x] 4.2 Inject client according to environment (mock/prod)

- [x] 4.3 Create endpoint GET /api/players/search?licence=XXX

- [x] 4.4 Handle "To Verify" fallback if API unavailable



## 5. Tests

- [x] 5.1 Test mock client

- [x] 5.2 Test search with valid license

- [x] 5.3 Test search with non-existent license
