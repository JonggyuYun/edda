// 한화오션 Workfront - 공통 JavaScript

(function () {
    "use strict";

    // 사이드바 토글
    var sidebarToggle = document.getElementById("sidebarToggle");
    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", function () {
            var sidebar = document.getElementById("sidebar");
            sidebar.classList.toggle("open");
        });
    }

    // 사이드메뉴 그룹 토글
    var menuGroups = document.querySelectorAll(".menu-group-title");
    menuGroups.forEach(function (group) {
        group.addEventListener("click", function () {
            var subMenu = this.nextElementSibling;
            if (subMenu) {
                subMenu.style.display = subMenu.style.display === "none" ? "block" : "none";
            }
        });
    });

    // 현재 페이지 메뉴 하이라이트
    var currentPath = window.location.pathname.toLowerCase();
    var menuLinks = document.querySelectorAll(".sidebar-menu a");
    menuLinks.forEach(function (link) {
        if (link.getAttribute("href") && link.getAttribute("href").toLowerCase() === currentPath) {
            link.style.backgroundColor = "rgba(255,255,255,0.15)";
            link.style.color = "#fff";
        }
    });
})();
