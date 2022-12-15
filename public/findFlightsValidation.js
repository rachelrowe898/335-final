window.onsubmit = validateForm;

function validateForm() {
    let origin = document.getElementById("origin").value;
    let destination = document.getElementById("destination").value;
    let numTickets = document.getElementById("numTickets").value;

    let month = document.getElementById("month").value;
    let day = document.getElementById("day").value;
    let year = document.getElementById("year").value;

    let daysInEachMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    let userDateStr = month + " " + day + ", " + year;
    const userDate = new Date(userDateStr);
    const currentDate = new Date();

    let invalidMessages = "";
    if((userDate.getFullYear() < currentDate.getFullYear()) 
        || (userDate.getFullYear() > currentDate.getFullYear() + 1)) { //check if year is in the past or if it is not more than 1 year in the future
        invalidMessages += "Invalid year";   
    } 

    if(userDate.getFullYear() >= currentDate.getFullYear()) {
        if(userDate.getMonth() < currentDate.getMonth()) { //if year is the same, check if month is in the past
            invalidMessages += "Invalid month";
        } else if((userDate.getMonth() == currentDate.getMonth())) {
            if((userDate.getDate() > daysInEachMonth[userDate.getMonth()])  || (userDate.getDate() < currentDate.getDate())) {
                invalidMessages += "Invalid day";
            }
        }
    }

    if (invalidMessages !== "") {
        alert(invalidMessages);
        return false;
    } else {
        let valuesProvided = "Do you want to submit the following flight details?\n";
        valuesProvided += "Origin: " + origin + "\n";
        valuesProvided += "Destination: " + destination + "\n";
        valuesProvided += "Date: " + userDateStr + "\n";
        valuesProvided += "Number of Tickets: " + numTickets + "\n";
        return window.confirm(valuesProvided);
    }
}