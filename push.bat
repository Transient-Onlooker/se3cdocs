@echo off
chcp 65001 > nul
set /p msg="커밋 메시지를 입력하세요 (예: 수정 완료): "
if "%msg%"=="" set msg="Update: Content changes"

echo [알림] 변경된 파일을 추가합니다...
git add .

echo [알림] 커밋을 생성합니다...
git commit -m "%msg%"

echo [알림] GitHub로 업로드합니다...
git push origin main

if %errorlevel% neq 0 (
    echo [오류] 업로드에 실패했습니다. 인터넷 연결이나 GitHub 권한을 확인해 주세요.
) else (
    echo [완료] GitHub에 성공적으로 올라갔습니다!
)

pause
