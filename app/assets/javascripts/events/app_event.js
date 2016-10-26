
/* AppEvent constructor */
function AppEvent(target, eventType, func) {
    //console.log("<AppEvent.new> target = " + target);

    this.target = target;
    this.eventType = eventType;
    this.func = func;

    target.addEventListener(eventType, func, false);
}

AppEvent.prototype.remove = function () {
    this.target.removeEventListener(this.eventType, this.func, false);
};
