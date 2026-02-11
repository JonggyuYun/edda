// API 서비스 (DevExtreme 모바일용)

var API_BASE = "";  // Same origin proxy

export var apiService = {
    get: function (url, params) {
        return $.ajax({
            url: API_BASE + url,
            method: "GET",
            data: params,
            dataType: "json"
        });
    },

    post: function (url, data) {
        return $.ajax({
            url: API_BASE + url,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            dataType: "json"
        });
    },

    put: function (url, data) {
        return $.ajax({
            url: API_BASE + url,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(data),
            dataType: "json"
        });
    }
};
