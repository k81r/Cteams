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

// ダメージ計算式
function DMcalc (attackerIdx, gap, diff) {
    const a = Math.abs(gap[attackerIdx]);
    
    let baseDamage = 40 * Math.pow(0.78, a);

    const advantage = Math.abs(diff);
    const multiplier = 1 + (Math.min(advantage, 2.0) * 0.25);

    const finalDamage = baseDamage * multiplier * 0.7;

    // 最低ダメージを 5 に設定
    return Math.max(5, finalDamage);
}

// 勝敗判定
function judge(loserId) {
    if(loserId == -1) return;
    document.getElementById(`p${++loserId}-hp`).style.width = 0 + "%";
    if(loserId==1){
        document.querySelector('#comment1').textContent = "WINNER";
        document.querySelector('#comment2').textContent = localStorage.getItem("player2");
    } else {
        document.querySelector('#comment1').textContent = "WINNER";
        document.querySelector('#comment2').textContent = localStorage.getItem("player1");
    }
    document.getElementById("goal-time").textContent = "K.O";
    center = document.getElementById('center');
    center.innerHTML = '<input id="restart" class="btn" type="button" value="もう一戦"><a href="../gameTop/index.html"><input id="quit" class="btn" type="button" value="やめる"></a>';
    restart.addEventListener('click', () => {location.reload()});   //ページを再読み込み
}

//name
window.addEventListener("DOMContentLoaded", () => {

    const player1Name = localStorage.getItem("player1") || "player1";
    const player2Name = localStorage.getItem("player2") || "player2";

    const p1name = document.getElementById("p1name");
    const p2name = document.getElementById("p2name");

    if (p1name) p1name.textContent = player1Name;
    if (p2name) p2name.textContent = player2Name;
});

document.addEventListener("DOMContentLoaded", function(){
    // topから選択した写真を取得
    const p1NameData = localStorage.getItem("player1") || "PLAYER 1";
    const p2NameData = localStorage.getItem("player2") || "PLAYER 2";
    const p1ImgKey = localStorage.getItem("player1Img") || "player1";
    const p2ImgKey = localStorage.getItem("player2Img") || "player2";
    // 名前・写真書き換え
    const p1nameDisp = document.getElementById("p1name");
    const p2nameDisp = document.getElementById("p2name");
    const p1charImgDisp = document.getElementById("p1-char-img");
    const p2charImgDisp = document.getElementById("p2-char-img");
    // 名前の反映
    if (p1nameDisp) p1nameDisp.textContent = p1NameData;
    if (p2nameDisp) p2nameDisp.textContent = p2NameData;
    // 名前の反映
    if (p1nameDisp) p1nameDisp.textContent = p1NameData;
    if (p2nameDisp) p2nameDisp.textContent = p2NameData;
    // 画像の組み立て➡反映
    if (p1charImgDisp) p1charImgDisp.src = "../img/" + p1ImgKey + ".png";
    if (p2charImgDisp) p2charImgDisp.src = "../img/" + p2ImgKey + ".png";
});

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
            
            setTimeout(() => {
                document.getElementById("p2-hp").style.width = p2_hp + "%"; 
            }, 500); //体力のCSSに反映
            document.querySelector('#comment1').textContent = localStorage.getItem("player1") + "の攻撃！";
            document.querySelector('#comment2').textContent = localStorage.getItem("player2") + "に" + damage + "ダメージ！";
            
            judgeIdx = 1;
        }
        else if (diff >= 0) {
            // 2pの攻撃
            damage = Number(DMcalc(1, gap, diff).toFixed(0));
            console.log("2p-attack:" + damage + "damage");
            p1_hp -= damage;
            
            setTimeout(() => {
                document.getElementById("p1-hp").style.width = p1_hp + "%";
            }, 500);
            document.querySelector('#comment1').textContent = localStorage.getItem("player2") + "の攻撃！";
            document.querySelector('#comment2').textContent = localStorage.getItem("player1") + "に" + damage + "ダメージ！";
            
            judgeIdx = 0;
        }
        else {
            // 引き分け
            damage = 0;
        }

        // 勝敗数を記録する変数
        window.p1_wins = window.p1_wins || 0;
        window.p2_wins = window.p2_wins || 0;

        //　1PのHPが0になった場合（2Pがラウンド勝利）
        if(p1_hp <= 0) {
            document.querySelector('#comment2').textContent = localStorage.getItem("player1") + "を倒した！";
            setTimeout(() => {
                document.getElementById("p1-hp").style.width = 0 + "%";
            }, 500);
            window.p2_wins++; // 2Pに1勝プラス

            //2勝の判定
            if (window.p2_wins >= 2) {
                judge(0); // 1Pが負けた(0)としてゲーム終了処理へ
            } else {
                // 次のラウンド　HPをリセット
                setTimeout(() => {
                    p1_hp = 100;
                    p2_hp = 100;
                    document.getElementById("p1-hp").style.width = "100%";
                    document.getElementById("p2-hp").style.width = "100%";
                    
                    document.querySelector('#comment1').textContent = "ROUND " + (window.p1_wins + window.p2_wins + 1);
                    document.querySelector('#comment2').textContent = `1P: ${window.p1_wins}勝 / 2P: ${window.p2_wins}勝`;
                }, 3000);
            }
        } 
        //2PのHPが0になった場合（1Pがラウンド勝利）
        else if(p2_hp <= 0) {
            document.querySelector('#comment2').textContent = localStorage.getItem("player2") + "を倒した！";
            setTimeout(() => {
                document.getElementById("p2-hp").style.width = 0 + "%";
            }, 500);
            window.p1_wins++; // 1Pに1勝プラス

            // 2勝の判定
            if (window.p1_wins >= 2) {
                judge(1); // 2Pが負けた(1)としてゲーム終了処理へ
            } else {
                // 次のラウンド　HPをリセット
                setTimeout(() => {
                    p1_hp = 100;
                    p2_hp = 100;
                    document.getElementById("p1-hp").style.width = "100%";
                    document.getElementById("p2-hp").style.width = "100%";
                    
                    document.querySelector('#comment1').textContent = "ROUND " + (window.p1_wins + window.p2_wins + 1);
                    document.querySelector('#comment2').textContent = `1P: ${window.p1_wins}勝 / 2P: ${window.p2_wins}勝`;
                }, 3000);
            }
        }
        
        judgeIdx = -1;
    }
        
    // プレイヤー切り替え
    turn = (turn + 1) % 2;
    mainDisplay.classList.remove("hidden-timer"); // タイマーを表示状態に戻す
});

