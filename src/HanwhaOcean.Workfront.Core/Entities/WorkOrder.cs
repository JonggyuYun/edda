using HanwhaOcean.Workfront.Core.Enums;

namespace HanwhaOcean.Workfront.Core.Entities;

/// <summary>
/// 작업지시서
/// </summary>
public class WorkOrder : BaseEntity
{
    public string WorkOrderNo { get; set; } = string.Empty;      // 작업지시 번호
    public long ProjectId { get; set; }                          // 호선 ID
    public long? BlockId { get; set; }                           // 블록 ID
    public ProcessType ProcessType { get; set; }                 // 공정유형
    public string WorkArea { get; set; } = string.Empty;         // 작업장소
    public string Description { get; set; } = string.Empty;      // 작업내용
    public WorkOrderStatus Status { get; set; } = WorkOrderStatus.Draft;
    public DateTime PlanStartDate { get; set; }                  // 계획 시작일
    public DateTime PlanEndDate { get; set; }                    // 계획 완료일
    public DateTime? ActualStartDate { get; set; }               // 실적 시작일
    public DateTime? ActualEndDate { get; set; }                 // 실적 완료일
    public decimal PlanManHours { get; set; }                    // 계획 공수 (M/H)
    public decimal ActualManHours { get; set; }                  // 실적 공수 (M/H)
    public decimal ProgressRate { get; set; }                    // 진척률 (%)
    public string? SupervisorId { get; set; }                    // 감독자
    public string? Remark { get; set; }

    // Navigation
    public Project Project { get; set; } = null!;
    public Block? Block { get; set; }
    public ICollection<WorkOrderDetail> Details { get; set; } = new List<WorkOrderDetail>();
    public ICollection<QualityInspection> Inspections { get; set; } = new List<QualityInspection>();
    public ICollection<MaterialRequest> MaterialRequests { get; set; } = new List<MaterialRequest>();
}
