# Authentication System Documentation

## Overview

This authentication system provides a complete solution for user verification, registration, login, and password reset.

## Authentication Flow

### 1. Verification Method

- Users start by visiting `/auth/verify-method`
- They provide their name and choose between email or phone number
- The system sends a verification code to the selected contact method

### 2. OTP Verification

- On `/auth/verify-otp`, users enter the verification code
- They can resend the code if needed
- Once entered, the user is redirected to registration

### 3. Registration

- The registration form at `/auth/register` is pre-filled with the name and contact info
- Users must provide a password and the verification code
- Upon successful registration, they are redirected to login

### 4. Login

- Users can log in with either email or phone number
- Successful login stores the JWT token and user data in Redux/localStorage
- Failed login displays appropriate error messages

### 5. Password Reset

- The forgot password flow begins at `/auth/forgot-password`
- Users provide their email or phone number to receive a reset code
- On `/auth/reset-password`, they enter the code and create a new password

## Protected Routes

- Routes can be protected using the `ProtectedRoute` component
- It checks authentication status and redirects unauthenticated users to login

## Redux State Management

- The `authSlice.js` manages all authentication state
- It includes async thunks for all API interactions
- The state includes user data, token, loading states, and error messages

## API Endpoints

| Endpoint                  | Method | Description                     |
| ------------------------- | ------ | ------------------------------- |
| /auth/send-verification   | POST   | Send verification code          |
| /auth/resend-verification | POST   | Resend verification code        |
| /auth/register            | POST   | Register a new user             |
| /auth/login               | POST   | Log in a user                   |
| /auth/me                  | GET    | Get current user profile        |
| /auth/forgot-password     | POST   | Request password reset          |
| /auth/reset-password      | POST   | Reset password with code        |
| /auth/change-password     | POST   | Change password (authenticated) |
| /auth/logout              | GET    | Log out user                    |

## Session Storage

The system uses session storage to maintain state during the multi-step registration process:

- `verificationMethod`: "email" or "phone"
- `contactInfo`: Email or phone number
- `name`: User's name
- `verificationCode`: OTP code
- `resetContactInfo`: Contact info for password reset
- `resetMethod`: Method for password reset

## Usage

1. **Starting the Registration Process**:

   - Direct users to `/auth/verify-method`
   - They select email or phone and receive a verification code

2. **Protecting Routes**:

   - Wrap routes in `<ProtectedRoute>` component
   - Check `isAuthenticated` in the Redux store

3. **Checking Authentication**:

   ```jsx
   const { isAuthenticated, user } = useSelector((state) => state.auth);

   // In components
   if (!isAuthenticated) {
     return <Navigate to='/auth/login' />;
   }
   ```

4. **Logging Out**:
   ```jsx
   const dispatch = useDispatch();
   dispatch(logoutUser());
   // or
   dispatch(logout());
   ```

## Additional Notes

- Form validation is implemented for all inputs
- Error messages are displayed clearly for users
- The system supports persistent authentication via localStorage
