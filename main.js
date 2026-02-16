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
let p2_hp = 100;

// タイマー更新
function updateTime() {
    const now = new Date(Date.now() - startTime);     // 現在時刻 - 開始時刻
    const s = String(now.getSeconds()).padStart(2, '0');   // 1 → 01 にする
    const ms = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0');     // ミリ秒/10を整数化
    
    mainDisplay.textContent = `${s}.${ms}`; // タイムを表示
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
            document.getElementById("p2-hp").style.width = p2_hp + "%";     //体力のCSSに反映
        }
        else if (diff >= 0) {
            // 2pの攻撃
            damage = Number(DMcalc(1, gap, diff).toFixed(0));
            console.log("2p-attack:" + damage + "damage");
            p1_hp -= damage;
            if (p1_hp <= 0) judge(0);
            document.getElementById("p1-hp").style.width = p1_hp + "%";
        }
        else {
            // 引き分け
            damage = 0;
        }
    }
        
    // プレイヤー切り替え
    turn = (turn + 1) % 2;
});
// ダメージ計算式 (AI)
function DMcalc(attackerId, gap, diff) {
    // a: 攻撃側の5秒からの誤差 (絶対値)
    const a = Math.abs(gap[attackerId]);
    
    // 基本ダメージ: 誤差が0のとき最大30、誤差が1.0秒で10になる放物線
    // 式: 30 - (20 * 誤差)
    // 0.5秒の誤差なら 30 - 10 = 20ダメージ
    let baseDamage = 30 - (20 * a);

    // 最低ダメージ保証 (あまりにズレすぎても5ダメージは与える)
    if (baseDamage < 5) baseDamage = 5;

    // 精度差ボーナス (相手よりどれだけ優れていたか)
    // 最大+10ダメージのボーナスを加算
    const advantage = Math.abs(diff); 
    const bonus = Math.min(advantage * 10, 10); 

    return baseDamage + bonus;
}
// 勝敗判定
function judge(loserId) {
    document.getElementById(`${loserId}`).style.width = 0 + "%";
}