# Manual do Programador - Raizes Kids

Este projeto e uma aplicacao web simples em Node.js com frontend em HTML, CSS e JavaScript puro. O objetivo do sistema e organizar licoes biblicas infantis, trilhas em video, exportacao de e-book/PDF e gerenciamento de usuarios.

## Como Rodar

Requisitos:

- Node.js 20 ou superior
- Terminal aberto na pasta do projeto

Comandos principais:

```powershell
npm start
npm run check
```

O servidor local roda por padrao em:

```text
http://localhost:3000
```

## Estrutura dos Arquivos

```text
server.js                 Servidor Node.js, rotas, login, sessoes e usuarios
index.html                Pagina principal do visitante/usuario
gerenciamento.html        Area administrativa
login.html                Login, cadastro e recuperacao de senha
app.js                    Logica principal das licoes, trilhas, filtros e PDF
auth.js                   Logica de login, sessao, usuarios e admin
styles.css                Todo o visual do sistema
lessons-data.js           Base inicial de licoes
assets/                   Imagens do sistema
scripts/                  Scripts auxiliares de manutencao
data/users.json           Criado em runtime; guarda usuarios quando o servidor roda
```

## Fluxo Principal

### Visitante

O visitante consegue ver o catalogo, mas o conteudo completo aparece bloqueado. Isso e controlado em `app.js` por:

```js
catalogIsLimited()
```

Os cards mostram o acervo com cadeado para incentivar login/cadastro.

### Usuario Logado

Quando o usuario entra, `auth.js` consulta:

```text
GET /api/session
```

Se houver sessao valida, o corpo recebe a classe `is-authenticated`, liberando conteudos protegidos.

### Administrador

O administrador acessa:

```text
gerenciamento.html
```

Essa pagina e protegida no `server.js`. Se o usuario nao for admin, ele e redirecionado para o login.

## Autenticacao e Sessoes

O backend fica em `server.js`.

Rotas principais:

```text
POST /api/login
POST /api/logout
GET  /api/session
POST /api/register
POST /api/password-reset
GET  /api/admin/users
POST /api/admin/users/:id/approve
POST /api/admin/users/:id/deactivate
POST /api/admin/users/:id/activate
POST /api/admin/users/:id/password
```

### Bloqueio de senha compartilhada

O sistema permite apenas uma sessao ativa por usuario. Quando o mesmo usuario faz login em outro dispositivo, as sessoes anteriores sao encerradas.

Funcoes importantes:

```js
revokeUserSessions(userId)
getSessionState(req)
```

O frontend mostra aviso usando:

```js
showNotice(message, true)
```

## Licoes

As licoes ficam em `state.lessons`, carregadas a partir de:

```js
loadLessons()
```

A base inicial vem de:

```text
lessons-data.js
```

Depois que o usuario/admin altera licoes, elas ficam salvas no `localStorage` do navegador.

Campos principais de uma licao:

```js
{
  id,
  createdAt,
  title,
  category,
  age,
  verse,
  activityImage,
  sections
}
```

### Data de inclusao

Toda licao tem `createdAt`. Licoes antigas recebem uma data padrao pela funcao:

```js
normalizeLessonDates(lessons)
```

Ao editar uma licao, a data original e preservada. Ao criar nova licao, a data atual e gravada.

O filtro por mes/ano fica no gerenciamento:

```html
<input id="createdMonthFilter" type="month" />
```

## Gerenciamento de Licoes

A lista administrativa e renderizada por:

```js
renderLessonAdminList()
```

Ela permite selecionar uma licao existente e carregar no formulario com:

```js
loadIntoForm(lesson)
```

Salvar licao:

```js
saveFromForm(event)
```

Excluir licao:

```js
deleteCurrentLesson()
```

## Trilha de Videos

As trilhas usam videos cadastrados manualmente e videos encontrados dentro das licoes.

Funcoes principais:

```js
renderTrails()
renderTrailCard(video)
extractLessonVideos(lesson)
getYouTubeId(url)
```

Quando uma licao possui links do YouTube no texto, o sistema cria players pequenos logo abaixo de cada link dentro da propria licao.

Essa renderizacao acontece em:

```js
renderLessonTextWithPlayers(text)
buildInlineLessonVideo(youtubeId)
```

No PDF, esses players sao ocultados por CSS:

```css
@media print {
  .lesson-inline-video {
    display: none !important;
  }
}
```

## Exportacao de E-book/PDF

A exportacao do livro acontece em:

```js
printEbook()
buildEbookHtml(lessons)
buildEbookLessonHtml(lesson, number)
```

Antes de imprimir, o sistema aguarda as imagens carregarem:

```js
waitForEbookLayout()
```

O CSS definitivo da impressao fica em `styles.css`, dentro de blocos `@media print`.

## Layout e Mobile

O visual inteiro fica em:

```text
styles.css
```

Pontos sensiveis:

- `.lesson-list`: barra horizontal de licoes
- `#studyView #lessonList`: trilho horizontal dos cards
- `.lesson-card`: card de cada licao
- `.trail-rail`: trilho horizontal das trilhas
- `.lesson-reader`: area de leitura da licao
- `.lesson-inline-video`: player pequeno dentro da licao

### Barra horizontal de licoes

Foi criada para facilitar o uso em celular. Ela mostra 4 cards por vez e permite avancar pelas setas.

HTML:

```html
data-lesson-rail-prev
data-lesson-rail-next
```

JavaScript:

```js
scrollToLessonRail()
```

CSS:

```css
#studyView #lessonList
#studyView .lesson-card
#studyView .lesson-cover
```

## Usuarios

Usuarios sao armazenados em:

```text
data/users.json
```

Esse arquivo e criado automaticamente em runtime pelo `server.js`.

Estados importantes:

```js
approved: true | false
active: true | false
role: "admin" | "user"
```

O administrador pode:

- Aprovar usuario
- Desativar usuario
- Reativar usuario
- Redefinir senha

## Como Ampliar Futuramente

Ideias de evolucao:

1. Banco de dados real
   - Hoje usuarios ficam em JSON e licoes ficam no navegador.
   - Futuro: SQLite, PostgreSQL ou MongoDB.

2. Licoes no servidor
   - Criar rotas `/api/lessons`.
   - Salvar licoes em banco.
   - Permitir que todos os admins vejam os mesmos dados.

3. Historico de pagamentos
   - Adicionar campos `subscriptionStatus`, `paidUntil`, `paymentNotes`.
   - Automatizar desativacao por atraso.

4. Perfis de acesso
   - Admin geral
   - Lider
   - Discipulador
   - Visitante

5. Auditoria
   - Registrar quem criou/editou/excluiu licoes.
   - Registrar logins e tentativas bloqueadas.

6. Upload de imagens no servidor
   - Hoje imagens de atividade ficam no navegador como base64.
   - Futuro: salvar arquivos em storage.

7. Biblioteca por calendario
   - Usar `createdAt`, categorias e datas especiais para montar planejamento mensal.

8. Melhorias no PDF
   - Capa por tema.
   - Sumario com pagina.
   - Versao para impressao economica.

## Cuidados ao Alterar

- Sempre rode:

```powershell
npm run check
```

- Nao remova `createdAt` das licoes.
- Nao coloque autoplay em videos.
- Nao exiba players no PDF.
- Preserve o comportamento de visitante bloqueado.
- Ao mexer em login/sessao, teste admin e usuario comum.
- Ao mexer no CSS mobile, confira a barra horizontal de licoes e trilhas.

## Deploy

O deploy atual e feito pelo Render a partir do branch:

```text
main
```

Fluxo comum:

```powershell
git status
npm run check
git add .
git commit -m "Mensagem"
git push origin main
```

Depois do push, aguarde o Render publicar e valide:

```text
https://raizes-fic9.onrender.com
```
