import { apiService } from "../services/api";

export function renderWorkOrders(container) {
    container.innerHTML =
        '<div class="page-header">' +
        '  <h2>작업지시</h2>' +
        '  <div id="woSearchBox"></div>' +
        '</div>' +
        '<div id="woList"></div>' +
        '<div id="woFab"></div>';

    // 검색
    $("#woSearchBox").dxTextBox({
        placeholder: "작업지시번호 또는 내용 검색",
        mode: "search",
        onValueChanged: function (e) {
            var list = $("#woList").dxList("instance");
            list.option("searchValue", e.value);
        }
    });

    // 작업지시 목록
    $("#woList").dxList({
        dataSource: new DevExpress.data.CustomStore({
            loadMode: "raw",
            load: function () {
                return apiService.get("/api/WorkOrderApi");
            }
        }),
        searchExpr: ["workOrderNo", "description"],
        grouped: false,
        itemTemplate: function (data) {
            var statusClass = getStatusClass(data.status);
            return '<div class="wo-card">' +
                '<div class="wo-header">' +
                '  <span class="wo-no">' + (data.workOrderNo || "") + '</span>' +
                '  <span class="wo-status ' + statusClass + '">' + (data.status || "") + '</span>' +
                '</div>' +
                '<div class="wo-body">' +
                '  <div class="wo-desc">' + (data.description || "") + '</div>' +
                '  <div class="wo-meta">' +
                '    <span>' + (data.processType || "") + '</span>' +
                '    <span>' + (data.progressRate || 0) + '%</span>' +
                '  </div>' +
                '</div>' +
                '</div>';
        },
        pullRefreshEnabled: true,
        pageLoadMode: "scrollBottom",
        onItemClick: function (e) {
            showWorkOrderDetail(e.itemData);
        }
    });

    // FAB 버튼 (작업지시 등록)
    $("#woFab").dxSpeedDialAction({
        icon: "add",
        label: "작업지시 등록",
        onClick: function () {
            // TODO: 작업지시 등록 폼 네비게이션
        }
    });
}

function getStatusClass(status) {
    switch (status) {
        case "InProgress": return "status-progress";
        case "Completed": return "status-completed";
        case "OnHold": return "status-hold";
        default: return "status-default";
    }
}

function showWorkOrderDetail(data) {
    DevExpress.ui.dialog.custom({
        title: data.workOrderNo,
        messageHtml:
            '<div class="wo-detail">' +
            '<p><strong>작업내용:</strong> ' + (data.description || "-") + '</p>' +
            '<p><strong>공정:</strong> ' + (data.processType || "-") + '</p>' +
            '<p><strong>작업장소:</strong> ' + (data.workArea || "-") + '</p>' +
            '<p><strong>진척률:</strong> ' + (data.progressRate || 0) + '%</p>' +
            '<p><strong>계획공수:</strong> ' + (data.planManHours || 0) + ' M/H</p>' +
            '</div>',
        buttons: [
            { text: "닫기", onClick: function () { return true; } }
        ]
    }).show();
}
