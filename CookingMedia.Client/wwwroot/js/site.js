// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
// $(document).ready(() => {
//     // authentication middleware
//     let jwtToken = localStorage.getItem("jwtToken");
//     console.log("jwtToken: " + jwtToken);
//     let currentUrl = window.location.href
//     if ((jwtToken == null || jwtToken === "") && !currentUrl.toLowerCase().endsWith("/auth/login")) {
//         window.location.replace("/Auth/Login")
//     }
//
//     // TODO: authorization
// })

function registerValidation(element, rules, handlers) {
    $(element).validate({
        showErrors: function(errorMap, errorList) {
            this.defaultShowErrors();
            $('input').removeClass('text-danger');
        },
        onfocusout: false,
        onkeyup: false,
        onclick: false,
        errorClass: "text-danger",
        rules,
        submitHandler: handlers
    })
}

function replaceUrlSearch(queryStr) {
    let newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + queryStr;
    window.history.pushState({path: newUrl}, '', newUrl);
}

function prepareQueryStr(page) {
    let params = { page };
    let searchForm = $("#searchForm input");
    searchForm.each((index, item) => {
        let input = $(item)
        let name = input.attr("name");
        let val = input.val();
        if (val != null && val !== "") {
            params[name] = val;
        }
    });
    return jQuery.param(params);
}

function generatePaging(url, response) {
    let paging = response["paging"];
    $("#countLabel").html(response["result"].length);
    $("#totalLabel").html(paging["total"]);

    let pageCount = parseInt(paging["pageCount"]);
    let currentPage = parseInt(paging["page"]);
    let pagingArea = $("#pagingArea");
    pagingArea.html("");
    let prev = $("<li class='page-item'>").html($("<a class='page-link' onclick='return false'>").html("Previous").on('click', () => search(url, 1)))
    if (currentPage === 1) {
        prev.addClass("disabled");
    }
    pagingArea.append(prev);
    for (let i = 1; i <= pageCount; i++) {
        let pageA = $("<li class='page-item'>").html($("<a class='page-link' onclick='return false'>").html(i).on('click', () => search(url, i)))
        if (i === currentPage) {
            pageA.addClass("active");
        }
        pagingArea.append(pageA);
    }
    let next = $("<li class='page-item'>").html($("<a class='page-link' onclick='return false'>").html("Next").on('click', () => search(url, pageCount)))
    if (currentPage === pageCount) {
        next.addClass("disabled");
    }
    pagingArea.append(next);
}

function getDisplayProperties() {
    let properties = [];
    $("#tableHeader th").each((index, column) => {
        let propName = $(column).attr("data-for");
        if (propName != null && propName !== "")
            properties.push(propName);
    });
    return properties;
}

async function search(url, page = 1) {
    let queryStr = prepareQueryStr(page);
    replaceUrlSearch(queryStr);
    $("#resultBody").html("");
    url.search = queryStr;
    // await setupAuthentication();
    $.ajax({
        url: url.toString(),
        type: "get",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: (request) => {
            request.withCredentials = true;
            request.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("jwtToken")}`)
        },
        success: (response) => {
            generatePaging(url, response);
            
            let displayProperties = getDisplayProperties();
            $.each(response["result"], (index, item) => {
                $("#resultBody").append($("<tr>"));

                let lastRow = $("#resultBody tr").last();
                $.each(displayProperties, (_, prop) => {
                    lastRow.append($("<td>").html(getProperty(item, prop)));
                });
                // TODO: action edit/delete
                lastRow.append($("<td>"));
            })
        },
        error: (xhr, status, error) => console.log(xhr, status, error),
    });
}

function getProperty(object, propertyPath) {
    propertyPath = propertyPath.replace(/\[(\w+)]/g, '.$1');
    propertyPath = propertyPath.replace(/^\./, '');
    let path = propertyPath.split('.');
    let len = path.length
    for (let i = 0; i < len; i++) {
        let propName = path[i];
        if (propName in object) {
            object = object[propName];
        } else {
            return;
        }
    }
    return object;
}