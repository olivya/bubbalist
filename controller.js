bubbalist.controller('mainController', function($scope, Tasks, Colours, $location, $timeout) {

	// $scope.message = 'Task:';
	$scope.taskList = Tasks.all();
	$scope.colourList = Colours.all();

	var i = 0;
	var colour;
	var colourIndex = 0;

	var opacity;

	var zIndex = 0;
	var setZ;
	var holdSetZ;

	var space = 0;
	var increaseSpace;

	// $scope.noTasks = true;

	$scope.checkForTasks = function (){
		if ($scope.taskList.length === 0) {
				$scope.noTasks = true;
			}
		else $scope.noTasks = false;

		var items = document.querySelectorAll('.tasky');

		// if(items.length === 0) {
		// 	$scope.noTasks = true;
		// } else { 
		//  	for (var j=0, length = $scope.taskList.length; j <= length - 1; j++) {
		//  		if ($scope.taskList[j] != null) { //ensure task[j] hasn't already been deleted (to avoid error)
		//  			$scope.noTasks = false;
		//  		} else $scope.noTasks = true;
		//  	}
		// };

	};

	$scope.checkForTasks();

	//DELETE TASK:
	$scope.deleteTask = function (i){ //i = $index from home.html
    	if (confirm("Are you sure you want to delete this task?") == true) {
	 		$scope.taskList[i] = null;

	 		var items = document.querySelectorAll('.tasky');
		 		for (var j=0, length = $scope.taskList.length; j <= length - 1; j++) {
		 			if ($scope.taskList[j] === null) { //ensure task[j] hasn't already been deleted (to avoid error)
		 				$(items[j]).addClass("deleted");
		 		}
		 	}
			$scope.checkForTasks();
		}
   };

   //MARK TASK AS COMPLETED
	$scope.doneTask = function (i){ //i = $index from home.html
    	if (confirm("Mark this task as completed?") == true) {
	 		$scope.taskList[i] = null;

	 		var items = document.querySelectorAll('.tasky');
		 		for (var j=0, length = $scope.taskList.length; j <= length - 1; j++) {
		 			if ($scope.taskList[j] === null) { //ensure task[j] hasn't already been deleted (to avoid error)
		 				$(items[j]).addClass("deleted");
		 		}
		 	}
			$scope.checkForTasks();
		}
   };
	//STEP 1: ADD TASK:
	$scope.addTask = function() {
		$( ".add-task-button" ).addClass( "button-pressed" );

		setTimeout(function (){
				$(  ".add-task-button"  ).removeClass( "button-pressed" );
			},200);

		if($scope.addTaskForm.$valid && $scope.newTask != null) {
				$scope.taskList.push(
				{
					task:$scope.newTask,
					editing:false,
					index:i
				});
			// i = $scope.taskList.map(function(i) { return i.i; }).indexOf($scope.newTask);
			// console.log("i "+i);

			$scope.newTask = "";
			$scope.checkForTasks();
			$('.text-feedback').html(maxChars);

			setTimeout($scope.toggleMenu,100);
			setTimeout($scope.iterateTasks, 5);
			setTimeout($scope.setStyle,5);
		}
		else {
			alert("Please enter a task!");
		}
	};


	$scope.setStyle = function(){
		setTimeout(function (){
				$(  ".task"  ).removeClass( "hide" );
			},200);

		//ensure new task is on top
		setZ = $('#task'+i).css("z-index",zIndex);
		zIndex+=10; //NEXT z
		
		//ensure new task is not directly over-top of previous
		if(space <= 200) {
			increaseSpace = $('#task'+i).css("top",space+"px");
			space += 40;
		} else {
			space = 15; //start layering back at top
			increaseSpace = $('#task'+i).css("top",space+"px");
			space += 40;
		}

		//cycle through background colours
		setTimeout(function (){
			if(colourIndex < $scope.colourList.length) {
				 	colour = $('#task'+i).css("background-color",$scope.colourList[colourIndex]);
				 	colourIndex++;
				}
				else if (colourIndex >= $scope.colourList.length) {
					colourIndex=0;
					colour = $('#task'+i).css("background-color",$scope.colourList[colourIndex]);
					colourIndex++;
				}
			i++
		},100);
	};

	//STEP 2: ADD "TASKY" CLASS
	$scope.iterateTasks = function (){
		$( "li > div" ).addClass( "tasky" );
		setTimeout($scope.toggleDraggability, 5);
	};
	
	//STEP 3: MAKE DRAGGABLE
	$scope.toggleDraggability = function (){
		var items = document.querySelectorAll('.tasky');

		for (var i=0, length = $scope.taskList.length; i <= length - 1; i++) {	
			if($scope.taskList[i] != null) { //if this task is NOT null
				var task = items[i];
				//DRAGGABILLY.JS
				var draggie = new Draggabilly( task, {
		    		handle: '.task'
		    	});
			}
		};
	};

	$scope.toggleEditModeOn = function (i){
		//check first that nothing else is in edit mode
		for (var j=0, length = $scope.taskList.length; j <= length - 1; j++) {	
			if($scope.taskList[j] != null){
			 if($scope.taskList[j].editing = true) { //if this task is NOT null
				$scope.taskList[j].editing = false;
			}
		}
	};

		$scope.taskList[i].editing = !$scope.taskList[i].editing;
	};

	$scope.toggleEditModeOff = function (i){
		$scope.taskList[i].editing = false;
	};

	//Begin character counter tutorial reference (again):
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

	//TOGGLE MENU + ANIM:
	var menuOpen = false;
	var buttonShifted = false;

	$scope.toggleMenu = function (){
		if(helpMenuOpen){
			$scope.toggleHelp();
		}

		for (var j=0, length = $scope.taskList.length; j <= length - 1; j++) {	
			if($scope.taskList[j] != null){
			 if($scope.taskList[j].editing = true) {
				$scope.taskList[j].editing = false;
			}
		}
	};

		if(!menuOpen) {
			menuOpen = true;

			$( ".add-task-form" ).addClass( "menu-open" );
			$( ".toggle-menu-button" ).addClass( "shift-down" );
			$( ".toggle-menu-button" ).find($(".fa")).addClass('fa-spin');
			$( ".toggle-help-button" ).addClass( "shift-help-down" );

			setTimeout(function () { if(buttonShifted = true) {
				$( ".toggle-menu-button" ).find($(".fa")).removeClass('fa-spin');
				$( ".toggle-menu-button" ).find($(".fa")).removeClass('fa-plus').addClass('fa-times');
			}}, 745);
			inProgress = false;
		}

		else if(menuOpen) {
			menuOpen = false;

			$( ".add-task-form" ).removeClass( "menu-open" );
			$( ".toggle-menu-button" ).removeClass( "shift-down" );
			$( ".toggle-menu-button" ).find($(".fa")).addClass('fa-spin');
			$( ".toggle-help-button" ).removeClass( "shift-help-down" );

			setTimeout(function () { if(buttonShifted = true) {
				$( ".toggle-menu-button" ).find($(".fa")).removeClass('fa-spin');
				$( ".toggle-menu-button" ).find($(".fa")).removeClass('fa-times').addClass('fa-plus');
			}}, 760);

			buttonShifted = false;

			inProgress = false;
		}
	};

//TOGGLE HELP + ANIM:
var helpMenuOpen = false;
var helpButtonShifted = false;

	$scope.toggleHelp = function (){
		if(menuOpen){
			$scope.toggleMenu();
		}

		for (var j=0, length = $scope.taskList.length; j <= length - 1; j++) {	
			if($scope.taskList[j] != null){
			 if($scope.taskList[j].editing = true) { //if this task is NOT null
				$scope.taskList[j].editing = false;
			}
		}
	};

		if(!helpMenuOpen) {
			$( ".help-form" ).addClass( "help-open" );
			$( ".toggle-help-button" ).addClass( "shift-help" );
			$( ".toggle-help-button" ).find($(".fa")).addClass('fa-spin');
			
			helpMenuOpen = true;
			helpButtonShifted = true;

			setTimeout(function () { if(helpButtonShifted = true) {
				$( ".toggle-help-button" ).find($(".fa")).removeClass('fa-spin');
				$( ".toggle-help-button" ).find($(".fa")).removeClass('fa-question').addClass('fa-times');
			}}, 745);
		}
		else if(helpMenuOpen) {
			$( ".help-form" ).removeClass( "help-open" );
			$( ".toggle-help-button" ).removeClass( "shift-help" );
			$( ".toggle-help-button" ).find($(".fa")).addClass('fa-spin');

			setTimeout(function () { if(helpButtonShifted = true) {
				$( ".toggle-help-button" ).find($(".fa")).removeClass('fa-spin');
				$( ".toggle-help-button" ).find($(".fa")).removeClass('fa-question').addClass('fa-question');
			}}, 760);

			helpMenuOpen = false;
			helpButtonShifted = false;
		}
	};

	//=============================================================================
	//====== HAMMER.JS ============================================================
	var mc = new Hammer.Manager(document.body);
	mc.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
	mc.add( new Hammer.Tap({ event: 'tap', taps:1 }) );

	//DOUBLE TAP to toggle edit mode:
	mc.on("doubletap", function(ev) {
		doubleTapEdit.click(ev.target.id, ev.type);
		holdBringForward.click(ev.target.id, ev.type);
	});

	doubleTapEdit.click = function(i, eventType) {
   	if($scope.taskList[i] != undefined) {
   		// $scope.taskList[i].editing = !$scope.taskList[i].editing;
   		$scope.toggleEditModeOn(i);
   	}
   	$scope.$apply();
	}

	//HOLD for 0.75s to bring event to front:
	// mc.on("hold", function(ev) {
	mc.on("tap", function(ev) {
  		holdBringForward.click(ev.target.id, ev.type);
	});

	holdBringForward.click = function(i, eventType) {
   	holdSetZ = $('#task'+i).css("z-index",zIndex);
   	zIndex += 10;
   	$scope.$apply();
	}
	//=============================================================================
});