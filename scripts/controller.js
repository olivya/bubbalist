bubbalist.controller('mainController', function($scope, $location, $timeout) {
	$scope.taskList = [];
	
	var colour = '#05E1FF';
	var zPos = 0;
	var largestZ = 0;
	var space = 20;
	var thisTaskIsNew = true;
	var deleted = false;
	var completed = false;
	var cleared = false;

	bubbalist.ready = false;
	$scope.ready = false;

//=============================================================================
//====== LOADING SCREEN =======================================================
//=============================================================================
	bubbalist.updateReady = function() {
		if (bubbalist.ready) {
			$scope.ready = true;
		} else $scope.ready = false;
	}

	bubbalist.updateReady();

	bubbalist.showLogin = function () {
		$("#spinner-container").removeClass("bounceInDown");
		$("#spinner-container").addClass("fadeOut");
		
		setTimeout(function(){
			$('#spinner-container').hide();
			$('#login').show();
			$("#google").addClass("animated bounceInDown");
			$("#authorizeButton").addClass("animated bounceInUp");
		},150);
	}

	bubbalist.hideLogin = function () {
		$('#login').hide();
	}

	bubbalist.hideSpinner = function () {
		$("#spinner-container").removeClass("bounceInDown");
		$("#spinner-container").addClass("fadeOut");
		setTimeout(function(){ $('#spinner-container').hide(); },200);
	}

	bubbalist.showSpinner = function () {
		$("#spinner-container").removeClass("fadeOut");
		$('#spinner-container').show();
		$("#spinner-container").addClass("bounceInDown");
	}

//=============================================================================
//====== INITIALIZING STUFF ===================================================
//=============================================================================
	//updating view when a non-local change is made:
	bubbalist.updateView = function(RTevent) {

		if(RTevent === "added") {
			$scope.taskList = bubbalist.taskList.asArray();
			$scope.visTask($scope.taskList[($scope.taskList.length - 1)]); //draw newest task:
		}

		if(RTevent === "changed") {
			$scope.taskList = bubbalist.taskList.asArray();
			for (var i=0, length = $scope.taskList.length; i < length; i++) {	
				var thisTask = $scope.taskList[i];
				//update position:
				$("#"+thisTask.ID).css("top",thisTask.yPos+"px");
				$("#"+thisTask.ID).css("left",thisTask.xPos+"px");
				$("#"+thisTask.ID).css("z-index",thisTask.zPos);
				//update task text:
				var origTaskySpan = document.getElementById(thisTask.ID+"span");
				if(origTaskySpan) { origTaskySpan.parentNode.removeChild(origTaskySpan); }
				var newTaskySpan = document.createElement("span");
				newTaskySpan.id = thisTask.ID+"span";
				var newTaskySpanText = document.createTextNode(thisTask.task);
				newTaskySpan.appendChild(newTaskySpanText);
				var handle = document.getElementById(thisTask.ID+"handle");
				handle.appendChild(newTaskySpan);
			};
			$scope.taskList = bubbalist.taskList.asArray();
		}

		if(RTevent === "deleted") {
			//check if $scope task on the view is still in BB list...
			for (var i=0, length = $scope.taskList.length; i < length; i++) {	
				if(bubbalist.taskList.asArray().indexOf($scope.taskList[i] ) <= -1) {
					$('#'+$scope.taskList[i].ID).remove();
				}
			}
			$scope.taskList = bubbalist.taskList.asArray();
			if($scope.taskList.length===0) { //if this was the last task deleted...
				console.log("Last task was deleted...");
				$(".no-tasks-message").addClass("animated bounceInDown");
				$(".no-tasks-message").show(); //...show no tasks message
				console.log("Showing no tasks message.");
				setTimeout(function(){ $(".no-tasks-message").removeClass("animated bounceInDown"); },2000);
			}
		}
	}

	$scope.showMenuButtons = function () {
		$(".toggle-help-button").show();
		$(".toggle-help-button").addClass("bounceInRight");
		$(".toggle-menu-button").show();
		$('.toggle-menu-button').addClass('bounceInRight');
	}

	bubbalist.updateTasks = function() { //runs on page load
		bubbalist.ready = false;
		bubbalist.updateReady();
		$scope.taskList = bubbalist.taskList.asArray();
		$scope.$apply();
		$scope.newTask = "";
		$('.text-feedback').html(maxChars);
		$scope.drawTasks();
		zPos = $scope.findLargestZ();
		console.log("READY!\n "); //<--- loading screen can stop here <--- 
		$scope.showMenuButtons();
		bubbalist.hideSpinner();
		bubbalist.ready = true;
		bubbalist.updateReady();
		var noTasksMsg = document.createElement("div");
		noTasksMsg.id = "noTasksMsg";
		document.getElementById("ngview").appendChild(noTasksMsg);
		var noTasksMsgText = document.createTextNode("You don't have any tasks!");
		$("#noTasksMsg").addClass("no-tasks-message");
		noTasksMsg.appendChild(noTasksMsgText);
		$("#noTasksMsg").hide();

		if(bubbalist.taskList.length===0) {
			$("#noTasksMsg").addClass("animated bounceInDown");
			$("#noTasksMsg").show();
			console.log("Showing no tasks message.");
			setTimeout(function(){
				$("#noTasksMsg").removeClass("animated bounceInDown");
			},2000);
		} else $("#noTasksMsg").hide();
 
		$scope.$apply();
   };

   $scope.drawTasks = function() {
   	bubbalist.ready = true;
  		bubbalist.updateReady();
		for (var i=0, length = bubbalist.taskList.length; i <= length - 1; i++) {	
			if(bubbalist.taskList.asArray()[i] != null) {
				thisTaskIsNew = false; //b/c loading from storage
				$scope.visTask(bubbalist.taskList.asArray()[i]);
				// console.log(bubbalist.taskList.asArray()[i].ID,bubbalist.taskList.asArray()[i].ID.length);
				if(i === (bubbalist.taskList.length - 1)){
					thisTaskIsNew = true;
				}
			}
		};
   }

//=============================================================================
//====== RETURNING TASK DATA ==================================================
//=============================================================================
	$scope.dataFromID = function (id) {
		for (var i=0, length = $scope.taskList.length; i <= length - 1; i++) {	
			if($scope.taskList[i].ID === id) {
				var task = $scope.taskList[i].task;
				var editing = $scope.taskList[i].editing;
				var colour = $scope.taskList[i].colour;
				var ID = $scope.taskList[i].ID;
				var xPos = $scope.taskList[i].xPos;
				var yPos = $scope.taskList[i].yPos;
				var zPos = $scope.taskList[i].zPos;
				return {
					task:task, editing:editing, colour:colour, ID:ID, i:i, xPos:xPos, yPos:yPos, zPos:zPos
				};
			}
		};
	}

	$scope.findLargestZ = function () {
		for (var i=0, length = bubbalist.taskList.length; i <= length - 1; i++) {	
			if(bubbalist.taskList.asArray()[i].zPos > largestZ) {
				largestZ = bubbalist.taskList.asArray()[i].zPos;
			}
		};
		zPos = largestZ;
		zPos+=10;
		return zPos;
	}


//=============================================================================
//====== ADDING TASKS =========================================================
//=============================================================================
	$scope.addTask = function() {
		var textInput = $scope.newTask;
		var yPos = space;
		if($scope.addTaskForm.$valid && $scope.newTask != null) {
			var task = {
				task:textInput,
				editing:false,
				colour:colour,
				ID:moment().format("MDDDYYYYHHmmssSSS"),
				xPos:10,
				yPos:yPos,
				zPos:zPos
			};

			//fix bug with double-digit dates messing up length:
			if(task.ID.length > 16) {
				var newID = task.ID;
				var amtToRemove = task.ID.length - 16; 
	   		newID = task.ID.substr(0, task.ID.length-amtToRemove);
	   		task.ID = newID;
			}

			$scope.taskList.push(task);
			bubbalist.taskList.push(task);
			$scope.newTask = "";
			$('.text-feedback').html(maxChars); 
			$scope.toggleMenu();
		} else { 
			$scope.responseNeeded = true;
			smoke.alert("Please enter a task!", function(e){
				$scope.responseNeeded = false;
				$scope.$apply();
			}, { ok: "Okay" });
		}

		if(bubbalist.taskList.length===0) {
			$(".no-tasks-message").show(); //...show no tasks message
			console.log("Showing no tasks message.");
			$(".no-tasks-message").addClass("animated bounceInDown");
			setTimeout(function(){ $(".no-tasks-message").removeClass("animated bounceInDown"); },1000);
		} else $(".no-tasks-message").hide();

		$scope.visTask(task);
	};

	$scope.visTask = function(task) {
		if (task != undefined) {
			$("#noTasksMsg").addClass("animated bounceOutDown");
			$(".no-tasks-message").hide();
			setTimeout(function(){ $("#noTasksMsg").removeClass("animated bounceOutDown"); },2000);
			//* ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~
			//~ * ~ * ~ CREATE TASKY DOM ELEMENTS ~ * ~ * ~ *
			//* ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~
			thisTask = $scope.dataFromID(task.ID);
			///tasky itself (container div):
			var tasky = document.createElement("div");
			tasky.id = task.ID;
			document.getElementById("ngview").appendChild(tasky);
			$("#"+tasky.id).addClass("tasky");
			$("#"+tasky.id).addClass("draggable");
			//handle (invisible div, for dragging):
			var handle = document.createElement("div");
			handle.id = task.ID+"handle";
			document.getElementById(tasky.id).appendChild(handle);
			$("#"+handle.id).addClass("handle");
			//span for task text:
			var taskySpan = document.createElement("span");
			taskySpan.id = task.ID+"span";
			var taskySpanText = document.createTextNode(thisTask.task);
			taskySpan.appendChild(taskySpanText);
			handle.appendChild(taskySpan);
			//edit textarea:
			var taskyEdit = document.createElement("textarea");
			taskyEdit.id = task.ID+"edit";
			var taskyEditPlaceholder = document.createTextNode(thisTask.task);
			taskyEdit.appendChild(taskyEditPlaceholder);
			taskyEdit.setAttribute('maxlength', '100');
			tasky.appendChild(taskyEdit);
			$('#'+taskyEdit.id).addClass('edit-box');
			taskyEdit.setAttribute("rows","6");
			$(taskyEdit).hide();
			//save button:
			var saveBtn = document.createElement("button");
			saveBtn.id = task.ID+"save";
			saveBtn.setAttribute('ng-click', 'doneEditing('+task.ID+')');
			var saveBtnText = document.createTextNode("SAVE");
			saveBtn.appendChild(saveBtnText);
			tasky.appendChild(saveBtn);
			$('#'+saveBtn.id).addClass('save-button edit-form-buttons');
			$(saveBtn).hide();
			//delete button:
			var delBtn = document.createElement("button");
			delBtn.id = task.ID+"del";
			delBtn.setAttribute('ng-click', 'delTask('+task.ID+')');
			var trashIcon = document.createElement("i");
			trashIcon.id = task.ID+"trash";
			$(trashIcon).addClass('fa fa-trash');
			delBtn.appendChild(trashIcon);
			tasky.appendChild(delBtn);
			$('#'+delBtn.id).addClass('delete-button edit-form-buttons');
			$(delBtn).hide();
			//done (check off) button:
			var doneBtn = document.createElement("button");
			doneBtn.id = task.ID+"done";
			doneBtn.setAttribute('ng-click', 'doneTask('+task.ID+')');
			var checkIcon = document.createElement("i");
			checkIcon.id = task.ID+"check";
			$(checkIcon).addClass('fa fa-check');
			doneBtn.appendChild(checkIcon);
			tasky.appendChild(doneBtn);
			$('#'+doneBtn.id).addClass('check-off-button edit-form-buttons');
			$(doneBtn).hide();
			//apply stored styling & position data:
			$('#'+tasky.id).css("top",thisTask.yPos+"px");
			$('#'+tasky.id).css("left",thisTask.xPos+"px");
			$('#'+tasky.id).css("z-index",thisTask.zPos);
			$('#'+tasky.id).css("background-color",thisTask.colour);
			//determine which entrance animation to play:
			if(thisTaskIsNew) {
				$("#"+tasky.id).addClass("animated rollIn");
				setTimeout(function(){ $("#"+tasky.id).removeClass("animated rollIn"); },1000);
			} else {
				$("#"+tasky.id).addClass("animated flipInX");
				setTimeout(function(){ $("#"+tasky.id).removeClass("animated flipInX"); },1000);
			}
			//update position variables for next task:
			if(thisTaskIsNew) { zPos+=10; }
			if(space <= 200) { space += 30; }
			else { space = 20; space += 30; }
			//re-compile div to activate dynamically set ng-clicks:
			setTimeout(function(){ $scope.compile(tasky.id); },200);
			$scope.makeDraggie(thisTask.ID);
			// $scope.thisTaskIsNew = true; //set upfor next task - will be set back to false if another task is loaded from drawTask
			// console.log(tasky);
		}
	}

	$scope.makeDraggie = function(id){
		$('#'+id).draggabilly({
			handle:".handle"
		});
		//keep track of x.pos & y.pos:
  		$('#'+id).on('dragEnd', function() {
			thisTask = $scope.dataFromID(id);
			$scope.taskList[thisTask.i] = thisTask;
			var draggie = $(this).data('draggabilly');
    		$scope.taskList[thisTask.i].xPos = draggie.position.x;
    		$scope.taskList[thisTask.i].yPos = draggie.position.y;
    		bubbalist.taskList.set(thisTask.i, thisTask);
  		});
	}


//=============================================================================
//====== REMOVING TASKS =======================================================
//=============================================================================
	$scope.doneTask = function(id) { 
		$scope.responseNeeded = true;
   	thisTask = $scope.dataFromID(JSON.stringify(id));
   	smoke.confirm("Mark as complete?", function(e){
			if (e){
				$scope.responseNeeded = false;
				$scope.doneEditing(JSON.parse(thisTask.ID));
				$scope.$apply();
				for (var i=0, length = bubbalist.taskList.length; i <= length - 1; i++) {	
					if(bubbalist.taskList.asArray()[i] != undefined && JSON.parse(bubbalist.taskList.asArray()[i].ID) === id) {
						bubbalist.taskList.remove(i);
					}
				};
				for (var i=0, length = $scope.taskList.length; i <= length - 1; i++) {	
					if($scope.taskList[i] != undefined && JSON.parse($scope.taskList[i].ID) === id) {
						$scope.taskList.splice(i,1); 
					}
				};
				completed = true;
				$scope.remTask(id);
			} else {
				$scope.responseNeeded = false;
				thisTask = $scope.dataFromID(JSON.stringify(id));
				$scope.$apply();
			}
		}, { ok: "Yup", cancel: "Nevermind", reverseButtons: true });
	}

	$scope.delTask = function(id) {
		$scope.responseNeeded = true;
   	thisTask = $scope.dataFromID(JSON.stringify(id));
   	// thisTask.editing = false;
   	smoke.confirm("Are you sure?", function(e){
			if (e){
				$scope.responseNeeded = false;
				$scope.doneEditing(JSON.parse(thisTask.ID));
				$scope.$apply();
				for (var i=0, length = bubbalist.taskList.length; i <= length - 1; i++) {
					if(bubbalist.taskList.asArray()[i] != undefined && JSON.parse(bubbalist.taskList.asArray()[i].ID) === id) {
						bubbalist.taskList.remove(i);
					}
				};
				for (var i=0, length = $scope.taskList.length; i <= length - 1; i++) {
					if($scope.taskList[i] != undefined && JSON.parse($scope.taskList[i].ID) === id) {
						$scope.taskList.splice(i,1); 
					}
				};
				deleted = true;
				$scope.remTask(id);
			} else {
				$scope.responseNeeded = false;
				thisTask = $scope.dataFromID(JSON.stringify(id));
				$scope.$apply();
			}
		}, { ok: "Yup", cancel: "Nevermind", reverseButtons: true });
	}

	$scope.clearTasks  = function (){
		$scope.responseNeeded = true;
		if(bubbalist.taskList.length > 0){
			smoke.confirm("Clear all tasks?", function(e){
				if (e){
					$scope.responseNeeded = false;
					$scope.$apply();
					$scope.toggleHelp();
					cleared = true;
					setTimeout(function () { //allow menu to close
					  	for (var i=0, length = $scope.taskList.length; i <= length - 1; i++) {	
							$scope.remTask($scope.taskList[i].ID);
						};
						$scope.taskList.length = 0;
						bubbalist.taskList.length = 0;
					},200);
					setTimeout(function(){
						if(bubbalist.taskList.length===0) { //if this task was that only (last) one...
							setTimeout(function(){
								$(".no-tasks-message").show(); //...show no tasks message
								$(".no-tasks-message").addClass("animated bounceInDown");
							},400);
							setTimeout(function(){ $(".no-tasks-message").removeClass("animated bounceInDown"); },2000);
						}
					},250);
				} else { 
					$scope.responseNeeded = false;
					$scope.$apply();
				}
			}, { ok: "Do it!", cancel: "Nevermind", reverseButtons: true});
		} else { //if user has no tasks
			smoke.alert("You don't have any tasks!", function(e){
				$scope.responseNeeded = false;
				$scope.$apply();
			}, { ok: "Oh yeah . . ." });
		}
	}

	$scope.remTask  = function (id){ //deletes task visually off DOM		
		if(completed) {
			setTimeout(function(){ $("#"+id).addClass("animated rollOut"); },50)
		};
		if(deleted) { $("#"+id).addClass("animated bounceOutDown"); }
		if(cleared) { $("#"+id).addClass("animated flipOutX"); }
		var tasky = document.getElementById(id);
		setTimeout(function(){
			tasky.parentNode.removeChild(tasky);
			deleted = false;
			completed = false;
			clear = false;
		},1000); //time to let animation play
		if(bubbalist.taskList.length===0) { //if this was the last task deleted...
			console.log("Last task was deleted...");
			setTimeout(function(){
				// $(".no-tasks-message").removeClass("animated bounceInDown");
				
				$(".no-tasks-message").addClass("animated bounceInDown");
				$(".no-tasks-message").show(); //...show no tasks message
				console.log("Showing no tasks message.");
			},400);
			setTimeout(function(){ $(".no-tasks-message").removeClass("animated bounceInDown"); },2000);
		}
	}


//=============================================================================
//====== TOGGLE EDITING =======================================================
//=============================================================================
	$scope.startEditing = function (id) {
		$scope.checkIfEditing(); //exit editing other tasks (inc. this one)
		thisTask = $scope.dataFromID(id);
		if(thisTask) {
			bubbalist.taskList.set(thisTask.i, thisTask);
			$scope.taskList[thisTask.i] = thisTask;
			thisTask.editing = true; //(now set it to true^)
			$("#"+thisTask.ID+"edit").show();
			$("#"+thisTask.ID+"save").show();
			$("#"+thisTask.ID+"del").show();
			$("#"+thisTask.ID+"done").show();
			$("#"+thisTask.ID+"handle").hide();
			var origTaskySpan = document.getElementById(thisTask.ID+"span");
			if(origTaskySpan) { $(origTaskySpan).hide(); } //hide current task text
		}
	}

	$scope.stopEditing = function(id){ //'force' stop if started editing another task
		thisTask = $scope.dataFromID(JSON.stringify(id));
		bubbalist.taskList.set(thisTask.i, thisTask);
		$scope.taskList[thisTask.i].task = thisTask.task;
		thisTask.editing = false;
		$("#"+thisTask.ID+"save").hide();
		$("#"+thisTask.ID+"edit").hide();
		$("#"+thisTask.ID+"del").hide();
		$("#"+thisTask.ID+"done").hide();
		$("#"+thisTask.ID+"handle").show();
		var origTaskySpan = document.getElementById(thisTask.ID+"span");
		if(origTaskySpan) { $(origTaskySpan).show(); } //show previous (unedited) text
	}

	$scope.doneEditing = function(id){ //if user clicked save
		thisTask = $scope.dataFromID(JSON.stringify(id));
		thisTask.task = document.getElementById(thisTask.ID+"edit").value;
		bubbalist.taskList.set(thisTask.i, thisTask);
		$scope.taskList[thisTask.i].task = thisTask.task;
		thisTask.editing = false;
		$("#"+thisTask.ID+"save").hide();
		$("#"+thisTask.ID+"edit").hide();
		$("#"+thisTask.ID+"del").hide();
		$("#"+thisTask.ID+"done").hide();
		$("#"+thisTask.ID+"handle").show();
		//if user clicked saved, presumably they made changes, so remove
		//the original task span off DOM & make a new one w/new text
		//(if unedited it will just add same original text back in):
		var origTaskySpan = document.getElementById(thisTask.ID+"span");
		if(origTaskySpan) { origTaskySpan.parentNode.removeChild(origTaskySpan); }
		var newTaskySpan = document.createElement("span");
		newTaskySpan.id = thisTask.ID+"span";
		var newTaskySpanText = document.createTextNode(thisTask.task);
		newTaskySpan.appendChild(newTaskySpanText);
		var handle = document.getElementById(thisTask.ID+"handle");
		handle.appendChild(newTaskySpan);
	}

	$scope.checkIfEditing = function() {
		for (var i=0, length = $scope.taskList.length; i <= length - 1; i++) {	
			if($scope.taskList[i].editing) { //if another task is in edit mode...
				$scope.stopEditing(JSON.parse($scope.taskList[i].ID)); //...exit it
			}
		};
	}


//=============================================================================
//======== COLOUR PICKING =====================================================
//=============================================================================
	var picker = false;

	$scope.togglePicker = function (){
		$scope.showColourPicker();
		picker = !picker;
	}

   $scope.colourSelected = function (newColour){
		colour = newColour;
		$('.colour-picker-button').velocity({ backgroundColor:colour }, { duration: 100 });
		$('.colour-picker-button').addClass("animated rubberBand");
		setTimeout(function() { $('.colour-picker-button').removeClass("animated rubberBand"); },1000);
		$scope.togglePicker();
	}

	$scope.showColourPicker = function () {
		if(!picker) { 
			$( ".colour-picker" ).velocity("slideDown", { duration: 100 })
			$( ".colours" ).velocity("fadeIn", { duration: 50, delay:50 })
		} else {
			$( ".colour-picker" ).velocity("slideUp", { duration: 100, delay:50 })
			$( ".colours" ).velocity("fadeOut", { duration: 50 })
		}
	}


//=============================================================================
//====== HAMMER.JS ============================================================
//=============================================================================
	var mc = new Hammer.Manager(document.body);
	mc.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
	mc.add( new Hammer.Tap({ event: 'tap', taps:1 }) );

	mc.on("doubletap", function(ev) {
		var id;
		if(ev.target.id > 16) {
			var longID = ev.target.id;
	   	var diff = longID.length - 16;
	   	var shortID = longID.substr(0, longID.length-diff);
	   	var id = shortID;
   	} else id = ev.target.id;
		doubleTapEdit.click(id, ev.type);
		tapBringForward.click(id, ev.type); //(call both, since you also want bring forward if editing)
	});

	mc.on("tap", function(ev) {
		var id;
		if(ev.target.id > 16) {
			var longID = ev.target.id;
	   	var diff = longID.length - 16;
	   	var shortID = longID.substr(0, longID.length-diff);
	   	var id = shortID;
   	} else id = ev.target.id;
   	//check if tap is for confirm button (if ev.target.ID begins with 'c' for confirm)
   	//if it is, re-set it to the 16 digit id of the task:
   	if(id[0] === 'c') {
	   	for (var i=0, length = $scope.taskList.length; i <= length - 1; i++) {	
				if($scope.taskList[i].editing) {
					id = $scope.taskList[i].ID;
				}
			};
		}
  		tapBringForward.click(id, ev.type);
	});

	doubleTapEdit.click = function(id, eventType) {
		if(id.length > 16) {
	   	var longID = id;
	   	var diff = longID.length - 16;
	   	var shortID = longID.substr(0, longID.length-diff);
	   	id = shortID;
   	}
		$scope.startEditing(id);
   	$scope.$apply();
	}

	tapBringForward.click = function(id, eventType) {
   	if(id.length > 16) {
	   	var longID = id;
	   	var diff = longID.length - 16;
	   	var shortID = longID.substr(0, longID.length-diff);
	   	var id = shortID;
   	}
		thisTask = $scope.dataFromID(id);
		if(thisTask != undefined) {
	   	zPos = zPos+10;
	   	$('#'+id).css("z-index",zPos);
	   	thisTask.zPos = zPos;
	   	zPos = zPos+10;
	   	bubbalist.taskList.set(thisTask.i, thisTask);
			$scope.taskList[thisTask.i] = thisTask;
	   	$scope.$apply();
	   }
	}


//=============================================================================
//====== MENU ANIMATIONS ======================================================
//=============================================================================
	var menuOpen = false;
	var helpMenuOpen = false;
	var menuSpeed = 400;

	$scope.showAddMenu = function (){
		menuOpen = true;
		if(!helpMenuOpen) { //check that HELP menu is NOT already open
			$( ".toggle-help-button" ).velocity(
			{	top:"4.35em" 	},
			{	duration: menuSpeed });

			$( ".add-task-form" ).velocity(
			{ right: "-1.5em" },
			{ duration: menuSpeed });

			$( ".toggle-menu-button" ).velocity(
			{	right: "83%",
				top:"20px",
				backgroundColor:"#FF75B3",
				rotateZ:"45"},
			{	duration: menuSpeed });

			$( ".plus-icon" ).velocity(
			{	marginLeft:"-2",
				paddingTop:"5" },
			{	duration: menuSpeed });
		} else { //if HELP menu IS already open...
			$scope.toggleHelp(); //...close it

			$( ".add-task-form" ).velocity(
			{ right: "-1.5em" },
			{ duration: menuSpeed });

			$( ".toggle-menu-button" ).velocity(
			{	right: "83%",
				top:"20px",
				backgroundColor:"#FF75B3",
				rotateZ:"45" },
			{	duration: menuSpeed });
		}
	};

	$scope.hideAddMenu = function (){
		menuOpen = false;

		$( ".add-task-form" ).velocity(
		{ right: "-105%" },
		{ duration: menuSpeed });

		$( ".toggle-menu-button" ).velocity(
		{	right: "0.25em",
			top:"0.25em",
			backgroundColor: "#E5B2FF",
			rotateZ:"90" },
		{	duration: menuSpeed });

		if(!helpMenuOpen) { //if HELP menu is NOT opening in place of ADD TASK...
			$scope.shiftHelpButtonUp(); //...return help button to usual position
		}
	};

	$scope.showHelpMenu = function (){
			helpMenuOpen = true;

			setTimeout(function () {
				$( ".toggle-help-button" ).find($(".fa")).removeClass('fa-question').addClass('fa-times')
			},200);

			if(menuOpen) {	//check if ADD TASK menu is already open...
				$scope.toggleMenu(); //...and if it is, close it

				$( ".help-form" ).velocity(
				{ 	right:"-1.5em" },
				{ 	duration: menuSpeed });

				$( ".toggle-help-button" ).velocity(
				{	right: "83%",
					top:"1.65em",
					backgroundColor:"#FF75B3"	},
				{	duration: menuSpeed });
			} else {
				$( ".help-form" ).velocity(
				{ right:"-1.5em" },
				{ duration: menuSpeed });

				$( ".toggle-help-button" ).velocity(
				{	right: "83%",
					backgroundColor:"#FF75B3"	},
				{	duration: menuSpeed });
			}
		// }
	};

	$scope.hideHelpMenu = function (){
		helpMenuOpen = false;

		setTimeout(function () {
			$( ".toggle-help-button" ).find($(".fa")).removeClass('fa-times').addClass('fa-question')
		},200);

		$( ".help-form" ).velocity(
		{ right:"-105%" },
		{ duration: menuSpeed });

		if(menuOpen) {
			$( ".toggle-help-button" ).velocity(
			{	right: "0.25em",
				top:"4.35em",
				backgroundColor: "#5DF5ED" },
			{	duration: menuSpeed });
		} else {
			$( ".toggle-help-button" ).velocity(
			{	right: "0.25em",
				top:"1.65em",
				backgroundColor: "#5DF5ED" }, 
			{	duration: menuSpeed });
		}
	};

	$scope.exitEditMode = function () {
		for (var j=0, length = $scope.taskList.length; j <= length - 1; j++) {	
			if($scope.taskList[j] != null){
				if($scope.taskList[j].editing = true) {
					$scope.taskList[j].editing = false;
				}
			}
		};
	}

	$scope.shiftHelpButtonUp = function () {
		$( ".toggle-help-button" ).velocity(
		{	top:"1.65em" 	}, 
		{	duration: menuSpeed });
	}

	$scope.toggleMenu = function (){
		if(!menuOpen) {
			$scope.showAddMenu();
		} else if(menuOpen) {
			$scope.hideAddMenu();
		}
	};

	$scope.toggleHelp = function (){
		if(!helpMenuOpen) { 
			$scope.showHelpMenu();
		} else if(helpMenuOpen) { 
			$scope.hideHelpMenu();
		}
	};


//=============================================================================
//====== REFERENCED FUNCTIONS =================================================
//=============================================================================
	//Character counter tutorial reference:
	//Part 1: http://www.youtube.com/watch?v=13bceSHothY
	//Part 2: http://www.youtube.com/watch?v=BqcI0N87Xzw
	var maxChars = 100;
	$('.text-feedback').html(maxChars);
	$('.task-input').keyup(function() {
		var curChars = $('.task-input').val().length;
		var charsRemaining = maxChars - curChars;
		$('.text-feedback').html(charsRemaining);
	});
	//End character counter tutorial reference

	//Compile function reference (for activating dynamically set ng-click attribute)
	//Source: http://stackoverflow.com/questions/25759497/angularjs-dynamically-set-attribute
	$scope.compile = function(id) {
		var el = angular.element('#'+id);
		$scope = el.scope();
		$injector = el.injector();
		$injector.invoke(function($compile){ $compile(el)($scope); });
	}
	//End compile function reference.
});