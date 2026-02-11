namespace HanwhaOcean.Workfront.Core.Entities;

/// <summary>
/// 작업지시 상세 (일일 작업 실적)
/// </summary>
public class WorkOrderDetail : BaseEntity
{
    public long WorkOrderId { get; set; }
    public DateTime WorkDate { get; set; }                       // 작업일자
    public int WorkerCount { get; set; }                         // 투입인원
    public decimal ManHours { get; set; }                        // 투입공수 (M/H)
    public decimal ProgressRate { get; set; }                    // 일일 진척률
    public string WorkContent { get; set; } = string.Empty;      // 작업내용
    public string? Issue { get; set; }                           // 이슈사항
    public string? Remark { get; set; }

    // Navigation
    public WorkOrder WorkOrder { get; set; } = null!;
}
