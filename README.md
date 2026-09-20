# 🏥 HospitalCare+

HospitalCare+ is a complete Hospital Management System built with **Next.js**, **MongoDB**, **Mongoose**, and **Cloudinary**.

The system is designed to manage hospital operations through multiple secure portals including **Admin, Doctor, Receptionist, and Patient**.

---

## 🚀 Live Demo

**Live Website:**  
https://hospitalcare-plus.vercel.app

---

## 💻 GitHub Repository

https://github.com/muzamil0014/hospitalcare-plus

---

## 📌 Project Overview

HospitalCare+ provides a centralized digital platform for managing hospital operations efficiently.

The system includes complete management for:

- Patients
- Doctors
- Receptionists
- Departments
- Appointments
- Admissions
- Rooms
- Beds
- Billing
- Payments
- Medical Records
- Prescriptions
- Notifications
- User Profiles
- Image Uploads
- Authentication
- Role-Based Authorization

The platform separates hospital operations into different secure portals so every user can only access the features and records related to their role.

---

## 🛠️ Tech Stack

HospitalCare+ is built using:

- **Next.js**
- **React**
- **JavaScript**
- **MongoDB**
- **Mongoose**
- **Cloudinary**
- **JWT Authentication**
- **bcryptjs**
- **Lucide React**
- **CSS**
- **Vercel**

---

## 👥 User Roles

HospitalCare+ contains four main user portals:

1. Admin
2. Doctor
3. Receptionist
4. Patient

Each portal contains its own dashboard, permissions, features, and protected APIs.

---

# 👨‍💼 Admin Portal

The Admin has full control over hospital management and system configuration.

### Admin Features

- Admin Dashboard
- Doctor Management
- Patient Management
- Receptionist Management
- Department Management
- Appointment Management
- Admission Management
- Room Management
- Bed Management
- Billing Management
- Payment Management
- Medical Records
- Prescriptions
- Hospital Settings
- Profile Management
- Image Upload Management
- Role-Based API Security

The Admin can create, update, view, and manage hospital records across the system.

---

# 👨‍⚕️ Doctor Portal

Doctors have their own secure portal and can only access hospital information associated with their authenticated account.

### Doctor Features

- Doctor Dashboard
- View Own Appointments
- View Assigned Patients
- View Patient Medical Records
- Add Medical Records
- Add Medical Notes
- Create Prescriptions
- View Prescriptions
- Update Appointment Status
- Profile Management

Doctors are restricted from accessing data belonging to other doctors unless allowed by system rules.

---

# 👩‍💼 Receptionist Portal

Receptionists manage daily hospital operations such as patient registration, appointments, admissions, and billing.

### Receptionist Features

- Receptionist Dashboard
- Patient Registration
- Patient Management
- Appointment Booking
- Appointment Management
- Admission Management
- Room Availability
- Bed Availability
- Billing Management
- Payment Management
- Profile Management

Receptionists help manage the daily flow of patients inside the hospital.

---

# 🧑‍🤝‍🧑 Patient Portal

Patients have their own secure portal where they can access their hospital information.

### Patient Features

- Patient Dashboard
- Book Appointments
- View Appointments
- Cancel Appointments
- View Bills
- View Payments
- View Prescriptions
- View Medical Records
- Notifications
- Profile Management

Patients can only access records associated with their own authenticated account.

---

# 📅 Appointment Management

The appointment system manages doctor-patient bookings with validation and scheduling.

### Appointment Features

- Appointment Booking
- Doctor Selection
- Department Selection
- Appointment Date
- Appointment Time
- Appointment Reason
- Daily Token Number
- Appointment Status
- Doctor Slot Validation
- Patient Slot Validation
- Appointment Cancellation
- Appointment Completion

### Supported Appointment Statuses

```text
Pending
Confirmed
Completed
Cancelled
No Show