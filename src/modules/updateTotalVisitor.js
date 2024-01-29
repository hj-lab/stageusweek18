var schedule = require('node-schedule-tz')
const redis = require("redis").createClient()
const conn = require("../config/database")
const { executeSQL } = require("./sql")

// 스케줄 규칙 설정 (매일 자정)
const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 0;
rule.second = 0;

// 테스트용 -> 20초마다 실행
// rule.second = [0, 20, 40]

// 스케줄 작업 설정
const updateTotalVisitor = schedule.scheduleJob(rule, async () => {
    try {
        await redis.connect()
        // Redis에서 todayVisitor 개수 가져오기
        const todayVisitorCount = await redis.sCard('todayVisitor');

        // total_visitor의 마지막행 + todayVisitorCount 한 값을 insert
        // COALESCE() null이 아닌 첫번째값 return
        const sql = `INSERT INTO visitor_schema.totalVisitor(total_visitor)
                     VALUES( (SELECT COALESCE(total_visitor,0) 
                              FROM visitor_schema.totalVisitor
                              ORDER BY total_visitor DESC LIMIT 1) + $1)`
        const value = [todayVisitorCount]
        await executeSQL(conn, sql, value)

        // Redis의 todayVisitor 초기화
        await redis.del('todayVisitor');

        console.log(`매일 자정에 작업이 수행되었습니다. todayVisitorCount: ${todayVisitorCount}`);
    } catch (e) {
        console.error('totalVisitor에서 에러 발생 : ', e);
        throw e;
    }
    finally{
        await redis.disconnect()
    }
});

module.exports = { updateTotalVisitor }