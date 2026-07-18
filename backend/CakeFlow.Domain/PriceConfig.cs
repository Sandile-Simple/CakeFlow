namespace CakeFlow.Domain;

public class PriceConfig
{
    public int PriceConfigId { get; set; }
    public int CompanyId { get; set; }
    public string ConfigJson { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}