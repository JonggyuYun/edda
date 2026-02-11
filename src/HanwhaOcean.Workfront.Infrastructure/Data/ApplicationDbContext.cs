using HanwhaOcean.Workfront.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace HanwhaOcean.Workfront.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Block> Blocks => Set<Block>();
    public DbSet<WorkOrder> WorkOrders => Set<WorkOrder>();
    public DbSet<WorkOrderDetail> WorkOrderDetails => Set<WorkOrderDetail>();
    public DbSet<QualityInspection> QualityInspections => Set<QualityInspection>();
    public DbSet<MaterialRequest> MaterialRequests => Set<MaterialRequest>();
    public DbSet<Worker> Workers => Set<Worker>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Project
        modelBuilder.Entity<Project>(entity =>
        {
            entity.ToTable("TB_PROJECT");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ProjectNo).IsUnique();
            entity.Property(e => e.ProjectNo).HasMaxLength(20).IsRequired();
            entity.Property(e => e.ShipName).HasMaxLength(100);
            entity.Property(e => e.ShipType).HasMaxLength(50);
            entity.Property(e => e.ShipOwner).HasMaxLength(200);
            entity.Property(e => e.ProgressRate).HasPrecision(5, 2);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // Block
        modelBuilder.Entity<Block>(entity =>
        {
            entity.ToTable("TB_BLOCK");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.ProjectId, e.BlockNo }).IsUnique();
            entity.Property(e => e.BlockNo).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Weight).HasPrecision(10, 2);
            entity.Property(e => e.ProgressRate).HasPrecision(5, 2);
            entity.HasOne(e => e.Project)
                  .WithMany(p => p.Blocks)
                  .HasForeignKey(e => e.ProjectId);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // WorkOrder
        modelBuilder.Entity<WorkOrder>(entity =>
        {
            entity.ToTable("TB_WORK_ORDER");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.WorkOrderNo).IsUnique();
            entity.Property(e => e.WorkOrderNo).HasMaxLength(30).IsRequired();
            entity.Property(e => e.WorkArea).HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.PlanManHours).HasPrecision(10, 2);
            entity.Property(e => e.ActualManHours).HasPrecision(10, 2);
            entity.Property(e => e.ProgressRate).HasPrecision(5, 2);
            entity.HasOne(e => e.Project)
                  .WithMany(p => p.WorkOrders)
                  .HasForeignKey(e => e.ProjectId);
            entity.HasOne(e => e.Block)
                  .WithMany(b => b.WorkOrders)
                  .HasForeignKey(e => e.BlockId)
                  .IsRequired(false);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // WorkOrderDetail
        modelBuilder.Entity<WorkOrderDetail>(entity =>
        {
            entity.ToTable("TB_WORK_ORDER_DETAIL");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ManHours).HasPrecision(10, 2);
            entity.Property(e => e.ProgressRate).HasPrecision(5, 2);
            entity.HasOne(e => e.WorkOrder)
                  .WithMany(w => w.Details)
                  .HasForeignKey(e => e.WorkOrderId);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // QualityInspection
        modelBuilder.Entity<QualityInspection>(entity =>
        {
            entity.ToTable("TB_QUALITY_INSPECTION");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.InspectionNo).IsUnique();
            entity.Property(e => e.InspectionNo).HasMaxLength(30).IsRequired();
            entity.Property(e => e.InspectionType).HasMaxLength(20);
            entity.HasOne(e => e.WorkOrder)
                  .WithMany(w => w.Inspections)
                  .HasForeignKey(e => e.WorkOrderId);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // MaterialRequest
        modelBuilder.Entity<MaterialRequest>(entity =>
        {
            entity.ToTable("TB_MATERIAL_REQUEST");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.RequestNo).IsUnique();
            entity.Property(e => e.RequestNo).HasMaxLength(30).IsRequired();
            entity.Property(e => e.MaterialCode).HasMaxLength(30);
            entity.Property(e => e.MaterialName).HasMaxLength(200);
            entity.Property(e => e.Specification).HasMaxLength(200);
            entity.Property(e => e.RequestQty).HasPrecision(10, 2);
            entity.Property(e => e.IssuedQty).HasPrecision(10, 2);
            entity.HasOne(e => e.WorkOrder)
                  .WithMany(w => w.MaterialRequests)
                  .HasForeignKey(e => e.WorkOrderId);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // Worker
        modelBuilder.Entity<Worker>(entity =>
        {
            entity.ToTable("TB_WORKER");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.EmployeeNo).IsUnique();
            entity.Property(e => e.EmployeeNo).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Department).HasMaxLength(100);
            entity.Property(e => e.Team).HasMaxLength(100);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });
    }
}
