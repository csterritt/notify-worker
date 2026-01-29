# Cloudflare Worker Implementation Plan

## Overview
Create a Cloudflare Worker that receives notification requests and forwards them to Pushover after validating a secret code.

## Implementation Steps

1. **Define TypeScript types**
   - `Env` interface with `SECRET_CODE_VALUE`, `PO_APP_ID`, `PO_USER_ID`
   - Request body interface with `secret` and `message` fields

2. **Implement request validation**
   - Check HTTP method is POST
   - Check path is `/notify`
   - Parse JSON body and validate required fields exist

3. **Implement rate limiting**
   - Use Cloudflare's rate limiting features
   - Implement custom rate limiting logic if needed

4. **Implement secret code validation**
   - Compare provided secret against `SECRET_CODE_VALUE` from env
   - Proceed to Pushover only if match
   - Use constant-time comparison to prevent timing attacks

5. **Implement Pushover API call**
   - POST to `https://api.pushover.net/1/messages.json`
   - Send form-encoded data: `token`, `user`, `message`
   - Handle response and errors

6. **Return standardized response**
   - Always return `{"success": true, "result": "success"|"fail"}`
   - Return "fail" if secret mismatch OR Pushover API fails
   - Return "success" only if secret matches AND Pushover succeeds
   - Return 

## Code Structure
- Single `fetch` handler with arrow function
- Functional style with early returns for validation failures
- Proper error handling with try-catch
- Type-safe environment variable access
