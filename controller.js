bubbalist.controller('mainController', function($scope, Tasks, Colours, $location, $timeout) {

	$scope.taskList = Tasks.all();
	$scope.colourList = Colours.all();

	var i = 0;
	var colour;
	var colourIndex = 0;
	var theColour = 1;

	var opacity;

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

	$scope.checkForTasks = function (){
		if ($scope.taskList.length === 0) {
				$scope.noTasks = true;
			}
		else $scope.noTasks = false;

		var items = document.querySelectorAll('.tasky');
	};

	$scope.checkForTasks();

	//DELETE TASK:
	$scope.deleteTask = function (i){ //i = $index from home.html

   	smoke.confirm("Are you sure?", function(e){
			if (e){
				console.log("Task \""+$scope.taskList[i].task+"\" was deleted");
				$scope.taskList[i] = null;

		 		var items = document.querySelectorAll('.tasky');
			 		for (var j=0, length = $scope.taskList.length; j <= length - 1; j++) {
			 			if ($scope.taskList[j] === null) { //ensure task[j] hasn't already been deleted (to avoid error)
			 				$(items[j]).addClass("deleted");
			 		}
		 		}
			$scope.checkForTasks();
			} else{
				// console.log("nope");
			}}, {
				ok: "Yup",
				cancel: "Nevermind",
				reverseButtons: true
			});
   };

   //MARK TASK AS COMPLETED
	$scope.doneTask = function (i){ //i = $index from home.html
 
   	smoke.confirm("Mark as complete?", function(e){
			if (e){
				$scope.taskList[i] = null;

		 		var items = document.querySelectorAll('.tasky');
			 		for (var j=0, length = $scope.taskList.length; j <= length - 1; j++) {
			 			if ($scope.taskList[j] === null) { //ensure task[j] hasn't already been deleted (to avoid error)
			 				$(items[j]).addClass("deleted");
			 		}
			 	}
				$scope.checkForTasks();
			} else{
				console.log("nope");
			}}, {
				ok: "Yup",
				cancel: "Nevermind",
				reverseButtons: true
			});
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
					index:i,
					colour:$scope.theColour
				});
			// i = $scope.taskList.map(function(i) { return i.i; }).indexOf($scope.newTask);
			// console.log("i "+i);
			console.log("Text: \""+$scope.newTask+"\"");
			// console.log("COLOUR \""+$scope.newTask+"\"");
			// console.log("Colour: "+theColour);

			$scope.newTask = "";
			$scope.checkForTasks();
			$('.text-feedback').html(maxChars);

			setTimeout($scope.toggleMenu,100);
			setTimeout($scope.iterateTasks, 5);
			setTimeout($scope.setStyle,5);
		}
		else {
			// alert("Please enter a task!");
			smoke.alert("Please enter a task!", function(e){
			}, {
				ok: "Okay"
			});
		}
	};

	$scope.setStyle = function(){
		setTimeout(function (){
				$(".task").removeClass("hide");
			},200);

		//ensure new task is on top
		setZ = $('#task'+i).css("z-index",zIndex);
		//update menu z-index
		menuSetZ = $('.add-task-form').css("z-index",zIndexMenus);
		menuSetZ = $('.help-form').css("z-index",zIndexMenus);
		colourPickerSetZ = $('.colour-picker').css("z-index",zIndexColourPicker);
		zIndex+=10; //NEXT z-index for Tasks
		$scope.updateMenuZ(); //NEXT z-index for Menus
		
		//ensure new task is not directly over-top of previous
		if(space <= 200) {
			increaseSpace = $('#task'+i).css("top",space+"px");
			space += 40;
		} else {
			space = 15; //start layering back at top
			increaseSpace = $('#task'+i).css("top",space+"px");
			space += 40;
		}

		//SET COLOUR:
		if ($scope.theColour === 1 || $scope.theColour === undefined) {
			$('#task'+i).css("background-color",'#89FFF1');
			i++;
		}
		if ($scope.theColour === 2) {
			$('#task'+i).css("background-color",'#8799FF');
			i++;
		}
		if ($scope.theColour === 3) {
			$('#task'+i).css("background-color",'#BA82FF');
			i++;
		}
		if ($scope.theColour === 4) {
			$('#task'+i).css("background-color",'#FF8396');
			i++;
		}
		if ($scope.theColour === 5) {
			$('#task'+i).css("background-color",'#E86638');
			i++;
		}
		if ($scope.theColour === 6) {
			$('#task'+i).css("background-color",'#FF235E');
			i++;
		}
		if ($scope.theColour === 7) {
			$('#task'+i).css("background-color",'#5DEFB0');
			i++;
		}
		if ($scope.theColour === 8) {
			$('#task'+i).css("background-color",'#47CC92');
			i++;
		}
		if ($scope.theColour === 9) {
			$('#task'+i).css("background-color",'#076F5C');
			i++;
		}

		// console.log("Colour: "+theColour);
	};

	$scope.updateMenuZ = function (){ //always ensures menus are on top
		zIndexMenus = zIndex + 15;
		menuSetZ = $('.add-task-form').css("z-index",zIndexMenus);
		menuSetZ = $('.help-form').css("z-index",zIndexMenus);
		zIndexColourPicker = zIndexMenus + 15;
		colourPickerSetZ = $('.colour-picker').css("z-index",zIndexColourPicker);
	}

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
		console.log("Text after editing: \""+$scope.taskList[i].task+"\"");
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
//======== COLOUR PICKER ======================================================
//=============================================================================
// var theColour = 1;
// return $scope.theColour;

$scope.showPicker = function (){
	$scope.showColourPicker = true;
	// console.log($scope.showColourPicker);
	var height1 = $('.add-task-form').height();
	var height2 = $('#colour1').height();
	var scrollFoReal = height1 + height2 * 4;
	// console.log(height1+" "+height2+" "+scrollFoReal);
	$('.scroll-for-real').css({'height':scrollFoReal+'px'});

	if ($(window).height() < scrollFoReal) {
		// $('.scroll-for-real').css({'background':'SpringGreen'});
		// setTimeout( function () {
		// 	$('.add-task-form').css({'display':'none'});
		// },500);
	}
}

$scope.colourSelected = function (colour){
	console.log("Colour #"+colour);
	$scope.theColour = colour;

	if ($scope.theColour === 1 || $scope.theColour === undefined) {
		$('.colour-picker-button').css("background-color",'#89FFF1');
	}
	if ($scope.theColour === 2) {
		$('.colour-picker-button').css("background-color",'#8799FF');
	}
	if ($scope.theColour === 3) {
		$('.colour-picker-button').css("background-color",'#BA82FF');
	}
	if ($scope.theColour === 4) {
		$('.colour-picker-button').css("background-color",'#FF8396');
	}
	if ($scope.theColour === 5) {
		$('.colour-picker-button').css("background-color",'#E86638');
	}
	if ($scope.theColour === 6) {
		$('.colour-picker-button').css("background-color",'#FF235E');
	}
	if ($scope.theColour === 7) {
		$('.colour-picker-button').css("background-color",'#5DEFB0');
	}
	if ($scope.theColour === 8) {
		$('.colour-picker-button').css("background-color",'#47CC92');
	}
	if ($scope.theColour === 9) {
		$('.colour-picker-button').css("background-color",'#076F5C');
	}

	$scope.showColourPicker = false;
	return $scope.theColour;
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
		tapBringForward.click(ev.target.id, ev.type);
	});

	doubleTapEdit.click = function(i, eventType) {
   	if($scope.taskList[i] != undefined) {
   		// $scope.taskList[i].editing = !$scope.taskList[i].editing;
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
   	// $scope.dragListener(i);
   	$scope.updateMenuZ();
   	$scope.$apply();
	}

	// $scope.dragListener = function (i) {
	// 	if($scope.taskList[i] != undefined) {
	// 		console.log($scope.taskList[i].position.x);
	// 	}
	// }

});