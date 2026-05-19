@echo off
echo ========================================
echo QuickDrop API - Authentication Tests
echo ========================================
echo.

echo Test 1: Register a customer user
curl.exe -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d @test-customer.json
echo.
echo.

echo Test 2: Try duplicate email (should fail with 409)
curl.exe -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d @test-duplicate.json
echo.
echo.

echo Test 3: Try invalid role (should fail with 400)
curl.exe -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d @test-invalid-role.json
echo.
echo.

echo Test 4: Get CSRF token
curl.exe http://localhost:3000/api/auth/csrf
echo.
echo.

echo Test 5: Get auth providers
curl.exe http://localhost:3000/api/auth/providers
echo.
echo.

echo Test 6: Check session (should be empty - not logged in)
curl.exe http://localhost:3000/api/auth/session
echo.
echo.

echo Test 7: Try to access protected route without auth (should return 401)
curl.exe http://localhost:3000/api/orders
echo.
echo.

echo Test 8: Get all products (public route - should work)
curl.exe http://localhost:3000/api/products
echo.
echo.

echo ========================================
echo Tests Complete!
echo ========================================
echo.
echo Next: Test login flow using AUTH_EXAMPLES.http in VS Code
pause
