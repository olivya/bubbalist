bubbalist.controller('mainController', function($scope, $location, $timeout) {
	$scope.taskList = [];
	var colour = '#25d7ec';
	var opacity;
	//Variables for updating DOM:
	var zIndex = 0;
	var zIndexMenus = 10;
	var zIndexColourPicker = 20;
	var setZ;
	var holdSetZ;
	var setMenuZ;
	var colourPickerSetZ;
	var alertZ;
	var updateBGColour;
	var space = 20;
	var increaseSpace;	
//=============================================================================
//====== CHECK IF NO TASKS (to show 'no tasks' message) =======================
//=============================================================================
	$scope.checkForTasks = function (){
		console.log('$scope.checkForTasks()');
		if ($scope.taskList.length === 0) {
				$scope.noTasks = true;
			}
		else $scope.noTasks = false;
		var items = document.querySelectorAll('.tasky');
	};
	$scope.checkForTasks(); //NEED THIS or first task goes weird
//=============================================================================
//====== ON STARTUP... ========================================================
//=============================================================================
//REALTIME API (runs on reload)
	bubbalist.updateTasks = function() { //not getting called
		$scope.taskList = bubbalist.taskList.asArray();
		$scope.$apply();
		console.log("bubbalist.updateTasks()", $scope.taskList);
		$scope.newTask = "";
		$('.text-feedback').html(maxChars);
		$scope.drawTasks();
		console.log("READY!\n~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~\n "); //<--- this is when loading screen can stop <--- 
   };
   //Draws stored tasks on reload:
   $scope.drawTasks = function() {
   	j = 1;
   	for (var i=0, length = bubbalist.taskList.length; i <= length - 1; i++) {	
			if(bubbalist.taskList.asArray()[i] != null) {
				j++;
				$scope.visTask(bubbalist.taskList.asArray()[i]);
			}
		};
   }
//=============================================================================
//====== ADDING TASKS =========================================================
//=============================================================================
	//STEP 1: PUSH TO LISTS
	$scope.addTask = function() {
		var textInput = $scope.newTask;
		var yPos = space;
		if($scope.addTaskForm.$valid && $scope.newTask != null) {
			var task = {
				task:textInput,
				editing:false,
				colour:colour,
				ID:moment().format("MDdYYYYHHmmssSSS"),
				xPos:10,
				yPos:yPos
			};
			console.log('x:',task.xPos,"y:",task.yPos);
			$scope.taskList.push(task); //for angular/scope/DOM
			bubbalist.taskList.push(task); //for drive.js
			$scope.newTask = ""; //reset textbox
			$('.text-feedback').html(maxChars); //reset char count
			setTimeout($scope.toggleMenu,100); //close menu after a moment
		}
		else { //if user didn't input anything...
			$scope.responseNeeded = true; //put faded div on screen
			smoke.alert("Please enter a task!", function(e){
				$scope.responseNeeded = false;
				$scope.$apply();
			}, { ok: "Okay" });
		}
		$scope.visTask(task); //now render on DOM the task just pushed above ^
	};
	//return task obj parameters:
	$scope.dataFromID = function (id) {
		for (var i=0, length = $scope.taskList.length; i <= length - 1; i++) {	
			if($scope.taskList[i].ID === id) {
				var task = $scope.taskList[i].task;
				var editing = $scope.taskList[i].editing;
				var colour = $scope.taskList[i].colour;
				var ID = $scope.taskList[i].ID;
				var xPos = $scope.taskList[i].xPos;
				var yPos = $scope.taskList[i].yPos;
				return {
					task:task, editing:editing, colour:colour, ID:ID, i:i, xPos:xPos, yPos:yPos
				};
			}
		};
	}
	// STEP 2: render task on DOM ("task"= task obj data, "tasky"= visual task on DOM/HTML)
	$scope.visTask = function(task) {
		thisTask = $scope.dataFromID(task.ID);
		//1. create & add tasky div:
		var tasky = document.createElement("div");
		tasky.id = task.ID;
		document.getElementById("ngview").appendChild(tasky);
		$("#"+tasky.id).addClass("tasky"); //for styling
		$("#"+tasky.id).addClass("draggable"); //for styling
		//2. create & add user-inputted task into a span
		var taskySpan = document.createElement("span");
		taskySpan.id = task.ID+"span";
		var taskySpanText = document.createTextNode(thisTask.task);
		taskySpan.appendChild(taskySpanText);
		tasky.appendChild(taskySpan); //add to above div
		//4. create delete button (w/unique ID) & append to tasky div
		var delBtn = document.createElement("button");
		delBtn.id = task.ID+"del";
		delBtn.setAttribute('ng-click', 'delTask('+task.ID+')');
		var delBtnText = document.createTextNode("DELETE");
		delBtn.appendChild(delBtnText);
		tasky.appendChild(delBtn);
		//6. create textarea for editing
		var taskyEdit = document.createElement("textarea");
		taskyEdit.id = task.ID+"edit";
		taskyEdit.setAttribute('value', thisTask.task);
		tasky.appendChild(taskyEdit);
		$(taskyEdit).hide(); //(hidden until user enters edit mode)
		//7. create save button for editing
		var saveBtn = document.createElement("button");
		saveBtn.id = task.ID+"save";
		saveBtn.setAttribute('ng-click', 'doneEditing('+thisTask.ID+')');
		var saveBtnText = document.createTextNode("save");
		saveBtn.appendChild(saveBtnText);
		tasky.appendChild(saveBtn);
		$(saveBtn).hide(); //(hidden until user enters edit mode)
		//set position:
		$('#'+tasky.id).css("top",thisTask.yPos+"px");
		$('#'+tasky.id).css("left",thisTask.xPos+"px");
		//update space variable so next task is not directly over-top of this one:
		if(space <= 200) {
			space += 40;
		} else {
			space = 15; //start layering back at top
			space += 40;
		}
		//7. recompile div, to activate ng-click functionality on buttons:
		setTimeout(function(){ $scope.compile(tasky.id); },200);
		//8. call function to make tasky draggable:
		$scope.makeDraggie(thisTask.ID);
		// console.log("tasky code: ",tasky); //check html code
	}

	$scope.makeDraggie = function(id){
		$('#'+id).draggabilly();
		//triggered when drag ends & updates positioning:
  		$('#'+id).on('dragEnd', function() {
			thisTask = $scope.dataFromID(id);
			$scope.taskList[thisTask.i] = thisTask;
			var draggie = $(this).data('draggabilly');
			//update arrays:
    		$scope.taskList[thisTask.i].xPos = draggie.position.x;
    		$scope.taskList[thisTask.i].yPos = draggie.position.y;
    		bubbalist.taskList.set(thisTask.i, thisTask);
  		});
	}

	$scope.delTask = function(id) { //deletes tasks from arrays (not DOM yet)
		console.log(" \nDELETING task w/ID",id,"...");
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
		$scope.remTask(id);
	}

	$scope.remTask  = function (id){ //deletes task visually off DOM
		var tasky = document.getElementById(id);
		tasky.parentNode.removeChild(tasky);
	}
//=============================================================================
//====== TOGGLE EDITING =======================================================
//=============================================================================
	$scope.startEditing = function (id) {
		thisTask = $scope.dataFromID(id);
		if(thisTask) { //remove after fixing hammer.js
			bubbalist.taskList.set(thisTask.i, thisTask);
			$scope.taskList[thisTask.i] = thisTask;
			$("#"+id+"edit").show();
			$("#"+id+"save").show();
			//rm original span (will make new one on save):
			var origTaskySpan = document.getElementById(thisTask.ID+"span");
			origTaskySpan.parentNode.removeChild(origTaskySpan);
		}
	}

	$scope.doneEditing = function(id){
		thisTask = $scope.dataFromID(JSON.stringify(id));
		//grab new task text:
		thisTask.task = document.getElementById(thisTask.ID+"edit").value;
		//set new task value in arrays:
		bubbalist.taskList.set(thisTask.i, thisTask);
		$scope.taskList[thisTask.i].task = thisTask.task;
		//hide editing stuff:
		$("#"+thisTask.ID+"save").hide();
		$("#"+thisTask.ID+"edit").hide();
		//add new span w/edited task (if unedited will just add same text back in):
		var newTaskySpan = document.createElement("span");
		newTaskySpan.id = thisTask.ID+"span";
		var newTaskySpanText = document.createTextNode(thisTask.task);
		newTaskySpan.appendChild(newTaskySpanText);
		var delBtn = document.getElementById(thisTask.ID+"del");
		var tasky = document.getElementById(thisTask.ID);
		tasky.insertBefore(newTaskySpan, delBtn);
	}

//=============================================================================
//====== HAMMER.JS ============================================================
//=============================================================================
	var mc = new Hammer.Manager(document.body);
	mc.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
	mc.add( new Hammer.Tap({ event: 'tap', taps:1 }) );

	//DOUBLE TAP to toggle edit mode:
	mc.on("doubletap", function(ev) {
		doubleTapEdit.click(ev.target.id, ev.type);
		tapBringForward.click(ev.target.id, ev.type); //(also bring forward if editing)
		//console.log("ev.target.id=",ev.target.id,"// ev.type=",ev.type);
	});

	doubleTapEdit.click = function(id, eventType) { //orig function in 'orig hammer js fns'
		// console.log("EDIT i=",i,"// eventType=",eventType);
		$scope.startEditing(id);
   	$scope.$apply();
	}

	//TAP to bring event to front:
	mc.on("tap", function(ev) {
  		tapBringForward.click(ev.target.id, ev.type); //calls tapBringForward function w/hammer (touch) data
  		// console.log("ev.target.id=",ev.target.id,"// ev.type=",ev.type);
	});

	tapBringForward.click = function(i, eventType) { //orig function in 'orig hammer js fns'
   	id = i;
   	// updateBGColour = $("#"+id).toggleClass("testBG");
   	$scope.$apply();
	}
//==========================================================================================================================
//====== GOOD TO GO (for now): =============================================================================================
//==========================================================================================================================

	//Begin compile function reference (for activating dynamically set ng-click attribute)
	//Source: http://stackoverflow.com/questions/25759497/angularjs-dynamically-set-attribute
	$scope.compile = function(id) {
		var el = angular.element('#'+id);
		$scope = el.scope();
		$injector = el.injector();
		$injector.invoke(function($compile){ $compile(el)($scope); });
	}
	//End compile function reference.

   $scope.colourSelected = function (pickedColour){
		console.log('$scope.colourSelected(pickedColour)');

		colour = pickedColour;
		console.log("User selected #"+pickedColour+"; var colour = ",colour);
		$('.colour-picker-button').css("background-color",colour); //update button colour for feedback
		$scope.showColourPicker = false;
	}

	$scope.updateMenuZ = function (){ //always ensures menus are on top
		console.log('$scope.updateMenuZ()');

		zIndexMenus = zIndex + 15;
		menuSetZ = $('.add-task-form').css("z-index",zIndexMenus);
		menuSetZ = $('.help-form').css("z-index",zIndexMenus);
		zIndexColourPicker = zIndexMenus + 15;
		colourPickerSetZ = $('.colour-picker').css("z-index",zIndexColourPicker);
	}

//=============================================================================
//====== CHARACTER COUNTER ====================================================
//=============================================================================
	//Begin character counter tutorial reference:
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

//=============================================================================
//======== COLOUR PICKER ======================================================
//=============================================================================
$scope.showPicker = function (){
	console.log('$scope.showPicker()');

	$scope.showColourPicker = true;
	var height1 = $('.add-task-form').height();
	var height2 = $('#colour1').height();
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
		}

		else { //if HELP menu IS already open...
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
		}

		else {
			$( ".help-form" ).velocity(
			{ right:"-1.5em" },
			{ duration: menuSpeed });

			$( ".toggle-help-button" ).velocity(
			{	right: "83%",
				backgroundColor:"#FF75B3"	},
			{	duration: menuSpeed });
		}
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
				backgroundColor: "#38FFE1" },
			{	duration: menuSpeed });
		}

		else {
			$( ".toggle-help-button" ).velocity(
			{	right: "0.25em",
				top:"1.65em",
				backgroundColor: "#38FFE1" }, 
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
		$scope.exitEditMode();

		if(!menuOpen) {
			$scope.showAddMenu();
		}

		else if(menuOpen) {
			$scope.hideAddMenu();
		}
	};

	$scope.toggleHelp = function (){
		$scope.exitEditMode();

		if(!helpMenuOpen) { 
			$scope.showHelpMenu();
		}

		else if(helpMenuOpen) { 
			$scope.hideHelpMenu();
		}
	};

//=============================================================================
//====== DELETING/MARKING AS COMPLETE (prob will be deleted) ==================
//=============================================================================

	$scope.deleteTask = function (i){ //i = $index from home.html
		console.log('$scope.deleteTask(i)');

		$scope.responseNeeded = true; //throw up faded div
   	smoke.confirm("Are you sure?", function(e){
			if (e){
				console.log("Task \""+$scope.taskList[i].task+"\" was deleted");
				$scope.responseNeeded = false; //remove faded div
				$scope.$apply();
				$scope.taskList[i] = null;
		 		var items = document.querySelectorAll('.tasky');
			 		for (var j=0, length = $scope.taskList.length; j <= length - 1; j++) {
			 			if ($scope.taskList[j] === null) { //ensure task[j] hasn't already been deleted (to avoid error)
			 				$(items[j]).addClass("deleted");
			 		}
		 		}
				$scope.checkForTasks();
				} else {
					$scope.responseNeeded = false;
					$scope.$apply();
				}}, { ok: "Yup", cancel: "Nevermind", reverseButtons: true });
   };

   //MARK TASK AS COMPLETED
	$scope.doneTask = function (i){ //i = $index from home.html
	 	console.log('$scope.doneTask(i)');

	 	$scope.responseNeeded = true; //throw up faded div
	   	smoke.confirm("Mark as complete?", function(e){
				if (e){
					$scope.responseNeeded = false; //remove faded div
					$scope.$apply();
				 	console.log($scope.responseNeeded);
					$scope.taskList[i] = null;
			 		var items = document.querySelectorAll('.tasky');
				 		for (var j=0, length = $scope.taskList.length; j <= length - 1; j++) {
				 			if ($scope.taskList[j] === null) { //ensure task[j] hasn't already been deleted (to avoid error)
				 				$(items[j]).addClass("deleted");
				 		}
				 	}
				$scope.checkForTasks();
				} else {
					$scope.responseNeeded = false; //remove faded div
					$scope.$apply();
				 	console.log($scope.responseNeeded);
				}}, { ok: "Yup", cancel: "Nevermind", reverseButtons: true });
   };
});