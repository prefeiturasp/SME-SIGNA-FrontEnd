@echo off
REM Script para executar testes do SIGNA no Windows

echo ========================================
echo  SIGNA - Automacao de Testes
echo ========================================
echo.

REM Verificar se Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js antes de continuar.
    pause
    exit /b 1
)

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
    echo.
)

REM Menu de opções
:menu
echo.
echo Escolha uma opcao:
echo 1. Executar todos os testes
echo 2. Executar teste de Login
echo 3. Executar teste de Esqueci Senha
echo 4. Executar teste de Alterar Senha
echo 5. Executar teste de Alteracao de Email
echo 6. Abrir Cypress (modo interativo)
echo 7. Gerar relatorio Allure
echo 0. Sair
echo.

set /p opcao="Digite o numero da opcao: "

if "%opcao%"=="1" goto todos
if "%opcao%"=="2" goto login
if "%opcao%"=="3" goto esqueci
if "%opcao%"=="4" goto alterar_senha
if "%opcao%"=="5" goto alterar_email
if "%opcao%"=="6" goto interativo
if "%opcao%"=="7" goto relatorio
if "%opcao%"=="0" goto fim
goto menu

:todos
echo.
echo Executando todos os testes...
call npm test
goto fim_teste

:login
echo.
echo Executando testes de Login...
call npm run test:login
goto fim_teste

:esqueci
echo.
echo Executando testes de Esqueci Senha...
call npm run test:esqueci-senha
goto fim_teste

:alterar_senha
echo.
echo Executando testes de Alterar Senha...
call npm run test:alterar-senha
goto fim_teste

:alterar_email
echo.
echo Executando testes de Alteracao de Email...
call npm run test:alteracao-email
goto fim_teste

:interativo
echo.
echo Abrindo Cypress...
call npm run open
goto menu

:relatorio
echo.
echo Gerando relatorio Allure...
call npm run allure:report
goto menu

:fim_teste
echo.
echo ========================================
echo  Testes concluidos!
echo ========================================
pause
goto menu

:fim
echo.
echo Ate logo!
exit /b 0
