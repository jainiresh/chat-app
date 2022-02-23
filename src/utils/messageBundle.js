const generateMessageBundle = (username, text)=>{
 return{
   username,
   text,
   createdAt : new Date().getTime()
 }
}

const generateLocationBundle = (username, url) =>{
  return {
    username,
    url,
    createdAt : new Date().getTime()
  }
}

module.exports = {
  generateMessageBundle,
  generateLocationBundle
}