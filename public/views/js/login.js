$(document).ready(function(){
    $("#formLogin").submit(function(e){
        //Prevent submit default action
        e.preventDefault();

        var email = $("#inputEmail").val();
        var password = $("#inputPwd").val();

        //Ajax request to server
        $.ajax({
            url : 'http://localhost:3000/login',
            type : 'POST',
            data : {
                'email' : email,
                'password' : password
            },
            dataType:'json',
            success : function(data) {   
                console.log(data);
                window.location.href = '/index';
            },
            error : function(request,error)
            {
                $("#errorMsg").html("<div class='alert alert-danger'>The username or password are not valid. Please try again</div>")
            }
        });
    });
});