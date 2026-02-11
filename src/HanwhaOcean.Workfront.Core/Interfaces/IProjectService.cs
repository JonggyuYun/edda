using HanwhaOcean.Workfront.Core.Entities;

namespace HanwhaOcean.Workfront.Core.Interfaces;

public interface IProjectService
{
    Task<Project?> GetByIdAsync(long id);
    Task<IEnumerable<Project>> GetAllAsync();
    Task<Project?> GetByProjectNoAsync(string projectNo);
    Task<Project> CreateAsync(Project project);
    Task UpdateAsync(Project project);
    Task UpdateProgressAsync(long id, decimal progressRate);
}
