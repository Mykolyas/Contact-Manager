# Contact Manager Application

## 📋 Загальний огляд

**Contact Manager** - це веб-додаток на ASP.NET Core MVC для управління контактною інформацією з можливістю масового імпорту CSV файлів та інтерактивного редагування даних.

## 🎯 Основні функції

- ✅ Завантаження та обробка CSV файлів
- ✅ Збереження даних в MS SQL Server
- ✅ CRUD операції з контактами
- ✅ Inline редагування в таблиці
- ✅ Фільтрація та сортування даних
- ✅ Валідація даних на сервері та клієнті

## 🏗️ Архітектура проекту

### Технологічний стек

- **Backend:** ASP.NET Core 8.0 MVC
- **Database:** Entity Framework Core + SQL Server LocalDB
- **Frontend:** Bootstrap 5, jQuery
- **CSV Processing:** CsvHelper library
- **Validation:** Data Annotations + Custom validation

### Структура папок

```
Test Project/
├── Controllers/          # MVC контролери
├── Models/              # Моделі даних та DbContext
├── Services/            # Бізнес-логіка (CSV обробка)
├── Views/               # Razor представлення
│   ├── Contacts/        # Views для контактів
│   └── Shared/          # Спільні компоненти
├── wwwroot/             # Статичні файли
│   ├── css/            # Стилі
│   └── js/             # JavaScript файли
├── Program.cs           # Точка входу додатку
├── appsettings.json    # Конфігурація
└── ContactManager.csproj # Проект файл
```

#### `appsettings.json` (12 рядків)

**Призначення:** Конфігурація додатку
**Містить:**

- Connection string для SQL Server LocalDB
- Налаштування логування
- Конфігурація для різних середовищ

#### `Nuget пакети`
- Microsoft.EntityFrameworkCore
- Microsoft.EntityFrameworkCore.SqlServer
- CsvHelper (30.0.1)

### Особливості DB

- Автоматичне створення при запуску
- LocalDB для розробки
- Indexes на ключові поля


### Сценарії тестування

1. Завантаження CSV файлу

Дані повинні бути зображені у такому вигляді

Text.csv

Name,DateOfBirth,Married,Phone,Salary

John Doe,1985-04-12,true,+380501234567,1500.50



2. Додавання контакту вручну
3. Редагування через inline editing
4. Видалення контактів
5. Пошук та фільтрація
6. Сортування по колонках
7. Валідація некоректних даних



## 📋 Висновки

**Contact Manager** - це повноцінний веб-додаток, який демонструє:

- Сучасні практики ASP.NET Core розробки
- Ефективну обробку CSV даних
- Інтерактивний користувацький інтерфейс
- Надійну валідацію та обробку помилок

