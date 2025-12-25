# Tasks: add-fftt-client

## 1. Package Structure
- [ ] 1.1 Create package packages/fftt-client
- [ ] 1.2 Configure TypeScript
- [ ] 1.3 Define FFTTClientInterface
- [ ] 1.4 Define types (Player, SearchResult)

## 2. Mock Client
- [ ] 2.1 Create MockFFTTClient implementing FFTTClientInterface
- [ ] 2.2 Create mock data file (JSON with ~50 players)
- [ ] 2.3 Implement searchByLicence(licence: string)
- [ ] 2.4 Simulate realistic network delays

## 3. Real Client (for later)
- [ ] 3.1 Create FFTTClient implementing FFTTClientInterface
- [ ] 3.2 Configure FFTT API authentication
- [ ] 3.3 Implement real calls
- [ ] 3.4 Handle errors and timeouts

## 4. Backend Integration
- [ ] 4.1 Create FFTTService in api/
- [ ] 4.2 Inject client according to environment (mock/prod)
- [ ] 4.3 Create endpoint GET /api/players/search?licence=XXX
- [ ] 4.4 Handle "To Verify" fallback if API unavailable

## 5. Tests
- [ ] 5.1 Test mock client
- [ ] 5.2 Test search with valid license
- [ ] 5.3 Test search with non-existent license