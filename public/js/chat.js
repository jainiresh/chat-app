const socket = io();

//Elements
const $messageForm = document.querySelector('#chat-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationSendButton = document.querySelector('#sendLocation');
const $messages = document.querySelector('#messages');


//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationMessageTemplate = document.querySelector('#locationMessage-template').innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { username, room } =  Qs.parse(location.search, { ignoreQueryPrefix : true });// the 2nd argument takes away the question mark

const autoScroll = () =>{
  // New message element
  const newMessage = $messages.lastElementChild;

  //Height of the new message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  //Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of the messages container
  const containerHeight = $messages.scrollHeight;

  //How far have we scrolled to the top
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if((containerHeight - newMessageHeight) <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight;
  }

  }

socket.on('message', (message)=>{
  console.log(message);
   const finalHtmlToBeRendered = Mustache.render($messageTemplate, {
     username : message.username,
     messagePassedIn : message.text,
     creationTime : moment(message.createdAt).format('h:mm a')
   });
    $messages.insertAdjacentHTML('beforeend', finalHtmlToBeRendered);
   
    autoScroll();

  })

socket.on('locationMessage', (locationBundle)=>{
  console.log(locationBundle);
  const finalHtmlToBeRendered = Mustache.render($locationMessageTemplate, {
    username : locationBundle.username,
    locationUrl : locationBundle.url,
    creationTime : moment(locationBundle.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', finalHtmlToBeRendered);
  autoScroll();
});

socket.on('roomList', ({room, users}) => {
  
  const finalHtmlToBeRendered = Mustache.render($sidebarTemplate,{
    roomName : room,
    usersList : users
  });
  document.querySelector('#sidebar').innerHTML = finalHtmlToBeRendered;
});

$messageForm.addEventListener('submit',(e)=>{
  e.preventDefault();

  $messageFormButton.setAttribute('disabled', 'disabled');
  const message = e.target.elements.message.value;

  socket.emit('fromClient', message, (error)=>{
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    if(error){
      return console.log(error);
    }
    
    console.log(
      'Message Delivered!'
    );  
  }); 
});

$locationSendButton.addEventListener('click', (e)=>{
  
  if(!navigator.geolocation){
    return alert('This geolocation is not supported by your browser.');
  }
  
  $locationSendButton.setAttribute('disabled','disabled');// disabling location button, once we start sending our location.
  

  navigator.geolocation.getCurrentPosition((currPosition)=>{
      socket.emit('sendLocation',
       {latitude: currPosition.coords.latitude, 
      longitude : currPosition.coords.longitude}, ()=>{
        $locationSendButton.removeAttribute('disabled');// enabling location button after getting ACK
        console.log('Location shared!');
      });
  })
})

socket.emit('join', {username, room}, (error)=>{
  if(error){
    alert(error);
    location.href = '/';
  }
});