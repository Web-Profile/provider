
(function(){


/* DOM Assignment */

var notifier = document.getElementById('notifier');
var active_profile = document.getElementById('active_profile');
var profile_list = document.getElementById('profile_list');
var manage_profile_modal = document.getElementById('manage_profile_modal');
var manage_profile_tabbox = manage_profile_modal.querySelector('x-tabbox');
var profile_printout = document.getElementById('profile_printout');

/* Local Storage */

loopProfiles(function(name, obj){
  if (obj.selected) updateSelectedProfile(name);
  createProfileEntry(obj);
});

/* Functions */

function showNotifier(obj){
  var node = obj.element || notifier;
  node.innerHTML = obj.html || '';
  node.setAttribute('type', obj.type || 'success');
  node.setAttribute('duration', obj.duration || 4000);
  node.setAttribute('showing', '');
}

function createProfileEntry(obj){
  var label = document.createElement('label');
  label.innerHTML = '<input name="profile-entries" type="radio" value="'+ obj.name +'" '+ (obj.selected ? 'checked="checked"' : '') +' />'+ obj.name + (obj.key ? '' : ' <input type="file">');
  return profile_list.appendChild(label);
}

function updateSelectedProfile(name, updateDB){
  var profiles = getProfiles();
  active_profile.setAttribute('data-profile', name);

  profile_printout.innerHTML = JSON.stringify(profiles[name].profile, null, 2);
  Prism.highlightAll();

  if (updateDB) {
    var states = {};
    xtag.query(profile_list, 'input[type="radio"]').forEach(function(input){
      states[input.value] = input.checked ? 1 : 0;
    });
    loopProfiles(function(name, obj){
      obj.selected = states[name];
    }, true);
  }
}


/* Events */

xtag.addEvents(document, {
  'tap:delegate(.select-profile)': function(event){
    manage_profile_tabbox.selectedIndex = 0;
    manage_profile_modal.show();
  },
  'tap:delegate(.add-profile)': function(event){
    manage_profile_tabbox.selectedIndex = 1;
    manage_profile_modal.show();
  },
  'tap:delegate(.add-handler)': function(event){
    navigator.webProfile.registerProvider('Web Profile Service', location.origin + '/handler.html');
  },
  'change:delegate(#profile_list input[type="radio"])': function(){
    if (this.checked) updateSelectedProfile(this.value, true);
  },
  'submitready:delegate(#add_profile_input)': function(event){
    var input = this;
    var name = input.value.trim();
    console.log(name);
    if (!input.spinning) {
      input.spinning = true;
      var entries = getProfiles();
      if (entries[name]) {
        input.spinning = false;
        showNotifier({
          type: error,
          html: 'You have already added the Web Profile: ' + name
        });
      }
      else {
        navigator.webProfile.getProfile(name).then(function(profile){
          var obj = { profile: profile };
          var node = createProfileEntry({ name: name });
          if (!profile_list.children.length) {
            obj.selected = true;
            node.click();
          }
          saveProfile(name, obj);
          input.spinning = false;
          manage_profile_tabbox.selectedIndex = 0;
          console.log(profile);
        }).catch(function(e){
          input.spinning = false;
          console.log(e);
        });
      }

    }
  }
});

})();
