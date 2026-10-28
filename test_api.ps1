$ErrorActionPreference = 'Stop'

Write-Host "== 1. Testing Admin Login =="
$adminLoginBody = @{ usernameOrEmail = 'admin@portal.edu'; password = 'admin123' } | ConvertTo-Json
$adminAuth = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/admin/login' -Method Post -Body $adminLoginBody -ContentType 'application/json'
Write-Host "Admin login success:" $adminAuth.success
$adminToken = $adminAuth.token

Write-Host "== 2. Testing Dashboard Stats =="
$stats = Invoke-RestMethod -Uri 'http://localhost:3000/api/tracker/dashboard-stats' -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
Write-Host "Total Students:" $stats.stats.totalStudents "Active:" $stats.stats.activeStudents

Write-Host "== 3. Testing Adding New Student & Auto Email =="
$newStudentBody = @{
  name = 'Vikram Malhotra'
  student_id = 'STU099'
  personal_email = 'vikram.test@example.com'
  phone = '+91 99887 76655'
  course = 'Artificial Intelligence & Data Science'
  batch = '2024-2028'
  username = 'vikram99'
  status = 'Active'
} | ConvertTo-Json

$createdStudent = Invoke-RestMethod -Uri 'http://localhost:3000/api/students' -Method Post -Body $newStudentBody -ContentType 'application/json' -Headers @{ Authorization = "Bearer $adminToken" }
Write-Host "Student created:" $createdStudent.student.name "Temporary Password:" $createdStudent.student.temporaryPassword
Write-Host "Email notification status:" $createdStudent.emailNotification.status

Write-Host "== 4. Testing Student Login with Generated Credentials =="
$studentLoginBody = @{
  identifier = 'STU099'
  password = $createdStudent.student.temporaryPassword
} | ConvertTo-Json

$studentAuth = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/student/login' -Method Post -Body $studentLoginBody -ContentType 'application/json'
Write-Host "Student login success:" $studentAuth.success
$studentToken = $studentAuth.token

Write-Host "== 5. Testing Student Announcement Viewing & Tracking =="
$announcements = Invoke-RestMethod -Uri 'http://localhost:3000/api/announcements' -Method Get -Headers @{ Authorization = "Bearer $studentToken" }
$firstAnn = $announcements.announcements[0]
Write-Host "Reading announcement:" $firstAnn.title
$readRes = Invoke-RestMethod -Uri "http://localhost:3000/api/announcements/$($firstAnn.id)/read" -Method Post -Headers @{ Authorization = "Bearer $studentToken" }
Write-Host "Announcement read tracked:" $readRes.message

Write-Host "== 6. Testing Student-to-Admin Messaging =="
$msgBody = @{ message = 'Hello Admin, I have successfully logged in with my new credentials. Thank you!' } | ConvertTo-Json
$msgRes = Invoke-RestMethod -Uri 'http://localhost:3000/api/messages' -Method Post -Body $msgBody -ContentType 'application/json' -Headers @{ Authorization = "Bearer $studentToken" }
Write-Host "Student message sent:" $msgRes.message

Write-Host "== 7. Testing Admin Reply =="
$replyBody = @{ studentId = $createdStudent.student.id; message = 'Welcome Vikram! Let us know if you have any questions about course materials.' } | ConvertTo-Json
$replyRes = Invoke-RestMethod -Uri 'http://localhost:3000/api/messages' -Method Post -Body $replyBody -ContentType 'application/json' -Headers @{ Authorization = "Bearer $adminToken" }
Write-Host "Admin reply sent:" $replyRes.message

Write-Host "== 8. Testing Individual Student Tracker Metrics =="
$tracker = Invoke-RestMethod -Uri "http://localhost:3000/api/tracker/student/$($createdStudent.student.id)" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
Write-Host "Tracker Metrics for" $tracker.student.name ":"
Write-Host "  Logins:" $tracker.tracker.logins
Write-Host "  Announcements Viewed:" $tracker.tracker.announcementsViewed
Write-Host "  Messages Sent:" $tracker.tracker.messagesSent
Write-Host "  Messages Received:" $tracker.tracker.messagesReceived
Write-Host "  Total Timeline Events:" $tracker.activities.Length

Write-Host "== ALL API & DATABASE TESTS PASSED SUCCESSFULLY! =="
