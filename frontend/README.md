# Job Portal Frontend

Frontend web application for the job portal admin panel.

## Structure

```
frontend/
├── admin.html      # Admin panel page
├── index.html      # Landing page
├── styles.css      # Styling
└── script.js       # JavaScript logic
```

## Features

- **Dashboard**: Real-time statistics and activity feed
- **Workers Management**: CRUD operations for workers
- **Customers Management**: CRUD operations for customers
- **Jobs Management**: CRUD operations for jobs
- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Clean, professional interface

## Technologies

- HTML5
- CSS3 (Flexbox, Grid)
- Vanilla JavaScript (ES6+)
- Font Awesome Icons
- Fetch API for backend communication

## Pages

### index.html
Landing page with navigation to admin panel

### admin.html
Main admin panel with:
- Sidebar navigation
- Dashboard with statistics
- Workers table and forms
- Customers table and forms
- Jobs table and forms
- Modal dialogs for add/edit

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api`

All CRUD operations are performed via Fetch API:
- GET requests to load data
- POST requests to create records
- PUT requests to update records
- DELETE requests to remove records

## Customization

### Changing API URL
Edit `script.js`:
```javascript
const API_URL = 'http://your-api-url/api';
```

### Styling
Modify `styles.css` to change colors, fonts, and layout.

### Adding Features
Add new sections in `admin.html` and corresponding functions in `script.js`.

