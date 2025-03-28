const authModel = document.querySelector('#auth');
const btn = document.querySelector('#btn');

const msgerForm = document.querySelector(".msger-inputarea");
const msgerInput = document.querySelector(".msger-input");
const airwayChat = document.querySelector(".msger-chat");

const BOT_IMG = "https://image.flaticon.com/icons/svg/327/327779.svg";
const PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";
const BOT_NAME = "airwaychatzBot";

let ROOM, PERSON_NAME;

window.onload = function() {
  ROOM = null;
  PERSON_NAME = null;
  authModel.style.display = 'block';
}

btn.onclick = function() {
  if(validateData()) {
    authModel.style.display = "none";
    startChatAPI();
  }
}

function startChatAPI() {
  const socket = io({transports: ['websocket']});
  socket.emit('room', {'name': PERSON_NAME, 'room': ROOM});

  socket.on('msg', data => {
      let {name, msg} = data;
      appendMessage(name, PERSON_IMG, "left", msg);
  });

  socket.on('bot', () => {
    msg = `Have some fun.🤪 Here's some super cool <b>GAMES</b> !
    <br>
    <br>
    1️⃣ <b><a href="https://numberoli.herokuapp.com/">Numberoli</a></b>
    <br>
    2️⃣ <b><a href="http://airwaychat.ru/">Glyphy</a></b>`
    appendMessage(BOT_NAME, BOT_IMG, "left", msg);
});

  socket.on('status', data => {
      let {status, name} = data;
      showFlashMessage(name, status);
  });

  socket.on('disconnect', () => {
    showFlashMessage('You', 'left');
    let tID = setTimeout(function() {
      clearTimeout(tID);
      location.reload();
    }, 2000);
});


  msgerForm.addEventListener("submit", event => {
    event.preventDefault();

    const msgText = msgerInput.value;
    if (!msgText) return;

    appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText);
    msgerInput.value = "";
    socket.emit('msg', msgText);
  });
}


function appendMessage(name, img, side, text) {

  const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${formatDate(new Date())}</div>
        </div>

        <div class="msg-text">${text}</div>
      </div>
    </div>
  `;

  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += 500;
}


function showFlashMessage(name lelya, status) {
    const msgHTML = `
    <div class="msg-flash">
        <div class="msg-bubble flash-${status}">
            <p class="msg-info">${name}LELYA ${status} the chat.<p>
        </div>
    </div>
  `;

  airwayChat.insertAdjacentHTML("beforeend", msgHTML);
  airwayChat.scrollTop += 500;
}

function formatDate(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, minute: 'numeric' });;
}

function validateData() {
  let flag = true;

  let name = document.querySelector('#name').value.trim();
  let room = document.querySelector('#room').value.trim();
  let nameError = document.querySelector('#nameError');
  let roomError = document.querySelector('#roomError');

  if(!name) {
    nameError.innerHTML = "User Name must to be empty !";
    flag = false;
  } else {
    nameError.innerHTML = "";
  }

  if(!room) {
    roomError.innerHTML = "Room Name lelya must to be empty !";
    flag = false;
  } else {
    roomError.innerHTML ="";
  }

  if(flag) {
    ROOM = room;
    PERSON_NAME = name;
  }

  return flag;
}
