import { apiService } from "../services/api";

export function renderDashboard(container) {
    container.innerHTML =
        '<div class="page-header"><h2>대시보드</h2></div>' +
        '<div class="mobile-cards" id="dashSummary"></div>' +
        '<div class="mobile-chart" id="dashChart"></div>' +
        '<div class="mobile-list" id="dashRecent"></div>';

    // 호선별 진척률 차트
    $("#dashChart").dxChart({
        dataSource: new DevExpress.data.CustomStore({
            loadMode: "raw",
            load: function () {
                return apiService.get("/api/WorkOrderApi");
            }
        }),
        series: [{
            argumentField: "projectNo",
            valueField: "progressRate",
            type: "bar",
            color: "#1e3a5f"
        }],
        size: { height: 250 },
        legend: { visible: false },
        title: { text: "호선별 진척률", font: { size: 14 } }
    });

    // 최근 작업지시 리스트
    $("#dashRecent").dxList({
        dataSource: new DevExpress.data.CustomStore({
            loadMode: "raw",
            load: function () {
                return apiService.get("/api/WorkOrderApi");
            }
        }),
        itemTemplate: function (data) {
            return '<div class="list-item">' +
                '<div class="list-item-title">' + (data.workOrderNo || "") + '</div>' +
                '<div class="list-item-sub">' + (data.description || "") + '</div>' +
                '</div>';
        },
        height: 300,
        pullRefreshEnabled: true
    });
}
