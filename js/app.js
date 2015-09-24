
var db = new Dexie("app");

db.version(1).stores({
  profiles: '++id,&name,&key,selected',
  sites: '++id,&origin,name'
});

db.open().then(function(){
  db.transaction("r", db.profiles, function(){
    console.log('DB OPENING TXN');
    db.profiles.each(function(entry) {
      var selected = !!entry.selected;
      if (selected) updateSelectedProfile(entry.name);
      createProfileEntry({
        name: entry.name,
        key: !!entry.key,
        selected: selected
      });
    });
  });
}).catch(function(error){
  console.log(error)
})

db.on('error', function (error) {
    // Catch all uncatched DB-related errors and exceptions
    console.error(error);
});

/* DOM Interaction */

var notifier = document.getElementById('notifier');
var active_profile = document.getElementById('active_profile');
var profile_list = document.getElementById('profile_list');
var manage_profile_modal = document.getElementById('manage_profile_modal');
var manage_profile_tabbox = manage_profile_modal.querySelector('x-tabbox');
var profile_printout = document.getElementById('profile_printout');

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
  profile_list.appendChild(label);
}

function updateSelectedProfile(name, updateDB){
  active_profile.setAttribute('data-profile', name);
  db.transaction("r", db.profiles, function(){
    db.profiles.where('name').equalsIgnoreCase(name).first(function(entry){
      profile_printout.innerHTML = JSON.stringify(entry.profile, null, 2);
      Prism.highlightAll();
    });
  });
  if (updateDB) {
    var states = {};
    xtag.query(profile_list, 'input[type="radio"]').forEach(function(input){
      states[input.value] = input.checked ? 1 : 0;
    });
    db.transaction("rw", db.profiles, function(){
      db.profiles.each(function(entry) {
        entry.selected = states[entry.name];
        db.profiles.put(entry);
      });
    });
  }
}

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
    if (!input.spinning) {
      input.spinning = true;
      db.transaction("r", db.profiles, function () {
        db.profiles.where('name').equalsIgnoreCase(name).count(function(num) {
          if (num) {
            input.spinning = false;
            showNotifier({
              type: error,
              html: 'You have already added the Web Profile: ' + name
            });
          }
          else {
            navigator.webProfile.getProfile(name).then(function(profile){
              db.transaction("rw", db.profiles, function(){
                db.profiles.add({name: name, profile: profile});
                createProfileEntry(name);
                input.spinning = false;
                manage_profile_tabbox.selectedIndex = 0;
                console.log(profile);
              });
            }).catch(function(e){
              input.spinning = false;
              console.log(e);
            });
          }
        });
      });

    }
  }
});
