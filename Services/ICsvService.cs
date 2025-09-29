using ContactManager.Models;

namespace ContactManager.Services
{
    public interface ICsvService
    {
        Task<List<Contact>> ProcessCsvFileAsync(IFormFile file);
        List<string> ValidateContact(Contact contact);
    }
}
