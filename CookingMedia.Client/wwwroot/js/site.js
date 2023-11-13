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

function prepareQueryStr() {
    let params = {};
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

function setPaging(response) {
    let paging = response["paging"];
    $("#countLabel").html(response["result"].length);
    $("#totalLabel").html(paging["total"]);

    let pageCount = parseInt(paging["pageCount"]);
    let currentPage = parseInt(paging["page"]);
    let pagingArea = $("#pagingArea");
    pagingArea.html("");
    let prev = $("<li class='page-item'>").html($("<a class='page-link' onclick='return false'>").html("Previous").on('click', () => moveToPage(1)))
    if (currentPage === 1) {
        prev.addClass("disabled");
    }
    pagingArea.append(prev);
    for (let i = 1; i <= pageCount; i++) {
        let pageA = $("<li class='page-item'>").html($("<a class='page-link' onclick='return false'>").html(i).on('click', () => moveToPage(i)))
        if (i === currentPage) {
            pageA.addClass("active");
        }
        pagingArea.append(pageA);
    }
    let next = $("<li class='page-item'>").html($("<a class='page-link' onclick='return false'>").html("Next").on('click', () => moveToPage(pageCount)))
    if (currentPage === pageCount) {
        next.addClass("disabled");
    }
    pagingArea.append(next);
}

function getEntityProperties() {
    let properties = [];
    $("#tableHeader th").each((index, column) => {
        let propName = column.attr("data-for");
        if (propName != null && propName !== "")
            properties.push(propName);
    });
    return properties;
}

async function search(url) {
    let queryStr = prepareQueryStr();
    replaceUrlSearch(queryStr);
    $("#resultBody").html(queryStr);
    url.searchParams = queryStr;
    // await setupAuthentication();
    $.ajax({
        url: url.toString(),
        type: "get",
        contentType: "application/grpc; charset=utf-8",
        dataType: "grpc",
        beforeSend: (request) => {
            request.withCredentials = true;
            request.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("jwtToken")}`)
        },
        success: (response) => {
            setPaging(response);
            let properties = getEntityProperties();

            $.each(response["result"], (index, item) => {
                $("#resultBody").append($("<tr>"));

                let lastRow = $("#resultBody tr").last();
                $.each(properties, (prop) => {
                    lastRow.append($("<td>").html(item[prop]));
                });
                lastRow.append($("<td>"));
            })
        },
        error: (xhr, status, error) => console.log(xhr, status, error),
    });
}

function moveToPage(page) {
    search().then();
}
