
// console.log(module);
// module.exports = "Hello world";            to export any text inside app.js
// to export function inside app.js, also calling it inside app.js


exports.getDate = function(){

  const today = new Date();

  const option = {
    weekday : "long",
    day : "numeric",
    month : "long"
  };

  return today.toLocaleDateString("en-US", option);
}


exports.getDay = function(){
  const today = new Date();

  const option = {
    weekday : "long"
  };

  return today.toLocaleDateString("en-US", option);
};
