const { request } = require("express");

const users = [];


//----------------------ADDING USER--------------------------

const addUser = ({ id, username, room }) =>{
    // Cleaning the data, mainly the username and the room name
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validation of data
    if(!username || !room){
      return {
        error : 'Username and room name are required!'
      }
    }

    //Checking for existing users
    const exUser = users.find((user)=>{
      return (user.room === room && user.username === username)
    })

    //Validating username
    if(exUser){
      return{
        error : 'That username is already taken by a user in the requested room!'
      }
    }

    //Storing the user
    const user = { id, username, room };
    users.push(user);
    return { 
      user
     };
}


// --------------REMOVING USER--------------------

const removeUser = (id)=>{
  const exUserIndex = users.findIndex((user)=>{
      return user.id === id; // returns true and the user's id is populated only if the id matches
  })

  if(exUserIndex != -1) {
    return users.splice(exUserIndex,1)[0];// the number of items to be removed starting from the index given
  }
}


// -----------------GET USER--------------------------------

const getUser = (id) =>{
  const requestedUser = users.find((user)=> user.id === id);

  if(!requestedUser) return { error : 'We couldnt find the user with that username!'};

  return requestedUser;
}

//-------------------GETTING ALL USERS IN THE ROOM------------------

const getAllUsersInRoom = (room) =>{
  room = room.toLowerCase().trim();
  return users.filter((user)=> user.room === room);
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getAllUsersInRoom
}; 