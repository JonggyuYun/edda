using HanwhaOcean.Workfront.Core.Enums;

namespace HanwhaOcean.Workfront.Core.Entities;

/// <summary>
/// 품질검사
/// </summary>
public class QualityInspection : BaseEntity
{
    public long WorkOrderId { get; set; }
    public string InspectionNo { get; set; } = string.Empty;     // 검사번호
    public string InspectionType { get; set; } = string.Empty;   // 검사유형 (VT, RT, UT, MT, PT 등)
    public DateTime InspectionDate { get; set; }                  // 검사일
    public string Inspector { get; set; } = string.Empty;        // 검사원
    public QualityResult Result { get; set; } = QualityResult.Pending;
    public string? DefectDescription { get; set; }               // 결함내용
    public string? CorrectiveAction { get; set; }                // 시정조치
    public string? Remark { get; set; }

    // Navigation
    public WorkOrder WorkOrder { get; set; } = null!;
}
