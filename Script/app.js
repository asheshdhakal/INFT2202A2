"use strict";

(function () {
    function checkLogin() {
        const user = sessionStorage.getItem("user");
        const loginLink = document.getElementById("login");
        if (user) {
            loginLink.innerHTML = '<a id="logout" class="nav-link" href="#"><i class="fas fa-sign-out-alt"></i> Logout</a>';
            loginLink.onclick = function() {
                sessionStorage.clear();
                location.href = "index.html";
            };
        } else {
            loginLink.innerHTML = '<a class="nav-link" href="login.html"><i class="fas fa-sign-in-alt"></i> Login</a>';
        }
    }

// Function to load header content and check user authentication
    function LoadHeader(html_data) {
        const header = document.querySelector("header");
        header.innerHTML = html_data;
        const pageTitle = document.title.trim();
        const navLinks = document.querySelectorAll(".navbar-nav li a");
        navLinks.forEach(function(link) {
            if (link.textContent.trim() === pageTitle) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
            }
        });
    }

    function ajaxRequest(method, url, callback){

        let xhr = new XMLHttpRequest();

        //Step 2: Opens a connection to the server
        xhr.open(method, url);

        xhr.addEventListener("readystatechange", ()=> {

            if(xhr.readyState === 4 && xhr.status === 200){

                if(typeof callback == "function") {
                    callback(xhr.responseText);
                }else{
                    console.error("Error.  Callback not a function")
                }
            }

        });


        //Step 3: Send the Request
        xhr.send();

    }

    // Initializes and handles the login page functionality.
function DisplayLoginPage() {
    // Logs when the function is called.
    console.log("Called DisplayLogin()...");
    
    // Attaches a click event listener to the login button.
    $("#loginButton").on("click", function () {
        // Retrieves username and password from the form inputs.
        let username = $("#username").val();
        let password = $("#password").val();
        let success = false;

        // Fetches user data from a JSON file.
        $.get("./Data/users.json", function (data) {
            // Iterates over each user to check for matching credentials.
            data.users.forEach(function (user) {
                if (username === user.Username && password === user.Password) {
                    // Creates a user object and stores it in session storage.
                    let userObj = {
                        DisplayName: user.DisplayName,
                        EmailAddress: user.EmailAddress,
                        Username: user.Username,
                        Password: user.Password
                    };
                    sessionStorage.setItem("user", JSON.stringify(userObj));
                    success = true;
                }
            });

            // Redirects to feedback list page if credentials are valid.
            if (success) {
                $("#messageArea").removeClass("alert alert-danger").hide();
                location.href = "feedbacklist.html";
            } else {
                // Displays error message for invalid credentials.
                $("#username").trigger("focus").trigger("select");
                $("#messageArea").addClass("alert alert-danger").text("Error: Invalid Credentials").show();
            }
        });
    });

    // Attaches a click event listener to the cancel button to reset form and redirect.
    $("#cancelButton").on("click", function () {
        document.forms[0].reset();
        location.href = "index.html";
    });
}


    // Validates the contact form fields.
function contactFormValidation() {
    // Initializes validation flag.
    let isValid = true;
    
    // Regular expressions for validating full name, contact number, and email address.
    let fullNameValid = /^([A-Z][a-z]{1,3}\.?\s)?([A-Z][a-z]+)+([\s,-]([A-z][a-z]+))*$/.test($("#fullName").val());
    let contactNumberValid = /^(\+\d{1,3}[\s-.])?\(?\d{3}\)?[\s-.]?\d{3}[\s-.]\d{4}$/.test($("#contactNumber").val());
    let emailAddressValid = /^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/.test($("#emailAddress").val());

    // Checks each field for validity and displays an error message if invalid.
    if (!fullNameValid) {
        $("#messageArea").addClass("alert alert-danger").text("Please enter a valid First and Last name!").show();
        isValid = false;
    } else if (!contactNumberValid) {
        $("#messageArea").addClass("alert alert-danger").text("Please enter a valid Contact number!").show();
        isValid = false;
    } else if (!emailAddressValid) {
        $("#messageArea").addClass("alert alert-danger").text("Please enter a valid Email address!").show();
        isValid = false;
    }

    // Returns the overall validity of the form.
    return isValid;
}


    function displayContactUs() {
        console.log("Called displayContactUs");

        $("#sendButton").click(function(event) {
            event.preventDefault(); // Prevent the default form submission behavior

            // Perform form validation
            if (!contactFormValidation()) {
                console.log("Form validation failed.");
                return;
            }

            console.log("Form validation passed.");

            let formData = {
                fullName: $("#fullName").val(),
                contactNumber: $("#contactNumber").val(),
                emailAddress: $("#emailAddress").val(),
                message: $("#message").val()
            };

            let feedbacks = JSON.parse(localStorage.getItem("feedbacks")) || [];
            feedbacks.push(formData);
            localStorage.setItem("feedbacks", JSON.stringify(feedbacks));

            console.log("Feedback added:", formData.fullName, formData.contactNumber, formData.emailAddress, formData.message);

            // Notify the user of successful submission
            alert("Thank you for your feedback!");

            //  clear the form fields after submission
            $("#fullName").val('');
            $("#contactNumber").val('');
            $("#emailAddress").val('');
            $("#message").val('');

             location.href = "feedbacklist.html";
        });
    }



    function contactlistpage() {
        let feedbacks = JSON.parse(localStorage.getItem("feedbacks")) || [];
        if (feedbacks.length > 0) {
            let data = feedbacks.map((feedback, index) => `<tr>
                <td class="text-center">${index + 1}</td>
                <td>${feedback.fullName}</td>
                <td>${feedback.contactNumber}</td>
                <td>${feedback.emailAddress}</td>
                <td>${feedback.message}</td>
            </tr>`).join('');

            document.getElementById("contactlist").innerHTML = data;
        }
    }

    function displayWelcomeMessage() {
        if (document.title === "Contact List") {
            if (!sessionStorage.getItem("welcomeMessageShown")) {
                let user = JSON.parse(sessionStorage.getItem("user"));
                if (user && user.DisplayName) {
                    let welcomeMessage = `Welcome, ${user.DisplayName}!`;
                    $("main.container").prepend(`<div class='alert alert-success' id='welcomeMessage'>${welcomeMessage}</div>`);
                    sessionStorage.setItem("welcomeMessageShown", "true");

                    setTimeout(() => {
                        $("#welcomeMessage").fadeOut();
                    }, 5000);
                }
            }
        }
    }



    function start(){
        console.log("App Started...");

        ajaxRequest("GET", "header.html", LoadHeader);

        switch (document.title) {
            case "Home":
                displayHomePage();
                break;
            case "Portfolio":
                displayPortfolio();
                break;
            case "Services":
                displayServices();
                break;
            case "Team":
                displayTeam();
                break;
            case "Blog":
                displayBlog();
                break;
            case "Login":
                DisplayLoginPage();
                break;
            case "Feedback":
                displayContactUs();
                break;
            case "Contact List":
                displayWelcomeMessage();
                contactlistpage();
                break;
        }
    }

    window.addEventListener("load", start);
})();
