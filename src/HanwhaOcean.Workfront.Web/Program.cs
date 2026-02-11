using DevExpress.AspNetCore;
using DevExpress.AspNetCore.Reporting;
using HanwhaOcean.Workfront.Core.Interfaces;
using HanwhaOcean.Workfront.Core.Services;
using HanwhaOcean.Workfront.Infrastructure.Data;
using HanwhaOcean.Workfront.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Serilog 설정
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/workfront-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// DevExpress
builder.Services.AddDevExpressControls();
builder.Services.AddMvc();

// DevExpress Reporting
builder.Services.ConfigureReportingServices(configurator =>
{
    configurator.ConfigureWebDocumentViewer(viewerConfigurator =>
    {
        viewerConfigurator.UseCachedReportSourceBuilder();
    });
    configurator.ConfigureReportDesigner(designerConfigurator =>
    {
    });
});

// DI - Repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// DI - Services
builder.Services.AddScoped<IWorkOrderService, WorkOrderService>();

// Authentication & Authorization
builder.Services.AddAuthentication()
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Auth:Authority"];
        options.Audience = builder.Configuration["Auth:Audience"];
    });
builder.Services.AddAuthorization();

// Session
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// CORS (for DevExtreme Mobile)
builder.Services.AddCors(options =>
{
    options.AddPolicy("MobilePolicy", policy =>
    {
        policy.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>())
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

// DevExpress
app.UseDevExpressControls();

app.UseRouting();
app.UseCors("MobilePolicy");
app.UseSession();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// API 라우팅 (DevExtreme Mobile용)
app.MapControllerRoute(
    name: "api",
    pattern: "api/{controller}/{action}/{id?}");

app.Run();
