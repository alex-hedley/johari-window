$("#tableJohari tr td").click(function(e) { // 
    // Get the classes on the cell
    var classList = $(this).attr("class");
    console.log(classList);

    var className = "selected";
    var rowCount = $('table#tableJohari > tbody > tr > td.selected').length;
    
    if ((classList !== undefined || classList !== null || classList !== "")) {
        if (rowCount < 5) {
            $(this).toggleClass(className);
        } else if (classList.includes(className)) {
            $(this).toggleClass(className);
        }
    }

    e.stopPropagation();
});

// DRY...
$("#tableNohari tr td").click(function(e) {
    // Get the classes on the cell
    var classList = $(this).attr("class");
    console.log(classList);

    var className = "selected";
    var rowCount = $('table#tableNohari > tbody > tr > td.selected').length;
    
    if ((classList !== undefined || classList !== null || classList !== "")) {
        if (rowCount < 5) {
            $(this).toggleClass(className);
        } else if (classList.includes(className)) {
            $(this).toggleClass(className);
        }
    }

    e.stopPropagation();
});