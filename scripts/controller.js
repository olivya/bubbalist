bubbalist.controller('mainController', function($scope, $location, $timeout) {
	$scope.taskList = [];
	var colour = '#25d7ec';
	// var colour;
	var opacity;
	//Variables for updating DOM:
	var zIndex = 0;
	var zPos = 0;
	var largestZ = 0;

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

	var thisTaskIsNew = false;

	$scope.activated = false;
	bubbalist.ready = false;
	$scope.ready = false;

	var deleted = false;
	var completed = false;

	// $(function() {
	// 	FastClick.attach(document.body);
	// });

	// var clickOrTouch = (('ontouchend' in window)) ? 'touchend' : 'click';

//=============================================================================
//====== CHECK IF NO TASKS (to show 'no tasks' message) =======================
//=============================================================================
	$scope.checkForTasks = function (){
		// console.log('$scope.checkForTasks()');
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
bubbalist.stopLoad = function() {
	console.log('stopping load screen to let user log in');
	bubbalist.hideSpinner();
	bubbalist.showLogin();

	bubbalist.ready = true;
	$scope.activated = false;
	bubbalist.updateReady();
	// console.log("bubbalist.ready is now",bubbalist.ready);
	$scope.$apply();
}

bubbalist.updateReady = function() {
	if (bubbalist.ready) {
		$scope.ready = true;
	} else $scope.ready = false;

	// console.log("$scope ready --- ",$scope.ready);
}

bubbalist.updateReady();
// console.log("bubbalist.ready is now",bubbalist.ready);

bubbalist.destroyLogin = function () {
	$('#authorizeButton').remove();
	$('#google').remove();
	// console.log("destroying login");
}

bubbalist.showLogin = function () {
	$('#login').show();
	$("#google").addClass("animated bounceInDown");
	$("#authorizeButton").addClass("animated bounceInUp");
	console.log("showing login");
}


bubbalist.hideLogin = function () {
	$('#login').hide();
	console.log("hiding login");
}

bubbalist.hideSpinner = function () {
	$('#spinner-container').hide();
}

bubbalist.showSpinner = function () {
	$('#spinner-container').show();
}

//REALTIME API (runs on initial creation & reload)
	bubbalist.updateTasks = function() { //not getting called
		bubbalist.ready = false;
		bubbalist.updateReady();

		console.log(thisTaskIsNew);
		$scope.taskList = bubbalist.taskList.asArray();
		$scope.$apply();
		// console.log("bubbalist.updateTasks()", $scope.taskList);
		//colour is right here...

		$scope.newTask = "";
		$('.text-feedback').html(maxChars);

		$scope.drawTasks();

		// console.log("done drawing! finding largest z-index...");
		zPos = $scope.findLargestZ();
		// console.log("...so next zPos will be",zPos);
		thisTaskIsNew = true;
		console.log(thisTaskIsNew);

		// console.log(bubbalist.ready);
		console.log("READY!\n~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~\n "); //<--- this is when loading screen can stop <--- 

		bubbalist.ready = true;
		bubbalist.updateReady();
		bubbalist.destroyLogin();
		// console.log("bubbalist.ready is now",bubbalist.ready);
		$scope.activated = true;

		if(bubbalist.taskList.length===0) {
			// $(".no-tasks-message").show();
			var noTasksMsg = document.createElement("div");
			noTasksMsg.id = "noTasksMsg";
			document.getElementById("ngview").appendChild(noTasksMsg);
			var noTasksMsgText = document.createTextNode("You haven't added any tasks!");
			$("#noTasksMsg").addClass("no-tasks-message");
			noTasksMsg.appendChild(noTasksMsgText);
			$("#noTasksMsg").addClass("animated bounceInDown");
			setTimeout(function(){
				$("#noTasksMsg").removeClass("animated bounceInDown");
			},2000);
		}

		// } else $(".no-tasks-message").hide();

		// console.log("activated?",$scope.activated);

		// $('#authorizeButton').remove();
		// $('#google').remove();

		$('#loading').remove();
		$('.toggle-menu-button').removeClass('fade');
		$('.toggle-help-button').removeClass('fade');

		$scope.$apply();
   };
   //Draws stored tasks on reload:
   $scope.drawTasks = function() {
   	bubbalist.ready = true;
   	$scope.activated = true;
  		bubbalist.updateReady();
   	// console.log("bubbalist.ready is now",bubbalist.ready);

   	j = 1;
   	for (var i=0, length = bubbalist.taskList.length; i <= length - 1; i++) {	
			if(bubbalist.taskList.asArray()[i] != null) {
				j++;
				$scope.visTask(bubbalist.taskList.asArray()[i]);
			}
		};

		thisTaskIsNew = true;
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
				yPos:yPos,
				zPos:zPos, //initial assigned zPos
				clicks:0
			};
			$scope.taskList.push(task); //for angular/scope/DOM
			bubbalist.taskList.push(task); //for drive.js
			$scope.newTask = ""; //reset textbox
			$('.text-feedback').html(maxChars); //reset char count
			setTimeout($scope.toggleMenu,300); //close menu after a moment
		}
		else { //if user didn't input anything...
			$scope.responseNeeded = true; //put faded div on screen
			smoke.alert("Please enter a task!", function(e){
				$scope.responseNeeded = false;
				$scope.$apply();
			}, { ok: "Okay" });
		}

		if(bubbalist.taskList.length===0) {
			$(".no-tasks-message").show();
		} else $(".no-tasks-message").hide();

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
				var zPos = $scope.taskList[i].zPos;
				var clicks = $scope.taskList[i].clicks;
				return {
					task:task, editing:editing, colour:colour, ID:ID, i:i, xPos:xPos, yPos:yPos, zPos:zPos, clicks:clicks
				};
			}
		};
	}
	// STEP 2: render task on DOM ("task"= task obj data, "tasky"= visual task on DOM/HTML)
	$scope.visTask = function(task) {
		if (task != undefined) {
			console.log(thisTaskIsNew,"????");

			$("#noTasksMsg").addClass("animated bounceOutDown");
			setTimeout(function(){
				$("#noTasksMsg").removeClass("animated bounceOutDown");
			},2000);

			thisTask = $scope.dataFromID(task.ID);
			//create & add tasky & handle (for dragging) divs:
			var tasky = document.createElement("div");
			tasky.id = task.ID;
			document.getElementById("ngview").appendChild(tasky);
			
			if(thisTaskIsNew) {
				$("#"+tasky.id).addClass("animated rollIn");

				setTimeout(function(){
					$("#"+tasky.id).removeClass("animated rollIn");
				},1000);
			} else {
				$("#"+tasky.id).addClass("animated fadeIn");

				setTimeout(function(){
					$("#"+tasky.id).removeClass("animated fadeIn");
				},1000);
			}

			$("#"+tasky.id).addClass("tasky"); //for styling
			$("#"+tasky.id).addClass("draggable"); //for styling

			var handle = document.createElement("div");
			handle.id = task.ID+"handle";
			document.getElementById(tasky.id).appendChild(handle);
			$("#"+handle.id).addClass("handle");

			//create & add user-inputted task into a span:
			var taskySpan = document.createElement("span");
			taskySpan.id = task.ID+"span";
			var taskySpanText = document.createTextNode(thisTask.task);
			taskySpan.appendChild(taskySpanText);
			handle.appendChild(taskySpan); //add to above div
		
			//create textarea for editing:
			var taskyEdit = document.createElement("textarea");
			taskyEdit.id = task.ID+"edit";
			var taskyEditPlaceholder = document.createTextNode(thisTask.task);
			taskyEdit.appendChild(taskyEditPlaceholder);
			taskyEdit.setAttribute('maxlength', '100');
			tasky.appendChild(taskyEdit);
			$('#'+taskyEdit.id).addClass('edit-box');
			taskyEdit.setAttribute("rows","6");

			$(taskyEdit).hide(); //(hidden until user enters edit mode)
			
			//create save button for editing:
			var saveBtn = document.createElement("button");
			saveBtn.id = task.ID+"save";
			saveBtn.setAttribute('ng-click', 'doneEditing('+task.ID+')');
			var saveBtnText = document.createTextNode("SAVE");
			saveBtn.appendChild(saveBtnText);
			tasky.appendChild(saveBtn);
			$('#'+saveBtn.id).addClass('save-button edit-form-buttons');
			$(saveBtn).hide(); //(hidden until user enters edit mode)

			//create delete button (w/unique ID) & append to tasky div:
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

			//set position & styling:
			$('#'+tasky.id).css("top",thisTask.yPos+"px");
			$('#'+tasky.id).css("left",thisTask.xPos+"px");
			$('#'+tasky.id).css("z-index",thisTask.zPos);

			// console.log(thisTask.colour);

			$('#'+tasky.id).css("background-color",thisTask.colour);

			if(thisTaskIsNew) {
				zPos+=10; //only start incrementing zPos once you're not "re-"drawing tasks from storage
			}
			//update space variable so next task is not directly over-top of this one:
			if(space <= 200) { space += 40; }
			else { space = 15; space += 40; } //start layering back at top

			//recompile div, to activate ng-click functionality on buttons:
			setTimeout(function(){ $scope.compile(tasky.id); },200);

			//call function to make tasky draggable:
			$scope.makeDraggie(thisTask.ID);
			// console.log("tasky code: ",tasky); //check html code
		}
	}

	$scope.findLargestZ = function () {
		for (var i=0, length = bubbalist.taskList.length; i <= length - 1; i++) {	
			if(bubbalist.taskList.asArray()[i].zPos > largestZ) {
				largestZ = bubbalist.taskList.asArray()[i].zPos;
			}
		};
		zPos = largestZ;
		zPos+=10;
		// console.log("done! largest Z was",largestZ+"...");
		return zPos;
	}

	$scope.makeDraggie = function(id){
		$('#'+id).draggabilly({handle:".handle"});
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

	$scope.feedback = function(id){
			$( "#"+id+"save" ).velocity({ 
				properties: { backgroundColor:"#ffffff" },
				options: { duration:10 }
			});

		setTimeout(function(){
			$( "#"+id+"save" ).velocity({ 
				properties: { backgroundColor:"#000000" },
				options: { duration:10 }
			});
		},200);
	}

	$scope.doneTask = function(id) { 
		$scope.responseNeeded = true; //throw up faded div
   	thisTask = $scope.dataFromID(JSON.stringify(id));

   	console.log('doneTask id',id);

   	thisTask.editing = false;

   	smoke.confirm("Mark as complete?", function(e){
			if (e){
				console.log("DONE, DELETING");
				$scope.responseNeeded = false; //remove faded div
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
			}
			else {
				$scope.responseNeeded = false;
				thisTask = $scope.dataFromID(JSON.stringify(id));
				$scope.doneEditing(JSON.parse(thisTask.ID));
				$scope.$apply();
			}
		}, { ok: "Yup", cancel: "Nevermind", reverseButtons: true });
	}

	$scope.delTask = function(id) { //deletes tasks from arrays (not DOM yet)
		$scope.responseNeeded = true; //throw up faded div
		// $("#cover").addClass("animated fadeIn");

   	thisTask = $scope.dataFromID(JSON.stringify(id));

   	// console.log('delTask id',id);

   	thisTask.editing = false;
		// console.log(thisTask.editing);

		// $(".dialog-inner").addClass("animated bounceInDown");

		// setTimeout(function(){
	   	smoke.confirm("Are you sure?", function(e){
				if (e){
					$scope.responseNeeded = false; //remove faded div
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
				}
				else {
					$scope.responseNeeded = false;
					thisTask = $scope.dataFromID(JSON.stringify(id));
					$scope.doneEditing(JSON.parse(thisTask.ID));
					$scope.$apply();
				}
			}, { ok: "Yup", cancel: "Nevermind", reverseButtons: true });
	   // },1000);
	}

	$scope.remTask  = function (id){ //deletes task visually off DOM
		// console.log("removing task");
		
		if(completed) {
			$("#"+id).addClass("animated rollOut");
		}

		if(deleted) {
			$("#"+id).addClass("animated bounceOutDown");
		}

		var tasky = document.getElementById(id);

		setTimeout(function(){
			tasky.parentNode.removeChild(tasky);
			deleted = false;
			completed = false;
		},1000);

		if(bubbalist.taskList.length===0) {
			// var noTasksMsg = document.createElement("div");
			// noTasksMsg.id = "noTasksMsg";
			// document.getElementById("ngview").appendChild(noTasksMsg);
			// var noTasksMsgText = document.createTextNode("You haven't added any tasks!");
			// $("#noTasksMsg").addClass("no-tasks-message");
			// noTasksMsg.appendChild(noTasksMsgText);
			setTimeout(function(){
				$(".no-tasks-message").show();
				$(".no-tasks-message").addClass("animated bounceInDown");
			},500);

			setTimeout(function(){
				$(".no-tasks-message").removeClass("animated bounceInDown");
			},2000);
		}
	}

	$scope.clearTasks  = function (){
		console.log("CLEARING ALL TASKS...");

	  for (var i=0, length = $scope.taskList.length; i <= length - 1; i++) {	
			$scope.remTask($scope.taskList[i].ID);
		};

		$scope.taskList.length = 0;
		bubbalist.taskList.length = 0;
	}
//=============================================================================
//====== TOGGLE EDITING =======================================================
//=============================================================================
	$scope.startEditing = function (id) {


			console.log("STARTING EDITING");
			$scope.checkIfEditing();
			// $scope.fadeOtherTasks(id);

			// var longID = id;
			// var shortID = longID.substr(0, longID.length-6); //removes "handle" from end of ID 
			// console.log("longID:",longID,"--->","shortID:",shortID);
			thisTask = $scope.dataFromID(id);
			// console.log(thisTask);

			if(thisTask) { //remove after fixing hammer.js
				var shortID = thisTask.ID;
				thisTask.editing = true;
				bubbalist.taskList.set(thisTask.i, thisTask);
				$scope.taskList[thisTask.i] = thisTask;
				thisTask.editing = true;
				//toggle editing stuff:
				$("#"+shortID+"edit").show();
				$("#"+shortID+"save").show();
				$("#"+shortID+"del").show();
				$("#"+shortID+"done").show();
				$("#"+shortID+"handle").hide();
				//rm original span (will make new one on save):
				var origTaskySpan = document.getElementById(thisTask.ID+"span");
				if(origTaskySpan) {
					// origTaskySpan.parentNode.removeChild(origTaskySpan);
					$(origTaskySpan).hide();
				}
			}

	}

	$scope.stopEditing = function(id){
		thisTask = $scope.dataFromID(JSON.stringify(id));
		thisTask.editing = false;

		bubbalist.taskList.set(thisTask.i, thisTask);
		$scope.taskList[thisTask.i].task = thisTask.task;

		//toggle editing stuff:
		$("#"+thisTask.ID+"save").hide();
		$("#"+thisTask.ID+"edit").hide();
		$("#"+thisTask.ID+"del").hide();
		$("#"+thisTask.ID+"done").hide();
		$("#"+thisTask.ID+"handle").show();

		var origTaskySpan = document.getElementById(thisTask.ID+"span");
		if(origTaskySpan) {
			// origTaskySpan.parentNode.removeChild(origTaskySpan);
			$(origTaskySpan).show();
		}

		// $scope.unfadeOtherTasks(id);
	}

	$scope.doneEditing = function(id){

		// setTimeout(function(){
			thisTask = $scope.dataFromID(JSON.stringify(id));
			//grab new task text:
			thisTask.task = document.getElementById(thisTask.ID+"edit").value;
			thisTask.editing = false;
			// console.log(thisTask.editing);

			//set new task value in arrays:
			bubbalist.taskList.set(thisTask.i, thisTask);
			$scope.taskList[thisTask.i].task = thisTask.task;
			//toggle editing stuff:
			$("#"+thisTask.ID+"save").hide();
			$("#"+thisTask.ID+"edit").hide();
			$("#"+thisTask.ID+"del").hide();
			$("#"+thisTask.ID+"done").hide();
			$("#"+thisTask.ID+"handle").show();

			//delete original span
			var origTaskySpan = document.getElementById(thisTask.ID+"span");
			if(origTaskySpan) {
				origTaskySpan.parentNode.removeChild(origTaskySpan);
			}

			//add new span w/edited task (if unedited will just add same text back in):
			var newTaskySpan = document.createElement("span");
			newTaskySpan.id = thisTask.ID+"span";
			var newTaskySpanText = document.createTextNode(thisTask.task);
			newTaskySpan.appendChild(newTaskySpanText);
			var delBtn = document.getElementById(thisTask.ID+"del");
			var handle = document.getElementById(thisTask.ID+"handle");
			handle.appendChild(newTaskySpan);
	// },100);

	}

	$scope.checkIfEditing = function() {
		for (var i=0, length = $scope.taskList.length; i <= length - 1; i++) {	
			if($scope.taskList[i].editing) {
				$scope.stopEditing(JSON.parse($scope.taskList[i].ID));
				// console.log("was editing, stopped!")
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

		// $('.colour-picker-button').addClass("animated rubberBand");
		// setTimeout(function() {
		// 	$('.colour-picker-button').removeClass("animated rubberBand");
		// },1000);
		// console.log(picker);
	}

   $scope.colourSelected = function (pickedColour){
		colour = pickedColour;
		console.log('user selected',colour);
		// $('.colour-picker-button').css("background-color",colour); //update button colour for feedback
		$('.colour-picker-button').velocity({backgroundColor:colour}, { duration: 100 });
		$('.colour-picker-button').addClass("animated rubberBand");
		setTimeout(function() {
			$('.colour-picker-button').removeClass("animated rubberBand");
		},1000);
		$scope.togglePicker();
	}

	$scope.showColourPicker = function () {
		if(!picker) { 
			$( ".colour-picker" ).velocity("slideDown", { duration: 100 })
			$( ".colours" ).velocity("fadeIn", { duration: 50, delay:50 })
		}
		else {
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
	   	var diff = longID.length - 16; //need to shorten ID to the first 16 digits
	   	var shortID = longID.substr(0, longID.length-diff);
	   	var id = shortID;
   	} else id = ev.target.id;
		doubleTapEdit.click(id, ev.type);
		tapBringForward.click(id, ev.type); //(since you also want bring forward if editing)
	});

	mc.on("tap", function(ev) {
		var longID = ev.target.id;
   	var diff = longID.length - 16; //need to shorten ID to the first 16 digits
   	var shortID = longID.substr(0, longID.length-diff);
   	var id = shortID;
   	// console.log(id); //runs first

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
	   	var diff = longID.length - 16; //need to shorten ID to the first 16 digits
	   	var shortID = longID.substr(0, longID.length-diff);
	   	id = shortID;
   	}
		// console.log("doubleTapEdit.click",id,eventType);
		$scope.startEditing(id);
   	$scope.$apply();
	}

	tapBringForward.click = function(id, eventType) { //orig function in 'orig hammer js fns'
   	if(id.length > 16) {
	   	var longID = id;
	   	var diff = longID.length - 16; //need to shorten ID to the first 16 digits
	   	var shortID = longID.substr(0, longID.length-diff);
	   	var id = shortID;
   	} else shortID = id;

		thisTask = $scope.dataFromID(shortID);

		if(thisTask != undefined) {
	   	zPos = zPos+10;
	   	$('#'+shortID).css("z-index",zPos);
	   	thisTask.zPos = zPos;
	   	zPos = zPos+10;
	   	thisTask.clicks++;
	   	bubbalist.taskList.set(thisTask.i, thisTask);
			$scope.taskList[thisTask.i] = thisTask;
	   	$scope.$apply();
	   }
	}
//=============================================================================
//====== REFERENCED FUNCTIONS =================================================
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

	//Begin compile function reference (for activating dynamically set ng-click attribute)
	//Source: http://stackoverflow.com/questions/25759497/angularjs-dynamically-set-attribute
	$scope.compile = function(id) {
		var el = angular.element('#'+id);
		$scope = el.scope();
		$injector = el.injector();
		$injector.invoke(function($compile){ $compile(el)($scope); });
	}
	//End compile function reference.

//=============================================================================
//====== MENU ANIMATIONS ======================================================
//=============================================================================
	var menuOpen = false;
	var helpMenuOpen = false;
	var menuSpeed = 400;

	$scope.showAddMenu = function (){
		// if($scope.activated) {
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
		// }
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
		// if($scope.activated) {
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
		// $scope.exitEditMode();

		if(!menuOpen) {
			$scope.showAddMenu();
		}

		else if(menuOpen) {
			$scope.hideAddMenu();
		}
	};

	$scope.toggleHelp = function (){
		// $scope.exitEditMode();

		if(!helpMenuOpen) { 
			$scope.showHelpMenu();
		}

		else if(helpMenuOpen) { 
			$scope.hideHelpMenu();
		}
	};

});