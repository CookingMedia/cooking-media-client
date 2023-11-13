namespace CookingMedia.Client.Models;

public class TokenModel
{
    public string Token { get; set; } = null!;
    public UserResponseModel User { get; set; } = null!;
}

public class UserResponseModel
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Role { get; set; } = null!;
}
