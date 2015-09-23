(function(){  
  var queue = [],
      requested = false,
      fire = function(){
        var i = queue.length;
        while (i--) {
          queue[i].apply ? 
          queue[i].apply(queue[i].__debounce__[0], queue[i].__debounce__[1]) : 
          queue[i][0].apply(queue[i][1], queue[i][2]);
        }
        queue = [];
        requested = false;
      };
  
  xtag.pseudos.queue = {
    onCompiled: function(fn, pseudo){
      return function(){
        if (pseudo.value) {
          if (queue.indexOf(fn) == -1) queue.push(fn);
          fn.__debounce__ = [this, arguments];
        }
        else queue.push([fn, this, arguments]);
        requested = requested || xtag.requestFrame(fire);
      }
    }
  }
})();