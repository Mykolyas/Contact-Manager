using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;
using ContactManager.Models;
using ContactManager.Services;
namespace ContactManager.Services
{
    public class CsvService : ICsvService
    {
        private readonly ILogger<CsvService> _logger;

        public CsvService(ILogger<CsvService> logger)
        {
            _logger = logger;
        }

        public async Task<List<Contact>> ProcessCsvFileAsync(IFormFile file)
        {
            var contacts = new List<Contact>();

            try
            {
                using var reader = new StreamReader(file.OpenReadStream());
                using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
                {
                    HasHeaderRecord = true
                });

                csv.Context.RegisterClassMap<ContactMap>();

                var records = csv.GetRecords<Contact>();

                foreach (var contact in records)
                {
                    var validationErrors = ValidateContact(contact);
                    if (!validationErrors.Any())
                    {
                        contacts.Add(contact);
                    }
                    else
                    {
                        _logger.LogWarning("Skipping invalid contact: {Name}, Errors: {Errors}",
                            contact.Name, string.Join(", ", validationErrors));
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing CSV file");
                throw new InvalidOperationException("Failed to process CSV file", ex);
            }

            return contacts;
        }

        public List<string> ValidateContact(Contact contact)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(contact.Name))
                errors.Add("Name is required");

            if (contact.Name?.Length > 100)
                errors.Add("Name cannot exceed 100 characters");

            if (contact.DateOfBirth == DateTime.MinValue || contact.DateOfBirth > DateTime.Now)
                errors.Add("Invalid date of birth");

            if (string.IsNullOrWhiteSpace(contact.Phone))
                errors.Add("Phone is required");

            if (contact.Phone?.Length > 20)
                errors.Add("Phone cannot exceed 20 characters");

            if (contact.Salary < 0)
                errors.Add("Salary must be a positive number");

            return errors;
        }
    }


    public sealed class ContactMap : ClassMap<Contact>
    {
        public ContactMap()
        {
            Map(m => m.Name).Name("Name");
            Map(m => m.DateOfBirth).Name("DateOfBirth", "Date of birth"); // кілька варіантів
            Map(m => m.Married).Name("Married");
            Map(m => m.Phone).Name("Phone");
            Map(m => m.Salary).Name("Salary");
        }
    }
}
