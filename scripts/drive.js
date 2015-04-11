window.onload = function() {
    var realtimeLoader = new rtclient.RealtimeLoader(realtimeOptions);
    realtimeLoader.start();
}

function initializeModel(model) {
    console.log('Model initialized!');
    bubbalist.ready = false;
    bubbalist.updateReady();
    var taskList = model.createList();
    model.getRoot().set('taskList', taskList);
}

function onFileLoaded(doc) {
    console.log('File loaded!');
    bubbalist.ready = true;
    bubbalist.updateReady();
    bubbalist.hideSpinner();
    bubbalist.taskList = doc.getModel().getRoot().get('taskList');

   function taskAdded(e) {
        if (e.isLocal) return;
        bubbalist.updateView("added");
   };

   function taskDeleted(e) {
        if (e.isLocal) return;
        bubbalist.updateView("deleted");
   };

    function taskChanged(e) {
        if (e.isLocal) return;
        bubbalist.updateView("changed");
    };

    bubbalist.taskList.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, taskAdded);
    bubbalist.taskList.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, taskDeleted);
    bubbalist.taskList.addEventListener(gapi.drive.realtime.EventType.OBJECT_CHANGED, taskChanged);
    bubbalist.updateTasks();
}

var realtimeOptions = {
    clientId: '312696137835-3boo4s4voijbl73pt7cvjg0ivsd1ija2.apps.googleusercontent.com', 
    authButtonElementId: 'authorizeButton',
    initializeModel: initializeModel,
    autoCreate: true, 
    defaultTitle: "Bubbalist",
    newFileMimeType: null,
    onFileLoaded: onFileLoaded,
    registerTypes: null,
    afterAuth:null
}
