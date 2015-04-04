window.onload = function() {
    var realtimeLoader = new rtclient.RealtimeLoader(realtimeOptions);
    realtimeLoader.start();
}

function initializeModel(model) {
    console.log('MODEL INITIALIZED');
    var taskList = model.createList();
    model.getRoot().set('taskList', taskList);
}

function onFileLoaded(doc) {
    console.log('FILE LOADED');
    bubbalist.taskList = doc.getModel().getRoot().get('taskList');

   function taskAdded(e) {
        console.log('taskAdded');
        // console.log('taskAdded', e);
        if (e.isLocal) return; //???
        //if the event happened in the local tab, basically leave this function
        bubbalist.updateTasks();
   };
    bubbalist.taskList.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, taskAdded);
    bubbalist.updateTasks();
}

var realtimeOptions = {
    clientId: '312696137835-3boo4s4voijbl73pt7cvjg0ivsd1ija2.apps.googleusercontent.com', 
    authButtonElementId: 'authorizeButton',
    initializeModel: initializeModel,
    autoCreate: true, 
    defaultTitle: "Bubbalist", //what
    newFileMimeType: null, // using default
    onFileLoaded: onFileLoaded,
    registerTypes: null, // no action
    afterAuth:null
}