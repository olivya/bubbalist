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
	var space = 0;
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
		console.log("READY!"); //<--- this is when loading screen can stop <--- 
   };
   //Draws stored tasks on reload:
   $scope.drawTasks = function() {
   	j = 1;
   	for (var i=0, length = bubbalist.taskList.length; i <= length - 1; i++) {	
			if(bubbalist.taskList.asArray()[i] != null) {
				console.log("FOUND TASK: \""+bubbalist.taskList.asArray()[i].task+"\"");
				j++;
				$scope.visTask(bubbalist.taskList.asArray()[i]);
			}
		};
		console.log("Added",j,"tasks :D");
   }
//=============================================================================
//====== ADDING TASKS =========================================================
//=============================================================================
	//STEP 1: PUSH TO LISTS
	$scope.addTask = function() {
		var textInput = $scope.newTask;
		if($scope.addTaskForm.$valid && $scope.newTask != null) {
			var task = {
				task:textInput,
				editing:false,
				colour:colour,
				ID:moment().format("MDdYYYYHHmmssSSS")
			};
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

	//STEP 2: render task on DOM
	$scope.visTask = function(task) {
		//1. create & add tasky div (bubble/container):
		var tasky = document.createElement("div");
		tasky.id = task.ID; //setting css ID of div to task's ID generated above by moment.js
		document.getElementById("ngview").appendChild(tasky); //append tasky div to ng-view div (in index.html)
		//2. create & append taskySpan to tasky div:
		var taskySpan = document.createElement("span"); //create span to inject task text into
		document.getElementById(''+tasky.id+'').appendChild(taskySpan); //append this span to the div above using its ID
		//3. add task text node & append to taskySpan:
		var taskyText = document.createTextNode(task.task); //create text node w/user inputted text
		taskySpan.appendChild(taskyText); //adding ^ user-inputted text ^ to tasky span within tasky div
		//4. create delete button (w/unique ID) & append to tasky div
		var delBtn = document.createElement("button");
		delBtn.setAttribute('ng-click', 'delTask('+tasky.id+')'); //inject taskID into delTask() so it will only delete this task
		var delBtnText = document.createTextNode("DELETE");
		delBtn.appendChild(delBtnText); //add text to button
		tasky.appendChild(delBtn); //add button to tasky
		//5. add .tasky class for styling
		$("#"+tasky.id).addClass("tasky");
		//6. (check)
		console.log("ADDING TASKY: ",tasky);
		//7. recompile div, to activate ng-click functionality on button
		//(reference for compile function is below)
		setTimeout(function () { $scope.compile(tasky.id); },500);
	}

	//Begin compile function reference (for activating dynamically set ng-click attribute)
	//Source: http://stackoverflow.com/questions/25759497/angularjs-dynamically-set-attribute
	$scope.compile = function (id) {
		var el = angular.element('#'+id);
		$scope = el.scope();
		$injector = el.injector();
		$injector.invoke(function($compile){ $compile(el)($scope); });
	}
	//End compile function reference.

	$scope.delTask = function(id) { //deletes tasks from arrays (not DOM yet)
		console.log(" \nDELETING task w/ID",id,"...");
		console.log("bb length START:",bubbalist.taskList.asArray().length);
		for (var i=0, length = bubbalist.taskList.length; i <= length - 1; i++) {	
			if(bubbalist.taskList.asArray()[i] != undefined && JSON.parse(bubbalist.taskList.asArray()[i].ID) === id) {
				console.log("FOUND, deleting \'"+bubbalist.taskList.asArray()[i].task+"\'");
				bubbalist.taskList.remove(i);
			} //else { console.log("NOPE (BB)"); }	
		};
		console.log("bb length END:",bubbalist.taskList.asArray().length,"\n ");

		console.log("$scope length START:",$scope.taskList.length);
		for (var i=0, length = $scope.taskList.length; i <= length - 1; i++) {	
			if($scope.taskList[i] != undefined && JSON.parse($scope.taskList[i].ID) === id) { //if this task is NOT null
				console.log("FOUND, deleting \'"+$scope.taskList[i].task+"\'");
				console.log('======================================\nTASK DELETED ($scope)\n======================================');
				$scope.taskList.splice(i,1); //,1 or will delete ALL after index i
			} //else { console.log("NOPE ($SCOPE)"); }
		};
		console.log("$scope length END:",$scope.taskList.length,"\n ");
		//DOUBLE-CHECK THEY'RE SAME:
		console.log("$scope.taskList is now... ",$scope.taskList);
		console.log("bubbalist.taskList.asArray() is now... ",bubbalist.taskList.asArray());

		$scope.remTask(id); //now actually remove visually from DOM
	}

	$scope.remTask  = function (id){ //deletes task visually off DOM
		console.log("Removing task",id,"from DOM...");
		var tasky = document.getElementById(id);
		tasky.parentNode.removeChild(tasky);
	}

	$scope.clearTasks = function() {
		console.log('$scope.clearTasks()');
		$scope.taskList.length = 0;
		bubbalist.taskList.length = 0;
	}

//====== [ old styling ] =================================================

//=============================================================================
//====== HAMMER.JS ============================================================
//=============================================================================
	var mc = new Hammer.Manager(document.body);
	mc.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
	mc.add( new Hammer.Tap({ event: 'tap', taps:1 }) );

	//DOUBLE TAP to toggle edit mode:
	mc.on("doubletap", function(ev) {
		console.log("ev.target.id",ev.target.id);
		doubleTapEdit.click(ev.target.id, ev.type);
		tapBringForward.click(ev.target.id, ev.type); //(also bring forward if editing)
		// console.log("ev.target.id=",ev.target.id,"// ev.type=",ev.type);
	});

	doubleTapEdit.click = function(i, eventType) { //orig function in 'orig hammer js fns'
		console.log("EDIT i=",i,"// eventType=",eventType);
		// console.log($scope.taskList[i]); //will be undefined b/c i is ID now, not index pos
		$scope.startEditing(i);
   	$scope.$apply();
	}

	//TAP to bring event to front:
	mc.on("tap", function(ev) {
  		tapBringForward.click(ev.target.id, ev.type); //calls tapBringForward function w/hammer (touch) data
  		// console.log("ev.target.id=",ev.target.id,"// ev.type=",ev.type);
	});

	tapBringForward.click = function(i, eventType) { //orig function in 'orig hammer js fns'
   	id = i;
   	updateBGColour = $("#"+id).toggleClass("testBG");
   	$scope.$apply();
	}

//=============================================================================
//====== TOGGLE EDITING =======================================================
//=============================================================================

	$scope.startEditing = function (i){
		console.log("starting to edit ID",i);
		var tasky = document.getElementById(id);
		console.log(tasky);
	}

// === orig toggle editing fns ===

//==========================================================================================================================
//====== GOOD TO GO (for now): =============================================================================================
//==========================================================================================================================
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