
(function(){

  function setWebProfile(key, value){
    var obj = JSON.parse(localStorage.__webProfile__ || '{}');
    obj[key] = value;
    localStorage.__webProfile__ = JSON.stringify(obj);
  }

  function getWebProfile(key){
    var obj = JSON.parse(localStorage.__webProfile__ || '{}');
    return key ? obj[key] : obj;
  }

  navigator.webProfile = {
    connectedProfile: getWebProfile('connectedProfile'),
    registerProvider: function(name, uri){
      navigator.registerProtocolHandler('web+profile', uri + '?%s', name);
    },
    connect: function(){
      return navigator.protocolRequest('web+profile', {
        action: 'connect'
      }).then(function(username){
        setWebProfile('connectedProfile', username);
        navigator.webProfile.connectedProfile = username;
      });
    },
    authenticate: function(){

    },
    getProfile: function(username){
      /*
        This should be performed by the browser,
        platform, or OS so it comes directly from
        the blockchain instead of relying on a
        third-party middleman.
      */
      var name = username || this.connectedProfile;
      return fetch('https://api.onename.com/v1/users/' + name + '?app-id=11783753c820c2004667f4b17efb376d&app-secret=a31496483fa18b96b39845d66d62d15d37f5eea29aca6f161b2f6bcc0a7d8d91')
             .then(function(response){
               return response.json();
             }).then(function(json){
               return json[name].profile;
             });
    }
  };

})();
