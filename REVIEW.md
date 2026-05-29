# HAQMS Engineering Audit and code quality Report

## Executive Summary:
The HAQMS codebase was subjected to a thorough security, performance and architectural audit. Several critical vulnerabilities and code inefficiencies were identified and systematically patched.


## __Security Audit__

1. **Credential Logging - Issue 1**

* **Status**: ✅
* **File Location**: `backend/src/routes/auth.js`
* **Vulnerability**: The API was logging (`console.log()`) passwords in plain text upon sending a POST request to auth route
* **Production risk**: Server logs can be easily ingested by third parties. Logs with raw credentials and private information leave the window open for attacks
* **Fix**: Completely removing the sensitive logs from the authentication logic

<br>

2. **Sensitive Data Exposure - Issue 2**
* **Status**: ✅
* **File Location**: `backend/src/routes/auth.js`
* **Vulnerability**: The API returns the newly created user object including password hash back to the client when a user signs up
* **Production Risk**: This is a major security flaw. An attacker *can* gain access to the user's account
* **Fix**: Return an id (user's id) to identify the user instead of sending every bit of information

<br>

3. **Missing Input Validation - Issue 3**
* **Status**: ✅
* **File Location**: `backend/src/routes/auth.js`
* **Vulnerability**: The API was missing validation checks for email format and password
* **Production Risk**: An attacker could pollute the database with invalid email strings
* **Fix**: Implement a regex that verifies the email format and a check for password's length

<br>

4. **Massive expiry JWT tokens - Issue 4**
* **Status**: ✅
* **File Location**: `backend/src/routes/auth.js`
* **Vulnerability**: The API was generating a JWT token with massive expiry upon a successful login
* **Production Risk**: The server cannot independently modify or cancel them once issued. An attacker can gain access to the user's account without needing to re-authenticate
* **Fix**: Refactor the expiry time to a few hours

<br>

5. **Nested API Response - Issue 5**
* **Status**: ✅
* **File Location**: `backend/src/routes/auth.js`
* **Vulnerability**: The API was returning a data object with user object inside
* **Production Risk**: The API response style must be consistent to maintain clean code
* **Fix**: Refactor `/login` route to return similar response style with `/register`

<br>

6. **Exposed JWT Secret - Issue 6**
* **Status**: ✅
* **File Location**: `backend/src/middleware/auth.js`
* **Vulnerability**: The API was exposing JWT secret key as plain text
* **Production Risk**: Exposes the secret and allowing anyone to create valid tokens and gain access to the system
* **Fix**: Move the JWT secret to `.env` file

<br>

7. **Weak token expiry check - Issue 7**
* **Status**: ✅
* **File Location**: `backend/src/middleware/auth.js`
* **Vulnerability**: The API was skipping the expiry check of the token
* **Production Risk**: This allows an attacker to gain access to the system with *any* jwt token
* **Fix**: Remove the `ignoreExpiration` flag from verify method

<br>

8. **Exposed error messages - Issue 8**
* **Status**: ✅
* **File Location**: `backend/src/middleware/auth.js`
* **Vulnerability**: The API was returning error details to the client
* **Production Risk**: An attacker can trace the error and know what is breaking
* **Fix**: Remove returning error details to the client

<br>

9. **Missing admin authorization check - Issue 9**
* **Status**: ✅
* **File Location**: `backend/src/middleware/auth.js`
* **Vulnerability**: The API was missing an authorization check for the admin users
* **Production Risk**: Without the authorization check, anyone would be able to access admin only part of the API
* **Fix**: Add admin authorization middleware

<br>

10. **SQL Injection Vulnerability - Issue 10**
* **Status**: ✅
* **File Location**: `backend/src/routes/doctors.js`
* **Vulnerability**: The API was using string concatenation and queryRawUnsafe
* **Production Risk**: An attacker could pollute and execute remote scripts on the database by sending SQL commands
* **Fix**: Replace string concatenation with parameterized inputs

<br>


## __Backend Performance & Concurrency__

1. **Execute queries in a loop - Issue 2**
* **Status**: ✅
* **File Location**: `backend/src/routes/appointments.js`
* **Vulnerability**: The API was executing nested queries in a loop
* **Production Risk**: This causes operations to be slowed down
* **Fix**: Replace nested queries with ORM methods

<br>

2. **Exposed query syntax - Issue 1**
* **Status**: ✅
* **File Location**: `backend/src/routes/doctors.js`
* **Vulnerability**: The API was returning query syntax to the client upon an error
* **Production Risk**: An attacker can trace the error and find the syntax needed to potentially gain access to the database
* **Fix**: Return generalised message to the client instead of details

<br>

3. **Sequential async Calls causing delays - Issue 3**
* **Status**: ✅
* **File Location**: `backend/src/routes/doctors.js`
* **Vulnerability**: The API was stalling due to sequential async/await calls
* **Production Risk**: It will slow down queries as the database grows
* **Fix**: Implement a `Promise.all` to fire all queries at the same time

<br>

4. **Nested report endpoint - Issue 4**
* **Status**: ✅
* **File Location**: `backend/src/routes/reports.js`
* **Vulnerability**: The API running nested report queries blocking the event loop
* **Production Risk**: Could cause the application to crash
* **Fix**: Pull applications in one go using prisma from the database

5. **Assigns duplicate tokens - Issue 5**
* **Status**: ✅
* **File Location**: `backend/src/routes/queue.js`
* **Vulnerability**: The API was creating duplicate tokens
* **Production Risk**: Allows someone to maniuplate the queue
* **Fix**: Use transaction to ensure read and write are treated as one operation

6. **Inconsistent response cycle - Issue 6**
* **Status**: ✅
* **File Location**: `backend/src/routes/queue.js`
* **Issue**: The API was returning inconsistent json objects which disrupts the code quality
* **Fix**: Match the response style to `/register` and `/login`

## **__Database And Schema Optimizations__**

1. **Duplicate Schema flaws - Issue 1**
* **Status**: ✅
* **File Location**: `backend/src/routes/appointments.js`
* **Vulnerability**: The API was treating ms (milliseconds) to be unique time
* **Production Risk**: Make it unrealistic for doctors to manage appointments
* **Fix**: Implement `slot` logic to ensure a slot lasts for 30 mins with a 30 mins break

<br>

2. **Patch appointment status - Issue 2**
* **Status**: ✅
* **File Location**: `backend/src/routes/appointments.js`
* **Vulnerability**: The API was missing validation for status request
* **Production Risk**: An attacker could pollute the database with invalid values
* **Fix**: Implement an array with valid values and return an error if the status is not valid

<br>

3. **Multiple DB queries - Issue 3**
* **Status**: ✅
* **File Location**: `backend/src/routes/appointments.js`
* **Vulnerability**: The API was running multiple nested queries
* **Production Risk**: This slows down the database over time as number of doctors increase
* **Fix**: Pull all appointments from prisma and store the data in an array

<br>

4. **In-Memory search and filtering - Issue 4**
* **Status**: ✅
* **File Location**: `backend/src/routes/patients.js`
* **Vulnerability**: The API was using memory to search and filter patients
* **Production Risk**: This slows down application as the size grows
* **Fix**: Create a `where` object that pulls the search and query from the database

<br>

5. **In-Memory pagination - Issue 5**
* **Status**: ✅
* **File Location**: `backend/src/routes/patients.js`
* **Vulnerability**: The API was using memory to implement pagination
* **Production Risk**: Slows down application as the complexity and size grows

<br>

6. **Inconsistent Validation - Issue 6**
* **Status**: ✅
* **File Location**: `backend/src/routes/patients.js`
* **Vulnerability**: the API was missing validation for phone number and age
* **Production Risk**: An attacker could pollute database with random values
* **Fix**: Add two regex to validate input

<br>

7. **Fetching details with tokens - Issue 7**
* **Status**: ✅
* **File Location**: `backend/src/routes/patients.js`
* **Issue**: Fetch appointments token using prisma
* **Fix**: Add an include statement in prisma query that returns appointments

<br>

8. **Missing indices in schema - Issue 8**
* **Status**: ✅
* **File Location**: `backend/prisma/schema.prisma`
* **Issue**: Missing some constraints that might break the logic
* **Fix**: Add index and unique attributes to maintain


## **__Frontend Memory & React Optimization__**

1. **Re-renders on each keystroke - Issue 1**
* **Status**: ✅
* **File Location**: `frontend/src/dashboard/page.js`
* **Vulnerability**: The effect runs a search for every keystroe entered
* **Fix**: Add a delay before fetch gets executed after user stops typing

<br>

2. **Medical histroy crash bug - Issue 2**
* **Status**: ✅
* **File Location**: `frontend/src/dashboard/page.js`
* **Vulnerability**: The application crashes because medical history is always populated
* **Fix**: Add a conditional check to separate concerns

<br>

3. **Route trigger - Issue 3**
* **Status**: ✅
* **File Location**: `frontend/src/dashboard/page.js`
* **Issue**: The code is missing dependencies imports
* **Fix** Import required dependencies