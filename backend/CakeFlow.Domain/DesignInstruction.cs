namespace CakeFlow.Domain;

public class DesignInstruction
{
    public int DesignInstructionId { get; set; }
    public int OrderId { get; set; }
    public Order? Order { get; set; }

    public string? ReferenceImageUrl { get; set; }
    public string? DesignNotes { get; set; }
    public string? ColourScheme { get; set; }
    public string? DecoratorNotes { get; set; }
}