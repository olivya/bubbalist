bubbalist.controller('mainController', function($scope, $location, $timeout) {
	$scope.taskList = [];
	var colour = '#25d7ec';
	var opacity;

	//LAYERING STUFF:
	var zIndex = 0;
	var zIndexMenus = 10;
	var zIndexColourPicker = 20;
	var setZ;
	var holdSetZ;
	var setMenuZ;
	var colourPickerSetZ;
	var alertZ;

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

	$scope.checkForTasks();






//=============================================================================
//====== ADDING TASKS =========================================================
//=============================================================================

//REALTIME API (runs on reload only)
	bubbalist.updateTasks = function() { //not getting called
		$scope.taskList = bubbalist.taskList.asArray();
		$scope.$apply();
		console.log("bubbalist.updateTasks()", $scope.taskList);
		$scope.newTask = "";
		$('.text-feedback').html(maxChars);
		$scope.drawTasks();

		console.log("READY!"); //this is when loading screen can stop 
   };

   $scope.drawTasks = function() {
   	j = 1;
   	for (var i=0, length = bubbalist.taskList.length; i <= length - 1; i++) {	
			if(bubbalist.taskList.asArray()[i] != null) {
				console.log("FOUND",j,"TASK(s) TO DRAW:",bubbalist.taskList.asArray()[i].task);
				j++;
				$scope.visTask(bubbalist.taskList.asArray()[i]);
			}
		};
   }

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

			$scope.taskList.push(task);
			bubbalist.taskList.push(task);

			$scope.newTask = "";
			$('.text-feedback').html(maxChars);
			setTimeout($scope.toggleMenu,100);
		}
		else {
			$scope.responseNeeded = true; //put faded div on screen
			smoke.alert("Please enter a task!", function(e){
				$scope.responseNeeded = false;
				$scope.$apply(); },
				{ ok: "Okay" });
		}
		$scope.visTask(task);
	};

	//STEP 2: "visualize task" (render on DOM)
	$scope.visTask = function(task) {
		//create task
		var tasky = document.createElement("div");
		tasky.id = task.ID; //setting ID of div to task's moment.js ID
		var taskyText = document.createTextNode(task.task);
		tasky.appendChild(taskyText); //adding ^user-inputted text to tasky div
		id = tasky.id;
		
		//create delete button (w/unique ID)
		var delBtn = document.createElement("button");
		delBtn.setAttribute('ng-click', 'delTask('+id+')'); //inject taskID into delete button so it will only delete this task
		var delBtnText = document.createTextNode("DELETE");
		delBtn.appendChild(delBtnText);
		tasky.appendChild(delBtn);
		
		console.log("ADDING TASKY: ",tasky);
		document.getElementById("ngview").appendChild(tasky);

		//compile to activate ng-click on div
		setTimeout(function () {
			$scope.compile(tasky.id);
		},1000);
	}

	//Begin compile function reference:
	//Source: http://stackoverflow.com/questions/25759497/angularjs-dynamically-set-attribute
	$scope.compile = function (id) {
		var el = angular.element('#'+id);
		$scope = el.scope();
		$injector = el.injector();
		$injector.invoke(function($compile){
	   	$compile(el)($scope);
		});
	}
	//End compile function reference.

	$scope.delTask = function(id) { //deletes tasks FROM ARRAYS (not DOM)
		console.log("Deleting task ID",id,"...");
		
		console.log("bubbalist.taskList.length START: ",bubbalist.taskList.asArray().length);
		for (var i=0, length = bubbalist.taskList.length; i <= length - 1; i++) {	
			if(bubbalist.taskList.asArray()[i] != undefined && JSON.parse(bubbalist.taskList.asArray()[i].ID) === id) {
				console.log("FOUND, deleting task \'",bubbalist.taskList.asArray()[i].task,"\'");
				bubbalist.taskList.remove(i);
			} //else { console.log("NOPE (BB)"); }	
		};
		console.log("bubbalist.taskList.length END: ",bubbalist.taskList.asArray().length,"\n ");

		console.log("$scope.taskList.length START: ",$scope.taskList.length);
		for (var i=0, length = $scope.taskList.length; i <= length - 1; i++) {	
			if($scope.taskList[i] != undefined && JSON.parse($scope.taskList[i].ID) === id) { //if this task is NOT null
				console.log("FOUND, deleting task \'",$scope.taskList[i].task,"\'");
				$scope.taskList.splice(i,1); //,1 or will delete ALL after index i
			} //else { console.log("NOPE ($SCOPE)"); }
		};
		console.log("$scope.taskList.length END: ",$scope.taskList.length);

		//CHECK THEY'RE SAME:
		console.log("$scope.taskList is now... ",$scope.taskList);
		console.log("bubbalist.taskList.asArray() is now... ",bubbalist.taskList.asArray());

		$scope.remTask(id);
	}

	$scope.remTask  = function (id){ //deletes task visually off DOM
		console.log("remTask",id);

		var tasky = document.getElementById(id);
		tasky.parentNode.removeChild(tasky);
	}







	$scope.clearTasks = function() {
		console.log('$scope.clearTasks()');
		$scope.taskList.length = 0;
		bubbalist.taskList.length = 0;
	}

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






//====== [ old styling ] =================================================




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
//====== TOGGLE EDITING =======================================================
//=============================================================================
	$scope.toggleEditModeOn = function (i){
		console.log('$scope.toggleEditModeOn()');

		//check first that nothing else is in edit mode
		for (var j=0, length = $scope.taskList.length; j <= length - 1; j++) {	
			if($scope.taskList[j] != null) { //if this task is NOT null...
				if($scope.taskList[j].editing = true) { //...and is in edit mode...
					$scope.taskList[j].editing = false; //disable edit mode.
				}
			}
		};
		$scope.taskList[i].editing = !$scope.taskList[i].editing;
	};

	$scope.toggleEditModeOff = function (i){
		console.log('$scope.toggleEditModeOff()');

		$scope.taskList[i].editing = false;
		console.log("Text after editing: \""+$scope.taskList[i].task+"\"");
	};






//=============================================================================
//====== DELETING/MARKING AS COMPLETE =========================================
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
//====== HAMMER.JS ============================================================
//=============================================================================
	var mc = new Hammer.Manager(document.body);
	mc.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
	mc.add( new Hammer.Tap({ event: 'tap', taps:1 }) );

	//DOUBLE TAP to toggle edit mode:
	mc.on("doubletap", function(ev) {
		doubleTapEdit.click(ev.target.id, ev.type);
		tapBringForward.click(ev.target.id, ev.type);
	});

	doubleTapEdit.click = function(i, eventType) {
   	if($scope.taskList[i] != undefined) {
   		$scope.toggleEditModeOn(i);
   	}
   	$scope.$apply();
	}

	//TAP to bring event to front:
	mc.on("tap", function(ev) {
  		tapBringForward.click(ev.target.id, ev.type);
	});

	tapBringForward.click = function(i, eventType) {
   	holdSetZ = $('#task'+i).css("z-index",zIndex);
   	zIndex += 10;
   	// $scope.updateMenuZ();
   	$scope.$apply();
	}
});