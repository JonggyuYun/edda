using HanwhaOcean.Workfront.Core.Enums;

namespace HanwhaOcean.Workfront.Core.Entities;

/// <summary>
/// 자재 요청
/// </summary>
public class MaterialRequest : BaseEntity
{
    public long WorkOrderId { get; set; }
    public string RequestNo { get; set; } = string.Empty;        // 요청번호
    public string MaterialCode { get; set; } = string.Empty;     // 자재코드
    public string MaterialName { get; set; } = string.Empty;     // 자재명
    public string Specification { get; set; } = string.Empty;    // 규격
    public string Unit { get; set; } = string.Empty;             // 단위
    public decimal RequestQty { get; set; }                      // 요청수량
    public decimal IssuedQty { get; set; }                       // 출고수량
    public MaterialStatus Status { get; set; } = MaterialStatus.Requested;
    public DateTime RequestDate { get; set; }                    // 요청일
    public DateTime? RequiredDate { get; set; }                  // 필요일
    public string? Remark { get; set; }

    // Navigation
    public WorkOrder WorkOrder { get; set; } = null!;
}
