## ADDED Requirements

### Requirement: Place Freed Detection
The system MUST automatically detect when a place becomes free.

#### Scenario: User Cancellation
- **WHEN** a user cancels their registration
- **THEN** the PlaceFreed event is emitted

#### Scenario: Admin Deletion
- **WHEN** an admin deletes a registration
- **THEN** the PlaceFreed event is emitted

### Requirement: Priority Notification
The system MUST notify the rank 1 player on the waitlist.

#### Scenario: Immediate Notification
- **WHEN** a place becomes free and a waitlist exists
- **THEN** the rank 1 player receives an email with a payment link

#### Scenario: No Waitlist
- **WHEN** a place becomes free without a waitlist
- **THEN** no action is taken (place remains available)

#### Scenario: Email Content
- **WHEN** the email is sent
- **THEN** it contains the table name, price, deadline, and unique link

### Requirement: Payment Timer
The system MUST manage a timer for payment validation.

#### Scenario: Timer Starts
- **WHEN** the notification is sent
- **THEN** a timer of X hours (configurable) starts

#### Scenario: Payment within Deadline
- **WHEN** the player pays before timer expiration
- **THEN** their registration passes to status = paid and the timer is cancelled

#### Scenario: Timer Expires
- **WHEN** the deadline expires without payment
- **THEN** the player is moved to the end of the waitlist

### Requirement: Waitlist Rotation
The system MUST rotate the waitlist upon expiration.

#### Scenario: Rotation after Expiration
- **WHEN** a player expires
- **THEN** their rank becomes the last in the list

#### Scenario: Next Notification
- **WHEN** a player expires
- **THEN** the new rank 1 is automatically notified

#### Scenario: Full Loop
- **WHEN** all players on the list have expired once
- **THEN** the first one returns to the top (second chance)

### Requirement: Unique Payment Link
The system MUST generate a unique and secure payment link.

#### Scenario: Valid Link
- **WHEN** a player clicks on their link within the deadline
- **THEN** they access the payment page

#### Scenario: Expired Link
- **WHEN** a player clicks on their link after expiration
- **THEN** an "Expired link" message is displayed

#### Scenario: Link Already Used
- **WHEN** a player clicks on a link already used to pay
- **THEN** a "Already paid" message is displayed

### Requirement: Automated Job
The system MUST execute expiration checks automatically.

#### Scenario: Regular Job
- **WHEN** the CRON job executes (every 5 minutes)
- **THEN** expired registrations are processed

#### Scenario: Resilience
- **WHEN** the job fails
- **THEN** it is retried and errors are logged