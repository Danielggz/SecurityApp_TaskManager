var userId;
var username;
var role;

$(document).ready(function(){
    //get current session
    $.ajax({
        url : 'http://localhost:3000/getSession',
        type : 'GET',
        dataType:'json',
        success : function(data) {   
            username = data.username;
            role = data.role;
            userId = data.userId;
            $("#currentUser").html("Hello, " + data.username + "  <button class='btn btn-secondary'>Log off</button>");

            //Append create button depending on role
            if(role == "Admin" || role == "User"){
                $("#divTasks").append("<button id='btnNewTask' class='btn btn-primary' data-bs-toggle='modal' data-bs-target='#modalNewTask'> New Task </button>")
            }

            //Get current tasks
            tasks = getTasks();
        },
        error : function(request,error)
        {
            console.log(error);
        }
    });

    $("#formNewTask").submit(function(e){
        e.preventDefault();

        var name = $("#formName").val();
        var description = $("#formDescription").val();
        var priority = $("#formPriority").val();
        var completed = 0;
        if($("#formCompleted").prop("checked")){
            completed = 1;
        }

        $.ajax({
            url : 'http://localhost:3000/tasks',
            type : 'POST',
            data : {
                'name' : name,
                'description' : description,
                'priority' : priority,
                'completed' : completed
            },
            dataType:'json',
            success : function(data) {   
                console.log(data);
            },
            error : function(request,error)
            {
                $("#errorMsg").html("<div class='alert alert-danger'>Error </div>")
            }
        });
    });
});

function getTasks(){
    $.ajax({
        url : 'http://localhost:3000/tasks',
        type : 'GET',
        dataType:'json',
        success : function(tasks) {   
            tasks.forEach(task => {
                var taskDiv = $("<div style='margin-top:15px;'>").addClass("task");

                taskDiv.append(`<hr/><span><strong>Name:</strong> ${task.name}</span>`);
                taskDiv.append(`<br/><br/><span><strong>Description:</strong> ${task.description}</span>`);
                taskDiv.append(`<br/><br/><span><strong>Priority:</strong> ${task.priority}</span>`);
                taskDiv.append(`<br/><br/><span><strong>Completed:</strong> ${task.completed ? "Yes" : "No"}</span>`);

                //Check user role to allow edit and deletion
                console.log(role + "  " + task.iduser + "  " + userId);
                if(role == "Admin"){
                    taskDiv.append("<br/><br/><button class='btnEdit btn btn-success'> Edit </button>");
                    taskDiv.append("  <button class='btnDelete btn btn-danger'> Delete </button>");
                }else if(role == "User" && userId == task.iduser){
                    taskDiv.append("<br/><br/><button class='btnEdit btn btn-success'> Edit </button>");
                    taskDiv.append("  <button class='btnDelete btn btn-danger'> Delete </button>");
                }
                $("#divTasks").append(taskDiv);

                //Add functions to edit and delete
                $(".btnEdit").click(function(){
                    
                });

                (".btnDelete").click(function(){

                });
            });
        },
        error : function(request,error)
        {
            console.log(error);
        }
    });
}