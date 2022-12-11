window.onsubmit = validateForm;

function validateForm() {
    let destination = document.getElementById("destination").value;

    let month = document.getElementById("month").value;
    let day = document.getElementById("day").value;

    let minPriceRange = document.getElementById("minPriceRange").value;
    let maxPriceRange = document.getElementById("maxPriceRange").value;

    let daysInEachMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    let invalidMessages = "";

    if(daysInEachMonth[month-1] != day) {
        invalidMessages += "Invalid date";
    }

    if(minPriceRange >= maxPriceRange) {
        invalidMessages += "Invalid price range";
    }

    if (invalidMessages !== "") {
        alert(invalidMessages);
        return false;
    } else {
        let valuesProvided = "Do you want to submit the following payment?\n";
        valuesProvided += "Destination: " + destination + "\n";
        valuesProvided += "Date: " + month + "/" + day + "\n";
        valuesProvided += "Price Range: " + minPriceRange + "-" + maxPriceRange + "\n";

        return window.confirm(valuesProvided);
    }
}