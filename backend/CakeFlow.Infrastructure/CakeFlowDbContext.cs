using Microsoft.EntityFrameworkCore;
using CakeFlow.Domain;

namespace CakeFlow.Infrastructure;

public class CakeFlowDbContext : DbContext
{
    public CakeFlowDbContext(DbContextOptions<CakeFlowDbContext> options) : base(options) { }
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<DesignInstruction> DesignInstructions => Set<DesignInstruction>();
    public DbSet<User> Users => Set<User>();
    public DbSet<StatusHistory> StatusHistories => Set<StatusHistory>();
    public DbSet<PriceConfig> PriceConfigs => Set<PriceConfig>();
}