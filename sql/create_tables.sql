CREATE DATABASE test_db;

CREATE TYPE status AS ENUM('Scheduled', 'Completed', 'Cancelled');

CREATE TYPE gender AS ENUM('Male', 'Female');

CREATE TABLE IF NOT EXISTS Doctors (
    doctorId SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(100),
    contactNumber VARCHAR(15),
    email VARCHAR(100)
    );

CREATE TABLE IF NOT EXISTS Patients (
    patientId SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    gender GENDER NOT NULL,
    dateOfBirth DATE,
    contactNumber VARCHAR(15),
    address VARCHAR(255),
    medicalHistory TEXT
    );

CREATE TABLE IF NOT EXISTS Appointments (
    appointmentId SERIAL PRIMARY KEY,
    patientId INT,
    doctorId INT,
    appointmentDate DATE,
    appointmentTime TIME,
    status STATUS NOT NULL,
    FOREIGN KEY (patientId) REFERENCES Patients (patientId),
    FOREIGN KEY (doctorId) REFERENCES Doctors (doctorId)
    );
