#!/bin/bash

# Script para executar testes do SIGNA no Linux/Mac

echo "========================================"
echo " SIGNA - Automação de Testes"
echo "========================================"
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "ERRO: Node.js não encontrado!"
    echo "Por favor, instale o Node.js antes de continuar."
    exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm install
    echo ""
fi

# Função para exibir menu
show_menu() {
    echo ""
    echo "Escolha uma opção:"
    echo "1. Executar todos os testes"
    echo "2. Executar teste de Login"
    echo "3. Executar teste de Esqueci Senha"
    echo "4. Executar teste de Alterar Senha"
    echo "5. Executar teste de Alteração de Email"
    echo "6. Abrir Cypress (modo interativo)"
    echo "7. Gerar relatório Allure"
    echo "0. Sair"
    echo ""
}

# Loop do menu
while true; do
    show_menu
    read -p "Digite o número da opção: " opcao
    
    case $opcao in
        1)
            echo ""
            echo "Executando todos os testes..."
            npm test
            ;;
        2)
            echo ""
            echo "Executando testes de Login..."
            npm run test:login
            ;;
        3)
            echo ""
            echo "Executando testes de Esqueci Senha..."
            npm run test:esqueci-senha
            ;;
        4)
            echo ""
            echo "Executando testes de Alterar Senha..."
            npm run test:alterar-senha
            ;;
        5)
            echo ""
            echo "Executando testes de Alteração de Email..."
            npm run test:alteracao-email
            ;;
        6)
            echo ""
            echo "Abrindo Cypress..."
            npm run open
            ;;
        7)
            echo ""
            echo "Gerando relatório Allure..."
            npm run allure:report
            ;;
        0)
            echo ""
            echo "Até logo!"
            exit 0
            ;;
        *)
            echo "Opção inválida!"
            ;;
    esac
    
    if [ "$opcao" != "6" ] && [ "$opcao" != "7" ] && [ "$opcao" != "0" ]; then
        echo ""
        echo "========================================"
        echo " Testes concluídos!"
        echo "========================================"
        read -p "Pressione ENTER para continuar..."
    fi
done
