using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CakeFlow.Infrastructure;
using CakeFlow.Domain;
using Microsoft.AspNetCore.Authorization;

namespace CakeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly CakeFlowDbContext _context;

    public OrdersController(CakeFlowDbContext context)
    {
        _context = context;
    }

    // GET: api/orders
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
    {
        var companyIdClaim = User.FindFirst("CompanyId")?.Value;
        if (companyIdClaim == null || !int.TryParse(companyIdClaim, out var companyId))
            return Unauthorized();

        return await _context.Orders
            .Where(o => o.CompanyId == companyId)
            .Include(o => o.OrderItems)
            .Include(o => o.DesignInstruction)
            .Include(o => o.StatusHistory)
            .ToListAsync();
    }

    // GET: api/orders/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Order>> GetOrder(int id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.DesignInstruction)
            .Include(o => o.StatusHistory)
            .FirstOrDefaultAsync(o => o.OrderId == id);

        if (order == null) return NotFound();
        return order;
    }

    // POST: api/orders
   [AllowAnonymous]
    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(Order order)
    {
        order.CreatedAt = DateTime.UtcNow;
        order.Status = "Pending";
        if (order.CompanyId == 0 && order.CompanyId != 0) { } // no-op placeholder

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        _context.StatusHistories.Add(new StatusHistory
        {
            OrderId = order.OrderId,
            Status = "Pending",
            ChangedBy = "System",
            ChangedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, order);
    }

    // PUT: api/orders/5/status
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string newStatus)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound();

        order.Status = newStatus;
        _context.StatusHistories.Add(new StatusHistory
        {
            OrderId = id,
            Status = newStatus,
            ChangedBy = "System",
            ChangedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return NoContent();
    }
}