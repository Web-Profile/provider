
(function(){

  var worker = new ProtocolWorker('web+profile');

  navigator.webProfile = {
    registerProvider: function(name, uri){
      navigator.registerProtocolHandler('web+profile', uri + '?%s', name);
    },
    connect: function(){
      return worker.connect().then(function(response){
        navigator.webProfile.id = response.id;
        return response;
      })
    },
    authenticate: function(){
      if (!this.id) throw 'Not Connected: you must connect before sending Web Profile requests';
    },
    getProfile: function(username){
      /*
        This should be performed by the browser,
        platform, or OS so it comes directly from
        the blockchain instead of relying on a
        third-party middleman.
      */
      var name = username || this.id;
      return fetch('https://api.onename.com/v1/users/' + name + '?app-id=11783753c820c2004667f4b17efb376d&app-secret=a31496483fa18b96b39845d66d62d15d37f5eea29aca6f161b2f6bcc0a7d8d91')
             .then(function(response){
               return response.json();
             }).then(function(json){
               return json[name].profile;
             });
    }
  };

})();
