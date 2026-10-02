# Automacoes do Raizes Kids

## O que esta pronto

- Funil de interessados no painel do administrador master.
- Captura de interessados pelo site com consentimento para WhatsApp.
- Inclusao automatica no funil quando um novo usuario se cadastra.
- Etapas: novo, conversando, cadastro, pagamento, cliente e encerrado.
- Historico de mensagens, atendimento humano e envio manual de contingencia.
- Webhook unico para Instagram e WhatsApp: `/api/meta/webhook`.
- Validacao `X-Hub-Signature-256` com `META_APP_SECRET` em producao.
- Respostas de menu no WhatsApp e palavra-chave no Instagram.
- Credenciais armazenadas somente como variaveis de ambiente.

## Variaveis no Render

Cadastre em **Environment** no servico do Raizes Kids:

```text
PUBLIC_BASE_URL=https://www.raizeskids.com
META_GRAPH_VERSION=<versao ativa informada pela Meta>
META_VERIFY_TOKEN=<token longo criado por voce>
META_APP_SECRET=<segredo do aplicativo Meta>
WHATSAPP_ACCESS_TOKEN=<token permanente do WhatsApp>
WHATSAPP_PHONE_NUMBER_ID=<id do numero>
INSTAGRAM_ACCESS_TOKEN=<token da conta profissional>
INSTAGRAM_ACCOUNT_ID=<id da conta profissional>
```

Nunca grave tokens no GitHub, em HTML ou JavaScript.

## Configuracao na Meta

1. Vincule o Instagram profissional a uma Pagina do Facebook e ao Meta Business.
2. Crie um aplicativo empresarial no Meta for Developers.
3. Adicione os produtos WhatsApp e Instagram.
4. Configure o callback como `https://www.raizeskids.com/api/meta/webhook`.
5. Use no campo de verificacao o mesmo valor de `META_VERIFY_TOKEN`.
6. Assine os eventos de mensagens das contas conectadas.
7. Gere tokens permanentes e salve-os apenas no Render.
8. Reinicie o servico e confira o menu **Controle > Automacoes**.
9. Ative primeiro uma plataforma por vez e realize testes com uma conta sua.

## Regras de operacao

- O contato pelo WhatsApp exige consentimento explicito.
- Mensagens iniciadas pela empresa fora da janela de atendimento exigem modelo aprovado.
- O comando ou pedido para parar deve ser respeitado imediatamente.
- Mantenha atendimento humano disponivel para pagamento, suporte e casos nao previstos.
- Ative respostas automaticas somente depois que o painel mostrar a conexao como configurada.

