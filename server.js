// Expressサーバーパッケージを読み込み
const { response } = require('express')
const express = require('express')
// 同じフォルダにあるfunctions.jsを読み込み
const func = require('./functions')

// Expressサーバー使用準備
const app = express()

// 静的ファイル配信設定(/style.cssなど)
app.use(express.static('public'))

// テンプレートエンジン設定
app.set('view engine', 'ejs')

// テンプレート内で使用する関数の登録
app.locals.convertDateFormat = func.convertDateFormat

// POSTリクエストのパラメータを取得するための設定
app.use(express.urlencoded({ extended: false }))

// ルーティング設定
app.get('/blog/', (request, response) => {
  // ブログ記事ファイル一覧取得
  const files = func.getEntryFiles()
  // メインコンテンツに表示するブログ記事
  const entries = func.getEntries(files)

  // サイドバーに表示する年月別記事リスト
  const sideList = func.getSideList(entries)

  // ページに応じた記事一覧に絞る(1ページ5件)
  const entriesPerPage = 5
  const currentPage = parseInt(request.query.page || 1, 10)
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const displayEntries = entries.slice(startIndex, endIndex)
  const lastPage = Math.ceil(entries.length / entriesPerPage)
  // テンプレートを使用して出力したHTMLをクライアントに送信
  response.render('blog', {
    entries: displayEntries,
    sideList,
    currentPage,
    lastPage,
  })
})

app.get('/blog/:date', (request, response) => {
  // ブログ記事ファイル一覧取得
  const files = func.getEntryFiles()
  // メインコンテンツに表示するブログ記事
  const entries = func.getEntries(files)
  // サイドバーに表示する年月別記事リスト
  const sideList = func.getSideList(entries)

  // ブログ記事を取得してテンプレートに渡して出力したHTMLをクライアントに送信
  const entry = func.fileNameToEntry(request.params.date + '.txt', false)
  response.render('entry', {
    entry,
    sideList,
  })
})

app.get('/admin/', (request, response) => {
  // ブログ記事ファイル一覧取得
  const files = func.getEntryFiles()
  // メインコンテンツに表示するブログ記事
  const entries = func.getEntries(files)

  response.render('admin', { entries, hasTodaysEntry: files.indexOf(func.getDateString() + '.txt') !== -1 })
})

app.get('/admin/edit', (request, response) => {
  // 新規投稿の場合は記事投稿ページの内容はすべて空(dateは自動設定)
  let entry = {
    date: func.getDateString(),
    title: '',
    content: '',
  }
  let pageTitle = '記事の新規投稿'

  // dateパラメータありの場合は記事の編集なので該当の記事データを取得してセットする
  if (request.query.date) {
    entry = func.fileNameToEntry(request.query.date + '.txt', false)
    pageTitle = '記事の編集(' + func.convertDateFormat(entry.date) + ')'
  }
  response.render('edit', {
    entry,
    pageTitle,
  })
})

app.post('/admin/post_entry', (request, response) => {
  func.saveEntry(request.body.date, request.body.title, request.body.content)
  response.redirect('/admin/')
})

// Expressサーバー起動
const server = app.listen(15864, () => {
  console.log('Listening on http://127.0.0.1:' + server.address().port + '/')
})

// Expressで処理される前の通信生データを表示
/*
server.on('connection', (socket) => {
  socket.on('data', (data) => {
    console.log(data.toString())
  })
})
*/
