const express = require("express");
const app = express();
const port = 8002;

app.use(express.json());

// .env
require('dotenv').config()

// 매일 자정에 실행되는 RDB
require("./src/modules/updateTotalVisitor")

// error handler 미들웨어
app.use((err, req, res, next) => {
    // 내가 보낸 에러 statusCode가 있으면 그거 사용하고 없다면 500(서버 내부 오류) 사용하겠다
    res.status(err.statusCode || 500).json({ error: err.message });
    // 에러 로깅용 (mongodb.js -> loggingmiddleware로 전달)
    res.locals.error = err;
});

// 웹서버
app.listen(port, () => {
    console.log(`assignMent 파일의 ${port}번에서 서버 실행`)
})