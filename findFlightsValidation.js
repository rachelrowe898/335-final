window.onsubmit = validateForm;

function validateForm() {
    let origin = document.getElementById("origin").value;
    let destination = document.getElementById("destination").value;
    let numTickets = document.getElementById("numTickets").value;

    let month = document.getElementById("month").value;
    let day = document.getElementById("day").value;

    let daysInEachMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    let invalidMessages = "";

    if(day > daysInEachMonth[month-1]) {
        invalidMessages += "Invalid date";
    }

    if (invalidMessages !== "") {
        alert(invalidMessages);
        return false;
    } else {
        let valuesProvided = "Do you want to submit the following flight details?\n";
        valuesProvided += "Origin: " + origin + "\n";
        valuesProvided += "Destination: " + destination + "\n";
        valuesProvided += "Date: " + month + "/" + day + "\n";
        valuesProvided += "Number of Tickets: " + numTickets + "\n";

        return window.confirm(valuesProvided);
    }
}