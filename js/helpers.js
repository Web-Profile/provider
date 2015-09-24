
/* localStorate shortcuts */


if (!getProfiles()) Lockr.set('profiles', {});

function getProfiles(){ return Lockr.get('profiles') }

function loopProfiles(fn, save){
  var entries = getProfiles();
  for (var z in entries) fn.call(entries, z, entries[z]);
  if (save) Lockr.set('profiles', entries);
}

function saveProfile(name, obj){
  var entries = getProfiles();
  var entry = entries[name] || {};
  if (entry) for (var z in obj) entry[z] = obj[z];
  entries[name] = entry;
  Lockr.set('profiles', entries);
}
