window.onload = function() {
    var realtimeLoader = new rtclient.RealtimeLoader(realtimeOptions);
    realtimeLoader.start();
}

function initializeModel(model) {
    console.log('MODEL INITIALIZED');
    bubbalist.ready = false;
    bubbalist.updateReady();
    console.log("bubbalist.ready is now",bubbalist.ready);
    var taskList = model.createList();
    model.getRoot().set('taskList', taskList);
}

function onFileLoaded(doc) {
    console.log('FILE LOADED');
    bubbalist.updateReady();
    console.log("bubbalist.ready is now",bubbalist.ready);
    bubbalist.taskList = doc.getModel().getRoot().get('taskList');

   function taskAdded(e) {
        console.log('======================================\nTASK ADDED (drive.js)\n========================================');
        if (e.isLocal) return; //if the event happened in the local tab, basically leave this function
        bubbalist.updateTasks();
   };

   function taskDeleted(e) {
        console.log('======================================\nTASK DELETED (drive.js)\n======================================');
        if (e.isLocal) return;
        bubbalist.updateTasks();
   };

    function taskChanged(e) {
        console.log('======================================\nTASK CHANGED (drive.js)\n======================================');
        if (e.isLocal) return;
        bubbalist.updateTasks();
    };

    bubbalist.taskList.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, taskAdded);
    bubbalist.taskList.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, taskDeleted);
    bubbalist.taskList.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, taskChanged);

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