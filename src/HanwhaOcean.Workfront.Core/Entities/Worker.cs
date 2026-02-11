namespace HanwhaOcean.Workfront.Core.Entities;

/// <summary>
/// 작업자 (인력)
/// </summary>
public class Worker : BaseEntity
{
    public string EmployeeNo { get; set; } = string.Empty;       // 사번
    public string Name { get; set; } = string.Empty;             // 성명
    public string Department { get; set; } = string.Empty;       // 부서
    public string Team { get; set; } = string.Empty;             // 팀
    public string Position { get; set; } = string.Empty;         // 직급
    public string Skill { get; set; } = string.Empty;            // 기능 (용접, 취부, 도장 등)
    public string? CertificationInfo { get; set; }               // 자격증 정보
    public string? ContactNo { get; set; }                       // 연락처
    public bool IsActive { get; set; } = true;
}
