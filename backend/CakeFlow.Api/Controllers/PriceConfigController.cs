using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CakeFlow.Infrastructure;
using CakeFlow.Domain;

namespace CakeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PriceConfigController : ControllerBase
{
    private readonly CakeFlowDbContext _context;

    public PriceConfigController(CakeFlowDbContext context)
    {
        _context = context;
    }

    private const string DefaultConfigJson = @"{
        ""roundSizes"": { ""8"": 35, ""10"": 55, ""12"": 75, ""14"": 105, ""16"": 120 },
        ""squareSizes"": { ""8"": 45, ""10"": 65, ""12"": 85, ""14"": 120, ""16"": 140 },
        ""threeDStartingPrice"": 150,
        ""cakeFairyCakePrice"": 20,
        ""tieredCakeStartingPrice"": 90,
        ""themedFondantSizePrices"": { ""8"": 65, ""10"": 85, ""12"": 120, ""14"": 140, ""16"": 160 },
        ""buttercreamIcingFee"": 5,
        ""extraFlavorFee"": 5,
        ""accessoriesFee"": 5,
        ""cupcakePlainPrice"": 1,
        ""cupcakeThemedPrice"": 1.5,
        ""weddingStartingPrice"": 500
    }";

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetPriceConfig([FromQuery] int companyId = 0)
    {
        var config = await _context.PriceConfigs.FirstOrDefaultAsync(p => p.CompanyId == companyId);
        return Ok(new { configJson = config?.ConfigJson ?? DefaultConfigJson });
    }

    public class UpdateConfigRequest
    {
        public string ConfigJson { get; set; } = string.Empty;
    }

    [Authorize(Roles = "Owner")]
    [HttpPut]
    public async Task<IActionResult> UpdatePriceConfig(UpdateConfigRequest request)
    {
        var companyIdClaim = User.FindFirst("CompanyId")?.Value;
        if (companyIdClaim == null || !int.TryParse(companyIdClaim, out var companyId))
            return Unauthorized();

        var config = await _context.PriceConfigs.FirstOrDefaultAsync(p => p.CompanyId == companyId);
        if (config == null)
        {
            config = new PriceConfig { CompanyId = companyId, ConfigJson = request.ConfigJson, UpdatedAt = DateTime.UtcNow };
            _context.PriceConfigs.Add(config);
        }
        else
        {
            config.ConfigJson = request.ConfigJson;
            config.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Price configuration updated successfully.", updatedAt = config.UpdatedAt });
    }
}