document.getElementById("signup-btn").addEventListener("click",register);
document.getElementById("login-btn").addEventListener("click",login);
document.getElementById("pass").addEventListener("keyup",(event)=>{
    if (event.keyCode === 13) {
       
        event.preventDefault();
        
        document.getElementById("login-btn").click();
      }
});
document.getElementById("password").addEventListener("keyup",(event)=>{
    if (event.keyCode === 13) {
       
        event.preventDefault();
        
        document.getElementById("signup-btn").click();
      }
});

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const logout = urlParams.get('logout');
 
if(logout)
    alert("Successfully logged out!!");


function register(){
    
    var name=document.getElementById("name").value;
    var email= document.getElementById("email").value;
    var password= document.getElementById("password").value;
    var username = document.getElementById("username").value;
    var info={username,name,email,password};
    var options={
        method:"POST",
        body:JSON.stringify(info),
        headers:{
            'Content-type':'application/json'
        }
    }
    fetch("/signup",options)
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            if(data.mssg=="Username already exist!!"){
                document.getElementById("signup-mssg").textContent=data.mssg;
                setTimeout(() => {
                    document.getElementById("signup-mssg").textContent="";
                }, 1500);
            }
            else{
                document.getElementById("signup-mssg").textContent+=`Successfully Registered!!`;
                setTimeout(() => {
                    document.getElementById("signup-mssg").textContent="";
                }, 2000);
                document.getElementById("name").value='';
                document.getElementById("email").value='';
               document.getElementById("password").value='';
                document.getElementById("username").value='';
                location.reload(); //refresh page after every successful signup
            }
        })
}

function login(){
    
    var username=document.getElementById("user").value;
    var password=document.getElementById("pass").value;
    var info={username,password};
    var options={
        method:"POST",
        body:JSON.stringify(info),
        headers:{
            'Content-type':'application/json'
        }
    }
    fetch("/login",options)
        .then(res=>res.json())
        .then(data=>{
            if(data.mssg=="Invalid password!!" || data.mssg=="No username exist!!"){
                document.getElementById("login-mssg").textContent=data.mssg;
                setTimeout(() => {
                    document.getElementById("login-mssg").textContent="";
                }, 1500);
            }
            else{
                
                window.open(`./home/index.html?username=${data.username}`,"_self");
            }
        })
}