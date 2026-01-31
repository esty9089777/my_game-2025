const body = document.body;
body.style.margin = '0';
body.style.direction = 'rtl';
body.style.fontFamily = 'Arial, sans-serif';
body.style.overflow = 'hidden';

const game = document.querySelector('.game');
const panda = document.getElementById('panda');
const dekel = document.getElementById('dekel');
const gameOverText = document.getElementById('game-over');

const obstacles = [];
let gameInterval;
let isJumping = false;
let coins = 0;
let spd = 8; //מהירות
let amoutDekel = 5;
let level = 1;
let coinsTimerId = null;
let record = 0;
const username = localStorage.getItem("username");
let recordKey = "record";

if (username) 
{
    recordKey = "record_" + username;
    if (localStorage.getItem(recordKey)) 
    {
        record = parseInt(localStorage.getItem(recordKey));
        document.getElementById("record_value").innerHTML = record;
    }
}

//שמירת השיא באחסון מקומי של דפדפן
//if (localStorage.getItem("record")) {
  //  record = parseInt(localStorage.getItem("record"));
  //  document.getElementById("record").innerHTML = record;
//}

//ניקוד
function startGameTimerCoins()
{
    const timer = document.getElementById("score_value");
    coinsTimerId = setInterval(()=>
    {
        coins++;
            if (coins % 20 == 0 && coins != 0) 
    {
            amoutDekel+=3;
            level++;
            document.getElementById("level_value").innerHTML = level;
    }
        timer.textContent = coins;
    },1000)
}

//פונקציה ליצירת מוקש בודד
function createSingleObstacle(speedRange) {
    const xStart = 0;
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    obstacle.style.backgroundImage = "url('מכשול.png')";
    obstacle.style.backgroundSize = 'contain';
    obstacle.style.backgroundRepeat = 'no-repeat';
    //obstacle.style.backgroundPosition = 'center bottom';
    obstacle.style.width = '2%';
    obstacle.style.height = '25%';
    obstacle.style.position = 'absolute';
    obstacle.style.bottom = '-100px';
    obstacle.style.left = xStart + 'px';
    obstacle.x = xStart;

    game.appendChild(obstacle);
    const obstacleObj = {
        element: obstacle,
        speed: speedRange,
        type: 'dekel',
        image: 'מכשול.png',
        x: xStart,
    };
    //מוסיף למערך את obstacle
    obstacles.push(obstacleObj);
    console.log(`🌴 נוצר מוקש חדש! סך הכל: ${obstacles.length}`);
    return obstacleObj
}

// פונקציה ליצירת מספר מוקשים
function createRandomObstacles(count) {
    const minSpacing = 350;
    const maxSpacing = 900;
    let currentX = window.innerWidth + 50;

    document.getElementById("score_value").innerHTML = coins;
    console.log(`🎯 יוצר ${count} מוקשים...`);

    for (let i = 0; i < count; i++) {
        // העלאת מהירות כל 20 מטבעות
        if (coins % 20 === 0 && coins !== 0) {
            spd += 3;
        }

        const newObstacle = createSingleObstacle(spd);
        document.body.appendChild(newObstacle.element);

        // חישוב רוחב המוקש הנוכחי לאחר ההוספה ל-DOM
        const obstacleWidth = newObstacle.element.offsetWidth;

        // יצירת מרווח אקראי בין מוקשים
        const spacing = Math.floor(Math.random() * (maxSpacing - minSpacing + 1)) + minSpacing;

        // קביעת מיקום המוקש הנוכחי
        newObstacle.x = currentX;
        newObstacle.element.style.left = newObstacle.x + "px";

        // שמירת המוקש במערך
        obstacles.push(newObstacle);

        // עדכון currentX למיקום הבא בהתחשב ברוחב המוקש + רווח
        currentX = newObstacle.x + obstacleWidth + spacing;

        // הדפסת המידע
        if (i > 0) {
            const prev = obstacles[obstacles.length - 2];
            const prevRightEdge = prev.x + prev.element.offsetWidth;
            const actualSpacing = newObstacle.x - prevRightEdge;
            console.log(`📏 רווח בפועל בין מוקש ${i - 1} ל־${i}: ${actualSpacing}px`);
        }
    }

    console.log(`✅ נוצרו ${count} מוקשים! סך הכל: ${obstacles.length}`);
}


//תזוזת הדקל
function moveDekel() {
    //let dekelMove = -100;
    //dekel.style.left = dekelMove + 'px';
    gameInterval = setInterval(() => {
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obstacle12 = obstacles[i];
            // הזז את המוקש
            obstacle12.x += obstacle12.speed;
            obstacle12.element.style.left = obstacle12.x + 'px';
            //בדיקת התנגשות
            if (check(obstacle12)) 
            {
                endGame();
                return;
            }
            //הסרת מוקש-דקל שיצא מהמסך
            if (obstacle12.x > window.innerWidth + 150) {
                obstacle12.element.parentNode.removeChild(obstacle12.element);
                obstacles.splice(i, 1);
                console.log(`🗑️ מוקש הוסר. נותרו: ${obstacles.length}`);
            }
        }
        if (Math.random() < 0.005) {
            createSingleObstacle(5)
        }
    }, 30);
}
function check(obstacle) {
    // בדיקת התנגשות
    const pandaTop = panda.offsetTop;
    const pandaLeft = panda.offsetLeft;
    const dekelTop = obstacle.element.offsetTop;
    const dekelLeft = obstacle.element.offsetLeft;
    const pandaWidth = panda.offsetWidth;
    const dekelWidth = obstacle.element.offsetWidth;

    const pandaHeight = panda.offsetHeight;
    const dekelHeight = obstacle.element.offsetHeight;
    const distance = pandaLeft - (dekelLeft + dekelWidth);
    if (pandaTop + pandaHeight > dekelTop &&
        pandaLeft - (dekelLeft + dekelWidth) < -20 &&
        0 > dekelLeft - (pandaLeft + pandaWidth) + 20) 
    {
        console.log(`
                🐼 Panda: (${pandaLeft}, ${pandaTop}) size: ${pandaWidth}x${pandaHeight}
                🌴 Dekel: (${dekelLeft}, ${dekelTop}) size: ${dekelWidth}x${dekelHeight}
                📏 Distance: ${Math.abs(pandaLeft - dekelLeft)}px`);
                if(coins > record)
                {
                    record = coins;
                    localStorage.setItem(recordKey, record);
                    document.getElementById("record_value").innerHTML = record;
                }
        gameOverText.style.display = 'block';
        clearInterval(gameInterval);
        document.removeEventListener("keydown", jumpHandler);
        return true;
    }
    return false;
}


//const distance = pandaLeft - (dekelLeft + dekelWidth);
// if(dekelTop - pandaTop < 40 &&
// dekelLeft + dekelWidth > pandaLeft &&
//dekelLeft < pandaLeft + pandaWidth )  

const restartButton1 = document.getElementById('restartBtn');
//סיום המשחק
function endGame() {
    console.log("💀 המשחק נגמר!")
    restartButton1.style.display = 'block';
    restartButton1.style.width = '250px';
    restartButton1.style.height = '60px';
    restartButton1.style.borderRadius = '10px';
    restartButton1.style.position = 'fixed';      // או 'absolute' לפי הצורך
restartButton1.style.bottom = '25px';         // מרחק 20 פיקסלים מהתחתית
restartButton1.style.left = '75%';             // מיקום אופקי באמצע
restartButton1.style.transform = 'translateX(-75%)';

    spd=4;
    amoutDekel = 5;
    if (gameInterval) {
        clearInterval(gameInterval)
        gameInterval = null;
    }
    if(coinsTimerId)
    {
        clearInterval(coinsTimerId)
        coinsTimerId = null;
    }
    if (gameOverText) {
        gameOverText.style.display = "block";
    }
    document.removeEventListener("keydown", jumpHandler)
}
// קפיצה
function jumpHandler(e) {
    if ((e.code == 'Space' || e.key === 'ArrowUp') && !isJumping) {
        isJumping = true;
        panda.style.backgroundImage = "url('קופץ.png')";
        panda.style.transition = 'bottom 0.3s ease-out'; // אנימציה חלקה
        panda.style.bottom = '550px';
        let current = parseInt(panda.style.left);
        current -=10;
        panda.style.left = current + 'px';
        setTimeout(() => {
            panda.style.transition = 'bottom 0.3s ease-in'; // נפילה מהירה יותר
            panda.style.bottom = '25px';
            setTimeout(() => {
                panda.style.backgroundImage = "url('123.png')";
                isJumping = false; // אפשר קפיצה חדשה
            }, 350);
        }, 450);
    }
}

const restartButton = document.getElementById('restartBtn');
if (restartButton) {
restartButton.addEventListener('click', () => {
  startGame();
});
}
//התחלת המשחק
function startGame() 
{
    console.log("🎮 מתחיל את המשחק...")

    if (restartButton1) {
    restartButton1.style.display = 'none';
    }
    // עצירת אינטרוולים קיימים
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    if (coinsTimerId) {
        clearInterval(coinsTimerId);
        coinsTimerId = null;
    }

    // הסרת טקסט סיום משחק
    if (gameOverText) {
    gameOverText.style.display = "none";
    }

    // איפוס משתנים
    coins = 0;
    amoutDekel = 5;
    spd = 6;
    level = 1;
    const scoreValueElement = document.getElementById("score_value");
if (scoreValueElement) { // Check if the element exists
    scoreValueElement.textContent = coins;
}

const levelValueElement = document.getElementById("level_value");
if (levelValueElement) { // Check if the element exists
    levelValueElement.textContent = level;
}

    // איפוס מיקום הפנדה
    panda.style.bottom = '25px';  // או כל מיקום התחלתי
    panda.style.left = '50px';    // או כל מיקום התחלתי
    panda.style.backgroundImage = "url('123.png')";
    isJumping = false;

    //document.addEventListener("keydown", jumpHandler);

    // הסרת מכשולים קיימים מה-DOM ומהמערך
    obstacles.forEach(obstacleObj => {
        if (obstacleObj.element && obstacleObj.element.parentNode) {
            obstacleObj.element.parentNode.removeChild(obstacleObj.element);
        }
    });
    document.getElementById("score_value").textContent = 0;
    startGameTimerCoins();
    moveDekel();
    obstacles.forEach((obstacleObj) => {
        if (obstacleObj.element && obstacleObj.element.parentNode) {
            document.body.removeChild(obstacleObj.element);
        }
    })
    obstacles.length = 0;

}
if (document.querySelector('.game-container')) {
document.addEventListener("keydown", jumpHandler);
startGame();
}

//מפה JS של homepage
let isLogin = false;
function chooseMode(mode)
   {
    const myDiv = document.getElementById("myDiv");
    myDiv.innerHTML = '';

        const buttonsDiv1 = document.getElementById("btn1");
        const buttonsDiv2 = document.getElementById("btn2");
        buttonsDiv1.style.display = "none";
        buttonsDiv2.style.display = "none";

        const firstName = document.createElement('input');
        firstName.type = 'text';
        firstName.id = 'first';
        firstName.style.width = '250px';
        firstName.style.height = '60px'
        firstName.style.width = '250px';
        firstName.style.borderRadius = '10px'
        firstName.style.margin = '15px'
        firstName.placeholder = 'הכנס שם פרטי';
        myDiv.appendChild(firstName);

        const lastName = document.createElement('input');
        lastName.type = 'text';
        lastName.id = 'last';
        lastName.style.width = '250px';
        lastName.style.height = '60px'
        lastName.style.borderRadius = '10px'
        lastName.style.margin = '15px'
        lastName.placeholder = 'הכנס שם משפחה';
        myDiv.appendChild(document.createElement('br'));
        myDiv.appendChild(lastName);

            const password = document.createElement('input');
            password.type = 'password';
            password.id = 'id';
            password.style.width = '250px';
            password.style.height = '60px'
            password.style.borderRadius = '10px'
            password.style.margin = '15px'
            myDiv.appendChild(document.createElement('br'));
            myDiv.appendChild(password);

        if(mode === 'signUp')
        {
            password.placeholder ='בחר סיסמה';
        }
        else{
 password.placeholder = 'הקש סיסמה';
        }
    
        const ok = document.createElement('input');
        ok.type = 'button';
        ok.onclick=saveName;
        ok.style.width = '250px';
        ok.style.height = '60px';
        ok.style.borderRadius = '10px'
        ok.style.margin = '15px';
        ok.value = 'לחץ כדי להתחיל לשחק';
        myDiv.appendChild(document.createElement('br'));
        myDiv.appendChild(ok);

         //isLogin = (mode === 'login');
        ok.onclick = () => saveName(mode);
        
   }


    function saveName(isLogin)
    {
       const fname = document.getElementById("first").value.trim();
       const lname = document.getElementById("last").value.trim();
      const passwordInput = document.getElementById("id"); // קלט הסיסמה (אם קיים)
       const password = passwordInput ? passwordInput.value.trim() : '';
       if (fname && lname) 
       {
            const fullName = fname + " " + lname;
        const users = JSON.parse(localStorage.getItem("users")) || [];

        if (isLogin === 'login') 
        {
            const user = users.find(u => u.fullName === fullName && u.password === password);
            // התחברות: לבדוק אם קיים
            if (user) 
            {
                localStorage.setItem("username", fullName);
                window.location.href = "game.html";
            } 
            else 
            {
                alert("משתמש לא קיים! נא להירשם קודם.");
                window.location.href = 'homepage1.html'
            }
        } 
        else //if (modeString === 'signUp')
        {
            const existing = users.find(u => u.fullName === fullName);
            // הרשמה: להוסיף לרשימה
            if (existing) 
            {
                alert("משתמש כבר קיים. נא להתחבר במקום להירשם.");
                window.location.href = 'homepage1.html'
            }
            else{
                users.push({ fullName, password });
                localStorage.setItem("users", JSON.stringify(users));
                localStorage.setItem("username", fullName);
                window.location.href = "game.html";
            }
        }
        } 
        isLogin=false;
    }
    window.onload = function() {
    const fullName = localStorage.getItem("username");
    if (fullName) {
        document.getElementById("hi").textContent = "שלום " + fullName;
    }
};
