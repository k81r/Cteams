// DOM取得
const startBtn = document.getElementById("startbtn");
const stopBtn = document.getElementById("stopbtn");
const mainDisplay = document.getElementById("stopwatch");
const player = [ document.getElementById("p1time"), document.getElementById("p2time") ];

let startTime;
let timerId;
let turn = 0;   // 0 => 1p, 1 => 2p
let gap = [ 0, 0 ];   // 5秒との時間差を入れる用
let p1_hp = 100;
let p2_hp = 1;

// タイマー更新
function updateTime() {
    const elapsedMs = Date.now() - startTime; // 経過ミリ秒
    const now = new Date(elapsedMs);
    const s = String(now.getSeconds()).padStart(2, '0');
    const ms = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0');
    
    mainDisplay.textContent = `${s}.${ms}`;

    // 2000ミリ秒（2秒）を過ぎたら hidden-timer クラスをつける
    if (elapsedMs > 2000) {
        mainDisplay.classList.add("hidden-timer");
    } else {
        // 2秒以下のときは見えるようにしておく（リスタート時用）
        mainDisplay.classList.remove("hidden-timer");
    }
}

// スタートボタン
startBtn.addEventListener('click', () => {
    startBtn.disabled = true;   // スタートボタン潰す
    stopBtn.disabled = false;   // ストップボタン解禁
    startTime = Date.now();
    timerId = setInterval(updateTime, 10);    // 10ミリ秒ごとにupdateTimeを実行
});

// ストップボタン
stopBtn.addEventListener('click', () => {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    clearInterval(timerId);     // setIntervalを止める
    
    // タイムを記録
    const record = mainDisplay.textContent;
    player[turn].textContent = record;


    // ５秒との差の小数点第三位を四捨五入した値を格納
    gap[turn] = Number((record - 5).toFixed(2));

    // 確認用console.log
    console.log(turn + 1 + "p-side time:"+ record + " gap:" + gap[turn]);

    // ダメージ算出
    let damage;
    if (turn == 1) {
        diff = Math.abs(gap[0]) - Math.abs(gap[1]);     // どっちの攻撃かを正負で判断
        if (diff <= 0) {
            // 1pの攻撃
            damage = Number(DMcalc(0, gap, diff).toFixed(0));   // DMcalc関数の戻り値の小数点第一位を四捨五入
            console.log("1p-attack:" + damage + "damage");    //確認用
            p2_hp -= damage;
            if (p2_hp <= 0) judge(1);
            setTimeout(() => {
                document.getElementById("p2-hp").style.width = p2_hp + "%"; 
            }, 500); //体力のCSSに反映
            document.querySelector('#comment').textContent = "1Pの攻撃！";
        }
        else if (diff >= 0) {
            // 2pの攻撃
            damage = Number(DMcalc(1, gap, diff).toFixed(0));
            console.log("2p-attack:" + damage + "damage");
            p1_hp -= damage;
            if (p1_hp <= 0) judge(0);
            setTimeout(() => {
                document.getElementById("p1-hp").style.width = p1_hp + "%";
            }, 500);
            document.querySelector('#comment').textContent = "2Pの攻撃！";
        }
        else {
            // 引き分け
            damage = 0;
        }
    }
        
    // プレイヤー切り替え
    turn = (turn + 1) % 2;
    mainDisplay.classList.remove("hidden-timer"); // タイマーを表示状態に戻す
});
// ダメージ計算式
function DMcalc(attackerId, gap, diff) {
    const time = Math.abs(gap[attackerId]);
    const opponentError = Math.abs(gap[1 - attackerId]);
    let damage = 0;
    // ダメージテーブル
    if (time === 0) {
        damage = 80;
    } 
    else if (time <= 0.01) {
        damage = 50;
    } 
    else if (time <= 0.05) {
        damage = 20;
    } 
    else if (time <= 1.00) {
        damage = 15;
    } 
    else {
        damage = 5;
    }
    if (Math.abs(time - opponentError) <= 0.01 && time > 0) {
        return 0;
    }
    return damage;
}
// 勝敗判定
function judge(loserId) {
    document.getElementById(`p${++loserId}-hp`).style.width = 0 + "%";
    document.getElementById("goal-time").textContent = "K.O";
    center = document.getElementById('center');
    center.innerHTML = '<input id="restart" class="btn" type="button" value="もう一戦"><a href="top.html"><input id="quit" class="btn" type="button" value="やめる"></a>';
    restart.addEventListener('click', () => {location.reload()});   //ページを再読み込み

}