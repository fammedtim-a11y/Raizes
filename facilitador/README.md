# Facilitador Raizes Kids

Aplicativo Windows para administradores incluirem conteudos no sistema principal sem usar a tela completa de gerenciamento.

## Como usar

1. Instale o aplicativo gerado em `dist-facilitador/Facilitador Raizes Kids Setup 1.0.0.exe`.
2. Abra o Facilitador Raizes Kids.
3. Informe o endereco do sistema, por padrao `https://raizes-fic9.onrender.com`.
4. Entre com usuario e senha de administrador.
5. Escolha o tipo de conteudo: Licao Biblica, Trilha, Treinamento ou EBF Completa.
6. Preencha o formulario, inclua imagens/anexos quando necessario e clique em `Salvar no sistema principal`.

## Gerar novo instalador

```powershell
npm.cmd install
$env:CSC_IDENTITY_AUTO_DISCOVERY='false'
$env:ELECTRON_BUILDER_CACHE='C:\Users\Dell Latitude\Documents\Raizes\.electron-builder-cache'
npm.cmd run facilitador:dist
```

O instalador sera criado em `dist-facilitador`.
