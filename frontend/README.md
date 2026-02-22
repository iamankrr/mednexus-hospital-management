# 🏥 MedNexus - Hospital & Laboratory Management System

A comprehensive healthcare management platform built with MERN stack that helps users find hospitals and diagnostic labs, book appointments, and manage healthcare facilities.

![MedNexus Banner](https://img.shields.io/badge/MedNexus-Healthcare-blue)

## 🌟 Features

### For Users
- 🔍 **Search & Filter** - Find hospitals and labs by location, type, facilities
- 📍 **Location-Based** - Get nearest facilities based on your location
- ❤️ **Favorites** - Save your preferred hospitals and labs
- 📅 **Appointments** - Book appointments online
- ⭐ **Reviews** - View Google ratings and reviews
- 🗺️ **Directions** - Get directions via Google Maps

### For Facility Owners
- 🏥 **Facility Management** - Update facility details, services, and pricing
- 👨‍⚕️ **Doctor Management** - Add/remove doctors and their details
- 📊 **Dashboard** - View analytics and appointment statistics
- 💰 **Service Pricing** - Manage tests, treatments, and pricing
- 📷 **Image Gallery** - Upload facility images

### For Admins
- 🔐 **Complete Control** - Manage all hospitals, labs, and users
- ✅ **Approvals** - Review and approve facility submissions
- 👥 **User Management** - Manage owners, assign/remove facilities
- 📈 **Analytics** - View system-wide statistics
- 🔧 **Configuration** - Manage system settings

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Icons** - Icon library
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

---

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/mednexus-hospital-management.git
cd mednexus-hospital-management
```

### Backend Setup
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
EOF

# Seed database with sample data
node seedData.js

# Start backend server
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install

# Start frontend
npm run dev
```

Access the application at: `http://localhost:5173`

---

## 🔑 Default Login Credentials

### Admin
- **Email:** admin@hospital.com
- **Password:** admin123

### Owner (Hospital)
- **Email:** owner@hospital.com
- **Password:** owner123
- **Facility:** Sarvodaya Hospital Faridabad

### Owner (Laboratory)
- **Email:** labowner@hospital.com
- **Password:** owner123
- **Facility:** Pathkind Labs Faridabad

### User
- **Email:** aman@example.com
- **Password:** password123

---

## 📂 Project Structure
```
mednexus-hospital-management/
├── backend/
│   ├── middleware/       # Auth, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── seedData.js      # Database seeder
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # Reusable components
│       ├── pages/       # Page components
│       ├── contexts/    # React contexts
│       └── App.jsx      # Root component
└── README.md
```

---

## 🚀 Features Breakdown

### User Features
- Location-based hospital/lab search
- Advanced filtering (type, facilities, rating)
- Save favorites
- Book appointments
- View facility details
- Get directions
- Change password

### Owner Features
- Manage facility details
- Add/update services
- Manage doctors/technicians
- Enable/disable appointments
- Update operating hours
- Upload facility images

### Admin Features
- Approve/reject facility submissions
- Manage owners (assign/remove facilities)
- View all hospitals and labs
- System-wide analytics
- User management
- Owner approval workflow

---

## 🌐 API Endpoints

### Authentication
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/change-password` - Change password

### Hospitals
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/:id` - Get hospital by ID
- `POST /api/hospitals` - Create hospital (admin)
- `PUT /api/hospitals/:id` - Update hospital
- `DELETE /api/hospitals/:id` - Delete hospital (admin)

### Laboratories
- `GET /api/labs` - Get all labs
- `GET /api/labs/:id` - Get lab by ID
- `POST /api/labs` - Create lab (admin)
- `PUT /api/labs/:id` - Update lab
- `DELETE /api/labs/:id` - Delete lab (admin)

### Favorites
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites/add` - Add to favorites
- `POST /api/favorites/remove` - Remove from favorites

### Appointments
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Book appointment
- `PUT /api/appointments/:id` - Update appointment

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (User, Owner, Admin)
- Protected API routes
- Input validation
- XSS protection

---

## 📱 Responsive Design

- Mobile-first approach
- Tablet optimized
- Desktop enhanced
- Touch-friendly UI

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Built with ❤️ using MERN Stack
- Icons by React Icons
- Maps by Google Maps API
- UI inspiration from modern healthcare platforms

---

## 📧 Support

For support, email your.email@example.com or open an issue on GitHub.

---

## 🔮 Future Enhancements

- [ ] Payment gateway integration
- [ ] SMS/Email notifications
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Video consultations
- [ ] Prescription management
- [ ] Health records management
- [ ] Insurance verification
- [ ] Online pharmacy integration
- [ ] AI-powered health assistant

---

## 📊 Database Schema

### User
- name, email, password
- role (user/owner/admin)
- favorites (hospitals/labs)
- ownerProfile (for owners)

### Hospital
- name, type, category
- address, location (coordinates)
- facilities, services
- doctors, ratings
- owner, appointments

### Laboratory
- name, type
- tests, procedures
- report time, home collection
- technicians, accreditation

---

**Made with 💙 for better healthcare access**