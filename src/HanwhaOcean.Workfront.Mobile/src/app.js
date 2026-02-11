import "devextreme/dist/css/dx.material.blue.light.compact.css";
import "./styles/mobile.css";
import { apiService } from "./services/api";
import { renderDashboard } from "./pages/dashboard";
import { renderWorkOrders } from "./pages/workOrders";

// 앱 초기화
document.addEventListener("DOMContentLoaded", function () {
    initApp();
});

function initApp() {
    var app = document.getElementById("app");
    app.innerHTML = "";

    // 하단 탭 네비게이션
    var tabContainer = document.createElement("div");
    tabContainer.id = "bottomTabs";
    app.appendChild(tabContainer);

    // 콘텐츠 영역
    var contentArea = document.createElement("div");
    contentArea.id = "contentArea";
    contentArea.className = "mobile-content";
    app.insertBefore(contentArea, tabContainer);

    // DevExtreme TabPanel (하단 네비게이션)
    DevExpress.ui.dxTabPanel.getInstance(
        $("#bottomTabs").dxTabPanel({
            items: [
                { title: "대시보드", icon: "chart" },
                { title: "작업지시", icon: "folder" },
                { title: "내 작업", icon: "user" },
                { title: "설정", icon: "preferences" }
            ],
            selectedIndex: 0,
            swipeEnabled: true,
            animationEnabled: true,
            onSelectionChanged: function (e) {
                navigateTo(e.addedItems[0].title);
            }
        })
    );

    // 초기 화면
    renderDashboard(contentArea);
}

function navigateTo(pageName) {
    var content = document.getElementById("contentArea");
    content.innerHTML = "";

    switch (pageName) {
        case "대시보드":
            renderDashboard(content);
            break;
        case "작업지시":
            renderWorkOrders(content);
            break;
        case "내 작업":
            renderMyWork(content);
            break;
        case "설정":
            renderSettings(content);
            break;
    }
}

function renderMyWork(container) {
    container.innerHTML = '<div class="page-header"><h2>내 작업</h2></div><div id="myWorkList"></div>';

    $("#myWorkList").dxList({
        dataSource: new DevExpress.data.CustomStore({
            loadMode: "raw",
            load: function () {
                return apiService.get("/api/WorkOrderApi?status=2"); // InProgress
            }
        }),
        itemTemplate: function (data) {
            return '<div class="work-item">' +
                '<div class="work-no">' + data.workOrderNo + '</div>' +
                '<div class="work-desc">' + data.description + '</div>' +
                '<div class="work-progress">' + data.progressRate + '%</div>' +
                '</div>';
        },
        pullRefreshEnabled: true,
        pageLoadMode: "scrollBottom"
    });
}

function renderSettings(container) {
    container.innerHTML = '<div class="page-header"><h2>설정</h2></div><div id="settingsForm"></div>';

    $("#settingsForm").dxForm({
        items: [
            { dataField: "notification", editorType: "dxSwitch", label: { text: "알림 수신" } },
            { dataField: "darkMode", editorType: "dxSwitch", label: { text: "다크 모드" } },
            { dataField: "language", editorType: "dxSelectBox", editorOptions: { items: ["한국어", "English"] }, label: { text: "언어" } }
        ]
    });
}
