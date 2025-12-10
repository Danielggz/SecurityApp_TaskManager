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
            $("#currentUser").text(data.username);

            //Append create button depending on role
            if(role == "Admin" || role == "User"){
                $("#divTasks").append("<button id='btnNewTask' class='btn btn-primary' data-bs-toggle='modal' data-bs-target='#modalNewTask'> New Task </button>")
            }

            //Get current tasks
            getTasks();
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
                $("#modalNewTask").modal("hide");
            },
            error : function(request,error)
            {
                $("#errorMsg").html("<div class='alert alert-danger'>Error </div>")
            }
        });
    });

    $("#btnLogout").click(function(){
        $.ajax({
            url : 'http://localhost:3000/logout',
            type : 'GET',
            dataType:'json',
            success : function(data) {   
                window.location.href = '/login';
            },
            error : function(request,error)
            {
                console.log(error);
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
                var taskDiv = $("<div style='margin-top:15px;'>")
                .addClass("task")
                .attr("data-task-id", task.id)
                .attr("data-task-name", task.name)
                .attr("data-task-description", task.description)
                .attr("data-task-priority", task.priority)
                .attr("data-task-completed", task.completed)

                taskDiv.append("<hr/>").append($("<span>").append($("<strong>").text("Name: ")).append(document.createTextNode(task.name)));
                taskDiv.append("<br/><br/>").append($("<span>").append($("<strong>").text("Description: ")).append(document.createTextNode(task.description)));
                taskDiv.append("<br/><br/>").append($("<span>").append($("<strong>").text("Priority: ")).append(document.createTextNode(task.priority)));
                taskDiv.append("<br/><br/>").append($("<span>").append($("<strong>").text("Completed: ")).append(document.createTextNode(task.completed ? "Yes" : "No")));

                //Check user role to allow edit and deletion
                if(task.canEdit){
                    taskDiv.append("<br/><br/><button class='btnEdit btn btn-success'> Edit </button>");
                    taskDiv.append("  <button class='btnDelete btn btn-danger'> Delete </button>");
                }
                $("#divTasks").append(taskDiv);

               
            });
             //Add functions to edit and delete
            $("#divTasks").on("click", ".btnEdit", function(){
                var currentDiv = $(this).closest(".task")

                $("#formEditId").val(currentDiv.data("task-id"));
                $("#formEditName").val(currentDiv.data("task-name"));
                $("#formEditDescription").val(currentDiv.data("task-description"));
                $("#formEditPriority").val(currentDiv.data("task-priority"));
                $("#formEditCompleted").prop("checked", currentDiv.data("task-completed"));

                $("#modalEditTask").modal("show");
            });

            $("#formEditTask").submit(function(e) {
                e.preventDefault();

                const id = $("#formEditId").val();
                const formData = {
                    id: id,
                    name: $("#formEditName").val(),
                    description: $("#formEditDescription").val(),
                    priority: $("#formEditPriority").val(),
                    completed: $("#formEditCompleted").prop("checked") ? 1 : 0
                };

                $.ajax({
                    url: 'http://localhost:3000/tasks/' + id,
                    type: 'PUT',
                    data: formData,
                    dataType: 'json',
                    success: function(data) {
                        $("#modalEditTask").modal("hide");
                    },
                    error: function(err) {
                        console.error(err);
                    }
                });
            });

            $("#divTasks").on("click", ".btnDelete", function(){
                const currentDiv = $(this).closest(".task");
                const id = currentDiv.data("task-id");

                if(confirm("Delete this task?")) {
                    $.ajax({
                        url: 'http://localhost:3000/tasks/' + id,
                        type: 'DELETE',
                        dataType: 'json',
                        success: function(data) {
                            console.log(data);
                        },
                        error: function(err) {
                            console.error(err);
                        }
                    });
                }
            });
        },
        error : function(request,error)
        {
            console.log(error);
        }
    });
}