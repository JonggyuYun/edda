using DevExpress.AspNetCore.Reporting;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaOcean.Workfront.Web.Controllers;

/// <summary>
/// DevExpress 보고서
/// </summary>
public class ReportController : Controller
{
    public IActionResult Index()
    {
        return View();
    }

    /// <summary>
    /// 작업지시서 출력
    /// </summary>
    public IActionResult WorkOrderReport(long workOrderId)
    {
        ViewBag.WorkOrderId = workOrderId;
        return View();
    }

    /// <summary>
    /// 일일 작업현황 보고서
    /// </summary>
    public IActionResult DailyReport(DateTime? reportDate)
    {
        ViewBag.ReportDate = reportDate ?? DateTime.Today;
        return View();
    }

    /// <summary>
    /// 호선 진척 보고서
    /// </summary>
    public IActionResult ProjectProgressReport(long projectId)
    {
        ViewBag.ProjectId = projectId;
        return View();
    }
}
