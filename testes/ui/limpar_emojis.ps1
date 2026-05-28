# Script para remover emojis dos arquivos de steps

$arquivos = @(
    'cypress\support\step_definitions\ui\cessacao_steps.js',
    'cypress\support\step_definitions\ui\insubsistente_steps.js',
    'cypress\support\step_definitions\ui\common_steps.js',
    'cypress\support\step_definitions\ui\designacao_steps.js'
)

foreach ($arquivo in $arquivos) {
    if (Test-Path $arquivo) {
        Write-Host "Processando: $arquivo"
        $content = Get-Content $arquivo -Raw -Encoding UTF8
        
        # Remove emojis
        $content = $content -replace '✓\s*', ''
        $content = $content -replace '✅\s*', ''
        $content = $content -replace '❌\s*', ''
        $content = $content -replace '⚠\s*', ''
        $content = $content -replace '🎯\s*', ''
        $content = $content -replace '🔄\s*', ''
        $content = $content -replace '🔍\s*', ''
        $content = $content -replace '⏳\s*', ''
        
        # Remove comentários de separação desnecessários
        $content = $content -replace '// ={50,}.*?\n', ''
        $content = $content -replace '// ETAPA \d+:.*?\n// ={50,}\n', ''
        
        # Salva arquivo
        [System.IO.File]::WriteAllText((Join-Path (Get-Location) $arquivo), $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "  OK - Emojis removidos"
    }
}

Write-Host "`nLimpeza concluída!"
