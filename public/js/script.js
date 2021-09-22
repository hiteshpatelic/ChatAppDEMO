let reciverName = "", lastAPIcall , roomName ="", roomID, lastGroupAPIcall ;
var getChatContainer,userName,roomId;
const getUserList = document.getElementsByClassName("chatList")
const getGroupList = document.getElementsByClassName("roomList")
const chatContainer = document.getElementsByClassName('chat')[0];

const getLastClickedNode = []
for(let i=0; i<getUserList.length; i++){
    getUserList[i].addEventListener('click',(e)=>{
        console.log('cALLED ROOM', roomID);
        if(roomID){
            socket.emit('leaveGroupRoom', roomID);
            getLastClickedRoom.classList.remove('activeUser')
        }
        reciverName=getUserList[i].children[0].innerHTML
        if(getLastClickedNode[0] === undefined){
            getLastClickedNode.push(getUserList[i])
        }else{
            getLastClickedNode[0].classList.remove('activeUser')
            getLastClickedNode.pop()
            getLastClickedNode.push(getUserList[i])
        }

        getLastClickedNode[0].classList.add('activeUser')
        if(getLastClickedNode[0].children[1] !== undefined){
            getLastClickedNode[0].children[1].remove()
        }
    
        if(lastAPIcall !== undefined){
            if(reciverName !== lastAPIcall.receiver){
                setChatUI()
            }
        }else{
            setChatUI()
        }
    })
}

let getLastClickedRoom ;
for(let i=0; i<getGroupList.length; i++){
    getGroupList[i].addEventListener('click',(e)=>{
        console.log('cALLED GROUP', roomId);
        if(roomId){
            socket.emit('leaveRoom', roomId);
            getLastClickedNode[0].classList.remove('activeUser')
        }
        roomName = getGroupList[i].children[0].innerHTML
        roomID = getGroupList[i].children[0].getAttribute("key");

        
        if(!getLastClickedRoom){
            getLastClickedRoom = getGroupList[i];
        } else{
            getLastClickedRoom.classList.remove('activeUser')
            getLastClickedRoom = getGroupList[i];
        }
        getLastClickedRoom.classList.add('activeUser')
        if(lastGroupAPIcall !== undefined){
            if(roomName !== lastGroupAPIcall.receiver){
                setGroupUI()
            }
        }else{
            setGroupUI()
        }
    })
}
async function setGroupUI(){

    const getOldGroupChat = await getOldGroupChatAPI()
    
    const {dycryptedMessage, users, roomID, url} =getOldGroupChat
    
    socket.emit('joinGroupRoom',roomID);

    if(dycryptedMessage[0] === undefined){  
        let messages = `<div id="chatContainer">
            </div>
            <div class="send">
                <div class="groupLink"> 
                    Group Invitaion Link 
                    <div class="input">
                        <input type="text" id="groupLink" value="${url}/joinGroup/?roomID=${roomID}&roomName=${roomName}" disabled />
                    </div>
                    <div class="btn">
                        <button id="copyBtn" onclick="copyLink()">copy</button>
                    </div>
                </div>
                <div class="usersList">`
                    for(let i=0; i<users.length; i++){
                        messages += `<li> ${users[i]}</li>`
                    }
        messages +=`</div>
                <div class="input">
                    <input type="text" id="message" name="message" autofocus>
                    <button id="sendMessage"><i class="fas fa-paper-plane"></i> </button>
                </div>
            </div>
            `

        chatContainer.innerHTML = messages
        addEventListenerForMessage("group");
    }
    else{
        chatContainer.innerHTML = printMessage(dycryptedMessage, users, roomID, url);
        document.getElementById('chatContainer').style.maxHeight = "40vh"
        addEventListenerForMessage("group");
        const scroll =setInterval(function() {
            var elem = document.getElementById('chatContainer')
            elem.scrollTop = elem.scrollHeight;
            clearInterval(scroll)
        }, 1000)
    }
}

async function getOldChatAPI(){
    const author = "<%- name %>"
    const data = {
        author: author,
        receiver: reciverName
    }
    lastAPIcall =data;
    let result = await fetch('/message/getUserMessage',{
        method:'POST',
        body: JSON.stringify(data),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    });
    return result.json()
}
async function getOldGroupChatAPI(){
    const data = {roomID}
    lastAPIcall =data;
    lastAPIcall.receiver = roomName
    let result = await fetch('/message/getGroupMessages',{
        method:'POST',
        body: JSON.stringify(data),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    });
    return result.json()
}

function printMessage(message, users, roomID, url){
    const author = "<%- name %>"
    let messages = ""
    messages += `<div id="chatContainer">`
        for(let i=0; i<message.length; i++){
            var senderReciver = 'RecivedFromUser'
            if(message[i].sender === author){
                senderReciver = 'SelfMessage'
            }
            messages += `<p class='${senderReciver}'>${message[i].messgae}<br/><span class ="authorInfo">${message[i].sender === author ? "you": message[i].sender}</span></p>`
        }
    messages += `</div><div class="send">`
    if(roomID && users ){
        messages += `<div class="groupLink"> Group Invitaion Link <div class="input"><input type="text" id="groupLink" value="${url}/joinGroup/?roomID=${roomID}&roomName=${roomName}" disabled /></div><div class="btn"><button id="copyBtn" onclick="copyLink()">copy</button></div></div>`
        messages += `<div class="usersList">`
            for(let i=0; i<users.length; i++){
                messages += `<li> ${users[i]}</li>`
            }
        messages += `</div>`
    }
    messages +=`<div class="input">
            <input type="text" id="message" name="message" autofocus>
            <button id="sendMessage"><i class="fas fa-paper-plane"></i> </button></div></div>`
    return messages
}

function copyLink(){
    const link = document.getElementById('groupLink').value;
    navigator.clipboard.writeText(link);
    document.getElementById('copyBtn').innerHTML = "Link Copied!"
}
function addEventListenerForMessage (from){
    getChatContainer = document.getElementById('chatContainer');
    userName = document.getElementById('userName').innerHTML;
    const sendMessage = document.getElementById('sendMessage');
    const inputMessage = document.getElementById('message')
    inputMessage.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            sendMessage.click();
        }
    });
    sendMessage.addEventListener("click", ()=>{
        const message = document.getElementById('message').value.trim();
        if(message !== ""){
            if(!from){
                storeMessage(message)
                console.log('caleed room lisnter');

                socket.emit('sendMessage',{message: message, author:userName, receiver:reciverName, roomId:roomId} );
            }
            if(from ==="group"){
                roomId = undefined
                storeMessageInGroup(message)
                console.log('caleed group lisnter');
                socket.emit('sendMessageOnGroup',{message: message, author:userName, receiver:reciverName, roomID:roomID} );

            }   
            document.getElementById('message').value = "";
            const scroll =setInterval(function() {
                var elem = document.getElementById('chatContainer')
                elem.scrollTop = elem.scrollHeight;
                clearInterval(scroll)
            }, 1000)
        }
    })
}

async function setChatUI (){
    const getOldChatfromAPI = await getOldChatAPI();
    roomId = getOldChatfromAPI.roomId
    socket.emit('joinRoom',roomId);

    if(getOldChatfromAPI.dycryptedMessage[0] === undefined){
            chatContainer.innerHTML = `<div id="chatContainer"></div><div class="send"><div class="input">
            <input type="text" id="message" name="message" autofocus>
            <button id="sendMessage"><i class="fas fa-paper-plane"></i> </button></div></div>`;
            addEventListenerForMessage();
    }
    else{
        chatContainer.innerHTML =printMessage(getOldChatfromAPI.dycryptedMessage);
        addEventListenerForMessage();
        const scroll =setInterval(function() {
            var elem = document.getElementById('chatContainer')
            elem.scrollTop = elem.scrollHeight;
            clearInterval(scroll)
        }, 1000)
    }
    
}
const author = "<%- name %>"
async function storeMessage(message){
    const data = {
        messageData:message,
        author,
        receiver: reciverName
    }
    printMessages({message,author})
    // ! require validation 
    await fetch('/message/storeMessage',{
        method:'POST',
        body: JSON.stringify(data),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
}
async function storeMessageInGroup(message){
    const data = {
        messageData:message,
        author,
        roomID
    }
    printMessages({message,author})

    console.log(data);
    // ! require validation 
    await fetch('/message/storeGroupMessage',{
        method:'POST',
        body: JSON.stringify(data),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
}


const socket = io();


socket.on('friendOnlinestatus', data=>{
    for(let i=0; i< getUserList.length; i++){
        if(getUserList[i].firstElementChild.innerHTML === data){
            const notificationCount = document.getElementsByClassName('messageNotification')[0]
            
            if(getUserList[i].children[1] !==undefined){
                
            }else{
                const span = document.createElement('span');
                span.classList.add('userOnline');
                span.innerHTML = " "
                getUserList[i].append(span)
            }
        }
    }
})
socket.on('friendOfflinestatus', data=>{
    for(let i=0; i< getUserList.length; i++){
        if(getUserList[i].firstElementChild.innerHTML === data){
            if(getUserList[i].children[1] !==undefined){
                getUserList[i].children[1].remove()
            }
        }
    }
})


for(let i=0; i< getUserList.length; i++){
    socket.emit('whichFriendIsOnline', getUserList[i].firstElementChild.innerHTML)
}
socket.emit('friendIsOnline', author)
socket.on('iAmOnline', data=>{
    if(data === author){
        socket.emit('friendIsOnline', data)
    }
})

socket.on('newMessage', data=>{
    console.log('called message print event' );
    if(reciverName === data.author){
        printMessages(data)
    }
    if(roomID === data.roomID){
        printMessages(data)
    }
})

function printMessages(data){
    console.log('called print', data);
    var senderReciver = 'RecivedFromUser'
    if(data.author === userName){
        senderReciver = 'SelfMessage'
    }
    const p = document.createElement('p');
    const span = document.createElement('span');
    const br = document.createElement('br');

    p.classList.add(senderReciver);
    p.innerHTML = data.message
    span.classList.add('authorInfo');
    span.innerHTML = data.author === userName? "You" : data.author
    p.append(br, span)
    getChatContainer.append(p);
    const scroll =setInterval(function() {
        var elem = document.getElementById('chatContainer')
        elem.scrollTop = elem.scrollHeight;
        clearInterval(scroll)
    }, 500)
}


// else{
// for(let i=0; i< getUserList.length; i++){
//             if(getUserList[i].firstElementChild.innerHTML === data.author){
//                 const notificationCount = document.getElementsByClassName('messageNotification')[0]
                
//                 if(getUserList[i].children[1] !==undefined){
//                     getUserList[i].children[1].innerHTML = Number(getUserList[i].children[1].innerHTML) +1
//                 }else{
//                     const span = document.createElement('span');
//                     span.classList.add('userOnline');
//                     span.innerHTML = 1
//                     getUserList[i].append(span)
//                 }
//             }
//         }
//     }
// 
