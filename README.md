# 🍽️ CRAVEO

CRAVEO is a complete Restaurant Management and Food Delivery System built with **Next.js**, **MongoDB**, **Mongoose**, and **Cloudinary**.

The system is designed to manage restaurant operations through multiple secure portals including **Super Admin, Branch Admin, and Customer**.

---

## 🚀 Live Demo

**Live Website:**  
https://craveo-food.vercel.app

---

## 💻 GitHub Repository

https://github.com/muzamil0014/craveo-food

---

## 📌 Project Overview

CRAVEO provides a centralized digital platform for managing restaurant branches, food items, customers, orders, payments, reviews, complaints, and delivery operations.

The system includes complete management for:

- Restaurant Branches
- Branch Admins
- Food Categories
- Food Items
- Customers
- Orders
- Cart
- Wishlist
- Checkout
- Coupons
- Reviews
- Complaints
- Saved Addresses
- Customer Profiles
- Branch-Based Menus
- Branch-Based Pricing
- Food Availability
- Billing
- Payments
- Analytics
- Notifications
- Image Uploads
- Authentication
- Role-Based Authorization

The platform separates restaurant operations into secure portals so each user can only access the features and records related to their role.

---

## 🛠️ Tech Stack

CRAVEO is built using:

- **Next.js**
- **React**
- **JavaScript**
- **MongoDB**
- **Mongoose**
- **Cloudinary**
- **JWT Authentication**
- **bcryptjs**
- **Lucide React**
- **Recharts**
- **CSS**
- **Vercel**

---

## 👥 User Roles

CRAVEO contains three main portals:

1. Super Admin
2. Branch Admin
3. Customer

Each portal has its own dashboard, permissions, protected routes, and APIs.

---

# 👨‍💼 Super Admin Portal

The Super Admin has complete control over the entire restaurant system.

### Super Admin Features

- Super Admin Dashboard
- Restaurant Branch Management
- Branch Admin Management
- Category Management
- Food Management
- Customer Management
- Order Management
- Review Management
- Coupon Management
- Complaint Management
- Analytics
- Sales Reports
- Revenue Reports
- Settings Management
- Profile Management
- Image Upload Management
- Role-Based API Security

The Super Admin can manage all restaurant branches and monitor complete system activity.

---

# 🏪 Branch Admin Portal

Branch Admins manage only the restaurant branch assigned to their account.

### Branch Admin Features

- Branch Dashboard
- View Own Branch Orders
- Manage Own Branch Foods
- Manage Food Availability
- View Customers
- Manage Reviews
- Manage Complaints
- Branch Analytics
- Sales Information
- Profile Management
- Password Management

Branch Admins cannot access data from other restaurant branches.

---

# 🧑 Customer Portal

Customers have their own secure portal for browsing foods, placing orders, and managing their account.

### Customer Features

- Customer Registration
- Customer Login
- Customer Dashboard
- Select Restaurant Branch
- Browse Foods
- Browse Categories
- View Food Details
- Search Foods
- Add to Cart
- Update Cart
- Wishlist
- Checkout
- Apply Coupons
- Place Orders
- View Orders
- Track Orders
- Cancel Orders
- Edit Eligible Orders
- View Invoice
- Manage Saved Addresses
- Manage Profile
- Upload Profile Image
- View Reviews
- Add Reviews
- Submit Complaints
- View Complaint History
- Logout

Customers can only access their own account, orders, addresses, wishlist, reviews, and complaints.

---

# 🏪 Restaurant Branch Management

CRAVEO supports multiple restaurant branches.

### Branch Features

- Add Branch
- Edit Branch
- Delete Branch
- Activate / Deactivate Branch
- Branch Name
- Branch Image
- City
- Area
- Address
- Phone
- Email
- Opening Time
- Closing Time
- Delivery Time
- Delivery Fee
- Minimum Order
- Featured Branch

Each customer selects a branch before ordering.

Food availability and pricing can be controlled according to the selected branch.

---

# 👨‍💼 Branch Admin Management

The Super Admin can create and manage separate Branch Admin accounts.

### Branch Admin Features

- Add Branch Admin
- Edit Branch Admin
- Delete Branch Admin
- Assign Restaurant Branch
- Activate / Deactivate Account
- Name
- Email
- Phone
- Password
- Role Protection

Each Branch Admin is restricted to the assigned restaurant branch.

---

# 🍔 Food Management

CRAVEO provides complete food management.

### Food Features

- Add Food
- Edit Food
- Delete Food
- Food Name
- Slug
- Description
- Category
- Food Image
- Price
- Sale Price
- Preparation Time
- Calories
- Rating
- Featured Food
- Popular Food
- Availability
- Branch Assignment

Foods can be assigned to one or more restaurant branches.

---

# 💰 Branch-Based Pricing

Different restaurant branches can have different prices and availability for the same food item.

Example:

```text
Burger
├── Gulshan Branch
│   ├── Price: PKR 650
│   └── Available: Yes
│
└── Clifton Branch
    ├── Price: PKR 700
    └── Available: No