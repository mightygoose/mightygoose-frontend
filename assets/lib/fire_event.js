module.exports = function(eventName, target){
  var event = document.createEvent('Event');
  event.initEvent(eventName, true, true);
  target = target || document.body;
  target.dispatchEvent(event);
}
