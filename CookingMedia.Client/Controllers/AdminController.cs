using Microsoft.AspNetCore.Mvc;

namespace CookingMedia.Client.Controllers;

public class AdminController : Controller
{
    public IActionResult Ingredient()
    {
        return View();
    }
    
    public IActionResult IngredientCategory()
    {
        return View();
    }
}