# Fleet-Management-System

## Node.js + Express + Supabase
Objective
Design and build a Fleet Management Backend API using:
Node.js
Express.js
Supabase (PostgreSQL) - create Schema Table with Validations in the Supabase Table Editor
env for environment configuration
This system must support three user roles and basic fleet operations including vehicles and trips.
User Roles
The application must support the following roles:
· Customer 
· Owner 
· Driver
Each user can have only one rule.
Mandatory Folder Structure
root/
-models/
user.model.md
vehicle.model.md
trip.model.md
routes/
controllers/
middlewares/
config/
.env
index.js
package.json
 
1. User Module
Fields
· id
· name
· email (unique)
· password (store raw password no hashing required for evaluation)
· role (customer | owner | driver)
· created at
Functional Requirements
· All three roles must be able to sign up.
· Email must be unique.
· Role must be validated
2.  Vehicle Module (Owner Only)
Owners can create vehicles.
Vehicle Fields
· Id
· Name
· registration_number (unique)
· allowed passengers
· isAvailable (default true)
· driver id (nullable initially)
· rate_per_km
· owner id
· created at
Functional Requirements
Only owners can create vehicles.
Owner can assign a driver to an existing vehicle later.
Maintain proper relationships:
Owner Vehicles
Driver Vehicle
expected routes are
POST/vehicles/add/
PATCH/vehicles/assign-driver/: vehicleId
GET/vehicles/:vehicleId
 
3. Trip Module (Customer Only)
Customers can create trips.
Trip Fields
· id
· customer id
· vehicle id
· start date
· end date
· location
· distance km
· passengers
· tripCost
· isCompleted (default false)
· created at
 
CRUD Operations
Customer must be able to:
· Create Trip
· Read Trip
· Update Trip
· Delete Trip
 
Edge Cases (Mandatory)
While creating a trip:
1. Selected vehicle must be available.
2. Number of passengers must not exceed vehicle's allowed passengers.
3. Once a trip is created:
· vehicle isAvailable must become false.
expected routes are
POST/trips/create/
PATCH/trips/update/: tripId
GET /trips/:tripId
DELETE /trips/delete/: tripId
 
4. End Trip Feature
Create a special API:
PATCH/trips/end/:tripId
On ending a trip:
isCompleted→ true
tripCost must be calculated as:
distance_km * rate_per_km
vehicle isAvailable → true
 
5. System Analytics
Create one endpoint:
GET /analytics
It must return:
· Total customers
· Total owners
· Total drivers
· Total vehicles
· Total trips
All counts must be calculated using database queries (not JavaScript loops).
6. Middleware
Logger Middleware
 
Must append every incoming request in the logs.txt file, use is module for this
· HTTP Method
· URL
· Timestamp
Rate Limiter Middleware
Apply ONLY on create vehicle route.
Rule:
Maximum 3 requests per minute per IP.
Handling Undefined Route Middlware
Any request apart from these route should get response as This Request Is Not Found with status 404
 
7.  Schema Documentation
Inside the models folder, create:
user.model.md
vehicle.model.md
trip.model.md
Each file must clearly document:
· Table name
· Columns
· Data types
· Constraints
· Relationships
 
8. Supabase Integration
Create a NEW Supabase project.
Use ene to store, supabase url and key
9. Coding Standards
Mandatory:
· Proper folder separation
· Routes Controllers
· Async/await
· Proper error handling
· Input validation
· REST conventions - status codes and messages
· Clean variable naming

