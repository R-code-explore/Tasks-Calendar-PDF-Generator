// Initialize Flatpickr & Select2
$(document).ready(function() {
    
    $("#month").flatpickr({
        mode: "multiple",
        dateFormat: "Y-m-d"
    });

    $("#tasks").select2({
        placeholder: "Select tasks"
    });

    $("#team").select2({
        placeholder: "Select a team"
    });

    $("#location").select2({
        placeholder: "Select a location"
    });
});