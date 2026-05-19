# QuickDrop Authentication Test Script

Write-Host "=== QuickDrop Authentication Tests ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Register a new user
Write-Host "Test 1: Register a new admin user" -ForegroundColor Yellow
$registerBody = @{
    name = "Test Admin"
    email = "test@test.com"
    password = "password123"
    role = "admin"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -ContentType "application/json" -Body $registerBody
    
    Write-Host "Registration successful!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.user.id)" -ForegroundColor Gray
    Write-Host "Name: $($registerResponse.user.name)" -ForegroundColor Gray
    Write-Host "Email: $($registerResponse.user.email)" -ForegroundColor Gray
    Write-Host "Role: $($registerResponse.user.role)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Registration failed or user exists: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Try to register duplicate email
Write-Host "Test 2: Try to register duplicate email (should fail)" -ForegroundColor Yellow
try {
    $duplicateResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -ContentType "application/json" -Body $registerBody
    Write-Host "Should have failed but did not!" -ForegroundColor Red
    Write-Host ""
} catch {
    Write-Host "Correctly rejected duplicate email" -ForegroundColor Green
    Write-Host ""
}

# Test 3: Get session
Write-Host "Test 3: Check session (should be empty)" -ForegroundColor Yellow
try {
    $sessionResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/session" -Method GET
    if ($sessionResponse) {
        Write-Host "Session: $($sessionResponse | ConvertTo-Json)" -ForegroundColor Gray
    } else {
        Write-Host "No active session" -ForegroundColor Green
    }
    Write-Host ""
} catch {
    Write-Host "Session check: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
}

# Test 4: Try to access protected route without auth
Write-Host "Test 4: Access protected route without auth (should fail)" -ForegroundColor Yellow
try {
    $ordersResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/orders" -Method GET
    Write-Host "Should have been blocked!" -ForegroundColor Red
    Write-Host ""
} catch {
    Write-Host "Correctly blocked unauthorized access" -ForegroundColor Green
    Write-Host ""
}

# Test 5: Get CSRF token
Write-Host "Test 5: Get CSRF token" -ForegroundColor Yellow
try {
    $csrfResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/csrf" -Method GET
    Write-Host "CSRF token retrieved" -ForegroundColor Green
    Write-Host "Token: $($csrfResponse.csrfToken)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Failed to get CSRF token: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 6: Get available providers
Write-Host "Test 6: Get available auth providers" -ForegroundColor Yellow
try {
    $providersResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/providers" -Method GET
    Write-Host "Providers retrieved" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Failed to get providers: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 7: Register a customer
Write-Host "Test 7: Register a customer user" -ForegroundColor Yellow
$customerBody = @{
    name = "John Customer"
    email = "john@customer.com"
    password = "john123"
    role = "customer"
} | ConvertTo-Json

try {
    $customerResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -ContentType "application/json" -Body $customerBody
    Write-Host "Customer registration successful!" -ForegroundColor Green
    Write-Host "User ID: $($customerResponse.user.id)" -ForegroundColor Gray
    Write-Host "Name: $($customerResponse.user.name)" -ForegroundColor Gray
    Write-Host "Role: $($customerResponse.user.role)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Customer registration failed or exists: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 8: Try invalid role
Write-Host "Test 8: Try to register with invalid role (should fail)" -ForegroundColor Yellow
$invalidRoleBody = @{
    name = "Invalid User"
    email = "invalid@test.com"
    password = "test123"
    role = "superuser"
} | ConvertTo-Json

try {
    $invalidResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -ContentType "application/json" -Body $invalidRoleBody
    Write-Host "Should have failed!" -ForegroundColor Red
    Write-Host ""
} catch {
    Write-Host "Correctly rejected invalid role" -ForegroundColor Green
    Write-Host ""
}

Write-Host "=== Tests Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: NextAuth login requires browser session cookies." -ForegroundColor Yellow
Write-Host "To test login, use the AUTH_EXAMPLES.http file in VS Code with REST Client extension." -ForegroundColor Yellow
