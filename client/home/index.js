//index.js home
document.getElementById("logout-btn").addEventListener("click",()=>{
    window.open("../index.html?logout=true","_self");
})
document.getElementById("send").addEventListener("click",sendMessage);
document.getElementById("mssgInput").addEventListener("keyup",(event)=>{
    if (event.keyCode === 13) {
       
        event.preventDefault();
        document.getElementById("send").style.backgroundColor="lightseagreen";
        document.getElementById("send").click();
        setTimeout(() => {
            document.getElementById("send").style.backgroundColor="";
        }, 100);
      }
});


const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const username = urlParams.get('username');
var friendList=[];
document.getElementById("searchFriend").addEventListener("input",searchFriend);
document.getElementById("searchFriend").addEventListener("blur",()=>{
    setTimeout(() => {
        document.getElementById("suggestions").innerHTML="";
    }, 500);
   
});
console.log(`Logged in as ${username}`);
document.getElementById("left-navbar").innerHTML=`<p>Logged in as  </p><h2>@${username}</h2>`;



function loadData(){                //load friends to friend list at left //load chats
    document.getElementById('chats').innerHTML="";
    var options={
        method:"POST",
        body:JSON.stringify({username}),
        headers:{
            'Content-type':'application/json'
        }
    }
    fetch("/loadData",options)
        .then(res=>res.json())
        .then(data=>{
             //array of friends
             var mssgBtnIds=[];
             friendList=[];
             friendList.push(data[0].username);
            data.slice(1).forEach(friend => {
                
                document.getElementById('chats').innerHTML+=`<div class="flex-row chat" id="${friend.name}">
                                                                <img src="./profile-pic.png">
                                                                <h2>${friend.name}</h2>
                                                                <button id="${friend.username}"><img src="./mssg-btn.png"></button>
                                                            </div>`;
                friendList.push(friend.username);
                //1 aug 12:41pm
                // document.getElementById(friend.username).addEventListener("click",()=>{console.log("clicked")});
                mssgBtnIds.push(friend.username);
                //
            });
            mssgListeners(mssgBtnIds);
        })
}
loadData();
//console.log(friendList);

function mssgListeners(mssgBtnIds){
    mssgBtnIds.forEach(friend=>{
        document.getElementById(friend).addEventListener("click",()=>{
            console.log("clicked");
            document.getElementById("userName").textContent=`@${friend}`;
            document.getElementById("frndName").textContent=document.getElementById(friend).parentNode.id;
            //
            
            //loading messages after fetching (GET)
            loadMessages(friend);
        });
        console.log("added listener");
    })
    console.log(friendList);
}
function searchFriend(){
   
    document.getElementById("suggestions").innerHTML="";
    var user=document.getElementById("searchFriend").value;
    
    var options={
        method:"POST",
        body:JSON.stringify({username:user}),
        headers:{
            'Content-type':'application/json'
        }
    }
    fetch("/search",options)
        .then(res=>res.json())
        .then(data=>{
            // console.log(data);
            var buttonNames=[];
            data.suggestions.forEach((name)=>{      //here name is username
                
                var text="Add";
                

                var isDisabled=false; 
                if(friendList.includes(name)){
                    isDisabled=true;
                    text+="ed";
                }
                document.getElementById("suggestions").innerHTML+=`<div class="flex-row">               
                                                                    <h3>${name}</h3>
                                                                    <button class="add-btn" id="${name}" name="${name}">${text}</button>
                                                                </div>`;
                                                               
                document.getElementById(name).disabled=isDisabled;
                buttonNames.push(name);
            })
            addListeners(buttonNames);
        })
        

       
}
function addListeners(buttonNames){
    buttonNames.forEach(name=>{             //here name = username id
        document.getElementById(name).addEventListener("click",(event)=>{
            console.log(event.target.name);
            var options={
                method:"POST",
                body:JSON.stringify({username:username,friend:event.target.name}),
                headers:{
                    'Content-type':'application/json'
                }
            }
            fetch("/addFriend",options)
                .then(res=>res.json())
                .then(friend=>{
                    //loadData();
                   location.reload();
                });
            event.target.textContent="Added";
            event.target.disabled=true;
        })
    })
}

function sendMessage(){
    var text=document.getElementById("mssgInput").value;
    console.log(text);
    
    var messageInfo={from:username,to:document.getElementById("userName").textContent.slice(1),mssg:text};
    var options={
        method:"POST",
        body:JSON.stringify(messageInfo),
        headers:{
            'Content-type':'application/json'
        }
    }
    fetch("/sendMessage",options)
        .then(res=>res.json())
        .then(data=>console.log(data));
    document.getElementById("mssg").innerHTML+=`<div class="myMssg"><h3>${text}</h3></div>`;
    document.getElementById("mssgInput").value="";
    scrollToBottom();
    
}
function resizeFunction(){
    scrollToBottom();
    if(window.innerWidth>640){
        document.getElementById("left").style.width="40%";
        document.getElementById("right").style.width="60%";
        document.getElementById("back-btn").disabled=true;
    }
    else{
        if(document.getElementById("right").style.width=="100%"){
          document.getElementById("left").style.width="0%";
          document.getElementById("right").style.width="100%";
        }
      else{
          document.getElementById("left").style.width="100%";
          document.getElementById("right").style.width="0%";
      }
        document.getElementById("back-btn").disabled=false;
    }
}
document.getElementById("back-btn").addEventListener("click",()=>{
    document.getElementById("left").style.width="100%";
    document.getElementById("right").style.width="0%";
})
var isClickedFirst=true;
function loadMessages(friendUsername){       //load messages of a particular chat
    if(isClickedFirst){
        document.getElementById("image").remove();
        isClickedFirst=false;
    }
    if(window.innerWidth<=640){
       document.getElementById("left").style.width="0%";
       document.getElementById("right").style.width="100%";
    }
    document.getElementById("mssg").innerHTML="";
    var options={
        method:"POST",
        body:JSON.stringify({senderUsername:username,friendUsername:friendUsername}),
        headers:{
            'Content-type':'application/json'
        }
    }
    fetch("/loadMessages",options)
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            document.getElementById("mssg").innerHTML="";
            data.messages.forEach(message=>{
                var mssgClass="frndMssg";
                if(message.isSenderMe)
                    mssgClass="myMssg";
                console.log(mssgClass);
                document.getElementById("mssg").innerHTML+=`<div class=${mssgClass}><h3>${message.mssg}</h3></div>`;
                scrollToBottom();
            })
        })
        

    
    
}
//loadMessages(document.getElementById("frndName").textContent,document.getElementById("userName").textContent.slice(1));
function scrollToBottom(){
    var messages=document.getElementById("mssg");
    messages.scrollTop=messages.scrollHeight;
    
    
}